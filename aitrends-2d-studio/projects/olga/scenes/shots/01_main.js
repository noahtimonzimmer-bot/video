// Olga's Burning Birds (9:16 short): Kievan Rus' 945 — painted 3D worlds (rus.js) + live 2D characters + 2D inserts.
import { E, layer, ease, prog, clamp, lerp, seg, circle, ring, poly, glow, alpha, shade, mix, text, rr, linGrad, radGrad, rng, shake } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import * as R from '../rus.js';
import { S } from '../lib.js';
import { closeUp, finish, label } from '../lib2.js';
import { CAST, OL, toonFigure } from '../toon.js';
import { scatter, wallProp, PROPS } from '../props.js';
import * as CAL from '../creatures.js';

const big = (g, t, str, y, o = {}) => label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 });
const RED = '#ff4a2a', GOLD = '#ffd47e';
const NIGHT = { sky: ['#04040e', '#10142e', '#2a1e3a'], fogColor: '#1a1428', amb: '#6a70a8', key: '#a8b8ff', keyPos: [-60, 90, -40], ki: 0.9, a: 1.3, fog: [200, 900] };
const BURN = { sky: ['#06040a', '#2a0e10', '#8a2a14'], fogColor: '#3a1810', amb: '#c86a4a', key: '#ff9a50', keyPos: [0, 60, 40], ki: 1.4, a: 1.5, fog: [220, 900] };
const DAY = { sky: ['#6aaee8', '#b8d8ee', '#f6e8c8'], fogColor: '#e0e8e8', fog: [260, 1000] };
const DUSK = { sky: ['#2a2a5a', '#c8705a', '#f8c890'], fogColor: '#d89a7a', amb: '#d8a8a0', key: '#ffc890', keyPos: [80, 25, 60], ki: 1.6, a: 1.6, fog: [220, 900] };
const moon = (st, T, x = -120, y = 160, z = -500) => { const m = T.sphere(18, T.basic('#f4f0dc'), x, y, z); m.userData.noOutline = true; st.add(m); const r = rng(4); for (let i = 0; i < 120; i++) { const s = T.sphere(0.6 + r() * 0.8, T.basic('#ffffff'), -700 + r() * 1400, 150 + r() * 300, -600 + r() * 100); s.userData.noOutline = true; st.add(s); } };
const SWORD = (g, p) => { const [x, y] = p.hF; seg(g, [[x, y + 6], [x + 8, y - 150]], 13, OL); seg(g, [[x, y + 6], [x + 8, y - 150]], 8, '#e0e4ee'); seg(g, [[x - 22, y - 8], [x + 22, y - 6]], 10, '#c8a030'); };

