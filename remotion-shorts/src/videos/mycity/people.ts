// "My City" cast: outfits for the people of Middle and the Hollow (tall, thin, too many joints, an empty grey coat,
// a smooth empty oval for a face). Drawn in the 600 x 1000 card design space (feet on y = 975).
import { Pen, Outfit, INK, mul, shade } from "./toon";

export const KETTLE: Outfit = { jacket: "#d9773a", buttons: "#f4d27a", pants: "#3b4a6a", boots: "#4a3426", hat: "hair", hair: "#5a3420", skin: "#ffe2c2" };
export const PEBBLE: Outfit = { jacket: "#2fa39a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#f2b544", skin: "#f5c9a0", dress: "#2f8fd0" };
export const LADDER: Outfit = { jacket: "#f4f0e4", buttons: "#c9a070", pants: "#5a4a3a", boots: "#3a2a20", hat: "cap", cap: "#ffffff", skin: "#ecd0b6", moustache: "#6a4a2a", build: "stout" };
export const BRASS: Outfit = { jacket: "#c98a2a", buttons: "#ffe08a", pants: "#3b3f52", boots: "#2b2e36", hat: "tophat", skin: "#f5c9a0", moustache: "#eeeeee", build: "stout", sash: "#8c3b4a" };
export const BUTTON: Outfit = { jacket: "#e2453c", buttons: "#ffffff", pants: "#3b5b9a", boots: "#f4f1ea", hat: "hair", hair: "#2a1a10", skin: "#c99067", build: "kid" };
export const LANTERN: Outfit = { jacket: "#f3c23a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#8a3a2a", skin: "#ffe2c2", dress: "#e86a3a", build: "kid" };
export const UMBRELLA: Outfit = { jacket: "#3f6fb5", buttons: "#ffd25a", pants: "#2f3a4a", boots: "#2b2e36", hat: "hair", hair: "#1f1a18", skin: "#c99067" };
/** extra citizens / chalkers: bright work clothes */
export const CITIZEN = (v: number): Outfit => {
  const jackets = ["#7b5ac9", "#2f8a4f", "#c2413b", "#2f6fb5", "#e08a2c", "#b0479a", "#1f8f8f", "#d9a43a"];
  const skins = ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067"], hairs = ["#2a1a10", "#8a5a2a", "#c8a050", "#5a3420", "#1f1a18"];
  const o: Outfit = { jacket: jackets[v % 8], buttons: "#f4f0e4", pants: ["#3b4a6a", "#4a3f36", "#2f3a4a"][v % 3], boots: "#3a2a20", hat: v % 3 === 2 ? "cap" : "hair", cap: jackets[(v + 3) % 8], hair: hairs[v % 5], skin: skins[v % 4] };
  return v % 4 === 1 ? { ...o, dress: jackets[(v + 5) % 8] } : o;
};

const COAT = "#7f8193", COAT_D = "#5c5d6e", FACE = "#ecebe6", LIMB = "#3a3a48";
type P2 = [number, number];
/** the Hollow. phase: walk cycle 0..1 (0 = standing); reach: 0..1 one arm lifts toward the camera side;
 *  sit: on a bench holding a stick of chalk; tilt: head tilt (rad); look: -1..1 head turn */
