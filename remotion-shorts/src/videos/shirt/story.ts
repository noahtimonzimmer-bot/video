// Timeline of the bridge short: shots timed to the the voice words (~/bridge-short/voice/words.json),
// story physics (column position, march phase, deck bounce, collapse) and the camera grammar measured in the
// reference study: continuous slow push-ins; symmetric ease-in-out moves ~23 f (10 in / 10 out), peak ~15 px/f at 720p;
// big reframes are cuts; impacts are 7-frame kicks that flip sign every frame; no hand-held float.
export const FPS = 30;
export const TOTAL = 1665;
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
// "The Shirt Guy" (Jason Sadler): voice cues (s) 1.10 5.44 9.24 11.74 16.16 20.28 23.46 30.56 32.68 35.97 38.04 40.91 44.15 47.09 50.82
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 160, light: "day", crowd: "none", tau: (t) => t },     // hook: Jason on the main street, shirts flip
  { id: 2, a: 160, b: 350, light: "day", crowd: "none", tau: (t) => t },   // idea at the garden table
  { id: 3, a: 350, b: 605, light: "day", crowd: "none", tau: (t) => t },   // the website board: $1, $2
  { id: 4, a: 605, b: 700, light: "day", crowd: "none", tau: (t) => t },   // Dec 31: $365
  { id: 5, a: 700, b: 915, light: "day", crowd: "none", tau: (t) => t },   // shirt, photos, videos, online
  { id: 6, a: 915, b: 978, light: "day", crowd: "none", tau: (t) => t },   // just an experiment
  { id: 7, a: 978, b: 1077, light: "day", crowd: "none", tau: (t) => t },  // the idea spread: the street fills up
  { id: 8, a: 1077, b: 1140, light: "day", crowd: "none", tau: (t) => t }, // sold out
  { id: 9, a: 1140, b: 1225, light: "day", crowd: "none", tau: (t) => t }, // more shirt wearers
  { id: 10, a: 1225, b: 1322, light: "day", crowd: "none", tau: (t) => t }, // a million dollars
  { id: 11, a: 1322, b: 1411, light: "day", crowd: "none", tau: (t) => t }, // anyone can be a billboard
  { id: 12, a: 1411, b: 1523, light: "day", crowd: "none", tau: (t) => t }, // getting dressed
  { id: 13, a: 1523, b: TOTAL, light: "day", crowd: "none", tau: (t) => t }, // ... he sold his last name too
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 5: 8, 9: 8, 10: 10, 12: 8, 13: 8 };
export const FLASH_AT = 160;
// story places on the north main street (house fronts at |x| = 6, ground y = D0)
export const JASON: V3 = [0, D0, 72];          // hook
export const TABLE: V3 = [-4.6, D0, 80];       // garden table in front of his house (west side)
export const BOARD: V3 = [-1.6, D0, 81.6];     // easel board = "the website"
export const PHOTO: V3 = [0, D0, 92];          // photo spot in the street
export const TEAM_Z = 100;                     // shirt team walks toward -z from here
export const SIGN: V3 = [-5.2, D0 + 2.5, 77.6]; // name sign on his house front

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

