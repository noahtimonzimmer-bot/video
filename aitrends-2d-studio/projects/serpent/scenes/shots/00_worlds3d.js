// 00 — detailed 3D landscape shots (characters stay 2D; these are the big establishing worlds).
import { E, V, mood, ease, prog, clamp, lerp, text, alpha } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import * as W from '../world3d.js';
const toon = (T, st) => { W.toonify(T, st.scene); return st; };
import { S } from '../lib.js';
import { verse } from '../creatures.js';

const sky = (top, mid, bot) => [top, mid, bot];
const day = (T, o = {}) => { const st = T.stage({ mood: 'golden', fov: o.fov || 40, fog: o.fog || [160, 700], fogColor: o.fogColor || '#d8e4ec', ambientSky: o.amb || '#cfe2f4', keyColor: o.key || '#fff0d0', keyPos: o.keyPos || [-60, 90, -40], keyIntensity: o.ki ?? 3.4, ambient: o.a ?? 2.0, shadowSize: o.ss || 150, sky: o.sky || sky('#5a8ed0', '#a8cce8', '#f2e4c4') }); st.sun.shadow.camera.far = 500; st.sun.shadow.camera.updateProjectionMatrix(); return st; };
const pyramid = (T, x, z, s, col = '#e0c08a') => { const { THREE } = T; const m = new THREE.Mesh(new THREE.ConeGeometry(s, s * 1.3, 4), T.mat(col, { flat: true })); m.position.set(x, s * 0.65, z); m.rotation.y = Math.PI / 4; m.castShadow = true; m.receiveShadow = true; return m; };

// ---------- EDEN ----------
const EDEN = { seed: 3, mount: 95, flat: 80, snowLine: 62, grass: '#7ab04a' };
const RIVERS = [[[0, 0], [40, 30], [90, 40], [160, 80], [300, 90]], [[0, 0], [-35, 40], [-70, 110], [-120, 240]], [[0, 0], [-40, -30], [-110, -50], [-280, -40]], [[0, 0], [30, -45], [60, -120], [70, -280]]];
function edenWorld(T) {
  const st = day(T); st.add(W.terrain(T, { ...EDEN, size: 1000, seg: 260 }));
  for (const p of RIVERS) st.add(W.river(T, p, 7, '#4aa0d8', EDEN));
  st.add(W.water(T, 16, 16, 0.5, '#5ab0e0'));
  st.add(W.forest(T, 0, 0, 260, 110, { inner: 14, palms: 0.25, terrain: EDEN, seed: 7, maxH: 20 }));
  st.add(W.fruitTree(T, -7, 0, 7, 2.0, { fruit: '#fff2a8', glow: true, leaf: '#4fa04a', seed: 11 }));
  st.add(W.fruitTree(T, 8, 0, -5, 1.8, { fruit: '#c8202a', leaf: '#2f6a2a', seed: 12 }));
  return st;
}
const titleOverlay = (str, sub) => (g, t, info) => { const a = clamp(Math.min((t - 0.2) / 0.5, (info.dur - t) / 0.4)); if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, E.H * 0.36, E.W, 230); text(g, str, E.W / 2, E.H * 0.47, { size: 110, color: '#ffe2a8', font: 'Fredoka', weight: 700, spacing: 10, glow: 40, glowColor: 'rgba(255,140,40,.9)' }); if (sub) text(g, sub, E.W / 2, E.H * 0.57, { size: 36, color: '#fff1dc', font: 'Nunito', weight: 900, spacing: 8 }); g.restore(); };
S('007', {"in": "dip", "bars": "scope", "sfx": [["impact", 0.1, -6], ["shimmer", 0.3, -10]], "scene": "3D Eden from above, title THE SERPENT IN EDEN"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 6, 0], radius: [150, 135], height: [95, 85], from: -0.4, to: -0.1, dur: info.dur }), overlay: titleOverlay('THE SERPENT IN EDEN', 'GENESIS 3') });
S('008', {"in": "dip", "amb": ["wind", -26], "scene": "3D: fly over the mountains down into the valley of Eden"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [70, 60, 230], look: [0, 10, 0] }], [info.dur, { pos: [45, 26, 90], look: [0, 6, 0] }]]), overlay: (g, t, info) => verse(g, t, 'GENESIS 2:8', { dur: info.dur }) });
S('009', {"amb": ["wind", -26], "sfx": [["whoosh", 0.1, -16]], "scene": "3D: skim low along the river"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => { const u = ease.inOut(t / info.dur); T.dolly(s.stage.camera, t, [[0, { pos: [120, 9, 60], look: [60, 3, 32] }], [info.dur, { pos: [40, 7, 32], look: [0, 3, 0] }]]); } });
S('010', {"amb": ["wind", -26], "sfx": [["shimmer", 0.2, -14]], "scene": "3D high aerial: the river splits into four"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [0, 260, 60], look: [0, 0, 0], fov: 46 }], [info.dur, { pos: [10, 220, 50], look: [0, 0, 0], fov: 46 }]]), overlay: (g, t, info) => { ['PISHON', 'GIHON', 'TIGRIS', 'EUPHRATES'].forEach((n, i) => { const a = clamp((t - 0.3 - i * 0.3) / 0.3); const p = [[E.W * 0.78, E.H * 0.42], [E.W * 0.3, E.H * 0.85], [E.W * 0.12, E.H * 0.4], [E.W * 0.62, E.H * 0.1]][i]; text(g, n, p[0], p[1], { size: 30, color: '#ffffff', font: 'Nunito', weight: 900, spacing: 4, alpha: a, stroke: 6, strokeColor: 'rgba(0,0,0,.5)' }); }); } });
S('011', {"amb": ["wind", -26], "sfx": [["shimmer", 0.3, -16]], "scene": "3D: drift through the orchard, fruit trees and palms"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [-60, 6, 40], look: [-20, 5, 10] }], [info.dur, { pos: [-30, 5, 26], look: [0, 6, 4] }]]) });
S('012', {"amb": ["wind", -26], "sfx": [["riser", 0.2, -14]], "scene": "3D orbit: the two trees in the middle"}, { kind: '3d', init: (T) => ({ stage: toon(T, edenWorld(T)) }), draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 6, 1], radius: [30, 24], height: [10, 8], from: 0.6, to: 1.2, dur: info.dur }) });

