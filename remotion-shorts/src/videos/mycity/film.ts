// "My City" shot list: one entry per narration cue (cue = line of narration.txt, 1-based), sometimes split. Each shot
// has a light, a camera (a function of u = 0..1 through the shot and g = frames since the shot started) and the
// staging (characters, the Hollow, props, chalk on the walls). Story positions come from layout.ts.
import * as THREE from "three";
import { Pen, Outfit, Expr, FrontOpts, SideOpts, fxBurst } from "./toon";
import { CamInfo, Stage, person, blob, lidAt, viewOf, light2D, tier, Who, q, hh, setLight, findSun, SUNV } from "./cast";
import { LightName } from "./lights";
import { KETTLE, PEBBLE, LADDER, BRASS, BUTTON, LANTERN, UMBRELLA, CITIZEN, hollow, HollowOpts, kettleProp, chalkArrow, chalkText, tallyMarks } from "./people";
import { houseSpots } from "./city";
import { V3, FOUNTAIN, BELLTOWER, GATES, KIT, KIT_W, ROOM, COURT, WALL_R, doorOf, nearDoor, STEPS_R } from "./layout";

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Ctx = { t: number; u: number; g: number; cam: CamInfo; out: Stage };
export type ShotSpec = { cue: number; at?: number; light: LightName; cam: (u: number, g: number) => Cam; act: (c: Ctx) => void; dof?: number; focus?: V3 };

// ---------------- camera helpers ----------------
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const ease = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * x * (x * (6 * x - 15) + 10); };
/** camera at `pos` looking at `look`, dolly push-in at `push` per frame (0.002 = slow) */
const C = (pos: V3, look: V3, fov = 34, push = 0.0018, roll = 0) => (_u: number, g: number): Cam => {
  const k = Math.exp(-push * g);
  return { pos: lerp3(look, pos, k), look, fov, roll };
};
/** camera glides from a to b over the whole shot (smooth), with look points la -> lb */
const G = (a: V3, b: V3, la: V3, lb: V3, fov = 34, roll = 0) => (u: number): Cam => ({ pos: lerp3(a, b, ease(u)), look: lerp3(la, lb, ease(u)), fov, roll });
/** orbit: camera at distance d, height h, angle deg (0 = camera south of the target, looking north), slow push */
const O = (tg: V3, d: number, h: number, deg: number, fov = 34, push = 0.0018, lookUp = 1.3, roll = 0) => {
  const a = (deg * Math.PI) / 180;
  return C([tg[0] + Math.sin(a) * d, tg[1] + h, tg[2] + Math.cos(a) * d], [tg[0], tg[1] + lookUp, tg[2]], fov, push, roll);
};
/** orbiting move: angle from deg0 to deg1 over the shot */
const OM = (tg: V3, d: number, h: number, deg0: number, deg1: number, fov = 34, lookUp = 1.3) => (u: number): Cam => {
  const a = ((deg0 + (deg1 - deg0) * ease(u)) * Math.PI) / 180;
  return { pos: [tg[0] + Math.sin(a) * d, tg[1] + h, tg[2] + Math.cos(a) * d], look: [tg[0], tg[1] + lookUp, tg[2]], fov, roll: 0 };
};

// ---------------- staging helpers ----------------
type PO = { expr?: Expr; mode?: "stand" | "stroll" | "sit"; wave?: boolean; look?: number; y?: number; scale?: number; facing?: -1 | 0 | 1;
  walk?: { to: [number, number]; a?: number; b?: number }; side?: boolean; mirror?: boolean };
let seq = 0;
/** a person at (x, z): stands, or walks to `walk.to` between u = a..b (side view when walking across the lens) */
const P = (c: Ctx, o: Outfit, i: number, x: number, z: number, po: PO = {}) => {
  let px = x, pz = z, mode = po.mode ?? "stand", dx = 0, dz = 0, phase = 0;
  if (po.walk) {
    const a = po.walk.a ?? 0, b = po.walk.b ?? 1, k = Math.max(0, Math.min(1, (c.u - a) / (b - a)));
    px = x + (po.walk.to[0] - x) * k; pz = z + (po.walk.to[1] - z) * k;
    dx = po.walk.to[0] - x; dz = po.walk.to[1] - z;
    const dist = Math.hypot(dx, dz) * k;
    if (k > 0 && k < 1) { mode = "stroll"; phase = q((dist / 1.4) % 1, 120); }
  }
  const y = po.y ?? 0, sc = po.scale ?? (o.build === "kid" ? 0.72 : 1);
  let view = { side: false, mirror: false };
  if (mode === "stroll" && (dx || dz)) { const v = viewOf(c.cam, px, pz, dx, dz); view = { side: v.side, mirror: v.mirror }; }
  if (po.side !== undefined) view = { side: po.side, mirror: !!po.mirror };
  const fo: FrontOpts = { mode: mode === "sit" ? "sit" : mode, phase, expr: po.expr ?? "neutral", look: po.look ?? 0, blink: lidAt(c.t, i),
    wave: po.wave ? q(Math.sin(c.t * 8 + i), 30) : undefined, facing: po.facing };
  const so: SideOpts = { mode: mode === "stroll" ? "march" : "stand", phase, expr: po.expr ?? "neutral", blink: lidAt(c.t, i), stomp: 0.5, stride: 0.85 };
  const who: Who = { i, o, okey: `o${JSON.stringify(o).length}_${o.jacket}` };
  c.out.places.push(person(c.cam, who, px, y, pz, view, fo, so, sc));
  if (mode !== "sit") blob(c.out, px, y, pz, sc);
  seq++;
};
/** the Hollow (2.9 m) */
const H = (c: Ctx, x: number, z: number, ho: HollowOpts & { walk?: { to: [number, number]; a?: number; b?: number }; scale?: number; y?: number } = {}) => {
  let px = x, pz = z, phase = 0;
  if (ho.walk) {
    const a = ho.walk.a ?? 0, b = ho.walk.b ?? 1, k = Math.max(0, Math.min(1, (c.u - a) / (b - a)));
    px = x + (ho.walk.to[0] - x) * k; pz = z + (ho.walk.to[1] - z) * k;
    if (k > 0 && k < 1) phase = q(((Math.hypot(ho.walk.to[0] - x, ho.walk.to[1] - z) * k) / 1.6) % 1, 60);
  }
  const sc = ho.scale ?? 1.36, y = ho.y ?? 0;
  const d = c.cam.pos.distanceTo(new THREE.Vector3(px, y + 1.5, pz)) / sc;
  const [w, h, k] = tier(d);
  const opts: HollowOpts = { phase, reach: ho.reach, sit: ho.sit, tilt: ho.tilt, look: ho.look, chalk: ho.chalk, light: light2D(c.cam, false) };
  c.out.places.push({ key: `hollow|${JSON.stringify(opts)}`, x: px, y, z: pz, scale: sc, draw: (p) => hollow(p, opts), size: [w, h, k] });
  if (!ho.sit) blob(c.out, px, y, pz, sc * 0.9);
};
/** billboard prop card centred at (x, y, z) */
const B = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, rot = 0) =>
  c.out.fx.push({ key, cw, ch, draw, x, y, z, w, h, rot });
/** a drawing flat on a wall (yaw = the wall's facing: 0 faces +z) */
const W = (c: Ctx, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, yaw: number) =>
  c.out.fx.push({ key, cw, ch, draw, x, y, z, w, h, wall: yaw });
