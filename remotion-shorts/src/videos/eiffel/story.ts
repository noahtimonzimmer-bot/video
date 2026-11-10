// Timeline of the bridge short: shots timed to the the voice words (~/bridge-short/voice/words.json),
// story physics (column position, march phase, deck bounce, collapse) and the camera grammar measured in the
// reference study: continuous slow push-ins; symmetric ease-in-out moves ~23 f (10 in / 10 out), peak ~15 px/f at 720p;
// big reframes are cuts; impacts are 7-frame kicks that flip sign every frame; no hand-held float.
export const FPS = 30;
export const TOTAL = 1725;
export const D0 = 6.0; // bank top + deck height (m)
export const HALF = 27; // towers at z = +-27, span 54 m
export const FILES = [-1.65, -0.55, 0.55, 1.65];
export const ROW_GAP = 1.3;
export const COUNT = 74;
export const PARK: V3 = [70, D0, -75]; // swing pivot base (x, ground y, z)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- story physics (tau = story time in seconds) ----------------
export const front = (tau: number) => 26 - 1.6 * (tau - 4.4); // z of the front row, marching toward -z
export const marchPhase = (tau: number) => ((tau % 1) + 1) % 1; // 1 Hz cycle = 2 steps/s, footfalls at 0 and 0.5
export const SNAP = 34.62, DROP0 = 36.35, DROP1 = 36.95;
export const amp = (tau: number) =>
  lin([[14.85, 0], [17.8, 0.07], [21.4, 0.13], [27.4, 0.26], [33.0, 0.46], [SNAP, 0.55], [SNAP + 0.35, 0.0]], tau);
export const stomp = (tau: number) => lin([[21.4, 1.0], [27.4, 1.35], [33, 1.5]], tau); // "a little harder every step"
export const shapeZ = (z: number) => (Math.abs(z) < HALF ? Math.cos((Math.PI * z) / (2 * HALF)) : 0);
export const dropW = (z: number) => smooth((20 - z) / 26); // 1 on the near half, 0 at the far tower
export const dropU = (tau: number) => (tau < DROP0 ? 0 : Math.min(1, ((tau - DROP0) / (DROP1 - DROP0)) ** 2));
export const DROP_H = 6.6;

export type BridgeState = { bounce: number; drop: number; snap: number; collapsed: boolean };
export const deckY = (z: number, b: BridgeState) => D0 + b.bounce * shapeZ(z) - b.drop * DROP_H * dropW(z);