// ---------- EGYPT (Joseph's cup) ----------
const EGY = { seed: 41, mount: 30, flat: 160, rough: 0.5, desert: true, sand: '#e0c08a', snowLine: 999 };
S('035', {"in": "dip", "amb": ["wind", -24], "scene": "3D Egypt: the Nile, palms, fields, houses, pyramids"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#5a8ad0', '#bcd4e8', '#f6e0b0'), fogColor: '#f2dcb0', amb: '#f4e4c8', key: '#fff0c8' });
  const hf = (x, z) => Math.abs(z) < 9 ? -2 : W.heightAt(x, z, EGY);
  st.add(W.terrain(T, { ...EGY, size: 1000, seg: 220, height: hf }));
  st.add(W.river(T, [[-500, 0], [0, 0], [500, 0]], 18, '#3a8ac0', { height: () => -1.4 }));
  st.add(W.fields(T, -80, 16, 10, 2, 14, { seed: 3, colors: ['#7aa83a', '#a8b84a', '#5a8a2a', '#c8b05a'] }));
  st.add(W.fields(T, -60, -40, 8, 2, 14, { seed: 6, colors: ['#7aa83a', '#a8b84a', '#5a8a2a', '#c8b05a'] }));
  st.add(W.village(T, 40, -90, 30, { radius: 30, terrain: EGY, seed: 5, color: '#e4c89a' }));
  st.add(pyramid(T, -60, -190, 40), pyramid(T, 20, -230, 30), pyramid(T, -130, -250, 24));
  for (let i = 0; i < 40; i++) st.add(W.palm(T, -200 + i * 10 + (i % 3) * 3, 0, 14 + (i % 2) * 6 * (i % 4 ? 1 : -4), 0.9, { lean: (i % 5 - 2) * 0.1 }));
  st.add(W.ship(T, 30, 0, 0.1, { sail: '#f2e6c8' }));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [130, 30, 70], look: [0, 6, -60] }], [info.dur, { pos: [90, 24, 50], look: [-20, 6, -80] }]]), overlay: (g, t, info) => verse(g, t, 'GENESIS 44:5', { dur: info.dur }) });

// ---------- DESERT CAMP (Numbers 21) ----------
const DES = { seed: 51, mount: 40, flat: 90, rough: 2.2, desert: true, sand: '#e4b47a', rock: '#b8784a', snowLine: 999 };
S('047', {"in": "dip", "amb": ["wind", -20], "sfx": [["wind", 0.2, -12]], "scene": "3D wilderness: Israel's tent camp among the dunes"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#6a9ad0', '#f2d4a0', '#fbe8c0'), fogColor: '#f6d8a8', amb: '#f8e0c0', key: '#ffe8c0', keyPos: [80, 50, 20] });
  st.add(W.terrain(T, { ...DES, size: 1000, seg: 220 }));
  const { THREE } = T; const r = (i) => (Math.sin(i * 91.7) * 43758.5) % 1;
  for (let i = 0; i < 160; i++) { const a = i * 2.39996, d = 8 + Math.sqrt(i) * 5.5, x = Math.cos(a) * d, z = Math.sin(a) * d; st.add(W.tent(T, x, W.heightAt(x, z, DES) - 0.2, z, 0.8 + Math.abs(r(i)) * 0.4, ['#a87a4a', '#8a5a3a', '#c89a6a', '#e8d8b8', '#6a4a3a'][i % 5])); }
  st.add(T.cyl(0.3, 0.35, 14, T.mat('#6a4a2a'), 0, 7, 0, 8)); const coil = T.sphere(1.4, T.mat('#c8843a', { metalness: 0.7, roughness: 0.3, emissive: '#8a4a10', emissiveIntensity: 0.4 }), 0, 13.5, 0); st.add(coil);
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 6, 0], radius: [110, 90], height: [40, 30], from: 2.0, to: 2.5, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'NUMBERS 21:6', { dur: info.dur }) });

