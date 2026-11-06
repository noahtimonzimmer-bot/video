// Burger Code (9:16 short) — fiction channel. 11 flowing sequences: hook → why → mysterious method → reveal at the end.
import { E, ease, clamp, lerp, seg, circle, ring, poly, glow, alpha, text, rr, linGrad, rng, shake } from '/engine/core.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import * as C from '../city.js';
import * as SKY from '../sky.js';
import * as L from '../life.js';
import * as CAL from '../creatures.js';
import { S } from '../lib.js';
import { finish, label } from '../lib2.js';
import { CAST, OL, toonFigure } from '../toon.js';
import { scatter, PROPS } from '../props.js';

const CUE = [0.9, 5.417, 7.55, 11.821, 13.174, 19.943, 21.963, 28.584, 32.409, 36.194, 38.552, 42.462, 47.6, 51.229, 54.75];
const st0 = (c) => (c === 0 ? 0 : CUE[c] - 0.12), rel = (c0, c) => CUE[c] - st0(c0);
const big = (g, t, str, y, o = {}) => { if (o.dur !== undefined && t > (o.at ?? 0.15) + o.dur) return; label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 }); };
const between = (t, a, b) => t >= a && t < b;
const GOLD = '#ffd47e', GREEN = '#7aff8a', RED = '#ff4a2a';
const S3 = (id, meta, o) => S(id, meta, { ...o, kind: '3d', draw(s, t, info, T) { L.tick(s.stage, t); s.traffic?.(t); o.draw(s, t, info, T); } });
const CUP = (g, p) => { const [x, y] = p.hF; g.save(); g.translate(x - 14, y - 44); g.scale(0.5, 0.5); PROPS.cup[2](g, 60, 100, 1); g.restore(); };
const BAG = (g, p) => { const [x, y] = p.hB; g.save(); g.translate(x - 40, y - 20); g.scale(0.8, 0.8); PROPS.trashbag[2](g, 110, 110, 0); g.restore(); };
const money = (g, t, at, target = 150000, y = E.H * 0.3) => { const k = ease.out(clamp((t - at) / 1.6)); if (t < at) return; const n = Math.round(k * target / 10) * 10; const s = '$' + n.toLocaleString('en-US'); label(g, t, s, E.W / 2, y, { at, size: 150, color: GREEN, stroke: 20 }); };
function town(T, o = {}) { const st = SKY.stage(T, o.sky || 'sunset', { az: o.az ?? Math.PI / 2, fog: [220, 500] }); const w = C.town(st, { banner: true, night: o.sky === 'night' || o.sky === 'dusk' }); scatter(st, 'bird', o.sky === 'night' ? 0 : 24, (r) => [-120 + r() * 240, 40 + r() * 40, -150 + r() * 160], 2.6, { fog: false }); return { st, ...w }; }
function crowdLine(st, n, x0, z0, dx) { const ps = []; for (let i = 0; i < n; i++) { const p = A.livePerson(st, 2.5, ['guy', 'girl', 'dad', 'kid'][i % 4]); p.sprite.position.set(x0 + i * dx, 0, z0 + (i % 2) * 0.6); ps.push(p); } return (t) => ps.forEach((p, i) => p.update(t, { pose: breathe(i % 3 === 0 ? POSES.holdFront : i % 3 === 1 ? POSES.phone : POSES.relaxed, t, 1, i), facing: -1, expr: i % 2 ? 'happy' : 'neutral', prop: i % 3 === 0 ? CUP : null })); }
function techBg(g, t, col = '#0a1a2a') { g.fillStyle = linGrad(g, 0, 0, 0, E.H, [col, '#0a0e1a', '#050810']); g.fillRect(0, 0, E.W, E.H); g.strokeStyle = 'rgba(90,176,255,.10)'; g.lineWidth = 2; for (let x = (t * 20) % 60; x < E.W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); } for (let y = (t * 30) % 60; y < E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); } }