const glow = (c: Ctx, x: number, y: number, z: number, w: number, k: number) => {
  if (k <= 0.01) return; const kk = q(Math.min(1, k), 20);
  c.out.fx.push({ key: `glow${kk}`, cw: 256, ch: 256, soft: true, x, y, z, w: w * (0.6 + 0.4 * kk), h: w * (0.6 + 0.4 * kk), draw: (p) => {
    const g = (p as unknown as { g: CanvasRenderingContext2D }).g, gr = g.createRadialGradient(128, 128, 4, 128, 128, 126);
    gr.addColorStop(0, `rgba(255,255,255,${0.95 * kk})`); gr.addColorStop(0.35, `rgba(190,246,255,${0.7 * kk})`); gr.addColorStop(1, "rgba(120,220,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); } });
};
const burst = (c: Ctx, t0: number, x: number, y: number, z: number, w = 1.2, col = "#fff3b0", dur = 0.35) => {
  if (c.t < t0 || c.t >= t0 + dur) return; const u = q((c.t - t0) / dur, 30);
  B(c, `burst${col}${u}`, 500, 500, (p) => fxBurst(p, u, col), x, y, z, w, w);
};
/** bell rings: three bursts of sound rings above the bell */
const rings = (c: Ctx, x: number, y: number, z: number, t0: number, n = 3) => { for (let k = 0; k < n; k++) burst(c, t0 + k * 0.8, x, y, z, 4.5, "#ffe08a", 0.6); };
const kettle = (c: Ctx, x: number, z: number, cold = false, s = 0.42, y = 0) => B(c, `kettle${cold}`, 320, 260, (p) => kettleProp(p, cold), x, y + s * 0.42, z, s, s * 0.81);
/** keep a city spot on free ground: the plaza ring (r 3.4..9.6) or one of the four streets (|x| or |z| < 4.5) */
export const free = (x: number, z: number): [number, number] => {
  if (Math.abs(x) > 60 || Math.abs(z) > 60) return [x, z];
  const r = Math.hypot(x, z) || 1;
  if (r < 3.4) return [(x / r) * 3.4, (z / r) * 3.4];
  if (r <= 9.6) return [x, z];
  if (Math.abs(x) < 4.5 && r < 38) return [x, z];
  if (Math.abs(z) < 4.5 && r < 38) return [x, z];
  return [(x / r) * 9.6, (z / r) * 9.6];
};
const crowd = (c: Ctx, n: number, cx: number, cz: number, rx: number, rz: number, seed: number, po: (i: number) => PO = () => ({})) => {
  for (let i = 0; i < n; i++) { const [x, z] = free(cx + (hh(i, seed) - 0.5) * 2 * rx, cz + (hh(i, seed + 3) - 0.5) * 2 * rz); P(c, CITIZEN(i + seed), 100 + seed * 20 + i, x, z, po(i)); }
};
/** people running home: from their plaza spot to the front door of the nearest inner-ring house */
let DOORS: [number, number][] | null = null;
const flee = (i: number, x: number, z: number): { to: [number, number]; a: number; b: number } => {
  if (!DOORS) DOORS = houseSpots().filter((h) => Math.hypot(h.x, h.z) < 16).map((h) => { const r = Math.hypot(h.x, h.z); return [h.x - (h.x / r) * 4.4, h.z - (h.z / r) * 4.4]; });
  let best = DOORS[0], bd = 1e9;
  for (const d of DOORS) { const e = Math.hypot(d[0] - x, d[1] - z); if (e < bd) { bd = e; best = d; } }
  return { to: best, a: 0.05 + hh(i, 2) * 0.2, b: 0.95 };
};

// ---------------- places ----------------
const F = FOUNTAIN, STEP: V3 = [0, 0.36, STEPS_R - 0.3];
const KD = doorOf("kettle"), PD = doorOf("pebble"), BD = doorOf("brass"), BAK = doorOf("bakery");
const GN = GATES.n.pos, GE = GATES.e.pos;
const ck = KIT.chalk, cr = KIT.cross, gd = KIT.garden, st = KIT.stairs, ty = KIT.tally, kt = KIT.kettle, wr = KIT.write;
const bed = ROOM.bedroom, peb = ROOM.pebble, tow = ROOM.tower, bak = ROOM.bakery;
const Cc = COURT;
const AIR: V3 = [0, 0, 0];
const aerial = (h0: number, h1: number, d0: number, d1: number, deg = 20) => (u: number): Cam => {
  const k = ease(u), a = (deg * Math.PI) / 180, h = h0 + (h1 - h0) * k, d = d0 + (d1 - d0) * k;
  return { pos: [Math.sin(a) * d, h, Math.cos(a) * d], look: [0, 4, 0], fov: 38, roll: 0 };
};
/** a newcomer sitting up on the fountain steps with their object */
const newcomer = (c: Ctx, o: Outfit, i: number, obj: (cc: Ctx) => void, expr: Expr = "dazed") => {
  P(c, o, i, STEP[0] + 0.3, STEP[2], { mode: "sit", y: 0.36, expr });
  obj(c);
};
const lanternProp = (c: Ctx, x: number, z: number) => B(c, "lanternprop", 200, 300, (p) => {
  p.poly([[60, 60], [140, 60], [150, 250], [50, 250]], "#ffd25a", 7); p.poly([[50, 40], [150, 40], [140, 64], [60, 64]], "#2f3a4a", 6);
  p.arc(100, 40, 30, 30, 180, 360, 8, "#2f3a4a"); p.ell(100, 160, 26, 40, "#fff6c8", 0);
}, x, 0.36 + 0.25, z, 0.32, 0.48);
const umbrellaProp = (c: Ctx, x: number, z: number) => B(c, "umbrellaprop", 300, 300, (p) => {
  p.poly([[20, 120], [150, 30], [280, 120]], "#3f6fb5", 7); p.stroke([[150, 40], [150, 270], [130, 285]], 10);
}, x, 0.36 + 0.35, z, 0.6, 0.6);
const buttonProp = (c: Ctx, x: number, z: number) => B(c, "buttonprop", 200, 200, (p) => {
  p.ell(100, 100, 80, 80, "#e2453c", 8); for (const [a, b] of [[80, 80], [120, 80], [80, 120], [120, 120]]) p.dot(a, b, 10, "#2a1f2b");
}, x, 0.36 + 0.12, z, 0.24, 0.24);
const chalkStick = (c: Ctx, x: number, y: number, z: number) => B(c, "chalk", 200, 80, (p) => p.poly([[10, 20], [180, 10], [190, 60], [14, 70]], "#ffffff", 6), x, y, z, 0.16, 0.06);
const wetTrail = (c: Ctx) => { for (let k = 0; k < 14; k++) c.out.fx.push({ key: "puddle", cw: 300, ch: 150, draw: (p) => { p.ell(150, 75, 140, 58, "#5f86c0", 0); p.ell(120, 62, 60, 16, "#a9c9ea", 0); },
  x: (hh(k, 4) - 0.5) * 0.8, y: 0.03, z: -6 - k * 2.4, w: 1.3, h: 0.6, flat: true }); };

// arrow decals in the chalk corridor (left wall faces +x: yaw PI/2)
const LW = ck[0] - KIT_W / 2 + 0.02, RW = ck[0] + KIT_W / 2 - 0.02;
const arrow = (c: Ctx, x: number, z: number, yaw: number, flip: boolean, k: string) => W(c, `arrow${flip}${k}`, 400, 220, (p) => chalkArrow(p, flip), x, 1.6, z, 0.9, 0.5, yaw);
const writing = (c: Ctx, lines: string[], mess: number, z: number, side: 1 | -1 = -1) =>
  W(c, `write${lines.join("|")}${mess}`, 1200, 260, (p) => chalkText(p, lines, mess), wr[0] + side * (KIT_W / 2 - 0.02), 1.8, z, 4.4, 0.95, side < 0 ? Math.PI / 2 : -Math.PI / 2);

// ---------------- the shots ----------------
export const SPECS: ShotSpec[] = [
  // ===== HOOK =====
  { cue: 1, light: "day", cam: aerial(190, 120, 210, 150, 25), act: () => {} },
  { cue: 2, light: "day", cam: C([3.2, 1.1, 8.4], [0.3, 0.9, STEP[2]], 30, 0.0016), dof: 16, focus: [0.3, 0.8, STEP[2]],
    act: (c) => { newcomer(c, BUTTON, 31, (cc) => buttonProp(cc, STEP[0] - 0.55, STEP[2] + 0.1), c.u < 0.35 ? "dazed" : "nervous"); crowd(c, 4, 0, 13, 5, 2, 3, (i) => ({ expr: i % 2 ? "neutral" : "nervous" })); } },
  { cue: 3, light: "day", cam: OM(F, 8.8, 3.2, 160, 200, 40, 1.2), act: (c) => { crowd(c, 12, 0, 0, 9, 9, 7, (i) => ({ expr: (["nervous", "neutral", "shock", "nervous"] as Expr[])[i % 4], look: i % 3 - 1 })); P(c, KETTLE, 1, 4.8, 1.6, { expr: "nervous" }); } },
  // ===== WHO WE ARE =====
  { cue: 4, light: "day", cam: C([0, 2.2, 15], [0, 1.6, 4], 36, 0.0015), dof: 8, focus: [0, 1.4, 6], act: (c) => { P(c, KETTLE, 1, 0, 6, { expr: "grin", wave: c.u > 0.3 }); crowd(c, 5, 0, -6, 8, 3, 11, () => ({ expr: "smile" })); } },
  { cue: 5, light: "day", cam: G([-30, 20, 22], [-12, 20, 32], [-10, 4, 0], [8, 4, 6], 38), act: (c) => crowd(c, 8, 0, 6, 10, 6, 13, (i) => ({ expr: "smile", walk: i % 2 ? { to: [hh(i, 2) * 8 - 4, 14] } : undefined })) },
  { cue: 5, at: 3.4, light: "day", cam: C([-2.6, 1.4, -3.4], [BELLTOWER[0], 10, BELLTOWER[2]], 44, 0.0012), act: () => {} },
  { cue: 6, light: "day", cam: G([0, 1.8, 10], [0, 1.8, 4], [0, 6, -30], [0, 18, -40], 40), act: (c) => P(c, PEBBLE, 2, 1.6, -12, { expr: "neutral" }) },
  { cue: 7, light: "day", cam: C([10, 1.0, -16], [0, 13, -40], 44, 0.0010), act: () => {} },
  { cue: 8, light: "day", cam: aerial(70, 62, 70, 60, 200), act: () => {} },
  { cue: 9, light: "day", cam: G([0, 1.7, -30], [0, 1.7, -46], [0, 3, -60], [0, 3, -80], 38), act: () => {} },
  { cue: 10, light: "day", cam: C([bed[0] - 1.2, 1.6, bed[2] + 2.6], [bed[0] + 3.4, 1.6, bed[2] + 0.2], 40, 0.0014),
    act: (c) => P(c, KETTLE, 1, bed[0] + 1.9, bed[2] + 0.9, { expr: "smile_closed" }) },
  { cue: 11, light: "day", cam: C([bed[0] + 1.6, 1.7, bed[2] + 1.6], [bed[0] + 3.5, 1.8, bed[2] + 0.4], 34, 0.002),
    act: (c) => { P(c, KETTLE, 1, bed[0] + 2.6, bed[2] + 1.5, { expr: "smile", side: true, mirror: false }); chalkStick(c, bed[0] + 3.2, 1.55, bed[2] + 1.1); } },
  { cue: 12, light: "day", cam: C([0.4, 1.55, 9.2], [0, 1.55, 6], 28, 0.002), dof: 18, focus: [0, 1.5, 6], act: (c) => P(c, KETTLE, 1, 0, 6, { expr: "grin" }) },
  { cue: 13, light: "day", cam: C([-0.6, 1.5, 9.4], [0, 1.5, 6], 30, 0.0015), dof: 16, focus: [0, 1.5, 6], act: (c) => P(c, KETTLE, 1, 0, 6, { expr: "smile_closed", look: -1 }) },
  { cue: 14, light: "day", cam: C([1.8, 0.9, 6.6], [0.2, 0.7, STEP[2]], 30, 0.002), dof: 18, focus: [0.2, 0.7, STEP[2]],
    act: (c) => { P(c, KETTLE, 1, 0.5, STEP[2], { mode: "sit", y: 0.36, expr: c.u < 0.5 ? "dazed" : "shock", scale: 0.85 }); kettle(c, -0.35, STEP[2] + 0.15, false, 0.42, 0.36); } },
  { cue: 15, light: "day", cam: O(F, 7.5, 1.6, 15, 34), act: (c) => { newcomer(c, LANTERN, 32, (cc) => lanternProp(cc, -0.3, STEP[2] + 0.1), "nervous"); P(c, KETTLE, 1, 2.6, 4.6, { expr: "smile", look: -1 }); P(c, PEBBLE, 2, -2.4, 4.8, { expr: "smile" }); } },
  { cue: 16, light: "day", cam: C([1.2, 1.5, 9.2], [-0.4, 1.4, 5.2], 32, 0.0018), dof: 14, focus: [-0.6, 1.4, 5.2],
    act: (c) => { P(c, PEBBLE, 2, -0.6, 5.2, { expr: "grin", wave: true }); P(c, KETTLE, 1, 0.9, 5.6, { expr: "smile", look: -1 }); } },
  { cue: 17, light: "day", cam: C([bak[0] - 1.2, 1.6, bak[2] + 2.6], [bak[0] - 0.4, 1.4, bak[2] - 0.8], 40, 0.0015),
    act: (c) => P(c, LADDER, 3, bak[0] - 0.6, bak[2] - 1.0, { expr: "grin" }) },
  { cue: 18, light: "day", cam: C([3, 1.2, -28], [0, 8, -40], 40, 0.0012), act: (c) => P(c, BRASS, 4, 1.2, -33, { expr: "stern", look: 0 }) },
  // ===== THE RULES =====
  { cue: 19, light: "day", cam: O([0, 0, 6], 8.5, 1.8, 0, 36), act: (c) => { P(c, BRASS, 4, 0, 4.4, { expr: "stern" }); for (let i = 0; i < 4; i++) P(c, [BUTTON, LANTERN, UMBRELLA, CITIZEN(3)][i], 40 + i, -2.4 + i * 1.6, 8, { expr: "nervous" }); } },
  { cue: 20, light: "day", cam: C([4, 12, -6], [BELLTOWER[0], 15.5, BELLTOWER[2]], 34, 0.002),
    act: (c) => rings(c, BELLTOWER[0], 15.5, BELLTOWER[2] + 2.8, c.t - c.u * 0 - 0.0) },
  { cue: 20, at: 2.6, light: "day", cam: O(F, 16, 4, 30, 40), act: (c) => { for (let i = 0; i < 10; i++) { const [x, z] = free((hh(i, 21) - 0.5) * 18, (hh(i, 24) - 0.5) * 18); P(c, CITIZEN(i + 21), 520 + i, x, z, { expr: "nervous", walk: flee(i, x, z) }); } } },
  { cue: 21, light: "day", cam: C([3, 1.5, -26], [0, 1.6, -44], 38, 0.0014), act: (c) => { P(c, CITIZEN(5), 50, -0.8, -33, { walk: { to: [-0.8, -48] } }); P(c, CITIZEN(6), 51, 0.8, -33.4, { walk: { to: [0.8, -48.4] } }); } },
  { cue: 22, light: "day", cam: C([ck[0], 1.6, ck[2] + 2], [ck[0] - 2, 2.2, ck[2] - 20], 36, 0.0016), act: () => {} },
  { cue: 23, light: "day", cam: C([0.8, 1.4, 9.5], [0, 1.3, 6], 30, 0.0016), act: (c) => P(c, KETTLE, 1, 0, 6, { expr: "laugh", scale: 0.85 }) },
  { cue: 24, light: "night", cam: C([0, 1.5, -18], [0, 3, -40], 34, 0.003), act: (c) => H(c, 0, -41.5, { tilt: 0.1 }) },
  // ===== THE HOLLOWS (night) =====
  { cue: 25, light: "night", cam: aerial(46, 40, 52, 44, 160), act: () => {} },
  { cue: 26, light: "night", cam: O(F, 15, 3.6, 200, 40), act: (c) => { rings(c, BELLTOWER[0], 15.5, BELLTOWER[2] + 2.8, 0); for (let i = 0; i < 9; i++) { const [x, z] = free((hh(i, 31) - 0.5) * 18, (hh(i, 34) - 0.5) * 18); P(c, CITIZEN(i + 31), 540 + i, x, z, { expr: "shock", walk: flee(i, x, z) }); } } },
  { cue: 27, light: "night", cam: C([1.0, 1.7, -14], [0, 2.5, -40], 36, 0.0015), act: (c) => P(c, KETTLE, 1, -0.4, -18, { expr: "nervous", scale: 0.85 }) },
  { cue: 28, light: "night", cam: C([0.5, 1.6, -27], [0, 3.5, -41], 32, 0.0035), act: () => {} },
  { cue: 29, light: "night", cam: C([0.6, 1.5, -24], [0, 3.2, -40], 34, 0.002), act: (c) => H(c, 0, -44, { walk: { to: [0, -37.5], a: 0.1, b: 0.95 } }) },
  { cue: 30, light: "night", cam: C([1.4, 0.35, -32.2], [0, 1.9, -36.5], 52, 0.0015), act: (c) => H(c, 0, -36.5, { tilt: -0.08 }) },
  { cue: 31, light: "night", cam: C([1.0, 1.9, -30.8], [0, 1.6, -36.5], 36, 0.0015), act: (c) => H(c, 0, -36.5, {}) },
  { cue: 32, light: "night", cam: C([0.3, 2.55, -33.6], [0, 2.45, -36.5], 30, 0.002), dof: 20, focus: [0, 2.5, -36.5], act: (c) => H(c, 0, -36.5, {}) },
  { cue: 33, light: "night", cam: C([1.6, 2.5, -33], [0, 2.35, -36.5], 32, 0.0016), act: (c) => H(c, 0, -36.5, { look: c.u < 0.4 ? -1 : 1 - Math.min(1, (c.u - 0.4) * 3), tilt: 0.12 }) },
  { cue: 34, light: "night", cam: C([0.2, 1.5, -16.2], [0, 1.45, -18.6], 26, 0.002), dof: 18, focus: [0, 1.4, -18.6], act: (c) => P(c, KETTLE, 1, 0, -18.6, { expr: "shock", scale: 0.85 }) },
  { cue: 35, light: "night", cam: C([0.4, 2.5, -32.4], [0, 2.4, -36.5], 30, 0.004), dof: 22, focus: [0, 2.5, -36.5], act: (c) => H(c, 0, -36.5, { reach: 0.6, tilt: 0.15 }) },
  { cue: 36, light: "night", cam: C(add(nearDoor("pebble", 6.2, -2.0), [0, 1.6, 0]), [PD[0], 1.4, PD[2]], 36, 0.0015),
    act: (c) => { const a = nearDoor("pebble", 0.5, 0.4), b = nearDoor("pebble", 3.2, -2.4); P(c, PEBBLE, 2, a[0], a[2], { expr: "shock" }); P(c, KETTLE, 1, b[0], b[2], { expr: "shock", scale: 0.85, walk: { to: [a[0] - 0.2, a[2] - 0.7], a: 0.1, b: 0.85 } }); } },
  { cue: 37, light: "night", cam: C([peb[0] - 0.4, 1.3, peb[2] + 2.3], [peb[0] - 0.4, 0.8, peb[2] - 0.4], 44, 0.0012),
    act: (c) => { P(c, PEBBLE, 2, peb[0] - 1.0, peb[2] + 0.4, { mode: "sit", y: 0.02, expr: "nervous" }); P(c, KETTLE, 1, peb[0] + 0.2, peb[2] + 0.4, { mode: "sit", y: 0.02, expr: "nervous", scale: 0.85 }); } },
  { cue: 38, light: "night", cam: G([5, 2, 2], [5, 2.2, -1], [-14, 2.6, 0.5], [-20, 2.6, -0.5], 34), act: (c) => H(c, -30, 1, { walk: { to: [-12, -1] } }) },
  { cue: 39, light: "day", cam: C([0.8, 2.2, -3.6], [0, 0.5, -26], 40, 0.0012), act: (c) => wetTrail(c) },
  // ===== THE CHALKERS =====
  { cue: 40, light: "day", cam: O([0, 0, -30], 6.5, 1.6, 20, 34), act: (c) => { P(c, KETTLE, 1, -0.9, -30, { expr: "grin" }); P(c, CITIZEN(9), 60, 0.9, -30.4, { expr: "smile" }); chalkStick(c, 0, 1.25, -29.8); } },
  { cue: 41, light: "day", cam: C([0, 2, -22], [0, 2.4, -38], 40, 0.0012), act: (c) => { for (let i = 0; i < 6; i++) P(c, CITIZEN(10 + i), 61 + i, -3 + i * 1.2, -34 + (i % 2) * 0.8, { expr: i % 2 ? "grin" : "stern" }); P(c, PEBBLE, 2, 3.8, -33, { expr: "grin" }); } },
  { cue: 42, light: "day", cam: C([-2, 1.8, -54], [0, 2, -40], 40, 0.0012), act: (c) => { for (let k = 0; k < 2; k++) { P(c, CITIZEN(12 + 2 * k), 70 + 2 * k, -0.7, -41 - k * 4, { walk: { to: [-0.7, -60 - k * 4] } }); P(c, CITIZEN(13 + 2 * k), 71 + 2 * k, 0.7, -41.4 - k * 4, { walk: { to: [0.7, -60.4 - k * 4] } }); } } },
  { cue: 43, light: "day", cam: C([ck[0] + 0.4, 1.6, ck[2] - 6], [LW, 1.6, ck[2] - 10], 34, 0.0016),
    act: (c) => { P(c, KETTLE, 1, LW + 0.9, ck[2] - 9.4, { expr: "smile", side: true, mirror: true }); if (c.u > 0.3) arrow(c, LW, ck[2] - 10.2, Math.PI / 2, false, "a"); } },
  { cue: 44, light: "day", cam: C([tow[0] + 3.5, 3.4, tow[2] + 4.5], [tow[0], 0.5, tow[2]], 44, 0.0012),
    act: (c) => { P(c, PEBBLE, 2, tow[0] - 1.5, tow[2] + 1.8, { mode: "sit", y: 0.02, expr: "smile" }); P(c, CITIZEN(14), 80, tow[0] + 1.2, tow[2] + 2.2, { expr: "smile" }); P(c, KETTLE, 1, tow[0] + 0.3, tow[2] + 2.6, { expr: "grin" }); } },
  { cue: 45, light: "day", cam: (u) => ({ pos: [tow[0] + 2.6, 4.7 - 0.6 * ease(u), tow[2] + 2.8], look: [tow[0] - 0.6, 0, tow[2] - 0.8], fov: 56, roll: 0.15 * u }), act: () => {} },
  { cue: 46, light: "day", cam: C([ck[0] + 0.8, 1.6, ck[2] - 7.6], [LW, 1.6, ck[2] - 10.2], 30, 0.0016), act: (c) => arrow(c, LW, ck[2] - 10.2, Math.PI / 2, false, "a") },
  { cue: 47, light: "day", cam: C([ck[0] + 0.8, 1.6, ck[2] - 7.6], [LW, 1.6, ck[2] - 10.2], 30, 0.0016), act: (c) => arrow(c, LW, ck[2] - 10.2, Math.PI / 2, c.u > 0.5, "a") },
  { cue: 48, light: "day", cam: C([kt[0], 1.7, kt[2] - 6], [kt[0], 3, kt[2] - 22], 38, 0.002), act: () => {} },
  { cue: 49, light: "day", cam: C([tow[0] - 2, 1.6, tow[2] + 3.6], [tow[0] - 0.4, 1.6, tow[2]], 34, 0.0015), act: (c) => P(c, BRASS, 4, tow[0] - 0.4, tow[2] + 0.2, { expr: "stern", look: -1 }) },
  { cue: 50, light: "day", cam: C([ck[0], 1.5, ck[2] - 2], [ck[0], 1.6, ck[2] - 16], 36, 0.0008),
    act: (c) => { P(c, KETTLE, 1, ck[0] + 0.6, ck[2] - 14, { expr: "grin", walk: { to: [ck[0] + 0.6, ck[2] - 7] } }); P(c, PEBBLE, 2, ck[0] - 0.6, ck[2] - 14.4, { expr: "laugh", walk: { to: [ck[0] - 0.6, ck[2] - 7.4] } }); } },
  { cue: 51, light: "day", cam: G([gd[0] - 1.5, 2.2, gd[2] - 11], [gd[0] + 1.5, 2.6, gd[2] - 14], [gd[0], 1, gd[2] - 25], [gd[0], 1, gd[2] - 25], 42),
    act: (c) => { P(c, KETTLE, 1, gd[0] - 1, gd[2] - 18, { expr: "shock", scale: 0.85 }); P(c, PEBBLE, 2, gd[0] + 0.4, gd[2] - 18.4, { expr: "grin" }); } },
  { cue: 52, light: "day", cam: C([st[0] + 1, 2.4, st[2] - 16], [st[0], -0.8, st[2] - 30], 40, 0.0015), act: (c) => { P(c, PEBBLE, 2, st[0] - 0.8, st[2] - 24, { expr: "shock" }); P(c, KETTLE, 1, st[0] + 0.8, st[2] - 24.2, { expr: "nervous", scale: 0.85 }); } },
  { cue: 53, light: "day", cam: G([ty[0], 1.7, ty[2] - 2], [ty[0], 1.7, ty[2] - 10], [ty[0] - 2.8, 2.5, ty[2] - 14], [ty[0] - 2.8, 2.5, ty[2] - 22], 36), act: () => {} },
  { cue: 54, light: "day", cam: C([kt[0] + 0.8, 0.9, kt[2] - 15], [kt[0] - 0.4, 0.2, kt[2] - 19.5], 32, 0.0025), dof: 16, focus: [kt[0] - 0.4, 0.2, kt[2] - 19.5],
    act: (c) => kettle(c, kt[0] - 0.4, kt[2] - 19.5, true, 0.5) },
  { cue: 55, light: "day", cam: C([kt[0], 1.5, kt[2] - 15.6], [kt[0], 1.3, kt[2] - 18.6], 28, 0.0018), dof: 18, focus: [kt[0], 1.3, kt[2] - 18.6],
    act: (c) => { P(c, KETTLE, 1, kt[0], kt[2] - 18.6, { expr: "nervous", scale: 0.85 }); kettle(c, kt[0] + 0.35, kt[2] - 18.4, true, 0.36, 0.9); } },
  // ===== THE NEW ONES =====
  { cue: 56, light: "day", cam: O(F, 9, 2.4, 0, 36), act: (c) => { newcomer(c, CITIZEN(17), 90, () => {}, "dazed"); crowd(c, 4, 0, 9, 5, 1.5, 41, () => ({ expr: "smile" })); } },
  { cue: 57, light: "day", cam: C([1.6, 1.0, 6.4], [0.3, 0.8, STEP[2]], 30, 0.0016), act: (c) => newcomer(c, BUTTON, 31, (cc) => buttonProp(cc, -0.55, STEP[2] + 0.1), "dazed") },
  { cue: 57, at: 1.6, light: "day", cam: C([-1.4, 1.0, 6.4], [0.3, 0.8, STEP[2]], 30, 0.0016), act: (c) => newcomer(c, LANTERN, 32, (cc) => lanternProp(cc, -0.3, STEP[2] + 0.1), "nervous") },
  { cue: 58, light: "day", cam: C([bak[0] + 0.6, 1.6, bak[2] + 2.6], [bak[0] - 0.4, 1.4, bak[2] - 0.8], 40, 0.0015),
    act: (c) => { P(c, UMBRELLA, 33, bak[0] - 0.2, bak[2] - 1.0, { expr: c.u < 0.4 ? "pained" : "grin" }); P(c, LADDER, 3, bak[0] - 1.8, bak[2] - 1.1, { expr: "grin" }); } },
  { cue: 59, light: "day", cam: C([2.4, 1.3, 7.4], [0.2, 0.8, STEP[2]], 32, 0.0016), act: (c) => newcomer(c, CITIZEN(18), 91, (cc) => kettle(cc, -0.6, STEP[2] + 0.2, false, 0.0001), "dazed") },
  { cue: 60, light: "day", cam: C([0.6, 1.0, 5.6], [0.3, 0.95, STEP[2]], 24, 0.002), dof: 20, focus: [0.3, 0.9, STEP[2]], act: (c) => newcomer(c, CITIZEN(18), 91, () => {}, "nervous") },
  { cue: 61, light: "day", cam: C([1.4, 2.5, 5.0], [0, 1.1, -0.4], 36, 0.0016), act: (c) => P(c, CITIZEN(18), 91, 0.7, 3.4, { expr: "shock", look: -1, y: 0.18 }) },
  { cue: 62, light: "day", cam: C([bed[0] - 1.4, 1.5, bed[2] + 0.8], [bed[0] + 0.6, 1.5, bed[2] - 2.6], 34, 0.0015), act: (c) => P(c, KETTLE, 1, bed[0] + 0.6, bed[2] - 1.9, { expr: "nervous", look: 1 }) },
  { cue: 63, light: "day", cam: aerial(90, 80, 70, 64, 330), act: () => {} },
  { cue: 64, light: "day", cam: C([peb[0] + 1.2, 1.6, peb[2] + 1.6], [peb[0] + 3.0, 0.6, peb[2] - 1.6], 34, 0.0018), act: () => {} },
  { cue: 65, light: "day", cam: C(nearDoor("brass", 5.6, -2.6).map((v, i) => (i === 1 ? 1.6 : v)) as V3, add(nearDoor("brass", 1.2, 0.2), [0, 1.5, 0]), 36, 0.0015),
    act: (c) => { const a = nearDoor("brass", 0.5, 0.6), b = nearDoor("brass", 1.9, -0.5); P(c, BRASS, 4, a[0], a[2], { expr: "stern" }); P(c, KETTLE, 1, b[0], b[2], { expr: "neutral", scale: 0.85 }); } },
  { cue: 66, light: "day", cam: C(add(nearDoor("brass", 4.6, 2.2), [0, 1.7, 0]), [GN[0], 6, GN[2]], 34, 0.0012), act: (c) => { const a = nearDoor("brass", 1.2, 0.4); P(c, BRASS, 4, a[0], a[2], { expr: "neutral", look: -1 }); } },
  // ===== WHAT PEBBLE FOUND =====
  { cue: 67, light: "day", cam: C([GE[0] - 12, 1.6, 2.4], [GE[0], 3, 0], 36, 0.0015), act: (c) => P(c, KETTLE, 1, GE[0] - 7, 1.2, { expr: "nervous", scale: 0.85 }) },
  { cue: 68, light: "day", cam: C([GE[0] - 10, 1.4, -1.4], [GE[0], 1.4, 0], 36, 0.0012), act: (c) => P(c, BUTTON, 31, GE[0] + 3, 0, { expr: "shock", walk: { to: [GE[0] - 4, 0], a: 0.1, b: 0.95 } }) },
  { cue: 69, light: "day", cam: C([GE[0] - 6.6, 1.1, 0.4], [GE[0] - 4, 1.0, 0], 26, 0.002), dof: 18, focus: [GE[0] - 4, 1.0, 0], act: (c) => P(c, BUTTON, 31, GE[0] - 4, 0, { expr: "shock" }) },
  { cue: 70, light: "night", cam: C([bed[0] - 1.6, 1.4, bed[2] + 1.6], [bed[0] + 0.6, 1.6, bed[2] - 3], 36, 0.0012), act: (c) => P(c, KETTLE, 1, bed[0] + 0.3, bed[2] - 2.0, { expr: "nervous", mode: "sit", y: 0.45 }) },
  { cue: 71, light: "night", cam: C([GE[0] - 18, 2, -2], [GE[0], 3.5, 0], 36, 0.003), act: () => {} },
  { cue: 72, light: "night", cam: C(add(nearDoor("kettle", 5.0, -2.6), [0, 0.8, 0]), add(nearDoor("kettle", 0.4, 1.4), [0, 3.6, 0]), 40, 0.0015), act: (c) => { const a = nearDoor("kettle", 1.0, -1.4), b = nearDoor("kettle", 0.7, 1.4); H(c, a[0], a[2], { walk: { to: [b[0], b[2]], a: 0, b: 0.5 }, tilt: -0.25 }); } },
  { cue: 73, light: "night", cam: C(add(nearDoor("kettle", 3.6, 1.6), [0, 2.9, 0]), add(nearDoor("kettle", 0.7, 1.4), [0, 2.5, 0]), 30, 0.003), dof: 20, focus: add(nearDoor("kettle", 0.7, 1.4), [0, 2.5, 0]), act: (c) => { const b = nearDoor("kettle", 0.7, 1.4); H(c, b[0], b[2], { tilt: -0.3 }); } },
  { cue: 74, light: "night", cam: C([bed[0] + 0.6, 1.5, bed[2] - 0.6], [bed[0] + 0.3, 1.5, bed[2] - 2.0], 28, 0.0018), dof: 16, focus: [bed[0] + 0.3, 1.5, bed[2] - 2.0], act: (c) => P(c, KETTLE, 1, bed[0] + 0.3, bed[2] - 2.0, { expr: "pained", mode: "sit", y: 0.45 }) },
  { cue: 75, light: "night", cam: C([bed[0] - 1.0, 1.5, bed[2] + 1.0], [bed[0] + 0.5, 1.6, bed[2] - 3], 34, 0.0015), act: (c) => P(c, KETTLE, 1, bed[0] + 0.3, bed[2] - 2.0, { expr: "stern", mode: "sit", y: 0.45 }) },
  { cue: 76, light: "day", cam: C([GE[0] - 14, 1.8, 1.5], [GE[0] + 4, 1.8, 0], 36, 0.001), act: (c) => P(c, KETTLE, 1, GE[0] - 6, 0.4, { expr: "stern", scale: 0.85, walk: { to: [GE[0] + 5, 0.4], a: 0.05 } }) },
  { cue: 77, light: "day", cam: C([ck[0] + 0.6, 1.6, ck[2] - 2], [ck[0], 1.6, ck[2] - 20], 34, 0.0014),
    act: (c) => { for (let k = 0; k < 4; k++) arrow(c, k % 2 ? RW : LW, ck[2] - 6 - k * 6, k % 2 ? -Math.PI / 2 : Math.PI / 2, false, "r" + k); P(c, KETTLE, 1, ck[0], ck[2] - 6, { expr: "stern", scale: 0.85, walk: { to: [ck[0], ck[2] - 18] } }); } },
  { cue: 78, light: "day", cam: C([wr[0] + 1.2, 1.7, wr[2] - 4], [wr[0] - KIT_W / 2, 1.8, wr[2] - 9], 34, 0.0016),
    act: (c) => { writing(c, ["The Hollows aren't from", "the labyrinth."], 0, wr[2] - 9); P(c, KETTLE, 1, wr[0] + 0.6, wr[2] - 6.4, { expr: "shock", scale: 0.85 }); } },
  { cue: 79, light: "day", cam: C([wr[0] + 1.4, 1.75, wr[2] - 7], [wr[0] - KIT_W / 2, 1.75, wr[2] - 9], 30, 0.002), act: (c) => writing(c, ["The Hollows aren't from", "the labyrinth."], 0, wr[2] - 9) },
  { cue: 80, light: "day", cam: C([wr[0] + 1.4, 1.75, wr[2] - 13], [wr[0] - KIT_W / 2, 1.75, wr[2] - 15], 30, 0.002), act: (c) => writing(c, ["They're from Middle."], 0.4, wr[2] - 15) },
  { cue: 81, light: "day", cam: C([wr[0] + 1.4, 1.75, wr[2] - 19], [wr[0] - KIT_W / 2, 1.75, wr[2] - 21], 30, 0.002), act: (c) => writing(c, ["Count the beds."], 0.7, wr[2] - 21) },
  { cue: 82, light: "day", cam: C([wr[0] + 1.4, 1.75, wr[2] - 25], [wr[0] - KIT_W / 2, 1.75, wr[2] - 27], 30, 0.0025), act: (c) => writing(c, ["Go to the centre."], 1, wr[2] - 27) },
  // ===== THE CENTRE =====
  { cue: 83, light: "day", cam: C([wr[0], 1.4, wr[2] - 22], [wr[0], 1.6, wr[2] - 40], 36, 0.0008), act: (c) => P(c, KETTLE, 1, wr[0], wr[2] - 26, { expr: "stern", scale: 0.85, walk: { to: [wr[0], wr[2] - 38] } }) },
  { cue: 84, light: "day", cam: C([0, 1.8, -24], [0, 3, -44], 38, 0.0012), act: (c) => P(c, KETTLE, 1, 0, -30, { expr: "stern", scale: 0.85, walk: { to: [0, -46] } }) },
  { cue: 85, light: "day", cam: C([ty[0] + 0.6, 1.6, ty[2] - 4], [ty[0] - 1, 1.8, ty[2] - 20], 34, 0.0012), act: (c) => P(c, KETTLE, 1, ty[0] - 0.8, ty[2] - 9, { expr: "neutral", scale: 0.85, walk: { to: [ty[0] - 0.8, ty[2] - 18] } }) },
  { cue: 86, light: "day", cam: C([ty[0] + 0.4, 1.7, ty[2] - 12], [ty[0] - KIT_W / 2, 1.8, ty[2] - 13.4], 28, 0.002), act: () => {} },
  { cue: 87, light: "day", cam: G([ty[0] + 0.4, 1.7, ty[2] - 22], [ty[0] + 0.4, 1.7, ty[2] - 30], [ty[0] - KIT_W / 2, 2.4, ty[2] - 26], [ty[0] - KIT_W / 2, 2.4, ty[2] - 36], 34), act: () => {} },
  { cue: 88, light: "day", cam: C([Cc[0] - 40, 1.7, Cc[2] + 0.8], [Cc[0], 4, Cc[2]], 34, 0.0012), act: (c) => P(c, KETTLE, 1, Cc[0] - 30, Cc[2] + 0.4, { expr: "shock", scale: 0.85, walk: { to: [Cc[0] - 20, Cc[2] + 0.4], a: 0.05 } }) },
  { cue: 89, light: "day", cam: (u) => ({ pos: [Cc[0] - 17 + 3 * ease(u), 18 - 2 * ease(u), Cc[2] + 13], look: [Cc[0], 2, Cc[2]], fov: 44, roll: 0 }), act: (c) => P(c, KETTLE, 1, Cc[0] - 13, Cc[2] + 1, { expr: "shock", scale: 0.85 }) },
  { cue: 90, light: "day", cam: C([Cc[0] - 7, 0.6, Cc[2] + 8], [Cc[0], 7, Cc[2] + 2], 44, 0.0012), act: () => {} },
  { cue: 91, light: "day", cam: C([Cc[0] - 12, 1.6, Cc[2] + 10], [Cc[0] - 6.3, 1.6, Cc[2] + 5.7], 32, 0.0018), act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, tilt: 0.35, look: 0.5 }) },
  { cue: 92, light: "day", cam: C([Cc[0] - 9.6, 1.9, Cc[2] + 9.2], [Cc[0] - 6.3, 1.6, Cc[2] + 5.75], 30, 0.0012), act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, tilt: 0.35, look: 0.5 }) },
  { cue: 93, light: "day", cam: C([Cc[0] - 8.8, 2.4, Cc[2] + 8.2], [Cc[0] - 6.3, 2.3, Cc[2] + 5.75], 28, 0.002), dof: 18, focus: [Cc[0] - 6.3, 2.3, Cc[2] + 5.75],
    act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, tilt: 0.35 * (1 - ease(c.u * 1.5)), look: 0.5 - ease(c.u * 1.5) * 0.5 }) },
  { cue: 94, light: "day", cam: C([Cc[0] - 7.4, 1.4, Cc[2] + 7.6], [Cc[0] - 5.9, 1.1, Cc[2] + 5.75], 26, 0.002), dof: 20, focus: [Cc[0] - 5.9, 1.1, Cc[2] + 5.75], act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, chalk: true }) },
  { cue: 95, light: "day", cam: O([Cc[0] - 7.5, 0, Cc[2] + 7.2], 6, 1.8, -60, 36), act: (c) => { H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, chalk: true }); P(c, KETTLE, 1, Cc[0] - 8.6, Cc[2] + 8.4, { expr: "shock", scale: 0.85 }); } },
  { cue: 96, light: "day", cam: C([Cc[0] - 13, 5, Cc[2] + 10], [Cc[0] - 4, 2, Cc[2] + 4], 42, 0.001), act: (c) => { H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, chalk: true }); P(c, KETTLE, 1, Cc[0] - 7.6, Cc[2] + 7.4, { mode: "sit", y: 0.45, expr: "pained", scale: 0.85 }); } },
  // ===== THE REVEAL =====
  { cue: 97, light: "day", cam: aerial(110, 95, 120, 110, 60), act: () => {} },
  { cue: 98, light: "day", cam: C([2.6, 1.0, 7.6], [0, 0.6, STEP[2]], 32, 0.0018), act: (c) => kettle(c, 0.4, STEP[2], false, 0.4, 0.36) },
  { cue: 99, light: "day", cam: C([Cc[0] - 10, 1.6, Cc[2] + 12], [Cc[0], 4.5, Cc[2] + 2], 40, 0.0014), act: (c) => P(c, CITIZEN(20), 95, Cc[0] - 5, Cc[2] + 8, { expr: "neutral", walk: { to: [Cc[0] - 0.5, Cc[2] + 3.6] } }) },
  { cue: 100, light: "day", cam: C([Cc[0] - 3, 1.6, Cc[2] + 9], [Cc[0], 4.5, Cc[2] + 2], 40, 0.0014), act: (c) => { P(c, CITIZEN(20), 95, Cc[0] - 0.5, Cc[2] + 4.5, { expr: "neutral", walk: { to: [Cc[0], Cc[2] + 3.4], a: 0, b: 0.8 } }); glow(c, Cc[0], 4.5, Cc[2] + 2.6, 7, (c.u - 0.75) * 4); } },
  { cue: 101, light: "night", cam: C([Cc[0] - 3, 1.2, Cc[2] + 11], [Cc[0], 5, Cc[2] + 2], 40, 0.002), act: (c) => glow(c, Cc[0], 5, Cc[2] + 2.6, 9, 0.5 + 0.5 * Math.sin(c.t * 3)) },
  { cue: 102, light: "night", cam: C([ck[0] + 0.5, 1.8, ck[2] - 2], [ck[0], 3, ck[2] - 20], 34, 0.0012), act: (c) => H(c, ck[0] - 0.4, ck[2] - 24, { walk: { to: [ck[0] - 0.4, ck[2] - 10] } }) },
  { cue: 103, light: "night", cam: aerial(48, 44, 80, 74, 120), act: (c) => { H(c, 0, -50, { walk: { to: [0, -78] }, scale: 1.6 }); H(c, 50, 0, { walk: { to: [80, 0] }, scale: 1.6 }); } },
  { cue: 104, light: "day", cam: O(F, 10, 2.5, 20, 36), act: () => {} },
  { cue: 105, light: "day", cam: C([2.2, 1.2, 7.2], [0.2, 0.8, STEP[2]], 30, 0.0016), act: (c) => newcomer(c, CITIZEN(22), 96, () => {}, "dazed") },
  { cue: 106, light: "day", cam: C([1.6, 0.9, 6.2], [0, 0.7, STEP[2]], 28, 0.0018), act: (c) => newcomer(c, CITIZEN(22), 96, (cc) => umbrellaProp(cc, -0.6, STEP[2] + 0.1), "dazed") },
  { cue: 107, light: "day", cam: C([-0.4, 0.8, 5.0], [-0.6, 0.7, STEP[2] + 0.1], 22, 0.002), dof: 20, focus: [-0.6, 0.7, STEP[2] + 0.1], act: (c) => umbrellaProp(c, -0.6, STEP[2] + 0.1) },
  { cue: 108, light: "day", cam: C([0.6, 1.3, -26], [0, 1.1, -30], 30, 0.0016), act: (c) => { P(c, BUTTON, 31, 0, -30, { expr: "neutral" }); chalkStick(c, 0.35, 0.75, -29.8); } },
  { cue: 109, light: "day", cam: C([bak[0] - 0.2, 1.5, bak[2] + 1.8], [bak[0] - 0.2, 1.4, bak[2] - 1.0], 30, 0.0016), act: (c) => P(c, UMBRELLA, 33, bak[0] - 0.2, bak[2] - 1.0, { expr: "smile_closed" }) },
  { cue: 110, light: "day", cam: aerial(70, 58, 64, 58, 250), act: () => {} },
  { cue: 111, light: "day", cam: C([peb[0] + 1.2, 1.4, peb[2] + 1.2], [peb[0] + 3.0, 0.6, peb[2] - 1.6], 30, 0.002), act: () => {} },
  { cue: 112, light: "day", cam: C([kt[0] + 0.8, 0.9, kt[2] - 15], [kt[0] - 0.4, 0.2, kt[2] - 19.5], 30, 0.002), act: (c) => kettle(c, kt[0] - 0.4, kt[2] - 19.5, true, 0.5) },
  { cue: 113, light: "day", cam: C([kt[0] - 0.2, 0.6, kt[2] - 18], [kt[0] - 0.4, 0.25, kt[2] - 19.5], 24, 0.002), dof: 22, focus: [kt[0] - 0.4, 0.25, kt[2] - 19.5], act: (c) => kettle(c, kt[0] - 0.4, kt[2] - 19.5, true, 0.5) },
  { cue: 114, light: "day", cam: C([Cc[0] - 9.8, 2.0, Cc[2] + 8.2], [Cc[0] - 6.3, 1.8, Cc[2] + 5.7], 30, 0.0015), act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, chalk: true }) },
  { cue: 115, light: "day", cam: C([Cc[0] - 8.8, 2.4, Cc[2] + 8.0], [Cc[0] - 6.3, 2.3, Cc[2] + 5.75], 26, 0.002), dof: 20, focus: [Cc[0] - 6.3, 2.3, Cc[2] + 5.75], act: (c) => H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, tilt: 0.2 }) },
  { cue: 116, light: "day", cam: O([Cc[0] - 7.5, 0, Cc[2] + 7.2], 7.2, 1.7, -110, 34), act: (c) => { H(c, Cc[0] - 6.3, Cc[2] + 5.75, { sit: true, y: 0.0, chalk: true, reach: 0.4 }); P(c, KETTLE, 1, Cc[0] - 8.6, Cc[2] + 8.4, { expr: "pained", scale: 0.85 }); } },
  { cue: 117, light: "day", cam: C([5, 2, -6], [BELLTOWER[0], 9, BELLTOWER[2]], 40, 0.0015), act: (c) => { P(c, KETTLE, 1, 0.4, -11.6, { expr: "stern", scale: 0.85 }); rings(c, BELLTOWER[0], 15.5, BELLTOWER[2] + 2.8, c.t - c.u * 3 + 1.2); } },
  { cue: 118, light: "day", cam: C(add(nearDoor("brass", 5.4, -2.4), [0, 1.5, 0]), add(nearDoor("brass", 1.2, 0.2), [0, 1.5, 0]), 34, 0.0015),
    act: (c) => { const a = nearDoor("brass", 0.5, 0.6), b = nearDoor("brass", 1.9, -0.5); P(c, BRASS, 4, a[0], a[2], { expr: "neutral" }); P(c, KETTLE, 1, b[0], b[2], { expr: "stern", scale: 0.85 }); } },
  { cue: 119, light: "day", cam: C(add(nearDoor("brass", 3.3, -0.4), [0, 1.7, 0]), add(nearDoor("brass", 0.5, 0.6), [0, 1.7, 0]), 26, 0.002), dof: 18, focus: add(nearDoor("brass", 0.5, 0.6), [0, 1.7, 0]), act: (c) => { const a = nearDoor("brass", 0.5, 0.6); P(c, BRASS, 4, a[0], a[2], { expr: "smile_closed" }); } },
  // ===== ENDING =====
  { cue: 120, light: "day", cam: aerial(40, 170, 50, 200, 25), act: () => {} },
  { cue: 121, light: "day", cam: O(F, 9, 1.4, 10, 34), act: (c) => newcomer(c, CITIZEN(24), 97, () => {}, "dazed") },
  { cue: 122, light: "day", cam: C([0.8, 1.3, 7.6], [0, 1.1, STEP[2] + 0.2], 30, 0.0016), dof: 16, focus: [0, 1.1, STEP[2] + 0.2], act: (c) => P(c, KETTLE, 1, 0, STEP[2] + 0.2, { mode: "sit", y: 0.36, expr: "smile_closed", scale: 0.85 }) },
  { cue: 123, light: "day", cam: C([0.8, 1.3, 7.6], [0, 1.1, STEP[2] + 0.2], 30, 0.0022), dof: 16, focus: [0, 1.1, STEP[2] + 0.2],
    act: (c) => { P(c, KETTLE, 1, 0, STEP[2] + 0.2, { mode: "sit", y: 0.36, expr: "nervous", scale: 0.85 }); kettle(c, -0.8, STEP[2] + 0.3, false, 0.4, 0.36); } },
  { cue: 124, light: "day", cam: C([1.6, 0.8, 6.4], [-0.6, 0.6, STEP[2] + 0.3], 30, 0.0016), dof: 18, focus: [-0.6, 0.6, STEP[2] + 0.3], act: (c) => kettle(c, -0.6, STEP[2] + 0.3, false, 0.42, 0.36) },
];
void AIR; void add; void WALL_R; void SUNV; void tallyMarks; void PEBBLE; void GE;

/** everything with a face in shot spec `s` at time t (u = 0..1 through the shot, g = frames since it began) */
export const stageSpec = (s: ShotSpec, t: number, u: number, g: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  setLight(s.light);
  findSun(cam, SUNV);
  s.act({ t, u, g, cam, out });
  return out;
};