// ---------- worlds ----------
// Iskorosten on granite rocks over the river Uzh, ringed by Olga's siege camp
function iskorosten(T, o = {}) {
  const st = A.stage(T, o.night ? (o.burn ? BURN : NIGHT) : o.dusk ? DUSK : DAY);
  R.steppe(st, { grass: o.snow ? '#e8eef4' : '#86a650', river: [[-900, 70], [-200, 52], [0, 60], [300, 40], [900, 70]], riverW: 26, trees: 240, birch: 90, tufts: o.snow ? 0 : 700, forestIn: 190, clear: (x, z) => Math.hypot(x, z) < 150 || Math.abs(z - 55) < 18 });
  const town = R.hillTown(st, 0, 0, { rad: 42, hill: 12, rock: true, houses: 46, seed: 5, gate: Math.PI / 2, smoke: !o.burn, grass: o.snow ? 0 : 400 });
  scatter(st, 'rock', 40, (r) => { const a = r() * 6.28, d = 52 + r() * 18; return [Math.cos(a) * d, 0, Math.sin(a) * d]; }, 7, { seed: 41 });
  let camp = null; if (o.camp !== false) camp = R.siegeCamp(st, 0, 0, 78, 140, { tents: 70, night: o.night, skip: (a) => Math.abs(Math.atan2(Math.sin(a - 1.57), Math.cos(a - 1.57))) < 0.12 && false });
  if (o.night) moon(st, T, -160, 180, -520); else A.addClouds(st, 10, { y: 150, dist: 420 });
  let roofFires = null; if (o.burn) { const pts = []; town.roofs.forEach((p, i) => { pts.push([p[0], p[1] - 1, p[2]]); if (i % 2) pts.push([p[0] + 2, p[1] - 2, p[2] + 1.5]); }); roofFires = R.sharedFires(st, pts, 7, 9, { light: 6 }); scatter(st, 'smoke', 30, (r, i) => { const p = town.roofs[i % town.roofs.length]; return [p[0], p[1] + 10 + r() * 8, p[2]]; }, 12, { seed: 61, fog: false }); }
  return { stage: A.finish(T, st), town, camp, roofFires };
}
// Kiev on its hill above the Dnieper
function kiev(T, o = {}) {
  const st = A.stage(T, o.dusk ? DUSK : DAY);
  R.steppe(st, { river: [[-900, 120], [-300, 96], [0, 104], [300, 84], [900, 110]], riverW: 70, fields: [[-160, -120], [110, -150], [-60, -230]], trees: 220, birch: 80, forestIn: 220, clear: (x, z) => Math.hypot(x, z) < 120 || Math.abs(z - 100) < 44 });
  R.hillTown(st, 0, 0, { rad: 56, hill: 16, houses: 70, terem: 1.2, seed: 9, gate: Math.PI / 2 });
  R.hillTown(st, -150, 10, { rad: 30, hill: 4, houses: 26, seed: 19, gate: 0.6, grass: 200 });
  for (let i = 0; i < 7; i++) R.longboat(st, -260 + i * 80, -0.6, 100 + (i % 2) * 14, 1, (i % 2) * 0.3, { mast: i % 3 !== 0 });
  for (let i = 0; i < 4; i++) st.add(T.box(4, 1, 18, T.mat('#6a4a2a'), -140 + i * 70, 0.8, 80));
  scatter(st, 'boat', 10, (r) => [-500 + r() * 1000, 0.2, 90 + r() * 30], 9, { seed: 51 });
  scatter(st, 'bird', 20, (r) => [-150 + r() * 300, 70 + r() * 50, -150 + r() * 300], 3, { fog: false });
  A.addClouds(st, 12, { y: 150, dist: 420 });
  return { stage: A.finish(T, st) };
}
// birch & pine forest clearing (Igor's death)
function forest(T) {
  const st = A.stage(T, { sky: ['#4a6a8a', '#8aa0a8', '#c8c8b0'], fogColor: '#8a9a8a', amb: '#a8b8a8', key: '#e8e0c8', ki: 1.2, a: 1.6, fog: [30, 220] });
  A.flatGround(st, 600, W.grassTex(T, '#6a8a42', [60, 60]));
  scatter(st, 'birch', 70, (r) => { const a = r() * 6.28, d = 16 + r() * 70; return [Math.cos(a) * d, 0, Math.sin(a) * d - 10]; }, 14, { seed: 3 });
  scatter(st, 'pine', 90, (r) => { const a = r() * 6.28, d = 30 + r() * 110; return [Math.cos(a) * d, 0, Math.sin(a) * d - 20]; }, 16, { seed: 4 });
  scatter(st, 'grass', 500, (r) => [-60 + r() * 120, 0, -60 + r() * 90], 2.4); scatter(st, 'bush', 90, (r) => { const a = r() * 6.28, d = 10 + r() * 50; return [Math.cos(a) * d, 0, Math.sin(a) * d]; }, 4.5); scatter(st, 'rock', 20, (r) => [-40 + r() * 80, 0, -40 + r() * 60], 2.5); scatter(st, 'flowerbed', 20, (r) => [-30 + r() * 60, 0, -20 + r() * 40], 4); scatter(st, 'logpile', 4, (r, i) => [-14 + i * 9, 0, -16], 3); scatter(st, 'horse', 3, (r, i) => [-16 + i * 5, 0, -10], 4.2);
  return st;
}
// Kiev courtyard below the terem (pit, bathhouse)
function yard(T, o = {}) {
  const st = A.stage(T, o.night ? (o.burn ? BURN : NIGHT) : o.dusk ? DUSK : DAY);
  A.flatGround(st, 900, W.grassTex(T, '#86a650', [80, 80]));
  const yardTop = T.ground(120, 90, '#ffffff', R.earthTex(T, '#8a6a42', [12, 9])); yardTop.position.set(0, 0.05, -10); yardTop.userData.noOutline = true; st.add(yardTop);
  R.terem(st, 0, 0, -60, 1.4);
  for (let i = 0; i < 12; i++) R.izba(st, (i % 2 ? 1 : -1) * (34 + (i % 3) * 9), 0, -44 + Math.floor(i / 2) * 14, 7, 6, 4.4, { rot: (i % 2 ? -1 : 1) * Math.PI / 2, roof: ['#c8a050', '#b8904a'][i % 2] });
  R.palisade(st, 0, -20, 95, { h: 7, n: 160, towers: 6, gate: Math.PI / 2 });
  scatter(st, 'haystack', 10, (r) => [(r() < 0.5 ? -1 : 1) * (22 + r() * 30), 0, -50 + r() * 70], 3.4); scatter(st, 'fence', 20, (r) => [(r() < 0.5 ? -1 : 1) * (18 + r() * 34), 0, -50 + r() * 70], 3.2); scatter(st, 'logpile', 8, (r) => [(r() < 0.5 ? -1 : 1) * (16 + r() * 30), 0, -40 + r() * 60], 2.6);
  scatter(st, 'barrel', 20, (r) => [-30 + r() * 60, 0, -40 + r() * 60], 1.5); scatter(st, 'chicken', 16, (r) => [-26 + r() * 52, 0, -10 + r() * 30], 1); scatter(st, 'well', 1, () => [18, 0, -30], 2.6); scatter(st, 'cart', 3, (r, i) => [-24 + i * 6, 0, -34], 4);
  scatter(st, 'grass', 500, (r) => { const x = -140 + r() * 280, z = -110 + r() * 200; return Math.abs(x) < 50 && z > -60 && z < 30 ? null : [x, 0, z]; }, 2.6); scatter(st, 'birch', 30, (r) => { const a = r() * 6.28, d = 105 + r() * 80; return [Math.cos(a) * d, 0, -20 + Math.sin(a) * d]; }, 14);
  if (!o.burn) scatter(st, 'smoke', 8, (r, i) => [(i % 2 ? 1 : -1) * (34 + (i % 3) * 9), 9, -44 + Math.floor(i / 2) * 14], 3.6);
  if (o.night) moon(st, T, 120, 170, -520); else A.addClouds(st, 8, { y: 140 });
  return st;
}

// ---------- 2D backgrounds ----------
function logBg(g, t, o = {}) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1408', '#4a2a14', '#2a1408']); g.fillRect(0, 0, E.W, E.H); for (let y = 0; y < E.H; y += 96) { g.beginPath(); g.ellipse(E.W / 2, y + 48, E.W * 0.7, 44, 0, 0, 7); g.fillStyle = (y / 96) % 2 ? '#6a3e1e' : '#5a3418'; g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(20,8,2,.6)'; g.stroke(); seg(g, [[0, y + 30], [E.W, y + 28]], 3, 'rgba(255,220,170,.12)'); } for (const x of [E.W * 0.12, E.W * 0.88]) { seg(g, [[x, E.H * 0.3], [x, E.H * 0.4]], 12, '#2a1408'); for (let i = 0; i < 4; i++) poly(g, [[x - 18 + i * 10, E.H * 0.3], [x - 12 + i * 10 + Math.sin(t * 8 + i) * 5, E.H * 0.24 - Math.sin(t * 6 + i) * 12], [x - 6 + i * 10, E.H * 0.3]], i % 2 ? '#ffd24a' : '#ff7a2a'); glow(g, x, E.H * 0.28, 380, '#ffb060', 0.5); } if (o.red) { g.fillStyle = 'rgba(160,20,10,.25)'; g.fillRect(0, 0, E.W, E.H); } }
function fireBg(g, t) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0408', '#5a1408', '#e0601a']); g.fillRect(0, 0, E.W, E.H); const r = rng(3); for (let i = 0; i < 26; i++) { const x = r() * E.W, h = 300 + r() * 600 + Math.sin(t * 5 + i) * 60; poly(g, [[x - 80, E.H], [x + Math.sin(t * 4 + i) * 30, E.H - h], [x + 80, E.H]], alpha(i % 2 ? '#ff8a2a' : '#ffd24a', 0.55)); } for (let i = 0; i < 40; i++) circle(g, (r() * E.W + t * 40 * (r() - 0.3)) % E.W, (E.H - ((t * 200 + r() * E.H) % E.H)), 3 + r() * 4, alpha('#ffd27a', 0.8)); }

