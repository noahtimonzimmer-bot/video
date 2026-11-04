// 00 — painted aerial worlds for the lifespan video (3D ground/buildings + 2D billboards), built from aerial.js.
import { E, ease, clamp, text, rng } from '/engine/core.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import { S } from '../lib.js';
import { verse } from '../creatures.js';
import { ark2, sheep } from '../sets/ill.js';

const title = (str, sub) => (g, t, info) => { const a = clamp(Math.min((t - 0.2) / 0.5, (info.dur - t) / 0.4)); if (a <= 0) return; g.save(); g.globalAlpha = a; text(g, str, E.W / 2, E.H * 0.45, { size: 104, color: '#fff2c8', font: 'Fredoka', weight: 700, spacing: 8, stroke: 16, strokeColor: '#3a2a22' }); if (sub) text(g, sub, E.W / 2, E.H * 0.57, { size: 40, color: '#fff2c8', font: 'Nunito', weight: 900, spacing: 8, stroke: 8, strokeColor: '#3a2a22' }); g.restore(); };
const tag = (str) => (g, t, info) => verse(g, t, str, { dur: info.dur });
const ageTag = (str, name, age) => (g, t, info) => { verse(g, t, str, { dur: info.dur }); const a = clamp(Math.min((t - 0.2) / 0.3, (info.dur - t) / 0.3)); if (a <= 0) return; text(g, name, E.W / 2, E.H * 0.74, { size: 70, color: '#fff2c8', font: 'Fredoka', weight: 700, alpha: a, stroke: 12, strokeColor: '#3a2a22' }); text(g, String(age), E.W / 2, E.H * 0.86, { size: 110, color: '#ffd47e', font: 'Fredoka', weight: 700, alpha: a, stroke: 14, strokeColor: '#3a2a22' }); };

// ---------- the world before the flood (lush valley, villages, four rivers) ----------
const RIV = [[[0, 0], [30, 25], [70, 35], [130, 70], [260, 90], [420, 120]], [[0, 0], [-25, 35], [-60, 100], [-110, 220], [-160, 420]], [[0, 0], [-35, -20], [-100, -40], [-260, -30], [-440, -60]], [[0, 0], [25, -40], [55, -110], [70, -260], [90, -440]]];
function preflood(T, o = {}) {
  const st = A.stage(T); A.flatGround(st, 1600, W.grassTex(T, '#7ab84a', [90, 90]));
  for (const p of RIV) A.waterStrip(st, p, 10);
  const pond = T.cyl(14, 14, 0.3, T.mat('#ffffff', { map: W.waterTex(T, [2, 2]) }), 0, 0.1, 0, 32); pond.userData.noOutline = true; st.add(pond);
  if (o.villages !== false) { const r = rng(5); for (const [cx, cz] of [[90, -70], [-110, 60], [70, 150]]) for (let i = 0; i < 14; i++) A.house(st, cx + (r() - 0.5) * 50, 0, cz + (r() - 0.5) * 40, 5 + r() * 3, 4 + r() * 3, 4 + r() * 2, { roof: ['#d85a4a', '#c84a3a', '#e07a4a'][i % 3] }); }
  A.addPeaks(st, { n: 12, dist: 520, w: 640, y: -20 });
  A.addTrees(st, 460, (r) => { const a = r() * Math.PI * 2, d = 22 + r() * 260, x = Math.cos(a) * d, z = Math.sin(a) * d; for (const p of RIV) for (const [px, pz] of p) if (Math.hypot(x - px, z - pz) < 9) return null; return [x, 0, z]; }, { palms: 0.25, size: 11, seed: 3 });
  A.addTrees(st, 1, () => [-10, 0, 8], { size: 26, seed: 11 });
  A.addClouds(st, 16, { y: 110, dist: 380 });
  return A.finish(T, st);
}
S('009', {"in": "dip", "bars": "scope", "sfx": [["impact", 0.1, -6], ["riser", 0.0, -12]], "scene": "aerial of the pre-flood world, title DID THEY REALLY LIVE 900 YEARS?"}, { kind: '3d', init: (T) => ({ stage: preflood(T) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 0, 0], radius: [240, 215], height: [150, 130], from: -0.5, to: -0.15, dur: info.dur }), overlay: title('DID THEY REALLY LIVE 900 YEARS?', 'GENESIS 5') });
S('010', {"in": "dip", "amb": ["wind", -26], "scene": "aerial: glide over the villages of the first generations"}, { kind: '3d', init: (T) => ({ stage: preflood(T) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [200, 70, 120], look: [90, 0, -70] }], [info.dur, { pos: [150, 45, 40], look: [90, 0, -70] }]]), overlay: tag('GENESIS 5') });