// ---------- TYRE (island city, causeway bridge, ships) ----------
S('059', {"in": "dip", "amb": ["wind", -22], "sfx": [["whoosh", 0.1, -14]], "scene": "3D Tyre at sunset: island city, harbour, ships, stone causeway"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#3a2a5a', '#c86a5a', '#f6b07a'), fogColor: '#d89a7a', amb: '#c8a0b0', key: '#ffc890', keyPos: [120, 30, -40], ki: 3.0, a: 1.6 });
  const LAND = { seed: 61, mount: 60, flat: 10, rough: 1 };
  const hf = (x, z) => { const isl = 34 - Math.hypot(x - 0, z + 20) * 0.6; const coast = (x + 260) < 0 ? W.heightAt(x + 260, z, LAND) + 2 : -6; return Math.max(isl > 0 ? Math.min(4, isl) : -6, coast); };
  st.add(W.terrain(T, { size: 1200, seg: 260, height: hf, grass: '#8aa050', seed: 61 }));
  st.add(W.water(T, 1400, 1400, 0.3, '#3a6a9a'));
  st.add(W.cityWall(T, 0, -20, 50, { y: 1 }));
  st.add(W.village(T, 0, -20, 60, { radius: 44, height: () => 3.6, seed: 9, lit: true }));
  st.add(W.ziggurat(T, 6, 3.6, -26, 0.5, '#d8b08a'));
  for (let i = 0; i < 6; i++) st.add(W.bridge(T, -80 - i * 28, -2.5, -20, 28, 0, { arches: 4, color: '#c8b088' }));
  [[60, 30, 0.4], [80, -60, 1.2], [40, 60, 2.0], [-40, 60, -0.3], [110, 10, 0.8], [70, 80, 2.4]].forEach(([x, z, r]) => st.add(W.ship(T, x, z, r, { sail: ['#f2e6c8', '#b84a3a', '#6a3a9a'][Math.abs(Math.round(x)) % 3] })));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [-20, 4, -20], radius: [170, 140], height: [60, 45], from: 0.9, to: 1.35, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'EZEKIEL 28', { dur: info.dur }) });

// ---------- THE HOLY MOUNTAIN OF GOD ----------
S('065', {"amb": ["wind", -22], "sfx": [["shimmer", 0.2, -10], ["riser", 0.4, -14]], "scene": "3D: the holy mountain of God, light on its summit"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#2a3a7a', '#a87ab0', '#f6d4a8'), fogColor: '#c8b0c8', amb: '#d8c8e8', key: '#ffe8c8', keyPos: [-40, 120, 60], ki: 3.2, a: 1.7, fog: [200, 900] });
  const MT = { seed: 71, mount: 70, flat: 160, rough: 1, snowLine: 70 };
  const hf = (x, z) => W.heightAt(x, z, MT) + Math.max(0, 150 - Math.hypot(x, z) * 1.1) + Math.max(0, 40 - Math.hypot(x, z) * 0.15) * 0.3;
  st.add(W.terrain(T, { ...MT, size: 1400, seg: 280, height: hf, snowLine: 120 }));
  st.add(W.forest(T, 0, 0, 120, 260, { inner: 140, palms: 0, height: hf, maxH: 40, seed: 5 }));
  const { THREE } = T; const beam = T.shaft(30, 400, '#fff6d8', 0.12); beam.position.set(0, 300, 0); st.add(beam);
  st.add(T.sphere(10, T.basic('#ffffff', { transparent: true, opacity: 0.9 }), 0, 158, 0)); st.add(T.sphere(30, T.basic('#fff2c8', { transparent: true, opacity: 0.2 }), 0, 158, 0));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.dolly(s.stage.camera, t, [[0, { pos: [260, 60, 300], look: [0, 110, 0], fov: 38 }], [info.dur, { pos: [200, 80, 230], look: [0, 130, 0], fov: 38 }]]) });

