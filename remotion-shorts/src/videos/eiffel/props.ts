// Story props for "The Man Who Sold the Eiffel Tower", drawn with the bridge short's Pen (plum ink, flat fills).
// Diegetic text only (newspaper, signs, plan), no captions.
import { Pen, INK } from "./toon";
type P2 = [number, number];
const rr = (x0: number, y0: number, x1: number, y1: number, r: number): P2[] => {
  const pts: P2[] = [];
  const c = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = ((a0 + i * 15) * Math.PI) / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  c(x1 - r, y0 + r, 270); c(x1 - r, y1 - r, 0); c(x0 + r, y1 - r, 90); c(x0 + r, y0 + r, 180);
  return pts;
};
const txt = (p: Pen, s: string, x: number, y: number, size: number, col = INK, weight = 800, font = '"DejaVu Sans", Arial, sans-serif') => {
  const g = p.g; g.font = `${weight} ${size}px ${font}`; g.fillStyle = col; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y);
};
const SERIF = '"DejaVu Serif", Georgia, serif';
/** little tower icon (centre x, base y, height h) */
const towerIcon = (p: Pen, x: number, y: number, h: number, col: string, lw = 8, rust = false) => {
  const w = h * 0.42;
  const L: P2[] = [[x - w, y], [x - w * 0.55, y - h * 0.22], [x - w * 0.3, y - h * 0.42], [x - w * 0.08, y - h * 0.86], [x, y - h]];
  const R: P2[] = L.map(([a, b]) => [2 * x - a, b] as P2).reverse();
  p.poly([...L, ...R], col, lw);
  p.poly([[x - w * 0.62, y - h * 0.2], [x + w * 0.62, y - h * 0.2], [x + w * 0.62, y - h * 0.25], [x - w * 0.62, y - h * 0.25]], INK, 0);
  p.poly([[x - w * 0.36, y - h * 0.4], [x + w * 0.36, y - h * 0.4], [x + w * 0.36, y - h * 0.44], [x - w * 0.36, y - h * 0.44]], INK, 0);
  p.arc(x, y, w * 0.5, h * 0.16, 180, 360, lw * 0.8);
  if (rust) for (const [dx, dy, r] of [[-0.35, -0.12, 0.07], [0.3, -0.3, 0.06], [-0.12, -0.6, 0.05], [0.2, -0.08, 0.05]]) p.ell(x + dx * h, y + dy * h, r * h, r * h * 0.8, "#c8582a", 0);
};

