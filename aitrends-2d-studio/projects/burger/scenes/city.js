// city.js — REUSABLE modern US small-town world for painted 3D scenes: streets with markings, sidewalks,
// storefront / brick / stucco buildings with painted facades, a generic burger restaurant (glass front,
// pole sign "BURGERS", drive-thru, parking), back alley with dumpsters, 3D cars + moving traffic,
// street lamps, traffic lights, power lines, a student dorm room interior, and a Japan finale (Fuji, Tokyo, pagoda, plane).
import { rng, shade, alpha, glow, text, rr } from '/engine/core.js';
import * as W from './world3d.js';
import * as A from './aerial.js';
import { scatter, wallProp } from './props.js';

const MEMO = new WeakMap(); const memo = (T, k, f) => { let m = MEMO.get(T); if (!m) MEMO.set(T, m = {}); return m[k] ||= f(); };
// ---------- textures ----------
export const asphalt = (T, rep = [40, 4]) => T.canvasTex(256, 256, (g, Wd, H) => { g.fillStyle = '#4a4a52'; g.fillRect(0, 0, Wd, H); const r = rng(3); for (let i = 0; i < 1500; i++) { g.fillStyle = r() < 0.5 ? '#3e3e46' : '#5a5a62'; g.fillRect(r() * Wd, r() * H, 2, 2); } g.fillStyle = '#f2d24a'; g.fillRect(0, H / 2 - 5, Wd * 0.55, 10); g.fillStyle = '#f4f2ea'; g.fillRect(0, 8, Wd, 6); g.fillRect(0, H - 14, Wd, 6); }, rep);
export const pavement = (T, base = '#c8c0b4', rep = [60, 2]) => T.canvasTex(128, 128, (g, Wd, H) => { g.fillStyle = base; g.fillRect(0, 0, Wd, H); g.strokeStyle = shade(base, -0.18); g.lineWidth = 3; for (let x = 0; x <= Wd; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.beginPath(); g.moveTo(0, H / 2); g.lineTo(Wd, H / 2); g.stroke(); }, rep);
export const lotTex = (T, rep = [4, 2]) => T.canvasTex(256, 256, (g, Wd, H) => { g.fillStyle = '#55555e'; g.fillRect(0, 0, Wd, H); g.strokeStyle = '#f4f2ea'; g.lineWidth = 5; for (let x = 0; x <= Wd; x += 51) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H * 0.42); g.stroke(); g.beginPath(); g.moveTo(x, H); g.lineTo(x, H * 0.58); g.stroke(); } }, rep);
// facade: storefront ground floor + rows of windows; kinds brick | stucco | siding
export const facade = (T, o = {}) => { const kind = o.kind || 'brick', base = o.color || { brick: '#a8563a', stucco: '#e8d4b0', siding: '#8ab0c8' }[kind], fl = o.floors || 2, lit = o.lit ?? 0.3, r = rng(o.seed || 5);
  return T.canvasTex(256, 128 * fl, (g, Wd, H) => { g.fillStyle = base; g.fillRect(0, 0, Wd, H);
    if (kind === 'brick') { g.strokeStyle = shade(base, -0.22); g.lineWidth = 1.5; for (let y = 0; y < H; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wd, y); g.stroke(); for (let x = (y / 8) % 2 ? 0 : 12; x < Wd; x += 24) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 8); g.stroke(); } } }
    if (kind === 'siding') { g.strokeStyle = shade(base, -0.18); g.lineWidth = 2; for (let y = 0; y < H; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wd, y); g.stroke(); } }
    for (let f = 0; f < fl - 1; f++) for (let i = 0; i < 4; i++) { const x = 18 + i * 60, y = 22 + f * 128; g.fillStyle = '#f4f0e6'; g.fillRect(x - 4, y - 4, 44, 76); g.fillStyle = r() < lit ? '#ffd88a' : '#3a4a6a'; g.fillRect(x, y, 36, 68); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 4, y + 4, 10, 60); g.strokeStyle = '#f4f0e6'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 18, y); g.lineTo(x + 18, y + 68); g.stroke(); }
    const sy = H - 128; g.fillStyle = o.awning || ['#c8302a', '#2a6a4a', '#3a5a9a', '#d8a030'][(o.seed || 0) % 4]; g.beginPath(); g.moveTo(6, sy + 14); g.lineTo(Wd - 6, sy + 14); g.lineTo(Wd - 16, sy + 36); g.lineTo(16, sy + 36); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = 16; x < Wd - 16; x += 24) g.fillRect(x, sy + 16, 10, 18);
    g.fillStyle = r() < 0.5 ? '#ffe2a0' : '#bcd8e8'; g.fillRect(16, sy + 44, Wd - 92, 74); g.fillStyle = '#2a2a34'; g.fillRect(Wd - 66, sy + 44, 46, 84); g.strokeStyle = '#2a2a34'; g.lineWidth = 4; g.strokeRect(16, sy + 44, Wd - 92, 74);
    g.fillStyle = '#2a2a34'; g.font = 'bold 15px sans-serif'; g.textAlign = 'center'; g.fillText(o.shop || ['DINER', 'BOOKS', 'LAUNDRY', 'PHARMACY', 'BARBER', 'HARDWARE', 'PIZZA', 'GAMES'][(o.seed || 0) % 8], Wd / 2 - 30, sy + 12); }); };
