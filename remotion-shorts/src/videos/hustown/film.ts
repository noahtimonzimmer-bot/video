// "HUS town" ad (9:16): 3D block people in a block town who all have to play HUS HUS HUS. One shot per narration cue
// (1-based), some split with `at`. Fast, dynamic cameras (push-ins, orbits, whip glides).
import * as THREE from "three";
import { Pen, fxBurst } from "./toon";
import { CamInfo, Stage, q, hh, setLight, findSun, SUNV } from "./cast";
import { LightName } from "./lights";
import { Look, Pose, Face } from "./blocky";
import { screenTex, Scr } from "./screen";
import { V3, BAKERY, MAILBOX, SQUARE, BUSSTOP, CLASSROOM, MYHOUSE, FRIEND } from "./layout";
import { CUES } from "./cues";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ctx = { t: number; u: number; g: number; cam: CamInfo; out: Stage };
export type ShotSpec = { cue: number; at?: number; light: LightName; cam: (u: number, g: number) => Cam; act: (c: Ctx) => void; dof?: number; focus?: V3 };

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * x * (x * (6 * x - 15) + 10); };
const C = (pos: V3, look: V3, fov = 50, push = 0.004, roll = 0) => (_u: number, g: number): Cam => ({ pos: lerp3(look, pos, Math.exp(-push * g)), look, fov, roll });
const G = (a: V3, b: V3, la: V3, lb: V3, fov = 50, roll = 0) => (u: number): Cam => ({ pos: lerp3(a, b, ease(u)), look: lerp3(la, lb, ease(u)), fov, roll: roll * (1 - u) });
/** orbit around tg from deg0 to deg1 at distance d, height h */
const O = (tg: V3, d: number, h: number, deg0: number, deg1: number, fov = 50, lookUp = 1.4) => (u: number): Cam => {
  const a = ((deg0 + (deg1 - deg0) * ease(u)) * Math.PI) / 180;
  return { pos: [tg[0] + Math.sin(a) * d, tg[1] + h, tg[2] + Math.cos(a) * d], look: [tg[0], tg[1] + lookUp, tg[2]], fov, roll: 0 };
};
const shake = (cam: (u: number, g: number) => Cam, amp: number) => (u: number, g: number): Cam => {
  const c = cam(u, g); return { ...c, look: [c.look[0] + amp * Math.sin(g * 2.9), c.look[1] + amp * Math.sin(g * 3.7 + 1), c.look[2]], roll: c.roll + 0.012 * amp * Math.sin(g * 2.3) };
};

// ---------------- cast ----------------
const ME: Look = { shirt: "#ff8a2a", pants: "#2f4a8a", hat: "hair", hair: "#3a2418", shoes: "#ffffff" };
const FRIENDL: Look = { shirt: "#3fa34d", pants: "#2a2f45", hat: "cap", hatCol: "#e8443a", shoes: "#ffffff" };
const GRANDMA: Look = { shirt: "#9a6ad9", pants: "#6a4aa0", hat: "bun", hair: "#ececf0", glasses: true, slippers: true };
const TEACHER: Look = { shirt: "#f4f0e4", pants: "#3b3f52", hat: "hair", hair: "#6a4a2a", glasses: true, tie: "#c2413b" };
const MONSTER: Look = { shirt: "#1d1830", pants: "#1d1830", skin: "#14101e", hat: "none", slippers: true };
const TOWNS = (v: number): Look => ({ shirt: ["#e8443a", "#2f6fb5", "#ffd25a", "#7b5ac9", "#1f8f8f", "#e86ab0", "#3f9e43", "#ff8a2a"][v % 8], pants: ["#2a2f45", "#4a3f36", "#2f4a8a"][v % 3],
  hat: (["cap", "hair", "bun", "hair", "cap"] as const)[v % 5], hatCol: ["#ffffff", "#2f6fb5", "#e8443a"][v % 3], hair: ["#3a2418", "#c8a050", "#1b1a22", "#8a3a2a"][v % 4], glasses: v % 6 === 2 });

