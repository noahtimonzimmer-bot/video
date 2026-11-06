// Olga's Burning Birds (9:16 short) — v2: 11 flowing sequences, camera follows the main characters,
// painted sunset/night skies (sky.js), wind/birds/smoke/people motion everywhere (life.js).
import { E, ease, clamp, lerp, seg, circle, ring, poly, glow, alpha, text, rr, linGrad, rng, shake } from '/engine/core.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import * as R from '../rus.js';
import * as SKY from '../sky.js';
import * as L from '../life.js';
import * as CAL from '../creatures.js';
import { S } from '../lib.js';
import { finish, label } from '../lib2.js';
import { CAST, OL, toonFigure } from '../toon.js';
import { scatter, PROPS } from '../props.js';

const CUE = [1.0, 3.857, 6.433, 8.155, 10.995, 12.793, 15.401, 16.926, 19.55, 21.87, 24.857, 26.102, 29.755, 31.908, 34.628, 36.9, 38.661, 41.78, 45.182, 46.904, 50.315, 51.54, 55.328, 57.45];
const st0 = (c) => (c === 0 ? 0 : CUE[c] - 0.12), rel = (c0, c) => CUE[c] - st0(c0);
const big = (g, t, str, y, o = {}) => { if (o.dur !== undefined && t > (o.at ?? 0.15) + o.dur) return; label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 }); };
const between = (t, a, b) => t >= a && t < b;
const RED = '#ff4a2a', GOLD = '#ffd47e';
const SWORD = (g, p) => { const [x, y] = p.hF; seg(g, [[x, y + 6], [x + 8, y - 150]], 13, OL); seg(g, [[x, y + 6], [x + 8, y - 150]], 8, '#e0e4ee'); seg(g, [[x - 22, y - 8], [x + 22, y - 6]], 10, '#c8a030'); };
// every 3D sequence ticks wind/sky/birds/smoke before its own draw
const S3 = (id, meta, o) => S(id, meta, { ...o, kind: '3d', draw(s, t, info, T) { L.tick(s.stage, t); o.draw(s, t, info, T); } });
// background extras walking back and forth on short paths
function walkers(st, list) { const ps = list.map(([who, x, z, dx, dz, sp]) => ({ p: A.livePerson(st, 2.6, who), x, z, dx, dz, sp: sp || 0.25 })); return (t) => ps.forEach((w, i) => { const k = (Math.sin(t * w.sp + i) + 1) / 2, dir = Math.cos(t * w.sp + i) * Math.sign(w.dx || w.dz || 1); w.p.update(t, { pose: walkPose(t * 7 + i), facing: dir >= 0 ? 1 : -1, expr: 'neutral' }); w.p.sprite.position.set(w.x + w.dx * k, 0, w.z + w.dz * k); }); }

