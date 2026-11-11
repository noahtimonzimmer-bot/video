// Story props for "The Shirt Guy" drawn with the bridge short's Pen (same plum ink, flat fills): diegetic text only.
import { Pen, INK } from "./toon";
type P2 = [number, number];
const rr = (x0: number, y0: number, x1: number, y1: number, r: number): P2[] => {
  const pts: P2[] = [];
  const c = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = ((a0 + i * 15) * Math.PI) / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  c(x1 - r, y0 + r, 270); c(x1 - r, y1 - r, 0); c(x0 + r, y1 - r, 90); c(x0 + r, y0 + r, 180);
  return pts;
};
const txt = (p: Pen, s: string, x: number, y: number, size: number, col = INK, weight = 800) => {
  const g = p.g; g.font = `${weight} ${size}px "DejaVu Sans", Arial, sans-serif`; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
};
export const SHIRTS = ["#e8453c", "#2f7fd8", "#f2b21a", "#2fa860", "#8a4ad0", "#ff7a2a", "#18b8c8", "#e85aa0"];

/** garden table with an open laptop (600 x 420); glow 0..1 lights the screen */
export const fxTable = (p: Pen, glow = 0) => {
  p.poly(rr(40, 230, 560, 268, 10), "#b9824d", 10);
  for (const x of [90, 510]) p.poly([[x - 12, 266], [x + 12, 266], [x + 8, 410], [x - 8, 410]], "#8d5c33", 9);
  p.poly([[180, 232], [420, 232], [440, 248], [160, 248]], "#c9ccd6", 8);
  p.poly(rr(196, 70, 404, 232, 10), "#3a3f4c", 10);
  p.poly(rr(212, 86, 388, 218, 6), glow > 0 ? `rgb(${120 + 100 * glow},${200 + 40 * glow},${255})` : "#9fc7f0", 0);
  for (let i = 0; i < 4; i++) p.poly(rr(228, 104 + i * 26, 372 - i * 30, 116 + i * 26, 4), "#ffffff", 0);
};
/** the website as a big easel board (800 x 900): 2009 calendar, every day for sale. hi = highlighted cell index
 *  (0 = Jan 1, 1 = Jan 2, 34 = Dec 31), sold = 0..1 share of cells stamped SOLD */
