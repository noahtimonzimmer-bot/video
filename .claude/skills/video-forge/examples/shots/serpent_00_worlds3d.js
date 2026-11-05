// 00 — painted aerial worlds (3D ground/buildings + 2D billboards). Reusable builders live in aerial.js.
import { E, ease, clamp, text, rng } from '/engine/core.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import { S } from '../lib.js';
import { verse } from '../creatures.js';

// ---------- EDEN: valley, central spring, four rivers, orchard, snowy peaks ----------
const EDEN_RIV = [[[0, 0], [30, 25], [70, 35], [130, 70], [260, 90], [420, 120]], [[0, 0], [-25, 35], [-60, 100], [-110, 220], [-160, 420]], [[0, 0], [-35, -20], [-100, -40], [-260, -30], [-440, -60]], [[0, 0], [25, -40], [55, -110], [70, -260], [90, -440]]];
function eden(T) {
  const st = A.stage(T); A.flatGround(st, 1600, W.grassTex(T, '#7ab84a', [90, 90]));
  for (const p of EDEN_RIV) A.waterStrip(st, p, 10);
  const pond = T.cyl(14, 14, 0.3, T.mat('#ffffff', { map: W.waterTex(T, [2, 2]) }), 0, 0.1, 0, 32); pond.userData.noOutline = true; st.add(pond);
  A.addPeaks(st, { n: 12, dist: 520, w: 640, y: -20 });
  A.addTrees(st, 520, (r) => { const a = r() * Math.PI * 2, d = 22 + r() * 260, x = Math.cos(a) * d, z = Math.sin(a) * d; for (const p of EDEN_RIV) for (const [px, pz] of p) if (Math.hypot(x - px, z - pz) < 9) return null; return [x, 0, z]; }, { palms: 0.25, size: 9, seed: 3 });
  A.addTrees(st, 1, () => [-10, 0, 8], { size: 22, seed: 11 }); A.addTrees(st, 1, () => [12, 0, -6], { size: 20, seed: 12 });
  A.addClouds(st, 16, { y: 110, dist: 380 });
  return A.finish(T, st);
}
const titleOverlay = (str, sub) => (g, t, info) => { const a = clamp(Math.min((t - 0.2) / 0.5, (info.dur - t) / 0.4)); if (a <= 0) return; g.save(); g.globalAlpha = a; text(g, str, E.W / 2, E.H * 0.45, { size: 120, color: '#fff2c8', font: 'Fredoka', weight: 700, spacing: 10, stroke: 16, strokeColor: '#3a2a22' }); if (sub) text(g, sub, E.W / 2, E.H * 0.57, { size: 40, color: '#fff2c8', font: 'Nunito', weight: 900, spacing: 8, stroke: 8, strokeColor: '#3a2a22' }); g.restore(); };
S('007', {"in": "dip", "bars": "scope", "sfx": [["impact", 0.1, -6], ["shimmer", 0.3, -10]], "scene": "aerial Eden, title THE SERPENT IN EDEN"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 0, 0], radius: [230, 210], height: [150, 135], from: -0.5, to: -0.2, dur: info.dur }), overlay: titleOverlay('THE SERPENT IN EDEN', 'GENESIS 3') });
S('008', {"in": "dip", "amb": ["wind", -26], "scene": "aerial: glide from the mountains down into the garden"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [60, 120, 330], look: [0, 0, 0] }], [info.dur, { pos: [40, 55, 140], look: [0, 0, 0] }]]), overlay: (g, t, info) => verse(g, t, 'GENESIS 2:8', { dur: info.dur }) });
S('009', {"amb": ["wind", -26], "sfx": [["whoosh", 0.1, -16]], "scene": "aerial: skim low along the river through the orchard"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [200, 22, 110], look: [100, 4, 55] }], [info.dur, { pos: [80, 16, 50], look: [0, 4, 0] }]]) });
S('010', {"amb": ["wind", -26], "sfx": [["shimmer", 0.2, -14]], "scene": "top-down: the river splits into four, names appear"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [0, 340, 60], look: [0, 0, 0], fov: 46 }], [info.dur, { pos: [0, 290, 50], look: [0, 0, 0], fov: 46 }]]), overlay: (g, t) => { ['PISHON', 'GIHON', 'TIGRIS', 'EUPHRATES'].forEach((n, i) => { const a = clamp((t - 0.3 - i * 0.35) / 0.3); const p = [[E.W * 0.75, E.H * 0.38], [E.W * 0.36, E.H * 0.86], [E.W * 0.16, E.H * 0.42], [E.W * 0.58, E.H * 0.12]][i]; text(g, n, p[0], p[1], { size: 40, color: '#fff2c8', font: 'Fredoka', weight: 700, spacing: 4, alpha: a, stroke: 9, strokeColor: '#3a2a22' }); }); } });
S('011', {"amb": ["wind", -26], "sfx": [["shimmer", 0.3, -16]], "scene": "low drift through fruit trees and palms"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [-90, 8, 70], look: [-30, 6, 20] }], [info.dur, { pos: [-50, 8, 40], look: [0, 7, 0] }]]) });
S('012', {"amb": ["wind", -26], "sfx": [["riser", 0.2, -14]], "scene": "orbit the two great trees in the middle"}, { kind: '3d', init: (T) => ({ stage: eden(T) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [1, 10, 1], radius: [52, 44], height: [16, 14], from: 0.6, to: 1.15, dur: info.dur }) });