// ---------- worlds ----------
function iskorosten(T, o = {}) {
  const st = SKY.stage(T, o.sky || 'sunset', { az: o.az ?? Math.PI / 2, fog: [260, 520] });
  R.steppe(st, { grass: o.snow ? '#e8eef4' : '#86a650', river: [[-900, 74], [-200, 60], [0, 66], [300, 50], [900, 74]], riverW: 24, trees: 240, birch: 110, tufts: o.snow ? 0 : 800, forestIn: 190, clear: (x, z) => Math.hypot(x, z) < 150 || Math.abs(z - 62) < 16 });
  const town = R.hillTown(st, 0, 0, { rad: 40, hill: 12, rock: true, houses: 48, seed: 5, gate: Math.PI / 2, cliffAt: Math.PI / 2 + 0.6, smoke: !o.burn, grass: 0 });
  let camp = null; if (o.camp !== false) camp = R.siegeCamp(st, 0, 0, 82, 140, { tents: 80, night: o.sky === 'night' || o.sky === 'fire', skip: (a) => Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.32 });
  scatter(st, 'bird', o.sky === 'night' || o.sky === 'fire' ? 0 : 30, (r) => [-150 + r() * 300, 50 + r() * 50, -150 + r() * 300], 3, { fog: false });
  let roofFires = null; if (o.burn) { const pts = []; town.roofs.forEach((p, i) => { pts.push([p[0], p[1] - 1, p[2]]); if (i % 2) pts.push([p[0] + 2, p[1] - 2, p[2] + 1.5]); }); roofFires = R.sharedFires(st, pts, 7, 9, { light: 6 }); }
  return { stage: A.finish(T, st), town, camp, roofFires };
}
function kiev(T, o = {}) {
  const st = SKY.stage(T, o.sky || 'golden', { az: o.az ?? Math.PI / 2, fog: [280, 540] });
  const CL = [-40, 190];
  R.steppe(st, { river: [[-900, 120], [-300, 96], [0, 104], [300, 84], [900, 110]], riverW: 66, fields: [[-160, -120], [110, -150], [-60, -230]], trees: 260, birch: 60, forestIn: 220, clear: (x, z) => Math.hypot(x, z) < 120 || Math.abs(z - 100) < 44 || Math.hypot(x - CL[0], z - CL[1]) < 18 });
  R.hillTown(st, 0, 0, { rad: 56, hill: 16, houses: 70, terem: 1.2, seed: 9, gate: Math.PI / 2 });
  R.hillTown(st, -150, 10, { rad: 30, hill: 4, houses: 26, seed: 19, gate: 0.6, grass: 200 });
  for (let i = 0; i < 6; i++) R.longboat(st, -300 + i * 110, -0.6, 112 + (i % 2) * 10, 1, (i % 2) * 0.3, { mast: i % 3 !== 0 });
  for (let i = 0; i < 4; i++) st.add(T.box(4, 1, 16, T.mat('#6a4a2a'), -150 + i * 70, 0.8, 72));
  // forest around the clearing across the river (Igor's death)
  const lane = (x, z) => (Math.abs(x - CL[0]) < 14 && z > CL[1] - 6) || z < 150; scatter(st, 'birch', 80, (r) => { const a = r() * 6.28, d = 16 + r() * 60, x = CL[0] + Math.cos(a) * d, z = CL[1] + Math.sin(a) * d - 8; return lane(x, z) ? null : [x, 0, z]; }, 14, { seed: 3 });
  scatter(st, 'pine', 90, (r) => { const a = r() * 6.28, d = 24 + r() * 90, x = CL[0] + Math.cos(a) * d, z = CL[1] + Math.sin(a) * d - 20; return lane(x, z) ? null : [x, 0, z]; }, 16, { seed: 4 });
  scatter(st, 'grass', 400, (r) => [CL[0] - 40 + r() * 80, 0, CL[1] - 30 + r() * 60], 2.4, { seed: 5 }); scatter(st, 'flowerbed', 24, (r) => [CL[0] - 20 + r() * 40, 0, CL[1] - 12 + r() * 30], 4, { seed: 6 }); scatter(st, 'bush', 60, (r) => { const a = r() * 6.28, d = 12 + r() * 30; return [CL[0] + Math.cos(a) * d, 0, CL[1] + Math.sin(a) * d]; }, 4.5, { seed: 7 });
  scatter(st, 'grass', 300, (r) => [-60 + r() * 120, 0, 56 + r() * 16], 2.4, { seed: 8 }); scatter(st, 'boat', 10, (r) => [-500 + r() * 1000, 0.2, 90 + r() * 30], 9, { seed: 51 });
  scatter(st, 'bird', 30, (r) => [-150 + r() * 300, 60 + r() * 50, -150 + r() * 300], 3, { fog: false });
  return { stage: A.finish(T, st), CL };
}
function yard(T, o = {}) {
  const st = SKY.stage(T, o.sky || 'sunset', { az: o.az ?? Math.PI / 2, fog: [200, 520] });
  A.flatGround(st, 900, W.grassTex(T, '#86a650', [80, 80]));
  const top = T.ground(120, 90, '#ffffff', R.earthTex(T, '#8a6a42', [12, 9])); top.position.set(0, 0.05, -10); top.userData.noOutline = true; st.add(top);
  R.terem(st, 0, 0, -60, 1.4);
  for (let i = 0; i < 12; i++) R.izba(st, (i % 2 ? 1 : -1) * (34 + (i % 3) * 9), 0, -44 + Math.floor(i / 2) * 14, 7, 6, 4.4, { rot: (i % 2 ? -1 : 1) * Math.PI / 2, roof: ['#c8a050', '#b8904a'][i % 2] });
  R.palisade(st, 0, -20, 95, { h: 7, n: 160, towers: 6, gate: Math.PI / 2 });
  scatter(st, 'haystack', 10, (r) => [(r() < 0.5 ? -1 : 1) * (22 + r() * 30), 0, -50 + r() * 70], 3.4); scatter(st, 'fence', 20, (r) => [(r() < 0.5 ? -1 : 1) * (18 + r() * 34), 0, -50 + r() * 70], 3.2); scatter(st, 'logpile', 8, (r) => [(r() < 0.5 ? -1 : 1) * (16 + r() * 30), 0, -40 + r() * 60], 2.6);
  scatter(st, 'barrel', 20, (r) => [(r() < 0.5 ? -1 : 1) * (14 + r() * 20), 0, -40 + r() * 60], 1.5); scatter(st, 'chicken', 16, (r) => [-26 + r() * 52, 0, -10 + r() * 30], 1); scatter(st, 'well', 1, () => [18, 0, -30], 2.6); scatter(st, 'cart', 3, (r, i) => [-24 + i * 6, 0, -34], 4);
  scatter(st, 'grass', 600, (r) => { const x = -140 + r() * 280, z = -110 + r() * 200; return Math.abs(x) < 50 && z > -60 && z < 30 ? null : [x, 0, z]; }, 2.6); scatter(st, 'birch', 40, (r) => { const a = r() * 6.28, d = 105 + r() * 80; return [Math.cos(a) * d, 0, -20 + Math.sin(a) * d]; }, 14);
  scatter(st, 'smoke', 8, (r, i) => [(i % 2 ? 1 : -1) * (34 + (i % 3) * 9), 9, -44 + Math.floor(i / 2) * 14], 3.6);
  scatter(st, 'bird', 16, (r) => [-80 + r() * 160, 40 + r() * 30, -120 + r() * 100], 2.6, { fog: false });
  return st;
}

// ---------- 2D backgrounds ----------
function fireBg(g, t) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0408', '#5a1408', '#e0601a']); g.fillRect(0, 0, E.W, E.H); const r = rng(3); for (let i = 0; i < 26; i++) { const x = r() * E.W, h = 300 + r() * 600 + Math.sin(t * 5 + i) * 60; poly(g, [[x - 80, E.H], [x + Math.sin(t * 4 + i) * 30, E.H - h], [x + 80, E.H]], alpha(i % 2 ? '#ff8a2a' : '#ffd24a', 0.55)); } for (let i = 0; i < 40; i++) circle(g, (r() * E.W + t * 40 * (r() - 0.3)) % E.W, (E.H - ((t * 200 + r() * E.H) % E.H)), 3 + r() * 4, alpha('#ffd27a', 0.8)); }
const flash = (g, t, at, col = '255,255,255', len = 0.35) => { const a = clamp(1 - (t - at) / len); if (t >= at && a > 0) { g.fillStyle = `rgba(${col},${a * 0.8})`; g.fillRect(0, 0, E.W, E.H); } };

