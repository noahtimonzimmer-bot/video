// 03 — the other shadow (Emma's apartment, the crack smile, blackout) + the rules (old photo, "you died") + the flashback.
import { E, V, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, poly, glow, alpha, shade, mix, text, rr, linGrad, radGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { apt, hallway, street, stairs, photo } from '../sets/sets.js';
import { S, cam, person, closeup, card, bigHand, shadow, rimOf, flicker, SHC } from '../lib.js';
import { HERO, EMMA } from '../cast.js';

const rimC = { color: '#a9b8ff', dir: [-0.8, -0.4], w: 4 };
const room = (g, t, c, o = {}) => { const L = o.L ?? flicker(t, o.seed ?? 3); const r = apt(g, t, c, { mood: 'interiorCool', kind: 'none', emmaRoom: true, lights: 0.35 + L * 0.65, window: true, winX: E.W / 2 + 260, ...o }); glow(g, E.W / 2 - 300, E.H * 0.45, 900, '#a9b8ff', 0.12 + 0.18 * L); veil(g, '#02030a', 0.3 - L * 0.25); return { ...r, L }; };
// the creature: a shadow with no owner
const CREATURE = (g, r, t, o = {}) => shadow(g, { x: o.x ?? E.W / 2 - 520, y: r.GY, s: o.s ?? 1.45, facing: o.facing ?? 1, pose: o.pose || { ...POSES.stand, head: [3 + (o.tilt ?? 0) * 30, -206 + Math.abs(o.tilt ?? 0) * 10] }, mode: 'wall', alpha: o.alpha ?? 0.97, crack: o.crack });
const PROTECT = { ...POSES.stand, eF: [40, -170], hF: [80, -168], eB: [-36, -168], hB: [-74, -166], fF: [20, 0], fB: [-24, 0] };

S('098', {"in": "dip", "amb": ["hum", -24], "sfx": [["footstep", 0.2, -12], ["footstep", 0.5, -12]], "scene": "Emma's hallway — her door hangs open, light flickering"}, (g, t, info) => {
  const L = flicker(t, 2), c = cam(t, info, { z0: 1.0, z1: 1.06, x0: -80, x1: -40 }), r = hallway(g, t, c, { lights: L, open: 1 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 640 + 300 * Math.min(t, 1.2), y: r.GY, s: 1.15, facing: 1, pose: t < 1.2 ? walkPose(t * 9, { run: true }) : POSES.stand, expr: 'scared', rim: rimC }));
  veil(g, '#000', 0.45 - L * 0.35);
});
S('099', {"amb": ["hum", -24], "sfx": [["glitch", 0.2, -14]], "scene": "close: the open door, darkness inside"}, (g, t, info) => {
  const L = flicker(t, 4), c = cam(t, info, { z0: 1.8, z1: 1.95, x0: 0, x1: 0, y0: -120, y1: -130 }); hallway(g, t, c, { lights: L, open: 1 }); veil(g, '#000', 0.45 - L * 0.35);
});
S('100', {"amb": ["hum", -22], "sfx": [["buzz", 0.0, -10]], "scene": "the lights stutter"}, (g, t, info) => {
  const L = flicker(t * 1.6, 7), c = cam(t, info, { z0: 1.2, z1: 1.26, x0: -600, x1: -620, y0: -200, y1: -200 }); hallway(g, t, c, { lights: L, open: 1 }); veil(g, '#000', 0.5 - L * 0.4);
});
S('101', {"amb": ["hum", -24], "scene": "\"Emma?\""}, (g, t, info) => closeup(g, t, info, { bg: (g) => hallway(g, t, { z: 1.6, x: 0, y: -100 }, { lights: flicker(t, 4), open: 1 }), expr: 'worried', talk: [0.05, 0.5], r: 280, rimSide: -1, rim: '#a9b8ff', x: E.W * 0.4 }));
S('102', {"amb": ["hum", -26], "scene": "no answer: the empty bedroom"}, (g, t, info) => { const c = cam(t, info, { z0: 1.0, z1: 1.04, x0: 0, x1: 30 }); room(g, t, c); });
S('103', {"amb": ["hum", -26], "sfx": [["footstep", 0.3, -14], ["footstep", 0.8, -14]], "scene": "you step into the bedroom"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.05, z1: 1.1, x0: 60, x1: 30 }), r = room(g, t, c);
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 + 560 - 150 * t, y: r.GY, s: 1.15, facing: -1, pose: walkPose(t * 5), expr: 'scared', rim: rimC }));
});
const UNDER = { ...POSES.lie, eF: [20, -150], hF: [30, -176], eB: [14, -146], hB: [24, -168] };
S('104', {"amb": ["hum", -26], "sfx": [["stinger", 0.6, -12]], "scene": "low angle: Emma curled under the bed, eyes wide"}, (g, t, info) => {
  const c = cam(t, info, { z0: 2.0, z1: 2.1, x0: -60, x1: -80, y0: 200, y1: 200 }), r = room(g, t, c, { emmaRoom: false });
  layer(g, c, 1, (g) => { drawFigure(g, { x: E.W / 2 - 120, y: r.GY + 52, s: 0.62, facing: 1, pose: UNDER, rot: -Math.PI / 2, outfit: EMMA, expr: 'scared', look: [1, 0], rim: rimC, shadow: false }); g.fillStyle = '#1a1420'; g.fillRect(E.W / 2 - 400, r.GY - 200, 640, 60); g.fillStyle = '#6a3a5a'; rr(g, E.W / 2 - 390, r.GY - 236, 620, 44, 14); g.fill(); for (const x of [E.W / 2 - 390, E.W / 2 + 220]) seg(g, [[x, r.GY - 150], [x, r.GY]], 14, '#1a1420'); g.fillStyle = 'rgba(90,50,80,.9)'; poly(g, [[E.W / 2 - 400, r.GY - 145], [E.W / 2 + 240, r.GY - 145], [E.W / 2 + 250, r.GY - 110], [E.W / 2 - 410, r.GY - 104]], '#5a3050'); });
});
S('105', {"amb": ["hum", -26], "scene": "big face: Emma shaking"}, (g, t, info) => closeup(g, t, info, { who: 'emma', bg: (g) => room(g, t, { z: 1.5, x: -100 }), expr: 'scared', r: 290, shake: 4, rimSide: 1, rim: '#a9b8ff' }));
S('106', {"amb": ["hum", -26], "scene": "you help her up"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.35, z1: 1.4, x0: -40, x1: -60, y0: 60, y1: 60 }), r = room(g, t, c); const k = ease.inOut(prog(t, 0.1, 0.9));
  layer(g, c, 1, (g) => { person(g, t, r.M, { who: 'emma', x: E.W / 2 - 120, y: r.GY, s: 1.1, facing: 1, poses: [[0, 'kneel'], [0.5, 'stand']], expr: 'scared', rim: rimC }); person(g, t, r.M, { x: E.W / 2 + 120, y: r.GY, s: 1.15, facing: -1, pose: { ...POSES.reach, hF: [62, -204 + 60 * (1 - k)] }, expr: 'worried', rim: rimC }); });
});
const twoRoom = (g, t, info, o) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.2, z1: o.z1 ?? 1.26, x0: o.x0 ?? 0, x1: o.x1 ?? -20, y0: o.y ?? 40, y1: o.y ?? 40, shake: o.shake }), r = room(g, t, c, { L: o.L });
  layer(g, c, 1, (g) => { o.wall?.(g, r); person(g, t, r.M, { who: 'emma', x: o.ex ?? E.W / 2 + 60, y: r.GY, s: 1.1, facing: o.ef ?? -1, poses: o.ep || 'stand', expr: o.ee || 'scared', talk: o.et, rim: rimC }); person(g, t, r.M, { x: o.hx ?? E.W / 2 + 260, y: r.GY, s: 1.15, facing: o.hf ?? -1, poses: o.hp || 'stand', expr: o.he || 'worried', talk: o.ht, look: o.hl, rim: rimC }); });
  return r;
};
S('107', {"amb": ["hum", -26], "scene": "\"What happened?\""}, (g, t, info) => twoRoom(g, t, info, { ef: 1, ee: 'cry', ht: [0.05, 0.7], hp: 'talk' }));
S('108', {"amb": ["hum", -26], "sfx": [["swish", 0.3, -14]], "scene": "she points at the wall"}, (g, t, info) => twoRoom(g, t, info, { ep: [[0, 'stand'], [0.3, 'point']], ee: 'scared', he: 'confused' }));
S('109', {"amb": ["hum", -24], "sfx": [["stinger", 0.1, -6]], "scene": "on the wall: a shadow, standing there"}, (g, t, info) => twoRoom(g, t, info, { z0: 0.95, z1: 1.0, x0: -160, x1: -180, ep: 'point', he: 'shocked', wall: (g, r) => CREATURE(g, r, t) }));
S('110', {"amb": ["hum", -24], "sfx": [["heartbeat", 0.1, -8]], "scene": "push in: human-shaped"}, (g, t, info) => { const c = cam(t, info, { z0: 1.5, z1: 1.8, x0: -520, x1: -520, y0: 120, y1: 80 }), r = room(g, t, c); layer(g, c, 1, (g) => CREATURE(g, r, t)); });
S('111', {"amb": ["hum", -24], "scene": "the light hits the wall — nobody is in between"}, (g, t, info) => {
  const c = cam(t, info, { z0: 0.9, z1: 0.95, x0: -40, x1: -80 }), r = room(g, t, c, { L: 0.9 });
  layer(g, c, 1, (g) => { FX.lightCone(g, E.W / 2 + 400, r.GY - 520, { angle: Math.PI * 0.86, spread: 0.45, len: 1300, color: '#cfe0ff', a: 0.16 }); CREATURE(g, r, t); person(g, t, r.M, { x: E.W / 2 + 560, y: r.GY, s: 1.0, facing: -1, poses: 'stand', expr: 'scared', rim: rimC }); person(g, t, r.M, { who: 'emma', x: E.W / 2 + 680, y: r.GY, s: 0.95, facing: -1, poses: 'stand', expr: 'scared', rim: rimC }); });
  FX.dust(g, t, { count: 60, color: '#cfe0ff', a: 0.3 });
});
S('112', {"amb": ["hum", -24], "sfx": [["whoosh", 0.2, -10]], "scene": "your own shadow slides in front of you"}, (g, t, info) => twoRoom(g, t, info, { z0: 1.0, z1: 1.04, x0: -160, x1: -160, he: 'shocked', hp: 'stand', wall: (g, r) => { CREATURE(g, r, t); const k = ease.inOut(prog(t, 0.1, 1.2)); shadow(g, { x: lerp(E.W / 2 + 380, E.W / 2 - 180, k), y: r.GY, s: 1.4, facing: -1, pose: k < 1 ? walkPose(t * 6) : PROTECT, mode: 'wall', alpha: 0.97 }); } }));
S('113', {"amb": ["hum", -24], "scene": "face-off: your shadow shields you, arms spread"}, (g, t, info) => { const c = cam(t, info, { z0: 1.45, z1: 1.5, x0: -330, x1: -350, y0: -30, y1: -30 }), r = room(g, t, c); layer(g, c, 1, (g) => { CREATURE(g, r, t); shadow(g, { x: E.W / 2 - 180, y: r.GY, s: 1.4, facing: -1, pose: PROTECT, mode: 'wall', alpha: 0.97 }); }); });
S('114', {"amb": ["hum", -24], "sfx": [["glitch", 0.3, -14]], "scene": "the other shadow tilts its head"}, (g, t, info) => { const c = cam(t, info, { z0: 2.6, z1: 2.8, x0: -512, x1: -512, y0: 20, y1: 20 }), r = room(g, t, c); layer(g, c, 1, (g) => CREATURE(g, r, t, { tilt: ease.inOut(prog(t, 0.2, 1.3)) * 0.5 })); });
S('115', {"amb": ["hum", -24], "sfx": [["stinger", 0.1, -6]], "scene": "then it SMILES"}, (g, t, info) => { const c = cam(t, info, { z0: 3.0, z1: 3.2, x0: -508, x1: -508, y0: 25, y1: 25 }), r = room(g, t, c); layer(g, c, 1, (g) => CREATURE(g, r, t, { tilt: 0.5, crack: ease.out(prog(t, 0.1, 0.9)) })); });
S('116', {"amb": ["hum", -24], "scene": "not with a mouth"}, (g, t, info) => { const c = cam(t, info, { z0: 3.6, z1: 3.8, x0: -506, x1: -506, y0: 28, y1: 28 }), r = room(g, t, c, { L: 0.5 }); layer(g, c, 1, (g) => CREATURE(g, r, t, { tilt: 0.5, crack: 1 })); });
S('117', {"bars": "scope", "sfx": [["glitch", 0.3, -10]], "scene": "extreme close: a thin white crack across its face"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.1, x0: 0, x1: 0, shake: 1 }); veil(g, '#04030a', 1);
  layer(g, c, 1, (g) => { circle(g, E.W / 2, E.H / 2, 420, SHC); g.save(); g.translate(E.W / 2, E.H / 2 + 40); g.scale(14, 14); const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([-22 + u * 44, 4 + Math.sin(u * Math.PI) * 9 + (i % 2 ? -2.5 : 2) - 6]); } g.shadowColor = '#ffffff'; g.shadowBlur = 3; seg(g, pts, 0.9 + Math.sin(t * 20) * 0.08, '#f4f2ff'); g.restore(); glow(g, E.W / 2, E.H / 2 + 60, 500, '#cfe0ff', 0.12); });
});
S('118', {"amb": ["hum", -24], "sfx": [["hit", 0.2, -10]], "scene": "your shadow grabs your arm"}, (g, t, info) => { const c = cam(t, info, { z0: 1.6, z1: 1.65, x0: 120, x1: 120, y0: 0, y1: 0, shake: 2 }), r = room(g, t, c); layer(g, c, 1, (g) => { shadow(g, { x: E.W / 2 + 90, y: r.GY, s: 1.4, facing: 1, pose: { ...POSES.reach, hF: [80, -170] }, mode: 'wall', alpha: 0.97 }); person(g, t, r.M, { x: E.W / 2 + 260, y: r.GY, s: 1.15, facing: -1, poses: [[0, 'stand'], [0.25, { ...POSES.reach, hB: [-40, -150] }]], expr: 'surprised', rim: rimC }); }); });
S('119', {"amb": ["hum", -24], "sfx": [["whoosh", 0.1, -10]], "scene": "it drags you both toward the door"}, (g, t, info) => {
  const sp = 380, c = cam(t, info, { z0: 1.1, z1: 1.1, x0: 0, x1: sp * info.dur * 0.6 }), r = room(g, t, c);
  layer(g, c, 1, (g) => { const x = E.W / 2 - 100 + sp * t; shadow(g, { x: x + 160, y: r.GY, s: 1.4, facing: 1, pose: walkPose(t * 9, { run: true }), mode: 'wall', alpha: 0.95 }); person(g, t, r.M, { x, y: r.GY, s: 1.15, facing: 1, pose: walkPose(t * 9, { run: true }), expr: 'scared', rim: rimC }); person(g, t, r.M, { who: 'emma', x: x - 150, y: r.GY, s: 1.1, facing: 1, pose: walkPose(t * 9 + 1.5, { run: true }), expr: 'scared', rim: rimC }); CREATURE(g, r, t, { crack: 1, tilt: 0.5 }); });
});
S('120', {"amb": ["hum", -24], "sfx": [["footstep", 0.1, -10], ["footstep", 0.35, -10]], "scene": "you run down the hallway"}, (g, t, info) => {
  const L = flicker(t, 9), sp = 520, c = cam(t, info, { z0: 1.0, z1: 1.0, x0: 0, x1: sp * info.dur, shake: 3 }), r = hallway(g, t, c, { lights: L, door: false });
  layer(g, c, 1, (g) => { const x = E.W / 2 + sp * t; person(g, t, r.M, { x, y: r.GY, s: 1.1, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: rimC }); person(g, t, r.M, { who: 'emma', x: x - 170, y: r.GY, s: 1.05, facing: 1, pose: walkPose(t * 10 + 1.4, { run: true }), expr: 'scared', rim: rimC }); });
  veil(g, '#000', 0.4 - L * 0.3);
});
const CRAWL = { head: [40, -120], sh: [10, -110], hip: [-60, -100], eF: [40, -60], hF: [70, 0], eB: [0, -50], hB: [20, 0], kF: [-40, -40], fF: [-10, 0], kB: [-90, -50], fB: [-110, 0] };
S('121', {"amb": ["hum", -22], "sfx": [["glitch", 0.2, -8], ["stinger", 0.6, -8]], "scene": "behind you it scuttles across the CEILING"}, (g, t, info) => {
  const L = flicker(t, 11), c = cam(t, info, { z0: 1.0, z1: 1.05, x0: 0, x1: 40, y0: -40, y1: -40 }), r = hallway(g, t, c, { lights: L, door: false });
  layer(g, c, 1, (g) => {
    g.fillStyle = '#0e1020'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 0.55 + 40);
    const x = -300 + 900 * t; g.save(); g.translate(x, E.H * 0.16); g.scale(1, -1); shadow(g, { x: 0, y: 0, s: 1.3, facing: 1, pose: { ...CRAWL, hF: [70 + Math.sin(t * 14) * 20, 0], hB: [20 - Math.sin(t * 14) * 20, 0] }, mode: 'wall', alpha: 0.98, crack: 1 }); g.restore();
    person(g, t, r.M, { x: E.W / 2 + 500 + 200 * t, y: r.GY, s: 1.05, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: rimC });
  });
  veil(g, '#000', 0.4 - L * 0.3);
});
S('122', {"amb": ["hum", -24], "sfx": [["footstep", 0.1, -10], ["footstep", 0.3, -10], ["footstep", 0.5, -10]], "scene": "the stairwell — you fly down the steps"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.0, x0: 0, x1: 0, y0: -200, y1: 100 }), r = stairs(g, t, c, { lights: 1 });
  layer(g, c, 1, (g) => { const u = prog(t, 0, info.dur); const x = lerp(E.W / 2 - 400, E.W / 2 + 300, u), y = lerp(r.GY - 300, r.GY + 30, u); shadow(g, { x: x - 160, y, s: 1.3, facing: 1, pose: walkPose(t * 10, { run: true }), mode: 'wall', alpha: 0.8 }); person(g, t, r.M, { x, y, s: 1.05, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: rimC, contact: false }); person(g, t, r.M, { who: 'emma', x: x - 130, y: y - 45, s: 1.0, facing: 1, pose: walkPose(t * 10 + 1.4, { run: true }), expr: 'scared', rim: rimC, contact: false }); });
});
S('123', {"amb": ["hum", -24], "sfx": [["impact", 0.55, -6, 0.6]], "scene": "every light in the building dies"}, (g, t, info) => {
  const L = t < 0.55 ? flicker(t * 2, 5) : 0, c = cam(t, info, { z0: 1.1, z1: 1.14, x0: 0, x1: 0, y0: 0, y1: 0, shake: t > 0.55 ? 2 : 0 }), r = stairs(g, t, c, { lights: L });
  layer(g, c, 1, (g) => { if (L > 0) shadow(g, { x: E.W / 2 - 180, y: r.GY, s: 1.3, facing: 1, pose: POSES.stand, mode: 'wall', alpha: 0.85 * L }); person(g, t, r.M, { x: E.W / 2, y: r.GY, s: 1.1, facing: 1, poses: 'handsOnHead', expr: 'scared', rim: { ...rimC, color: mix('#1a6a3a', '#a9b8ff', L) } }); person(g, t, r.M, { who: 'emma', x: E.W / 2 + 150, y: r.GY, s: 1.05, facing: -1, poses: 'stand', expr: 'scared', rim: { ...rimC, color: mix('#1a6a3a', '#a9b8ff', L) } }); });
  if (L === 0) veil(g, '#000', 0.55);
});
S('124', {"amb": ["hum", -26], "scene": "in the dark: the crack-smile fades away"}, (g, t, info) => { veil(g, '#020205', 1); const a = 1 - ease.inOut(prog(t, 0.2, 1.1)); g.save(); g.globalAlpha = a; g.translate(E.W / 2, E.H / 2); g.scale(7, 7); const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([-22 + u * 44, Math.sin(u * Math.PI) * 9 + (i % 2 ? -2.5 : 2)]); } g.shadowColor = '#fff'; g.shadowBlur = 4; seg(g, pts, 1.1, '#f4f2ff'); g.restore(); });
S('125', {"amb": ["hum", -26], "sfx": [["shimmer", 0.2, -14, 0.6]], "scene": "only the green EXIT glow — and you cast nothing"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.6, z1: 1.65, x0: 300, x1: 300, y0: -60, y1: -60 }), r = stairs(g, t, c, { lights: 0 });
  layer(g, c, 1, (g) => { shadow(g, { x: E.W / 2 + 420, y: r.GY, s: 1.3, facing: -1, pose: POSES.stand, mode: 'wall', alpha: 0.8 * (1 - ease.inOut(prog(t, 0.1, 1.0))) }); person(g, t, r.M, { x: E.W / 2 + 560, y: r.GY, s: 1.1, facing: -1, poses: 'stand', expr: 'scared', look: [-1, 0], rim: { color: '#3fe07a', dir: [0.6, -0.8], w: 4 } }); });
  veil(g, '#000', 0.3);
});
S('126', {"amb": ["hum", -26], "scene": "you, alone in the dark"}, (g, t, info) => closeup(g, t, info, { bg: (g) => veil(g, '#020205', 1), expr: 'sad', r: 270, rim: '#3fe07a', rimSide: 1, look: [-0.4, 0.4] }));
S('127', {"bars": "scope", "sfx": [["ding", 0.2, -14, 0.5]], "scene": "big face: you realise you NEED it"}, (g, t, info) => closeup(g, t, info, { bg: (g) => { veil(g, '#020205', 1); glow(g, E.W * 0.8, E.H * 0.3, 400, '#3fe07a', 0.15); }, expr: [[0, 'sad'], [0.8, 'awe']], r: 320, rim: '#3fe07a', rimSide: 1, grow: 0.08 }));

