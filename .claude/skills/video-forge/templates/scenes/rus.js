// rus.js — REUSABLE Kievan Rus' / early-medieval Slavic & Viking wooden world for painted 3D scenes.
// Log houses (izba) with straw roofs, palisade hill-forts with towers, a terem palace, log hall interior,
// bathhouse, longboat, burial pit, kurgan mound, siege camp, shared animated fires and burning-bird flocks.
import { rng, seg, circle, poly, alpha, shade, glow } from '/engine/core.js';
import * as W from './world3d.js';
import * as A from './aerial.js';
import { OL } from './toon.js';
import { scatter, wallProp } from './props.js';

// ---------- textures ----------
export const logTex = (T, base = '#8a5a32', rep = [1, 1]) => T.canvasTex(256, 256, (g, Wd, H) => {
  const n = 8, h = H / n; for (let i = 0; i < n; i++) { const c = shade(base, ((i * 37) % 9 - 4) * 0.025); g.fillStyle = c; g.beginPath(); g.ellipse(Wd / 2, i * h + h / 2, Wd * 0.62, h * 0.52, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(40,20,8,.55)'; g.lineWidth = 4; g.stroke();
    g.strokeStyle = 'rgba(255,230,180,.16)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, i * h + h * 0.32); g.lineTo(Wd, i * h + h * 0.3); g.stroke();
    g.strokeStyle = 'rgba(40,20,8,.25)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { const x = ((i * 53 + k * 91) % Wd); g.beginPath(); g.moveTo(x, i * h + h * 0.5); g.lineTo(x + 22, i * h + h * 0.55); g.stroke(); } }
}, rep);
export const thatchTex = (T, base = '#c8a050', rep = [1, 1]) => T.canvasTex(256, 256, (g, Wd, H) => {
  g.fillStyle = base; g.fillRect(0, 0, Wd, H); const r = rng(5);
  for (let k = 0; k < 900; k++) { const x = r() * Wd, y = r() * H, l = 14 + r() * 26; g.strokeStyle = r() < 0.5 ? shade(base, -0.22) : shade(base, 0.18); g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y + l); g.stroke(); }
  for (let y = 0; y < H; y += 42) { g.fillStyle = 'rgba(60,35,10,.28)'; g.fillRect(0, y, Wd, 6); }
}, rep);
export const earthTex = (T, base = '#6a4a2e', rep = [6, 6]) => T.canvasTex(256, 256, (g, Wd, H) => { g.fillStyle = base; g.fillRect(0, 0, Wd, H); const r = rng(8); for (let k = 0; k < 500; k++) { g.fillStyle = r() < 0.5 ? shade(base, -0.2) : shade(base, 0.15); g.fillRect(r() * Wd, r() * H, 2 + r() * 5, 2 + r() * 4); } }, rep);
export const tridentBanner = (T, col = '#a81a22') => T.canvasTex(128, 256, (g, Wd, H) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, 0); g.lineTo(Wd, 0); g.lineTo(Wd, H); g.lineTo(Wd / 2, H - 34); g.lineTo(0, H); g.closePath(); g.fill(); g.strokeStyle = '#f2c21a'; g.lineWidth = 6; g.stroke(); g.strokeStyle = '#f2c21a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 70); g.lineTo(64, 170); g.moveTo(30, 60); g.lineTo(30, 140); g.quadraticCurveTo(34, 170, 64, 170); g.quadraticCurveTo(94, 170, 98, 140); g.lineTo(98, 60); g.stroke(); });
const carvedWin = (T) => T.canvasTex(128, 128, (g) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#2a3a5a'; g.fillRect(34, 40, 60, 56); g.strokeStyle = '#3a2410'; g.lineWidth = 6; g.strokeRect(34, 40, 60, 56); g.fillStyle = '#c83a2a'; g.beginPath(); g.moveTo(22, 40); g.lineTo(64, 6); g.lineTo(106, 40); g.closePath(); g.fill(); g.strokeStyle = '#3a2410'; g.stroke(); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(36 + i * 14, 104, 7, 0, Math.PI); g.stroke(); } });
const MEMO = new WeakMap(); const memo = (T, k, f) => { let m = MEMO.get(T); if (!m) MEMO.set(T, m = {}); return m[k] ||= f(); };

// ---------- buildings ----------
// gabled prism roof (ridge along x)
function gable(T, w, d, h, mat, x, y, z, rot = 0) { const { THREE } = T; const sh = new THREE.Shape(); sh.moveTo(-d / 2 - 0.6, 0); sh.lineTo(0, h); sh.lineTo(d / 2 + 0.6, 0); sh.lineTo(-d / 2 - 0.6, 0); const geo = new THREE.ExtrudeGeometry(sh, { depth: w + 1.2, bevelEnabled: false }); geo.translate(0, 0, -(w + 1.2) / 2); const m = new THREE.Mesh(geo, mat); m.rotation.y = Math.PI / 2 + rot; m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
// log house with straw (or plank) roof; o.burn → returns roof anchor for fires
export function izba(st, x, y, z, w = 7, d = 6, h = 4.2, o = {}) {
  const T = st.T, { THREE } = T, rot = o.rot || 0, g = new THREE.Group();
  const lm = memo(T, 'log' + (o.wall || ''), () => T.mat('#ffffff', { map: logTex(T, o.wall || '#8a5a32') }));
  const tm = memo(T, 'th' + (o.roof || ''), () => T.mat('#ffffff', { map: thatchTex(T, o.roof || '#c8a050') }));
  g.add(T.box(w, h, d, lm, 0, h / 2, 0)); g.add(gable(T, w, d, h * 0.85, tm, 0, h, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(T.box(0.7, h, 0.7, lm, sx * w / 2, h / 2, sz * d / 2));
  const win = T.plane(1.9, 1.9, memo(T, 'win', () => T.mat('#ffffff', { map: carvedWin(T) }))); win.position.set(w * 0.22, h * 0.55, d / 2 + 0.03); win.userData.noOutline = true; g.add(win);
  const door = T.box(1.3, 2.4, 0.2, T.mat('#4a2e18'), -w * 0.22, 1.2, d / 2 + 0.05); g.add(door);
  if (o.chimney !== false) g.add(T.box(0.8, 1.6, 0.8, T.mat('#7a6a5a'), w * 0.25, h + h * 0.6, 0));
  g.position.set(x, y, z); g.rotation.y = rot; st.add(g); return { group: g, roofTop: [x, y + h + h * 0.6, z] };
}
// tall terem palace: two storeys, gallery, steep tent roofs
export function terem(st, x, y, z, s = 1) {
  const T = st.T, { THREE } = T, lm = T.mat('#ffffff', { map: logTex(T, '#9a6a3a') }), rm = T.mat('#ffffff', { map: A.roofTex(T, '#6a3a22') });
  st.add(T.box(16 * s, 8 * s, 12 * s, lm, x, y + 4 * s, z), T.box(12 * s, 6 * s, 9 * s, lm, x, y + 11 * s, z));
  st.add(gable(T, 16 * s, 12 * s, 2.5 * s, rm, x, y + 8 * s, z), gable(T, 12 * s, 9 * s, 7 * s, rm, x, y + 14 * s, z));
  for (const sx of [-1, 1]) { st.add(T.box(4 * s, 14 * s, 4 * s, lm, x + sx * 10 * s, y + 7 * s, z + 4 * s)); const c = new THREE.Mesh(new THREE.ConeGeometry(3.4 * s, 8 * s, 4), rm); c.rotation.y = Math.PI / 4; c.position.set(x + sx * 10 * s, y + 18 * s, z + 4 * s); c.castShadow = true; st.add(c); }
  const b = T.plane(3 * s, 6 * s, T.mat('#ffffff', { map: tridentBanner(T), side: THREE.DoubleSide })); b.position.set(x, y + 10 * s, z + 6.1 * s); b.userData.noOutline = true; b.userData.flag = true; st.add(b);
  for (let i = 0; i < 4; i++) { const wn = T.plane(1.6 * s, 1.6 * s, memo(T, 'win', () => T.mat('#ffffff', { map: carvedWin(T) }))); wn.position.set(x - 5 * s + i * 3.3 * s, y + 4.5 * s, z + 6.05 * s); wn.userData.noOutline = true; st.add(wn); }
}
// pointed-stake palisade ring with gate and towers
export function palisade(st, cx, cz, rad, o = {}) {
  const T = st.T, { THREE } = T, h = o.h || 6, y = o.y || 0, n = o.n || Math.round(rad * 2.2), gate = o.gate ?? Math.PI / 2;
  const sm = memo(T, 'stake', () => T.mat('#7a5232')), geo = new THREE.CylinderGeometry(0.45, 0.5, h, 6), tip = new THREE.ConeGeometry(0.5, 1.4, 6);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - gate), Math.cos(a - gate))) < 0.08) continue; const px = cx + Math.cos(a) * rad, pz = cz + Math.sin(a) * rad, hh = 1 + ((i * 7) % 3) * 0.06; const m = new THREE.Mesh(geo, sm); m.scale.y = hh; m.position.set(px, y + h * hh / 2, pz); m.castShadow = true; st.add(m); const t = new THREE.Mesh(tip, sm); t.position.set(px, y + h * hh + 0.7, pz); st.add(t); }
  const lm = memo(T, 'log', () => T.mat('#ffffff', { map: logTex(T) })), rm = memo(T, 'twr', () => T.mat('#ffffff', { map: A.roofTex(T, '#5a3a22') }));
  const towers = o.towers ?? 4; for (let k = 0; k < towers; k++) { const a = gate + (k === 0 ? 0.12 : k / towers * Math.PI * 2), px = cx + Math.cos(a) * rad, pz = cz + Math.sin(a) * rad; st.add(T.box(4, h + 6, 4, lm, px, y + (h + 6) / 2, pz)); const c = new THREE.Mesh(new THREE.ConeGeometry(3.6, 4.5, 4), rm); c.rotation.y = Math.PI / 4; c.position.set(px, y + h + 8.2, pz); c.castShadow = true; st.add(c); }
  const ga = gate - 0.12, gx = cx + Math.cos(ga) * rad, gz = cz + Math.sin(ga) * rad; st.add(T.box(4, h + 6, 4, lm, gx, y + (h + 6) / 2, gz)); const c = new THREE.Mesh(new THREE.ConeGeometry(3.6, 4.5, 4), rm); c.rotation.y = Math.PI / 4; c.position.set(gx, y + h + 8.2, gz); st.add(c);
}
// a fortified hill town: mound + palisade + rings of izbas + yards; returns roof anchors (for fires/birds)
export function hillTown(st, cx, cz, o = {}) {
  const T = st.T, { THREE } = T, rad = o.rad || 40, hy = o.hill ?? 8, r = rng(o.seed || 11), roofs = [];
  // natural plateau hill (lathe profile) — grass slopes, earth/grass top, granite boulders & cliffs when o.rock
  const prof = [[0, hy], [rad * 1.06, hy], [rad * 1.18, hy * 0.86], [rad * 1.32, hy * 0.55], [rad * 1.5, hy * 0.22], [rad * 1.72, 0.02], [rad * 1.8, -0.4]].map(([x, y]) => new THREE.Vector2(x, y));
  const hill = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), T.mat('#ffffff', { map: W.grassTex(T, o.rock ? '#7a9448' : '#7aa04a', [14, 3]), side: THREE.DoubleSide })); hill.position.set(cx, 0, cz); hill.receiveShadow = true; hill.userData.noOutline = true; st.add(hill);
  const top = new THREE.Mesh(new THREE.CircleGeometry(rad * 1.04, 64), T.mat('#ffffff', { map: earthTex(T, '#8a7048', [10, 10]) })); top.rotation.x = -Math.PI / 2; top.position.set(cx, hy + 0.04, cz); top.receiveShadow = true; top.userData.noOutline = true; st.add(top);
  const slopeY = (d) => { for (let i = 1; i < prof.length; i++) if (d <= prof[i].x) { const a = prof[i - 1], b = prof[i], k = (d - a.x) / (b.x - a.x); return a.y + (b.y - a.y) * k; } return 0; };
  if (o.rock) { const gm = T.mat('#a8a296', { flat: true }), geo = new THREE.IcosahedronGeometry(1, 0); for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = rad * (1.1 + r() * 0.62); if (Math.abs(Math.atan2(Math.sin(a - (o.gate ?? Math.PI / 2)), Math.cos(a - (o.gate ?? Math.PI / 2)))) < 0.4) continue; const b = new THREE.Mesh(geo, gm), sc = 2 + r() * 4.5; b.scale.set(sc * (1 + r()), sc * (0.6 + r() * 0.7), sc * (1 + r() * 0.6)); b.rotation.set(r() * 3, r() * 3, r() * 3); b.position.set(cx + Math.cos(a) * d, slopeY(d) - sc * 0.2, cz + Math.sin(a) * d); b.castShadow = true; b.receiveShadow = true; st.add(b); }
    for (let i = 0; i < 9; i++) { const a = (o.cliffAt ?? Math.PI / 2) + (i - 4) * 0.13, d = rad * 1.5, b = new THREE.Mesh(geo, gm), sc = 7 + r() * 5; b.scale.set(sc * 1.4, sc * 1.2, sc); b.rotation.set(r(), r() * 3, r()); b.position.set(cx + Math.cos(a) * d, sc * 0.4, cz + Math.sin(a) * d); b.castShadow = true; st.add(b); }
    scatter(st, 'bush', 60, (rr) => { const a = rr() * 6.28, d = rad * (1.1 + rr() * 0.6); return [cx + Math.cos(a) * d, slopeY(d), cz + Math.sin(a) * d]; }, 4, { seed: 15 }); }
  scatter(st, 'grass', 220, (rr) => { const a = rr() * 6.28, d = rad * (1.08 + rr() * 0.66); return [cx + Math.cos(a) * d, slopeY(d), cz + Math.sin(a) * d]; }, 2.4, { seed: 16 });
  palisade(st, cx, cz, rad, { y: hy - 0.4, h: o.wallH || 6, gate: o.gate ?? Math.PI / 2 });
  if (o.terem) terem(st, cx, hy, cz - rad * 0.3, o.terem);
  const n = o.houses || 40; for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = rad * (0.25 + Math.sqrt(r()) * 0.62), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (o.terem && Math.hypot(x - cx, z - (cz - rad * 0.3)) < 14) continue; const hb = izba(st, x, hy, z, 5 + r() * 3, 4.5 + r() * 2, 3.4 + r() * 1.4, { rot: Math.round(a / (Math.PI / 2)) * Math.PI / 2 + (r() - 0.5) * 0.3, roof: ['#c8a050', '#b8904a', '#d0b060'][i % 3], wall: ['#8a5a32', '#7a4e2a', '#9a6a3a'][i % 3] }); roofs.push(hb.roofTop); }
  const inside = (rr) => { const a = rr() * Math.PI * 2, d = rad * Math.sqrt(rr()) * 0.85; return [cx + Math.cos(a) * d, hy, cz + Math.sin(a) * d]; };
  scatter(st, 'haystack', Math.round(n * 0.4), inside, 3.2, { seed: o.seed || 3 }); scatter(st, 'fence', Math.round(n * 0.6), inside, 3, { seed: 5 }); scatter(st, 'logpile', Math.round(n * 0.3), inside, 2.6, { seed: 6 });
  scatter(st, 'well', 3, inside, 2.6, { seed: 7 }); scatter(st, 'barrel', n, inside, 1.5, { seed: 8 }); scatter(st, 'chicken', Math.round(n * 0.6), inside, 1, { seed: 9 }); scatter(st, 'cart', 6, inside, 4, { seed: 10 });
  if (o.smoke !== false) scatter(st, 'smoke', Math.round(n * 0.5), (rr, i) => roofs[i] ? [roofs[i][0], roofs[i][1] + 3, roofs[i][2]] : null, 3.6, { seed: 12 });
  scatter(st, 'grass', o.grass ?? 500, (rr) => { const a = rr() * Math.PI * 2, d = rad * (1.05 + rr() * 1.4); return [cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d]; }, 2.8, { seed: 13 });
  scatter(st, 'bush', 80, (rr) => { const a = rr() * Math.PI * 2, d = rad * (1.3 + rr() * 2); return [cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d]; }, 5, { seed: 14 });
  return { roofs, hy };
}
// open countryside around a town: birch/pine forest, fields, river, rocks
export function steppe(st, o = {}) {
  const T = st.T; A.flatGround(st, 2000, W.grassTex(T, o.grass || '#86a650', [120, 120]));
  if (o.river) { const wm = A.waterStrip(st, o.river, o.riverW || 40); if (wm) wm.userData.water = true; }
  const fc = ['#c8b84a', '#9ac04a', '#e0c060', '#b8a840']; if (o.fields) for (const [fx, fz] of o.fields) for (let i = 0; i < 4; i++) { const p = T.plane(26, 18, T.mat('#ffffff', { map: W.fieldTex(T, fc[i % 4], i % 2 ? 'h' : 'v', i + fx) })); p.rotation.x = -Math.PI / 2; p.position.set(fx + (i % 2) * 28, 0.12, fz + Math.floor(i / 2) * 20); p.userData.noOutline = true; st.add(p); }
  const clear = o.clear || (() => false);
  A.addTrees(st, o.trees ?? 260, (r) => { const a = r() * Math.PI * 2, d = (o.forestIn || 160) + r() * 500, x = Math.cos(a) * d, z = Math.sin(a) * d; return clear(x, z) ? null : [x, 0, z]; }, { size: 12 });
  scatter(st, 'tree', o.birch ?? 80, (r) => { const x = -400 + r() * 800, z = -400 + r() * 800; return clear(x, z) || Math.hypot(x, z) < (o.forestIn || 160) * 0.7 ? null : [x, 0, z]; }, 11);
  scatter(st, 'grass', o.tufts ?? 600, (r) => { const x = -300 + r() * 600, z = -300 + r() * 600; return clear(x, z) ? null : [x, 0, z]; }, 3);
  scatter(st, 'flowerbed', 60, (r) => { const x = -300 + r() * 600, z = -300 + r() * 600; return clear(x, z) ? null : [x, 0, z]; }, 5);
  scatter(st, 'rock', 50, (r) => [-350 + r() * 700, 0, -350 + r() * 700], 3.5);
}
// burial mound
export function kurgan(st, x, z, rad = 16, h = 7) { const T = st.T, { THREE } = T, m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 14, 0, Math.PI * 2, 0, Math.PI / 2), T.mat('#ffffff', { map: W.grassTex(T, '#7a9a48', [6, 6]) })); m.scale.set(rad, h, rad); m.position.set(x, 0, z); m.receiveShadow = true; m.castShadow = true; st.add(m); scatter(st, 'grass', 60, (r) => { const a = r() * 6.28, d = rad * (0.95 + r() * 0.3); return [x + Math.cos(a) * d, 0, z + Math.sin(a) * d]; }, 2.4); }
// Viking/Rus' longboat (hull + strakes + shields + carved prow); sits with keel at y
export function longboat(st, x, y, z, s = 1, rot = 0, o = {}) {
  const T = st.T, { THREE } = T, g = new THREE.Group(), wood = T.mat('#ffffff', { map: logTex(T, o.wood || '#7a4a26', [1, 2]) });
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), wood); hull.scale.set(9 * s, 2.4 * s, 2.6 * s); hull.position.y = 2.4 * s; hull.castShadow = true; g.add(hull);
  const deck = T.box(17 * s, 0.2, 4.4 * s, T.mat('#5a3a1e'), 0, 2.3 * s, 0); g.add(deck);
  for (const sx of [-1, 1]) { const pr = new THREE.Mesh(new THREE.TorusGeometry(2.6 * s, 0.35 * s, 6, 16, Math.PI * 0.6), wood); pr.rotation.z = sx > 0 ? -0.2 : Math.PI + 0.2; pr.position.set(sx * 7.4 * s, 4.4 * s, 0); pr.scale.set(1, 1.1, 0.6); g.add(pr); }
  const cols = ['#c8202a', '#f2c21a', '#2a4a9a', '#f4f0e6']; for (const sz of [-1, 1]) for (let i = 0; i < 7; i++) { const sh = T.cyl(0.8 * s, 0.8 * s, 0.2, T.mat(cols[(i + (sz > 0 ? 1 : 0)) % 4]), -6.6 * s + i * 2.2 * s, 2.9 * s, sz * 2.45 * s, 14); sh.rotation.x = Math.PI / 2; g.add(sh); }
  if (o.mast !== false) { g.add(T.cyl(0.18 * s, 0.22 * s, 10 * s, T.mat('#5a3a1e'), 0, 7 * s, 0)); const sail = T.plane(7 * s, 6 * s, T.mat('#ffffff', { map: T.canvasTex(128, 128, (cg) => { for (let i = 0; i < 8; i++) { cg.fillStyle = i % 2 ? '#c8202a' : '#f4ead8'; cg.fillRect(i * 16, 0, 16, 128); } }), side: THREE.DoubleSide })); sail.position.set(0, 8 * s, 0.3); sail.userData.noOutline = true; g.add(sail); }
  g.position.set(x, y, z); g.rotation.y = rot; st.add(g); return g;
}
// open pit with earthen walls + spoil heaps; boat optional inside
export function burialPit(st, x, z, w = 22, d = 9, o = {}) {
  const T = st.T, em = T.mat('#ffffff', { map: earthTex(T, '#5a3a22', [3, 1]) }), wh = o.wall || 3.2;
  const fl = T.ground(w, d, '#3a2414'); fl.position.set(x, 0.08, z); fl.userData.noOutline = true; st.add(fl);
  st.add(T.box(w + 2, wh, 1, em, x, wh / 2, z - d / 2), T.box(w + 2, wh, 1, em, x, wh / 2, z + d / 2), T.box(1, wh, d, em, x - w / 2, wh / 2, z), T.box(1, wh, d, em, x + w / 2, wh / 2, z));
  const { THREE } = T; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), em); m.scale.set(5 + (i % 3), 3 + (i % 2), 4); m.position.set(x - w / 2 + 2 + i * (w / 5), 0, z - d / 2 - 4.5); st.add(m); }
  scatter(st, 'shovel', 3, (r, i) => [x - w / 2 + 2 + i * 2, 0, z + d / 2 + 2.6], 1.6); return fl;
}
// small log bathhouse with barred door
export function banya(st, x, z, o = {}) { const T = st.T; const h = izba(st, x, 0, z, 9, 7, 4.2, { roof: '#a8884a', chimney: true, ...o }); st.add(T.box(1.9, 2.9, 0.3, T.mat('#3a2410'), x - 2, 1.45, z + 3.6)); if (o.barred) st.add(T.box(3.4, 0.45, 0.45, T.mat('#2a1a0a'), x - 2, 1.6, z + 3.85)); return h; }
// striped round tent with pole, flag and door flap
const tentTex = (T, a, b) => T.canvasTex(256, 128, (g, Wd, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 16, 0, 16, H); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, H - 14, Wd, 14); g.fillStyle = '#2a1a10'; g.beginPath(); g.moveTo(120, H); g.lineTo(128, H * 0.35); g.lineTo(136, H); g.fill(); });
export function campTent(st, x, z, s = 1, i = 0) { const T = st.T, { THREE } = T, cols = [['#e8dcc4', '#a8302a'], ['#d8c8a0', '#3a5a8a'], ['#e8dcc4', '#c8a050'], ['#c8b088', '#7a2a22']][i % 4]; const m = memo(T, 'tent' + (i % 4), () => T.mat('#ffffff', { map: tentTex(T, ...cols) })); const c = new THREE.Mesh(new THREE.ConeGeometry(2.8 * s, 3.6 * s, 14, 1, true), m); c.position.set(x, 1.8 * s, z); c.rotation.y = (i * 1.3) % 6.28; c.castShadow = true; st.add(c); const wall = new THREE.Mesh(new THREE.CylinderGeometry(2.8 * s, 2.8 * s, 1.2 * s, 14, 1, true), m); wall.position.set(x, 0.6 * s, z); st.add(wall); c.position.y = 1.2 * s + 1.8 * s; st.add(T.cyl(0.08 * s, 0.08 * s, 1.6 * s, T.mat('#4a2e18'), x, 5.4 * s, z)); const f = T.plane(0.9 * s, 0.5 * s, T.basic(cols[1], { side: THREE.DoubleSide })); f.position.set(x + 0.45 * s, 5.9 * s, z); f.userData.noOutline = true; st.add(f); }
// siege ring: tents, campfires, banners, horses, carts, spear racks, soldiers; returns {fires}
export function siegeCamp(st, cx, cz, rIn, rOut, o = {}) {
  const T = st.T, { THREE } = T, r = rng(o.seed || 21), fireAt = [];
  for (let i = 0; i < (o.tents || 60); i++) { const a = r() * Math.PI * 2, d = rIn + r() * (rOut - rIn); if (o.skip?.(a)) continue; campTent(st, cx + Math.cos(a) * d, cz + Math.sin(a) * d, 1.4 + r() * 0.8, i); if (i % 3 === 0) fireAt.push([cx + Math.cos(a + 0.05) * (d - 5), 0, cz + Math.sin(a + 0.05) * (d - 5)]); }
  for (let i = 0; i < (o.banners || 10); i++) { const a = i / (o.banners || 10) * Math.PI * 2 + 0.2, d = rIn - 4; const px = cx + Math.cos(a) * d, pz = cz + Math.sin(a) * d; st.add(T.cyl(0.2, 0.2, 12, T.mat('#4a2e18'), px, 6, pz)); const b = T.plane(2.6, 5, T.mat('#ffffff', { map: memo(T, 'tb', () => tridentBanner(T)), side: THREE.DoubleSide })); b.position.set(px + 1.3, 9.2, pz); b.userData.noOutline = true; b.userData.flag = true; st.add(b); }
  const ring = (rr) => { const a = rr() * Math.PI * 2, d = rIn + rr() * (rOut - rIn); return o.skip?.(a) ? null : [cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d]; };
  scatter(st, 'horse', o.horses || 30, ring, 4.2, { seed: 31 }); scatter(st, 'cart', 14, ring, 4.5, { seed: 32 }); scatter(st, 'spears', 24, ring, 3.4, { seed: 33 }); scatter(st, 'barrel', 30, ring, 1.5, { seed: 34 }); scatter(st, 'sack', 30, ring, 1.3, { seed: 35 }); scatter(st, 'logpile', 16, ring, 2.6, { seed: 36 });
  const fires = sharedFires(st, fireAt.slice(0, o.fires || 22), 2.4, 3.2, { light: o.night ? 3 : 0 });
  return { fires, fireAt };
}

