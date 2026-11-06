// toon.js — illustrated "storybook" look (RicksClips-like): outlined 2D characters with big round heads,
// and painterly props: puffy shaded clouds, layered trees, grass blades, flowers, castles, paper grain.
// Everything is drawn with a dark warm outline so 2D cut-outs read as volume.
import { E, clamp, lerp, rng, noise, seg, circle, poly, alpha, shade, mix, rr, linGrad, radGrad, glow } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';

export const OL = '#3a2a22';                         // outline colour
export const SKIN = '#f8e6a0';                       // pale yellow skin (user's yellow figures)
const fs = (g, fill, w = 3, col = OL) => { g.fillStyle = fill; g.fill(); if (w) { g.lineWidth = w; g.strokeStyle = col; g.lineJoin = 'round'; g.stroke(); } };
const limb = (g, pts, w, fill, ow = 3) => { seg(g, pts, w + ow * 2, OL); seg(g, pts, w, fill); };

// ---------- characters ----------
// who: { skin, robe, robe2 (trim), cape, crown:'gold'|'silver', beard, mustache, hair:'long'|'pony'|'bald'|'short', hairColor, staff, scroll }
export function toonFigure(g, o) {
  const p = o.pose || POSES.stand, s = (o.s ?? 1) * 1.05, f = o.facing ?? 1, w = o.who || {}, skin = w.skin || SKIN;
  g.save(); g.translate(o.x, o.y); g.scale(s * f, s); if (o.rot) { g.translate(0, -100); g.rotate(o.rot); g.translate(0, 100); }
  if (o.shadow !== false) { g.fillStyle = 'rgba(40,20,10,.22)'; g.beginPath(); g.ellipse(0, 2, 46, 9, 0, 0, 7); g.fill(); }
  const H = [p.head[0], p.head[1] - 18], R = 44;                                   // big head, lifted
  if (w.cape) { g.beginPath(); g.moveTo(p.sh[0] - 14, p.sh[1] - 4); g.quadraticCurveTo(p.sh[0] - 46, p.hip[1] + 20, p.sh[0] - 40, 4); g.lineTo(p.sh[0] + 10, 2); g.lineTo(p.sh[0] + 12, p.sh[1]); g.closePath(); fs(g, shade(w.cape, -0.15)); }
  // far limbs
  limb(g, [p.hip, p.kB, p.fB], 6, shade(skin, -0.12)); limb(g, [p.sh, p.eB, p.hB], 6, shade(skin, -0.12)); circle(g, p.hB[0], p.hB[1], 7, OL); circle(g, p.hB[0], p.hB[1], 4.5, shade(skin, -0.12));
  // robe / body
  const robe = w.robe || '#e8e0d0', top = p.sh[1] - 6, hemY = w.short ? p.kF[1] + 4 : Math.min(-10, p.kF[1] + 30);
  g.beginPath(); g.moveTo(p.sh[0] - 20, top + 8); g.quadraticCurveTo(p.sh[0], top - 8, p.sh[0] + 20, top + 8); g.quadraticCurveTo(p.hip[0] + 30, p.hip[1], p.hip[0] + 38, hemY); g.quadraticCurveTo(p.hip[0], hemY + 8, p.hip[0] - 38, hemY); g.quadraticCurveTo(p.hip[0] - 30, p.hip[1], p.sh[0] - 20, top + 8); g.closePath(); fs(g, robe);
  g.save(); g.clip(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(p.hip[0] - 30, top - 10, 18, 300); seg(g, [[p.hip[0] + 6, p.hip[1] - 10], [p.hip[0] + 10, hemY]], 2, 'rgba(0,0,0,.18)'); g.restore();
  if (w.cross) { const cx = p.sh[0] + 2, cy = p.sh[1] + 30; g.fillStyle = '#c8202a'; g.fillRect(cx - 5, cy - 18, 10, 40); g.fillRect(cx - 15, cy - 6, 30, 10); }
  if (w.lilies) for (let k = 0; k < 6; k++) { const lx = p.hip[0] - 18 + (k % 3) * 18, ly = p.sh[1] + 20 + Math.floor(k / 3) * 40; circle(g, lx, ly, 4, '#f2c21a'); }
  if (w.robe2) { seg(g, [[p.hip[0] - 22, p.hip[1] - 2], [p.hip[0] + 22, p.hip[1] - 2]], 8, OL); seg(g, [[p.hip[0] - 21, p.hip[1] - 2], [p.hip[0] + 21, p.hip[1] - 2]], 4, w.robe2); }
  // near leg
  limb(g, [[p.hip[0] + 6, hemY - 4], p.kF[1] > hemY ? p.kF : [p.kF[0], hemY], p.fF], 6, skin); seg(g, [p.fF, [p.fF[0] + 12, p.fF[1]]], 8, OL);
  // near arm + hand
  limb(g, [[p.sh[0] + 4, p.sh[1] + 4], p.eF, p.hF], 6, skin); circle(g, p.hF[0], p.hF[1], 7.5, OL); circle(g, p.hF[0], p.hF[1], 5, skin);
  if (w.staff) { seg(g, [[p.hF[0], p.hF[1] - 120], [p.hF[0] - 6, p.hF[1] + 110]], 10, OL); seg(g, [[p.hF[0], p.hF[1] - 120], [p.hF[0] - 6, p.hF[1] + 110]], 6, '#9a6a3a'); }
  if (w.cane) { seg(g, [[p.hF[0] + 4, p.hF[1] - 6], [p.hF[0] + 14, -2]], 9, OL); seg(g, [[p.hF[0] + 4, p.hF[1] - 6], [p.hF[0] + 14, -2]], 5, '#8a5a2a'); g.lineWidth = 9; g.strokeStyle = OL; g.beginPath(); g.arc(p.hF[0] - 6, p.hF[1] - 6, 10, Math.PI, 0); g.stroke(); g.lineWidth = 5; g.strokeStyle = '#8a5a2a'; g.stroke(); }
  if (o.prop) o.prop(g, p);
  // head
  if (w.hair === 'long' || w.hair === 'pony') { g.beginPath(); g.ellipse(H[0] - 18, H[1] + 18, 34, 46, 0.2, 0, 7); fs(g, w.hairColor || '#8a4a2a'); }
  g.beginPath(); g.arc(H[0], H[1], R, 0, 7); fs(g, skin, 3.5);
  g.save(); g.beginPath(); g.arc(H[0], H[1], R - 2, 0, 7); g.clip(); g.fillStyle = 'rgba(160,110,40,.13)'; g.beginPath(); g.arc(H[0] - 14, H[1] + 10, R, 0, 7); g.fill(); g.restore();
  if (w.hair === 'short' || w.hair === 'long' || w.hair === 'pony') { g.beginPath(); g.arc(H[0] - 4, H[1] - 6, R + 1, Math.PI * 1.02, Math.PI * 1.85); g.quadraticCurveTo(H[0] + 10, H[1] - 30, H[0] - 30, H[1] - 8); g.closePath(); fs(g, w.hairColor || '#8a4a2a'); }
  if (w.hair === 'pony') { g.beginPath(); g.ellipse(H[0] - 50, H[1] + 6, 14, 30, 0.4, 0, 7); fs(g, w.hairColor || '#8a4a2a'); }
  face(g, H[0] + 10, H[1] + 2, o.expr || 'neutral', o.talk || 0, o.blink, w);
  if (w.beard) { g.beginPath(); g.moveTo(H[0] - 14, H[1] + 22); g.quadraticCurveTo(H[0] + 12, H[1] + (w.beard === 'long' ? 92 : 62), H[0] + 34, H[1] + 22); g.quadraticCurveTo(H[0] + 12, H[1] + 34, H[0] - 14, H[1] + 22); fs(g, w.beardColor || '#7a5a3a'); }
  if (w.mustache) { for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(H[0] + 10 + sd * 9, H[1] + 18, 10, 4.5, sd * 0.3, 0, 7); fs(g, w.beardColor || '#5a3a2a', 2); } }
  if (w.crown) { const c = w.crown === 'silver' ? '#d8dce8' : '#f2c21a'; g.beginPath(); const cy = H[1] - R + 8; g.moveTo(H[0] - 34, cy + 6); for (let i = 0; i <= 6; i++) g.lineTo(H[0] - 34 + i * 11.3, cy - (i % 2 ? 6 : 24)); g.lineTo(H[0] + 34, cy + 6); g.closePath(); fs(g, c); for (const dx of [-17, 0, 17]) { circle(g, H[0] + dx, cy - 2, 4, '#e0304a'); } }
  if (w.glasses) { for (const dx of [-14, 14]) { g.lineWidth = 3; g.strokeStyle = OL; g.beginPath(); g.arc(H[0] + 10 + dx, H[1] - 2, 10, 0, 7); g.stroke(); } seg(g, [[H[0] + 6, H[1] - 2], [H[0] + 14, H[1] - 2]], 3, OL); }
  if (w.hat === 'cone') { g.beginPath(); g.moveTo(H[0] - 40, H[1] - R + 14); g.lineTo(H[0] + 2, H[1] - R - 60); g.lineTo(H[0] + 40, H[1] - R + 14); g.closePath(); fs(g, w.hatColor || '#c8a03a'); seg(g, [[H[0] - 40, H[1] - R + 14], [H[0] + 40, H[1] - R + 14]], 8, OL); }
  if (w.hat === 'fur') { g.beginPath(); g.ellipse(H[0], H[1] - R + 6, R + 6, 22, 0, Math.PI, 0); g.lineTo(H[0] + R + 6, H[1] - R + 14); g.lineTo(H[0] - R - 6, H[1] - R + 14); g.closePath(); fs(g, w.hatColor || '#c83a2a'); g.beginPath(); rrect(g, H[0] - R - 9, H[1] - R + 4, 2 * R + 18, 20, 9); fs(g, w.furColor || '#6a4a32'); for (let i = 0; i < 6; i++) seg(g, [[H[0] - R + i * 13, H[1] - R + 8], [H[0] - R + 4 + i * 13, H[1] - R + 20]], 2, 'rgba(0,0,0,.25)'); }
  if (w.hat === 'spike') { g.beginPath(); g.moveTo(H[0] - R - 3, H[1] - 4); g.quadraticCurveTo(H[0] - R + 2, H[1] - R - 30, H[0], H[1] - R - 46); g.quadraticCurveTo(H[0] + R - 2, H[1] - R - 30, H[0] + R + 3, H[1] - 4); g.closePath(); fs(g, '#b8bcc8'); seg(g, [[H[0] - R - 3, H[1] - 6], [H[0] + R + 3, H[1] - 6]], 9, '#c8a030'); seg(g, [[H[0] + 10, H[1] - 8], [H[0] + 10, H[1] + 22]], 8, OL); seg(g, [[H[0] + 10, H[1] - 8], [H[0] + 10, H[1] + 20]], 4, '#b8bcc8'); if (w.mail) { g.beginPath(); g.moveTo(H[0] - R - 3, H[1] - 4); g.quadraticCurveTo(H[0] - R - 10, H[1] + 40, H[0] - 10, H[1] + R + 14); g.lineTo(H[0] - 30, H[1] + 10); g.closePath(); fs(g, '#8a8e9a', 2.5); } }
  if (w.hat === 'veil') { g.beginPath(); g.moveTo(H[0] - R - 4, H[1] - 10); g.quadraticCurveTo(H[0] - R - 30, H[1] + 70, H[0] - R - 8, H[1] + R + 40); g.lineTo(H[0] - 18, H[1] + R + 18); g.quadraticCurveTo(H[0] - R + 4, H[1] + 20, H[0] - R + 6, H[1] - 6); g.closePath(); fs(g, w.veilColor || '#f4f0e6'); g.beginPath(); g.moveTo(H[0] - R - 6, H[1] - R + 22); g.quadraticCurveTo(H[0], H[1] - R - 52, H[0] + R + 6, H[1] - R + 22); g.closePath(); fs(g, w.hatColor || '#c8202a'); for (let i = 0; i < 5; i++) circle(g, H[0] - 26 + i * 13, H[1] - R + 4 - Math.sin(i / 4 * Math.PI) * 18, 4.5, i % 2 ? '#f4f0e6' : '#f2c21a'); seg(g, [[H[0] - R - 6, H[1] - R + 22], [H[0] + R + 6, H[1] - R + 22]], 7, '#f2c21a'); }
  if (w.helm) { g.beginPath(); g.arc(H[0], H[1] - 4, R + 3, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(H[0] + R + 3, H[1] - 2); g.lineTo(H[0] - R - 3, H[1] - 2); g.closePath(); fs(g, '#a8acb8'); seg(g, [[H[0] + 10, H[1] - 6], [H[0] + 10, H[1] + 24]], 8, OL); seg(g, [[H[0] + 10, H[1] - 6], [H[0] + 10, H[1] + 22]], 4, '#a8acb8'); }
  if (w.hood) { g.beginPath(); g.arc(H[0] - 2, H[1] - 2, R + 9, Math.PI * 0.75, Math.PI * 2.2); g.quadraticCurveTo(H[0] + 40, H[1] + 50, H[0] + 30, H[1] + 40); fs(g, w.hood); g.beginPath(); g.arc(H[0], H[1], R, 0, 7); fs(g, skin, 3); face(g, H[0] + 10, H[1] + 2, o.expr || 'neutral', o.talk || 0, o.blink, w); }
  g.restore();
}
function face(g, x, y, expr, talk, blink, w) {
  const brow = { neutral: [0, 0], happy: [-3, -3], smile: [-1, -1], determined: [-4, 6], angry: [-6, 9], worried: [5, -7], scared: [6, -9], shocked: [-7, -7], surprised: [-7, -7], sad: [5, -6], smirk: [-3, 3], awe: [-7, -7], thinking: [2, -6] }[expr] || [0, 0];
  for (const sd of [-1, 1]) { const ex = x + sd * 14; if (blink) seg(g, [[ex - 5, y - 4], [ex + 5, y - 4]], 3, OL); else { g.fillStyle = OL; g.beginPath(); g.ellipse(ex, y - 4, ['shocked', 'surprised', 'scared', 'awe'].includes(expr) ? 4.5 : 3.6, ['shocked', 'surprised', 'scared', 'awe'].includes(expr) ? 6.5 : 5.5, 0, 0, 7); g.fill(); } seg(g, [[ex - 8, y - 17 + (sd < 0 ? brow[0] : brow[1])], [ex + 8, y - 17 + (sd < 0 ? brow[1] : brow[0])]], 4, w.browColor || OL); }
  const my = y + 14; g.strokeStyle = OL; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath();
  if (talk > 0.05) { g.fillStyle = '#7a2a2a'; g.beginPath(); g.ellipse(x, my, 7, 2 + 7 * talk, 0, 0, 7); g.fill(); g.stroke(); return; }
  if (['happy', 'smile', 'awe'].includes(expr)) { if (expr === 'awe') { g.ellipse(x, my, 4, 6, 0, 0, 7); } else g.arc(x, my - 6, 10, 0.4, Math.PI - 0.4); }
  else if (['shocked', 'surprised', 'scared'].includes(expr)) { g.ellipse(x, my, 5, 7, 0, 0, 7); }
  else if (['sad', 'worried'].includes(expr)) g.arc(x, my + 9, 9, Math.PI + 0.5, Math.PI * 2 - 0.5);
  else if (expr === 'smirk') { g.moveTo(x - 8, my); g.quadraticCurveTo(x + 2, my + 4, x + 10, my - 5); }
  else { g.moveTo(x - 7, my); g.lineTo(x + 7, my); }
  g.stroke();
}
export const CAST = {
  adam: { hair: 'short', hairColor: '#7a4a2a', robe: '#e8dcc4', robe2: '#a88a5a', short: true },
  eve: { hair: 'pony', hairColor: '#b8642a', robe: '#e8dcc4', robe2: '#c87aa0', short: true },
  moses: { hair: 'long', hairColor: '#e8e4dc', beard: 'long', beardColor: '#e8e4dc', robe: '#9a5a3a', robe2: '#e8d0a0', staff: true },
  joseph: { hair: 'short', hairColor: '#2a1a10', robe: '#f2ead8', robe2: '#3a6ea5', cape: '#3a6ea5', crown: null },
  isaiah: { hair: 'short', hairColor: '#6a5a4a', beard: 'short', beardColor: '#6a5a4a', robe: '#7a7a8a', robe2: '#c8c0b0' },
  king: { hair: 'short', hairColor: '#3a2418', beard: 'short', mustache: true, robe: '#c83a3a', robe2: '#f2c21a', cape: '#a82a2a', crown: 'gold' },
  john: { hair: 'long', hairColor: '#c8c0b0', beard: 'long', beardColor: '#d8d0c0', robe: '#e8e0d0', robe2: '#8a6a4a' },
  methuselah: { hair: 'long', hairColor: '#f2f0ea', beard: 'long', beardColor: '#f2f0ea', robe: '#7a5a8a', robe2: '#d8c8a0', cane: true },
  noah: { hair: 'long', hairColor: '#a8a49a', beard: 'long', beardColor: '#a8a49a', robe: '#3a5a8a', robe2: '#d8c090' },
  enoch: { hair: 'short', hairColor: '#6a4a2a', beard: 'short', beardColor: '#6a4a2a', robe: '#4a8a6a', robe2: '#e8d8a8' },
  abraham: { hair: 'long', hairColor: '#e8e4dc', beard: 'long', beardColor: '#e8e4dc', robe: '#c87a3a', robe2: '#3a5a8a' },
  sumer: { hair: 'long', hairColor: '#1a1210', beard: 'long', beardColor: '#1a1210', robe: '#e8d0a0', robe2: '#3a6ea5', hat: 'cone', hatColor: '#d8a03a' },
  jeanne: { hair: 'pony', hairColor: '#f4f2ee', glasses: true, robe: '#8a5aa8', robe2: '#f2e6d8', cane: true },
  kid: { hair: 'short', hairColor: '#5a3a22', robe: '#e8dcc4', robe2: '#a88a5a', short: true },
  philip: { hair: 'long', hairColor: '#c8a050', robe: '#2a4a9a', robe2: '#f2c21a', cape: '#1a3a8a', crown: 'gold', lilies: true },
  templar: { hair: 'short', hairColor: '#5a3a22', beard: 'short', beardColor: '#5a3a22', robe: '#f4f0e6', robe2: '#8a6a4a', cross: true },
  molay: { hair: 'long', hairColor: '#e8e4dc', beard: 'long', beardColor: '#e8e4dc', robe: '#f4f0e6', robe2: '#8a6a4a', cross: true },
  soldier: { hair: 'short', hairColor: '#3a2418', robe: '#2a4a9a', robe2: '#f2c21a', helm: true, short: true },
  olga: { hair: 'long', hairColor: '#d8a050', robe: '#8a1a2a', robe2: '#f2c21a', cape: '#4a0e18', hat: 'veil', hatColor: '#c8202a' },
  igor: { hair: 'short', hairColor: '#7a4a22', beard: 'short', beardColor: '#7a4a22', mustache: true, robe: '#2a4a8a', robe2: '#f2c21a', cape: '#8a1a2a', hat: 'fur', hatColor: '#c8202a' },
  mal: { hair: 'long', hairColor: '#2a1a10', beard: 'long', beardColor: '#2a1a10', robe: '#3a6a3a', robe2: '#c8a050', cape: '#5a3a22', hat: 'fur', hatColor: '#3a6a3a', furColor: '#4a3020' },
  drevlian: { hair: 'long', hairColor: '#4a3020', beard: 'short', beardColor: '#4a3020', robe: '#7a6a42', robe2: '#a88a5a', hat: 'fur', hatColor: '#6a5a3a', furColor: '#3a2a1a' },
  drevlian2: { hair: 'short', hairColor: '#8a5a2a', beard: 'long', beardColor: '#8a5a2a', robe: '#5a6a3a', robe2: '#c8b080', hat: 'fur', hatColor: '#8a3a22', furColor: '#5a4030' },
  rus: { hair: 'short', hairColor: '#c8a050', beard: 'short', beardColor: '#c8a050', robe: '#7a2a22', robe2: '#c8a030', hat: 'spike', mail: true, short: true },
  rus2: { hair: 'short', hairColor: '#5a3a22', mustache: true, beardColor: '#5a3a22', robe: '#3a3a5a', robe2: '#c8a030', hat: 'spike', mail: true, short: true },
  townsman: { hair: 'short', hairColor: '#6a4a2a', beard: 'short', beardColor: '#6a4a2a', robe: '#c8b890', robe2: '#8a5a3a', short: true },
  townswoman: { hair: 'long', hairColor: '#a86a2a', robe: '#c87a5a', robe2: '#f2e6c8', hat: 'veil', hatColor: '#3a6a8a', veilColor: '#e8dcc4' },
  paul: { hair: 'bald', beard: 'short', beardColor: '#5a4a3a', robe: '#4a7a5a', robe2: '#e8d0a0' },
};

// ---------- painterly props ----------
export function cloud(g, x, y, s = 1, seed = 1, o = {}) {
  const r = rng(seed), puffs = []; for (let i = 0; i < 7; i++) puffs.push([(i - 3) * 42 * s + (r() - 0.5) * 20 * s, -Math.sin((i / 6) * Math.PI) * 50 * s - r() * 20 * s, (34 + r() * 26) * s * (1 - Math.abs(i - 3) * 0.08)]);
  g.save(); g.translate(x, y);
  const base = o.color || '#ffffff', shadeC = o.shade || '#c8c8e4';
  g.beginPath(); for (const [px, py, pr] of puffs) { g.moveTo(px + pr, py); g.arc(px, py, pr, 0, 7); } g.moveTo(150 * s, 0); g.ellipse(0, 0, 150 * s, 26 * s, 0, 0, 7);
  g.lineWidth = 6 * s; g.strokeStyle = alpha(o.edge || '#9a9ac0', 0.55); g.stroke(); g.fillStyle = shadeC; g.fill();
  g.beginPath(); for (const [px, py, pr] of puffs) { g.moveTo(px - 4 * s + pr * 0.92, py - 8 * s); g.arc(px - 4 * s, py - 8 * s, pr * 0.92, 0, 7); } g.fillStyle = base; g.fill();
  g.beginPath(); for (const [px, py, pr] of puffs.slice(2, 5)) { g.moveTo(px - 10 * s + pr * 0.5, py - 18 * s); g.arc(px - 10 * s, py - 18 * s, pr * 0.5, 0, 7); } g.fillStyle = 'rgba(255,255,255,.9)'; g.fill();
  g.restore();
}
export function leafyTree(g, x, y, s = 1, seed = 2, o = {}) {
  const r = rng(seed), lc = o.leaf || '#5a9a3a';
  g.beginPath(); g.moveTo(x - 12 * s, y); g.quadraticCurveTo(x - 4 * s, y - 70 * s, x - 8 * s, y - 120 * s); g.lineTo(x + 8 * s, y - 120 * s); g.quadraticCurveTo(x + 4 * s, y - 70 * s, x + 12 * s, y); g.closePath(); fs(g, o.trunk || '#8a5a3a', 3 * s);
  const blobs = []; for (let i = 0; i < 9; i++) blobs.push([x + (r() - 0.5) * 120 * s, y - 150 * s - r() * 90 * s, (34 + r() * 22) * s]);
  g.beginPath(); for (const [bx, by, br] of blobs) { g.moveTo(bx + br, by); g.arc(bx, by, br, 0, 7); } g.lineWidth = 6 * s; g.strokeStyle = OL; g.stroke(); g.fillStyle = shade(lc, -0.2); g.fill();
  g.beginPath(); for (const [bx, by, br] of blobs) { g.moveTo(bx - 5 * s + br * 0.85, by - 6 * s); g.arc(bx - 5 * s, by - 6 * s, br * 0.85, 0, 7); } g.fillStyle = lc; g.fill();
  g.beginPath(); for (const [bx, by, br] of blobs.slice(0, 5)) { g.moveTo(bx - 10 * s + br * 0.4, by - 14 * s); g.arc(bx - 10 * s, by - 14 * s, br * 0.4, 0, 7); } g.fillStyle = shade(lc, 0.2); g.fill();
  if (o.fruit) for (let i = 0; i < 12; i++) { const fx = x + (r() - 0.5) * 140 * s, fy = y - 140 * s - r() * 100 * s; circle(g, fx, fy, 8 * s, OL); circle(g, fx, fy, 6 * s, o.fruit); circle(g, fx - 2 * s, fy - 2 * s, 2 * s, 'rgba(255,255,255,.7)'); }
  if (o.glow) glow(g, x, y - 180 * s, 200 * s, o.glow, 0.35);
}
// a band of grass blades + flowers between y0 and y1 (perspective: blades grow toward the bottom)
export function meadow(g, x0, x1, y0, y1, seed = 3, o = {}) {
  const r = rng(seed), n = o.n || 900, cols = o.cols || ['#6aa83a', '#7ab84a', '#5a9a32', '#8ac85a', '#4a8a2a'];
  for (let i = 0; i < n; i++) { const u = r() ** 0.8, y = y0 + u * (y1 - y0), x = x0 + r() * (x1 - x0), h = (6 + u * 26) * (0.6 + r() * 0.8), lean = (r() - 0.5) * h * 0.5; seg(g, [[x, y], [x + lean, y - h]], 1.2 + u * 2.6, cols[Math.floor(r() * cols.length)]); }
  const fl = o.flowers ?? 70; for (let i = 0; i < fl; i++) { const u = r(), y = y0 + u * (y1 - y0), x = x0 + r() * (x1 - x0), sz = 3 + u * 9, c = r() < 0.5 ? '#d8302a' : r() < 0.6 ? '#3a6ae0' : '#ffffff'; seg(g, [[x, y], [x, y - sz * 2.2]], 1.5 + u, '#4a7a2a'); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; circle(g, x + Math.cos(a) * sz * 0.55, y - sz * 2.2 + Math.sin(a) * sz * 0.55, sz * 0.5, c); } circle(g, x, y - sz * 2.2, sz * 0.32, c === '#d8302a' ? '#2a1a10' : '#f2c21a'); }
}
export function castle(g, x, y, s = 1, o = {}) { const c = o.color || '#e8e0e8', roof = o.roof || '#d85a6a'; const tower = (tx, w, h) => { g.beginPath(); g.rect(tx - w / 2, y - h, w, h); fs(g, c, 2 * s); g.beginPath(); g.moveTo(tx - w / 2 - 4 * s, y - h); g.lineTo(tx, y - h - w * 1.3); g.lineTo(tx + w / 2 + 4 * s, y - h); g.closePath(); fs(g, roof, 2 * s); g.fillStyle = alpha(OL, 0.6); g.fillRect(tx - 3 * s, y - h * 0.7, 6 * s, 10 * s); }; g.beginPath(); g.rect(x - 70 * s, y - 50 * s, 140 * s, 50 * s); fs(g, c, 2 * s); tower(x - 60 * s, 26 * s, 90 * s); tower(x + 60 * s, 26 * s, 90 * s); tower(x, 34 * s, 120 * s); }
export function paper(g, t, a = 0.06) { if (!paper.c) { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const r = rng(5); for (let i = 0; i < 9000; i++) { x.fillStyle = r() < 0.5 ? 'rgba(80,50,20,.08)' : 'rgba(255,255,255,.08)'; x.fillRect(r() * 256, r() * 256, 1 + r() * 2, 1 + r() * 2); } paper.c = c; } g.save(); g.globalAlpha = a * 4; g.fillStyle = g.createPattern(paper.c, 'repeat'); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }

function rrect(g, x, y, w, h, r) { g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
