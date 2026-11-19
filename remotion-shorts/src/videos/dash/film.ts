// "Dash" shot list (9:16): one entry per narration cue (1-based), some split with `at`. Everybody runs; the new kid
// walks; the street freezes; the ground rumbles; the camera rises and shows the town on the back of a sleeping giant.
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, SideOpts, fxPuff } from "./toon";
import { CamInfo, Stage, person, blob, lidAt, viewOf, Who, q, hh, setLight, findSun, SUNV } from "./cast";
import { LightName } from "./lights";
import { KETTLE, CITIZEN } from "./people";
import { V3, SCHOOL, BAKERY, MAILBOX, SQUARE, BUSSTOP, HEAD, EYE } from "./layout";
import { CUES } from "./cues";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ctx = { t: number; u: number; g: number; cam: CamInfo; out: Stage };
export type ShotSpec = { cue: number; at?: number; light: LightName; cam: (u: number, g: number) => Cam; act: (c: Ctx) => void; dof?: number; focus?: V3 };

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * x * (x * (6 * x - 15) + 10); };
const C = (pos: V3, look: V3, fov = 44, push = 0.002, roll = 0) => (_u: number, g: number): Cam => ({ pos: lerp3(look, pos, Math.exp(-push * g)), look, fov, roll });
const G = (a: V3, b: V3, la: V3, lb: V3, fov = 44) => (u: number): Cam => ({ pos: lerp3(a, b, ease(u)), look: lerp3(la, lb, ease(u)), fov, roll: 0 });
/** rumble: the camera shakes (deterministic) */
const shake = (cam: (u: number, g: number) => Cam, amp: number) => (u: number, g: number): Cam => {
  const c = cam(u, g), k = amp * (0.6 + 0.4 * Math.sin(g * 0.3));
  return { ...c, look: [c.look[0] + k * Math.sin(g * 2.7), c.look[1] + k * Math.sin(g * 3.9 + 1), c.look[2]], roll: c.roll + 0.01 * k * Math.sin(g * 2.1) };
};

// ---------------- cast ----------------
const ME: Outfit = KETTLE;
const NEWKID: Outfit = { jacket: "#3f9e43", buttons: "#ffffff", pants: "#2f3a4a", boots: "#f4f1ea", hat: "cap", cap: "#ffd25a", skin: "#c99067", build: "kid" };
const GRANDMA: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#4a3426", hat: "bonnet", dress: "#b0479a", skin: "#ffe2c2" };
const BRIDE: Outfit = { jacket: "#ffffff", pants: "#ffffff", boots: "#ffffff", hat: "hair", hair: "#c8a050", dress: "#ffffff", skin: "#f5c9a0" };
const GROOM: Outfit = { jacket: "#2a2f45", buttons: "#ffffff", pants: "#2a2f45", boots: "#1f1a18", hat: "tophat", skin: "#ecd0b6" };
const BAKER: Outfit = { jacket: "#f4f0e4", buttons: "#c9a070", pants: "#5a4a3a", boots: "#3a2a20", hat: "cap", cap: "#ffffff", skin: "#ecd0b6", moustache: "#6a4a2a", build: "stout" };
const KID = (v: number): Outfit => ({ ...CITIZEN(v + 3), build: "kid" });

