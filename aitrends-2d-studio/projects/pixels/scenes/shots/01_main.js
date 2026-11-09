// The Million Dollar Pixels (9:16 short) — vivid look, flowing sequences, real CC0 sounds, real screenshot at the end.
import { E, ease, clamp, lerp, seg, circle, ring, poly, glow, alpha, text, rr, linGrad, rng, shake } from '/engine/core.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import * as C from '../city.js';
import * as SKY from '../sky.js';
import * as L from '../life.js';
import * as PG from '../pixelgrid.js';
import { S } from '../lib.js';
import { finish, label } from '../lib2.js';
import { CAST, OL, toonFigure } from '../toon.js';
import { scatter, PROPS } from '../props.js';

const loadImg = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
const REAL = await loadImg('/project/input/real_site.jpg');   // the user's photo of the real site (843×632)
const CUE = [0.9, 4.973, 7.56, 12.125, 15.658, 19.057, 21.756, 24.069, 25.727, 28.185, 30.821, 32.429, 36.283, 38.615, 42.34, 45.399, 46.88];
const st0 = (c) => (c === 0 ? 0 : CUE[c] - 0.12), rel = (c0, c) => CUE[c] - st0(c0);
const big = (g, t, str, y, o = {}) => { if (o.dur !== undefined && t > (o.at ?? 0.15) + o.dur) return; label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 }); };
const GOLD = '#ffd47e', GREEN = '#7aff8a', RED = '#ff4a2a';
const S3 = (id, meta, o) => S(id, meta, { ...o, kind: '3d', draw(s, t, info, T) { L.tick(s.stage, t); o.draw(s, t, info, T); } });
const money = (g, t, at, target, y, o = {}) => { if (t < at) return; const k = ease.out(clamp((t - at) / (o.dur || 1.4))); const n = Math.round(k * target); label(g, t, (o.pre || '$') + n.toLocaleString('en-US'), E.W / 2, y, { at, size: o.size || 140, color: o.color || GREEN, stroke: 20 }); };
const liveCanvas = (T, w, h) => { const { THREE } = T, c = document.createElement('canvas'); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return { c, g: c.getContext('2d'), tex }; };
function bgBlue(g, t) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a7ae8', '#7ab0f8', '#c8e4ff']); g.fillRect(0, 0, E.W, E.H); const r = rng(7); for (let i = 0; i < 40; i++) { const s = 10 + r() * 30; g.fillStyle = alpha(['#ffffff', '#ffd84a', '#ff6ad5', '#2ad16a'][i % 4], 0.35); g.fillRect((r() * E.W + t * 30 * (i % 3 + 1)) % E.W, (r() * E.H + t * 50) % E.H, s, s); } }