const signTex = (T, o = {}) => T.canvasTex(512, 256, (g, Wd, H) => { g.fillStyle = '#c8202a'; rr(g, 6, 6, Wd - 12, H - 12, 40); g.fill(); g.lineWidth = 12; g.strokeStyle = '#f2c21a'; g.stroke();
  const bx = 110, by = 128; g.fillStyle = '#e8a040'; g.beginPath(); g.ellipse(bx, by - 26, 70, 40, 0, Math.PI, 0); g.fill(); g.fillStyle = '#6a3a1a'; g.fillRect(bx - 72, by - 22, 144, 22); g.fillStyle = '#5ab040'; g.fillRect(bx - 74, by - 2, 148, 10); g.fillStyle = '#f2c21a'; g.fillRect(bx - 70, by + 8, 140, 8); g.fillStyle = '#e8a040'; rr(g, bx - 70, by + 16, 140, 28, 12); g.fill();
  g.fillStyle = '#ffffff'; g.font = 'bold 92px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(o.text || 'BURGERS', 200, by + 4); if (o.sub) { g.font = 'bold 34px sans-serif'; g.fillStyle = '#f2c21a'; g.fillText(o.sub, 204, by + 76); } });
const bannerWin = (T) => T.canvasTex(512, 160, (g, Wd, H) => { g.fillStyle = '#f2c21a'; g.fillRect(0, 0, Wd, H); g.strokeStyle = '#c8202a'; g.lineWidth = 10; g.strokeRect(5, 5, Wd - 10, H - 10); g.fillStyle = '#c8202a'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.fillText('COLLECT THE CODES!', Wd / 2, 60); g.font = 'bold 58px sans-serif'; g.fillText('WIN $1,000,000', Wd / 2, 125); });
const glassTex = (T) => T.canvasTex(512, 128, (g, Wd, H) => { g.fillStyle = '#ffe8b8'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#c8302a'; g.fillRect(0, H * 0.62, Wd, H * 0.38); for (let i = 0; i < 9; i++) { const x = 20 + i * 54; g.fillStyle = ['#3a5a9a', '#c87a3a', '#5a8a4a', '#8a4a8a'][i % 4]; g.beginPath(); g.arc(x + 14, 46, 9, 0, 7); g.fill(); g.fillRect(x + 6, 55, 16, 26); } g.strokeStyle = '#2a2a34'; g.lineWidth = 6; for (let x = 0; x <= Wd; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } g.strokeRect(0, 0, Wd, H); g.fillStyle = 'rgba(255,255,255,.3)'; for (let x = 10; x < Wd; x += 64) g.fillRect(x, 6, 12, H - 12); });

// ---------- builders ----------
export function building(st, x, z, w, d, h, o = {}) { const T = st.T, fl = Math.max(1, Math.round(h / 4.5)); const fm = T.mat('#ffffff', { map: facade(T, { ...o, floors: fl }) }), sm = T.mat(o.side || shade(o.color || '#a8563a', -0.12)); const m = new T.THREE.Mesh(new T.THREE.BoxGeometry(w, h, d), [sm, sm, sm, sm, o.back ? sm : fm, o.back ? fm : sm]); m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; m.material = m.material.map((mm) => mm); st.add(m); st.add(T.box(w + 0.6, 0.6, d + 0.6, T.mat(shade(o.color || '#a8563a', -0.3)), x, h + 0.3, z)); if (o.ac !== false) st.add(T.box(1.6, 1.1, 1.4, T.mat('#b8bcc4'), x + w * 0.2, h + 1.1, z)); return m; }
export function car(st, x, z, o = {}) { const T = st.T, { THREE } = T, g = new THREE.Group(), col = o.color || ['#c8302a', '#2a5aa8', '#f2c21a', '#f4f2ea', '#3a8a5a', '#2a2a34'][(o.i || 0) % 6]; const body = T.mat(col); g.add(T.box(4.4, 1.0, 1.9, body, 0, 0.9, 0)); g.add(T.box(2.4, 0.9, 1.7, T.mat('#bcd8e8'), -0.2, 1.8, 0)); g.add(T.box(2.5, 0.12, 1.8, body, -0.2, 2.3, 0)); for (const sx of [-1.4, 1.4]) for (const sz of [-0.95, 0.95]) { const w = T.cyl(0.42, 0.42, 0.3, T.mat('#1a1a1e'), sx, 0.42, sz, 14); w.rotation.x = Math.PI / 2; g.add(w); } for (const sz of [-0.6, 0.6]) { const l = T.box(0.1, 0.25, 0.35, T.basic('#fff6c8'), 2.2, 1.0, sz); l.userData.noOutline = true; g.add(l); } g.position.set(x, 0, z); g.rotation.y = o.rot || 0; st.add(g); return g; }
export function streetLamp(st, x, z, o = {}) { const T = st.T; st.add(T.cyl(0.12, 0.16, 7, T.mat('#3a3a44'), x, 3.5, z, 8)); st.add(T.box(1.6, 0.12, 0.12, T.mat('#3a3a44'), x + (o.dir || 1) * 0.8, 7, z)); const b = T.box(0.7, 0.3, 0.5, T.basic(o.on ? '#fff2b0' : '#e8e4d8'), x + (o.dir || 1) * 1.5, 6.85, z); b.userData.noOutline = true; st.add(b); if (o.on) { const L = new T.THREE.PointLight('#ffd890', 40, 18, 1.6); L.position.set(x + (o.dir || 1) * 1.5, 6.3, z); st.add(L); } }
export function trafficLight(st, x, z) { const T = st.T; st.add(T.cyl(0.12, 0.12, 6, T.mat('#3a3a44'), x, 3, z, 8)); st.add(T.box(0.7, 1.9, 0.6, T.mat('#2a2a30'), x, 6.4, z)); for (const [c, y] of [['#e83a2a', 7], ['#f2c21a', 6.4], ['#3ac85a', 5.8]]) { const l = T.sphere(0.2, T.basic(c), x, y, z + 0.32); l.userData.noOutline = true; st.add(l); } }
// the generic burger restaurant (front faces +z). returns anchors
export function burgerJoint(st, x, z, o = {}) {
  const T = st.T, { THREE } = T, w = 22, d = 14, h = 6.5;
  const wall = T.mat('#ffffff', { map: T.canvasTex(256, 128, (g, Wd, H) => { g.fillStyle = '#f2e6d0'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#c8302a'; g.fillRect(0, 0, Wd, 22); g.fillStyle = '#d8b890'; for (let y = 30; y < H; y += 14) g.fillRect(0, y, Wd, 3); }) });
  st.add(T.box(w, h, d, wall, x, h / 2, z)); const gl = T.plane(w - 4, 3.6, T.mat('#ffffff', { map: glassTex(T), emissive: '#ffd890', emissiveIntensity: o.night ? 0.6 : 0.2 })); gl.position.set(x, 2.2, z + d / 2 + 0.03); gl.userData.noOutline = true; st.add(gl);
  st.add(T.box(w + 1.2, 1.4, d + 1.2, T.mat('#c8302a'), x, h + 0.7, z)); st.add(T.box(w * 0.5, 2.2, 1, T.mat('#f2c21a'), x, h + 2.1, z + d / 2)); const sg = T.plane(w * 0.48, 2.0, T.basic('#ffffff', { map: signTex(T) })); sg.position.set(x, h + 2.1, z + d / 2 + 0.52); sg.userData.noOutline = true; st.add(sg);
  if (o.banner) { const b = T.plane(9, 2.8, T.basic('#ffffff', { map: bannerWin(T) })); b.position.set(x - 5, h - 0.6, z + d / 2 + 0.06); b.userData.noOutline = true; b.userData.flag = true; st.add(b); }
  const px = x + w / 2 + 6, pz = z + d / 2 + 6; st.add(T.cyl(0.4, 0.5, 16, T.mat('#c8302a'), px, 8, pz)); const ps = new THREE.Mesh(new THREE.BoxGeometry(9, 4.5, 0.8), [T.mat('#c8302a'), T.mat('#c8302a'), T.mat('#c8302a'), T.mat('#c8302a'), T.basic('#ffffff', { map: signTex(T, { sub: o.banner ? 'WIN $1,000,000!' : 'OPEN 24/7' }) }), T.basic('#ffffff', { map: signTex(T) })]); ps.position.set(px, 17, pz); ps.userData.noOutline = true; st.add(ps);
  // drive-thru lane + menu board + parking
  const lot = T.ground(w + 30, 16, '#ffffff', lotTex(T, [5, 1])); lot.position.set(x + 4, 0.04, z + d / 2 + 8); lot.userData.noOutline = true; st.add(lot);
  st.add(T.box(0.3, 3, 4, T.mat('#2a2a34'), x - w / 2 - 3, 1.8, z + 2)); const mb = T.plane(3.8, 2.6, T.basic('#ffffff', { map: T.canvasTex(128, 96, (g) => { g.fillStyle = '#2a2a34'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#f2c21a'; for (let i = 0; i < 6; i++) g.fillRect(10, 10 + i * 13, 60 + (i % 3) * 16, 6); }) })); mb.rotation.y = Math.PI / 2; mb.position.set(x - w / 2 - 2.8, 2.4, z + 2); mb.userData.noOutline = true; st.add(mb);
  // back alley: dumpsters, bags, back door, crates
  for (let i = 0; i < 3; i++) dumpster(st, x - 6 + i * 6, z - d / 2 - 3, { color: ['#2a6a4a', '#3a5a9a', '#2a6a4a'][i] });
  st.add(T.box(2, 3.2, 0.3, T.mat('#7a7a84'), x + 8, 1.6, z - d / 2 - 0.1));
  scatter(st, 'trashbag', 14, (r, i) => [x - 9 + (i % 7) * 3 + r(), 0, z - d / 2 - 5.5 - Math.floor(i / 7) * 1.4], 1.6, { seed: 21 }); scatter(st, 'crate', 4, (r, i) => [x + 10 + (i % 2) * 1.8, 0, z - d / 2 - 2 - i], 1.6);
  scatter(st, 'cup', 20, (r) => [x - 10 + r() * 20, 0, z - d / 2 - 7 - r() * 4], 0.6, { seed: 23 });
  return { front: [x, 0, z + d / 2], back: [x, 0, z - d / 2], pole: [px, 0, pz], door: [x + 6, 0, z + d / 2] };
}
export function dumpster(st, x, z, o = {}) { const T = st.T; const m = T.mat(o.color || '#2a6a4a'); st.add(T.box(4, 2.2, 2.2, m, x, 1.2, z)); const lid = T.box(4.2, 0.2, 2.4, T.mat(shade(o.color || '#2a6a4a', -0.2)), x, 2.4, z - 0.2); lid.rotation.x = -0.25; st.add(lid); for (const sx of [-1.6, 1.6]) st.add(T.cyl(0.2, 0.2, 0.2, T.mat('#1a1a1e'), x + sx, 0.15, z + 0.8, 8)); }
// a whole small-town strip around the burger joint; returns {joint, traffic}
export function town(st, o = {}) {
  const T = st.T, r = rng(o.seed || 4);
  A.flatGround(st, 2000, W.grassTex(T, '#6cc84a', [120, 120]));
  const road = T.ground(1200, 14, '#ffffff', asphalt(T, [60, 1])); road.position.set(0, 0.06, 18); road.userData.noOutline = true; st.add(road);
  for (const sz of [9, 27]) { const sw = T.ground(1200, 4, '#ffffff', pavement(T)); sw.position.set(0, 0.1, sz); sw.userData.noOutline = true; st.add(sw); st.add(T.box(1200, 0.25, 0.3, T.mat('#9a948a'), 0, 0.12, sz + (sz < 18 ? 2 : -2))); }
  const cross = T.ground(14, 400, '#ffffff', asphalt(T, [1, 20])); cross.rotation.y = 0; cross.position.set(-60, 0.07, 18); cross.userData.noOutline = true; st.add(cross);
  const joint = burgerJoint(st, 0, -10, o);
  for (let i = 0; i < 18; i++) { const x = -200 + i * 22 + (i > 8 ? 14 : 0); if (Math.abs(x) < 30 || Math.abs(x + 60) < 12) continue; const h = 6 + r() * 10; building(st, x, -4, 18, 10, h, { kind: ['brick', 'stucco', 'siding'][i % 3], seed: i, lit: o.night ? 0.7 : 0.25 }); }
  for (let i = 0; i < 18; i++) { const x = -200 + i * 22; if (Math.abs(x + 60) < 12) continue; const h = 6 + r() * 12; building(st, x, 40, 18, 10, h, { kind: ['stucco', 'brick', 'siding'][i % 3], seed: i + 30, lit: o.night ? 0.7 : 0.25, back: true }); }
  for (let i = 0; i < 16; i++) streetLamp(st, -150 + i * 20, i % 2 ? 26 : 10, { dir: i % 2 ? -1 : 1, on: o.night });
  trafficLight(st, -51, 10); trafficLight(st, -69, 26);
  for (let i = 0; i < 40; i++) { st.add(T.cyl(0.18, 0.22, 9, T.mat('#6a4a32'), -200 + i * 30, 4.5, 30, 6)); }
  scatter(st, 'tree', 50, (rr, i) => [-200 + i * 8 + rr() * 4, 0, i % 2 ? 31.5 : 6.6], 6, { seed: 5 });
  scatter(st, 'bush', 60, (rr) => [-200 + rr() * 400, 0, rr() < 0.5 ? 7 : 30.5], 2.6, { seed: 6 }); scatter(st, 'grass', 400, (rr) => [-200 + rr() * 400, 0, rr() < 0.5 ? -24 - rr() * 30 : 48 + rr() * 30], 2.2, { seed: 7 });
  scatter(st, 'hydrant', 6, (rr, i) => [-140 + i * 50, 0, 10.5], 1, { seed: 8 }); scatter(st, 'bench', 6, (rr, i) => [-130 + i * 48, 0, 26.5], 2.4, { seed: 9 }); scatter(st, 'cone', 6, (rr, i) => [80 + i * 2, 0, 12], 0.9);
  A.addTrees(st, 160, (rr) => { const a = rr() * 6.28, d = 220 + rr() * 300; return [Math.cos(a) * d, 0, Math.sin(a) * d]; }, { size: 12 });
  for (let i = 0; i < 6; i++) car(st, 4 + i * 4.6, -10 + 14, { i, rot: Math.PI / 2 });
  // traffic: cars drive along the road both ways
  const lanes = []; for (let i = 0; i < 10; i++) { const dir = i % 2 ? 1 : -1, c = car(st, 0, 18 + dir * -3.3, { i: i + 2, rot: dir > 0 ? 0 : Math.PI }); lanes.push({ c, dir, off: i * 47 + r() * 20, sp: 12 + r() * 6 }); }
  const traffic = (t) => lanes.forEach((L) => { L.c.position.x = ((L.off + L.dir * t * L.sp + 240) % 480 + 480) % 480 - 240; });
  traffic(0); return { joint, traffic };
}
// student dorm room interior (camera inside, looking -z at the desk/window wall). returns {stage-less parts}
export function dorm(st, o = {}) {
  const T = st.T, { THREE } = T;
  A.flatGround(st, 60, T.planks('#8a6a4a', 14, [6, 6]));
  const wm = T.mat(o.wall || '#d8c8e8'); st.add(T.box(18, 10, 0.4, wm, 0, 5, -7), T.box(0.4, 10, 18, wm, -9, 5, 0), T.box(0.4, 10, 18, wm, 9, 5, 0), T.box(18, 0.4, 18, T.mat('#efe8f0'), 0, 10, 0));
  const win = T.plane(5.4, 3.6, T.basic('#ffffff', { map: T.canvasTex(256, 170, (g, Wd, H) => { const gr = g.createLinearGradient(0, 0, 0, H); (o.night ? ['#0a0e2a', '#2a2a5a', '#5a3a6a'] : ['#3a4a9a', '#e8705a', '#ffc070']).forEach((c, i) => gr.addColorStop(i / 2, c)); g.fillStyle = gr; g.fillRect(0, 0, Wd, H); const r = rng(9); for (let i = 0; i < 14; i++) { const x = i * 19, hh = 40 + r() * 80; g.fillStyle = '#1a1a2a'; g.fillRect(x, H - hh, 17, hh); for (let k = 0; k < 8; k++) { g.fillStyle = r() < 0.5 ? '#ffd88a' : '#2a2a3a'; g.fillRect(x + 3 + (k % 2) * 7, H - hh + 6 + Math.floor(k / 2) * 12, 4, 6); } } g.strokeStyle = '#f4f0e6'; g.lineWidth = 10; g.strokeRect(0, 0, Wd, H); g.beginPath(); g.moveTo(Wd / 2, 0); g.lineTo(Wd / 2, H); g.stroke(); }) })); win.position.set(3.5, 5.6, -6.78); win.userData.noOutline = true; st.add(win);
  // Japan poster (Fuji + red sun) and other posters
  const poster = (draw, x, y, z, w, h, ry = 0) => { const p = T.plane(w, h, T.basic('#ffffff', { map: T.canvasTex(160, 220, draw) })); p.position.set(x, y, z); p.rotation.y = ry; p.userData.noOutline = true; st.add(p); return p; };
  poster((g, Wd, H) => { g.fillStyle = '#f4eadc'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#e0302a'; g.beginPath(); g.arc(Wd / 2, 70, 34, 0, 7); g.fill(); g.fillStyle = '#5a6a9a'; g.beginPath(); g.moveTo(10, 170); g.lineTo(Wd / 2, 80); g.lineTo(Wd - 10, 170); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(Wd / 2 - 24, 112); g.lineTo(Wd / 2, 80); g.lineTo(Wd / 2 + 24, 112); g.fill(); g.fillStyle = '#f2a0b8'; for (let i = 0; i < 20; i++) { g.beginPath(); g.arc(10 + (i * 37) % 140, 180 + (i * 13) % 30, 6, 0, 7); g.fill(); } g.fillStyle = '#2a2a34'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('JAPAN', Wd / 2, 32); }, -3.6, 6.2, -6.75, 2.4, 3.3);
  poster((g, Wd, H) => { g.fillStyle = '#1a1a2a'; g.fillRect(0, 0, Wd, H); g.fillStyle = '#3ac85a'; g.font = 'bold 16px monospace'; for (let i = 0; i < 12; i++) g.fillText(['01101', 'if(x)', '{ }', 'for i', '0xFF', '=>'][i % 6], 12, 24 + i * 16); }, -8.75, 6, -2, 2.2, 3, Math.PI / 2);
  // desk + monitor (live canvas) + keyboard + chair + lamp
  st.add(T.box(7, 0.3, 2.8, T.mat('#8a5a32'), 3.5, 3, -5.4)); for (const sx of [0.4, 6.6]) st.add(T.box(0.3, 3, 2.6, T.mat('#6a4226'), sx, 1.5, -5.4));
  const mc = document.createElement('canvas'); mc.width = 512; mc.height = 320; const mtex = new THREE.CanvasTexture(mc); mtex.colorSpace = THREE.SRGBColorSpace;
  st.add(T.box(3.8, 2.4, 0.2, T.mat('#1a1a22'), 3.5, 4.6, -6.2)); const scr = T.plane(3.5, 2.1, new THREE.MeshBasicMaterial({ map: mtex })); scr.position.set(3.5, 4.6, -6.08); scr.userData.noOutline = true; st.add(scr); st.add(T.box(0.3, 0.9, 0.3, T.mat('#1a1a22'), 3.5, 3.5, -6.2));
  st.add(T.box(2.6, 0.1, 0.8, T.mat('#2a2a34'), 3.5, 3.2, -4.8)); const glowL = new THREE.PointLight('#8ab8ff', 0, 12, 1.6); glowL.position.set(3.5, 4.6, -5); st.add(glowL);
  st.add(T.cyl(0.08, 0.1, 1.6, T.mat('#2a2a30'), 6.4, 3.9, -6), T.cone(0.5, 0.6, T.mat('#f2c21a'), 6.4, 4.8, -6)); const lamp = new THREE.PointLight('#ffd890', 18, 12, 1.6); lamp.position.set(6.4, 4.4, -5.6); st.add(lamp);
  // bed, shelf, laundry, guitar-ish clutter
  st.add(T.box(4.6, 1.4, 8, T.mat('#5a4a3a'), -6.4, 0.7, 1.5), T.box(4.4, 0.6, 7.6, T.mat('#3a6ea5'), -6.4, 1.6, 1.6), T.box(3, 0.5, 1.4, T.mat('#f4f0e6'), -6.6, 2.1, -1.6));
  wallProp(st, 'shelf', -8.75, 5.2, 4.5, 3.6, Math.PI / 2); scatter(st, 'books', 3, (r, i) => [-1.4 + i * 1.1, 3.15, -5.6], 0.9);
  const cupPile = []; return { mc, mtex, glowL, lamp };
}
// live monitor painter: phase 'code' (scrolling codes), 'green' (match), t-driven
export function paintMonitor(m, t, phase = 'code', o = {}) { const g = m.mc.getContext('2d'), Wd = 512, H = 320; g.fillStyle = phase === 'green' ? '#0a3a1a' : '#0a0e1a'; g.fillRect(0, 0, Wd, H); g.font = 'bold 20px monospace';
  if (phase === 'green') { g.fillStyle = '#3aff6a'; for (let i = 0; i < 9; i++) g.fillText(['PATTERN FOUND', 'DATE  ⇒ 0417', 'PLANT ⇒ F-23', 'BOX 14 · TUE', 'BOX 31 · THU', 'BOX 52 · MON', 'MATCH 100%', '>>> WINNER', ''][i], 24, 34 + i * 32); const a = 0.5 + 0.5 * Math.sin(t * 8); g.fillStyle = `rgba(58,255,106,${0.15 + a * 0.2})`; g.fillRect(0, 0, Wd, H); }
  else { const r = rng(Math.floor(t * 12)); for (let i = 0; i < 12; i++) { g.fillStyle = i === 11 ? '#f2c21a' : '#5ab0ff'; let s = ''; for (let k = 0; k < 3; k++) s += Math.floor(r() * 9000 + 1000) + '-'; g.fillText(s + (r() < 0.5 ? 'A' : 'F') + Math.floor(r() * 90 + 10) + '  ✗', 20, 26 + i * 25); } g.fillStyle = '#f4f0e6'; g.fillText('codes: ' + (o.count || Math.floor(t * 900)), 300, 305); }
  m.mtex.needsUpdate = true; m.glowL.intensity = phase === 'green' ? 30 : 6; m.glowL.color.set(phase === 'green' ? '#3aff6a' : '#8ab8ff'); }
// Japan finale: Fuji, Tokyo skyline, pagoda, cherry blossoms
export function japan(st, o = {}) { const T = st.T, { THREE } = T; A.flatGround(st, 2000, W.grassTex(T, '#6cc84a', [120, 120]));
  const fuji = new THREE.Mesh(new THREE.ConeGeometry(160, 120, 48, 1, true), T.mat('#6a7aa8')); fuji.position.set(0, 60, -420); fuji.userData.noOutline = true; st.add(fuji); const cap = new THREE.Mesh(new THREE.ConeGeometry(54, 41, 48), T.mat('#f4f6fa')); cap.position.set(0, 100, -419); cap.userData.noOutline = true; st.add(cap);
  const r = rng(12); for (let i = 0; i < 70; i++) { const x = -260 + i * 7.5 + r() * 3, h = 10 + r() * 50, z = -150 - r() * 60; const b = T.building(6, h, 6, { color: ['#3a3a5a', '#4a4a6a', '#5a5a7a'][i % 3], win: '#ffd88a', lit: 0.5, seed: i }); b.position.set(x, 0, z); st.add(b); }
  const tower = T.box(4, 70, 4, T.mat('#e8402a'), 60, 35, -170); st.add(tower); st.add(T.box(10, 3, 10, T.mat('#f4f0e6'), 60, 50, -170));
  // pagoda
  for (let k = 0; k < 5; k++) { st.add(T.box(9 - k * 1.2, 3, 9 - k * 1.2, T.mat('#c8302a'), -40, 1.5 + k * 4.2, -60)); const roof = new THREE.Mesh(new THREE.ConeGeometry((9 - k * 1.2) * 0.95, 1.6, 4), T.mat('#2a2a34')); roof.rotation.y = Math.PI / 4; roof.position.set(-40, 3.6 + k * 4.2, -60); st.add(roof); }
  scatter(st, 'sakura', 70, (rr) => { const x = -140 + rr() * 280, z = -110 + rr() * 140; return Math.abs(x) < 12 && z > -20 ? null : [x, 0, z]; }, 10, { seed: 3 }); scatter(st, 'grass', 400, (rr) => [-120 + rr() * 240, 0, -60 + rr() * 100], 2.2); scatter(st, 'petals', 40, (rr) => [-60 + rr() * 120, 2 + rr() * 14, -40 + rr() * 60], 3, { seed: 4, fog: false });
}
export function plane3D(st, o = {}) { const T = st.T, { THREE } = T, g = new THREE.Group(); const wht = T.mat('#f4f6fa'), blu = T.mat('#2a5aa8'); const f = T.cyl(1.4, 1.4, 22, wht, 0, 0, 0, 16); f.rotation.z = Math.PI / 2; g.add(f); const nose = T.sphere(1.4, wht, 11, 0, 0); nose.scale.set(1.6, 1, 1); g.add(nose); const tail = T.cone(1.4, 4, wht, -13, 0, 0, 16); tail.rotation.z = Math.PI / 2; g.add(tail); g.add(T.box(5, 0.3, 26, wht, 0, -0.4, 0)); g.add(T.box(2.6, 4.2, 0.3, blu, -13, 2.6, 0)); g.add(T.box(2.4, 0.3, 9, wht, -13, 0.6, 0)); for (const sz of [-5, 5]) { const e = T.cyl(0.7, 0.7, 3, T.mat('#b8bcc4'), 1, -1.2, sz, 12); e.rotation.z = Math.PI / 2; g.add(e); } const stripe = T.box(20, 0.5, 2.9, blu, 0, -0.2, 0); g.add(stripe); for (let i = 0; i < 12; i++) { const w = T.box(0.5, 0.5, 2.88, T.basic('#3a4a6a'), -8 + i * 1.5, 0.5, 0); w.userData.noOutline = true; g.add(w); } st.add(g); return g; }