// ---------- A KINGDOM: fields, bridge, houses (Psalm 72) ----------
const VIL = { seed: 21, mount: 70, flat: 110, rough: 0.6, snowLine: 58, grass: '#8ab050' };
S('079', {"in": "dip", "amb": ["wind", -24], "scene": "3D kingdom: river, stone bridge, village, patchwork fields, ziggurat"}, { kind: '3d', init(T) {
  const st = day(T, { fog: [140, 650], fogColor: '#f0d4b0', amb: '#f4dcc0', key: '#ffe0b0', keyPos: [70, 60, 30], ki: 3.2, a: 1.9, sky: sky('#5a7ac0', '#e8a87a', '#f6d49c') });
  const hf = (x, z) => Math.abs(z) < 7 ? -2 : W.heightAt(x, z, VIL);
  st.add(W.terrain(T, { ...VIL, size: 1000, seg: 240, height: hf }));
  st.add(W.river(T, [[-500, 0], [0, 0], [500, 0]], 12, '#3f95d0', { height: () => -1.4 }));
  st.add(W.bridge(T, 10, -1.5, 0, 22, Math.PI / 2, { arches: 3 }));
  st.add(W.village(T, -10, -40, 30, { radius: 30, terrain: VIL, seed: 3 }));
  st.add(W.fields(T, 25, 15, 7, 4, 14, { seed: 4 })); st.add(W.fields(T, -120, 14, 6, 3, 14, { seed: 9 })); st.add(W.fields(T, 40, -120, 5, 3, 14, { seed: 12 }));
  st.add(W.ziggurat(T, -60, 0, -90, 1.1)); st.add(W.forest(T, 40, -60, 50, 40, { palms: 0.7, terrain: VIL, seed: 3 }));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 2, -20], radius: [100, 80], height: [40, 30], from: 0.3, to: 0.75, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'PSALM 72:9', { dur: info.dur }) });

// ---------- PATMOS ----------
S('086', {"in": "dip", "amb": ["wind", -22], "sfx": [["wind", 0.1, -14]], "scene": "3D: the rocky island of Patmos in the sea at dusk"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#1a2050', '#6a5a8a', '#e8a07a'), fogColor: '#8a7a9a', amb: '#9a8ab8', key: '#ffc8a0', keyPos: [100, 30, 0], ki: 2.6, a: 1.4 });
  const P = { seed: 81, mount: 40, flat: 0, rough: 3 };
  const hf = (x, z) => { const d = Math.hypot(x * 1.4, z); return d < 120 ? (120 - d) * 0.35 + W.heightAt(x, z, P) * 0.6 - 4 : -8; };
  st.add(W.terrain(T, { size: 1200, seg: 260, height: hf, grass: '#7a8a4a', rock: '#8a7a6a', seed: 81 }));
  st.add(W.water(T, 1400, 1400, 0.2, '#2a4a7a'));
  st.add(W.village(T, 30, 40, 10, { radius: 14, height: hf, seed: 2, lit: true, color: '#f2ece0' }));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 10, 0], radius: [230, 200], height: [55, 45], from: -0.6, to: -0.2, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'REVELATION 12:9', { dur: info.dur }) });

// ---------- JERUSALEM ----------
S('112', {"in": "dip", "amb": ["wind", -24], "sfx": [["shimmer", 0.2, -14]], "scene": "3D Jerusalem on its hill: walls, houses, the temple"}, { kind: '3d', init(T) {
  const st = day(T, { sky: sky('#4a5aa0', '#e89a7a', '#f6d0a0'), fogColor: '#e8c0a0', amb: '#e8d0c8', key: '#ffd0a0', keyPos: [90, 50, 40], ki: 3.0, a: 1.7 });
  const J = { seed: 91, mount: 60, flat: 140, rough: 1.4, grass: '#9aa060', rock: '#b8a080' };
  const hf = (x, z) => W.heightAt(x, z, J) + Math.max(0, 22 - Math.hypot(x, z) * 0.28);
  st.add(W.terrain(T, { ...J, size: 1000, seg: 240, height: hf }));
  st.add(W.cityWall(T, 0, 0, 58, { y: 18, color: '#d8c8a0' }));
  st.add(W.village(T, 0, 0, 70, { radius: 52, height: hf, seed: 14, color: '#e8dcc0', lit: true }));
  st.add(T.box(26, 12, 16, T.mat('#f2ead8', { flat: true }), -10, 28, -20), T.box(10, 22, 10, T.mat('#f2ead8'), -10, 33, -20));
  st.add(W.forest(T, 0, 0, 90, 80, { inner: 70, palms: 0.2, height: hf, seed: 8, maxH: 40 }));
  return { stage: toon(T, st) };
}, draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 22, 0], radius: [170, 140], height: [70, 55], from: 2.6, to: 3.0, dur: info.dur }), overlay: (g, t, info) => verse(g, t, 'JOHN 3:14', { dur: info.dur }) });