// a bright town square with a giant pixel billboard (hook) — buildings, trees, birds, walkers
function square(T, o = {}) { const st = SKY.stage(T, o.sky || 'sunset', { az: o.az ?? Math.PI / 2, fog: [220, 520] }); A.flatGround(st, 1500, W.grassTex(T, '#6cc84a', [100, 100])); const plaza = T.ground(90, 70, '#ffffff', C.pavement(T, '#e8dcc8', [12, 10])); plaza.position.set(0, 0.05, 0); plaza.userData.noOutline = true; st.add(plaza);
  for (let i = 0; i < 9; i++) C.building(st, -64 + i * 16, -44, 15, 10, 10 + (i % 3) * 4, { kind: ['brick', 'stucco', 'siding'][i % 3], seed: i }); for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const b = C.building(st, sx * 52, -26 + i * 16, 15, 10, 9 + (i % 2) * 5, { kind: ['stucco', 'brick'][i % 2], seed: 20 + i }); b.rotation.y = -sx * Math.PI / 2; }
  const bill = liveCanvas(T, 1024, 1024); PG.paintGrid(bill.g, 0, 0, 1024, 1, {}); bill.tex.needsUpdate = true; st.add(T.box(36, 36, 1.4, T.mat('#2a2a34'), 0, 28, -36)); const pl = T.plane(34, 34, new T.THREE.MeshBasicMaterial({ map: bill.tex, toneMapped: false, color: '#cfcfcf' })); pl.position.set(0, 28, -35.2); pl.userData.noOutline = true; st.add(pl); for (const sx of [-12, 12]) st.add(T.box(1.6, 12, 1.6, T.mat('#3a3a44'), sx, 6, -36));
  scatter(st, 'tree', 24, (r, i) => [(i % 2 ? 1 : -1) * (30 + (i % 4) * 4), 0, -30 + Math.floor(i / 2) * 6], 7); scatter(st, 'bush', 30, (r) => [-40 + r() * 80, 0, 24 + r() * 10], 3); scatter(st, 'bench', 6, (r, i) => [-24 + i * 9.6, 0, 18], 2.6); scatter(st, 'grass', 300, (r) => [-80 + r() * 160, 0, 30 + r() * 50], 2.4); scatter(st, 'flowerbed', 16, (r, i) => [-30 + i * 4, 0, -24], 3.4); scatter(st, 'bird', 24, (r) => [-80 + r() * 160, 40 + r() * 30, -120 + r() * 100], 2.6, { fog: false });
  for (let i = 0; i < 16; i++) C.streetLamp(st, -36 + (i % 8) * 10, i < 8 ? -20 : 22, { dir: 1 });
  const walk = []; for (let i = 0; i < 10; i++) { const p = A.livePerson(st, 2.5, ['guy', 'girl', 'dad', 'reporter'][i % 4]); walk.push({ p, x: -30 + i * 6, z: -6 + (i % 4) * 5, d: i % 2 ? 1 : -1 }); }
  return { st, bill, walk };
}
const tickWalk = (w, t) => w.forEach((q, i) => { const x = ((q.x + q.d * t * 2 + 40) % 80 + 80) % 80 - 40; q.p.update(t, { pose: walkPose(t * 7 + i), facing: q.d, expr: 'neutral' }); q.p.sprite.position.set(x, 0, q.z); });

// A · HOOK (0–1): golden square, Alex in front of the giant pixel wall; counter to $1,000,000; "not one product"
S3('000', {"in": "cut", "bars": "none", "sfx": [["input/sfx/whoosh.wav", 0.0, -4], ["input/sfx/coins.wav", 0.3, -6], ["input/sfx/beep.wav", 1.6, -8], ["input/sfx/cheer.wav", 3.6, -12]], "scene": "sunset town square: a young student stands in front of a giant billboard made of a million colourful ad pixels; bills flutter, a counter races to $1,000,000"}, {
  init(T) { const w = square(T, { az: Math.PI / 2 + 0.25 }); scatter(w.st, 'bill', 50, (r) => [-10 + r() * 20, 9 + r() * 6, -4 + r() * 16], 1.2, { seed: 11, fog: false }); w.alex = A.livePerson(w.st, 3, 'alex'); w.alex.sprite.position.set(0, 0, 6); return { stage: A.finish(T, w.st), ...w }; },
  draw(s, t, info, T) { tickWalk(s.walk, t); const c1 = rel(0, 1); s.alex.update(t, { pose: breathe(t > c1 ? POSES.shrug : POSES.crossArms, t), facing: 1, expr: t > c1 ? 'smirk' : 'happy' });
    L.glide(s.stage.camera, t, [[0, { pos: [1.5, 3.6, 14], look: [0, 3.6, 4], fov: 46 }], [c1, { pos: [3, 8, 26], look: [0, 16, -20], fov: 54 }], [info.dur, { pos: [4, 10, 34], look: [0, 20, -30], fov: 58 }]]); },
  overlay: (g, t) => { const c1 = rel(0, 1); big(g, t, '21 YEARS OLD', E.H * 0.12, { at: 0.1, size: 70, dur: c1 - 0.1 }); money(g, t, 0.4, 1000000, E.H * 0.19, { dur: 2.2 }); big(g, t, 'NOT ONE PRODUCT.', E.H * 0.27, { at: c1 + 0.1, size: 80, color: GOLD }); } });