// ---------------- shots ----------------
export type Light = "day" | "golden";
export type Crowd = "march" | "fall" | "water" | "bank" | "tourists" | "none";
export type ShotDef = { id: number; a: number; b: number; light: Light; crowd: Crowd; tau: (t: number) => number; towns?: boolean };
// "The Man Who Sold the Eiffel Tower": voice cues (s) 1.10 3.86 14.64 22.26 27.56 30.39 36.28 40.88 43.88 47.81 51.81, end 55.5
const sh = (id: number, a: number, b: number, light: Light = "day"): ShotDef => ({ id, a, b, light, crowd: "none", tau: (t) => t });
export const SHOTS: ShotDef[] = [
  sh(1, 0, 112),       // hook: Victor in front of the tower
  sh(2, 112, 270),     // con man at the cafe
  sh(3, 270, 435),     // the newspaper: tower rusting
  sh(4, 435, 555),     // forged letters
  sh(5, 555, 665),     // six dealers to the Grand Hotel
  sh(6, 665, 825),     // the plan: 7,000 tons of scrap
  sh(7, 825, 905),     // secret, or riots
  sh(8, 905, 1088),    // Andre pays, plus a bribe
  sh(9, 1088, 1222),   // the train out of Paris
  sh(10, 1222, 1312),  // Andre walks past the police
  sh(11, 1312, 1432),  // back again, sells it again
  sh(12, 1432, 1550),  // police: he runs
  sh(13, 1550, TOTAL), // it was never for sale
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 4: 8, 5: 8, 6: 8, 8: 8, 9: 10, 10: 8, 11: 10, 12: 6, 13: 12 };
export const FLASH_AT = 112;
// places on the north main street (house fronts at |x| = 6, ground y = D0); the tower stands at the street's end (z 215)
export const HOOK_Z = 120;
export const CAFE: V3 = [-3.6, D0, 100];
export const DESK: V3 = [-3.8, D0, 90];
export const HOTEL_SIGN: V3 = [5.2, D0 + 3.0, 70];
export const TERR: V3 = [2.9, D0, 76.4];       // terrace table
export const PLAN: V3 = [-0.2, D0, 77.2];
export const PAY: V3 = [2.6, D0, 82];
export const TRAIN_Z = 52;
export const POL_SIGN: V3 = [-5.2, D0 + 2.9, 110];
export const DEAL2: V3 = [1.3, D0, 123.2];
export const END_V: V3 = [1.2, D0, 140];
export const TOWER_P: V3 = [0, D0, 215];

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
/** layers to draw at frame f: base shot, plus the next shot fading in during a crossfade */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export const bridgeState = (id: number, t: number): BridgeState => {
  const s = SHOTS[id - 1];
  const tau = s.tau(t);
  if (id === 9 || id === 10 || id === 14) return { bounce: 0, drop: 1, snap: 1, collapsed: true };
  if (id === 11) return { bounce: 0.75 * Math.sin(2 * Math.PI * 0.7 * (t - 43.4)), drop: 0, snap: 0, collapsed: false };
  if (id === 12 || id === 15) return { bounce: 0, drop: 0, snap: 0, collapsed: false };
  const bounce = -amp(tau) * Math.cos(4 * Math.PI * marchPhase(tau));
  if (id === 8) return { bounce, drop: dropU(tau), snap: clamp01((tau - SNAP) / 0.7), collapsed: tau >= DROP1 };
  return { bounce, drop: 0, snap: 0, collapsed: false };
};

// ---------------- camera ----------------
// Grammar (motion.md): every move is a symmetric smootherstep glide of 18-40 f (peak speed = 1.875 x distance / dur,
// so dur >= 0.075 x the move in 720p px keeps the peak near the reference 14-25 px/f); a reframe bigger than about
// half a frame width or 40 % zoom is a hard cut on its key frame. Glides are centred on the old key frame (the
// whoosh in the sound mix peaks there), so a glide key starts dur/2 earlier. Holds push in (dolly toward the look
// point or a fov zoom near walls/towers): 0.15-0.35 %/f, ~0.6 %/f for ~35 f on the punch words. Rolls of 4-8 deg
// over >= 18 f on emphasis beats, held tilt <= 0.07 rad.
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
/** reference camera ease: symmetric smootherstep (attack = release, ~10 f each on a 23 f move) */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const Fz = (id: number, f: number) => front(SHOTS[id - 1].tau(T(f)));
/** push-in factor since f0: the subject grows ~rate per frame; `punch` raises it (with 8 f soft edges) for the first n frames */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: camera slides toward the look point by factor k */
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put, for lenses next to towers / houses): tan(fov/2) shrinks by k */
const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });
/** a roll-only move on top of an existing framing */
const rolled = (s: (f: number) => Shot, roll: number) => (f: number): Shot => ({ ...s(f), roll });

// near-left anchorage where the bolt lives, and the free end of the snapped backstay
export const ANCHOR: V3 = [-2.7, D0 + 0.62, -37];
export const snapEnd = (snap: number): V3 => {
  const u = easeOut(snap);
  return [ANCHOR[0] - 0.6 * u, ANCHOR[1] + 5.5 * u - 2.0 * u * u, ANCHOR[2] + 4.5 * u];
};

