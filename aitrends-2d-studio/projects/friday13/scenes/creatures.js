// creatures.js — the serpent (classic snake), the "shining one" (luminous seraph-like being), the jewelled cherub,
// the bronze serpent on a pole, plus on-screen graphics: verse badge, Hebrew root card, verdict rows.
import { E, S, clamp, lerp, ease, prog, seg, circle, ring, poly, glow, alpha, shade, mix, rr, text, linGrad, radGrad, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

// classic green snake: body follows a wavy spine from tail (x0,y0) toward head; dir = head direction
export function snake(g, x, y, s, t, o = {}) {
  const n = 40, pts = [], len = (o.len || 520) * s, amp = (o.amp ?? 40) * s, dir = o.dir ?? 1, col = o.color || '#4a9a3a', belly = o.belly || '#c8d86a';
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + dir * u * len, y + Math.sin(u * 9 - t * 3) * amp * (0.3 + 0.7 * (1 - u)) - (o.rise || 0) * u * u * s]); }
  for (let i = 0; i < n; i++) { const w = (6 + 20 * Math.sin(Math.min(1, (i / n) * 1.3) * Math.PI * 0.9)) * s; seg(g, [pts[i], pts[i + 1]], w + 7 * s, '#3a2a22'); }
  for (let i = 0; i < n; i++) { const w = (6 + 20 * Math.sin(Math.min(1, (i / n) * 1.3) * Math.PI * 0.9)) * s; seg(g, [pts[i], pts[i + 1]], w, i % 4 < 2 ? col : shade(col, 0.12)); }
  const [hx, hy] = pts[n]; g.save(); g.translate(hx, hy); g.scale(dir, 1);
  g.fillStyle = col; g.beginPath(); g.ellipse(18 * s, 0, 36 * s, 24 * s, 0, 0, 7); g.fill(); g.lineWidth = 3.5 * s; g.strokeStyle = '#3a2a22'; g.stroke();
  circle(g, 30 * s, -12 * s, 11 * s, '#3a2a22'); circle(g, 30 * s, -12 * s, 9 * s, '#fffbe8'); g.fillStyle = '#120a06'; g.beginPath(); g.ellipse(33 * s, -12 * s, 3 * s, 7 * s, 0, 0, 7); g.fill(); seg(g, [[20 * s, -26 * s], [42 * s, -22 * s + (o.brow || 0) * s]], 4 * s, '#3a2a22');
  if (o.tongue !== false && Math.sin(t * 6) > 0.2) { seg(g, [[50 * s, 4 * s], [72 * s, 6 * s]], 3 * s, '#d83a3a'); seg(g, [[72 * s, 6 * s], [80 * s, 0]], 2.5 * s, '#d83a3a'); seg(g, [[72 * s, 6 * s], [80 * s, 12 * s]], 2.5 * s, '#d83a3a'); }
  if (o.talk) { seg(g, [[36 * s, 8 * s], [50 * s, 8 * s + o.talk * 10 * s]], 3 * s, '#120a06'); }
  g.restore(); return pts[n];
}
// the shining one: a luminous winged serpent-being. k = brightness 0..1, dark = 0..1 corruption
export function shining(g, x, y, s, t, o = {}) {
  const k = o.k ?? 1, dark = o.dark ?? 0, core = mix('#fff6d8', '#140a1a', dark), edge = mix('#ffd47e', '#3a1a3a', dark);
  if (k <= 0) return;
  g.save(); g.globalAlpha *= k; glow(g, x, y, 520 * s * (1 - dark * 0.7), mix('#ffe8a8', '#5a1a3a', dark), 0.55);
  // six wings (seraph): two pairs spread, one pair over the feet
  for (const sd of [-1, 1]) for (const [ang, L, wy] of [[-0.9, 340, -120], [-0.35, 300, -40], [0.5, 220, 80]]) {
    const flap = Math.sin(t * 2.2 + (wy > 0 ? 1 : 0)) * 0.08;
    g.save(); g.translate(x + sd * 30 * s, y + wy * s); g.scale(sd, 1); g.rotate(ang + flap);
    g.fillStyle = linGrad(g, 0, 0, L * s, 0, [alpha(edge, 0.9), alpha(core, 0.55), alpha(core, 0)]);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5 * s, -70 * s, L * s, -20 * s); g.quadraticCurveTo(L * 0.6 * s, 30 * s, 0, 22 * s); g.fill();
    for (let f = 1; f < 5; f++) seg(g, [[L * 0.15 * f * s, -6 * s], [L * 0.2 * f * s + 30 * s, 12 * s]], 2 * s, alpha(core, 0.5));
    g.restore();
  }
  // serpentine luminous body
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([x + Math.sin(u * 6 + t * 1.5) * 50 * s * u, y - 200 * s + u * 440 * s]); }
  for (let i = 0; i < 30; i++) seg(g, [pts[i], pts[i + 1]], (46 - i * 1.2) * s, i % 3 ? core : edge);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i += 3) glow(g, pts[i][0], pts[i][1], 60 * s, '#fff2c8', 0.25 * (1 - dark)); g.restore();
  // head with burning eyes
  circle(g, x, y - 230 * s, 58 * s, core); ring(g, x, y - 230 * s, 58 * s, 5 * s, edge);
  for (const ex of [-20, 20]) { circle(g, x + ex * s, y - 238 * s, 9 * s, dark > 0.5 ? '#ff3a2a' : '#ffffff'); glow(g, x + ex * s, y - 238 * s, 30 * s, dark > 0.5 ? '#ff3a2a' : '#ffd47e', 0.8); }
  if (o.sparkle !== false) for (let i = 0; i < 10; i++) FX.sparkle(g, x + Math.sin(i * 2.1 + t) * 260 * s, y - 100 * s + Math.cos(i * 1.7 + t * 0.8) * 220 * s, 14 * s, '#ffffff', 0.5 * (1 - dark) * (0.5 + 0.5 * Math.sin(t * 3 + i)));
  g.restore();
}
// cherub covered in precious stones (Ezekiel 28): radiant humanoid with gem facets; fall = 0..1 darkening
export function cherub(g, x, y, s, t, o = {}) {
  const fall = o.fall ?? 0, body = mix('#fff2c8', '#2a1a2a', fall); const r = rng(7);
  glow(g, x, y - 200 * s, 460 * s * (1 - fall * 0.6), mix('#ffe8a8', '#4a1a2a', fall), 0.6);
  for (const sd of [-1, 1]) { g.save(); g.translate(x, y - 260 * s); g.scale(sd, 1); g.rotate(-0.5 + Math.sin(t * 1.5) * 0.05); g.fillStyle = linGrad(g, 0, 0, 380 * s, 0, [alpha(body, 0.95), alpha(body, 0)]); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(200 * s, -160 * s, 380 * s, -60 * s); g.quadraticCurveTo(220 * s, 40 * s, 0, 60 * s); g.fill(); g.restore(); }
  poly(g, [[x - 60 * s, y - 300 * s], [x + 60 * s, y - 300 * s], [x + 110 * s, y], [x - 110 * s, y]], body);
  circle(g, x, y - 350 * s, 52 * s, body);
  const gems = ['#e0304a', '#3a8ae0', '#3ac87a', '#f2c21a', '#a85ae0', '#ffffff', '#f2843a'];
  for (let i = 0; i < 26; i++) { const gx = x + (r() - 0.5) * 180 * s * (0.5 + r() * 0.5), gy = y - 30 * s - r() * 270 * s; const c = gems[i % gems.length]; poly(g, [[gx, gy - 12 * s], [gx + 9 * s, gy], [gx, gy + 12 * s], [gx - 9 * s, gy]], mix(c, '#1a0a1a', fall * 0.8)); if (fall < 0.5) FX.sparkle(g, gx, gy, 12 * s, '#ffffff', 0.4 * (0.5 + 0.5 * Math.sin(t * 4 + i))); }
  for (const ex of [-17, 17]) circle(g, x + ex * s, y - 356 * s, 8 * s, fall > 0.5 ? '#ff3a2a' : '#3a2a10');
}
// bronze serpent on a pole (Numbers 21)
export function bronzePole(g, x, y, s, t, o = {}) {
  seg(g, [[x, y], [x, y - 520 * s]], 16 * s, '#6a4a2a'); seg(g, [[x - 90 * s, y - 470 * s], [x + 90 * s, y - 470 * s]], 12 * s, '#6a4a2a');
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([x + Math.sin(u * Math.PI * 4) * 46 * s * (1 - u * 0.3), y - 60 * s - u * 460 * s]); }
  for (let i = 0; i < 40; i++) seg(g, [pts[i], pts[i + 1]], (14 + 10 * (i / 40)) * s, i % 3 ? '#c8843a' : '#e8a85a');
  const [hx, hy] = pts[40]; g.fillStyle = '#c8843a'; g.beginPath(); g.ellipse(hx + 20 * s, hy - 6 * s, 30 * s, 20 * s, -0.2, 0, 7); g.fill(); circle(g, hx + 30 * s, hy - 12 * s, 6 * s, '#3a1a08');
  glow(g, x, y - 300 * s, 360 * s, '#ffcf7a', 0.35 + 0.15 * Math.sin(t * 2)); FX.sparkle(g, hx + 10 * s, hy - 20 * s, 30 * s, '#ffffff', 0.6 + 0.4 * Math.sin(t * 3));
}
// ---------- graphics ----------
// verse reference badge (top left) e.g. "GENESIS 3:1"
export function verse(g, t, str, o = {}) { const a = clamp(Math.min(t / 0.3, ((o.dur ?? 99) - t) / 0.3)); if (a <= 0) return; g.save(); g.globalAlpha *= a; const w = 30 + str.length * 19; rr(g, 70, 90, w, 54, 10); g.fillStyle = 'rgba(20,14,8,.72)'; g.fill(); g.fillStyle = '#ffd47e'; g.fillRect(70, 90, 6, 54); text(g, str, 92, 118, { size: 30, color: '#fff1dc', font: 'Nunito', weight: 900, align: 'left', spacing: 2 }); g.restore(); }
// a quoted line of scripture shown on parchment
export function scripture(g, t, lines, o = {}) { const a = clamp(Math.min(t / 0.4, ((o.dur ?? 99) - t) / 0.4)); if (a <= 0) return; g.save(); g.globalAlpha *= a; const y = o.y ?? E.H * 0.78, h = 60 + lines.length * 54, w = o.w ?? 1300; rr(g, E.W / 2 - w / 2, y - h / 2, w, h, 18); g.fillStyle = 'rgba(244,228,190,.93)'; g.fill(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; g.stroke(); lines.forEach((ln, i) => text(g, ln, E.W / 2, y - h / 2 + 58 + i * 54, { size: 40, color: '#3a2410', font: 'Playfair Display', weight: 700, italic: true })); g.restore(); }
// big Hebrew word card: נחש with transliteration + three branches revealed by k (0..3)
export function hebrewCard(g, t, k = 0, o = {}) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1c10', '#14100a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,220,160,${0.015 + (i % 3) * 0.01})`; g.fillRect(0, i * 28, E.W, 2); }
  const cx = E.W / 2, cy = o.cy ?? E.H * 0.36, gl = 0.5 + 0.2 * Math.sin(t * 2);
  glow(g, cx, cy, 380, '#ffcf7a', 0.25 * gl);
  text(g, 'נחש', cx, cy, { size: 230, font: 'FreeSerif', weight: 700, color: '#ffe2a8', glow: 40, glowColor: 'rgba(255,190,90,.8)' });
  text(g, 'N A C H A S H', cx, cy + 150, { size: 40, color: '#fff1dc', font: 'Nunito', weight: 900, spacing: 10 });
  const items = [['SERPENT', '#7ad06a', 'icon-snake'], ['DIVINATION', '#a88af2', 'icon-cup'], ['BRONZE · SHINING', '#ffb84a', 'icon-glow']];
  items.forEach(([lab, col], i) => { const p = ease.outBack(clamp(k - i)); if (p <= 0) return; const x = cx + (i - 1) * 520, y = E.H * 0.84; seg(g, [[cx, cy + 190], [lerp(cx, x, p), lerp(cy + 190, y - 70, p)]], 4, alpha(col, 0.8)); g.save(); g.translate(x, y); g.scale(p, p); rr(g, -220, -50, 440, 100, 20); g.fillStyle = 'rgba(10,8,4,.75)'; g.fill(); g.strokeStyle = col; g.lineWidth = 4; g.stroke(); text(g, lab, 0, 2, { size: 38, color: col, font: 'Nunito', weight: 900, spacing: 3 }); g.restore(); });
}
// verdict row: label + mark ✓ ✗ ?
export function verdict(g, t, rows, o = {}) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a140c', '#0c0a06']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  text(g, o.title || 'BIBLE  vs  MYTH', E.W / 2, 150, { size: 64, color: '#ffd47e', font: 'Fredoka', weight: 700, spacing: 6, glow: 24, glowColor: 'rgba(255,190,90,.6)' });
  rows.forEach((r, i) => { const p = ease.out(clamp((t - r.at) / 0.4)); if (p <= 0) return; const y = 300 + i * 150, col = r.mark === '✓' ? '#5fd39a' : r.mark === '✗' ? '#ff5a4a' : '#ffd47e'; g.save(); g.globalAlpha *= p; g.translate((1 - p) * -80, 0); rr(g, 260, y - 55, E.W - 520, 110, 22); g.fillStyle = r.hi ? 'rgba(255,212,126,.14)' : 'rgba(255,255,255,.06)'; g.fill(); circle(g, 340, y, 40, col); text(g, r.mark, 340, y + 2, { size: 52, color: '#0c0a06', font: 'DejaVu Sans', weight: 700 }); text(g, r.label, 410, y, { size: 42, color: '#fff1dc', font: 'Nunito', weight: 800, align: 'left' }); text(g, r.tag, E.W - 300, y, { size: 30, color: col, font: 'Nunito', weight: 900, align: 'right', spacing: 3 }); g.restore(); });
}