// B · WHO (2–3): London dorm at sunset, Alex broke at his desk; the idea lights up
S3('002', {"in": "dip", "bars": "none", "sfx": [["input/sfx/street.wav", 0.0, -20], ["input/sfx/click.wav", 1.2, -10], ["input/sfx/idea.wav", 4.7, -4]], "scene": "a cosy student room in England at sunset, LONDON poster; Alex sits broke at his laptop, then a lightbulb idea flashes"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2 }); const m = C.dorm(st, { poster: 'london' }); scatter(st, 'books', 4, (r, i) => [-6 + i * 1.3, 0, -5.6], 1.2); const alex = A.livePerson(st, 3, 'alex'); alex.sprite.position.set(4.8, 0, -1.6); return { stage: A.finish(T, st), m, alex }; },
  draw(s, t, info, T) { const c3 = rel(2, 3); const g = s.m.mc.getContext('2d'); g.fillStyle = '#f4f6fa'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#c8202a'; g.font = 'bold 34px sans-serif'; g.textAlign = 'center'; g.fillText('BALANCE: £0.00', 256, 150); g.fillStyle = '#5a5a6a'; g.font = '22px sans-serif'; g.fillText('University fees due', 256, 200); s.m.mtex.needsUpdate = true;
    s.alex.update(t, { pose: t < c3 ? breathe(POSES.facepalm, t) : breathe(POSES.pointUp, t, 1.4), facing: t < c3 ? -1 : 1, expr: t < c3 ? 'sad' : 'happy' });
    L.glide(s.stage.camera, t, [[0, { pos: [8, 4.6, 6], look: [3.8, 3.6, -3.5], fov: 50 }], [c3, { pos: [6.6, 4.2, 4], look: [4.6, 4, -1.6], fov: 46 }], [info.dur, { pos: [6, 4.2, 3], look: [4.7, 4.4, -1.6], fov: 44 }]]); },
  overlay: (g, t) => { const c3 = rel(2, 3); big(g, t, 'ALEX TEW', E.H * 0.12, { at: 0.2, size: 110, dur: c3 - 0.2 }); big(g, t, 'BROKE STUDENT · ENGLAND', E.H * 0.19, { at: 0.7, size: 56, color: GOLD, dur: c3 - 0.7 });
    if (t > c3 - 0.1) { const k = ease.outBack(clamp((t - c3) * 3)), x = E.W * 0.62, y = E.H * 0.33; glow(g, x, y, 240 * k, '#fff2a0', 0.8); g.save(); g.translate(x, y); g.scale(k * 1.6, k * 1.6); g.beginPath(); g.arc(0, 0, 40, Math.PI * 0.8, Math.PI * 2.2); g.lineTo(18, 46); g.lineTo(-18, 46); g.closePath(); g.fillStyle = '#ffe84a'; g.fill(); g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); g.fillStyle = '#a8a8b8'; g.fillRect(-18, 46, 36, 18); g.strokeRect(-18, 46, 36, 18); g.restore(); big(g, t, 'A RIDICULOUS IDEA', E.H * 0.13, { at: c3 + 0.2, size: 76, color: GOLD }); } } });

// C · THE WEBSITE (4–6): camera pushes into the laptop screen — 1,000,000 pixels, $1 each, the first ads appear
S3('004', {"bars": "none", "sfx": [["input/sfx/click.wav", 0.2, -8], ["input/sfx/click.wav", 3.6, -8], ["input/sfx/beep.wav", 6.4, -8], ["input/sfx/beep.wav", 7.0, -10], ["input/sfx/beep.wav", 7.5, -10]], "scene": "close on Alex's monitor: an empty white grid titled The Million Dollar Homepage — $1 per pixel; the first small colourful ads pop in"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2 }); const m = C.dorm(st, { poster: 'london', mw: 1024, mh: 640 }); const alex = A.livePerson(st, 3, 'alex'); alex.sprite.position.set(6.6, 0, -1.4); return { stage: A.finish(T, st), m, alex }; },
  draw(s, t, info, T) { const c6 = rel(4, 6), g = s.m.mc.getContext('2d'); g.fillStyle = '#dde3ee'; g.fillRect(0, 0, 1024, 640); PG.paintSite(g, 262, 10, 500, t < c6 ? 0 : clamp((t - c6) * 0.012), { newest: true }); s.m.mtex.needsUpdate = true;
    s.alex.update(t, { pose: breathe(POSES.explain, t), facing: -1, expr: 'happy' });
    L.glide(s.stage.camera, t, [[0, { pos: [6, 5, 3], look: [3.5, 4.6, -6], fov: 50 }], [info.dur, { pos: [3.5, 4.35, -4.0], look: [3.5, 4.8, -6.1], fov: 40 }]]); },
  overlay: (g, t) => { const c5 = rel(4, 5), c6 = rel(4, 6); big(g, t, '1,000,000 PIXELS', E.H * 0.12, { at: 0.3, size: 96, dur: c5 - 0.3 }); big(g, t, '$1 PER PIXEL', E.H * 0.12, { at: c5 + 0.1, size: 120, color: GREEN, dur: c6 - c5 - 0.1 }); big(g, t, 'YOUR AD HERE', E.H * 0.12, { at: c6 + 0.1, size: 100, color: GOLD }); } });