// ---- framings (f -> camera); low lenses, close, dutch tilts (reference grammar) ----
const S1a = (f: number) => dolly([0.35, D0 + 0.5, HOOK_Z - 3.4], [0.35, D0 + 2.1, HOOK_Z], pushK(f, 0, 0.003), { fov: 52 });
const S1b = (f: number) => dolly([0.3, D0 + 0.6, HOOK_Z - 2.6], [0.3, D0 + 2.0, HOOK_Z], pushK(f, 66, 0.003, 0.007, 30), { fov: 52, roll: -0.06 });
const S2a = (f: number) => dolly([-1.0, D0 + 0.55, CAFE[2] + 3.2], [CAFE[0] + 0.9, D0 + 1.3, CAFE[2]], pushK(f, 112, 0.0025), { fov: 42 });
const S3a = (f: number) => dolly([-2.3, D0 + 1.3, CAFE[2] + 2.6], [CAFE[0] + 0.95, D0 + 1.25, CAFE[2] + 0.6], pushK(f, 270, 0.002), { fov: 42, roll: 0.03 });
const S4a = (f: number) => dolly([-1.3, D0 + 0.7, DESK[2] + 3.0], [DESK[0] + 1.0, D0 + 1.1, DESK[2]], pushK(f, 435, 0.0025), { fov: 42, roll: -0.03 });
const S5a = (f: number) => dolly([-1.6, D0 + 0.5, HOTEL_SIGN[2] - 8.5], [4.0, D0 + 1.9, HOTEL_SIGN[2] - 1], pushK(f, 555, 0.0022), { fov: 46 });
const S6a = (f: number) => dolly([1.8, D0 + 0.9, TERR[2] - 7.6], [1.8, D0 + 1.4, TERR[2]], pushK(f, 665, 0.0022), { fov: 46 });
const S6b = (f: number) => dolly([0.6, D0 + 1.0, PLAN[2] - 5.2], [PLAN[0] + 0.3, D0 + 1.45, PLAN[2]], pushK(f, 755, 0.003, 0.007, 30), { fov: 44, roll: 0.04 });
const S7a = (f: number) => dolly([1.4, D0 + 0.9, TERR[2] - 2.8], [1.4, D0 + 1.7, TERR[2] + 0.4], pushK(f, 825, 0.003), { fov: 46, roll: -0.05 });
const S8a = (f: number) => dolly([PAY[0] + 0.2, D0 + 0.6, PAY[2] - 4.4], [PAY[0], D0 + 1.4, PAY[2]], pushK(f, 905, 0.0025), { fov: 44 });
const S8b = (f: number) => dolly([PAY[0] + 0.5, D0 + 0.9, PAY[2] - 3.0], [PAY[0] + 0.1, D0 + 1.3, PAY[2]], pushK(f, 1030, 0.003, 0.006, 25), { fov: 40, roll: 0.05 });
const S9a = (f: number) => dolly([0.6, D0 + 0.8, TRAIN_Z + 13.0], [0, D0 + 2.0, TRAIN_Z], pushK(f, 1088, 0.002), { fov: 50 });
const S10a = (f: number) => dolly([-1.2, D0 + 0.6, POL_SIGN[2] - 5.4], [-3.6, D0 + 1.9, POL_SIGN[2] - 0.6], pushK(f, 1222, 0.0025), { fov: 44, roll: 0.04 });
const S11a = (f: number) => dolly([0.4, D0 + 0.45, DEAL2[2] - 6.5], [0.3, D0 + 2.3, DEAL2[2]], pushK(f, 1312, 0.0025), { fov: 48 });
const S12a = (f: number) => dolly([-0.6, D0 + 0.5, DEAL2[2] - 7.0], [0, D0 + 1.6, DEAL2[2]], pushK(f, 1432, 0.002), { fov: 48, roll: -0.05 });
const S13a = (f: number) => dolly([2.4, D0 + 0.7, END_V[2] - 3.6], [0.4, D0 + 24, TOWER_P[2]], pushK(f, 1550, 0.0012), { fov: 58 });
const S13b = (f: number) => dolly([2.4, D0 + 0.6, TOWER_P[2] - 38], [0, D0 + 44, TOWER_P[2]], pushK(f, 1640, 0.0012), { fov: 54, roll: 0.03 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 66, dur: 26, s: S1b }],
  2: [{ f: 112, s: S2a }],
  3: [{ f: 270, s: S3a }],
  4: [{ f: 435, s: S4a }],
  5: [{ f: 555, s: S5a }],
  6: [{ f: 665, s: S6a }, { f: 745, dur: 30, s: S6b }],
  7: [{ f: 825, s: S7a }],
  8: [{ f: 905, s: S8a }, { f: 1018, dur: 26, s: S8b }],
  9: [{ f: 1088, s: S9a }],
  10: [{ f: 1222, s: S10a }],
  11: [{ f: 1312, s: S11a }],
  12: [{ f: 1432, s: S12a }],
  13: [{ f: 1550, s: S13a }, { f: 1630, dur: 60, s: S13b }],
};