// ---------- HOOK ----------
// burning flock streams over the palisade towards the sleeping town
S('000', {"in": "cut", "bars": "none", "sfx": [["input/sfx/wings.wav", 0.0, -4], ["input/sfx/sizzle.wav", 0.2, -10], ["input/sfx/hit.wav", 0.05, -4]], "scene": "night: hundreds of birds with burning bundles stream over a palisade towards a sleeping wooden town on a rock"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { night: true }); const roofs = w.town.roofs; w.birds = R.flock(w.stage, 90, (i, t) => { const p0 = [-70 + ((i * 37) % 140), 18 + (i % 6) * 4, 190 + (i % 9) * 7], q = roofs[i % roofs.length], k = clamp(t * 0.16 + (i % 13) * 0.012); return [lerp(p0[0], q[0], k), lerp(p0[1], q[1] + 22, k) + Math.sin(t * 3 + i) * 1.2, lerp(p0[2], q[2], k)]; }, { fire: true, size: 3.4 }); return w; },
  draw(s, t, info, T) { s.birds.update(t); s.camp.fires.update(t); T.dolly(s.stage.camera, t, [[0, { pos: [8, 24, 222], look: [0, 16, 100], fov: 60 }], [info.dur, { pos: [4, 30, 170], look: [0, 12, 20], fov: 62 }]]); },
  overlay: (g, t) => { big(g, t, 'THREE BIRDS', E.H * 0.15, { at: 0.1, size: 120, color: '#ffffff' }); big(g, t, 'FROM EVERY HOUSE', E.H * 0.22, { at: 0.8, size: 80, color: GOLD }); } });
S('001', {"bars": "none", "sfx": [["input/sfx/boom.wav", 0.0, -2], ["input/sfx/fire.wav", 0.1, -4], ["input/sfx/screams.wav", 0.5, -14]], "scene": "the whole town on the rock erupts in flames at once"}, { kind: '3d',
  init: (T) => iskorosten(T, { night: true, burn: true }),
  draw(s, t, info, T) { s.roofFires.update(t, (i) => clamp(0.35 + t * 0.6 - (i % 7) * 0.04)); s.camp.fires.update(t); T.dolly(s.stage.camera, t, [[0, { pos: [60, 60, 150], look: [0, 14, 0], fov: 58 }], [info.dur, { pos: [110, 90, 210], look: [0, 10, 0], fov: 58 }]]); },
  overlay: (g, t) => big(g, t, 'A WHOLE CITY.', E.H * 0.16, { at: 0.2, size: 110, color: RED }) });

// ---------- KIEV 945 ----------
S('002', {"in": "dip", "bars": "none", "sfx": [["input/sfx/horn.wav", 0.1, -8], ["input/sfx/bell.wav", 0.3, -14]], "scene": "Kiev 945 by day: a palisaded hill town with the wooden terem of the prince above the wide Dnieper, longboats"}, { kind: '3d',
  init: (T) => kiev(T),
  draw: (s, t, info, T) => T.orbit(s.stage.camera, t, { target: [0, 14, 0], radius: [220, 190], height: [110, 90], from: 1.2, to: 1.5, dur: info.dur }),
  overlay: (g, t) => { big(g, t, 'KIEV', E.H * 0.15, { size: 120 }); big(g, t, '945 AD', E.H * 0.22, { at: 0.4, size: 90, color: GOLD }); } });