// =====================================================================================
// A · HOOK (cues 0–1): ONE flight — follow the burning flock from the camp over the palisade, the town ignites
S3('000', {"in": "cut", "bars": "none", "sfx": [["input/sfx/hit.wav", 0.0, -4], ["input/sfx/wings.wav", 0.0, -4], ["input/sfx/sizzle.wav", 0.4, -10], ["input/sfx/boom.wav", 2.95, -2], ["input/sfx/fire.wav", 3.0, -4], ["input/sfx/screams.wav", 3.4, -14]], "scene": "night, moon, red horizon: a cloud of burning birds streams from the siege camp over the palisade into a wooden town on a rocky hill — the camera flies with them; at 'burned an entire city' every roof bursts into flame"}, {
  init(T) { const w = iskorosten(T, { sky: 'fire', burn: true, az: Math.PI / 2 + 0.3 }); const roofs = w.town.roofs; w.birds = R.flock(w.stage, 110, (i, t) => { const p0 = [-60 + ((i * 37) % 120), 10 + (i % 6) * 3, 150 + (i % 9) * 6], q = roofs[i % roofs.length], k = clamp(t * 0.33 - (i % 13) * 0.015); if (k >= 1) return null; return [lerp(p0[0], q[0], k), lerp(p0[1], q[1] + 1, k) + Math.sin(k * Math.PI) * 26 + Math.sin(t * 3 + i) * 0.8, lerp(p0[2], q[2], k)]; }, { fire: true, size: 3.2 }); return w; },
  draw(s, t, info, T) { s.birds.update(t); s.camp.fires.update(t); const ign = rel(0, 1) - 0.25; s.roofFires.update(t, (i) => clamp((t - ign - (i % 9) * 0.06) * 1.6));
    L.glide(s.stage.camera, t, [[0, { pos: [6, 14, 184], look: [0, 18, 120], fov: 60 }], [1.6, { pos: [2, 30, 132], look: [0, 22, 60], fov: 60 }], [3.2, { pos: [0, 44, 84], look: [0, 12, 0], fov: 62 }], [info.dur, { pos: [70, 76, 120], look: [0, 10, 0], fov: 62 }]]); },
  overlay: (g, t) => { big(g, t, 'THREE BIRDS', E.H * 0.13, { at: 0.1, size: 120, color: '#ffffff' }); big(g, t, 'FROM EVERY HOUSE', E.H * 0.2, { at: 0.8, size: 80, color: GOLD }); flash(g, t, rel(0, 1) - 0.25, '255,180,90', 0.5); } });

// B · KIEV → FOREST (cues 2–4): golden sunset over Kiev, camera sinks across the river into the forest where the Drevlians kill Igor; Mal steps forward grinning
S3('002', {"in": "dip", "bars": "none", "sfx": [["input/sfx/horn.wav", 0.1, -8], ["input/sfx/wind.wav", 0.0, -16], ["input/sfx/sword.wav", 2.3, -6], ["input/sfx/hit.wav", 3.4, -6], ["input/sfx/laugh.wav", 4.8, -8]], "scene": "golden sunset over Kiev on the Dnieper; the camera glides across the river into a birch forest where fur-hatted Drevlians encircle Prince Igor; their prince Mal steps forward grinning"}, {
  init(T) { const w = kiev(T, { sky: 'golden', az: Math.PI / 2 - 0.25 }); const st = w.stage, [cx, cz] = w.CL; w.igor = A.livePerson(st, 2.8, 'igor'); w.igor.sprite.position.set(cx, 0, cz); w.dr = []; for (let i = 0; i < 9; i++) { const p = A.livePerson(st, 2.7, i % 2 ? 'drevlian' : 'drevlian2'), a = Math.PI * (1.12 + i * 0.095); p.sprite.position.set(cx + Math.cos(a) * 7, 0, cz + Math.sin(a) * 5); w.dr.push([p, Math.cos(a)]); } w.mal = A.livePerson(st, 3, 'mal'); w.mal.sprite.position.set(cx + 4, 0, cz - 4); scatter(st, 'horse', 3, (r, i) => [cx - 14 + i * 5, 0, cz - 12], 4.2); return w; },
  draw(s, t, info, T) { const [cx, cz] = s.CL, c3 = rel(2, 3), c4 = rel(2, 4), dead = t > c3 + 1.1;
    s.igor.update(t, { pose: dead ? POSES.lie : breathe(t > c3 + 0.4 ? POSES.handsOnHead : POSES.ready, t), facing: 1, expr: 'scared' });
    s.dr.forEach(([p, c], i) => p.update(t, { pose: dead ? breathe(POSES.cheer, t, 1.4, i) : breathe(POSES.ready, t, 1, i), facing: c > 0 ? -1 : 1, expr: dead ? 'happy' : 'angry', prop: dead && i % 2 ? SWORD : null }));
    const k = clamp((t - c4) / 1.2); s.mal.update(t, { pose: k > 0 && k < 1 ? walkPose(t * 8) : breathe(POSES.explain, t), facing: 1, expr: k > 0 ? 'smirk' : 'angry', talk: k >= 1 ? Math.abs(Math.sin(t * 12)) : 0 }); s.mal.sprite.position.set(cx + 4 - k * 2, 0, cz - 4 + k * 10);
    L.glide(s.stage.camera, t, [[0, { pos: [40, 130, 330], look: [0, 14, 0], fov: 55 }], [c3 - 0.5, { pos: [cx + 10, 22, cz + 70], look: [cx, 4, cz], fov: 55 }], [c3 + 0.6, { pos: [cx + 2, 6, cz + 24], look: [cx, 3, cz], fov: 52 }], [c4 + 0.3, { pos: [cx + 1, 5, cz + 20], look: [cx + 1, 3, cz], fov: 50 }], [info.dur, { pos: [cx + 2.5, 4.4, cz + 15], look: [cx + 2, 3.6, cz + 6], fov: 46 }]]); },
  overlay: (g, t) => { const c3 = rel(2, 3), c4 = rel(2, 4); big(g, t, 'KIEV', E.H * 0.13, { at: 0.2, size: 120, dur: c3 }); big(g, t, '945 AD', E.H * 0.2, { at: 0.5, size: 90, color: GOLD, dur: c3 - 0.3 }); big(g, t, 'PRINCE IGOR', E.H * 0.14, { at: c3 + 0.2, size: 96, color: GOLD, dur: c4 - c3 - 0.2 }); big(g, t, 'FATAL MISTAKE.', E.H * 0.14, { at: c4 + 0.3, size: 100, color: RED }); } });