type PO = { expr?: Expr; run?: { to: [number, number]; a?: number; b?: number; stride?: number }; scale?: number; look?: number; wave?: boolean; side?: boolean; mirror?: boolean; y?: number };
/** a person at (x, z); `run` moves them to `to` between u = a..b (running: long stride, side view across the lens) */
const P = (c: Ctx, o: Outfit, i: number, x: number, z: number, po: PO = {}) => {
  let px = x, pz = z, dx = 0, dz = 0, phase = 0, moving = false;
  if (po.run) {
    const a = po.run.a ?? 0, b = po.run.b ?? 1, k = Math.max(0, Math.min(1, (c.u - a) / (b - a)));
    dx = po.run.to[0] - x; dz = po.run.to[1] - z; px = x + dx * k; pz = z + dz * k;
    moving = k > 0 && k < 1;
    phase = q(((Math.hypot(dx, dz) * k) / (po.run.stride ?? 1.9) + hh(i, 5)) % 1, 120);
  }
  const sc = po.scale ?? (o.build === "kid" ? 0.72 : 1), y = po.y ?? 0;
  let view = { side: false, mirror: false };
  if (moving) { const v = viewOf(c.cam, px, pz, dx, dz); view = { side: v.side, mirror: v.mirror }; }
  if (po.side !== undefined) view = { side: po.side, mirror: !!po.mirror };
  const fo: FrontOpts = { mode: moving ? "march" : "stand", phase, expr: po.expr ?? "grin", look: po.look ?? 0, blink: lidAt(c.t, i), lift: 80, wave: po.wave ? q(Math.sin(c.t * 8 + i), 30) : undefined };
  const so: SideOpts = { mode: moving ? "march" : "stand", phase, expr: po.expr ?? "grin", blink: lidAt(c.t, i), stomp: 1.4, stride: 1.25 };
  c.out.places.push(person(c.cam, { i, o, okey: `d${i}_${o.jacket}${o.build ?? ""}` } as Who, px, y, pz, view, fo, so, sc));
  blob(c.out, px, y, pz, sc);
  return [px, pz] as [number, number];
};
const B = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, rot = 0, soft = false) =>
  c.out.fx.push({ key, cw, ch, draw, x, y, z, w, h, rot, soft });
/** breath puffs on every "huss" (times in seconds) next to a runner's head */
const huffs = (c: Ctx, x: number, y: number, z: number, times: number[]) => {
  for (const t0 of times) { const u = (c.t - t0) / 0.5; if (u < 0 || u >= 1) continue; const k = q(u, 20); B(c, `puff${k}`, 300, 300, (p) => fxPuff(p, k), x + 0.25, y, z, 0.7, 0.7, 0, true); }
};
const hussAt = (cue: number) => { const [a, b] = CUES[cue - 1], n = 3, s = a + (b - a) * 0.35; return [0, 1, 2].map((k) => s + k * ((b - s) / n)); };
/** a crowd running along the street toward / away from the lens */
const runners = (c: Ctx, n: number, seed: number, z0: number, z1: number, dir: 1 | -1, outfit = (i: number) => CITIZEN(i + seed)) => {
  for (let i = 0; i < n; i++) {
    const x = -4.4 + (hh(i, seed) * 8.0), k = hh(i, seed + 2) * 0.5, za = z0 + (z1 - z0) * k, zb = za + (z1 - z0) * 0.5;
    P(c, outfit(i), 200 + seed * 30 + i, x, za, { expr: (["grin", "laugh", "stern", "grin"] as Expr[])[i % 4], run: { to: [x + (hh(i, seed + 4) - 0.5), zb] } });
  }
};
const dog = (c: Ctx, key: string, x: number, z: number, col: string, flip: boolean, ph: number) => B(c, `dog${key}${q(ph, 8)}`, 400, 260, (p) => {
  const s = flip ? -1 : 1, X = (v: number) => 200 + s * (v - 200), leg = 18 * Math.sin(ph * Math.PI * 2);
  for (const [lx, d] of [[130, leg], [160, -leg], [250, -leg], [280, leg]] as const) p.stroke([[X(lx), 170], [X(lx + d), 240]], 14);
  p.ell(200, 150, 100, 46, col, 7); p.ell(X(320), 110, 46, 40, col, 7); p.ell(X(352), 98, 16, 22, "#2a1f2b", 0); p.dot(X(330), 100, 7);
  p.ell(X(300), 76, 14, 26, col, 6, 0, 360, s * 20); p.stroke([[X(100), 130], [X(56), 96 + leg]], 12, col);
  p.poly([[X(340), 128], [X(372), 132], [X(352), 160]], "#e8443a", 4);
}, x, 0.42, z, 0.85, 0.55);
const cake = (c: Ctx, x: number, y: number, z: number, rot: number) => B(c, "cake", 300, 300, (p) => {
  p.poly([[50, 160], [250, 160], [250, 250], [50, 250]], "#ffb6d5", 7); p.poly([[80, 90], [220, 90], [220, 160], [80, 160]], "#ffffff", 7);
  for (let k = 0; k < 3; k++) { p.stroke([[110 + k * 40, 90], [110 + k * 40, 50]], 8, "#7fd6d8"); p.ell(110 + k * 40, 40, 8, 14, "#ffd25a", 0); }
  for (let k = 0; k < 5; k++) p.dot(70 + k * 40, 205, 10, "#e8443a");
}, x, y, z, 0.6, 0.6, rot);
const bouquet = (c: Ctx, x: number, y: number, z: number) => B(c, "bouquet", 200, 260, (p) => {
  p.poly([[80, 140], [120, 140], [108, 250], [92, 250]], "#3f8f4c", 5);
  for (const [a, b2, col] of [[70, 100, "#ff7ab8"], [130, 100, "#ffffff"], [100, 70, "#ffd25a"], [60, 140, "#ffffff"], [140, 140, "#ff7ab8"]] as const) p.ell(a, b2, 30, 30, col, 6);
}, x, y, z, 0.35, 0.45);
const eye = (c: Ctx, open: number) => B(c, `eye${q(open, 20)}`, 800, 500, (p) => {
  p.ell(400, 250, 380, 230, "#2a958e", 10);
  const o = Math.max(0.04, open);
  p.clip([[30, 250], [400, 250 - 220 * o], [770, 250], [400, 250 + 160 * o]], () => {
    p.ell(400, 250, 360, 220, "#ffe08a", 0); p.ell(400, 250, 70, 200, "#1f1a18", 0); p.ell(370, 190, 26, 40, "rgba(255,255,255,0.85)", 0);
  });
  p.stroke([[30, 250], [400, 250 - 220 * o], [770, 250]], 14); p.stroke([[30, 250], [400, 250 + 160 * o], [770, 250]], 10);
}, EYE[0] + 9, EYE[1], EYE[2] + 3, 22, 14);