S('003', {"bars": "none", "sfx": [["input/sfx/sword.wav", 0.4, -6], ["input/sfx/hit.wav", 1.6, -6], ["input/sfx/crowd.wav", 0.0, -20]], "scene": "a birch forest: Drevlian warriors in fur hats encircle Prince Igor"}, { kind: '3d',
  init(T) { const st = forest(T); const igor = A.livePerson(st, 3, 'igor'); igor.sprite.position.set(0, 0, 0); const dr = []; for (let i = 0; i < 9; i++) { const p = A.livePerson(st, 2.9, i % 2 ? 'drevlian' : 'drevlian2'); const a = Math.PI * (0.15 + i * 0.09) + Math.PI; p.sprite.position.set(Math.cos(a) * 8, 0, Math.sin(a) * 6 - 1); dr.push([p, Math.cos(a)]); } scatter(st, 'spears', 3, (r, i) => [-7 + i * 7, 0, -9], 3.4); return { stage: A.finish(T, st), igor, dr }; },
  draw(s, t, info, T) { s.igor.update(t, { pose: breathe(t > 1.4 ? POSES.handsOnHead : POSES.ready, t), facing: 1, expr: 'scared' }); s.dr.forEach(([p, c], i) => { p.update(t, { pose: breathe(POSES.ready, t, 1, i), facing: c > 0 ? -1 : 1, expr: 'angry' }); }); T.dolly(s.stage.camera, t, [[0, { pos: [0, 5, 22], look: [0, 3, 0], fov: 55 }], [info.dur, { pos: [0, 4, 14], look: [0, 3, 0], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'PRINCE IGOR', E.H * 0.15, { at: 0.3, size: 96, color: GOLD }) });
S('004', {"bars": "none", "sfx": [["input/sfx/laugh.wav", 0.2, -8], ["input/sfx/thud.wav", 0.9, -8]], "scene": "close-up: Mal, prince of the Drevlians, grins — he will marry the widow"}, (g, t, info) => { closeUp(g, t, info, { who: 'mal', expr: t < 0.9 ? 'happy' : 'smirk', bg: (g) => logBg(g, t), s: 2.9, dy: 280, talk: [0.1, 0.8] }); big(g, t, 'FATAL MISTAKE.', E.H * 0.15, { at: 0.8, size: 100, color: RED }); finish(g, t); });

// ---------- ENVOYS ----------
S('005', {"bars": "none", "sfx": [["input/sfx/oars.wav", 0.0, -8], ["input/sfx/horn.wav", 1.2, -12]], "scene": "a longboat full of Drevlian envoys rows up the Dnieper towards Kiev; Olga watches from the bank"}, { kind: '3d',
  init(T) { const w = kiev(T, { dusk: true }); const st = w.stage; w.boat = R.longboat(st, 0, -0.5, 100, 1.2, 0, { mast: true }); w.env = []; for (let i = 0; i < 5; i++) { const p = A.livePerson(st, 2.4, i % 2 ? 'drevlian' : 'mal'); w.env.push(p); } w.olga = A.livePerson(st, 3.2, 'olga'); w.olga.sprite.position.set(14, 0, 76); return w; },
  draw(s, t, info, T) { const x = -40 + t * 12; s.boat.position.x = x; s.env.forEach((p, i) => { p.update(t, { pose: breathe(i ? POSES.relaxed : POSES.wave, t, 1, i), facing: 1, expr: 'happy' }); p.sprite.position.set(x - 6 + i * 3, 2.4, 100); }); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: -1, expr: t > 1.4 ? 'smirk' : 'neutral' }); T.dolly(s.stage.camera, t, [[0, { pos: [26, 7, 60], look: [-14, 3, 100], fov: 55 }], [info.dur, { pos: [22, 6.4, 64], look: [-8, 3, 100], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'OLGA', E.H * 0.15, { at: 1.3, size: 130, color: GOLD }) });
S('006', {"bars": "none", "sfx": [["input/sfx/door.wav", 0.0, -10], ["input/sfx/crowd.wav", 0.0, -22]], "scene": "Olga's log hall: she smiles graciously from her throne as the Drevlian envoys bow"}, { kind: '3d',
  init(T) { const h = R.logHall(T, {}); const st = h.stage; h.olga = A.livePerson(st, 3.6, 'olga'); h.olga.sprite.position.set(0, 1.6, -32); h.env = []; for (let i = 0; i < 5; i++) { const p = A.livePerson(st, 3, i ? 'drevlian' : 'mal'); p.sprite.position.set(-6 + i * 3, 0, -20 + (i % 2)); h.env.push(p); } A.addPeople(st, Array.from({ length: 8 }, (_, i) => [i % 2 ? 'rus' : 'rus2', (i % 2 ? 1 : -1) * 9, 0, -28 + Math.floor(i / 2) * 6, i % 2 ? -1 : 1, 'stand', 'determined']), { w: 2.9, key: 'guard' }); return h; },
  draw(s, t, info, T) { s.fires.update(t); s.olga.update(t, { pose: breathe(POSES.explain, t), facing: 1, expr: 'smile', talk: t > 0.3 && t < 1.2 ? Math.abs(Math.sin(t * 14)) : 0 }); s.env.forEach((p, i) => p.update(t, { pose: POSES.kneel, facing: -1, expr: 'happy' })); T.dolly(s.stage.camera, t, [[0, { pos: [8, 6, -6], look: [0, 4, -30], fov: 55 }], [info.dur, { pos: [4, 5.5, -12], look: [0, 4.5, -30], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'WITH HONOR…', E.H * 0.15, { at: 0.2, size: 96 }) });
S('007', {"bars": "none", "sfx": [["input/sfx/dig.wav", 0.2, -4], ["input/sfx/dig.wav", 1.0, -6], ["input/sfx/screams.wav", 0.4, -14], ["input/sfx/thud.wav", 1.8, -6]], "scene": "the envoys still sit in their boat — lowered into a deep pit; Olga's men shovel earth over them"}, { kind: '3d',
  init(T) { const st = yard(T, { dusk: true }); R.burialPit(st, 0, -8, 24, 10, { wall: 4 }); R.longboat(st, 0, -1.6, -8, 1.05, 0, { mast: false }); const env = []; for (let i = 0; i < 5; i++) { const p = A.livePerson(st, 2.4, i % 2 ? 'drevlian' : 'mal'); p.sprite.position.set(-6 + i * 3, 1.4, -8); env.push(p); } const diggers = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-10 + i * 4, 3.2, -15.5); diggers.push(p); } const olga = A.livePerson(st, 3.2, 'olga'); olga.sprite.position.set(14, 3.2, -1); const dirt = R.flock(st, 30, (i, t) => { const k = ((t * 1.2 + i * 0.13) % 1); return [-10 + (i % 6) * 4 + k * 0.5, 4.5 + Math.sin(k * Math.PI) * 3 - k * 3, -14.5 + k * 6]; }, { color: '#5a3a22', size: 0.9 }); return { stage: A.finish(T, st), env, diggers, olga, dirt }; },
  draw(s, t, info, T) { s.dirt.update(t); s.env.forEach((p, i) => p.update(t, { pose: breathe(POSES.handsOnHead, t, 1.5, i), facing: i % 2 ? 1 : -1, expr: 'scared' })); s.diggers.forEach((p, i) => p.update(t, { pose: Math.sin(t * 6 + i) > 0 ? POSES.crouch : POSES.holdFront, facing: 1, expr: 'determined' })); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: -1, expr: 'smirk' }); T.dolly(s.stage.camera, t, [[0, { pos: [4, 30, 12], look: [0, 0, -8], fov: 55 }], [info.dur, { pos: [2, 24, 8], look: [0, 0, -8], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'BURIED ALIVE.', E.H * 0.15, { at: 0.9, size: 104, color: RED }) });

// ---------- BATHHOUSE ----------
S('008', {"bars": "none", "sfx": [["input/sfx/quill.wav", 0.1, -12]], "scene": "close-up: Olga, sweetly: send me your noblest men"}, (g, t, info) => { closeUp(g, t, info, { who: 'olga', expr: 'smile', bg: (g) => logBg(g, t), s: 2.9, dy: 280, talk: [0.1, 1.9] }); big(g, t, 'NEXT:', E.H * 0.12, { at: 0.2, size: 80 }); big(g, t, 'THEIR NOBLEST MEN', E.H * 0.19, { at: 0.6, size: 78, color: GOLD }); finish(g, t); });
S('009', {"bars": "none", "sfx": [["input/sfx/steam.wav", 0.0, -12], ["input/sfx/door.wav", 1.5, -2], ["input/sfx/thud.wav", 1.75, -2]], "scene": "dusk: Drevlian nobles step into a steaming log bathhouse; a soldier slams the bar across the door"}, { kind: '3d',
  init(T) { const st = yard(T, { dusk: true }); R.banya(st, 0, -8); const bar = T.box(3.6, 0.5, 0.5, T.mat('#2a1a0a'), -2, 1.7, -4.1); st.add(bar); scatter(st, 'smoke', 6, (r, i) => [2.2 + (i % 2), 9 + i * 1.4, -8], 3); scatter(st, 'bucket', 3, (r, i) => [3 + i * 1.2, 0, -3.6], 1); scatter(st, 'logpile', 2, (r, i) => [6 + i * 3, 0, -6], 2.4); const nob = []; for (let i = 0; i < 4; i++) nob.push(A.livePerson(st, 2.8, i % 2 ? 'drevlian2' : 'drevlian')); const sold = A.livePerson(st, 3, 'rus'); return { stage: A.finish(T, st), bar, nob, sold }; },
  draw(s, t, info, T) { s.bar.visible = t > 1.6; s.nob.forEach((p, i) => { const k = clamp(t * 0.7 - i * 0.18); p.update(t, { pose: walkPose(t * 9 + i), facing: -1, expr: 'happy' }); p.sprite.position.set(3 - k * 5, 0, 2 - k * 5.6 + i * 0.3); p.sprite.visible = k < 0.98; }); s.sold.update(t, { pose: t > 1.5 ? POSES.reach : walkPose(t * 9), facing: -1, expr: 'determined' }); s.sold.sprite.position.set(Math.max(0.4, 6 - t * 3.6), 0, -2.6); T.dolly(s.stage.camera, t, [[0, { pos: [6, 5, 16], look: [0, 3, -6], fov: 55 }], [info.dur, { pos: [3, 4.4, 10], look: [-1, 3, -6], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'LOCKED.', E.H * 0.15, { at: 1.7, size: 120, color: RED }) });
S('010', {"bars": "none", "sfx": [["input/sfx/fire.wav", 0.0, -2], ["input/sfx/screams.wav", 0.2, -12]], "scene": "night: the bathhouse burns, flames climbing the straw roof"}, { kind: '3d',
  init(T) { const st = yard(T, { night: true, burn: true }); R.banya(st, 0, -8, { barred: true }); const pts = []; for (let i = 0; i < 9; i++) pts.push([-4 + i, 5 + (i % 3), -8 + (i % 2 ? 3 : -3)]); const fires = R.sharedFires(st, pts, 6, 9, { light: 3 }); scatter(st, 'smoke', 6, (r, i) => [-3 + i * 1.4, 14 + i * 2, -12], 10, { fog: false }); return { stage: A.finish(T, st), fires }; },
  draw(s, t, info, T) { s.fires.update(t, (i) => clamp(0.5 + t * 0.8 - (i % 4) * 0.1)); T.dolly(s.stage.camera, t, [[0, { pos: [0, 6, 22], look: [0, 6, -8], fov: 58 }], [info.dur, { pos: [0, 5, 16], look: [0, 7, -8], fov: 58 }]]); } });

// ---------- FEAST ----------
S('011', {"bars": "none", "sfx": [["input/sfx/crowd.wav", 0.0, -10], ["input/sfx/laugh.wav", 0.6, -10], ["input/sfx/cups.wav", 1.4, -8]], "scene": "dusk at Igor's burial mound: long tables, Drevlians drinking and laughing, Olga's men pouring mead"}, { kind: '3d',
  init(T) { const st = A.stage(T, DUSK); R.steppe(st, { trees: 200, birch: 60, forestIn: 120, clear: (x, z) => Math.hypot(x, z) < 60 }); R.kurgan(st, 0, -34, 18, 9); const fires = R.sharedFires(st, [[-24, 0, -10], [24, 0, -10], [-24, 0, 14], [24, 0, 14]], 3, 4, { light: 4 }); for (const tx of [-9, 9]) { st.add(T.box(4, 2.4, 40, T.mat('#6a4226'), tx, 1.2, 0)); for (const s2 of [-1, 1]) st.add(T.box(1.2, 1.2, 38, T.mat('#5a3a22'), tx + s2 * 3.2, 0.6, 0)); scatter(st, 'goblet', 14, (r, i) => [tx + (i % 2 ? 1 : -1), 2.42, -18 + i * 2.6], 0.6, { seed: tx + 50 }); scatter(st, 'jug', 7, (r, i) => [tx, 2.42, -16 + i * 5], 1.2, { seed: tx + 60 }); scatter(st, 'roast', 4, (r, i) => [tx, 2.42, -14 + i * 9], 1.8); scatter(st, 'bread', 6, (r, i) => [tx + 0.6, 2.42, -17 + i * 6], 1.2); scatter(st, 'fruit', 4, (r, i) => [tx - 0.6, 2.42, -12 + i * 8], 1.1); } scatter(st, 'barrel', 10, (r, i) => [-18 + (i % 2) * 2, 0, -12 + i * 2.5], 1.6); scatter(st, 'barrel', 8, (r, i) => [18 + (i % 2) * 2, 0, -10 + i * 2.6], 1.6); scatter(st, 'horse', 6, (r, i) => [-34 + i * 12, 0, -30], 4.4); scatter(st, 'grass', 300, (r) => { const x = -60 + r() * 120, z = -60 + r() * 100; return Math.abs(x) < 16 && Math.abs(z) < 22 ? null : [x, 0, z]; }, 2.4);
    const dr = []; for (let i = 0; i < 16; i++) { const tx = i < 8 ? -9 : 9, sd = i % 2 ? 1 : -1, p = A.livePerson(st, 2.6, i % 3 ? 'drevlian' : 'drevlian2'); p.sprite.position.set(tx + sd * 3.4, 0, -16 + (i % 8) * 4.4); dr.push([p, -sd]); }
    const serv = []; for (let i = 0; i < 4; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(i < 2 ? -14 : 14, 0, -6 + (i % 2) * 14); serv.push(p); }
    const olga = A.livePerson(st, 3.2, 'olga'); olga.sprite.position.set(0, 8.4, -32); return { stage: A.finish(T, st), fires, dr, serv, olga }; },
  draw(s, t, info, T) { s.fires.update(t); s.dr.forEach(([p, f], i) => p.update(t, { pose: breathe(i % 3 ? POSES.cheer : POSES.holdFront, t, 1.2, i), facing: f, expr: 'happy', talk: Math.abs(Math.sin(t * 9 + i)) * (i % 2) })); s.serv.forEach((p, i) => p.update(t, { pose: breathe(POSES.holdFront, t), facing: i < 2 ? 1 : -1, expr: 'smirk' })); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: 1, expr: 'neutral' }); T.dolly(s.stage.camera, t, [[0, { pos: [16, 7, 26], look: [0, 3, -2], fov: 56 }], [info.dur, { pos: [12, 6, 20], look: [0, 3, -4], fov: 56 }]]); },
  overlay: (g, t) => big(g, t, 'THE FUNERAL FEAST', E.H * 0.15, { at: 0.2, size: 84, color: GOLD }) });
S('012', {"bars": "none", "sfx": [["input/sfx/sword.wav", 0.0, -2], ["input/sfx/sword.wav", 0.2, -4], ["input/sfx/boom.wav", 0.5, -6], ["input/sfx/screams.wav", 0.4, -10]], "scene": "Olga's soldiers draw their swords over the drunken Drevlians; red flash"}, (g, t, info) => { const [kx, ky] = shake(t, 10, 6); g.save(); g.translate(kx, ky); fireBg(g, t * 0.5); g.fillStyle = 'rgba(120,10,10,.45)'; g.fillRect(0, 0, E.W, E.H); for (let i = 0; i < 3; i++) toonFigure(g, { x: E.W * (0.2 + i * 0.3), y: E.H * 0.9, s: 1.7, facing: i === 2 ? -1 : 1, pose: POSES.cheer, who: CAST[i % 2 ? 'rus' : 'rus2'], expr: 'angry', shadow: false, prop: SWORD }); g.restore(); const a = clamp(1 - t * 3); if (a > 0) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, E.W, E.H); } big(g, t, 'SWORDS.', E.H * 0.14, { at: 0.1, size: 120, color: '#ffffff' }); big(g, t, '5,000 DEAD', E.H * 0.22, { at: 0.8, size: 96, color: RED }); finish(g, t); });

// ---------- SIEGE ----------
S('013', {"in": "dip", "bars": "none", "sfx": [["input/sfx/drum.wav", 0.0, -4], ["input/sfx/drum.wav", 0.7, -6], ["input/sfx/horn.wav", 1.2, -10]], "scene": "aerial: Iskorosten on its granite rocks by the river, ringed by Olga's siege camp — tents, banners, campfires"}, { kind: '3d',
  init: (T) => iskorosten(T, { dusk: true }),
  draw(s, t, info, T) { s.camp.fires.update(t); T.orbit(s.stage.camera, t, { target: [0, 10, 0], radius: [230, 190], height: [120, 95], from: 0.5, to: 0.85, dur: info.dur }); },
  overlay: (g, t) => big(g, t, 'ISKOROSTEN', E.H * 0.15, { at: 0.3, size: 110, color: GOLD }) });
S('014', {"bars": "none", "sfx": [["input/sfx/wind.wav", 0.0, -8], ["input/sfx/tick.wav", 0.2, -10]], "scene": "the same siege in winter snow; a calendar flips through a whole year"}, { kind: '3d',
  init: (T) => iskorosten(T, { snow: true }),
  draw(s, t, info, T) { s.camp.fires.update(t); T.dolly(s.stage.camera, t, [[0, { pos: [0, 40, 170], look: [0, 12, 0], fov: 55 }], [info.dur, { pos: [0, 34, 140], look: [0, 12, 0], fov: 55 }]]); },
  overlay: (g, t, info) => { const n = Math.min(365, Math.round(Math.pow(clamp(t / (info.dur * 0.8)), 1.6) * 365)); const { calendar } = CAL; calendar(g, t, n, 'DAYS', { y: E.H * 0.33, s: 0.8 }); big(g, t, 'ONE WHOLE YEAR', E.H * 0.12, { at: 0.1, size: 86 }); } });
S('015', {"bars": "none", "sfx": [["input/sfx/door.wav", 0.0, -14], ["input/sfx/crowd.wav", 0.0, -24]], "scene": "outside Olga's red tent at the camp: an envoy of Iskorosten kneels; the town on its rock behind"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { dusk: true }); const st = w.stage, { THREE } = T; const tent = new THREE.Mesh(new THREE.ConeGeometry(7, 9, 10), T.mat('#a81a22')); tent.position.set(-4, 4.5, 96); st.add(tent); st.add(T.cyl(0.2, 0.2, 14, T.mat('#4a2e18'), 2, 7, 98)); const b = T.plane(2.6, 5, T.mat('#ffffff', { map: R.tridentBanner(T), side: THREE.DoubleSide })); b.position.set(3.3, 11, 98); b.userData.noOutline = true; st.add(b); scatter(st, 'fur', 3, (r, i) => [-2 + i * 2, 0.05, 103], 2.4); scatter(st, 'barrel', 4, (r, i) => [-10 + i * 1.6, 0, 100], 1.5); scatter(st, 'spears', 2, (r, i) => [6 + i * 2, 0, 96], 3.6); w.olga = A.livePerson(st, 3.4, 'olga'); w.olga.sprite.position.set(-1, 0, 101.5); w.env = A.livePerson(st, 2.8, 'townsman'); w.env.sprite.position.set(3.5, 0, 103); A.addPeople(st, [['rus', -6, 0, 102, 1, 'stand', 'determined'], ['rus2', 6.5, 0, 101, -1, 'stand', 'determined']], { w: 3, key: 'tg' }); return w; },
  draw(s, t, info, T) { s.camp.fires.update(t); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: 1, expr: 'smirk' }); s.env.update(t, { pose: POSES.kneel, facing: -1, expr: 'worried' }); T.dolly(s.stage.camera, t, [[0, { pos: [4, 4.5, 118], look: [0, 5, 60], fov: 55 }], [info.dur, { pos: [2, 4.2, 112], look: [0, 5, 60], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'AN OFFER…', E.H * 0.15, { at: 0.3, size: 104, color: GOLD }) });
S('016', {"bars": "none", "sfx": [["input/sfx/choir.wav", 0.0, -14]], "scene": "close-up: Olga, gentle, almost kind: I want no more revenge"}, (g, t, info) => { closeUp(g, t, info, { who: 'olga', expr: t < 1.6 ? 'smile' : 'happy', bg: (g) => logBg(g, t), s: 2.9, dy: 280, talk: [0.1, 2.9] }); big(g, t, '“NO MORE REVENGE.”', E.H * 0.15, { at: 0.2, size: 84 }); finish(g, t); });
S('017', {"bars": "none", "sfx": [["input/sfx/coo.wav", 0.3, -6], ["input/sfx/chirp.wav", 1.6, -6], ["input/sfx/pop.wav", 0.4, -12], ["input/sfx/pop.wav", 0.8, -12], ["input/sfx/pop.wav", 1.2, -12], ["input/sfx/pop.wav", 1.7, -12], ["input/sfx/pop.wav", 2.1, -12], ["input/sfx/pop.wav", 2.5, -12]], "scene": "parchment card: three pigeons and three sparrows pop in one by one — x EVERY HOUSE"}, (g, t, info) => {
  logBg(g, t); rr(g, E.W * 0.08, E.H * 0.28, E.W * 0.84, E.H * 0.44, 30); g.fillStyle = '#f2e2b8'; g.fill(); g.lineWidth = 8; g.strokeStyle = OL; g.stroke();
  const [pw, ph, pd] = PROPS.pigeon, [sw, sh, sd] = PROPS.sparrow;
  for (let i = 0; i < 6; i++) { const k = ease.outBack(clamp((t - 0.4 - i * 0.4) * 4)); if (k <= 0) continue; const pig = i < 3, x = E.W * (0.22 + (i % 3) * 0.28), y = E.H * (pig ? 0.43 : 0.58), s = (pig ? 3.6 : 4.4) * k; g.save(); g.translate(x, y); g.scale(s, s); pig ? pd(g, pw, ph, i) : sd(g, sw, sh, i); g.restore(); }
  big(g, t, '3 PIGEONS + 3 SPARROWS', E.H * 0.16, { at: 0.2, size: 70 }); big(g, t, '× EVERY HOUSE', E.H * 0.8, { at: 2.4, size: 110, color: GOLD }); finish(g, t); });
S('018', {"bars": "none", "sfx": [["input/sfx/laugh.wav", 0.0, -6], ["input/sfx/crowd.wav", 0.0, -14], ["input/sfx/coo.wav", 0.6, -14]], "scene": "at the town gate townsfolk laugh and hand over wicker cages of birds to Olga's soldiers"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { dusk: true, camp: false }); const st = w.stage; scatter(st, 'cage', 30, (r, i) => [-8 + (i % 10) * 1.6, 0, 58 + Math.floor(i / 10) * 1.4], 1.4, { seed: 71 }); scatter(st, 'cart', 2, (r, i) => [-14 + i * 28, 0, 60], 4.5); const folk = []; for (let i = 0; i < 10; i++) { const p = A.livePerson(st, 2.6, i % 2 ? 'townswoman' : 'townsman'); p.sprite.position.set(-9 + i * 2, 0, 63 + (i % 2) * 1.4); folk.push(p); } const sold = []; for (let i = 0; i < 4; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-6 + i * 4, 0, 72); sold.push(p); } return { ...w, folk, sold }; },
  draw(s, t, info, T) { s.folk.forEach((p, i) => p.update(t, { pose: breathe(i % 3 ? POSES.cheer : POSES.holdFront, t, 1.4, i), facing: 1, expr: 'happy', talk: Math.abs(Math.sin(t * 10 + i)) })); s.sold.forEach((p, i) => p.update(t, { pose: breathe(POSES.crossArms, t, 1, i), facing: -1, expr: 'smirk' })); T.dolly(s.stage.camera, t, [[0, { pos: [12, 5, 82], look: [-2, 5, 58], fov: 56 }], [info.dur, { pos: [10, 4.6, 78], look: [-2, 5, 58], fov: 56 }]]); },
  overlay: (g, t) => big(g, t, 'THE CITY LAUGHS.', E.H * 0.15, { at: 0.1, size: 96 }) });

// ---------- THE NIGHT ----------
S('019', {"in": "dip", "bars": "none", "sfx": [["input/sfx/fire.wav", 0.0, -12], ["input/sfx/sizzle.wav", 0.8, -8], ["input/sfx/coo.wav", 0.3, -14], ["input/sfx/sizzle.wav", 2.0, -10]], "scene": "night in the camp: soldiers at campfires tie smoking sulfur bundles to the birds' legs; cages everywhere"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { night: true }); const st = w.stage, { THREE } = T; const cf = R.sharedFires(st, [[0, 0, 104], [-12, 0, 98], [12, 0, 98]], 3.4, 4.4); for (const [x, z] of [[0, 104], [-12, 98], [12, 98]]) { const L = new THREE.PointLight('#ff9040', 60, 30, 1.5); L.position.set(x, 3, z); st.add(L); } scatter(st, 'cage', 24, (r, i) => [-10 + (i % 8) * 2.6, 0, 96 + Math.floor(i / 8) * 2.4], 1.4, { seed: 72 }); const men = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-7 + i * 2.8, 0, 107 - (i % 2)); men.push(p); } const birds = R.flock(st, 6, (i, t) => [-7 + i * 2.8 + 0.8, 1.8 + Math.sin(t * 6 + i) * 0.15, 107.6], { fire: true, size: 1.4 }); return { ...w, cf, men, birds }; },
  draw(s, t, info, T) { s.cf.update(t); s.camp.fires.update(t); s.birds.update(t); s.men.forEach((p, i) => p.update(t, { pose: breathe(POSES.holdFront, t, 1, i), facing: i % 2 ? -1 : 1, expr: 'determined' })); T.dolly(s.stage.camera, t, [[0, { pos: [0, 4, 120], look: [0, 3, 100], fov: 52 }], [info.dur, { pos: [0, 3.6, 114], look: [0, 3, 100], fov: 52 }]]); },
  overlay: (g, t) => big(g, t, 'BURNING SULFUR', E.H * 0.15, { at: 0.8, size: 92, color: GOLD }) });
S('020', {"bars": "none", "sfx": [["input/sfx/wings.wav", 0.0, -2], ["input/sfx/whoosh.wav", 0.1, -6]], "scene": "the release: a cloud of burning birds explodes upward from the camp into the night"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { night: true }); w.birds = R.flock(w.stage, 120, (i, t) => { const a = (i * 2.39) % 6.28, k = clamp(t * 0.55 + (i % 10) * 0.03); return [Math.cos(a) * 14 * k + ((i * 13) % 20 - 10), 1 + k * (30 + (i % 7) * 4), 104 - k * (20 + (i % 5) * 6) + Math.sin(a) * 6 * k]; }, { fire: true, size: 2.6 }); return w; },
  draw(s, t, info, T) { s.birds.update(t); s.camp.fires.update(t); T.dolly(s.stage.camera, t, [[0, { pos: [0, 3, 124], look: [0, 12, 90], fov: 62 }], [info.dur, { pos: [0, 6, 128], look: [0, 28, 80], fov: 62 }]]); },
  overlay: (g, t) => big(g, t, 'SET FREE.', E.H * 0.15, { at: 0.3, size: 110 }) });
S('021', {"bars": "none", "sfx": [["input/sfx/wings.wav", 0.0, -6], ["input/sfx/sizzle.wav", 1.4, -6], ["input/sfx/fire.wav", 2.4, -8]], "scene": "inside the town: the birds fly home and dive into their nests under the straw roofs; first flames lick up"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { night: true, burn: true, camp: false }); const roofs = w.town.roofs; w.birds = R.flock(w.stage, 60, (i, t) => { const q = roofs[i % roofs.length], a = i * 2.1, k = clamp(t * 0.42 - (i % 8) * 0.03); if (k >= 1) return null; return [lerp(q[0] + Math.cos(a) * 60, q[0], k), lerp(q[1] + 40, q[1] + 1, k), lerp(q[2] + 60 + Math.sin(a) * 20, q[2], k)]; }, { fire: true, size: 2.6 }); return w; },
  draw(s, t, info, T) { s.birds.update(t); s.roofFires.update(t, (i) => clamp((t - 1.5 - (i % 8) * 0.12) * 0.7)); T.dolly(s.stage.camera, t, [[0, { pos: [34, 36, 34], look: [0, 14, -4], fov: 58 }], [info.dur, { pos: [28, 32, 28], look: [0, 14, -4], fov: 58 }]]); },
  overlay: (g, t) => big(g, t, 'BACK TO THEIR NESTS', E.H * 0.15, { at: 0.4, size: 86, color: GOLD }) });