// C · ENVOYS (cues 5–6): track the Drevlian longboat rowing into the sunset; it lands where Olga waits and smiles
S3('005', {"bars": "none", "sfx": [["input/sfx/oars.wav", 0.0, -6], ["input/sfx/horn.wav", 0.8, -12], ["input/sfx/crowd.wav", 2.6, -20]], "scene": "sunset on the Dnieper: the Drevlian longboat full of envoys rows towards the Kiev bank; the camera tracks it until Olga, waiting with her guards, smiles graciously"}, {
  init(T) { const w = kiev(T, { sky: 'sunset', az: Math.PI / 2 + 2.6 }); const st = w.stage; w.boat = R.longboat(st, 110, -0.5, 76, 1.1, 0, { mast: true }); w.env = []; for (let i = 0; i < 5; i++) w.env.push(A.livePerson(st, 2.3, i ? 'drevlian' : 'mal')); w.olga = A.livePerson(st, 3.2, 'olga'); w.olga.sprite.position.set(156, 0, 56); A.addPeople(st, [['rus', 152, 0, 54, 1, 'stand', 'determined'], ['rus2', 160.5, 0, 54.5, -1, 'stand', 'determined'], ['rus', 164, 0, 53, -1, 'stand', 'determined']], { w: 2.9, key: 'grd' }); return w; },
  draw(s, t, info, T) { const c6 = rel(5, 6), k = ease.out(clamp(t / (c6 + 0.4))), x = lerp(104, 152, k); s.boat.position.x = x; s.boat.position.y = -0.5 + Math.sin(t * 2.2) * 0.12;
    s.env.forEach((p, i) => { p.update(t, { pose: t > c6 ? breathe(POSES.wave, t, 1, i) : breathe(i % 2 ? POSES.holdFront : POSES.relaxed, t, 1, i), facing: 1, expr: 'happy' }); p.sprite.position.set(x - 6 + i * 3, 2.2 + s.boat.position.y + 0.5, 76); });
    s.olga.update(t, { pose: breathe(t > c6 ? POSES.explain : POSES.crossArms, t), facing: -1, expr: t > c6 ? 'smile' : 'neutral', talk: t > c6 + 0.2 && t < c6 + 1.2 ? Math.abs(Math.sin(t * 13)) : 0 });
    L.glide(s.stage.camera, t, [[0, { pos: [120, 7, 48], look: [106, 3, 76], fov: 52 }], [c6 - 0.6, { pos: [144, 6.5, 44], look: [144, 3, 74], fov: 52 }], [info.dur, { pos: [160, 5, 44], look: [155, 3.5, 60], fov: 50 }]]); },
  overlay: (g, t) => { big(g, t, 'OLGA', E.H * 0.14, { at: 1.0, size: 130, color: GOLD, dur: rel(5, 6) - 1 }); big(g, t, 'WITH HONOR…', E.H * 0.14, { at: rel(5, 6) + 0.1, size: 96 }); } });

// D · THE PIT (cue 7)
S3('007', {"bars": "none", "sfx": [["input/sfx/dig.wav", 0.2, -4], ["input/sfx/dig.wav", 1.0, -6], ["input/sfx/screams.wav", 0.4, -14], ["input/sfx/thud.wav", 1.8, -6]], "scene": "the envoys still sit in their boat — now deep in a pit; Olga's men shovel earth over them under a blood-red sunset"}, {
  init(T) { const st = yard(T, { sky: 'sunset', az: Math.PI / 2 + 0.2 }); R.burialPit(st, 0, -8, 24, 10, { wall: 4 }); R.longboat(st, 0, -1.6, -8, 1.05, 0, { mast: false }); const env = []; for (let i = 0; i < 5; i++) { const p = A.livePerson(st, 2.4, i % 2 ? 'drevlian' : 'mal'); p.sprite.position.set(-6 + i * 3, 1.4, -8); env.push(p); } const diggers = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-10 + i * 4, 3.2, -15.5); diggers.push(p); } const olga = A.livePerson(st, 3.2, 'olga'); olga.sprite.position.set(14, 3.2, -1); const dirt = R.flock(st, 30, (i, t) => { const k = ((t * 1.2 + i * 0.13) % 1); return [-10 + (i % 6) * 4 + k * 0.5, 4.5 + Math.sin(k * Math.PI) * 3 - k * 3, -14.5 + k * 6]; }, { color: '#5a3a22', size: 0.9 }); return { stage: A.finish(T, st), env, diggers, olga, dirt }; },
  draw(s, t, info, T) { s.dirt.update(t); s.env.forEach((p, i) => p.update(t, { pose: breathe(POSES.handsOnHead, t, 1.5, i), facing: i % 2 ? 1 : -1, expr: 'scared' })); s.diggers.forEach((p, i) => p.update(t, { pose: Math.sin(t * 6 + i) > 0 ? POSES.crouch : POSES.holdFront, facing: 1, expr: 'determined' })); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: -1, expr: 'smirk' });
    L.glide(s.stage.camera, t, [[0, { pos: [16, 9, 12], look: [12, 4, -2], fov: 50 }], [info.dur, { pos: [4, 26, 10], look: [0, 0, -8], fov: 55 }]]); },
  overlay: (g, t) => big(g, t, 'BURIED ALIVE.', E.H * 0.14, { at: 0.9, size: 104, color: RED }) });