// D · NOBODY CARED (7): night, crickets, almost empty grid
S3('007', {"in": "dip", "bars": "none", "sfx": [["input/sfx/crickets.wav", 0.0, -8]], "scene": "night in the dorm: Alex stares at a nearly empty pixel grid, crickets chirp"}, {
  init(T) { const st = SKY.stage(T, 'night', { az: Math.PI / 2 }); const m = C.dorm(st, { poster: 'london', night: true, mw: 1024, mh: 640 }); const alex = A.livePerson(st, 3, 'alex'); alex.sprite.position.set(4.8, 0, -1.6); return { stage: A.finish(T, st), m, alex }; },
  draw(s, t, info, T) { const g = s.m.mc.getContext('2d'); g.fillStyle = '#dde3ee'; g.fillRect(0, 0, 1024, 640); PG.paintSite(g, 262, 10, 500, 0.012); s.m.mtex.needsUpdate = true; s.alex.update(t, { pose: breathe(POSES.sad, t), facing: 1, expr: 'sad' });
    L.glide(s.stage.camera, t, [[0, { pos: [8, 4.4, 4.4], look: [4, 3.8, -3.2], fov: 48 }], [info.dur, { pos: [7.4, 4.4, 3.6], look: [4, 3.8, -3.2], fov: 46 }]]); },
  overlay: (g, t) => big(g, t, 'NOBODY CARED.', E.H * 0.13, { at: 0.1, size: 110, color: '#c8d4ff' }) });

// E · THE PRESS (8–9): newspapers spin in over a busy street; everyone wants a piece
S3('008', {"bars": "none", "sfx": [["input/sfx/press.wav", 0.0, -8], ["input/sfx/paper.wav", 0.2, -6], ["input/sfx/cameras.wav", 0.9, -6], ["input/sfx/walla.wav", 2.4, -10], ["input/sfx/message.wav", 3.0, -10], ["input/sfx/message.wav", 3.8, -12]], "scene": "golden town square: newspapers with headlines spin in; reporters with cameras flash; crowds point at the giant pixel billboard"}, {
  init(T) { const w = square(T, { sky: 'golden', az: Math.PI / 2 - 0.3 }); w.rep = []; for (let i = 0; i < 4; i++) { const p = A.livePerson(w.st, 2.8, 'reporter'); p.sprite.position.set(-6 + i * 4, 0, 4 + (i % 2)); w.rep.push(p); } w.crowd = []; for (let i = 0; i < 10; i++) { const p = A.livePerson(w.st, 2.6, ['guy', 'girl', 'dad'][i % 3]); p.sprite.position.set(-14 + i * 3, 0, -2 - (i % 2) * 2); w.crowd.push(p); } return { stage: A.finish(T, w.st), ...w }; },
  draw(s, t, info, T) { tickWalk(s.walk, t); s.rep.forEach((p, i) => p.update(t, { pose: breathe(POSES.holdFront, t, 1, i), facing: -1, expr: 'surprised' })); s.crowd.forEach((p, i) => p.update(t, { pose: breathe(i % 2 ? POSES.pointUp : POSES.cheer, t, 1.2, i), facing: i % 2 ? 1 : -1, expr: 'happy', talk: Math.abs(Math.sin(t * 9 + i)) }));
    L.glide(s.stage.camera, t, [[0, { pos: [0, 5, 22], look: [0, 6, 0], fov: 54 }], [info.dur, { pos: [2, 9, 30], look: [0, 18, -30], fov: 58 }]]); },
  overlay: (g, t) => { const c9 = rel(8, 9); const heads = [['STUDENT SELLS PIXELS FOR $1', 'His homepage goes viral'], ['THE MILLION DOLLAR HOMEPAGE', 'Everyone wants a spot'], ['PIXEL MANIA!', 'Ads pour in from around the world']];
    heads.forEach(([h, sub], i) => { const at = 0.15 + i * 0.55, k = ease.outBack(clamp((t - at) * 2.2)); if (k <= 0) return; const out = clamp((t - c9 - 0.2) * 2); PG.newspaper(g, E.W * (0.32 + i * 0.18), E.H * (0.36 + i * 0.05) + out * E.H, 1.1 * k, (1 - k) * 6 + (i - 1) * 0.12, h, sub, i); });
    for (let i = 0; i < 4; i++) { const ft = (t * 3 + i * 0.7) % 2.4; if (ft < 0.08) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, E.W, E.H); } }
    big(g, t, 'EVERYONE WANTED A PIECE', E.H * 0.12, { at: c9 + 0.2, size: 70, color: GOLD }); } });

