// sets.js — 2D locations for "The Serpent in Eden". Each returns { GY, CX, M }. Ground GY = 0.8·H.
import { E, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, text, clamp, noise } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
const GYv = () => E.H * 0.8;

// lush fruit tree (2D): trunk + clustered canopy + optional fruit/glow
export function tree2(g, x, y, s = 1, o = {}) {
  const r = rng(o.seed || 3), leaf = o.leaf || '#3f8a3a', dark = shade(leaf, -0.3);
  g.fillStyle = o.trunk || '#6a4a30'; g.beginPath(); g.moveTo(x - 16 * s, y); g.quadraticCurveTo(x - 6 * s, y - 120 * s, x - 10 * s, y - 210 * s); g.lineTo(x + 10 * s, y - 210 * s); g.quadraticCurveTo(x + 6 * s, y - 120 * s, x + 16 * s, y); g.fill();
  seg(g, [[x, y - 150 * s], [x - 60 * s, y - 220 * s]], 9 * s, o.trunk || '#6a4a30'); seg(g, [[x, y - 170 * s], [x + 60 * s, y - 240 * s]], 9 * s, o.trunk || '#6a4a30');
  if (o.glow) glow(g, x, y - 260 * s, 260 * s, o.glow, 0.45);
  for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, d = r() * 95 * s; circle(g, x + Math.cos(a) * d * 1.2, y - 260 * s + Math.sin(a) * d * 0.7, (40 + r() * 30) * s, i < 5 ? dark : mix(leaf, '#9ad86a', r() * 0.25)); }
  if (o.fruit) for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = r() * 110 * s, fx = x + Math.cos(a) * d * 1.2, fy = y - 250 * s + Math.sin(a) * d * 0.7; circle(g, fx, fy, 9 * s, o.fruit); circle(g, fx - 3 * s, fy - 3 * s, 3 * s, 'rgba(255,255,255,.6)'); if (o.glow) glow(g, fx, fy, 22 * s, o.fruit, 0.4); }
}
export function palm2(g, x, y, s = 1, lean = 0.2) {
  let px = x, py = y; g.strokeStyle = '#8a6a48'; g.lineWidth = 14 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(px, py); for (let i = 0; i < 8; i++) { px += lean * 14 * s; py -= 34 * s; g.lineTo(px, py); } g.stroke();
  for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6; g.strokeStyle = '#4a9a3a'; g.lineWidth = 12 * s; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(a) * 70 * s, py + Math.sin(a) * 40 * s - 30 * s, px + Math.cos(a) * 120 * s, py + 40 * s); g.stroke(); }
}
function flowers(g, t, y0, y1, seed = 4, n = 80) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = -E.W + r() * E.W * 3, y = y0 + r() * (y1 - y0), c = ['#f26a8a', '#ffd84a', '#ffffff', '#b88af2', '#ff8a4a'][Math.floor(r() * 5)]; circle(g, x, y, 4 + r() * 4, c); } }