// E · BATHHOUSE (cues 8–10): Olga gives the order, the camera follows the nobles into the bathhouse, the bar drops, it burns against the sunset
S3('008', {"bars": "none", "sfx": [["input/sfx/steam.wav", 2.4, -12], ["input/sfx/door.wav", 4.0, -2], ["input/sfx/thud.wav", 4.2, -2], ["input/sfx/fire.wav", 5.3, -2], ["input/sfx/screams.wav", 5.6, -12]], "scene": "sunset yard: Olga smiles 'send me your noblest men'; the camera follows Drevlian nobles into a steaming log bathhouse; a soldier bars the door; flames climb the straw roof"}, {
  init(T) { const st = yard(T, { sky: 'sunset', az: Math.PI / 2 - 0.2 }); R.banya(st, 0, -8); const bar = T.box(3.6, 0.5, 0.5, T.mat('#2a1a0a'), -2, 1.7, -4.1); st.add(bar); scatter(st, 'bucket', 3, (r, i) => [3 + i * 1.2, 0, -3.6], 1); scatter(st, 'logpile', 2, (r, i) => [6 + i * 3, 0, -6], 2.4);
    const steam = []; for (let i = 0; i < 4; i++) steam.push([2.2 + (i % 2), 9 + i * 1.4, -8]); scatter(st, 'smoke', 4, (r, i) => steam[i], 3);
    const pts = []; for (let i = 0; i < 9; i++) pts.push([-4 + i, 5 + (i % 3), -8 + (i % 2 ? 3 : -3)]); const fires = R.sharedFires(st, pts, 6, 9, { light: 3 });
    const olga = A.livePerson(st, 3.2, 'olga'); olga.sprite.position.set(9, 0, 8); const nob = []; for (let i = 0; i < 4; i++) nob.push(A.livePerson(st, 2.8, i % 2 ? 'drevlian2' : 'drevlian')); const sold = A.livePerson(st, 3, 'rus'); return { stage: A.finish(T, st), bar, olga, nob, sold, fires }; },
  draw(s, t, info, T) { const c9 = rel(8, 9), lock = c9 + 1.55, c10 = rel(8, 10);
    s.olga.update(t, { pose: breathe(t < c9 ? POSES.explain : POSES.crossArms, t), facing: -1, expr: t > lock ? 'smirk' : 'smile', talk: t < c9 - 0.2 ? Math.abs(Math.sin(t * 13)) : 0 });
    s.nob.forEach((p, i) => { const k = clamp((t - c9 + 0.4) * 0.55 - i * 0.12); p.update(t, { pose: walkPose(t * 9 + i), facing: -1, expr: 'happy' }); p.sprite.position.set(5 - k * 7, 0, 6 - k * 9.6 + i * 0.3); p.sprite.visible = k < 0.97; });
    s.bar.visible = t > lock; s.sold.update(t, { pose: t > lock - 0.1 ? POSES.reach : walkPose(t * 9), facing: -1, expr: 'determined' }); s.sold.sprite.position.set(Math.max(0.4, 8 - Math.max(0, t - c9) * 3.4), 0, -2.6);
    s.fires.update(t, (i) => clamp((t - c10 + 0.2 - (i % 4) * 0.15) * 1.2));
    L.glide(s.stage.camera, t, [[0, { pos: [11, 4.4, 15], look: [9, 3.6, 8], fov: 46 }], [c9 + 0.4, { pos: [8, 5, 16], look: [3, 3, 0], fov: 50 }], [lock, { pos: [4, 4.6, 10], look: [-1, 2.6, -4], fov: 50 }], [info.dur, { pos: [2, 7, 26], look: [0, 6, -8], fov: 56 }]]); },
  overlay: (g, t) => { const c9 = rel(8, 9); big(g, t, 'NEXT:', E.H * 0.12, { at: 0.2, size: 80, dur: c9 }); big(g, t, 'THEIR NOBLEST MEN', E.H * 0.18, { at: 0.5, size: 78, color: GOLD, dur: c9 - 0.3 }); big(g, t, 'LOCKED.', E.H * 0.14, { at: c9 + 1.6, size: 120, color: RED, dur: rel(8, 10) - c9 - 1.6 }); } });

// F · FUNERAL FEAST (cues 11–12): follow Olga walking along the drinking Drevlians; her men draw swords
S3('011', {"bars": "none", "sfx": [["input/sfx/crowd.wav", 0.0, -10], ["input/sfx/laugh.wav", 0.6, -10], ["input/sfx/cups.wav", 1.4, -8], ["input/sfx/sword.wav", 3.7, -2], ["input/sfx/sword.wav", 3.9, -4], ["input/sfx/boom.wav", 4.1, -6], ["input/sfx/screams.wav", 4.0, -10]], "scene": "sunset at Igor's burial mound: long tables, Drevlians drink and laugh; the camera follows Olga walking along the tables; at her signal her men draw their swords — red flash"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2 + 0.15, fog: [220, 520] }); R.steppe(st, { trees: 220, birch: 80, forestIn: 120, clear: (x, z) => Math.hypot(x, z) < 60 }); R.kurgan(st, 0, -40, 18, 9); const fires = R.sharedFires(st, [[-24, 0, -10], [24, 0, -10], [-24, 0, 14], [24, 0, 14]], 3, 4, { light: 4 });
    for (const tx of [-9, 9]) { st.add(T.box(4, 2.4, 40, T.mat('#6a4226'), tx, 1.2, 0)); for (const s2 of [-1, 1]) st.add(T.box(1.2, 1.2, 38, T.mat('#5a3a22'), tx + s2 * 3.2, 0.6, 0)); scatter(st, 'goblet', 14, (r, i) => [tx + (i % 2 ? 1 : -1), 2.42, -18 + i * 2.6], 0.6, { seed: tx + 50 }); scatter(st, 'jug', 7, (r, i) => [tx, 2.42, -16 + i * 5], 1.2, { seed: tx + 60 }); scatter(st, 'roast', 4, (r, i) => [tx, 2.42, -14 + i * 9], 1.8); scatter(st, 'bread', 6, (r, i) => [tx + 0.6, 2.42, -17 + i * 6], 1.2); scatter(st, 'fruit', 4, (r, i) => [tx - 0.6, 2.42, -12 + i * 8], 1.1); }
    scatter(st, 'barrel', 10, (r, i) => [-18 + (i % 2) * 2, 0, -12 + i * 2.5], 1.6); scatter(st, 'barrel', 8, (r, i) => [18 + (i % 2) * 2, 0, -10 + i * 2.6], 1.6); scatter(st, 'horse', 6, (r, i) => [-34 + i * 12, 0, -30], 4.4); scatter(st, 'grass', 400, (r) => { const x = -70 + r() * 140, z = -60 + r() * 110; return Math.abs(x) < 16 && Math.abs(z) < 22 ? null : [x, 0, z]; }, 2.4); scatter(st, 'bird', 20, (r) => [-80 + r() * 160, 40 + r() * 30, -120 + r() * 80], 2.6, { fog: false });
    const dr = []; for (let i = 0; i < 16; i++) { const tx = i < 8 ? -9 : 9, sd = i % 2 ? 1 : -1, p = A.livePerson(st, 2.6, i % 3 ? 'drevlian' : 'drevlian2'); p.sprite.position.set(tx + sd * 3.4, 0, -16 + (i % 8) * 4.4); dr.push([p, -sd]); }
    const serv = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(i < 3 ? -14 : 14, 0, -12 + (i % 3) * 10); serv.push(p); }
    const olga = A.livePerson(st, 3.2, 'olga'); return { stage: A.finish(T, st), fires, dr, serv, olga }; },
  draw(s, t, info, T) { s.fires.update(t); const c12 = rel(11, 12), war = t > c12, ok = clamp(t / c12), oz = lerp(18, -6, ease.inOut(ok));
    s.olga.update(t, { pose: war ? POSES.point : walkPose(t * 7), facing: -1, expr: war ? 'angry' : 'neutral' }); s.olga.sprite.position.set(0, 0, oz);
    s.dr.forEach(([p, f], i) => p.update(t, { pose: war ? (t > c12 + 0.5 + (i % 4) * 0.1 ? POSES.fall : POSES.handsOnHead) : breathe(i % 3 ? POSES.cheer : POSES.holdFront, t, 1.2, i), facing: f, expr: war ? 'scared' : 'happy', talk: war ? 0 : Math.abs(Math.sin(t * 9 + i)) * (i % 2) }));
    s.serv.forEach((p, i) => p.update(t, { pose: war ? POSES.cheer : breathe(POSES.holdFront, t), facing: i < 3 ? 1 : -1, expr: war ? 'angry' : 'smirk', prop: war ? SWORD : null }));
    const [kx, ky] = war ? shake(t, 0.25, 8) : [0, 0];
    L.glide(s.stage.camera, t, [[0, { pos: [5 + kx, 5, oz + 14], look: [0, 3, oz - 8], fov: 52 }], [c12, { pos: [5, 5.5, 4], look: [0, 3, -14], fov: 52 }], [info.dur, { pos: [8 + kx, 9 + ky, 18], look: [0, 3, -8], fov: 56 }]]); },
  overlay: (g, t) => { const c12 = rel(11, 12); big(g, t, 'THE FUNERAL FEAST', E.H * 0.14, { at: 0.2, size: 84, color: GOLD, dur: c12 - 0.2 }); flash(g, t, c12, '200,30,20', 0.5); big(g, t, 'SWORDS.', E.H * 0.13, { at: c12 + 0.05, size: 120, color: '#ffffff' }); big(g, t, '5,000 DEAD', E.H * 0.2, { at: c12 + 0.8, size: 96, color: RED }); } });