// ---------- THE RULES: under the streetlights ----------
const LAMP = E.W / 2 - 300;
const lampStreet = (g, t, info, o = {}) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.35, z1: o.z1 ?? 1.4, x0: o.x0 ?? -40, x1: o.x1 ?? -60, y0: o.y ?? 90, y1: o.y ?? 90, shake: o.shake }), r = street(g, t, c, { night: true, lamps: [LAMP, E.W / 2 + 900], trees: [E.W / 2 - 1200] });
  layer(g, c, 1, (g) => {
    o.wall?.(g, r);
    if (o.emma !== false) person(g, t, r.M, { who: 'emma', x: o.ex ?? E.W / 2 + 230, y: r.GY - 30, s: 1.05, facing: o.ef ?? -1, poses: o.ep || 'stand', expr: o.ee || 'worried', talk: o.et, prop: o.eprop, rim: { color: r.M.practical, dir: [-1, -0.5], w: 4 }, sh: o.esh });
    if (o.hero !== false) person(g, t, r.M, { x: o.hx ?? E.W / 2 - 20, y: r.GY - 30, s: 1.05, facing: o.hf ?? 1, poses: o.hp || 'stand', expr: o.he || 'worried', talk: o.ht, look: o.hl, rim: { color: r.M.practical, dir: [-1, -0.5], w: 4 } });
    o.front?.(g, r);
  });
  return r;
};
// the hero's shadow on the facade behind (lamp is to the left, so it falls to the right)
const myShadow = (g, r, pose, o = {}) => shadow(g, { x: o.x ?? E.W / 2 + 150, y: r.GY - 58, s: o.s ?? 1.3, facing: o.facing ?? -1, pose, mode: 'wall', alpha: o.alpha ?? 0.92, skew: 0.12 });
const TIRED = { ...POSES.sad, head: [16, -184] };
S('128', {"in": "dip", "amb": ["wind", -20], "sfx": [["footstep", 0.2, -12], ["footstep", 0.5, -12]], "scene": "you and Emma burst out into the night street"}, (g, t, info) => {
  const sp = 420, c = cam(t, info, { z0: 1.0, z1: 1.0, x0: -200, x1: -200 + sp * info.dur * 0.7 }), r = street(g, t, c, { night: true, lamps: [LAMP, E.W / 2 + 900] });
  layer(g, c, 1, (g) => { const x = E.W / 2 - 700 + sp * t; person(g, t, r.M, { x, y: r.GY - 30, s: 1.05, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: { color: r.M.practical, dir: [0, -1], w: 4 } }); person(g, t, r.M, { who: 'emma', x: x - 150, y: r.GY - 30, s: 1.0, facing: 1, pose: walkPose(t * 10 + 1.3, { run: true }), expr: 'scared', rim: { color: r.M.practical, dir: [0, -1], w: 4 } }); });
});
S('129', {"amb": ["wind", -20], "sfx": [["shimmer", 0.3, -10]], "scene": "under the lamp, your shadow flickers back onto the wall"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.15, z1: 1.2, he: [[0, 'scared'], [0.9, 'surprised']], hl: [1, 0], wall: (g, r) => myShadow(g, r, POSES.stand, { alpha: 0.92 * ease.out(prog(t, 0.3, 1.3)) * (t < 1.3 ? (Math.sin(t * 40) > 0 ? 1 : 0.4) : 1), facing: 1 }) }));
S('130', {"amb": ["wind", -20], "scene": "it looks exhausted"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.8, z1: 1.85, x0: 190, x1: 180, y: 0, emma: false, hero: false, wall: (g, r) => myShadow(g, r, breathe(TIRED, t, 2)) }));
S('131', {"amb": ["wind", -20], "scene": "almost smaller"}, (g, t, info) => lampStreet(g, t, info, { he: 'sad', hl: [1, 0], wall: (g, r) => myShadow(g, r, breathe(TIRED, t, 2), { s: lerp(1.3, 1.0, ease.inOut(prog(t, 0, 1))) }) }));
S('132', {"amb": ["wind", -20], "scene": "you ask it what that thing was"}, (g, t, info) => lampStreet(g, t, info, { hf: 1, hp: 'talk', ht: [0.1, 1.3], he: 'worried', wall: (g, r) => myShadow(g, r, breathe(TIRED, t), { s: 1.0, x: E.W / 2 + 220 }) }));
const PT_DOWN = { ...POSES.point, eF: [30, -140], hF: [52, -100] };
S('133', {"amb": ["wind", -20], "scene": "it points at the ground…"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.6, z1: 1.65, x0: 120, x1: 110, y: 40, he: 'confused', wall: (g, r) => myShadow(g, r, posesAt(t, [[0, TIRED], [0.3, PT_DOWN]]), { s: 1.0, x: E.W / 2 + 220 }) }));
S('134', {"amb": ["wind", -20], "scene": "…then at Emma…"}, (g, t, info) => lampStreet(g, t, info, { he: 'confused', ee: 'scared', wall: (g, r) => myShadow(g, r, POSES.point, { s: 1.0, x: E.W / 2 + 40, facing: 1 }) }));
S('135', {"amb": ["wind", -20], "scene": "…then at you"}, (g, t, info) => lampStreet(g, t, info, { he: 'surprised', wall: (g, r) => myShadow(g, r, POSES.point, { s: 1.0, x: E.W / 2 + 220, facing: -1 }) }));
S('136', {"amb": ["wind", -20], "scene": "you don't understand"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.6, z1: 1.62, x0: -60, x1: -70, y: 40, hp: 'shrug', he: 'confused', wall: (g, r) => myShadow(g, r, breathe(TIRED, t), { s: 1.0, x: E.W / 2 + 220 }) }));
S('137', {"amb": ["wind", -20], "sfx": [["blip", 0.4, -14]], "scene": "Emma takes out her phone"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.6, z1: 1.65, x0: 180, x1: 170, y: 40, ep: [[0, 'stand'], [0.3, 'phone']], eprop: t > 0.3 ? 'phone' : null, ee: 'thinking', he: 'confused' }));
// the old photograph on Emma's phone
function oldPhoto(g, t, k = {}) {
  const W = 980, H = 620; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(k.s ?? 1, k.s ?? 1); g.translate(-(k.fx ?? 0), -(k.fy ?? 0));
  g.fillStyle = '#f2ece0'; g.fillRect(-W / 2 - 18, -H / 2 - 18, W + 36, H + 36);
  g.fillStyle = linGrad(g, 0, -H / 2, 0, H / 2, ['#f7d9a8', '#f2b585', '#c98a74']); g.fillRect(-W / 2, -H / 2, W, H);
  FX.sun(g, W * 0.3, -H * 0.15, 40, '#fff6e0', '#ffd59a', 4); g.fillStyle = '#8a6a5a'; g.fillRect(-W / 2, H * 0.22, W, H * 0.28);
  // you (facing away) + Emma, white figures
  drawFigure(g, { x: -90, y: H * 0.32, s: 1.4, facing: -1, pose: POSES.relaxed, outfit: HERO, expr: 'neutral', rim: false, noFace: true, shadow: true });
  drawFigure(g, { x: 110, y: H * 0.32, s: 1.35, facing: -1, pose: POSES.stand, outfit: EMMA, expr: 'happy', rim: false, shadow: true });
  // your shadow on the ground, standing up, facing the camera, holding a key
  shadow(g, { x: -320, y: H * 0.36, s: 1.25, facing: 1, pose: { ...POSES.stand, eF: [22, -150], hF: [34, -130] }, mode: 'wall', alpha: 0.92 });
  g.save(); g.translate(-320 + 34 * 1.25, H * 0.36 - 130 * 1.25); ring(g, 0, 0, 9, 4, SHC); seg(g, [[8, 4], [34, 16]], 5, SHC); seg(g, [[26, 12], [24, 22]], 4, SHC); if (k.keyGlint) { ring(g, 0, 0, 9, 1.4, alpha('#ffffff', k.keyGlint)); FX.sparkle(g, 4, -4, 18, '#ffffff', k.keyGlint); } g.restore();
  text(g, '5 YEARS AGO', W / 2 - 30, -H / 2 + 40, { size: 30, color: '#ff8a3a', font: 'Nunito', weight: 900, align: 'right', alpha: 0.85 });
  g.restore();
}
const photoShot = (g, t, info, o = {}) => { veil(g, '#05060c', 1); glow(g, E.W / 2, E.H / 2, 900, '#7fb8ff', 0.12); const k = { s: lerp(o.s0 ?? 0.95, o.s1 ?? 1.0, ease.inOut(t / info.dur)), fx: o.fx ?? 0, fy: o.fy ?? 0, keyGlint: o.glint }; oldPhoto(g, t, k); o.over?.(g); };
S('138', {"sfx": [["blip", 0.2, -14]], "scene": "she opens an old photograph"}, (g, t, info) => photoShot(g, t, info, { s0: 0.6, s1: 0.75 }));
S('139', {"scene": "you, five years ago"}, (g, t, info) => photoShot(g, t, info, { s0: 0.78, s1: 0.85 }));
S('140', {"scene": "standing beside her… smiling"}, (g, t, info) => photoShot(g, t, info, { s0: 1.25, s1: 1.35, fx: 20, fy: 40 }));
S('142', {"sfx": [["riser", 0.0, -10]], "scene": "but something is wrong"}, (g, t, info) => photoShot(g, t, info, { s0: 0.85, s1: 0.95 }));
S('143', {"sfx": [["stinger", 0.1, -8]], "scene": "your shadow faces the camera — you face away"}, (g, t, info) => photoShot(g, t, info, { s0: 1.0, s1: 1.05, over: (g) => { const a = ease.out(prog(t, 0.2, 0.6)); g.save(); g.globalAlpha = a; ring(g, E.W / 2 - 320, E.H / 2 + 50, 150, 5, '#ff4a4a'); ring(g, E.W / 2 - 90, E.H / 2 + 60, 130, 5, '#ffd47e'); g.restore(); text(g, 'FACING YOU', E.W / 2 - 320, E.H / 2 - 120, { size: 34, color: '#ff6a5a', font: 'Nunito', weight: 900, alpha: a }); text(g, 'FACING AWAY', E.W / 2 - 90, E.H / 2 - 100, { size: 30, color: '#ffd47e', font: 'Nunito', weight: 900, alpha: ease.out(prog(t, 1.0, 1.4)) }); } }));
S('145', {"sfx": [["whoosh", 0.0, -10]], "scene": "you zoom in"}, (g, t, info) => photoShot(g, t, info, { s0: 1.0, s1: 2.6, fx: -300, fy: 20 }));
S('146', {"sfx": [["shimmer", 0.6, -12]], "scene": "its hand holds something: a small black key"}, (g, t, info) => photoShot(g, t, info, { s0: 4.0, s1: 4.6, fx: -278, fy: 120, glint: ease.out(prog(t, 1.3, 1.7)) }));
const emmaClose = (g, t, info, o) => closeup(g, t, info, { who: 'emma', bg: (g) => street(g, t, { z: 1.5, x: 300, y: 0 }, { night: true, lamps: [LAMP] }), r: 290, rim: '#ffb860', rimSide: -1, ...o });
const heroClose = (g, t, info, o) => closeup(g, t, info, { bg: (g) => street(g, t, { z: 1.5, x: -300, y: 0 }, { night: true, lamps: [LAMP] }), r: 290, rim: '#ffb860', rimSide: -1, ...o });
S('148', {"amb": ["wind", -24], "scene": "Emma whispers"}, (g, t, info) => emmaClose(g, t, info, { expr: 'sad', look: [0.3, 0.5] }));
S('149', {"amb": ["wind", -24], "scene": "\"I remember that day.\""}, (g, t, info) => emmaClose(g, t, info, { expr: 'sad', talk: [0.05, 0.95], look: [0.3, 0.2] }));
S('150', {"amb": ["wind", -24], "scene": "you look at her"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.5, z1: 1.55, x0: 60, x1: 50, y: 40, hp: 'stand', he: 'worried', ee: 'sad', ep: 'phone', eprop: 'phone' }));
S('151', {"amb": ["wind", -24], "scene": "\"What happened?\""}, (g, t, info) => heroClose(g, t, info, { expr: 'worried', talk: [0.05, 0.7], look: [0.6, 0] }));
S('152', {"amb": ["wind", -24], "sfx": [["heartbeat", 0.1, -12]], "scene": "she swallows"}, (g, t, info) => emmaClose(g, t, info, { expr: 'nervous', look: [0, 0.6], r: 310 }));
S('153', {"amb": ["wind", -24], "scene": "\"You were in an accident.\""}, (g, t, info) => emmaClose(g, t, info, { expr: 'sad', talk: [0.05, 1.0] }));
S('154', {"amb": ["wind", -24], "scene": "you laugh nervously"}, (g, t, info) => heroClose(g, t, info, { expr: 'nervous', shake: 2 }));
S('155', {"amb": ["wind", -24], "scene": "\"What accident?\""}, (g, t, info) => heroClose(g, t, info, { expr: 'confused', talk: [0.05, 0.75], r: 300 }));
S('156', {"amb": ["wind", -24], "scene": "her eyes fill with tears"}, (g, t, info) => emmaClose(g, t, info, { expr: 'cry', r: 320, grow: 0.08 }));
S('157', {"bars": "scope", "amb": ["wind", -24], "sfx": [["stinger", 0.35, -4]], "scene": "\"You died.\""}, (g, t, info) => emmaClose(g, t, info, { expr: 'cry', talk: [0.05, 0.6], r: 350, grow: 0.1 }));