// A · HOOK (0–1): Chris walks out of the burger place at sunset holding ONE cup, bills fluttering — $150,000 … LEGAL.
S3('000', {"in": "cut", "bars": "none", "sfx": [["input/sfx/hit.wav", 0.0, -4], ["input/sfx/kaching.wav", 0.4, -6], ["input/sfx/riser.wav", 0.2, -12], ["input/sfx/stamp.wav", 4.5, -4]], "scene": "sunset: a student in a beanie walks out of a burger restaurant toward us holding one paper cup, hundred-dollar bills fluttering around him, BURGERS pole sign glowing; a money counter races to $150,000"}, {
  init(T) { const w = town(T, { az: Math.PI / 2 + 0.15 }); const st = w.st; scatter(st, 'bill', 60, (r) => [-6 + r() * 26, 9 + r() * 6, -2 + r() * 18], 1.3, { seed: 11, fog: false }); w.chris = A.livePerson(st, 2.8, 'chris'); w.line = crowdLine(st, 6, -14, 6.5, 2.2); return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { s.line(t); const z = -2 + t * 1.7; s.chris.update(t, { pose: walkPose(t * 8), facing: 1, expr: t > rel(0, 1) ? 'smirk' : 'happy', prop: CUP }); s.chris.sprite.position.set(6, 0, z);
    L.glide(s.stage.camera, t, [[0, { pos: [8, 2.2, z + 7], look: [6, 3.2, z - 6], fov: 50 }], [info.dur, { pos: [9, 2.8, 2 + info.dur * 1.7 + 8], look: [5, 5, -8], fov: 54 }]]); },
  overlay: (g, t) => { money(g, t, 0.15, 150000, E.H * 0.14); big(g, t, 'FROM A FAST FOOD GIANT', E.H * 0.21, { at: 1.2, size: 64, dur: rel(0, 1) - 1.2 }); big(g, t, '100% LEGAL.', E.H * 0.22, { at: rel(0, 1) + 0.1, size: 110, color: GOLD }); } });

// B · WHO & WHY (2–3): dorm at sunset, Chris at his desk; camera drifts to the Japan poster; bank app shows $42
S3('002', {"in": "dip", "bars": "none", "sfx": [["input/sfx/typing.wav", 0.0, -14], ["input/sfx/notify.wav", 4.4, -6], ["input/sfx/sadhorn.wav", 7.6, -10]], "scene": "a cosy dorm room at sunset: Chris types at his desk; the camera drifts to a JAPAN poster with Mt Fuji; his phone shows a balance of $42"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2 }); const m = C.dorm(st, {}); scatter(st, 'cup', 6, (r, i) => [1 + i * 0.6, 3.15, -4.6 - (i % 2) * 0.4], 0.5); scatter(st, 'books', 3, (r, i) => [-6 + i * 1.3, 0, -5.6], 1.2); const chris = A.livePerson(st, 3, 'chris'); chris.sprite.position.set(3.4, 0, -3.4); return { stage: A.finish(T, st), m, chris }; },
  draw(s, t, info, T) { C.paintMonitor(s.m, t, 'code', { count: 0 }); const c3 = rel(2, 3); s.chris.update(t, { pose: t < c3 ? breathe(POSES.holdFront, t) : breathe(t > c3 + 2.4 ? POSES.facepalm : POSES.think, t), facing: t < c3 ? -1 : 1, expr: t < c3 ? 'neutral' : t > c3 + 2.4 ? 'sad' : 'happy', talk: 0 });
    L.glide(s.stage.camera, t, [[0, { pos: [6, 4.2, 4], look: [3.4, 3.4, -4], fov: 50 }], [1.8, { pos: [1.5, 5, 2], look: [-2, 5.4, -6.7], fov: 48 }], [c3 - 0.2, { pos: [1.8, 5, 2.4], look: [-1.5, 5.2, -6.7], fov: 48 }], [info.dur, { pos: [2, 4.4, 3.2], look: [1, 4.6, -5], fov: 50 }]]); },
  overlay: (g, t) => { const c3 = rel(2, 3); big(g, t, 'CHRIS', E.H * 0.13, { at: 0.2, size: 120, dur: 1.3 }); big(g, t, 'DREAM: JAPAN', E.H * 0.13, { at: 1.6, size: 96, color: GOLD, dur: c3 - 1.6 });
    big(g, t, 'BROKE AS HELL.', E.H * 0.2, { at: c3 + 0.1, size: 100, color: RED }); } });