// F · SOLD OUT (10–12): the grid fills like crazy, the last 1,000 pixels go to auction — $38,100
S('010', {"in": "fade", "bars": "none", "sfx": [["input/sfx/beep.wav", 0.1, -8], ["input/sfx/beep.wav", 0.3, -9], ["input/sfx/beep.wav", 0.5, -9], ["input/sfx/beep.wav", 0.7, -10], ["input/sfx/beep.wav", 0.9, -10], ["input/sfx/coins.wav", 0.4, -6], ["input/sfx/gavel.wav", 3.2, -2], ["input/sfx/gavel.wav", 5.9, -2], ["input/sfx/applause.wav", 6.0, -8]], "scene": "the website fills at crazy speed with colourful ads; zoom on the last empty 1,000 pixels — AUCTION — gavel — $38,100"}, (g, t, info) => {
  bgBlue(g, t); const c11 = rel(10, 11), c12 = rel(10, 12); const fill = t < c11 ? 0.04 + ease.inOut(clamp(t / (c11 - 0.2))) * 0.96 : 1;
  const z = t < c11 ? 1 : 1 + ease.inOut(clamp((t - c11) / 1.2)) * 2.2, W0 = E.W * 0.86; const R = PG.RESERVED, cx = (R.x + R.w / 2) / 100, cy = (R.y + R.h / 2) / 100;
  g.save(); g.translate(E.W / 2, E.H * 0.52); g.scale(z, z); const X = -W0 / 2, Y = -W0 * 0.59, gx = X + W0 * 0.03, gy = Y + W0 * 0.06 + W0 * 0.1 + W0 * 0.02, gs = W0 * 0.94; g.translate(-(gx + gs * cx) * (z - 1) / z, -(gy + gs * cy) * (z - 1) / z);
  PG.paintSite(g, X, Y, W0, fill, { hi: t > c11, reservedFilled: t > c12 - 0.2, newest: t < c11 }); g.restore();
  const sold = Math.round(Math.min(999000, fill * 999000)); if (t < c11) label(g, t, sold.toLocaleString('en-US') + ' PIXELS SOLD', E.W / 2, E.H * 0.12, { at: 0, size: 70, color: '#ffffff', stroke: 16 });
  if (t > c11) { big(g, t, 'LAST 1,000 PIXELS', E.H * 0.12, { at: c11 + 0.1, size: 84, color: '#ffffff', dur: c12 - c11 - 0.1 }); big(g, t, 'AUCTION', E.H * 0.19, { at: c11 + 0.6, size: 110, color: GOLD, dur: c12 - c11 - 0.6 }); }
  money(g, t, c12, 38100, E.H * 0.15, { size: 150, dur: 1.0 }); finish(g, t); });