// ---------------- the shots ----------------
const S = SQUARE, BK = BAKERY, MB = MAILBOX, BS = BUSSTOP, SC = SCHOOL;
export const SPECS: ShotSpec[] = [
  // HOOK: the whole street runs at the lens
  { cue: 1, light: "day", cam: C([0, 1.4, 22], [0, 1.6, 6], 46, 0.0015), act: (c) => runners(c, 14, 1, -10, 26, 1) },
  { cue: 2, light: "day", cam: (u) => ({ pos: [3.4 - 0.0 * u, 1.45, 14 - 6 * u], look: [0.2, 1.4, 12 - 6 * u], fov: 34, roll: 0 }), dof: 18, focus: [0.2, 1.4, 10],
    act: (c) => { const [x, z] = P(c, ME, 1, 0.2, 18, { expr: "stern", scale: 0.85, side: true, mirror: false, run: { to: [0.2, 2] } }); huffs(c, x, 1.55, z, hussAt(2)); } },
  // WHO WE ARE
  { cue: 3, light: "day", cam: G([28, 60, 70], [18, 42, 46], [0, 0, 0], [0, 0, -4], 46), act: (c) => runners(c, 18, 3, -40, 40, 1) },
  { cue: 3, at: 2.4, light: "day", cam: C([3.5, 1.2, 10], [0, 1.4, 2], 44, 0.002), act: (c) => { runners(c, 8, 5, -16, 14, 1); P(c, ME, 1, 1.2, -4, { expr: "grin", scale: 0.85, run: { to: [1.2, 6] } }); } },
  { cue: 4, light: "day", cam: C([2.6, 1.3, SC[2] + 16], [0, 2.4, SC[2]], 46, 0.0015),
    act: (c) => { for (let i = 0; i < 7; i++) { const x = -3 + i; const [px, pz] = P(c, KID(i), 300 + i, x, SC[2] + 14 + hh(i, 2) * 3, { expr: "grin", run: { to: [x * 0.3, SC[2] + 1.2] } }); if (i === 3) huffs(c, px, 1.15, pz, hussAt(4)); } } },
  { cue: 5, light: "day", cam: C([3.8, 1.5, BK[2] + 8], [BK[0] + 1, 1.8, BK[2]], 46, 0.0015),
    act: (c) => { const [x, z] = P(c, BAKER, 3, BK[0] + 1.2, BK[2] + 0.4, { expr: "laugh", run: { to: [3.4, BK[2] + 9] } }); huffs(c, x, 1.7, z, hussAt(5)); runners(c, 4, 7, BK[2] - 10, BK[2] + 12, 1); } },
  { cue: 6, light: "day", cam: C([-2.4, 1.3, MB[2] + 7], [MB[0], 1.0, MB[2]], 44, 0.0015), act: (c) => P(c, GRANDMA, 4, -3, MB[2] + 9, { expr: "grin", run: { to: [MB[0] - 0.8, MB[2] + 0.6], a: 0, b: 0.9 } }) },
  { cue: 6, at: 1.5, light: "day", cam: C([0, 0.7, 6], [0, 0.5, -2], 44, 0.001), act: (c) => {
    const ph = (c.t * 3) % 1; dog(c, "a", -2.5 + c.u * 5, -1.5, "#c98a52", false, ph); dog(c, "b", -0.9 + c.u * 5, -1.7, "#f4f0e4", false, (ph + 0.5) % 1); } },
  { cue: 7, light: "day", cam: C([0, 1.5, S[2] + 9], [0, 1.6, S[2] - 2], 44, 0.0015),
    act: (c) => { const k = Math.min(1, c.u * 1.8); const [bx, bz] = P(c, BRIDE, 5, -3.6, S[2] + 2, { expr: "laugh", run: { to: [-0.8, S[2] - 1], a: 0, b: 0.5 } });
      P(c, GROOM, 6, 0.4, S[2] - 1.5, { expr: "grin", run: { to: [4.2, S[2] - 5], a: 0.5, b: 1 } });
      if (k < 1) bouquet(c, bx + 0.35, 1.1, bz); else bouquet(c, 0.4 + 3.8 * Math.max(0, (c.u - 0.5) * 2) + 0.35, 1.2, S[2] - 1.5 - 3.5 * Math.max(0, (c.u - 0.5) * 2));
      for (let i = 0; i < 6; i++) P(c, CITIZEN(i + 20), 320 + i, -5 + (i % 2) * 10, S[2] - 6 + i * 1.2, { expr: "laugh", wave: true }); } },
  { cue: 7, at: 1.4, light: "day", cam: C([0.6, 1.0, 6], [0, 1.6, 0], 46, 0.0015),
    act: (c) => { const u = c.u, x = -2 + 3 * u, y = 1.0 + 2.4 * Math.sin(Math.min(1, u * 1.2) * Math.PI) * (u < 0.83 ? 1 : 0.4); cake(c, x, Math.max(1.05, y), 0, u * 6);
      P(c, KID(5), 330, 2.4, 0.4, { expr: u > 0.8 ? "laugh" : "shock", run: { to: [1.0, 0.2], a: 0.4, b: 0.85 } }); } },
  { cue: 8, light: "day", cam: (u, g) => ({ pos: [2.2, 1.3, 10 - g * 0.12], look: [0, 1.3, 7.5 - g * 0.12], fov: 36, roll: 0 }), dof: 16,
    act: (c) => { const z = 8 - c.g * 0.12; P(c, ME, 1, 0.3, z + 1.5, { expr: "neutral", scale: 0.85, side: true, mirror: false, run: { to: [0.3, z - 0.5] } }); } },
  // THE NEW KID
  { cue: 9, light: "day", cam: C([-3, 1.6, BS[2] - 12], [BS[0], 1.8, BS[2] + 1], 46, 0.0012), act: (c) => runners(c, 6, 9, BS[2] - 20, BS[2] + 4, -1) },
  { cue: 10, light: "day", cam: C([-2.4, 1.3, BS[2] - 7], [BS[0] - 1.6, 1.2, BS[2] - 2.5], 42, 0.0015),
    act: (c) => { P(c, NEWKID, 50, BS[0] - 1.6, BS[2] - 2.6, { expr: "neutral", look: -1 }); for (let i = 0; i < 6; i++) P(c, CITIZEN(i + 30), 340 + i, -4 + i * 0.5, BS[2] - 14 - i * 3, { expr: "grin", run: { to: [-4 + i * 0.5, BS[2] + 12 - i * 3] } }); } },
  { cue: 11, light: "day", cam: C([0, 0.9, BS[2] - 14], [BS[0] - 1.8, 1.0, BS[2] - 5], 40, 0.0018),
    act: (c) => { const k = c.u; P(c, NEWKID, 50, BS[0] - 1.8, BS[2] - 3 - k * 2.5, { expr: "smile_closed", side: false }); } },
  { cue: 12, light: "day", cam: C([0, 2.4, 28], [0, 1.4, 14], 46, 0.001),
    act: (c) => { P(c, NEWKID, 50, 1.4, 31 - 0.3, { expr: "neutral" }); for (let i = 0; i < 14; i++) P(c, CITIZEN(i + 40), 360 + i, -4.4 + hh(i, 12) * 8.8, 4 + hh(i, 13) * 20, { expr: (["shock", "nervous", "shock"] as Expr[])[i % 3], look: 0 }); } },
  { cue: 13, light: "day", cam: shake(C([1.2, 0.35, 14], [0, 0.8, 9], 48, 0.0015), 0.06),
    act: (c) => { for (let i = 0; i < 4; i++) P(c, CITIZEN(i + 40), 360 + i, -2 + i * 1.3, 6 + (i % 2) * 1.5, { expr: c.u > 0.3 ? "shock" : "nervous" }); P(c, ME, 1, 2.6, 9.4, { expr: "shock", scale: 0.85 }); } },
  { cue: 14, light: "day", cam: shake(G([0, 2, 22], [0, 30, 60], [0, 1.4, 6], [0, 0, -10], 46), 0.12), act: (c) => { for (let i = 0; i < 14; i++) P(c, CITIZEN(i + 40), 360 + i, -4.4 + hh(i, 12) * 8.8, 4 + hh(i, 13) * 20, { expr: "shock" }); } },
  // REVEAL
  { cue: 15, light: "day", cam: shake(G([60, 90, 180], [180, 70, 260], [0, 0, 0], [0, -30, -120], 50), 0.4), act: () => {} },
  { cue: 16, light: "day", cam: C([HEAD[0] + 120, HEAD[1] + 20, HEAD[2] + 40], [EYE[0], EYE[1], EYE[2]], 34, 0.0025), act: (c) => eye(c, 0.05 + 0.25 * Math.max(0, Math.sin(c.u * Math.PI * 1.5))) },
  { cue: 17, light: "day", cam: C([2.6, 1.4, 38], [0, 1.4, 26], 44, 0.0015),
    act: (c) => { const [x, z] = P(c, NEWKID, 50, 1.4, 30.7, { expr: "stern", run: { to: [1.0, 18], a: 0.45 } }); huffs(c, x, 1.15, z, hussAt(17)); runners(c, 10, 17, 30, 8, -1); } },
];
void SUNV;

export const stageSpec = (s: ShotSpec, t: number, u: number, g: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  setLight(s.light);
  findSun(cam, SUNV);
  s.act({ t, u, g, cam, out });
  return out;
};
export { THREE };