// ---------- EGYPT: Nile, fields, mud-brick town, pyramids ----------
S('035', {"in": "dip", "amb": ["wind", -24], "scene": "aerial Egypt: the Nile, fields, palms, town, pyramids"}, { kind: '3d', init(T) {
  const { THREE } = T, st = A.stage(T, { sky: ['#6aa8e0', '#c8e0ee', '#fbecc8'], fogColor: '#f2e0b8', amb: '#fff4e0' });
  A.flatGround(st, 1600, A.sandTex(T, '#ecc890', [70, 70]));
  A.waterStrip(st, [[-800, 20], [-300, 0], [0, 10], [300, -10], [800, 0]], 28);
  const fc = ['#9ac04a', '#c8b84a', '#7aa83a', '#b8c060'];
  for (let i = -14; i < 14; i++) for (const [z0, sz] of [[34, 1], [-40, -1]]) for (let j = 0; j < 2; j++) { const p = T.plane(17, 17, T.mat('#ffffff', { map: W.fieldTex(T, fc[(i + j + 20) % 4], (i + j) % 2 ? 'h' : 'v', i * 7 + j + (sz > 0 ? 0 : 99)) })); p.rotation.x = -Math.PI / 2; p.position.set(i * 18, 0.14, z0 + sz * j * 18); p.userData.noOutline = true; st.add(p); }
  const r = rng(5); for (let i = 0; i < 46; i++) { const x = 30 + r() * 120, z = -90 - r() * 80; A.house(st, x, 0, z, 6 + r() * 5, 5 + r() * 4, 4 + r() * 3, { flat: true, wall: ['#ead6b0', '#e0c49a', '#f2e2c0'][i % 3] }); }
  const pyr = (x, z, s) => { const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.3, 4), T.mat('#ffffff', { map: W.stoneTex(T, '#e8cc90', [6, 6]) })); m.rotation.y = Math.PI / 4; m.position.set(x, s * 0.65, z); m.castShadow = true; st.add(m); };
  pyr(-80, -230, 46); pyr(10, -270, 36); pyr(-160, -290, 28);
  A.addTrees(st, 160, (r) => { const x = -400 + r() * 800, side = r() < 0.5 ? 1 : -1; return [x, 0, side * (16 + r() * 8)]; }, { palms: 1, size: 10, seed: 8 });
  A.addSprites(st, 'ship', 4, (r, i) => [-120 + i * 70, 0, 4 - i * 3], 12);
  A.addPeaks(st, { kind: 'dunes', n: 10, dist: 620, w: 700, y: -20 }); A.addClouds(st, 8, { y: 120 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [170, 50, 100], look: [0, 4, -80] }], [info.dur, { pos: [120, 38, 70], look: [-30, 4, -110] }]]), overlay: (g, t, info) => verse(g, t, 'GENESIS 44:5', { dur: info.dur }) });