// G · SIEGE (cues 13–15): reveal flight around Iskorosten at sunset, a year passes, the camera settles at Olga's tent where an envoy kneels
S3('013', {"in": "dip", "bars": "none", "sfx": [["input/sfx/drum.wav", 0.0, -4], ["input/sfx/drum.wav", 0.7, -6], ["input/sfx/horn.wav", 1.2, -10], ["input/sfx/wind.wav", 2.8, -10], ["input/sfx/tick.wav", 2.9, -10]], "scene": "sunset reveal: Iskorosten on its granite hill above the river, ringed by Olga's striped tents and banners; a calendar spins through a year; the camera descends to Olga's red tent where a townsman kneels"}, {
  init(T) { const w = iskorosten(T, { sky: 'sunset', az: Math.PI / 2 }); const st = w.stage, { THREE } = T; const tent = new THREE.Mesh(new THREE.ConeGeometry(7, 9, 14), T.mat('#a81a22')); tent.position.set(-4, 4.5, 96); st.add(tent); st.add(T.cyl(0.2, 0.2, 14, T.mat('#4a2e18'), 2, 7, 98)); const b = T.plane(2.6, 5, T.mat('#ffffff', { map: R.tridentBanner(T), side: THREE.DoubleSide })); b.position.set(3.3, 11, 98); b.userData.noOutline = true; b.userData.flag = true; st.add(b); scatter(st, 'fur', 3, (r, i) => [-2 + i * 2, 0.05, 103], 2.4); scatter(st, 'barrel', 4, (r, i) => [-10 + i * 1.6, 0, 100], 1.5); scatter(st, 'spears', 2, (r, i) => [6 + i * 2, 0, 96], 3.6);
    w.olga = A.livePerson(st, 3.4, 'olga'); w.olga.sprite.position.set(-1, 0, 101.5); w.env = A.livePerson(st, 2.8, 'townsman'); A.addPeople(st, [['rus', -6, 0, 102, 1, 'stand', 'determined'], ['rus2', 6.5, 0, 101, -1, 'stand', 'determined']], { w: 3, key: 'tg' }); w.walk = walkers(st, [['rus', -20, 110, 10, 0], ['rus2', 14, 108, 0, 8], ['rus', 24, 96, -8, 4], ['townsman', -14, 92, 6, 6]]); A.finish(T, st); return w; },
  draw(s, t, info, T) { s.camp.fires.update(t); s.walk(t); const c15 = rel(13, 15), k = clamp((t - c15 + 0.8) / 1.2);
    s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: 1, expr: 'smirk' }); s.env.update(t, { pose: k < 1 ? walkPose(t * 8) : POSES.kneel, facing: -1, expr: 'worried' }); s.env.sprite.position.set(lerp(12, 3.5, k), 0, lerp(92, 103, k));
    L.glide(s.stage.camera, t, [[0, { pos: [180, 120, 140], look: [0, 10, 0], fov: 55 }], [2.4, { pos: [60, 100, 220], look: [0, 10, 0], fov: 55 }], [c15 - 0.6, { pos: [10, 26, 150], look: [0, 8, 90], fov: 55 }], [info.dur, { pos: [3, 4.6, 116], look: [0, 5, 70], fov: 54 }]]); },
  overlay: (g, t) => { const c14 = rel(13, 14), c15 = rel(13, 15); big(g, t, 'ISKOROSTEN', E.H * 0.13, { at: 0.3, size: 110, color: GOLD, dur: c14 - 0.3 });
    if (between(t, c14, c15)) { const n = Math.min(365, Math.round(Math.pow(clamp((t - c14) / (c15 - c14 - 0.3)), 1.6) * 365)); const s = ease.outBack(clamp((t - c14) * 4)) * 0.75; CAL.calendar(g, t, n, 'DAYS', { y: E.H * 0.33, s }); big(g, t, 'ONE WHOLE YEAR', E.H * 0.12, { at: c14 + 0.1, size: 86, dur: c15 - c14 - 0.1 }); }
    big(g, t, 'AN OFFER…', E.H * 0.14, { at: c15 + 0.2, size: 104, color: GOLD }); } });