// G · THE MILLION (13): dorm at sunset, bills raining, Alex jumping — $1,000,000+
S3('013', {"bars": "none", "sfx": [["input/sfx/coins.wav", 0.0, -2], ["input/sfx/cheer.wav", 0.2, -6], ["input/sfx/beep.wav", 1.0, -10]], "scene": "sunset dorm: Alex jumps for joy while hundred-dollar bills rain down; the counter passes one million dollars"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2 }); const m = C.dorm(st, { poster: 'london', mw: 1024, mh: 640 }); scatter(st, 'bill', 90, (r) => [-7 + r() * 14, 8 + r() * 2, -5 + r() * 10], 0.9, { seed: 21, fog: false }); const alex = A.livePerson(st, 3, 'alex'); alex.sprite.position.set(2.4, 0, -1.0); return { stage: A.finish(T, st), m, alex }; },
  draw(s, t, info, T) { const g = s.m.mc.getContext('2d'); g.fillStyle = '#dde3ee'; g.fillRect(0, 0, 1024, 640); PG.paintSite(g, 262, 10, 500, 1, { reservedFilled: true }); s.m.mtex.needsUpdate = true; s.alex.update(t, { pose: breathe(POSES.cheer, t, 2), facing: 1, expr: 'happy' }); s.alex.sprite.position.y = Math.abs(Math.sin(t * 6)) * 0.6;
    L.glide(s.stage.camera, t, [[0, { pos: [3, 4, 7], look: [2, 4, -2], fov: 50 }], [info.dur, { pos: [4, 5, 9], look: [2, 4.6, -3], fov: 54 }]]); },
  overlay: (g, t) => { big(g, t, 'A FEW MONTHS LATER', E.H * 0.1, { at: 0.05, size: 64 }); money(g, t, 0.3, 1037100, E.H * 0.17, { dur: 2.0, size: 130 }); } });

// H · STILL ONLINE (14–16): the REAL site (user's photo) in a browser frame, slow zoom & pan
S('014', {"in": "fade", "bars": "none", "sfx": [["input/sfx/click.wav", 0.2, -6], ["input/sfx/message.wav", 0.4, -10], ["input/sfx/idea.wav", 4.6, -8]], "scene": "the real Million Dollar Homepage (photo) in a clean browser frame, slow zoom across the ads — still online today; attention = money"}, (g, t, info) => {
  bgBlue(g, t); const c15 = rel(14, 15), c16 = rel(14, 16), k = t / info.dur; const fw = E.W * 0.9, fx = (E.W - fw) / 2, fy = E.H * 0.25, fh = E.H * 0.6;
  rr(g, fx, fy, fw, fh, 26); g.fillStyle = '#e8eaf0'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a2a34'; g.stroke(); const bar = 60; for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff5a52', '#ffbd2e', '#28c840'][i]; g.beginPath(); g.arc(fx + 34 + i * 30, fy + bar / 2, 9, 0, 7); g.fill(); } rr(g, fx + 130, fy + 12, fw - 160, bar - 24, 18); g.fillStyle = '#ffffff'; g.fill(); g.fillStyle = '#5a5a6a'; g.font = '26px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('milliondollarhomepage.com', fx + 150, fy + bar / 2);
  g.save(); rr(g, fx + 6, fy + bar, fw - 12, fh - bar - 6, 18); g.clip();
  if (REAL) { const sx = 155, sy = 72, sw = 533, sh = 560, vw = fw - 12, vh = fh - bar - 6, base = Math.max(vw / sw, vh / sh), zz = 1 + ease.inOut(k) * 0.55, s = base * zz, dw = sw * s, dh = sh * s; const px = fx + 6 + (vw - dw) * lerp(0.5, 0.2, ease.inOut(k)), py = fy + bar + (vh - dh) * lerp(0.0, 0.6, ease.inOut(k)); g.drawImage(REAL, sx, sy, sw, sh, px, py, dw, dh); }
  else PG.paintGrid(g, fx + 6, fy + bar, fw - 12, 1);
  g.restore();
  big(g, t, 'STILL ONLINE TODAY', E.H * 0.12, { at: 0.3, size: 90, dur: c16 - 0.3 }); big(g, t, 'NOTHING NEW INVENTED', E.H * 0.19, { at: c15 + 0.05, size: 64, color: GOLD, dur: c16 - c15 - 0.05 });
  big(g, t, 'ATTENTION', E.H * 0.11, { at: c16 + 0.1, size: 110, color: '#ffffff' }); big(g, t, '= MONEY', E.H * 0.19, { at: c16 + 0.6, size: 120, color: GREEN }); finish(g, t); });