// impact kicks (reference v14): the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
export const PAY_T = 33.4, BRIBE_T = 35.0, DEAL2_T = 46.6, COPS_T = 48.4;
const KICKS: [number, number][] = [[2.45, 0.8], [DEAL2_T, 0.6], [49.3, 0.8]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a; // metres at the look distance for 3 px x a
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** frame at which the current key's move has finished (for picking billboard views per key, not per frame) */
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[id]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens: depth of field + foreground framing ----------------
/** Lens blur per shot (thin lens). cInf = blur-disc radius in px at 1080x1920 for things at infinity; 0 = all sharp.
 *  Reference: DOF on in ~1/3 of shots; when on, background sigma720 CU 4.2, MS 4.0, FS 2.7, WS 1.9,
 *  foreground objects 4-8 (disc radius at 1080p = 3 x sigma720). Establishing/wide/most full shots stay sharp.
 *  Entries switch on cuts (no dur) or ramp with the camera glide they share f/dur with. focus = world point (else the
 *  camera look point). */
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
const eyes = (id: number) => (f: number): V3 => [0, D0 + 1.6, Fz(id, f)];
const boots = (id: number) => (f: number): V3 => [0, D0 + 0.3, Fz(id, f)];
export const DOF: Dof[] = [
  { f: 0, cInf: 16, focus: () => [0, D0 + 1.5, HOOK_Z] },
  { f: 112, cInf: 18, focus: () => [CAFE[0] + 0.9, D0 + 1.4, CAFE[2]] },
  { f: 270, cInf: 20, focus: () => [CAFE[0] + 0.95, D0 + 1.3, CAFE[2] + 0.6] },
  { f: 435, cInf: 18, focus: () => [DESK[0] + 1.0, D0 + 1.2, DESK[2]] },
  { f: 555, cInf: 10 },
  { f: 665, cInf: 10, focus: () => [1.8, D0 + 1.3, TERR[2]] },
  { f: 745, dur: 30, cInf: 18, focus: () => [PLAN[0], D0 + 1.4, PLAN[2]] },
  { f: 825, cInf: 16, focus: () => [0.8, D0 + 1.5, TERR[2]] },
  { f: 905, cInf: 18, focus: () => [PAY[0], D0 + 1.3, PAY[2]] },
  { f: 1088, cInf: 10, focus: () => [0, D0 + 1.6, TRAIN_Z + 0.4] },
  { f: 1222, cInf: 16, focus: () => [-3.4, D0 + 1.5, POL_SIGN[2] - 1.4] },
  { f: 1312, cInf: 14, focus: () => [0.5, D0 + 1.4, DEAL2[2]] },
  { f: 1432, cInf: 12, focus: () => [0, D0 + 1.4, DEAL2[2] - 1] },
  { f: 1550, cInf: 8, focus: () => [END_V[0], D0 + 1.5, END_V[2]] },
  { f: 1630, dur: 60, cInf: 4, focus: () => TOWER_P },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
/** what the lens focuses on (DOF): the DOF table's focus point, else the camera look point */
export const focusAt = (id: number, f: number): V3 => {
  const d = dofAt(f);
  return d.focus ? d.focus(f) : camAt(id, f).look;
};

/** near framing objects: visible while a <= f < b; kit = a GLB name accepted by build.ts prop() */
// pos = base point (prop()'s x, y, z: the model's base sits on y), s = height in metres (prop()'s h), yaw in radians.
// They sit at 0.3-0.5 x the focus distance and cover 10-25 % of one frame edge, never a face; they are meant to be
// in front of the lens, so build them outside prop()'s sight-line test.
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