// ---------- MESOPOTAMIA: Euphrates, ziggurat, mud-brick city ----------
S('044', {"in": "dip", "amb": ["wind", -24], "sfx": [["whoosh", 0.1, -14]], "scene": "aerial Mesopotamia: the Euphrates, a stepped ziggurat, a mud-brick city, palms"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#5a6ab8', '#f2a07a', '#fbd8a8'], fogColor: '#f0c8a0', amb: '#fff0e0', key: '#ffd8a8', keyPos: [100, 50, 30] });
  A.flatGround(st, 1600, A.sandTex(T, '#e4c08a', [70, 70]));
  A.waterStrip(st, [[-800, 60], [-300, 40], [0, 70], [300, 50], [800, 80]], 34);
  const fc = ['#9ac04a', '#c8b84a', '#7aa83a', '#b8c060'];
  for (let i = -16; i < 16; i++) for (let j = 0; j < 2; j++) { const p = T.plane(17, 17, T.mat('#ffffff', { map: W.fieldTex(T, fc[(i + j + 20) % 4], (i + j) % 2 ? 'h' : 'v', i * 5 + j) })); p.rotation.x = -Math.PI / 2; p.position.set(i * 18, 0.14, 100 + j * 18); p.userData.noOutline = true; st.add(p); }
  const zm = (c) => T.mat('#ffffff', { map: W.stoneTex(T, c, [3, 1]) });
  [[60, 9, '#d8a868'], [44, 9, '#e0b478'], [30, 9, '#e8c088'], [16, 9, '#f0cc98']].forEach(([w, h, c], k) => st.add(T.box(w, h, w, zm(c), -40, h / 2 + k * h, -40)));
  st.add(T.box(8, 6, 8, T.mat('#3a6ea5'), -40, 39, -40)); st.add(T.box(10, 36, 30, zm('#c8945a'), -40, 9, -8));
  const r = rng(3); for (let i = 0; i < 110; i++) { const x = -160 + r() * 260, z = -170 + r() * 190; if (Math.hypot(x + 40, z + 40) < 45) continue; A.house(st, x, 0, z, 5 + r() * 5, 5 + r() * 4, 3.5 + r() * 3, { flat: true, wall: ['#e0c090', '#d8b080', '#ecd0a0'][i % 3] }); }
  A.wall(st, -40, -70, 135, { h: 8, color: '#d8b080' });
  A.addTrees(st, 220, (r) => [-500 + r() * 1000, 0, 70 + (r() < 0.5 ? -1 : 1) * (22 + r() * 12)], { palms: 1, size: 11, seed: 5 });
  A.addPeaks(st, { kind: 'dunes', n: 10, dist: 620, w: 700, y: -20 }); A.addClouds(st, 10, { y: 130 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [-40, 10, -40], radius: [220, 185], height: [95, 75], from: 0.2, to: 0.6, dur: info.dur }), overlay: tag('MESOPOTAMIA') });