// ---------- shared animated effects (cheap: 3 textures for any number of sprites) ----------
function fireCanvas(T) { const { THREE } = T, c = document.createElement('canvas'); c.width = 96; c.height = 128; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), tex }; }
function drawFlames(g, t, Wd, H, k) { g.clearRect(0, 0, Wd, H); for (let i = 0; i < 6; i++) { const x = 14 + i * 13.5, hh = H * (0.55 + 0.3 * Math.sin(t * 9 + i * 1.7 + k * 2)); const gr = g.createLinearGradient(0, H, 0, H - hh); gr.addColorStop(0, 'rgba(255,245,170,1)'); gr.addColorStop(0.45, 'rgba(255,150,40,.95)'); gr.addColorStop(1, 'rgba(210,40,10,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 16, H); g.quadraticCurveTo(x - 6 + Math.sin(t * 7 + i + k) * 6, H - hh * 0.6, x + Math.sin(t * 6 + i) * 5, H - hh); g.quadraticCurveTo(x + 10, H - hh * 0.5, x + 16, H); g.fill(); } }
export function sharedFires(st, pts, w = 4, h = 5, o = {}) {
  const T = st.T, { THREE } = T, cv = [0, 1, 2].map(() => fireCanvas(T)), sprites = [];
  pts.forEach((p, i) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cv[i % 3].tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); sp.center.set(0.5, 0.05); const sc = 0.8 + ((i * 37) % 10) / 20; sp.scale.set(w * sc, h * sc, 1); sp.position.set(...p); sp.userData.base = sc; st.add(sp); sprites.push(sp); });
  for (let i = 0; i < (o.light || 0) && i < pts.length; i++) { const L = new THREE.PointLight('#ff9040', 60, 40, 1.5); L.position.set(pts[i][0], pts[i][1] + 3, pts[i][2]); st.add(L); }
  const update = (t, grow = 1) => { cv.forEach((c, k) => drawFlames(c.g, t, 96, 128, k)); cv.forEach((c) => (c.tex.needsUpdate = true)); sprites.forEach((sp, i) => { const g = typeof grow === 'function' ? grow(i) : grow; sp.visible = g > 0.02; sp.scale.set(w * sp.userData.base * g, h * sp.userData.base * g, 1); }); };
  update(0); return { sprites, update };
}
// flock of birds; o.fire → burning sulfur bundle + ember trail. path(i, t) → [x,y,z]
export function flock(st, n, path, o = {}) {
  const T = st.T, { THREE } = T, cvs = [0, 1, 2, 3].map(() => { const c = document.createElement('canvas'); c.width = 128; c.height = 96; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), tex }; });
  const sprites = []; for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cvs[i % 4].tex, transparent: true, depthWrite: false, fog: false })); sp.scale.set(o.size || 3, (o.size || 3) * 0.75, 1); st.add(sp); sprites.push(sp); }
  const draw = (cg, t, k) => { cg.clearRect(0, 0, 128, 96); const fl = Math.sin(t * 22 + k * 1.6), cx = 64, cy = 48; if (o.fire) { glow(cg, cx + 6, cy + 18, 46, '#ff9a3a', 0.7); for (let j = 0; j < 4; j++) poly(cg, [[cx - 6 + j * 5, cy + 22], [cx - 4 + j * 5 + Math.sin(t * 15 + j) * 4, cy + 2 - Math.abs(Math.sin(t * 11 + j + k)) * 14], [cx + j * 5, cy + 22]], j % 2 ? '#ffe27a' : '#ff6a1a'); }
    const body = o.color || (k % 2 ? '#d8d4cc' : '#9a8a7a'); cg.lineJoin = 'round'; cg.fillStyle = body; cg.strokeStyle = OL; cg.lineWidth = 4;
    for (const sd of [-1, 1]) { cg.beginPath(); cg.moveTo(cx + sd * 6, cy); cg.quadraticCurveTo(cx + sd * 30, cy - 20 * fl - 6, cx + sd * 54, cy - 30 * fl); cg.quadraticCurveTo(cx + sd * 30, cy + 4, cx + sd * 6, cy + 8); cg.closePath(); cg.fill(); cg.stroke(); }
    cg.beginPath(); cg.ellipse(cx, cy + 4, 16, 10, 0, 0, 7); cg.fill(); cg.stroke(); cg.beginPath(); cg.arc(cx + 14, cy - 2, 7, 0, 7); cg.fill(); cg.stroke(); poly(cg, [[cx + 20, cy - 3], [cx + 28, cy], [cx + 20, cy + 1]], '#e0a030'); };
  const update = (t) => { cvs.forEach((c, k) => { draw(c.g, t, k); c.tex.needsUpdate = true; }); sprites.forEach((sp, i) => { const p = path(i, t); if (!p) { sp.visible = false; return; } sp.visible = true; sp.position.set(...p); }); };
  update(0); return { sprites, update };
}
// log-hall interior (Olga's hall / feast hall). returns {stage, fires}
export function logHall(T, o = {}) {
  const { THREE } = T, st = A.stage(T, { sky: ['#0a0806', '#1a1208', '#2a1a10'], fogColor: '#1a1008', amb: o.dark ? '#5a3a2a' : '#9a7050', key: '#ffd0a0', keyPos: [10, 30, 20], ki: o.dark ? 0.6 : 1.2, a: o.dark ? 0.8 : 1.25, fog: [40, 160] });
  const lm = T.mat('#ffffff', { map: logTex(T, '#7a4a26', [1, 8]) }), lw = T.mat('#ffffff', { map: logTex(T, '#7a4a26', [6, 6]) });
  A.flatGround(st, 140, T.planks('#5a3a22', 18, [10, 10]));
  st.add(T.box(60, 30, 2, lw, 0, 15, -40), T.box(2, 30, 90, lw, -24, 15, 0), T.box(2, 30, 90, lw, 24, 15, 0));
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const z = -30 + k * 18; st.add(T.cyl(1.1, 1.3, 30, lm, sx * 15, 15, z, 10)); for (let j = 0; j < 3; j++) st.add(T.box(2.8, 0.5, 2.8, T.mat(['#c8202a', '#f2c21a', '#2a6a4a'][j]), sx * 15, 6 + j * 6, z)); const b = T.plane(4.6, 9, T.mat('#ffffff', { map: memo(T, 'tb', () => tridentBanner(T)), side: THREE.DoubleSide })); b.position.set(sx * 22.8, 17, z + 9); b.rotation.y = sx * Math.PI / 2; b.userData.noOutline = true; st.add(b); }
  for (let k = 0; k < 6; k++) st.add(T.box(48, 1.4, 1.4, lm, 0, 28, -36 + k * 14));
  const rug = T.plane(8, 70, T.mat('#ffffff', { map: T.canvasTex(64, 256, (g) => { g.fillStyle = '#8a1a22'; g.fillRect(0, 0, 64, 256); g.strokeStyle = '#f2c21a'; g.lineWidth = 4; g.strokeRect(6, 6, 52, 244); for (let y = 20; y < 250; y += 30) { g.beginPath(); g.moveTo(32, y); g.lineTo(46, y + 14); g.lineTo(32, y + 28); g.lineTo(18, y + 14); g.closePath(); g.stroke(); } }) })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.06, 0); rug.userData.noOutline = true; st.add(rug);
  const fireAt = []; for (const [x, z] of [[-21, -22], [21, -22], [-21, 4], [21, 4], [-21, 26], [21, 26]]) { st.add(T.cyl(0.22, 0.32, 3, T.mat('#3a2a1a'), x, 9, z)); fireAt.push([x, 10.3, z]); }
  // hearth pit in the middle
  st.add(T.cyl(4, 4.3, 0.6, T.mat('#5a5048'), 0, 0.3, 14, 14)); fireAt.push([0, 0.5, 14]);
  const fires = sharedFires(st, fireAt, 2.2, 3.2); fires.sprites[fires.sprites.length - 1].scale.set(6, 7, 1); fires.sprites[fires.sprites.length - 1].userData.base = 2.6;
  for (const p of fireAt) { const L = new THREE.PointLight('#ffb060', o.dark ? 45 : 28, 42, 1.6); L.position.set(p[0], p[1] + 2, p[2]); st.add(L); }
  if (o.throne !== false) { const wood = T.mat('#6a3a1e'), gold = T.mat('#d8a830'); st.add(T.box(12, 1.6, 8, T.mat('#8a1a22'), 0, 0.8, -33), T.box(5, 3, 4, wood, 0, 3.1, -33), T.box(5.4, 9, 1, wood, 0, 7, -35), T.box(6, 1, 1.2, gold, 0, 11.6, -35)); scatter(st, 'fur', 2, (r, i) => [-1.4 + i * 2.8, 1.62, -31], 2.4); }
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const z = -30 + k * 18; wallProp(st, 'shield', sx * 22.9, 10, z + 4, 3.2, sx * Math.PI / 2, k + 2); wallProp(st, 'fur', sx * 22.9, 5, z + 13, 4.4, sx * Math.PI / 2, k); wallProp(st, 'spears', sx * 22.9, 0.2, z + 9, 5, sx * Math.PI / 2); }
  if (o.tables !== false) for (const [tx, tz] of o.tables || [[-10, -14], [10, -14], [-10, 4], [10, 4], [-10, 22], [10, 22]]) { st.add(T.box(4, 2.6, 12, T.mat('#6a4226'), tx, 1.3, tz)); for (const sx of [-1, 1]) st.add(T.box(1.3, 1.4, 11, T.mat('#5a3a22'), tx + sx * 3.1, 0.7, tz)); scatter(st, 'goblet', 6, (r, i) => [tx - 1 + (i % 2) * 2, 2.62, tz - 5 + i * 2], 0.6); scatter(st, 'bread', 2, (r, i) => [tx, 2.62, tz - 3 + i * 6], 1.3); scatter(st, 'fruit', 2, (r, i) => [tx, 2.62, tz - 0.5 + i * 1.5], 1.2); scatter(st, 'roast', 1, () => [tx, 2.62, tz + 1], 1.8); scatter(st, 'jug', 3, (r, i) => [tx + 1.2, 2.62, tz - 4 + i * 4], 1.1); scatter(st, 'candle', 3, (r, i) => [tx - 1.2, 2.62, tz - 4 + i * 4], 0.45, { fog: false }); }
  scatter(st, 'barrel', 6, (r, i) => [-19 + (i % 2) * 1.6, 0, 30 + i * 1.3], 1.6); scatter(st, 'logpile', 2, (r, i) => [19, 0, 30 + i * 4], 3); scatter(st, 'sack', 4, (r, i) => [17 - i * 1.3, 0, 36], 1.3);
  o.extra?.(st);
  return { stage: A.finish(T, st), fires };
}