/** a block person at (x, z), yaw facing the camera unless given; walk/run to `to` between u = a..b */
type KO = { face?: Face; arms?: Pose["arms"]; yaw?: number; scr?: Scr | null; to?: [number, number]; a?: number; b?: number; run?: number; scale?: number; y?: number; head?: number; turn?: number; jump?: number; sit?: boolean };
const K = (c: Ctx, look: Look, i: number, x: number, z: number, o: KO = {}) => {
  let px = x, pz = z, phase = 0, moving = false, yaw = o.yaw;
  if (o.to) {
    const a = o.a ?? 0, b = o.b ?? 1, k = Math.max(0, Math.min(1, (c.u - a) / (b - a))), dx = o.to[0] - x, dz = o.to[1] - z;
    px = x + dx * k; pz = z + dz * k; moving = k > 0 && k < 1;
    phase = ((Math.hypot(dx, dz) * k) / ((o.run ?? 0) > 0 ? 2.4 : 1.5) + hh(i, 3)) % 1;
    if (yaw === undefined) yaw = Math.atan2(dx, dz);
  }
  if (yaw === undefined) yaw = Math.atan2(c.cam.pos.x - px, c.cam.pos.z - pz);
  const scr = o.scr === undefined ? null : o.scr;
  c.out.blocks!.push({ look, x: px, y: o.y ?? 0, z: pz, yaw, scale: o.scale ?? 1,
    pose: { phase: moving ? phase : 0, run: moving ? o.run ?? 0 : 0, arms: o.arms ?? (moving ? "side" : "side"), face: o.face ?? "smile", head: o.head, turn: o.turn, jump: o.jump, sit: o.sit, screen: scr ? screenTex(scr) : null } });
  return [px, pz] as [number, number];
};
const play = (score: number, t: number, speed = 1.4): Scr => { const k = Math.floor(t * speed) % 4; return { mode: "play", score: score + Math.floor(t * speed) * 330, fold: k, label: k ? "PERFEKT" : undefined }; };
const B = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, soft = false, rot = 0) =>
  c.out.fx.push({ key, cw, ch, draw, x, y, z, w, h, soft, rot });
