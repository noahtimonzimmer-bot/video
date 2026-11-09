// pixelgrid.js — REUSABLE "million dollar homepage"-style ad grid: deterministic packing of 100×100 cells
// (1 cell = 10×10 px = $100) into colourful ad blocks with generic words, a browser-window frame, and newspapers.
import { rng, rr, text, alpha, shade } from '/engine/core.js';
const WORDS = ['PIZZA', 'HOTEL', 'SHOES', 'GAMES', 'TRAVEL', 'CARS', 'BOOKS', 'TOYS', 'WIN!', '$$$', 'LOANS', 'PHONES', 'FLOWERS', 'MUSIC', 'POKER', 'DIET', 'JOBS', 'DATING', 'SURF', 'TECH', 'FREE', 'SALE', 'HOST', 'ART', 'GOLF'];
const COLS = ['#ff3b3b', '#ffcf1a', '#2ad16a', '#2a8aff', '#ff6ad5', '#9a4aff', '#ff8a1a', '#1ad8d8', '#111111', '#ffffff', '#c8ff2a', '#e0202a', '#1a4ad8'];
export const RESERVED = { x: 61, y: 46, w: 5, h: 2 };   // the "last 1,000 pixels" (10 cells)
let _blocks = null;
export function blocks() {
  if (_blocks) return _blocks; const r = rng(2005), N = 100, occ = new Uint8Array(N * N), out = [];
  for (let y = RESERVED.y; y < RESERVED.y + RESERVED.h; y++) for (let x = RESERVED.x; x < RESERVED.x + RESERVED.w; x++) occ[y * N + x] = 2;
  const free = (x, y, w, h) => { if (x + w > N || y + h > N) return false; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (occ[yy * N + xx]) return false; return true; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (occ[y * N + x]) continue; let w = 1 + Math.floor(r() ** 2.2 * 7), h = 1 + Math.floor(r() ** 2.2 * 6); while (!free(x, y, w, h)) { if (w > 1) w--; else if (h > 1) h--; else break; }
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) occ[yy * N + xx] = 1; out.push({ x, y, w, h, c: COLS[Math.floor(r() * COLS.length)], c2: COLS[Math.floor(r() * COLS.length)], word: WORDS[Math.floor(r() * WORDS.length)], k: Math.floor(r() * 5), o: r() }); }
  out.sort((a, b) => a.o - b.o); return (_blocks = out);
}
// draw grid into box (x,y,size); fill 0..1 = fraction of blocks shown; o.hi = highlight reserved area; o.reservedFilled
export function paintGrid(g, X, Y, S, fill, o = {}) {
  const B = blocks(), c = S / 100, n = Math.floor(B.length * Math.min(1, fill));
  g.fillStyle = '#ffffff'; g.fillRect(X, Y, S, S);
  if (o.lines !== false && fill < 0.2) { g.strokeStyle = 'rgba(0,0,0,.06)'; g.lineWidth = 1; for (let i = 0; i <= 100; i += 10) { g.beginPath(); g.moveTo(X + i * c, Y); g.lineTo(X + i * c, Y + S); g.moveTo(X, Y + i * c); g.lineTo(X + S, Y + i * c); g.stroke(); } }
  for (let i = 0; i < n; i++) { const b = B[i], x = X + b.x * c, y = Y + b.y * c, w = b.w * c, h = b.h * c; g.fillStyle = b.c; g.fillRect(x, y, w, h);
    if (w > 6 && h > 6) { if (b.k === 0) { g.fillStyle = b.c2; g.fillRect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7); } else if (b.k === 1) { g.fillStyle = b.c2; g.beginPath(); g.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.35, 0, 7); g.fill(); } else if (b.k === 2) { g.fillStyle = b.c2; g.fillRect(x, y + h * 0.6, w, h * 0.4); } }
    if (w > 26 && h > 12) { g.fillStyle = b.c === '#ffffff' || b.c === '#ffcf1a' || b.c === '#c8ff2a' || b.c === '#1ad8d8' ? '#111111' : '#ffffff'; g.font = `bold ${Math.min(h * 0.6, w / (b.word.length * 0.62))}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.word, x + w / 2, y + h / 2 + 1); }
    if (o.newest && i > n - 30) { g.strokeStyle = alpha('#ffffff', (i - (n - 30)) / 30); g.lineWidth = 2; g.strokeRect(x, y, w, h); } }
  const R = RESERVED; if (o.reservedFilled) { g.fillStyle = '#ffcf1a'; g.fillRect(X + R.x * c, Y + R.y * c, R.w * c, R.h * c); g.fillStyle = '#111'; g.font = `bold ${c * 1.2}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOLD!', X + (R.x + R.w / 2) * c, Y + (R.y + R.h / 2) * c); }
  if (o.hi) { g.strokeStyle = '#ff2a2a'; g.lineWidth = Math.max(3, c * 0.5); g.strokeRect(X + R.x * c - 2, Y + R.y * c - 2, R.w * c + 4, R.h * c + 4); }
}
// a browser window with the site header + grid
export function paintSite(g, X, Y, W, fill, o = {}) {
  const H = W * 1.18, head = W * 0.1, bar = W * 0.06; rr(g, X, Y, W, H, W * 0.03); g.fillStyle = '#e8eaf0'; g.fill(); g.lineWidth = Math.max(3, W * 0.008); g.strokeStyle = '#2a2a34'; g.stroke();
  for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff5a52', '#ffbd2e', '#28c840'][i]; g.beginPath(); g.arc(X + bar * 0.6 + i * bar * 0.55, Y + bar * 0.5, bar * 0.17, 0, 7); g.fill(); }
  rr(g, X + bar * 2.4, Y + bar * 0.22, W - bar * 2.8, bar * 0.56, bar * 0.28); g.fillStyle = '#ffffff'; g.fill(); g.fillStyle = '#5a5a6a'; g.font = `${bar * 0.32}px sans-serif`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(o.url || 'www.milliondollarhomepage.com', X + bar * 2.65, Y + bar * 0.5);
  const gy = Y + bar; g.fillStyle = '#2a3a8a'; g.fillRect(X + 2, gy, W - 4, head); g.fillStyle = '#ffd84a'; g.font = `bold ${head * 0.38}px sans-serif`; g.textAlign = 'left'; g.fillText('The Million Dollar Homepage', X + W * 0.04, gy + head * 0.4); g.fillStyle = '#ffffff'; g.font = `${head * 0.22}px sans-serif`; g.fillText('1,000,000 pixels · $1 per pixel', X + W * 0.04, gy + head * 0.78);
  const S = W - W * 0.06; paintGrid(g, X + W * 0.03, gy + head + W * 0.02, S, fill, o);
}
export function newspaper(g, x, y, s, rot, head, sub, seed = 1) { const r = rng(seed); g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = '#f4f0e4'; g.fillRect(-170, -220, 340, 440); g.strokeStyle = '#2a2a34'; g.lineWidth = 4; g.strokeRect(-170, -220, 340, 440);
  g.fillStyle = '#1a1a22'; g.font = 'bold 30px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(['THE DAILY NEWS', 'THE TIMES', 'MORNING POST'][seed % 3], 0, -190); g.fillRect(-160, -170, 320, 4);
  g.font = 'bold 34px sans-serif'; const words = head.split(' '); let line = '', ly = -130; for (const w of words) { if ((line + w).length > 13) { g.fillText(line.trim(), 0, ly); ly += 38; line = ''; } line += w + ' '; } g.fillText(line.trim(), 0, ly);
  g.fillStyle = '#5a5a6a'; g.font = 'italic 18px serif'; g.fillText(sub, 0, ly + 34); const ph = ly + 60; for (let i = 0; i < 10; i++) for (let j = 0; j < 8; j++) { g.fillStyle = COLS[Math.floor(r() * COLS.length)]; g.fillRect(-150 + i * 14, ph + j * 14, 13, 13); } for (let k = 0; k < 8; k++) { g.fillStyle = '#b8b4aa'; g.fillRect(10, ph + k * 16, 140, 6); } for (let k = 0; k < 4; k++) g.fillRect(-150, ph + 120 + k * 14, 300, 6); g.restore(); }