export const fxBoard = (p: Pen, hi = -1, sold = 0) => {
  for (const [a, b] of [[[220, 860], [300, 560]], [[580, 860], [500, 560]], [[400, 880], [400, 600]]] as [P2, P2][]) p.stroke([a, b], 22, "#8d5c33");
  p.poly(rr(40, 30, 760, 700, 26), "#fbf7ec", 14);
  p.poly(rr(40, 30, 760, 130, 26), "#2f7fd8", 14);
  txt(p, "BUY A DAY · 2009", 400, 82, 54, "#ffffff");
  const cols = 7, rows = 5, x0 = 76, y0 = 160, cw = 93, ch = 100;
  for (let i = 0; i < cols * rows; i++) {
    const cx = x0 + (i % cols) * cw, cy = y0 + Math.floor(i / cols) * ch, last = i === cols * rows - 1;
    const isHi = i === hi || (hi === 34 && last);
    p.poly(rr(cx, cy, cx + cw - 10, cy + ch - 12, 10), isHi ? "#ffd84a" : "#ffffff", 6);
    const price = last ? "$365" : i === 0 ? "$1" : i === 1 ? "$2" : `$${i + 1 + Math.floor(i / 7) * 40}`;
    txt(p, price, cx + (cw - 10) / 2, cy + (ch - 12) / 2 + 2, isHi ? 34 : 26, isHi ? "#c4281c" : "#3a3f4c");
    if (i < Math.floor(sold * cols * rows + 0.001)) {
      const g = p.g; g.save(); g.translate(cx + cw / 2 - 5, cy + ch / 2 - 6); g.rotate(-0.35);
      g.strokeStyle = "#d42f2f"; g.lineWidth = 6; g.strokeRect(-40, -16, 80, 32); txt(p, "SOLD", 0, 1, 24, "#d42f2f"); g.restore();
    }
  }
};
/** photo camera on a tripod, side view looking left (300 x 500) */
export const fxTripod = (p: Pen, flash = 0) => {
  for (const [a, b] of [[[150, 250], [60, 490]], [[150, 250], [240, 490]], [[150, 250], [150, 495]]] as [P2, P2][]) p.stroke([a, b], 12, "#3a3f4c");
  p.poly(rr(70, 150, 240, 250, 18), "#2b2e36", 10);
  p.ell(78, 200, 34, 34, "#5d6472", 10);
  p.ell(78, 200, 18, 18, "#9fc7f0", 6);
  p.poly(rr(180, 120, 228, 150, 6), "#c9ccd6", 8);
  if (flash > 0) { p.g.globalAlpha = flash; p.ell(60, 200, 70, 70, "#fffbe0", 0); p.g.globalAlpha = 1; }
};
/** clothes rail full of coloured T-shirts (700 x 520) */
export const fxRack = (p: Pen) => {
  p.stroke([[60, 60], [640, 60]], 14, "#8a8e9a");
  for (const x of [60, 640]) p.stroke([[x, 60], [x, 500]], 14, "#8a8e9a");
  p.stroke([[30, 500], [90, 500]], 14, "#8a8e9a"); p.stroke([[610, 500], [670, 500]], 14, "#8a8e9a");
  for (let i = 0; i < 8; i++) {
    const x = 100 + i * 66, c = SHIRTS[i % SHIRTS.length];
    p.stroke([[x, 60], [x, 86]], 6, INK);
    p.poly([[x - 40, 96], [x - 14, 86], [x + 14, 86], [x + 40, 96], [x + 52, 140], [x + 30, 150], [x + 28, 290], [x - 28, 290], [x - 30, 150], [x - 52, 140]], c, 8);
  }
};
/** light bulb idea pop (300 x 400), t 0..1 */
export const fxBulb = (p: Pen, t: number) => {
  const s = Math.min(1, t * 4), g = p.g; g.save(); g.translate(150, 210); g.scale(s, s); g.translate(-150, -210);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; p.stroke([[150 + 110 * Math.cos(a), 170 + 110 * Math.sin(a)], [150 + 140 * Math.cos(a), 170 + 140 * Math.sin(a)]], 12, "#ffcf3a"); }
  p.ell(150, 170, 80, 84, "#ffe25a", 12);
  p.poly(rr(110, 240, 190, 300, 10), "#a8acb8", 10);
  p.stroke([[120, 320], [180, 320]], 12, INK);
  g.restore();
};
/** coin / bill shower (500 x 500), t 0..1 */
export const fxCoins = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3, r = 40 + 190 * t, x = 250 + r * Math.cos(a), y = 250 + r * Math.sin(a) + 160 * t * t;
    if (i % 3 === 0) { p.poly(rr(x - 40, y - 20, x + 40, y + 20, 6), "#9ad07a", 7); txt(p, "$", x, y + 1, 26, "#2a6a2a"); }
    else { p.ell(x, y, 26, 26, "#ffd23a", 7); txt(p, "$", x, y + 1, 26, "#b8860b"); }
  }
};
/** wooden house name sign (700 x 330); stamp 0..1 slams a red SOLD across it */
export const fxNameSign = (p: Pen, stamp = 0) => {
  for (const x of [130, 570]) p.stroke([[x, 10], [x, 70]], 8, "#5a5f6c");
  p.poly(rr(30, 60, 670, 300, 24), "#c99a5e", 12);
  p.poly(rr(50, 80, 650, 280, 16), "#d9ae72", 0);
  const g0 = p.g; g0.save(); g0.globalAlpha = 1 - 0.75 * Math.min(1, stamp * 3); txt(p, "SADLER", 350, 182, 110, "#3a2414", 900); g0.restore();
  if (stamp > 0) {
    const s = 1.6 - 0.6 * Math.min(1, stamp * 3), g = p.g; g.save(); g.translate(350, 180); g.rotate(-0.22); g.scale(s, s); g.globalAlpha = Math.min(1, stamp * 3);
    g.fillStyle = "rgba(255,244,222,.92)"; g.fillRect(-230, -70, 460, 140); g.strokeStyle = "#d42f2f"; g.lineWidth = 16; g.strokeRect(-230, -70, 460, 140); txt(p, "SOLD", 0, 4, 110, "#d42f2f", 900); g.restore();
  }
};