const glow = (c: Ctx, x: number, y: number, z: number, w: number, k: number, col = "190,246,255") => {
  if (k <= 0.01) return; const kk = q(Math.min(1, k), 20);
  B(c, `glow${col}${kk}`, 256, 256, (p) => { const g = (p as unknown as { g: CanvasRenderingContext2D }).g, gr = g.createRadialGradient(128, 128, 4, 128, 128, 126);
    gr.addColorStop(0, `rgba(255,255,255,${0.95 * kk})`); gr.addColorStop(0.35, `rgba(${col},${0.7 * kk})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }, x, y, z, w, w, true);
};
const burst = (c: Ctx, t0: number, x: number, y: number, z: number, w = 1.6, col = "#b8ff3a", dur = 0.35) => {
  if (c.t < t0 || c.t >= t0 + dur) return; const u = q((c.t - t0) / dur, 30);
  B(c, `burst${col}${u}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
};
/** big phone held up to the lens (close-ups of the game) */
const phoneCU = (c: Ctx, s: Scr, x: number, y: number, z: number, h = 1.0) => B(c, "phone" + JSON.stringify(s), 400, 760, (p) => {
  const g = (p as unknown as { g: CanvasRenderingContext2D }).g;
  g.fillStyle = "#1b1a22"; g.beginPath(); g.roundRect(4, 4, 392, 752, 48); g.fill(); g.strokeStyle = "#000"; g.lineWidth = 8; g.stroke();
  g.save(); g.translate(20, 60); g.scale(360 / 360, 640 / 640); g.drawImage((screenTex(s).image as HTMLCanvasElement), 0, 0); g.restore();
  g.fillStyle = "#000"; g.beginPath(); g.roundRect(150, 24, 100, 18, 9); g.fill();
}, x, y, z, h * 0.526, h);
const capCard = (c: Ctx, x: number, z: number) => B(c, "capcard", 260, 160, (p) => { p.ell(130, 110, 100, 60, "#e8443a", 7, 180, 360); p.poly([[130, 104], [250, 104], [250, 126], [130, 126]], "#c2332b", 6); }, x, 0.18, z, 0.5, 0.31);
const hussAt = (cue: number) => { const [a, b] = CUES[cue - 1], s = a + (b - a) * 0.15; return [0, 1, 2].map((k) => s + k * ((b - s) / 3)); };
/** a crowd of block townspeople on the street, all staring at their phones, tapping */
const crowd = (c: Ctx, n: number, seed: number, z0: number, z1: number, face: Face = "focus", walk = false) => {
  for (let i = 0; i < n; i++) {
    const x = -4.6 + hh(i, seed) * 9.2, z = z0 + hh(i, seed + 1) * (z1 - z0);
    K(c, TOWNS(i + seed), 100 + seed * 20 + i, x, z, { face, arms: "tap", scr: play(1000 + i * 700, c.t + i * 0.3), yaw: (hh(i, seed + 2) - 0.5) * 2.4, ...(walk ? { to: [x, z - 6], run: 0 } : {}) });
  }
};

const BK = BAKERY, MB = MAILBOX, SQ = SQUARE, BS = BUSSTOP, CR = CLASSROOM, MH = MYHOUSE, FR = FRIEND;
export const SPECS: ShotSpec[] = [
  // ===== HOOK =====
  { cue: 1, light: "day", cam: G([0, 38, 70], [0, 3, 22], [0, 0, 0], [0, 1.6, 6], 56), act: (c) => crowd(c, 22, 1, -30, 30) },
  { cue: 2, light: "day", cam: (u) => ({ pos: [1.6 - 3.2 * u, 1.5, 3.6], look: [0, 1.75, 0], fov: 44, roll: 0 }),
    act: (c) => { const ts = hussAt(2), k = ts.filter((t) => c.t >= t).length; K(c, ME, 1, 0, 0, { face: "focus", arms: "tap", scr: { mode: "play", score: 690, fold: k, label: k ? "PERFEKT" : undefined } });
      ts.forEach((t) => burst(c, t, 0.5, 2.0, 0.6, 1.2)); crowd(c, 6, 3, -14, -4); } },
  // ===== RULES =====
  { cue: 3, light: "day", cam: C([0.8, 1.9, 2.2], [0, 1.55, 0.3], 40, 0.004), dof: 14, focus: [0, 1.5, 0.3], act: (c) => { K(c, ME, 1, 0, 0, { face: "focus", arms: "phone", scr: { mode: "play", score: 690, fold: 0 }, yaw: Math.PI * 0.05 }); } },
  { cue: 4, light: "day", cam: (u) => ({ pos: [0, 1.62, 0.95 - 0.15 * u], look: [0, 1.5, 0], fov: 40, roll: 0 }),
    act: (c) => { const ts = hussAt(4), k = ts.filter((t) => c.t >= t).length; phoneCU(c, { mode: "play", score: 690 + k * 330, fold: k, label: k ? "PERFEKT" : undefined }, 0, 1.52, 0.2, 0.9); ts.forEach((t) => burst(c, t, 0, 1.5, 0.25, 0.7)); } },
  { cue: 5, light: "day", cam: O([0, 0, 0], 4.2, 1.6, -40, 30, 50), act: (c) => { K(c, ME, 1, 0, 0, { face: "grin", arms: "up", jump: Math.max(0, Math.sin(c.t * 7)) * 0.25 }); crowd(c, 8, 5, -12, -4); burst(c, CUES[4][0] + 0.2, 0, 2.6, 0, 2.4, "#ffd23a", 0.5); } },
  { cue: 6, light: "night", cam: shake(C([2, 1.2, 18], [0, 8, -10], 58, 0.002), 0.08),
    act: (c) => { K(c, MONSTER, 9, 0, -18, { face: "monster", scale: 6, to: [0, -12], a: 0, b: 1 }); crowd(c, 6, 7, 6, 12, "shock"); } },
  { cue: 7, light: "night", cam: C([3, 1.6, 6], [0, 1.4, 1.5], 46, 0.003),
    act: (c) => { const k = Math.max(0, (c.u - 0.45) / 0.3); if (k < 0.5) K(c, TOWNS(11), 60, 0, 1.5, { face: "shock", arms: "up" }); glow(c, 0, 1.4, 1.6, 4.5, Math.sin(Math.min(1, k) * Math.PI) * 1.2);
      K(c, TOWNS(12), 61, -1.8, 0.4, { face: "shock" }); K(c, TOWNS(13), 62, 1.9, 0.2, { face: "nervous" }); } },
  // ===== EVERYBODY PLAYS =====
  { cue: 8, light: "day", cam: G([CR[0] + 3, 1.4, CR[2] - 0.2], [CR[0] + 2.2, 0.9, CR[2] - 0.6], [CR[0] + 2.6, 0.8, CR[2] - 2.0], [CR[0] + 2.6, 0.7, CR[2] - 2.0], 52),
    act: (c) => { K(c, TEACHER, 20, CR[0] + 2.6, CR[2] - 3.0, { face: "focus", arms: "tap", sit: true, scr: play(4105, c.t), yaw: 0 }); for (let k = 0; k < 3; k++) K(c, TOWNS(k + 2), 30 + k, CR[0] - 2.6 + k * 2.2, CR[2] + 1.0, { face: "focus", arms: "tap", sit: true, scr: play(900 * k, c.t + k), yaw: Math.PI, scale: 0.72 }); } },
  { cue: 9, light: "day", cam: C([BS[0] - 3.4, 1.4, BS[2] - 3], [BS[0] + 0.4, 1.2, BS[2] - 3.6], 50, 0.003),
    act: (c) => { K(c, GRANDMA, 21, BS[0] + 0.3, BS[2] - 3.6, { face: "focus", arms: "tap", scr: play(14200, c.t, 2.2) }); } },
  { cue: 9, at: 1.4, light: "day", cam: C([MH[0] - 3.2, 0.9, MH[2] + 2.2], [MH[0] - 1.4, 0.5, MH[2]], 46, 0.003),
    act: (c) => c.out.dogs!.push({ x: MH[0] - 1.4, z: MH[2] - 0.4, yaw: -Math.PI / 2, screen: screenTex(play(8125, c.t, 2)) }) },
  { cue: 10, light: "night", cam: G([-3, 10, 32], [3, 9, 6], [0, 4, 18], [0, 4, -4], 56), act: (c) => {
    for (let k = 0; k < 10; k++) { const s = k % 2 ? 1 : -1, z = -16 + k * 4.4; glow(c, s * 5.95, 4.3, z, 2.4, 0.55 + 0.25 * Math.sin(c.t * 6 + k), "120,255,170"); } crowd(c, 5, 9, 4, 16, "focus"); } },
  { cue: 11, light: "night", cam: shake(O([0, 0, 8], 7, 4, 0, 50, 56, 1.0), 0.05), act: (c) => { crowd(c, 14, 11, 2, 14, "focus"); hussAt(11).forEach((t) => burst(c, t, 0, 3.2, 8, 3.5, "#b8ff3a", 0.4)); } },
  // ===== THE FRIEND =====
  { cue: 12, light: "night", cam: C([0, 1.5, 4.2], [0, 1.6, 0], 44, 0.003),
    act: (c) => { K(c, ME, 1, -0.75, 0, { face: "focus", arms: "tap", scr: { mode: "play", score: 4105, fold: 2 }, yaw: 0.2 }); K(c, FRIENDL, 2, 0.75, 0, { face: "nervous", arms: "tap", scr: { mode: "play", score: 4102, fold: 1 }, yaw: -0.2 }); } },
  { cue: 13, light: "day", cam: C([FR[0] + 5, 1.3, FR[2] + 2.5], [FR[0] + 0.2, 0.6, FR[2]], 48, 0.004), dof: 12, focus: [FR[0] + 0.6, 0.3, FR[2]], act: (c) => capCard(c, FR[0] + 0.6, FR[2]) },
  { cue: 14, light: "day", cam: C([FR[0] + 3.6, 1.6, FR[2] + 1.4], [FR[0] + 1.2, 1.4, FR[2] + 0.4], 46, 0.004),
    act: (c) => K(c, ME, 1, FR[0] + 1.2, FR[2] + 0.4, { face: "sad", arms: "phone", scr: { mode: "play", score: 4105, fold: 0 } }) },
  { cue: 15, light: "day", cam: (u) => ({ pos: [FR[0] + 1.2 + 0.2, 1.75, FR[2] + 0.4 + 1.5 - 0.6 * ease(u * 3)], look: [FR[0] + 1.2, 1.75, FR[2] + 0.4], fov: 38, roll: 0 }), dof: 18, focus: [FR[0] + 1.2, 1.75, FR[2] + 0.4],
    act: (c) => K(c, ME, 1, FR[0] + 1.2, FR[2] + 0.4, { face: "shock", arms: "phone", head: 0.1, scr: { mode: "play", score: 4105, fold: 0, cap: "#e8443a" } }) },
  { cue: 16, light: "day", cam: (u) => ({ pos: [0, 1.52, 0.75 - 0.18 * u], look: [0, 1.52, 0], fov: 40, roll: 0.05 * Math.sin(u * 3) }), act: (c) => phoneCU(c, { mode: "play", score: 4105, fold: 0, cap: "#e8443a" }, 0, 1.52, 0.2, 0.9) },
  { cue: 17, light: "day", cam: (u) => ({ pos: [0, 1.52, 0.6 + 0.5 * ease(u)], look: [0, 1.52, 0], fov: 40, roll: 0 }), act: (c) => phoneCU(c, { mode: "many" }, 0, 1.52, 0.2, 0.9) },
  { cue: 18, light: "night", cam: C([0.9, 1.7, 2.0], [0, 1.6, 0.2], 40, 0.003), dof: 14, focus: [0, 1.6, 0.2],
    act: (c) => { const ts = hussAt(18), k = ts.filter((t) => c.t >= t).length; K(c, ME, 1, 0, 0, { face: "focus", arms: "tap", scr: { mode: "play", score: 4105 + k * 330, fold: k, cap: "#e8443a", label: k ? "PERFEKT" : undefined } }); ts.forEach((t) => burst(c, t, 0.4, 2.0, 0.5, 1.0)); } },
  { cue: 19, light: "night", cam: (u) => ({ pos: [0, 1.52, 0.8 - 0.25 * u], look: [0, 1.52, 0], fov: 40, roll: 0 }),
    act: (c) => { phoneCU(c, { mode: "play", score: 5095, fold: 3, cap: "#e8443a", label: "EINGEPACKT" }, 0, 1.52, 0.2, 0.9); burst(c, CUES[18][0], 0, 1.52, 0.25, 1.1, "#b8ff3a", 0.5); } },
  { cue: 20, light: "night", cam: shake(C([-2, 2.5, FR[2] + 14], [FR[0], 2, FR[2]], 50, 0.003), 0.03),
    act: (c) => glow(c, FR[0] + 0.1, 1.2, FR[2], 3.2, 0.3 + ease(c.u * 2) * 0.9, "255,230,160") },
  // ===== THE HIGH SCORE =====
  { cue: 21, light: "night", cam: C([MH[0] - 3.4, 1.6, MH[2] + 2.4], [MH[0] - 1.2, 1.5, MH[2]], 46, 0.003), act: (c) => K(c, ME, 1, MH[0] - 1.2, MH[2], { face: "focus", arms: "phone", scr: { mode: "logo" } }) },
  { cue: 22, light: "night", cam: (u) => ({ pos: [0, 1.52, 0.9 - 0.2 * u], look: [0, 1.52, 0], fov: 40, roll: 0 }), act: (c) => phoneCU(c, { mode: "scores" }, 0, 1.52, 0.2, 0.9) },
  { cue: 23, light: "night", cam: (u) => ({ pos: [0.05, 1.62, 0.62 - 0.18 * u], look: [0, 1.62, 0], fov: 34, roll: 0 }), act: (c) => phoneCU(c, { mode: "scores" }, 0, 1.52, 0.2, 0.9) },
  { cue: 24, light: "night", cam: (u) => ({ pos: [0, 1.75, 1.6 - 0.7 * ease(u * 2)], look: [0, 1.75, 0], fov: 36, roll: 0 }), dof: 18, focus: [0, 1.75, 0],
    act: (c) => K(c, ME, 1, 0, 0, { face: "shock", arms: "phone", head: 0.05, scr: { mode: "scores" } }) },
  // ===== MIDNIGHT =====
  { cue: 25, light: "night", cam: shake(C([3.5, 1.0, 22], [0, 9, -2], 60, 0.0015), 0.1), act: (c) => K(c, MONSTER, 9, 0, -14, { face: "monster", scale: 6, to: [0, 6], a: 0, b: 1 }) },
  { cue: 26, light: "night", cam: shake(G([2.4, 0.5, 9], [3.2, 0.4, 6.5], [0, 0.4, 2], [0, 0.4, 2], 50), 0.05), dof: 14, focus: [0, 0.4, 2],
    act: (c) => K(c, MONSTER, 9, 0, 2, { face: "monster", scale: 6, yaw: 0 }) },
  { cue: 27, light: "night", cam: C([MH[0] + 0.35, 1.7, MH[2]], [MH[0] - 2, 1.6, MH[2]], 50, 0.002),
    act: (c) => { K(c, GRANDMA, 21, MH[0] - 2.2, MH[2] + 0.1, { face: "sweet", arms: c.u > 0.6 ? "point" : "side", yaw: Math.PI / 2 }); K(c, MONSTER, 9, MH[0] - 9, MH[2] - 2, { face: "monster", scale: 6, yaw: Math.PI / 2 });
      for (const [y, h] of [[1.0, 0.1], [2.4, 0.1]]) B(c, `sill${y}`, 32, 32, (p) => p.poly([[0, 0], [32, 0], [32, 32], [0, 32]], "#f4f0e4", 0), MH[0] - 0.1, y, MH[2], 1.9, h); } },
  { cue: 28, light: "night", cam: C([MH[0] - 0.6, 1.75, MH[2] + 0.05], [MH[0] - 2.2, 1.85, MH[2] + 0.1], 40, 0.003), dof: 20, focus: [MH[0] - 2.2, 1.9, MH[2] + 0.1],
    act: (c) => K(c, GRANDMA, 21, MH[0] - 2.2, MH[2] + 0.1, { face: "sweet", arms: "point", yaw: Math.PI / 2 }) },
  { cue: 29, light: "night", cam: (u) => ({ pos: [0, 1.52, 0.8 - 0.25 * u], look: [0, 1.52, 0], fov: 40, roll: 0 }), act: (c) => phoneCU(c, { mode: "timer", sec: Math.max(0, 12 - Math.floor(c.u * 3)), score: 4105 }, 0, 1.52, 0.2, 0.9) },
  { cue: 30, light: "night", cam: shake(C([0.7, 1.75, 1.5], [0, 1.7, 0], 40, 0.004), 0.02), act: (c) => K(c, ME, 1, 0, 0, { face: "nervous", arms: "tap", scr: { mode: "timer", sec: 9, score: 4435 } }) },
  { cue: 31, light: "night", cam: (u) => ({ pos: [0, 1.7, 1.2 + 0.4 * u], look: [0, 1.75, 0], fov: 40, roll: 0 }), act: (c) => K(c, ME, 1, 0, 0, { face: "focus", arms: "point", head: -0.05 }) },
  { cue: 32, light: "night", cam: shake(O([0, 0, 0], 2.6, 1.5, -30, 40, 46, 1.6), 0.03),
    act: (c) => { const ts = hussAt(32), k = ts.filter((t) => c.t >= t).length; K(c, ME, 1, 0, 0, { face: "focus", arms: "tap", scr: { mode: "timer", sec: 6 - k, score: 4435 + k * 330 } }); ts.forEach((t) => burst(c, t, 0.4, 2.0, 0.4, 1.3)); } },
  { cue: 33, light: "night", cam: G([0, 2.4, SQ[2] + 3], [0, 4.3, SQ[2] + 8], [0, 2, SQ[2] - 9], [0, 4.2, SQ[2] - 9], 52),
    act: (c) => { K(c, ME, 1, 0.6, SQ[2] - 1.5, { face: "nervous", arms: "tap", scr: { mode: "timer", sec: 3, score: 5425 } }); K(c, MONSTER, 9, -2, SQ[2] - 18, { face: "monster", scale: 6, yaw: 0.3 }); } },
];
void THREE; void MB; void BK;

export const stageSpec = (s: ShotSpec, t: number, u: number, g: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [], blocks: [], dogs: [] };
  setLight(s.light);
  findSun(cam, SUNV);
  s.act({ t, u, g, cam, out });
  return out;
};