// H · THE OFFER (cues 16–18): close on Olga talking, the "gift" pops up, then the camera turns to the gate where the town laughs and pays
S3('016', {"bars": "none", "sfx": [["input/sfx/choir.wav", 0.0, -14], ["input/sfx/coo.wav", 3.5, -6], ["input/sfx/chirp.wav", 4.6, -6], ["input/sfx/pop.wav", 3.4, -12], ["input/sfx/pop.wav", 3.8, -12], ["input/sfx/pop.wav", 4.2, -12], ["input/sfx/pop.wav", 4.7, -12], ["input/sfx/pop.wav", 5.1, -12], ["input/sfx/pop.wav", 5.5, -12], ["input/sfx/laugh.wav", 6.7, -6], ["input/sfx/crowd.wav", 6.6, -14]], "scene": "close on Olga at her tent, sweetly: no more revenge — only three pigeons and three sparrows from every house (icons pop in); the camera swings to the town gate where laughing townsfolk hand over wicker cages"}, {
  init(T) { const w = iskorosten(T, { sky: 'sunset', az: Math.PI / 2 + 0.2 }); const st = w.stage, { THREE } = T; const tent = new THREE.Mesh(new THREE.ConeGeometry(7, 9, 14), T.mat('#a81a22')); tent.position.set(-4, 4.5, 96); st.add(tent); scatter(st, 'fur', 3, (r, i) => [-2 + i * 2, 0.05, 103], 2.4);
    w.olga = A.livePerson(st, 3.4, 'olga'); w.olga.sprite.position.set(-1, 0, 101.5); w.env = A.livePerson(st, 2.8, 'townsman'); w.env.sprite.position.set(3.5, 0, 103);
    scatter(st, 'cage', 30, (r, i) => [-8 + (i % 10) * 1.6, 0, 70 + Math.floor(i / 10) * 1.4], 1.4, { seed: 71 }); scatter(st, 'cart', 2, (r, i) => [-14 + i * 28, 0, 72], 4.5);
    w.folk = []; for (let i = 0; i < 10; i++) { const p = A.livePerson(st, 2.6, i % 2 ? 'townswoman' : 'townsman'); p.sprite.position.set(-9 + i * 2, 0, 75 + (i % 2) * 1.4); w.folk.push(p); } w.sold = []; for (let i = 0; i < 4; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-6 + i * 4, 0, 82); w.sold.push(p); } return w; },
  draw(s, t, info, T) { s.camp.fires.update(t); const c18 = rel(16, 18);
    s.olga.update(t, { pose: breathe(POSES.explain, t), facing: 1, expr: t < 2 ? 'smile' : 'happy', talk: t < c18 - 0.3 ? Math.abs(Math.sin(t * 12)) * (Math.sin(t * 2.3) > -0.6 ? 1 : 0) : 0 }); s.env.update(t, { pose: POSES.kneel, facing: -1, expr: t > 3.4 ? 'surprised' : 'worried' });
    s.folk.forEach((p, i) => p.update(t, { pose: breathe(i % 3 ? POSES.cheer : POSES.holdFront, t, 1.4, i), facing: 1, expr: 'happy', talk: Math.abs(Math.sin(t * 10 + i)) })); s.sold.forEach((p, i) => p.update(t, { pose: breathe(POSES.crossArms, t, 1, i), facing: -1, expr: 'smirk' }));
    L.glide(s.stage.camera, t, [[0, { pos: [1, 4.4, 110], look: [-0.5, 4, 100], fov: 44 }], [c18 - 1.2, { pos: [2, 4.6, 108], look: [-0.5, 4.2, 100], fov: 46 }], [c18, { pos: [8, 6, 96], look: [0, 5, 74], fov: 54 }], [info.dur, { pos: [6, 5, 90], look: [0, 5, 70], fov: 54 }]]); },
  overlay: (g, t) => { const c17 = rel(16, 17), c18 = rel(16, 18); big(g, t, '“NO MORE REVENGE.”', E.H * 0.13, { at: 0.2, size: 84, dur: c17 - 0.4 });
    if (between(t, c17 - 0.2, c18)) { const a = clamp((t - c17 + 0.2) * 4) * clamp((c18 - t) * 4); g.save(); g.globalAlpha = a; rr(g, E.W * 0.08, E.H * 0.08, E.W * 0.84, E.H * 0.26, 28); g.fillStyle = '#f2e2b8'; g.fill(); g.lineWidth = 8; g.strokeStyle = OL; g.stroke(); const [pw, ph, pd] = PROPS.pigeon, [sw, sh, sd] = PROPS.sparrow; for (let i = 0; i < 6; i++) { const k = ease.outBack(clamp((t - c17 - i * 0.4) * 4)); if (k <= 0) continue; const pig = i < 3, x = E.W * (0.2 + (i % 3) * 0.24) + (pig ? -40 : 40), y = E.H * (pig ? 0.17 : 0.27), sc = (pig ? 2.3 : 2.8) * k; g.save(); g.translate(x - 35 * sc, y - 30 * sc); g.scale(sc, sc); pig ? pd(g, pw, ph, i) : sd(g, sw, sh, i); g.restore(); } g.restore(); if (t < c18 - 0.25) big(g, t, '× EVERY HOUSE', E.H * 0.4, { at: c17 + 2.4, size: 96, color: GOLD }); }
    big(g, t, 'THE CITY LAUGHS.', E.H * 0.14, { at: c18 + 0.1, size: 96 }); } });