export type HollowOpts = { phase?: number; reach?: number; sit?: boolean; tilt?: number; look?: number; chalk?: boolean; light?: number };
export const hollow = (p: Pen, o: HollowOpts = {}) => {
  const ph = o.phase ?? 0, two = Math.PI * 2, walk = ph > 0 ? Math.sin(two * ph) : 0, sit = !!o.sit;
  const cx = 300, hemY = sit ? 640 : 735, shY = 205, bob = ph > 0 ? 6 * Math.cos(2 * two * ph) : 0;
  // legs: thin, two joints each, long feet
  const legs: [P2[], number][] = [];
  for (const s of [-1, 1]) {
    const hip: P2 = [cx + s * 40, hemY - 40];
    if (sit) legs.push([[hip, [cx + s * 70, 690], [cx + s * 82, 820], [cx + s * 74, 975], [cx + s * 74 + 40, 975]], s]);
    else {
      const sw = s * walk * 36;
      const knee: P2 = [cx + s * 46 + sw * 0.6, 860 + bob], ank: P2 = [cx + s * 40 + sw, 970];
      legs.push([[hip, knee, ank, [ank[0] + 46, 975]], s]);
    }
  }
  for (const [pts] of legs) { p.stroke(pts, 20, INK); p.stroke(pts, 12, LIMB); }
  // coat: long, shoulders narrow, hem wide and ragged; empty dark collar
  const hem: P2[] = [];
  for (let i = 0; i <= 10; i++) { const u = i / 10; hem.push([cx + 128 - u * 256 + walk * 10, hemY + (i % 2 ? 24 : 0) + bob]); }
  const body: P2[] = [[cx - 70, shY + 20 + bob], [cx - 92, shY + 5 + bob], [cx + 92, shY + 5 + bob], [cx + 70, shY + 20 + bob], ...hem];
  body.splice(4, 0); // keep order: shoulders then hem from right to left
  const coat: P2[] = [[cx - 88, shY + bob], [cx + 88, shY + bob], [cx + 128 + walk * 10, hemY + bob], ...hem.slice(1, -1), [cx - 128 + walk * 10, hemY + bob]];
  p.gradFill(coat, COAT, COAT_D, o.light ?? -2.2);
  p.poly(coat, null, 6);
  // seam + two big buttons + pockets
  p.stroke([[cx + 6, shY + 40 + bob], [cx + 14 + walk * 6, hemY - 6 + bob]], 4, mul(COAT_D, [0.8, 0.8, 0.85]));
  for (const y of [330, 450]) { p.dot(cx + 34, y + bob, 10, INK); p.dot(cx + 34, y + bob, 7, "#4a4b5a"); }
  for (const s of [-1, 1]) p.poly([[cx + s * 40, 520 + bob], [cx + s * 96, 515 + bob], [cx + s * 98, 560 + bob], [cx + s * 42, 565 + bob]], shade(COAT, 0.86), 4);
  // collar: a dark hollow where a neck should be
  p.ell(cx, shY + 2 + bob, 52, 18, "#1c1b26", 6);
  // arms: too many joints, hanging to the knees (one may reach)
  const reach = o.reach ?? 0;
  for (const s of [-1, 1]) {
    const S: P2 = [cx + s * 86, shY + 16 + bob];
    const lift = s > 0 ? reach : 0, sw2 = -s * walk * 0.25;
    const pts: P2[] = [S];
    let x = S[0], y = S[1], a = Math.PI / 2 + s * 0.12 + sw2 - lift * (Math.PI / 2 + 0.3) * s * -1;
    for (let k = 0; k < 5; k++) {
      const seg = 108 - k * 6, bend = (k % 2 ? 1 : -1) * 0.38 * s;
      a += bend * (1 - lift * 0.6);
      x += Math.cos(a) * seg * (s > 0 && lift ? 1 : 1); y += Math.sin(a) * seg;
      if (sit) y = Math.min(y, 690);
      pts.push([x, y]);
    }
    p.stroke(pts, 22, INK); p.stroke(pts, 13, COAT_D);
    for (const q of pts.slice(1, -1)) p.dot(q[0], q[1], 10, INK), p.dot(q[0], q[1], 6, LIMB);
    // long fingers
    const [hx, hy] = pts[pts.length - 1];
    for (let f = -1.5; f <= 1.5; f++) { const fa = a + f * 0.22; p.stroke([[hx, hy], [hx + Math.cos(fa) * 46, hy + Math.sin(fa) * 46]], 8, INK); p.stroke([[hx, hy], [hx + Math.cos(fa) * 44, hy + Math.sin(fa) * 44]], 4, LIMB); }
    if (o.chalk && s > 0) { p.poly([[hx - 8, hy - 30], [hx + 8, hy - 32], [hx + 10, hy + 6], [hx - 6, hy + 8]], "#ffffff", 4); }
  }
  // neck + head: a smooth empty oval
  const tilt = o.tilt ?? 0, look = o.look ?? 0, hx = cx + look * 14, hy = 110 + bob;
  p.stroke([[cx, shY + bob], [hx, hy + 60]], 16, INK); p.stroke([[cx, shY + bob], [hx, hy + 60]], 9, LIMB);
  p.ell(hx, hy, 50, 72, FACE, 7, 0, 360, tilt * 57.3);
  p.ell(hx - 16 + look * 10, hy - 26, 14, 24, "rgba(255,255,255,0.7)", 0, 0, 360, tilt * 57.3 - 15);
  p.ell(hx + 10, hy + 22, 34, 40, "rgba(150,150,170,0.18)", 0, 0, 360, tilt * 57.3);
};