// C · THE CONTEST (4): golden-hour burger place, line of customers with cups, banner WIN $1,000,000
S3('004', {"bars": "none", "sfx": [["input/sfx/crowd.wav", 0.0, -14], ["input/sfx/jingle.wav", 0.3, -6], ["input/sfx/carpass.wav", 2.0, -14], ["input/sfx/kaching.wav", 4.0, -10]], "scene": "golden hour: the burger restaurant is packed, a line of people with cups out the door, a big yellow banner WIN $1,000,000, cars passing; the camera glides from the street up to the banner and pole sign"}, {
  init(T) { const w = town(T, { sky: 'golden', az: Math.PI / 2 - 0.2 }); const st = w.st; w.line = crowdLine(st, 12, -12, 5, 2); w.line2 = crowdLine(st, 6, 12, 6.5, 1.8); w.walk = []; for (let i = 0; i < 6; i++) { const p = A.livePerson(st, 2.5, ['girl', 'guy', 'dad'][i % 3]); w.walk.push(p); } scatter(st, 'cup', 30, (r) => [-14 + r() * 30, 0, 3 + r() * 6], 0.6, { seed: 41 }); return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { s.line(t); s.line2(t); s.walk.forEach((p, i) => { const dir = i % 2 ? 1 : -1, x = ((i * 23 + dir * t * 2.2) % 80 + 80) % 80 - 40; p.update(t, { pose: walkPose(t * 7 + i), facing: dir, expr: 'neutral', prop: i % 2 ? CUP : null }); p.sprite.position.set(x, 0, i % 2 ? 26 : 10); });
    L.glide(s.stage.camera, t, [[0, { pos: [-30, 4, 34], look: [-6, 4, 0], fov: 54 }], [info.dur * 0.55, { pos: [-8, 6, 24], look: [-3, 6, -2], fov: 52 }], [info.dur, { pos: [6, 9, 18], look: [-4, 7, -3], fov: 50 }]]); },
  overlay: (g, t) => { big(g, t, 'COLLECT THE CODES', E.H * 0.13, { at: 0.8, size: 80 }); big(g, t, 'WIN $1,000,000', E.H * 0.2, { at: 2.0, size: 100, color: GOLD }); } });

// D · THE STRANGE MOVE (5–7): Chris walks past the line without buying, around to the back alley; cleaners hand him their trash
S3('005', {"bars": "none", "sfx": [["input/sfx/steps.wav", 0.0, -12], ["input/sfx/question.wav", 1.6, -8], ["input/sfx/dumpster.wav", 3.6, -8], ["input/sfx/bagdrop.wav", 6.4, -6], ["input/sfx/laughsmall.wav", 6.8, -12]], "scene": "sunset: Chris walks right past the queue without buying, rounds the corner into the back alley full of dumpsters and black trash bags, and offers two cleaners to take their trash — they shrug and hand it over"}, {
  init(T) { const w = town(T, { az: Math.PI / 2 + 0.4 }); const st = w.st; w.line = crowdLine(st, 8, -12, 5, 2); w.chris = A.livePerson(st, 2.8, 'chris'); w.cl = [A.livePerson(st, 2.8, 'cleaner'), A.livePerson(st, 2.7, 'cleaner2')]; w.cl[0].sprite.position.set(-2, 0, -19.5); w.cl[1].sprite.position.set(2.5, 0, -20); scatter(st, 'trashbag', 8, (r, i) => [-4 + i * 1.3, 0, -21.5], 1.6, { seed: 51 }); return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { s.line(t); const c6 = rel(5, 6), c7 = rel(5, 6) + 3.3; let px, pz, moving, fac;
    if (t < c6) { px = 6 + t * 2.4; pz = 9.6; moving = true; fac = 1; } else { const k = clamp((t - c6) / (c7 - c6 - 0.2)); px = lerp(16, 4, k); pz = lerp(-13, -18.6, k); moving = k < 1; fac = -1; }
    s.chris.update(t, { pose: moving ? walkPose(t * 7) : breathe(t > c7 + 0.6 ? POSES.cheer : POSES.explain, t), facing: fac, expr: t > c7 ? 'happy' : 'smirk', talk: !moving && t < c7 + 0.6 ? Math.abs(Math.sin(t * 12)) : 0, prop: t > c7 + 0.9 ? BAG : null }); s.chris.sprite.position.set(px, 0, pz);
    s.cl.forEach((p, j) => p.update(t, { pose: t > c7 + 0.3 ? (j ? POSES.shrug : POSES.reach) : breathe(POSES.holdFront, t, 1, j), facing: 1, expr: t > c7 ? 'surprised' : 'neutral' }));
    L.glide(s.stage.camera, t, [[0, { pos: [8, 3.2, 19.5], look: [6.5, 3, 9.6], fov: 50 }], [c6 - 0.9, { pos: [11, 3.4, 19.5], look: [9.5, 3, 9.6], fov: 50 }], [c6 - 0.2, { pos: [14, 4.5, 18], look: [16, 11, 3], fov: 54 }], [c6 + 0.5, { pos: [32, 14, 2], look: [14, 4, -14], fov: 54 }], [c6 + 1.4, { pos: [28, 5, -22], look: [10, 2.8, -17], fov: 52 }], [info.dur, { pos: [8, 4.2, -32], look: [1, 2.8, -19], fov: 50 }]]); },
  overlay: (g, t) => { big(g, t, 'NOT ONE BURGER.', E.H * 0.13, { at: 0.2, size: 96, dur: rel(5, 6) - 0.2 }); big(g, t, '“CAN I HAVE YOUR TRASH?”', E.H * 0.13, { at: rel(5, 6) + 3.1, size: 70, color: GOLD }); } });

// E · NIGHT AFTER NIGHT (8): dragging trash bags down the lamp-lit street
S3('007', {"in": "dip", "bars": "none", "sfx": [["input/sfx/drag.wav", 0.0, -6], ["input/sfx/crickets.wav", 0.0, -16], ["input/sfx/carpass.wav", 1.6, -14]], "scene": "night under street lamps: Chris drags three bulging black trash bags along the sidewalk past closed shops; moon and stars, a passing car"}, {
  init(T) { const w = town(T, { sky: 'night', az: Math.PI / 2 + 0.6 }); const st = w.st; w.chris = A.livePerson(st, 2.8, 'chris'); w.bags = []; for (let i = 0; i < 3; i++) { const b = W.sprite(T, 'prop_trashbag_' + i, 1.7, 1.7, (g, Wd, H) => { g.save(); g.scale(Wd / 110, H / 110); PROPS.trashbag[2](g, 110, 110, i); g.restore(); }, { px: 160 }); st.add(b); w.bags.push(b); } return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { const x = -40 + t * 3.2; s.chris.update(t, { pose: walkPose(t * 6), facing: 1, expr: 'determined', prop: BAG }); s.chris.sprite.position.set(x, 0, 27); s.bags.forEach((b, i) => { b.position.set(x - 1.6 - i * 1.4, Math.abs(Math.sin(t * 6 + i)) * 0.1, 27.3 + (i % 2) * 0.4); b.material.rotation = Math.sin(t * 6 + i) * 0.08; });
    L.follow(s.stage.camera, [x, 0, 27], [1.5, 3.2, 9], [0.5, 2.8, 0], 52); },
  overlay: (g, t) => { big(g, t, 'NIGHT AFTER NIGHT', E.H * 0.13, { at: 0.2, size: 86 }); big(g, t, 'THOUSANDS OF CUPS', E.H * 0.2, { at: 1.4, size: 80, color: GOLD }); } });

// F · THE MACHINE (9–11): dorm buried in cups, codes typed in, days pass, 2 a.m. the screen turns green
S3('008', {"bars": "none", "sfx": [["input/sfx/typing.wav", 0.0, -8], ["input/sfx/typing.wav", 1.8, -10], ["input/sfx/tick.wav", 3.6, -10], ["input/sfx/error.wav", 4.6, -12], ["input/sfx/success.wav", 5.15, -2], ["input/sfx/riser.wav", 4.2, -10]], "scene": "night dorm buried in thousands of cups; Chris types codes into his own program, codes scroll red; days pass; at 2 a.m. the monitor turns bright green and he jumps up"}, {
  init(T) { const st = SKY.stage(T, 'night', { az: Math.PI / 2 }); const m = C.dorm(st, { night: true }); scatter(st, 'cup', 260, (r) => { const x = -8 + r() * 16, z = -6 + r() * 12; return Math.hypot(x - 3.4, z + 3.4) < 2.2 ? null : [x, r() * (x < -4 ? 2.4 : 1.2), z]; }, 0.75, { seed: 61 }); scatter(st, 'trashbag', 10, (r, i) => [-8 + (i % 5) * 1.4, 0, 6 - Math.floor(i / 5) * 1.6], 1.6, { seed: 62 }); const chris = A.livePerson(st, 3, 'chris'); chris.sprite.position.set(3.4, 0, -3.4); return { stage: A.finish(T, st), m, chris }; },
  draw(s, t, info, T) { const c11 = rel(8, 9), green = t > c11 + 0.5; C.paintMonitor(s.m, t, green ? 'green' : 'code', { count: Math.floor(200 + t * 820) }); s.chris.update(t, { pose: green ? breathe(POSES.cheer, t, 2) : breathe(POSES.holdFront, t, 0.6), facing: green ? 1 : -1, expr: green ? 'shocked' : t > rel(8, 9) ? 'worried' : 'determined' }); s.chris.sprite.position.y = green ? Math.abs(Math.sin((t - c11) * 8)) * 0.5 : 0;
    L.glide(s.stage.camera, t, [[0, { pos: [-4, 7, 6], look: [1, 2.5, -3], fov: 56 }], [c11 - 0.4, { pos: [1.0, 4.9, -2.4], look: [3.5, 4.6, -6.2], fov: 46 }], [c11 + 0.7, { pos: [1.4, 4.8, -3.0], look: [3.5, 4.6, -6.2], fov: 40 }], [info.dur, { pos: [6, 4, 1.4], look: [3.4, 3.4, -3.4], fov: 50 }]]); },
  overlay: (g, t) => { const c9 = rel(8, 9); big(g, t, 'EVERY. SINGLE. CODE.', E.H * 0.13, { at: 0.3, size: 80, dur: c9 - 0.3 }); big(g, t, '2 WEEKS LATER', E.H * 0.12, { at: c9 + 0.05, size: 70 }); big(g, t, 'CRACKED.', E.H * 0.19, { at: c9 + 0.4, size: 130, color: GREEN }); } });

S('010', {"in": "fade", "bars": "none", "sfx": [["input/sfx/glitch.wav", 0.0, -8], ["input/sfx/pop.wav", 1.6, -8], ["input/sfx/pop.wav", 2.4, -8], ["input/sfx/success.wav", 3.4, -10]], "scene": "tech-grid graphic: a giant cup turns, its code 0417-F23-8812 splits into parts: PRINT DATE and FACTORY # — glowing formula lines connect them"}, (g, t, info) => {
  techBg(g, t); const k = ease.outBack(clamp(t * 2)); g.save(); g.translate(E.W / 2 - 156, E.H * 0.26); g.scale(5.2 * k, 5.2 * k); g.rotate(Math.sin(t * 1.4) * 0.05); PROPS.cup[2](g, 60, 100, 1); g.restore();
  const code = ['0417', 'F23', '8812'], cols = ['#ffd47e', '#7aff8a', '#8ab8ff'], x0 = E.W * 0.5, y0 = E.H * 0.62; const ws = [250, 190, 250]; let x = x0 - 370;
  code.forEach((c, i) => { const a = clamp((t - 0.6 - i * 0.25) * 3); g.globalAlpha = a; rr(g, x, y0 - 60, ws[i], 110, 20); g.fillStyle = '#10182a'; g.fill(); g.lineWidth = 6; g.strokeStyle = i < 2 && t > 1.6 + i * 0.8 ? cols[i] : '#3a4a6a'; g.stroke(); text(g, c, x + ws[i] / 2, y0 + 18, { size: 72, color: '#ffffff', font: 'DejaVu Sans Mono', weight: 700 }); if (i < 2 && t > 1.6 + i * 0.8) { const lb = ['PRINT DATE', 'FACTORY #'][i]; text(g, lb, x + ws[i] / 2, y0 + 110, { size: 40, color: cols[i], font: 'Fredoka', weight: 700, alpha: clamp((t - 1.6 - i * 0.8) * 3) }); seg(g, [[x + ws[i] / 2, y0 + 56], [x + ws[i] / 2, y0 + 78]], 5, cols[i]); } g.globalAlpha = 1; x += ws[i] + 20; });
  big(g, t, 'A FORMULA.', E.H * 0.13, { at: 0.1, size: 120, color: GREEN }); finish(g, t); });

// H · REVEAL 2 (14): the delivery map — which boxes, which days
S('011', {"bars": "none", "sfx": [["input/sfx/truck.wav", 0.0, -10], ["input/sfx/pop.wav", 1.4, -8], ["input/sfx/pop.wav", 2.0, -8], ["input/sfx/pop.wav", 2.6, -8], ["input/sfx/kaching.wav", 3.4, -6]], "scene": "map graphic: from a factory, delivery trucks drive to restaurant pins; certain boxes light up gold with $$$ — BOX 14 · TUESDAY"}, (g, t, info) => {
  techBg(g, t, '#0a2a1a'); const fx = E.W * 0.5, fy = E.H * 0.78; const pins = [[0.18, 0.36], [0.8, 0.32], [0.3, 0.55], [0.72, 0.58], [0.5, 0.3], [0.86, 0.46]].map(([a, b]) => [a * E.W, b * E.H]);
  rr(g, fx - 80, fy - 50, 160, 100, 14); g.fillStyle = '#5a6a8a'; g.fill(); g.lineWidth = 6; g.strokeStyle = OL; g.stroke(); text(g, 'FACTORY F-23', fx, fy + 90, { size: 38, color: '#8ab8ff', font: 'Fredoka', weight: 700 });
  pins.forEach(([px, py], i) => { g.setLineDash([18, 14]); seg(g, [[fx, fy - 50], [px, py + 40]], 4, alpha('#8ab8ff', 0.6)); g.setLineDash([]); const k = clamp(t * 0.5 - i * 0.05), tx = lerp(fx, px, k), ty = lerp(fy - 50, py + 40, k); rr(g, tx - 24, ty - 14, 48, 28, 6); g.fillStyle = '#f4f0e6'; g.fill(); g.lineWidth = 4; g.strokeStyle = OL; g.stroke();
    const win = [0, 3, 5].includes(i), lit = win && t > 1.4 + [0, 3, 5].indexOf(i) * 0.6; circle(g, px, py, 34, lit ? '#f2c21a' : '#c8302a'); ring(g, px, py, 34, 6, OL); text(g, lit ? '$$$' : 'B', px, py + 12, { size: 30, color: '#1a1a22', font: 'Fredoka', weight: 700 }); if (lit) { glow(g, px, py, 120, '#ffd47e', 0.5); text(g, ['BOX 14 · TUE', '', '', 'BOX 31 · THU', '', 'BOX 52 · MON'][i], px, py - 56, { size: 34, color: GOLD, font: 'Fredoka', weight: 700 }); } });
  big(g, t, 'HE KNEW WHERE', E.H * 0.1, { at: 0.1, size: 84 }); big(g, t, 'THE WINNERS WERE', E.H * 0.16, { at: 0.4, size: 84, color: GOLD }); finish(g, t); });

// I · THE STRIKE (15): drive up, walk in, one cup — the camera follows him back out with it raised
S3('012', {"in": "dip", "bars": "none", "sfx": [["input/sfx/carpass.wav", 0.0, -8], ["input/sfx/door.wav", 1.4, -10], ["input/sfx/kaching.wav", 2.6, -4]], "scene": "sunset: Chris's car pulls into the burger lot; he walks out of the door with ONE cup raised, grinning"}, {
  init(T) { const w = town(T, { az: Math.PI / 2 - 0.3 }); const st = w.st; w.car = C.car(st, -30, 15, { i: 2, rot: 0 }); w.chris = A.livePerson(st, 2.8, 'chris'); return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { const kc = ease.out(clamp(t / 1.4)); s.car.position.set(lerp(-34, -4, kc), 0, lerp(16, 8, kc)); s.car.rotation.y = -0.3 * kc; const out = t > 1.6, k = clamp((t - 2.2) * 0.8); s.chris.sprite.visible = out; s.chris.update(t, { pose: k > 0 && k < 1 ? walkPose(t * 8) : t > 2.6 ? POSES.cheer : POSES.stand, facing: 1, expr: 'smirk', prop: CUP }); s.chris.sprite.position.set(6, 0, -2 + k * 4);
    L.glide(s.stage.camera, t, [[0, { pos: [-20, 4, 30], look: [-20, 2, 14], fov: 52 }], [1.6, { pos: [-2, 4, 22], look: [2, 3, 2], fov: 52 }], [info.dur, { pos: [8, 3, 10], look: [6, 4, 0], fov: 46 }]]); },
  overlay: (g, t) => big(g, t, 'ONE CUP.', E.H * 0.13, { at: 1.8, size: 120, color: GOLD }) });

// J · THE MONEY (16): bills rain over the street, counter hits $150,000
S3('013', {"bars": "none", "sfx": [["input/sfx/kaching.wav", 0.0, -2], ["input/sfx/coins.wav", 0.3, -6], ["input/sfx/crowd.wav", 0.4, -16]], "scene": "golden sunset: hundred-dollar bills rain over the street, Chris jumps with joy in front of the burger sign — $150,000 in two weeks"}, {
  init(T) { const w = town(T, { sky: 'golden', az: Math.PI / 2 + 0.2 }); const st = w.st; scatter(st, 'bill', 120, (r) => [-10 + r() * 30, 9 + r() * 8, -2 + r() * 22], 1.4, { seed: 71, fog: false }); w.chris = A.livePerson(st, 3, 'chris'); w.chris.sprite.position.set(6, 0, 6); return { stage: A.finish(T, st), ...w }; },
  draw(s, t, info, T) { s.chris.update(t, { pose: breathe(POSES.cheer, t, 2), facing: 1, expr: 'happy' }); s.chris.sprite.position.y = Math.abs(Math.sin(t * 6)) * 0.6; L.glide(s.stage.camera, t, [[0, { pos: [8, 3, 18], look: [6, 4, 4], fov: 52 }], [info.dur, { pos: [10, 6, 22], look: [5, 6, 0], fov: 56 }]]); },
  overlay: (g, t) => { money(g, t, 0.2, 150000, E.H * 0.15); } });

// K · TOKYO (17): plane over the sunset into Japan, Chris under cherry blossoms before Mt Fuji
S3('014', {"in": "fade", "bars": "none", "sfx": [["input/sfx/plane.wav", 0.0, -6], ["input/sfx/chime.wav", 3.0, -8], ["input/sfx/wind.wav", 2.5, -16]], "scene": "sunset over Tokyo: a jet glides past toward snowy Mt Fuji; cherry blossoms drift; Chris stands under a sakura tree with his backpack, smiling — NO RULES BROKEN"}, {
  init(T) { const st = SKY.stage(T, 'sunset', { az: Math.PI / 2, fog: [300, 640] }); C.japan(st); const pl = C.plane3D(st); const chris = A.livePerson(st, 3, 'chris'); chris.sprite.position.set(2, 0, 0); scatter(st, 'bird', 16, (r) => [-80 + r() * 160, 40 + r() * 30, -150 + r() * 100], 2.6, { fog: false }); return { stage: A.finish(T, st), pl, chris }; },
  draw(s, t, info, T) { s.pl.position.set(-120 + t * 34, 70 + t * 2, -120); s.pl.rotation.z = 0.06; s.chris.update(t, { pose: t < 3 ? breathe(POSES.pointUp, t) : breathe(POSES.wave, t), facing: -1, expr: 'happy' });
    L.glide(s.stage.camera, t, [[0, { pos: [0, 30, 60], look: [0, 60, -120], fov: 58 }], [3, { pos: [4, 8, 20], look: [0, 20, -100], fov: 56 }], [info.dur, { pos: [5, 4.4, 12], look: [1, 6, -40], fov: 52 }]]); },
  overlay: (g, t) => { big(g, t, 'NO RULES BROKEN.', E.H * 0.13, { at: 0.4, size: 96 }); big(g, t, 'TOKYO.', E.H * 0.21, { at: 3.0, size: 130, color: GOLD }); } });