// I · THE NIGHT (cues 19–21): campfires, sulfur tied on; the birds are released and the camera flies with them over the wall to their nests
S3('019', {"in": "dip", "bars": "none", "sfx": [["input/sfx/fire.wav", 0.0, -12], ["input/sfx/sizzle.wav", 0.8, -8], ["input/sfx/coo.wav", 0.3, -14], ["input/sfx/sizzle.wav", 2.0, -10], ["input/sfx/wings.wav", 3.5, -2], ["input/sfx/whoosh.wav", 3.6, -6], ["input/sfx/wings.wav", 5.5, -8], ["input/sfx/sizzle.wav", 7.2, -6]], "scene": "moonlit night in the camp: soldiers at campfires tie smoking sulfur to the birds; on 'set them free' a cloud of burning birds explodes upward and the camera flies with them over the palisade down onto the straw roofs"}, {
  init(T) { const w = iskorosten(T, { sky: 'night', burn: true, az: Math.PI / 2 + 0.5 }); const st = w.stage, { THREE } = T; const cf = R.sharedFires(st, [[0, 0, 104], [-12, 0, 98], [12, 0, 98]], 3.4, 4.4); for (const [x, z] of [[0, 104], [-12, 98], [12, 98]]) { const Lt = new THREE.PointLight('#ff9040', 60, 30, 1.5); Lt.position.set(x, 3, z); st.add(Lt); } scatter(st, 'cage', 24, (r, i) => [-10 + (i % 8) * 2.6, 0, 96 + Math.floor(i / 8) * 2.4], 1.4, { seed: 72 });
    const men = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.8, i % 2 ? 'rus' : 'rus2'); p.sprite.position.set(-7 + i * 2.8, 0, 107 - (i % 2)); men.push(p); }
    const roofs = w.town.roofs, rel20 = rel(19, 20); const birds = R.flock(st, 120, (i, t) => { if (t < rel20) return i < 6 ? [-7 + i * 2.8 + 0.8, 1.8 + Math.sin(t * 6 + i) * 0.15, 107.6] : null; const q = roofs[i % roofs.length], tt = t - rel20, k = clamp(tt * 0.24 - (i % 10) * 0.02); if (k >= 1) return null; const sx = -7 + (i % 6) * 2.8, sz = 107; return [lerp(sx, q[0], k) + Math.sin(i) * 8 * Math.sin(k * Math.PI), lerp(1.8, q[1] + 1, k) + Math.sin(k * Math.PI) * 34, lerp(sz, q[2], k)]; }, { fire: true, size: 2.6 });
    return { ...w, cf, men, birds }; },
  draw(s, t, info, T) { const r20 = rel(19, 20), r21 = rel(19, 21); s.cf.update(t); s.camp.fires.update(t); s.birds.update(t); s.roofFires.update(t, (i) => clamp((t - info.dur + 1.0 - (i % 8) * 0.1) * 1.2));
    s.men.forEach((p, i) => p.update(t, { pose: t > r20 ? breathe(POSES.cheer, t, 1, i) : breathe(POSES.holdFront, t, 1, i), facing: i % 2 ? -1 : 1, expr: t > r20 ? 'happy' : 'determined' }));
    L.glide(s.stage.camera, t, [[0, { pos: [0, 4, 120], look: [0, 3, 104], fov: 50 }], [r20, { pos: [0, 3.6, 116], look: [0, 6, 100], fov: 54 }], [r20 + 1.2, { pos: [0, 16, 112], look: [0, 30, 70], fov: 60 }], [r21 + 0.8, { pos: [0, 40, 70], look: [0, 18, 10], fov: 60 }], [info.dur, { pos: [6, 30, 34], look: [0, 13, 0], fov: 58 }]]); },
  overlay: (g, t) => { const r20 = rel(19, 20), r21 = rel(19, 21); big(g, t, 'BURNING SULFUR', E.H * 0.14, { at: 0.8, size: 92, color: GOLD, dur: r20 - 0.8 }); big(g, t, 'SET FREE.', E.H * 0.14, { at: r20 + 0.1, size: 110, dur: r21 - r20 }); big(g, t, 'BACK TO THEIR NESTS', E.H * 0.14, { at: r21 + 0.3, size: 86, color: GOLD }); } });

// J · EVERY HOUSE AT ONCE (cue 22 → 23): wide orbit over the burning town, then land behind Olga watching
S3('022', {"bars": "none", "sfx": [["input/sfx/boom.wav", 0.0, -2], ["input/sfx/fire.wav", 0.0, -2], ["input/sfx/screams.wav", 0.3, -12], ["input/sfx/bell.wav", 0.6, -12]], "scene": "every house of Iskorosten burns at once under a red sky; the camera sweeps around and lands behind Olga standing on a rise, her silhouette against the inferno"}, {
  init(T) { const w = iskorosten(T, { sky: 'fire', burn: true, az: Math.PI / 2 }); w.olga = A.livePerson(w.stage, 4.2, 'olga'); w.olga.sprite.position.set(0, 0, 134); scatter(w.stage, 'smoke', 30, (r, i) => { const p = w.town.roofs[i % w.town.roofs.length]; return [p[0], p[1] + 10 + r() * 8, p[2]]; }, 12, { seed: 61, fog: false }); return w; },
  draw(s, t, info, T) { const c23 = rel(22, 23); s.roofFires.update(t, (i) => clamp(0.75 + t * 0.3)); s.camp.fires.update(t); s.olga.update(t, { pose: breathe(POSES.crossArms, t), facing: -1, expr: 'neutral' });
    L.glide(s.stage.camera, t, [[0, { pos: [110, 70, 60], look: [0, 12, 0], fov: 58 }], [c23 - 0.5, { pos: [30, 22, 160], look: [0, 10, 40], fov: 56 }], [info.dur, { pos: [2, 4.6, 146], look: [0, 6, 100], fov: 52 }]]); },
  overlay: (g, t) => { big(g, t, 'EVERY HOUSE.', E.H * 0.13, { at: 0.1, size: 110, color: '#ffffff', dur: rel(22, 23) }); big(g, t, 'AT ONCE.', E.H * 0.2, { at: 0.8, size: 110, color: RED, dur: rel(22, 23) - 0.8 }); } });

// K · SAINT (cue 23, second half): golden icon
S('023b', {"cue": 23, "dt": 1.9, "in": "fade", "bars": "none", "sfx": [["input/sfx/choir.wav", 0.0, -6], ["input/sfx/bell.wav", 0.2, -8]], "scene": "a golden icon: Saint Olga with a halo — the flames behind her"}, (g, t, info) => {
  fireBg(g, t); g.fillStyle = 'rgba(20,10,4,.35)'; g.fillRect(0, 0, E.W, E.H); const k = ease.out(clamp(t / 0.8)); rr(g, E.W * 0.1, E.H * 0.24, E.W * 0.8, E.H * 0.6, 26); g.fillStyle = linGrad(g, 0, E.H * 0.24, 0, E.H * 0.84, ['#f6d468', '#d8a030', '#b88020']); g.fill(); g.lineWidth = 14; g.strokeStyle = '#6a4210'; g.stroke();
  glow(g, E.W / 2, E.H * 0.43, 380 * k, '#fff2b0', 0.7); ring(g, E.W / 2, E.H * 0.43, 170 * k, 14, '#fff6c8');
  toonFigure(g, { x: E.W / 2, y: E.H * 0.82, s: 2.2, facing: 1, pose: breathe(POSES.holdFront, t), who: CAST.olga, expr: 'neutral', blink: t % 3 > 2.85, shadow: false });
  big(g, t, 'DECLARED', E.H * 0.1, { at: 0.2, size: 80, color: '#ffffff' }); big(g, t, 'A SAINT.', E.H * 0.17, { at: 0.5, size: 130, color: GOLD }); finish(g, t); });