// ---------- WILDERNESS CAMP ----------
S('047', {"in": "dip", "amb": ["wind", -20], "sfx": [["wind", 0.2, -12]], "scene": "aerial: Israel's tent camp spread across the desert"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#7ab0e0', '#f2d4a0', '#fbe8c0'], fogColor: '#f6d8a8', amb: '#fff0d8', keyPos: [80, 60, 20] });
  A.flatGround(st, 1600, A.sandTex(T, '#e8bc80', [80, 80]));
  A.addSprites(st, 'tent', 420, (r, i) => { const a = i * 2.39996, d = 14 + Math.sqrt(i) * 7; return [Math.cos(a) * d, 0, Math.sin(a) * d]; }, 9);
  A.addPeople(st, Array.from({ length: 40 }, (_, i) => { const a = i * 1.7, d = 20 + (i * 13) % 120; return [['moses', 'adam', 'eve', 'isaiah', 'paul'][i % 5], Math.cos(a) * d, 0, Math.sin(a) * d, i % 2 ? 1 : -1, 'stand', 'worried']; }), { w: 2.6, key: 'camp' });
  const pole = T.cyl(0.4, 0.5, 18, T.mat('#8a5a2a'), 0, 9, 0, 8); st.add(pole); st.add(T.sphere(1.6, T.mat('#d8944a', { emissive: '#8a4a10', emissiveIntensity: 0.4 }), 0, 17.5, 0));
  A.addPeaks(st, { kind: 'dunes', n: 10, dist: 600, w: 700, y: -20 }); A.addClouds(st, 6, { y: 130 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 4, 0], radius: [150, 125], height: [70, 55], from: 2.0, to: 2.5, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'NUMBERS 21:6', { dur: info.dur }) });

// ---------- TYRE: island city, causeway, harbour, ships ----------
S('059', {"in": "dip", "amb": ["wind", -22], "sfx": [["whoosh", 0.1, -14]], "scene": "aerial Tyre at sunset: island city, walls, causeway bridge, ships"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#5a6ab8', '#f2907a', '#fbd49a'], fogColor: '#e8b09a', amb: '#ffe0d0', key: '#ffd0a0', keyPos: [120, 40, -40], ki: 2.2, a: 2.2 });
  A.flatGround(st, 2000, A.seaTex(T, [80, 80]), 0);
  const isl = T.cyl(62, 66, 3, T.mat('#ffffff', { map: A.sandTex(T, '#e0c08a', [6, 6]) }), 0, 1.5, -20, 48); st.add(isl);
  const coast = T.box(500, 4, 900, T.mat('#ffffff', { map: W.grassTex(T, '#8ab050', [40, 60]) }), -420, 2, 0); st.add(coast);
  A.wall(st, 0, -20, 58, { y: 3, h: 8 });
  const r = rng(9); for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = r() * 50, x = Math.cos(a) * d, z = -20 + Math.sin(a) * d; A.house(st, x, 3, z, 5 + r() * 4, 4 + r() * 4, 4 + r() * 4, { wall: ['#f2e2c0', '#ead6b0', '#e0c49a'][i % 3], roof: ['#d85a4a', '#c84a3a', '#e07a4a'][i % 3], flat: r() < 0.4 }); }
  for (let i = 0; i < 5; i++) A.stoneBridge(st, -80 - i * 36, -2, -20, 36, 0, { arches: 4 });
  A.addSprites(st, 'ship', 9, (r, i) => { const a = 0.3 + i * 0.5, d = 90 + r() * 60; return [Math.cos(a) * d, 0, -20 + Math.sin(a) * d]; }, 16);
  A.addTrees(st, 120, (r) => [-200 - r() * 400, 4, -400 + r() * 800], { palms: 0.5, size: 10 });
  A.addClouds(st, 12, { y: 130, dist: 420 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [-30, 4, -20], radius: [220, 185], height: [90, 70], from: 0.9, to: 1.35, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'EZEKIEL 28', { dur: info.dur }) });