// ---------- THE FLOOD: endless sea, the ark, storm clouds ----------
S('051', {"in": "dip", "amb": ["rain", -16], "sfx": [["thunder", 0.2, -8]], "scene": "aerial: the whole world is water — the ark alone under storm clouds"}, { kind: '3d', init(T) {
  const { THREE } = T, st = A.stage(T, { sky: ['#2a2a3a', '#4a4a5a', '#7a7280'], fogColor: '#5a5a6a', amb: '#8a8aa0', key: '#c8c8e0', ki: 1.4, a: 1.8, fog: [120, 600] });
  A.flatGround(st, 2000, A.seaTex(T, [90, 90]));
  const plank = T.mat('#ffffff', { map: T.planks('#8a5a32', 14, [4, 1]) });
  st.add(T.box(60, 9, 14, plank, 0, 3.5, 0)); st.add(T.box(36, 7, 10, T.mat('#ffffff', { map: T.planks('#a0703e', 10, [3, 1]) }), 0, 11, 0));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7.5, 40, 4, 1), T.mat('#6a4226')); roof.rotation.z = Math.PI / 2; roof.rotation.x = Math.PI / 4; roof.scale.set(1, 1, 0.5); roof.position.set(0, 16, 0); st.add(roof);
  A.addClouds(st, 30, { y: 70, dist: 260, size: 140 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 6, 0], radius: [130, 110], height: [45, 35], from: 0.4, to: 0.9, dur: info.dur }), overlay: (g, t, info) => { for (let i = 0; i < 240; i++) { const x = (i * 97 + t * 900 * (0.6 + (i % 5) * 0.1)) % (E.W + 200) - 100, y = (i * 53 + t * 1600) % (E.H + 100) - 50; g.strokeStyle = 'rgba(210,220,240,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 10, y + 40); g.stroke(); } verse(g, t, 'GENESIS 7', { dur: info.dur }); } });

// ---------- ARARAT: the ark on the mountains, water receding ----------
S('076', {"in": "dip", "amb": ["wind", -22], "sfx": [["shimmer", 0.3, -10]], "scene": "aerial: the ark resting high on snowy mountains as the water recedes"}, { kind: '3d', init(T) {
  const st = A.stage(T, { fog: [300, 1100] });
  const M = { seed: 101, mount: 0, flat: 9999, rough: 2 };
  const hf = (x, z) => Math.max(0, 150 - Math.hypot(x, z) * 0.7) + W.heightAt(x, z, M) * 3 + Math.max(0, 90 - Math.hypot(x - 200, z + 120) * 0.8);
  st.add(W.terrain(T, { size: 1400, seg: 260, height: hf, map: W.grassTex(T, '#8aa860', [1, 1]), rep: 70 }));
  st.add(W.terrain(T, { size: 240, seg: 140, height: (x, z) => hf(x, z) + 0.5, map: A.rockTex(T, '#f2f0ec', [1, 1]), rep: 14 }));
  const water = A.flatGround(st, 2000, A.seaTex(T, [90, 90]), 40);
  st.add(T.box(30, 5, 7, T.mat('#ffffff', { map: T.planks('#8a5a32', 14, [3, 1]) }), 18, hf(18, 10) + 2, 10)); st.add(T.box(18, 4, 5, T.mat('#a0703e'), 18, hf(18, 10) + 6, 10));
  A.addTrees(st, 160, (r) => { const a = r() * Math.PI * 2, d = 120 + r() * 200, x = Math.cos(a) * d, z = Math.sin(a) * d, h = hf(x, z); return h > 42 && h < 120 ? [x, h, z] : null; }, { size: 9 });
  A.addClouds(st, 18, { y: 180, dist: 360, size: 120 });
  return { stage: A.finish(T, st), water };
}, draw: (s, t, info, T) => { s.water.position.y = 40 - 18 * ease.inOut(t / info.dur); T.orbit(s.stage.camera, t, { target: [0, 110, 0], radius: [330, 290], height: [190, 170], from: 0.8, to: 1.2, dur: info.dur }); }, overlay: tag('GENESIS 8:4') });

// ---------- CANAAN: Abraham's tents among hills, flocks ----------
S('082', {"in": "dip", "amb": ["wind", -24], "sfx": [["shimmer", 0.4, -16]], "scene": "aerial Canaan: rolling hills, Abraham's tent camp, flocks of sheep"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#6aaee8', '#c8e0ee', '#fbecc8'], fogColor: '#e8e4c8' });
  const C = { seed: 121, mount: 0, flat: 9999, rough: 3 };
  const hf = (x, z) => W.heightAt(x, z, C) * 4 + 6;
  st.add(W.terrain(T, { size: 1400, seg: 240, height: hf, map: W.grassTex(T, '#a8b85a', [1, 1]), rep: 80 }));
  A.addSprites(st, 'tent', 24, (r, i) => { const a = i * 2.4, d = 6 + Math.sqrt(i) * 8, x = Math.cos(a) * d, z = Math.sin(a) * d; return [x, hf(x, z) - 0.4, z]; }, 9);
  const r = rng(9); for (let i = 0; i < 90; i++) { const x = 30 + r() * 80, z = -40 + r() * 80; const sp = W.sprite(T, 'sheep' + (i % 3), 2.2, 1.6, (g, Wd, H) => { g.save(); g.scale(Wd / 120, H / 90); sheep(g, 50, 86, 1.1, 0, i % 3); g.restore(); }, { px: 128 }); sp.position.set(x, hf(x, z), z); st.add(sp); }
  A.addTrees(st, 260, (r) => { const x = -400 + r() * 800, z = -400 + r() * 800; if (Math.hypot(x, z) < 50) return null; return [x, hf(x, z), z]; }, { size: 9, seed: 7 });
  A.addPeople(st, [['abraham', 4, hf(4, 6), 6, 1, 'stand', 'smile']], { w: 3.4, key: 'abr' });
  A.addPeaks(st, { n: 10, dist: 620, w: 700, y: -10 }); A.addClouds(st, 12, { y: 140 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [20, 10, 0], radius: [120, 100], height: [55, 45], from: -0.3, to: 0.2, dur: info.dur }), overlay: ageTag('GENESIS 25:7', 'ABRAHAM', 175) });

// ---------- EGYPT (Joseph, 110) ----------
S('083', {"in": "whip", "amb": ["wind", -24], "scene": "aerial Egypt: the Nile, fields, palms, pyramids"}, { kind: '3d', init(T) {
  const { THREE } = T, st = A.stage(T, { sky: ['#6aa8e0', '#c8e0ee', '#fbecc8'], fogColor: '#f2e0b8', amb: '#fff4e0' });
  A.flatGround(st, 1600, A.sandTex(T, '#ecc890', [70, 70]));
  A.waterStrip(st, [[-800, 20], [-300, 0], [0, 10], [300, -10], [800, 0]], 28);
  const fc = ['#9ac04a', '#c8b84a', '#7aa83a', '#b8c060'];
  for (let i = -14; i < 14; i++) for (const [z0, sz] of [[34, 1], [-40, -1]]) for (let j = 0; j < 2; j++) { const p = T.plane(17, 17, T.mat('#ffffff', { map: W.fieldTex(T, fc[(i + j + 20) % 4], (i + j) % 2 ? 'h' : 'v', i * 7 + j + (sz > 0 ? 0 : 99)) })); p.rotation.x = -Math.PI / 2; p.position.set(i * 18, 0.14, z0 + sz * j * 18); p.userData.noOutline = true; st.add(p); }
  const r = rng(5); for (let i = 0; i < 46; i++) A.house(st, 30 + r() * 120, 0, -90 - r() * 80, 6 + r() * 5, 5 + r() * 4, 4 + r() * 3, { flat: true, wall: ['#ead6b0', '#e0c49a', '#f2e2c0'][i % 3] });
  const pyr = (x, z, s) => { const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.3, 4), T.mat('#ffffff', { map: W.stoneTex(T, '#e8cc90', [6, 6]) })); m.rotation.y = Math.PI / 4; m.position.set(x, s * 0.65, z); m.castShadow = true; st.add(m); };
  pyr(-80, -230, 46); pyr(10, -270, 36); pyr(-160, -290, 28);
  A.addTrees(st, 160, (r) => { const x = -400 + r() * 800, side = r() < 0.5 ? 1 : -1; return [x, 0, side * (16 + r() * 8)]; }, { palms: 1, size: 10, seed: 8 });
  A.addSprites(st, 'ship', 4, (r, i) => [-120 + i * 70, 0, 4 - i * 3], 12);
  A.addPeaks(st, { kind: 'dunes', n: 10, dist: 620, w: 700, y: -20 }); A.addClouds(st, 8, { y: 120 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [170, 50, 100], look: [0, 4, -80] }], [info.dur, { pos: [130, 40, 75], look: [-30, 4, -110] }]]), overlay: ageTag('GENESIS 50:26', 'JOSEPH', 110) });