S('022', {"bars": "none", "sfx": [["input/sfx/boom.wav", 0.0, -2], ["input/sfx/fire.wav", 0.0, -2], ["input/sfx/screams.wav", 0.3, -12], ["input/sfx/bell.wav", 0.6, -12]], "scene": "aerial: every house in Iskorosten catches fire at once"}, { kind: '3d',
  init: (T) => iskorosten(T, { night: true, burn: true }),
  draw(s, t, info, T) { s.roofFires.update(t, (i) => clamp(0.7 + t * 0.3)); s.camp.fires.update(t); T.orbit(s.stage.camera, t, { target: [0, 12, 0], radius: [120, 150], height: [70, 90], from: 1.8, to: 2.2, dur: info.dur }); },
  overlay: (g, t) => { big(g, t, 'EVERY HOUSE.', E.H * 0.14, { at: 0.1, size: 110, color: '#ffffff' }); big(g, t, 'AT ONCE.', E.H * 0.22, { at: 0.8, size: 110, color: RED }); } });

// ---------- ENDING ----------
S('023', {"bars": "none", "sfx": [["input/sfx/fire.wav", 0.0, -8]], "scene": "Olga stands on a rise in front of the burning city, fire light on her face"}, { kind: '3d',
  init(T) { const w = iskorosten(T, { night: true, burn: true }); w.olga = A.livePerson(w.stage, 4.2, 'olga'); w.olga.sprite.position.set(0, 0, 150); return w; },
  draw(s, t, info, T) { s.roofFires.update(t, 1); s.camp.fires.update(t); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: -1, expr: 'neutral' }); T.dolly(s.stage.camera, t, [[0, { pos: [2, 4, 162], look: [0, 5, 120], fov: 52 }], [info.dur, { pos: [1, 4.2, 158], look: [0, 6, 120], fov: 52 }]]); } });