// ---------- graphics for lifespans ----------
// scroll with a family tree: rows [{name, age, father}] revealed progressively (k rows shown)
export function familyScroll(g, t, rows, k, o = {}) {
  const x0 = E.W * 0.18, w = E.W * 0.64, y0 = 140, rh = (E.H - 300) / rows.length;
  rr(g, x0 - 40, y0 - 60, w + 80, E.H - 160, 20); g.fillStyle = '#f2e2b8'; g.fill(); g.lineWidth = 5; g.strokeStyle = '#3a2a22'; g.stroke();
  text(g, o.title || 'GENESIS 5', E.W / 2, y0 - 16, { size: 40, color: '#5a2a10', font: 'Playfair Display', weight: 900, spacing: 6 });
  rows.forEach((r, i) => { const a = clamp(k - i); if (a <= 0) return; const y = y0 + 40 + i * rh; g.save(); g.globalAlpha *= a; text(g, r.name, x0 + 20, y, { size: 40, color: '#3a2410', font: 'Fredoka', weight: 700, align: 'left' }); if (r.father) text(g, 'father at ' + r.father, x0 + w * 0.42, y, { size: 30, color: '#7a5a3a', font: 'Nunito', weight: 800, align: 'left' }); text(g, String(r.age), x0 + w - 20, y, { size: 46, color: r.hi ? '#c8302a' : '#3a2410', font: 'Fredoka', weight: 700, align: 'right' }); seg(g, [[x0 + 10, y + rh * 0.45], [x0 + w - 10, y + rh * 0.45]], 2, 'rgba(90,50,20,.2)'); g.restore(); });
}
// bar chart of lifespans with a decline curve; n = bars shown (fractional = growing)
export function lifeChart(g, t, data, n, o = {}) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1c10', '#14100a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const x0 = 160, x1 = E.W - 120, base = E.H - 170, top = 170, max = o.max || 1000, bw = (x1 - x0) / data.length;
  for (const v of [200, 400, 600, 800, 1000]) { const y = base - (v / max) * (base - top); seg(g, [[x0, y], [x1, y]], 1.5, 'rgba(255,220,160,.12)'); text(g, String(v), x0 - 20, y, { size: 24, color: 'rgba(255,230,190,.55)', font: 'Nunito', weight: 800, align: 'right' }); }
  const pts = [];
  data.forEach((d, i) => { const a = clamp(n - i); if (a <= 0) return; const h = (d.age / max) * (base - top) * ease.outBack(a), x = x0 + i * bw + bw * 0.15, w = bw * 0.7; rr(g, x, base - h, w, h, 10); g.fillStyle = d.after ? '#d8a03a' : '#5fb88a'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#3a2a22'; g.stroke(); text(g, String(d.age), x + w / 2, base - h - 26, { size: 30, color: '#fff1dc', font: 'Fredoka', weight: 700, alpha: a }); text(g, d.name, x + w / 2, base + 34, { size: 24, color: '#fff1dc', font: 'Nunito', weight: 900, alpha: a }); pts.push([x + w / 2, base - h]); });
  if (o.curve && pts.length > 2) { const k = clamp(o.curve); g.save(); g.strokeStyle = '#ff5a3a'; g.lineWidth = 7; g.setLineDash([16, 10]); g.beginPath(); const m = Math.max(2, Math.floor(pts.length * k)); pts.slice(0, m).forEach((p, i) => (i ? g.lineTo(p[0], p[1] - 20) : g.moveTo(p[0], p[1] - 20))); g.stroke(); g.restore(); }
  if (o.flood != null) { const x = x0 + o.flood * bw; seg(g, [[x, top - 40], [x, base]], 5, '#6ab0ff'); text(g, 'THE FLOOD', x, top - 60, { size: 30, color: '#8ac8ff', font: 'Fredoka', weight: 700 }); }
  if (o.limit) { const y = base - (120 / max) * (base - top); seg(g, [[x0, y], [x1, y]], 4, '#ff5a3a'); text(g, '120', x1 + 10, y, { size: 30, color: '#ff8a6a', font: 'Fredoka', weight: 700, align: 'left' }); }
}
// clay tablet with cuneiform: rows [[name, years]] revealed by k
export function clayTablet(g, t, rows, k, o = {}) {
  const cx = E.W / 2, cy = E.H / 2, w = 900, h = 820;
  g.save(); g.translate(cx, cy); g.rotate(o.rot ?? -0.02); rr(g, -w / 2, -h / 2, w, h, 60); g.fillStyle = linGrad(g, -w / 2, -h / 2, w / 2, h / 2, ['#c89a6a', '#a87a4a', '#8a5a3a']); g.fill(); g.lineWidth = 7; g.strokeStyle = '#3a2a22'; g.stroke();
  const r = rng(4); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(60,30,10,.18)'; g.beginPath(); g.arc((r() - 0.5) * w * 0.9, (r() - 0.5) * h * 0.9, 2 + r() * 6, 0, 7); g.fill(); }
  for (let row = 0; row < 14; row++) { const y = -h / 2 + 70 + row * 52; seg(g, [[-w / 2 + 40, y + 22], [w / 2 - 40, y + 22]], 2, 'rgba(60,30,10,.4)'); if (row >= rows.length) for (let c = 0; c < 18; c++) { const x = -w / 2 + 60 + c * 44 + r() * 8; poly(g, [[x, y - 10], [x + 14, y - 4], [x, y + 2]], 'rgba(60,30,10,.55)'); seg(g, [[x + 4, y - 4], [x + 4, y + 14]], 3, 'rgba(60,30,10,.55)'); } }
  rows.forEach(([name, yrs], i) => { const a = clamp(k - i); if (a <= 0) return; const y = -h / 2 + 70 + i * 52; g.save(); g.globalAlpha = a; text(g, name, -w / 2 + 70, y, { size: 32, color: '#2a1408', font: 'Fredoka', weight: 700, align: 'left' }); text(g, yrs, w / 2 - 70, y, { size: 34, color: '#7a1408', font: 'Fredoka', weight: 700, align: 'right' }); g.restore(); });
  g.restore();
}
// flipping calendar: big number + unit
export function calendar(g, t, num, unit, o = {}) { const x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1; g.save(); g.translate(x, y); g.scale(s, s); rr(g, -220, -240, 440, 480, 28); g.fillStyle = '#fbf6ec'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#3a2a22'; g.stroke(); rr(g, -220, -240, 440, 110, 28); g.fillStyle = '#d8302a'; g.fill(); g.stroke(); for (const dx of [-110, 110]) { rr(g, dx - 12, -270, 24, 60, 10); g.fillStyle = '#8a8a9a'; g.fill(); g.stroke(); } text(g, unit, 0, -185, { size: 50, color: '#ffffff', font: 'Fredoka', weight: 700, spacing: 6 }); text(g, String(num), 0, 40, { size: 170, color: '#3a2410', font: 'Fredoka', weight: 700 }); g.restore(); }