// ---------- FLASHBACK: five years ago ----------
const BEDSIT = { head: [6, -108], sh: [2, -74], hip: [0, 0], eF: [16, -38], hF: [36, -10], eB: [10, -38], hB: [28, -10], kF: [48, -6], fF: [98, 0], kB: [44, -4], fB: [94, 0] };
const sepia = (g, a = 0.35) => { veil(g, '#7a4a20', a, 'color'); veil(g, '#f2c890', 0.1, 'overlay'); };
S('158', {"in": "flash", "amb": ["city", -26], "sfx": [["carpass", 0.0, -6], ["impact", 1.1, -4]], "scene": "flashback: a car — headlights — impact"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.05, z1: 1.1, x0: 0, x1: 0, shake: t > 1.1 ? 14 * (1 - prog(t, 1.1, 1.8)) : 0 }), r = street(g, t, c, { mood: 'golden' });
  layer(g, c, 1, (g) => {
    const hit = t > 1.1; person(g, t, r.M, { x: E.W / 2 + (hit ? 140 * ease.out(prog(t, 1.1, 1.6)) : 0), y: r.GY + 60, s: 1.1, facing: -1, pose: hit ? POSES.fall : POSES.stand, rot: hit ? 1.2 * ease.out(prog(t, 1.1, 1.6)) : 0, expr: hit ? 'shocked' : 'neutral', contact: !hit });
    const cx = lerp(-900, E.W / 2 - 260, ease.in(prog(t, 0, 1.1))); rr(g, cx - 330, r.GY - 30, 360, 110, 30); g.fillStyle = '#1a1622'; g.fill(); rr(g, cx - 260, r.GY - 100, 200, 90, 30); g.fill(); circle(g, cx - 260, r.GY + 80, 36, '#05040a'); circle(g, cx - 40, r.GY + 80, 36, '#05040a'); glow(g, cx + 30, r.GY + 20, 260, '#fff6dc', 0.8); FX.lightCone(g, cx + 30, r.GY + 20, { angle: 0, spread: 0.4, len: 900, color: '#fff6dc', a: 0.25 });
  });
  sepia(g); if (t > 1.1 && t < 1.25) veil(g, '#ffffff', 1 - prog(t, 1.1, 1.25));
});
const ecg = (g, x, y, w, h, t, flat, o = {}) => { FX.screen(g, { x, y, w, h, glowC: flat ? '#ff4a4a' : '#5fd39a', a: 0.25 }, (g, X, Y, W, H) => { g.strokeStyle = flat ? '#ff6a5a' : '#5fd39a'; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 200; i++) { const u = i / 200, xx = X + u * W, ph = (u * 3 + t * 0.8) % 1; const beat = flat ? 0 : (ph > 0.45 && ph < 0.5 ? -H * 0.35 : ph > 0.5 && ph < 0.53 ? H * 0.2 : 0); i ? g.lineTo(xx, Y + H / 2 + beat) : g.moveTo(xx, Y + H / 2 + beat); } g.stroke(); if (o.label) text(g, o.label, X + W - 20, Y + 40, { size: 34, color: flat ? '#ff6a5a' : '#5fd39a', font: 'Nunito', weight: 900, align: 'right' }); }); };
S('159', {"bars": "scope", "sfx": [["hum", 0.0, -6, 1.6]], "scene": "the heart monitor flatlines — 0:00 counting to 4:00"}, (g, t, info) => {
  veil(g, '#05060c', 1); const c = cam(t, info, { z0: 1, z1: 1.06, x0: 0, x1: 0 }); const s = Math.min(240, Math.floor(t / info.dur * 240));
  layer(g, c, 1, (g) => ecg(g, E.W / 2 - 600, E.H / 2 - 200, 1200, 400, t, true, { label: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }));
});
const hospital = (g, t, c, o = {}) => { const r = apt(g, t, c, { mood: 'interiorCool', kind: 'none', window: false, lights: 0.8 }); layer(g, c, 0.9, (g) => { glow(g, E.W / 2, 0, 900, '#cfe0ff', 0.25); FX.bed(g, { x: E.W / 2 - 300, y: r.GY, w: 600, color: '#cfd6e8', frame: '#3a3e52', pillow: '#ffffff' }); ecg(g, E.W / 2 + 420, r.GY - 520, 260, 160, t, o.flat); seg(g, [[E.W / 2 + 550, r.GY - 350], [E.W / 2 + 550, r.GY]], 8, '#3a3e52'); }); return r; };
S('160', {"amb": ["hum", -22], "sfx": [["flash", 0.3, -6], ["heartbeat", 0.8, -6]], "scene": "flashback hospital: the doctors shock you back"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.1, z1: 1.15, x0: 0, x1: 0 }), r = hospital(g, t, c, { flat: t < 0.6 });
  layer(g, c, 1, (g) => { drawFigure(g, { x: E.W / 2 - 160, y: r.GY + 6, s: 1.0, facing: 1, pose: POSES.lie, rot: -Math.PI / 2, outfit: { top: 'none' }, expr: t < 0.6 ? 'sleepy' : 'surprised', rim: rimC, shadow: false }); for (const [x, f] of [[E.W / 2 - 480, 1], [E.W / 2 + 260, -1]]) person(g, t, r.M, { who: { top: 'labcoat', face: 'glasses' }, x, y: r.GY, s: 1.15, facing: f, poses: 'holdFront', expr: 'determined', rim: rimC }); });
  sepia(g, 0.25); if (t > 0.3 && t < 0.45) veil(g, '#ffffff', 0.8);
});
S('161', {"amb": ["wind", -22], "scene": "back on the street: Emma tells you what she never said"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.3, z1: 1.36, ee: 'sad', et: [0.2, 2.2], ep: 'talk', he: 'worried' }));
S('162', {"amb": ["hum", -22], "scene": "flashback: you wake, sit bolt upright, mumbling"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.4, z1: 1.5, x0: -60, x1: -80, y0: 60, y1: 60 }), r = hospital(g, t, c);
  layer(g, c, 1, (g) => drawFigure(g, { x: E.W / 2 - 160, y: r.GY - 96, s: 1.05, facing: 1, pose: breathe(BEDSIT, t), outfit: { top: 'none' }, expr: 'scared', talk: (t > 0.5 ? 0.5 + 0.5 * Math.sin(t * 14) : 0), rim: rimC, shadow: false }));
  sepia(g, 0.25);
});
S('163', {"bars": "scope", "amb": ["hum", -22], "sfx": [["stinger", 0.3, -6]], "scene": "\"Something followed me back.\" — a dark shape on the wall behind the bed"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.6, z1: 1.75, x0: -100, x1: -120, y0: -20, y1: -30 }), r = hospital(g, t, c);
  layer(g, c, 1, (g) => { shadow(g, { x: E.W / 2 - 420, y: r.GY, s: 1.5, facing: 1, pose: { ...POSES.stand, head: [12, -200] }, mode: 'wall', alpha: 0.9 * ease.out(prog(t, 0.6, 1.3)), crack: ease.out(prog(t, 1.0, 1.4)) }); drawFigure(g, { x: E.W / 2 - 160, y: r.GY - 96, s: 1.05, facing: 1, pose: BEDSIT, outfit: { top: 'none' }, expr: 'scared', talk: talkish(t, 0, 1.2), rim: rimC, shadow: false }); });
  sepia(g, 0.25);
});
const talkish = (t, a, b) => (t < a || t > b ? 0 : 0.4 + 0.5 * Math.abs(Math.sin(t * 14)));
S('164', {"in": "dip", "amb": ["wind", -24], "scene": "big face: you don't remember any of it"}, (g, t, info) => heroClose(g, t, info, { expr: 'confused', look: [-0.4, 0.4] }));
const wallTalk = (g, t, info, pose, o = {}) => lampStreet(g, t, info, { z0: o.z0 ?? 1.25, z1: o.z1 ?? 1.3, x0: o.x0 ?? 60, x1: o.x1 ?? 40, he: o.he || 'worried', hf: 1, ht: o.ht, hp: o.hp, ee: o.ee || 'scared', ex: E.W / 2 - 220, ef: 1, wall: (g, r) => myShadow(g, r, pose, { s: 1.15, x: E.W / 2 + 280, facing: -1, ...(o.sh || {}) }) });
S('165', {"amb": ["wind", -22], "sfx": [["glitch", 0.2, -12]], "scene": "your shadow suddenly starts moving"}, (g, t, info) => wallTalk(g, t, info, posesAt(t, [[0, TIRED], [0.3, POSES.stand], [0.8, POSES.explain]], 0.4), { he: 'surprised' }));
const PT_CHEST = { ...POSES.point, eF: [36, -170], hF: [70, -160] };
S('166', {"amb": ["wind", -22], "scene": "it points at your chest"}, (g, t, info) => wallTalk(g, t, info, PT_CHEST, { z0: 1.5, z1: 1.55, x0: 140, x1: 130 }));
S('167', {"amb": ["wind", -22], "scene": "then at the ground"}, (g, t, info) => wallTalk(g, t, info, PT_DOWN));
S('168', {"amb": ["wind", -22], "sfx": [["heartbeat", 0.3, -10]], "scene": "then it lies down, perfectly still"}, (g, t, info) => {
  const k = ease.inOut(prog(t, 0.1, 1.0));
  lampStreet(g, t, info, { z0: 1.4, z1: 1.5, x0: 160, x1: 170, he: 'scared', hf: 1, ex: E.W / 2 - 220, ef: 1, wall: (g, r) => { if (k < 1) myShadow(g, r, posesAt(k * 2, [[0, POSES.stand], [0.5, POSES.kneel]], 0.6), { s: 1.15, x: E.W / 2 + 280 }); else shadow(g, { x: E.W / 2 + 300, y: r.GY - 70, s: 1.15, facing: -1, pose: POSES.lie, rot: -Math.PI / 2, mode: 'wall', alpha: 0.92 }); } });
});
S('169', {"amb": ["wind", -24], "sfx": [["ding", 0.2, -14, 0.6]], "scene": "big face: you understand"}, (g, t, info) => heroClose(g, t, info, { expr: [[0, 'worried'], [0.5, 'awe']], r: 310, grow: 0.08 }));
S('170', {"amb": ["wind", -24], "sfx": [["heartbeat", 0.1, -10], ["heartbeat", 1.1, -10]], "scene": "it isn't predicting your death — the still shadow, and a flash of the flatline"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.9, z1: 2.1, x0: 300, x1: 300, y0: 40, y1: 40 }), r = street(g, t, c, { night: true, lamps: [LAMP, E.W / 2 + 900] });
  layer(g, c, 1, (g) => shadow(g, { x: E.W / 2 + 300, y: r.GY - 70, s: 1.15, facing: -1, pose: POSES.lie, rot: -Math.PI / 2, mode: 'wall', alpha: 0.92 }));
  if (t > info.dur * 0.55 && t < info.dur * 0.62) { veil(g, '#05060c', 1); ecg(g, E.W / 2 - 500, E.H / 2 - 150, 1000, 300, t, true); }
});
S('172', {"amb": ["wind", -22], "scene": "\"Are you the thing that followed me?\""}, (g, t, info) => wallTalk(g, t, info, breathe(POSES.stand, t), { hp: 'talk', ht: [1.1, 3.0], he: 'worried' }));
const SHAKE_HEAD = (t) => ({ ...POSES.stand, head: [3 + Math.sin(t * 9) * 12 * (t < 1.2 ? 1 : 0), -208] });
S('174', {"amb": ["wind", -22], "scene": "it shakes its head"}, (g, t, info) => wallTalk(g, t, info, SHAKE_HEAD(t), { z0: 1.7, z1: 1.72, x0: 200, x1: 200, he: 'confused' }));
S('175', {"amb": ["wind", -22], "sfx": [["stinger", 0.3, -10]], "scene": "then points behind Emma"}, (g, t, info) => wallTalk(g, t, info, POSES.point, { sh: { facing: -1, x: E.W / 2 + 120 }, he: 'confused' }));
S('176', {"amb": ["wind", -22], "sfx": [["swish", 0.1, -12]], "scene": "you turn"}, (g, t, info) => lampStreet(g, t, info, { z0: 1.3, z1: 1.3, he: 'scared', hf: t > 0.3 ? -1 : 1, ex: E.W / 2 - 300, ef: 1, ee: 'worried' }));
// Emma with TWO shadows on the wall
const emma2 = (g, t, info, o = {}) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.4, z1: o.z1 ?? 1.48, x0: o.x0 ?? -260, x1: o.x1 ?? -270, y0: 60, y1: 60 }), r = street(g, t, c, { night: true, lamps: [LAMP, E.W / 2 + 900] });
  layer(g, c, 1, (g) => {
    const ex = E.W / 2 - 520, ep = o.ep ? posesAt(t, o.ep) : breathe(POSES.stand, t);
    shadow(g, { x: ex + 160, y: r.GY - 58, s: 1.2, facing: -1, pose: ep, outfit: EMMA, mode: 'wall', alpha: 0.9, skew: 0.12 });
    shadow(g, { x: ex + 330 + (o.dx ?? 0), y: r.GY - 58, s: 1.2, facing: -1, pose: o.p2 ? o.p2(t) : { ...POSES.stand, head: [8, -204] }, outfit: EMMA, mode: o.floor ? 'floor' : 'wall', kx: o.kx, ky: o.ky, alpha: 0.97, skew: 0.12, crack: o.crack });
    person(g, t, r.M, { who: 'emma', x: ex, y: r.GY - 30, s: 1.05, facing: 1, pose: ep, expr: o.ee || 'worried', rim: { color: r.M.practical, dir: [-1, -0.5], w: 4 } });
    o.extra?.(g, r);
  });
};
S('177', {"amb": ["wind", -22], "sfx": [["stinger", 0.5, -6]], "scene": "under the streetlight Emma has TWO shadows"}, (g, t, info) => emma2(g, t, info, { z0: 1.15, z1: 1.3, x0: -200, x1: -230, ee: 'confused' }));
const ARMUP = { ...POSES.stand, eF: [22, -150], hF: [40, -172] };
S('178', {"amb": ["wind", -22], "scene": "one moves with her…"}, (g, t, info) => emma2(g, t, info, { ep: [[0, POSES.stand], [0.3, ARMUP]] }));
S('179', {"amb": ["wind", -22], "sfx": [["heartbeat", 0.2, -8]], "scene": "…the other doesn't"}, (g, t, info) => emma2(g, t, info, { z0: 1.7, z1: 1.8, x0: -150, x1: -150, ep: [[0, ARMUP], [0.4, POSES.stand], [0.8, ARMUP]] }));
const RISE = (t) => posesAt(t, [[0, POSES.crouch], [0.6, POSES.kneel], [1.3, { ...POSES.stand, head: [14, -200], eF: [16, -130], hF: [30, -96] }]], 0.6);
S('180', {"amb": ["wind", -22], "sfx": [["riser", 0.0, -8], ["glitch", 1.4, -10]], "scene": "the second shadow slowly stands up — and grins"}, (g, t, info) => emma2(g, t, info, { z0: 1.4, z1: 1.6, x0: -100, x1: -110, dx: 60, p2: RISE, crack: ease.out(prog(t, 1.4, 1.8)), ee: 'scared' }));
S('181', {"bars": "scope", "sfx": [["stinger", 0.0, -4]], "scene": "big face: Emma screams"}, (g, t, info) => emmaClose(g, t, info, { expr: 'shocked', r: 340, shake: 7, grow: 0.12, noBlink: true }));
S('182', {"amb": ["wind", -20], "sfx": [["whoosh", 0.1, -6]], "scene": "and you both run"}, (g, t, info) => {
  const sp = 520, c = cam(t, info, { z0: 1.05, z1: 1.05, x0: 0, x1: sp * info.dur * 0.8, shake: 3 }), r = street(g, t, c, { night: true, lamps: [LAMP, E.W / 2 + 900] });
  layer(g, c, 1, (g) => { const x = E.W / 2 - 200 + sp * t; person(g, t, r.M, { x, y: r.GY - 30, s: 1.05, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: { color: r.M.practical, dir: [0, -1], w: 4 } }); person(g, t, r.M, { who: 'emma', x: x - 160, y: r.GY - 30, s: 1.0, facing: 1, pose: walkPose(t * 10 + 1.4, { run: true }), expr: 'scared', rim: { color: r.M.practical, dir: [0, -1], w: 4 } }); });
  FX.speedLines(g, t, { a: 0.12, inner: 500 });
});