// ---------------- EDEN (lush, golden daylight) ----------------
export function eden(g, t, cam, o = {}) {
  const M = mood(o.mood || 'day'), GY = GYv(), CX = E.W / 2, dim = o.dim ?? 0;
  layer(g, cam, 0.08, (g) => { backdrop(g, o.dusk ? ['#3a2a5a', '#c86a5a', '#f6b07a'] : ['#6aa8e0', '#a8d4ee', '#fff0c8']); FX.sun(g, CX + (o.sunX ?? 520), GY - 560, 70, '#fffbe8', '#ffe8a0', 6); FX.clouds(g, { y: 80, h: 200, color: '#ffffff', a: 0.35, seed: 5 }); });
  layer(g, cam, 0.22, (g) => { FX.hills(g, { y: GY - 180, amp: 360, color: '#9ab0c8', freq: 0.003, seed: 3 }); g.fillStyle = '#f4f8ff'; for (let i = -3; i < 6; i++) { const x = i * 420 + 100, y = GY - 180 - (noise(x * 0.003, 3) * 0.5 + 0.5) * 360; poly(g, [[x - 40, y + 30], [x, y - 4], [x + 40, y + 30]], 'rgba(255,255,255,.7)'); } FX.fog(g, GY - 260, 220, '#e8f2ff', 0.5); });
  layer(g, cam, 0.4, (g) => { FX.hills(g, { y: GY - 60, amp: 140, color: '#5a9a5a', freq: 0.005, seed: 8 }); const r = rng(9); for (let i = 0; i < 26; i++) { const x = -E.W + i * 190 + r() * 60; tree2(g, x, GY - 40 - r() * 60, 0.45 + r() * 0.2, { seed: i, leaf: '#4a8a4a' }); } });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 300, ['#7ab84a', '#4a8a3a', '#2a5a2a']); g.fillRect(-E.W, GY - 20, E.W * 3, E.H);
    if (o.river !== false) { g.fillStyle = linGrad(g, 0, GY + 70, 0, GY + 150, ['#7ad0f0', '#3a90c8']); g.beginPath(); g.moveTo(-E.W, GY + 90); for (let x = -E.W; x <= E.W * 2; x += 40) g.lineTo(x, GY + 90 + Math.sin(x * 0.004) * 14); for (let x = E.W * 2; x >= -E.W; x -= 40) g.lineTo(x, GY + 150 + Math.sin(x * 0.004 + 1) * 14); g.fill(); for (let i = 0; i < 30; i++) { const x = ((i * 157 + t * 60) % (E.W * 3)) - E.W; seg(g, [[x, GY + 115 + (i % 3) * 10], [x + 40, GY + 115 + (i % 3) * 10]], 2, 'rgba(255,255,255,.5)'); } }
    flowers(g, t, GY - 10, GY + 70, 4, 90);
  });
  if (o.trees !== false) layer(g, cam, 0.9, (g) => { const xs = o.treeXs || [CX - 760, CX - 520, CX + 600, CX + 860]; xs.forEach((x, i) => (i % 2 ? palm2(g, x, GY + 10, 1.0, i % 3 ? 0.2 : -0.2) : tree2(g, x, GY + 10, 1.0, { seed: i + 20, fruit: ['#e04a3a', '#f2a23a'][i % 2] }))); });
  if (o.twoTrees) layer(g, cam, 0.95, (g) => { tree2(g, CX - 260, GY + 10, 1.25, { seed: 31, leaf: '#4fa04a', fruit: '#fff2a8', glow: '#fff2a8' }); tree2(g, CX + 260, GY + 10, 1.2, { seed: 32, leaf: '#2f6a2a', fruit: '#c8202a' }); });
  FX.godRays(g, CX + (o.sunX ?? 520), GY - 560, { angle: 2.2, spread: 0.9, len: 1800, color: '#fff2c8', a: 0.08, t });
  if (dim) { g.save(); g.fillStyle = alpha('#0a0a1a', dim); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, CX, M };
}
// ---------------- DESERT CAMP (Numbers 21) ----------------
export function desert(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GYv(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#e8a86a', '#f6cc8a', '#fbe4b0']); FX.sun(g, CX - 500, GY - 420, 90, '#fffbe8', '#ffd28a', 5); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - 120, amp: 200, color: '#c88a5a', freq: 0.004, seed: 2 }); FX.fog(g, GY - 200, 200, '#f6d4a0', 0.5); });
  layer(g, cam, 0.6, (g) => { FX.hills(g, { y: GY - 10, amp: 90, color: '#d8a46a', freq: 0.006, seed: 6 }); const r = rng(3); for (let i = 0; i < 14; i++) { const x = -E.W + i * 300 + r() * 80, y = GY - 30 - r() * 40, s = 0.6 + r() * 0.4; poly(g, [[x - 80 * s, y], [x, y - 90 * s], [x + 80 * s, y]], ['#a87a4a', '#8a5a3a', '#c89a6a'][i % 3]); poly(g, [[x - 12 * s, y], [x, y - 40 * s], [x + 12 * s, y]], '#3a2418'); } });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#e4b47a', '#c8905a', '#8a5a3a']); g.fillRect(-E.W, GY - 10, E.W * 3, E.H); for (let i = 0; i < 40; i++) { const x = ((i * 97) % (E.W * 3)) - E.W; seg(g, [[x, GY + 40 + (i % 5) * 30], [x + 60, GY + 42 + (i % 5) * 30]], 2, 'rgba(120,70,30,.25)'); } });
  return { GY, CX, M };
}
// ---------------- EGYPTIAN HALL (Joseph's cup) ----------------
export function palace(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = GYv(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#3a2418', '#8a5a36', '#c8925a']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); for (let i = -4; i <= 4; i++) { const x = CX + i * 340; g.fillStyle = linGrad(g, x - 50, 0, x + 50, 0, ['#c8a070', '#f2d8a8', '#a87a4a']); g.fillRect(x - 50, GY - 700, 100, 700); g.fillStyle = '#3a6ea5'; g.fillRect(x - 60, GY - 720, 120, 30); g.fillStyle = '#d4a03a'; g.fillRect(x - 60, GY - 690, 120, 10); for (let k = 0; k < 5; k++) g.fillRect(x - 50, GY - 600 + k * 110, 100, 4); } for (const x of [CX - 520, CX + 520]) { circle(g, x, GY - 360, 14, '#ffd27a'); glow(g, x, GY - 360, 240, '#ffb84a', 0.55); } });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#a87a4a', '#5a3a22']); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, GY + 300, 'rgba(0,0,0,.2)', 0.08); FX.pool(g, CX, GY + 30, 700, 80, '#ffcf8a', 0.25); });
  return { GY, CX, M };
}
// ---------------- HEAVENLY THRONE (Isaiah 6) ----------------
export function heaven(g, t, cam, o = {}) {
  const M = mood('day'), GY = GYv(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, ['#fff4d8', '#ffe2a8', '#f6c27a']); FX.godRays(g, CX, GY - 520, { angle: Math.PI / 2, spread: Math.PI * 2, count: 18, len: 1600, color: '#ffffff', a: 0.12, t }); glow(g, CX, GY - 520, 700, '#ffffff', 0.7); });
  layer(g, cam, 0.5, (g) => { for (let i = 0; i < 9; i++) { const x = CX + (i - 4) * 300 + Math.sin(t * 0.3 + i) * 20; g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x, GY - 40 + (i % 2) * 40, 260, 70, 0, 0, 7); g.fill(); } if (o.throne !== false) { rr(g, CX - 140, GY - 520, 280, 380, 30); g.fillStyle = 'rgba(255,240,200,.55)'; g.fill(); glow(g, CX, GY - 360, 420, '#ffffff', 0.6); } });
  layer(g, cam, 0.85, (g) => { g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = -6; i < 12; i++) { g.beginPath(); g.ellipse(i * 260, GY + 80 + (i % 2) * 30, 220, 80, 0, 0, 7); g.fill(); } });
  return { GY, CX, M };
}
// ---------------- TYRE (island city at sunset) ----------------
export function tyre(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = GYv(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#3a2a5a', '#c86a5a', '#f6b07a']); FX.sun(g, CX + 420, GY - 200, 70, '#fff0d8', '#ffb87a', 6); });
  layer(g, cam, 0.4, (g) => { const r = rng(5); const ix = CX - 200; g.fillStyle = '#5a3a3a'; g.beginPath(); g.ellipse(ix, GY - 60, 520, 60, 0, Math.PI, 0); g.fill(); for (let i = 0; i < 26; i++) { const x = ix - 460 + i * 36 + r() * 10, h = 40 + r() * 120; g.fillStyle = ['#c89a6a', '#a87a5a', '#d8b08a'][i % 3]; g.fillRect(x, GY - 90 - h, 32, h + 30); g.fillStyle = 'rgba(255,200,120,.7)'; if (r() < 0.6) g.fillRect(x + 10, GY - 80 - h * 0.6, 8, 10); } g.fillStyle = '#8a5a4a'; for (let i = 0; i < 10; i++) g.fillRect(ix - 500 + i * 100, GY - 100, 70, 40); });
  layer(g, cam, 0.7, (g) => { g.fillStyle = linGrad(g, 0, GY - 60, 0, E.H, ['#c87a6a', '#5a3a6a', '#2a1a3a']); g.fillRect(-E.W, GY - 60, E.W * 3, E.H); for (let i = 0; i < 50; i++) { const x = ((i * 131 + t * 30) % (E.W * 3)) - E.W, y = GY - 40 + (i % 8) * 30; seg(g, [[x, y], [x + 50, y]], 2, 'rgba(255,200,160,.35)'); } for (const [x, s] of [[CX + 300, 1], [CX + 700, 0.7], [CX - 900, 0.8]]) { const bx = x + Math.sin(t * 0.5) * 10; g.fillStyle = '#3a2418'; g.beginPath(); g.moveTo(bx - 90 * s, GY - 30); g.lineTo(bx + 90 * s, GY - 30); g.lineTo(bx + 60 * s, GY); g.lineTo(bx - 60 * s, GY); g.fill(); seg(g, [[bx, GY - 30], [bx, GY - 190 * s]], 5, '#3a2418'); poly(g, [[bx + 4, GY - 180 * s], [bx + 80 * s, GY - 110 * s], [bx + 4, GY - 60 * s]], '#f2e6c8'); } });
  return { GY, CX, M };
}
// ---------------- PATMOS (cave, night, lamp) ----------------
export function patmos(g, t, cam, o = {}) {
  const M = mood('night'), GY = GYv(), CX = E.W / 2;
  layer(g, cam, 0.15, (g) => { backdrop(g, M.sky); FX.stars(g, t, { count: 160 }); FX.moon(g, CX + 520, 160, 36); g.fillStyle = '#1a2a4a'; g.fillRect(-E.W, GY - 120, E.W * 3, 200); });
  layer(g, cam, 0.6, (g) => { g.fillStyle = '#2a2230'; g.beginPath(); g.moveTo(-E.W, -E.H); g.lineTo(CX - 200, -E.H); g.quadraticCurveTo(CX - 520, GY - 600, CX - 380, GY); g.lineTo(-E.W, GY); g.fill(); g.beginPath(); g.moveTo(E.W * 2, -E.H); g.lineTo(CX + 300, -E.H); g.quadraticCurveTo(CX + 700, GY - 500, CX + 560, GY); g.lineTo(E.W * 2, GY); g.fill(); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#4a3a40', '#1a1218']); g.fillRect(-E.W, GY, E.W * 3, E.H); circle(g, CX + 120, GY - 30, 10, '#ffd27a'); glow(g, CX + 120, GY - 30, 420, '#ffb84a', 0.6); FX.pool(g, CX + 120, GY + 20, 420, 60, '#ffb84a', 0.35); });
  return { GY, CX, M };
}
// ---------------- HILL WITH THE CROSS (sunrise) ----------------
export function calvary(g, t, cam, o = {}) {
  const M = mood('golden'), GY = GYv(), CX = E.W / 2, k = o.dawn ?? 1;
  layer(g, cam, 0.1, (g) => { backdrop(g, [mix('#1a1a3a', '#f6a46a', k), mix('#3a2a4a', '#ffd48a', k), mix('#5a3a4a', '#fff0c8', k)]); FX.sun(g, CX + 40, GY - 150 - 120 * k, 90, '#fffbe8', '#ffd28a', 7); FX.godRays(g, CX + 40, GY - 150 - 120 * k, { angle: -Math.PI / 2, spread: Math.PI * 2, count: 16, len: 1600, color: '#fff2c8', a: 0.1 * k, t }); });
  layer(g, cam, 0.5, (g) => { FX.hills(g, { y: GY - 40, amp: 120, color: mix('#2a1a2a', '#8a5a4a', k), freq: 0.004, seed: 12 }); });
  layer(g, cam, 0.85, (g) => { g.fillStyle = mix('#1a1018', '#5a3a2a', k); g.beginPath(); g.moveTo(-E.W, GY + 80); g.quadraticCurveTo(CX, GY - 240, E.W * 2, GY + 80); g.lineTo(E.W * 2, E.H * 2); g.lineTo(-E.W, E.H * 2); g.fill(); const cx = CX, cy = GY - 150; g.fillStyle = '#2a1810'; g.fillRect(cx - 14, cy - 360, 28, 380); g.fillRect(cx - 120, cy - 280, 240, 26); });
  return { GY, CX, M };
}
// ---------------- DARK VOID (for the shining one / fall) ----------------
export function voidSet(g, t, cam, o = {}) { const GY = GYv(), CX = E.W / 2; layer(g, cam, 0.2, (g) => { backdrop(g, o.colors || ['#05040a', '#141028', '#1a1230']); FX.stars(g, t, { count: 120, area: [-E.W, -E.H, E.W * 3, E.H * 3] }); }); return { GY, CX, M: mood('night') }; }