// ---------- THE HOLY MOUNTAIN ----------
S('065', {"amb": ["wind", -22], "sfx": [["shimmer", 0.2, -10], ["riser", 0.4, -14]], "scene": "aerial: the holy mountain of God, light pouring from its summit"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#3a4a9a', '#c89ac0', '#fbe0b8'], fogColor: '#e8d0e0', amb: '#f0e8ff', ki: 2.2, a: 2.2, fog: [300, 1100] });
  const MT = { seed: 71, mount: 0, flat: 9999, rough: 1.5 };
  const hf = (x, z) => Math.max(0, 270 - Math.hypot(x, z) * 1.25) + W.heightAt(x, z, MT) * 2 + Math.max(0, 40 - Math.hypot(x, z) * 0.12);
  const terr = W.terrain(T, { size: 1400, seg: 260, height: hf, map: W.grassTex(T, '#7ab84a', [1, 1]), rep: 70 }); st.add(terr);
  const cap = W.terrain(T, { size: 220, seg: 120, height: (x, z) => hf(x, z) + 0.4, map: A.rockTex(T, '#c8b8a8', [1, 1]), rep: 14 }); cap.position.y = 0; st.add(cap);
  A.addTrees(st, 400, (r) => { const a = r() * Math.PI * 2, d = 90 + r() * 400, x = Math.cos(a) * d, z = Math.sin(a) * d; return [x, hf(x, z), z]; }, { size: 12, seed: 5 });
  const beam = T.shaft(40, 600, '#fff6d8', 0.16); beam.position.set(0, 470, 0); st.add(beam); const sun = T.sphere(16, T.basic('#ffffff'), 0, 282, 0); sun.userData.noOutline = true; st.add(sun);
  A.addClouds(st, 18, { y: 120, dist: 300, size: 120 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [380, 90, 420], look: [0, 170, 0], fov: 40 }], [info.dur, { pos: [290, 150, 330], look: [0, 210, 0], fov: 40 }]]) });

// ---------- A KINGDOM: river, stone bridge, patchwork fields, town (Psalm 72) ----------
S('079', {"in": "dip", "amb": ["wind", -24], "scene": "aerial kingdom: river, arched stone bridge, patchwork fields, red-roofed town"}, { kind: '3d', init(T) {
  const st = A.stage(T); A.flatGround(st, 1600, W.grassTex(T, '#7ab84a', [80, 80]));
  A.waterStrip(st, [[0, -800], [10, -200], [-6, 0], [8, 200], [0, 800]], 26);
  const fc = ['#c8b84a', '#9ac04a', '#e0c060', '#b8a840', '#8ab84a', '#d8a850'];
  for (let i = 0; i < 7; i++) for (let j = 0; j < 18; j++) for (const sx of [-1, 1]) { const p = T.plane(17, 17, T.mat('#ffffff', { map: W.fieldTex(T, fc[(i * 3 + j + (sx > 0 ? 2 : 0)) % 6], (i + j) % 2 ? 'h' : 'v', i * 31 + j) })); p.rotation.x = -Math.PI / 2; p.position.set(sx * (34 + i * 18), 0.15, -200 + j * 18); p.userData.noOutline = true; st.add(p); }
  A.stoneBridge(st, 0, 0, 30, 44, 0, { arches: 3 });
  const r = rng(4); for (let i = 0; i < 40; i++) { const x = (r() < 0.5 ? -1 : 1) * (40 + r() * 90), z = 60 + r() * 110; A.house(st, x, 0, z, 6 + r() * 4, 5 + r() * 3, 4 + r() * 2, { roof: ['#d85a4a', '#c84a3a', '#e07a4a'][i % 3] }); }
  A.addTrees(st, 260, (r) => { const side = r() < 0.5 ? -1 : 1; return [side * (18 + r() * 200), 0, -360 + r() * 340]; }, { size: 9, seed: 6 });
  A.addPeople(st, [['king', -8, 5.5, 30, 1, 'stand', 'smirk'], ['isaiah', -3, 5.5, 30, 1], ['adam', 2, 5.5, 30, -1], ['eve', 6, 5.5, 30, -1], ['joseph', 11, 5.5, 30, -1]], { key: 'bridge' });
  A.addPeaks(st, { n: 12, dist: 620, w: 720, y: -20 }); A.addClouds(st, 14, { y: 110 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [0, 90, 210], look: [0, 0, -40] }], [info.dur, { pos: [0, 50, 120], look: [0, 3, 10] }]]), overlay: (g, t, info) => verse(g, t, 'PSALM 72:9', { dur: info.dur }) });