/** the morning paper (700 x 900): headline about the rusting tower */
export const fxNewspaper = (p: Pen) => {
  p.poly(rr(20, 20, 680, 880, 14), "#f6f0de", 12);
  txt(p, "LE MATIN", 350, 92, 92, INK, 900, SERIF);
  p.stroke([[50, 150], [650, 150]], 6, INK); txt(p, "PARIS · MAY 1925", 350, 176, 30, "#5a5060", 700); p.stroke([[50, 200], [650, 200]], 4, INK);
  txt(p, "EIFFEL TOWER", 350, 262, 74, "#c4281c", 900, SERIF);
  txt(p, "IS RUSTING!", 350, 340, 74, "#c4281c", 900, SERIF);
  txt(p, "Repairs cost a fortune", 350, 410, 38, "#3a3f4c", 700, SERIF);
  p.poly(rr(60, 450, 380, 840, 10), "#e9e1c8", 6);
  towerIcon(p, 220, 810, 320, "#9a6440", 7, true);
  for (let i = 0; i < 11; i++) { const y = 470 + i * 34; p.stroke([[410, y], [i % 4 === 3 ? 560 : 640, y]], 9, "#b9b2a0"); }
};
/** writing desk with the forged letters, a stamp and an ink pot (600 x 420) */
export const fxDesk = (p: Pen) => {
  p.poly(rr(30, 220, 570, 262, 10), "#9a5f36", 10);
  for (const x of [80, 520]) p.poly([[x - 14, 260], [x + 14, 260], [x + 10, 410], [x - 10, 410]], "#7a4a2a", 9);
  for (let i = 0; i < 5; i++) p.poly(rr(110 + i * 5, 170 - i * 9, 300 + i * 5, 222 - i * 9, 4), "#fbf7ec", 6);
  p.ell(214, 150, 16, 16, "#c4281c", 5);
  p.poly(rr(360, 150, 420, 222, 8), "#3a3f4c", 8); p.ell(390, 150, 40, 16, "#5d6472", 8);
  p.poly(rr(450, 170, 520, 222, 12), "#2b2e36", 8);
  p.stroke([[470, 172], [520, 70]], 6, "#f1efe6"); p.poly([[515, 80], [545, 40], [528, 90]], "#f1efe6", 5);
};
/** official envelope with a red wax seal (400 x 280) */
export const fxLetter = (p: Pen, col = "#fbf7ec") => {
  p.poly(rr(20, 20, 380, 260, 10), col, 10);
  p.stroke([[20, 30], [200, 150], [380, 30]], 8, INK);
  p.ell(200, 150, 34, 34, "#c4281c", 7); txt(p, "RF", 200, 152, 26, "#ffe6d8", 900, SERIF);
};
/** hotel sign on the facade (900 x 300) */
export const fxHotelSign = (p: Pen) => {
  for (const x of [170, 730]) p.stroke([[x, 6], [x, 60]], 8, "#5a5f6c");
  p.poly(rr(20, 50, 880, 280, 26), "#1f5a46", 12);
  p.poly(rr(40, 70, 860, 260, 18), "#25705a", 0);
  txt(p, "GRAND HOTEL", 450, 168, 96, "#f2c45a", 900, SERIF);
  for (const x of [80, 820]) p.ell(x, 165, 16, 16, "#f2c45a", 5);
};
/** easel plan of the tower (800 x 900): "7,000 TONS" */
export const fxPlan = (p: Pen, hi = 0) => {
  for (const [a, b] of [[[220, 860], [300, 560]], [[580, 860], [500, 560]], [[400, 880], [400, 600]]] as [P2, P2][]) p.stroke([a, b], 22, "#8d5c33");
  p.poly(rr(40, 30, 760, 720, 20), "#2f6fc0", 14);
  const g = p.g; g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2;
  for (let x = 80; x < 760; x += 40) { g.beginPath(); g.moveTo(x, 50); g.lineTo(x, 700); g.stroke(); }
  for (let y = 70; y < 720; y += 40) { g.beginPath(); g.moveTo(60, y); g.lineTo(740, y); g.stroke(); }
  towerIcon(p, 250, 660, 560, "#2f6fc0", 7);
  g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(60, 660); g.lineTo(740, 660); g.stroke(); g.setLineDash([]);
  txt(p, "SCRAP", 560, 200, 64, "#ffffff", 900);
  txt(p, "IRON", 560, 270, 52, "#cfe4ff", 800);
  p.poly(rr(420, 340, 720, 470, 14), hi > 0 ? "#ffd84a" : "#fbf7ec", 8);
  txt(p, "7,000 TONS", 570, 406, 50, "#c4281c", 900);
};
/** thought cloud: the people riot (600 x 460), t 0..1 pops it in */
export const fxRiot = (p: Pen, t: number) => {
  const s = Math.min(1, t * 3), g = p.g; g.save(); g.translate(300, 420); g.scale(s, s); g.translate(-300, -420);
  for (const [x, y, r] of [[150, 200, 110], [300, 150, 140], [450, 200, 110], [230, 280, 110], [380, 280, 110]] as [number, number, number][]) p.ell(x, y, r, r * 0.8, "#ffffff", 10);
  for (const [x, y, r] of [[150, 200, 108], [300, 150, 138], [450, 200, 108], [230, 280, 108], [380, 280, 108]] as [number, number, number][]) p.ell(x, y, r - 8, r * 0.8 - 8, "#ffffff", 0);
  p.ell(270, 400, 26, 20, "#ffffff", 8); p.ell(300, 440, 14, 11, "#ffffff", 6);
  towerIcon(p, 300, 300, 200, "#9a6440", 6);
  for (let i = 0; i < 6; i++) {
    const x = 140 + i * 64, y = 300, c = ["#e8453c", "#2f7fd8", "#f2b21a", "#2fa860", "#8a4ad0", "#ff7a2a"][i];
    p.ell(x, y - 10, 22, 22, "#fbe3cc", 6); p.stroke([[x - 8, y - 18], [x - 2, y - 12]], 5, INK); p.stroke([[x + 8, y - 18], [x + 2, y - 12]], 5, INK);
    p.poly(rr(x - 22, y + 12, x + 22, y + 60, 12), c, 6);
    p.stroke([[x + 22, y + 20], [x + 30, y - 60]], 6, "#8d5c33");
    if (i % 2) { p.stroke([[x + 18, y - 60], [x + 18, y - 82]], 5, "#5d6472"); p.stroke([[x + 30, y - 60], [x + 30, y - 84]], 5, "#5d6472"); p.stroke([[x + 42, y - 60], [x + 42, y - 82]], 5, "#5d6472"); p.stroke([[x + 18, y - 60], [x + 42, y - 60]], 5, "#5d6472"); }
    else p.ell(x + 30, y - 72, 12, 16, "#ffb02a", 5);
  }
  g.restore();
};
/** leather suitcase (500 x 380), open = 0..1 shows the cash inside */
export const fxCase = (p: Pen, open = 0) => {
  p.poly(rr(170, 40, 330, 110, 20), "#5a3a22", 10);
  p.poly(rr(30, 90, 470, 350, 22), "#8a5530", 12);
  p.stroke([[30, 160], [470, 160]], 8, "#6a3f22");
  for (const x of [120, 380]) p.poly(rr(x - 18, 140, x + 18, 180, 4), "#e0b25a", 6);
  if (open > 0) {
    p.poly(rr(50, 180, 450, 330, 10), "#6a3f22", 6);
    for (let i = 0; i < 6; i++) { const x = 70 + (i % 3) * 126, y = 196 + Math.floor(i / 3) * 64; p.poly(rr(x, y, x + 112, y + 54, 6), "#9ad07a", 6); txt(p, "F", x + 56, y + 28, 30, "#2a6a2a", 900, SERIF); }
  }
};
/** the dealers' café terrace table (900 x 360) with cups */
export const fxTerrace = (p: Pen) => {
  p.poly(rr(30, 150, 870, 190, 10), "#fbf7ec", 9);
  p.poly([[40, 186], [860, 186], [840, 220], [60, 220]], "#e9e1c8", 8);
  for (const x of [110, 790]) p.poly([[x - 12, 218], [x + 12, 218], [x + 9, 350], [x - 9, 350]], "#3a3f4c", 8);
  for (const x of [200, 330, 470, 620, 740]) { p.poly(rr(x - 26, 108, x + 26, 152, 8), "#ffffff", 7); p.ell(x + 34, 128, 12, 14, "#ffffff", 6); p.poly(rr(x - 40, 146, x + 40, 156, 4), "#ffffff", 5); }
};
/** small round café table for the paper (420 x 380) */
export const fxCafe = (p: Pen) => {
  p.ell(210, 150, 190, 40, "#fbf7ec", 10);
  p.poly([[198, 186], [222, 186], [222, 340], [198, 340]], "#3a3f4c", 8);
  p.ell(210, 350, 90, 20, "#3a3f4c", 8);
  p.poly(rr(250, 96, 300, 140, 8), "#ffffff", 7); p.ell(310, 116, 12, 14, "#ffffff", 6);
  p.poly([[110, 140], [170, 140], [180, 120], [100, 120]], "#e0b25a", 6);
};
/** a steam train seen from the side (1800 x 600): locomotive + carriage; puff 0..1 animates the smoke */
export const fxTrain = (p: Pen, puff = 0) => {
  // carriage
  p.poly(rr(40, 150, 980, 470, 26), "#2f6a4a", 12);
  p.poly(rr(40, 120, 980, 170, 20), "#24543a", 10);
  for (let i = 0; i < 6; i++) p.poly(rr(90 + i * 148, 210, 200 + i * 148, 330, 14), "#cfe9ff", 9);
  p.stroke([[40, 380], [980, 380]], 8, "#e0b25a");
  // locomotive
  p.poly(rr(1000, 220, 1640, 470, 30), "#2b2e36", 12);
  p.poly(rr(1000, 130, 1240, 470, 20), "#c4281c", 12);
  p.poly(rr(1050, 170, 1190, 280, 12), "#cfe9ff", 8);
  p.poly(rr(1240, 230, 1640, 380, 70), "#3a3f4c", 12);
  p.poly(rr(1500, 120, 1570, 240, 10), "#2b2e36", 10);
  p.poly(rr(1480, 100, 1590, 130, 10), "#2b2e36", 10);
  p.poly([[1640, 420], [1740, 470], [1640, 470]], "#c4281c", 8);
  p.ell(1380, 220, 30, 30, "#e0b25a", 8);
  for (const x of [160, 420, 700, 900, 1120, 1300, 1480]) { p.ell(x, 480, x > 1100 ? 66 : 50, x > 1100 ? 66 : 50, "#3a3f4c", 10); p.ell(x, 480, 18, 18, "#e0b25a", 6); }
  p.stroke([[1120, 480], [1480, 480]], 12, "#9a9ea8");
  for (let i = 0; i < 4; i++) { const u = (puff + i / 4) % 1, r = 30 + 50 * u; p.g.globalAlpha = 1 - u * 0.8; p.ell(1535 - 260 * u, 90 - 70 * u - i * 4, r, r * 0.8, "#ffffff", 8); p.g.globalAlpha = 1; }
};
/** enamel police sign (700 x 240) */
export const fxPoliceSign = (p: Pen) => {
  for (const x of [130, 570]) p.stroke([[x, 6], [x, 50]], 8, "#5a5f6c");
  p.poly(rr(20, 40, 680, 230, 20), "#1f3f8a", 12);
  p.poly(rr(36, 56, 664, 214, 12), "#ffffff", 0);
  p.poly(rr(48, 68, 652, 202, 10), "#1f3f8a", 0);
  txt(p, "POLICE", 350, 138, 100, "#ffffff", 900);
};
/** money shower (500 x 500), t 0..1: franc notes and gold coins */
export const fxCoins = (p: Pen, t: number) => {
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3, r = 40 + 190 * t, x = 250 + r * Math.cos(a), y = 250 + r * Math.sin(a) + 160 * t * t;
    if (i % 3 !== 0) { p.poly(rr(x - 44, y - 22, x + 44, y + 22, 6), "#9ad07a", 7); txt(p, "F", x, y + 1, 26, "#2a6a2a", 900, SERIF); }
    else { p.ell(x, y, 26, 26, "#ffd23a", 7); txt(p, "F", x, y + 1, 24, "#b8860b", 900, SERIF); }
  }
};
/** handshake / deal sparkle stand-in: an exclamation "!" pop (200 x 300) for the shocked buyer */
export const fxBang = (p: Pen, t: number) => {
  const s = Math.min(1, t * 4), g = p.g; g.save(); g.translate(100, 160); g.scale(s, s); g.translate(-100, -160);
  p.poly([[70, 20], [130, 20], [116, 200], [84, 200]], "#ffd84a", 10); p.ell(100, 250, 26, 26, "#ffd84a", 10); g.restore();
};
/** the second dealer's pointing police whistle sound lines (300 x 200) */
export const fxLines = (p: Pen, t: number) => {
  for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5, r0 = 30 + 30 * t, r1 = 80 + 50 * t; p.stroke([[150 + r0 * Math.cos(a), 100 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 100 + r1 * Math.sin(a)]], 12, "#ffffff"); }
};