// ---- framings (f -> camera); each pushes in from the frame its key starts ----
const J = JASON, TB = TABLE, BD = BOARD, PH = PHOTO;
const S1a = (f: number) => dolly([0.75, D0 + 0.5, J[2] + 3.6], [0, D0 + 1.35, J[2]], pushK(f, 0, 0.0028), { fov: 42 });
const S1b = (f: number) => dolly([0.35, D0 + 0.85, J[2] + 2.3], [0, D0 + 1.55, J[2]], pushK(f, 92, 0.003, 0.006, 30), { fov: 38, roll: -0.06 });
const S2a = (f: number) => dolly([-1.2, D0 + 0.6, TB[2] + 2.8], [TB[0] + 1.2, D0 + 1.2, TB[2]], pushK(f, 160, 0.0022), { fov: 42 });
const S2b = (f: number) => dolly([-2.4, D0 + 1.15, TB[2] + 2.0], [TB[0] + 1.3, D0 + 1.55, TB[2]], pushK(f, 270, 0.003, 0.006, 30), { fov: 38, roll: 0.05 });
const S3a = (f: number) => dolly([1.5, D0 + 0.7, BD[2] + 4.2], [BD[0] - 0.55, D0 + 1.35, BD[2]], pushK(f, 350, 0.002), { fov: 42 });
const S3b = (f: number) => dolly([0.4, D0 + 1.2, BD[2] + 4.2], [BD[0] - 0.55, D0 + 1.45, BD[2]], pushK(f, 480, 0.0025), { fov: 38, roll: -0.03 });
const S4a = (f: number) => dolly([-0.2, D0 + 1.15, BD[2] + 2.9], [BD[0] + 0.5, D0 + 0.9, BD[2]], pushK(f, 605, 0.002, 0.007, 30), { fov: 36, roll: -0.04 });
const S5a = (f: number) => dolly([2.4, D0 + 0.55, PH[2] + 3.4], [PH[0] + 0.3, D0 + 1.4, PH[2]], pushK(f, 700, 0.002), { fov: 42, roll: 0.03 });
const S5b = (f: number) => dolly([3.2, D0 + 0.9, PH[2] + 5.4], [PH[0] + 1.0, D0 + 1.35, PH[2] + 1.2], pushK(f, 800, 0.0025), { fov: 40, roll: -0.04 });
const S6a = (f: number) => dolly([3.4, D0 + 1.4, TB[2] + 5.2], [TB[0] + 1.0, D0 + 1.2, TB[2]], pushK(f, 915, 0.0028), { fov: 44 });
const S7a = (f: number) => dolly([5.0, D0 + 3.4, TB[2] + 11], [TB[0] + 2.5, D0 + 1.0, TB[2] + 2], pushK(f, 978, 0.002), { fov: 46, roll: -0.04 });
const S8a = (f: number) => dolly([0.4, D0 + 1.45, BD[2] + 3.2], [BD[0], D0 + 1.3, BD[2]], pushK(f, 1077, 0.003, 0.007, 30), { fov: 36 });
const S9a = (f: number) => dolly([0.3, D0 + 0.4, TEAM_Z - 7.2], [0, D0 + 1.25, TEAM_Z - 2], pushK(f, 1140, 0.0015), { fov: 44 });
const S10a = (f: number) => dolly([0.6, D0 + 0.6, 99.5], [0, D0 + 1.8, 104], pushK(f, 1225, 0.0025), { fov: 44, roll: 0.04 });
const S11a = (f: number) => dolly([0.7, D0 + 0.55, 99.6], [0, D0 + 2.0, 104], pushK(f, 1322, 0.0025, 0.006, 30), { fov: 38, roll: -0.04 });
const S12a = (f: number) => dolly([0.4, D0 + 0.7, TB[2] + 3.6], [TB[0] + 0.5, D0 + 1.3, TB[2]], pushK(f, 1411, 0.0025), { fov: 42, roll: -0.03 });
const S13a = (f: number) => dolly([0.4, D0 + 0.7, SIGN[2] + 4.2], [SIGN[0] + 0.9, D0 + 1.9, SIGN[2]], pushK(f, 1523, 0.002), { fov: 42 });
const S13b = (f: number) => dolly([-1.5, D0 + 1.55, SIGN[2] + 3.8], [SIGN[0] + 0.6, D0 + 2.0, SIGN[2] + 0.6], pushK(f, 1580, 0.0025), { fov: 42, roll: 0.05 });

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: S1a }, { f: 92, dur: 30, s: S1b }],
  2: [{ f: 160, s: S2a }, { f: 270, dur: 28, s: S2b }],
  3: [{ f: 350, s: S3a }, { f: 470, dur: 30, s: S3b }],
  4: [{ f: 605, s: S4a }],
  5: [{ f: 700, s: S5a }, { f: 790, dur: 28, s: S5b }],
  6: [{ f: 915, s: S6a }],
  7: [{ f: 978, s: S7a }],
  8: [{ f: 1077, s: S8a }],
  9: [{ f: 1140, s: S9a }],
  10: [{ f: 1225, s: S10a }],
  11: [{ f: 1322, s: S11a }],
  12: [{ f: 1411, s: S12a }],
  13: [{ f: 1523, s: S13a }, { f: 1572, dur: 26, s: S13b }],
};

// impact kicks (reference v14): the image offset flips sign every frame (~3 px at 720p per unit), decays to 0 in
// 7 f, roll +-0.23 deg per unit; they start on the first frame at/after the event. No hand-held float.
export const STAMP_T = 53.15; // 'last name too' -> the SOLD stamp slams on the sign
const KICKS: [number, number][] = [[36.2, 0.6], [STAMP_T, 1.2]];
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
  { f: 0, cInf: 22, focus: () => [J[0], D0 + 1.5, J[2]] }, // hook: low close, street very soft
  { f: 160, cInf: 18, focus: () => [TB[0] + 1.3, D0 + 1.5, TB[2]] },
  { f: 350, cInf: 14, focus: () => [BD[0], D0 + 1.3, BD[2]] },
  { f: 605, cInf: 18 }, // Dec 31 insert
  { f: 700, cInf: 18, focus: () => [PH[0], D0 + 1.5, PH[2]] },
  { f: 915, cInf: 8 }, { f: 978, cInf: 5 },
  { f: 1077, cInf: 16 }, // sold-out insert
  { f: 1140, cInf: 14, focus: (f) => [0, D0 + 1.3, TEAM_Z - (f / 30 - 38.0) * 1.15] }, // team walk
  { f: 1225, cInf: 16 }, { f: 1322, cInf: 14 },
  { f: 1411, cInf: 18, focus: () => [TB[0] + 0.6, D0 + 1.5, TB[2]] },
  { f: 1523, cInf: 14 }, { f: 1572, dur: 26, cInf: 18, focus: () => [SIGN[0] + 0.8, D0 + 1.8, SIGN[2] + 0.9] },
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