S('023b', {"cue": 23, "dt": 1.9, "in": "fade", "bars": "none", "sfx": [["input/sfx/choir.wav", 0.0, -6], ["input/sfx/bell.wav", 0.2, -8]], "scene": "a golden icon: Saint Olga with a halo — the flames reflected behind her"}, (g, t, info) => {
  fireBg(g, t); g.fillStyle = 'rgba(20,10,4,.35)'; g.fillRect(0, 0, E.W, E.H); const k = ease.out(clamp(t / 0.8)); rr(g, E.W * 0.1, E.H * 0.24, E.W * 0.8, E.H * 0.6, 26); g.fillStyle = linGrad(g, 0, E.H * 0.24, 0, E.H * 0.84, ['#f6d468', '#d8a030', '#b88020']); g.fill(); g.lineWidth = 14; g.strokeStyle = '#6a4210'; g.stroke();
  glow(g, E.W / 2, E.H * 0.43, 380 * k, '#fff2b0', 0.7); ring(g, E.W / 2, E.H * 0.43, 170 * k, 14, '#fff6c8');
  toonFigure(g, { x: E.W / 2, y: E.H * 0.82, s: 2.2, facing: 1, pose: { ...POSES.stand, eF: [-10, -150], hF: [12, -170], eB: [-14, -150], hB: [-30, -170] }, who: CAST.olga, expr: 'neutral', shadow: false });
  big(g, t, 'DECLARED', E.H * 0.1, { at: 0.2, size: 80, color: '#ffffff' }); big(g, t, 'A SAINT.', E.H * 0.17, { at: 0.5, size: 130, color: GOLD }); finish(g, t); });