/** small props drawn as cards */
export const kettleProp = (p: Pen, cold = false) => {
  const c = cold ? "#a8673a" : "#e08a3a", d = cold ? "#7a4422" : "#b0602a";
  p.ell(150, 150, 92, 70, c, 7);
  p.ell(150, 150, 92, 70, null, 7);
  p.poly([[230, 140], [292, 92], [300, 104], [244, 168]], c, 6);         // spout
  p.arc(150, 90, 70, 60, 200, 340, 14, INK); p.arc(150, 90, 70, 60, 200, 340, 8, d); // handle
  p.ell(150, 84, 34, 12, d, 6); p.dot(150, 70, 10, INK); p.dot(150, 70, 6, d);
  p.ell(118, 128, 22, 30, "rgba(255,255,255,0.45)", 0);
  p.ell(150, 214, 86, 12, d, 5);
  if (!cold) for (let k = 0; k < 3; k++) p.arc(150 + (k - 1) * 30, 20 - k * 4, 12, 18, 200, 340, 5, "rgba(255,255,255,0.8)");
};
export const chalkArrow = (p: Pen, flip = false, wobble = 0) => {
  const s = flip ? -1 : 1, c = "#ffffff";
  const pts: P2[] = [[200 - s * 150, 110 + wobble], [200 + s * 110, 110 - wobble]];
  p.stroke(pts, 16, c);
  p.stroke([[200 + s * 110, 110 - wobble], [200 + s * 60, 60]], 16, c);
  p.stroke([[200 + s * 110, 110 - wobble], [200 + s * 60, 160]], 16, c);
};
/** chalk handwriting on a wall: lines of text, getting messier with `mess` */
export const chalkText = (p: Pen, lines: string[], mess = 0) => {
  const g = (p as unknown as { g: CanvasRenderingContext2D }).g;
  g.save(); g.fillStyle = "#ffffff"; g.textBaseline = "top";
  lines.forEach((l, i) => {
    g.save(); g.translate(30, 30 + i * 90); g.rotate((mess * (i % 2 ? 1 : -1) * 0.06)); g.font = `${700 - mess * 200} ${62 + mess * 10}px "Comic Sans MS", "Chalkboard", cursive`;
    g.globalAlpha = 0.95 - mess * 0.15; g.fillText(l, 0, 0); g.restore();
  });
  g.restore();
};
export const tallyMarks = (p: Pen, n: number, seed = 1) => {
  let x = 20, y = 20, k = 0;
  const r = (i: number) => { const v = Math.sin(i * 91.3 + seed * 7.1) * 43758.5; return v - Math.floor(v); };
  while (k < n) {
    const g = Math.min(5, n - k);
    for (let i = 0; i < Math.min(4, g); i++) p.stroke([[x + i * 12, y + r(k + i) * 4], [x + i * 12 + 2, y + 44]], 4, "#3a2a24");
    if (g === 5) p.stroke([[x - 6, y + 36], [x + 46, y + 8]], 4, "#3a2a24");
    k += g; x += 70;
    if (x > 940) { x = 20 + r(k) * 10; y += 66; }
  }
};