// ---------- PATMOS ----------
S('086', {"in": "dip", "amb": ["wind", -22], "sfx": [["wind", 0.1, -14]], "scene": "aerial: rocky Patmos in a dusk sea, a small white village"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#2a3070', '#a87aa8', '#f2b08a'], fogColor: '#b89ab0', amb: '#d8c8f0', key: '#ffc8a0', keyPos: [120, 40, 0], ki: 1.9, a: 2.0 });
  A.flatGround(st, 2000, A.seaTex(T, [90, 90]));
  const P = { seed: 81, mount: 0, flat: 9999, rough: 4 };
  const hf = (x, z) => { const d = Math.hypot(x * 1.4, z); return d < 130 ? (130 - d) * 0.42 + W.heightAt(x, z, P) - 3 : -6; };
  st.add(W.terrain(T, { size: 400, seg: 200, height: hf, map: A.rockTex(T, '#b8a088', [1, 1]), rep: 20 }));
  const r = rng(2); for (let i = 0; i < 18; i++) { const x = 20 + r() * 40, z = 20 + r() * 40; A.house(st, x, hf(x, z) - 0.5, z, 4 + r() * 3, 4 + r() * 2, 3.5 + r() * 2, { flat: true, wall: '#f8f4ec' }); }
  A.addTrees(st, 60, (r) => { const x = -60 + r() * 120, z = -60 + r() * 120; const h = hf(x, z); return h > 2 && h < 40 ? [x, h, z] : null; }, { size: 7, seed: 3 });
  A.addSprites(st, 'ship', 3, (r, i) => [120 + i * 40, 0, 60 - i * 70], 14);
  A.addClouds(st, 12, { y: 120, dist: 420 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 12, 0], radius: [280, 240], height: [90, 70], from: -0.6, to: -0.2, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'REVELATION 12:9', { dur: info.dur }) });

// ---------- JERUSALEM ----------
S('112', {"in": "dip", "amb": ["wind", -24], "sfx": [["shimmer", 0.2, -14]], "scene": "aerial Jerusalem on its hill at golden hour: walls, houses, the temple"}, { kind: '3d', init(T) {
  const st = A.stage(T, { sky: ['#4a5ab0', '#f0a07a', '#fbd8a8'], fogColor: '#f0c8a8', amb: '#fff0e0', key: '#ffd8a8', keyPos: [90, 50, 40] });
  const J = { seed: 91, mount: 0, flat: 9999, rough: 1.4 };
  const hf = (x, z) => W.heightAt(x, z, J) * 2 + Math.max(0, 26 - Math.hypot(x, z) * 0.26);
  st.add(W.terrain(T, { size: 1400, seg: 240, height: hf, map: W.grassTex(T, '#a8b060', [1, 1]), rep: 70 }));
  A.wall(st, 0, 0, 70, { y: 20, h: 9 });
  const r = rng(14); for (let i = 0; i < 110; i++) { const a = r() * Math.PI * 2, d = r() * 64, x = Math.cos(a) * d, z = Math.sin(a) * d; A.house(st, x, hf(x, z) - 0.5, z, 4 + r() * 4, 4 + r() * 3, 3 + r() * 3, { flat: true, wall: ['#f2e6cc', '#ead6b0', '#e0c89a'][i % 3] }); }
  st.add(T.box(34, 14, 22, T.mat('#ffffff', { map: W.stoneTex(T, '#f6eedc', [4, 2]) }), -12, 32, -20), T.box(14, 26, 14, T.mat('#ffffff', { map: W.stoneTex(T, '#f6eedc', [2, 3]) }), -12, 38, -20));
  A.addTrees(st, 300, (r) => { const a = r() * Math.PI * 2, d = 80 + r() * 300, x = Math.cos(a) * d, z = Math.sin(a) * d; return [x, hf(x, z), z]; }, { palms: 0.15, size: 9, seed: 8 });
  A.addPeaks(st, { kind: 'dunes', n: 10, dist: 620, w: 700, y: -10 }); A.addClouds(st, 12, { y: 140 });
  return { stage: A.finish(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 24, 0], radius: [220, 180], height: [95, 75], from: 2.6, to: 3.0, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'JOHN 3:14', { dur: info.dur }) });