// ---------- MOUNT NEBO: Moses looks over the promised land ----------
S('084', {"in": "whip", "amb": ["wind", -22], "sfx": [["shimmer", 0.3, -12]], "scene": "aerial from Mount Nebo over the Jordan valley and the promised land"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#5a7ac0', '#f0b48a', '#fbdcb0'], fogColor: '#f0d0b0', fog: [260, 1000] });
  const N = { seed: 131, mount: 0, flat: 9999, rough: 2 };
  const hf = (x, z) => W.heightAt(x, z, N) * 3 + Math.max(0, 120 - Math.hypot(x + 220, z) * 0.9) + Math.abs(z) * 0.02;
  st.add(W.terrain(T, { size: 1400, seg: 240, height: hf, map: W.grassTex(T, '#b8b070', [1, 1]), rep: 80 }));
  A.waterStrip(st, [[0, -700], [20, -300], [10, 0], [30, 300], [10, 700]], 14, { y: hf(10, 0) + 0.3 });
  A.addTrees(st, 300, (r) => { const x = -100 + r() * 400, z = -500 + r() * 1000; return [x, hf(x, z), z]; }, { palms: 0.4, size: 10, seed: 9 });
  A.addPeople(st, [['moses', -220, hf(-220, 0) + 0.2, 0, 1, 'stand', 'awe']], { w: 6, key: 'mos' });
  A.addClouds(st, 14, { y: 200, dist: 420 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [-260, 150, 40], look: [80, 20, 0] }], [info.dur, { pos: [-250, 140, 10], look: [120, 20, -60] }]]), overlay: ageTag('DEUTERONOMY 34:7', 'MOSES', 120) });

// ---------- EDEN: the tree of life ----------
S('115', {"in": "dip", "amb": ["wind", -26], "sfx": [["shimmer", 0.2, -10]], "scene": "aerial: Eden, the great tree of life at the centre of the four rivers"}, { kind: '3d', init: (T) => ({ stage: preflood(T, { villages: false }) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [-10, 12, 8], radius: [70, 55], height: [24, 20], from: 0.4, to: 1.0, dur: info.dur }), overlay: tag('GENESIS 2:9') });
