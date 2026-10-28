// 02 — the first warning (knocks, scratched door, elevator) + "it knows the future" (lamp test, fridge photo, the message).
import { E, V, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, poly, glow, alpha, shade, mix, text, rr, linGrad, radGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { apt, hallway, office, scratch, photo, street } from '../sets/sets.js';
import { S, cam, person, closeup, card, bigHand, shadow, rimOf, knock, SHC } from '../lib.js';
import { HERO, EMMA } from '../cast.js';

const DOORX = E.W / 2 + 640;
const night = (g, t, c, o = {}) => apt(g, t, c, { mood: 'interiorCool', kind: 'living', ...o });
const rimMoon = (M) => ({ color: '#a9b8ff', dir: [-0.8, -0.4], w: 4 });
// phone insert: a big glowing phone in the dark, content(g, x, y, w, h)
function phoneShot(g, t, info, content, o = {}) {
  const c = cam(t, info, { z0: 1, z1: 1.06, x0: 0, x1: 0 });
  veil(g, '#04040a', 1);
  layer(g, c, 0.6, (g) => { glow(g, E.W / 2, E.H / 2, 700, '#7fb8ff', 0.18 * (o.on ?? 1)); });
  layer(g, c, 1, (g) => {
    const w = 330, h = 600, x = E.W / 2 - w / 2, y = E.H / 2 - h / 2 + 20;
    bigHand(g, E.W / 2 + 40, y + h - 60, 1.3, -Math.PI / 2 - 0.35, { closed: true, sleeve: HERO.color });
    rr(g, x - 16, y - 16, w + 32, h + 32, 46); g.fillStyle = '#0c0c12'; g.fill();
    rr(g, x, y, w, h, 34); g.fillStyle = (o.on ?? 1) > 0 ? mix('#05060c', '#14203a', o.on ?? 1) : '#05060c'; g.fill();
    g.save(); rr(g, x, y, w, h, 34); g.clip(); g.globalAlpha *= o.on ?? 1; content(g, x, y, w, h); g.restore();
  });
}
const bubble = (g, x, y, w, str, k = 1, col = '#2a2c3a', tc = '#e8eeff', size = 22) => { if (k <= 0) return; g.save(); g.globalAlpha *= k; rr(g, x, y, w, 90, 22); g.fillStyle = col; g.fill(); text(g, str, x + 20, y + 45, { size, color: tc, font: 'Nunito', weight: 800, align: 'left' }); g.restore(); };

S('037', {"amb": ["roomtone", -24], "sfx": [["hit", 0.15, -12, 0.8], ["footstep", 0.5, -12]], "scene": "you burst into your dark apartment"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.2, z1: 1.25, x0: 260, x1: 220 }), r = night(g, t, c, { lights: 1 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: DOORX + 120 - 420 * t, y: r.GY, s: 1.2, facing: -1, pose: walkPose(t * 10, { run: true }), expr: 'scared', sh: { mode: 'wall', dx: -120, s: 1.3, alpha: 0.55 } }));
});
S('038', {"amb": ["roomtone", -24], "sfx": [["hit", 0.45, -8, 1.8]], "scene": "insert: hand turns the deadbolt"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.05, x0: 0, x1: 0 }), k = ease.inOut(prog(t, 0.2, 0.5));
  layer(g, c, 0.5, (g) => { g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['#2a2030', '#3a2a30']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(-E.W, i * 200, E.W * 3, 6); } });
  layer(g, c, 1, (g) => {
    rr(g, E.W / 2 - 120, E.H / 2 - 160, 240, 320, 30); g.fillStyle = '#b8a888'; g.fill(); circle(g, E.W / 2, E.H / 2, 80, '#8a7a5a');
    g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(-k * Math.PI / 2); rr(g, -100, -26, 200, 52, 26); g.fillStyle = '#d8c8a0'; g.fill(); g.restore();
    bigHand(g, E.W / 2 + 110, E.H / 2 + 30 - k * 60, 1.1, Math.PI + 0.3 - k * 0.6, { closed: true, sleeve: HERO.color });
  });
});
S('039', {"amb": ["roomtone", -26], "sfx": [["tick", 0.45, -6], ["tick", 0.9, -8]], "scene": "click — every light goes off"}, (g, t, info) => {
  const L = t < 0.45 ? 1 : 0, c = cam(t, info, { z0: 1.3, z1: 1.34, x0: 420, x1: 400 }), r = night(g, t, c, { lights: L });
  layer(g, c, 1, (g) => { person(g, t, r.M, { x: DOORX - 190, y: r.GY, s: 1.2, facing: 1, poses: [[0, 'stand'], [0.2, { ...POSES.point, hF: [52, -186] }]], expr: 'nervous', rim: L ? rimOf(r.M) : rimMoon(r.M), sh: L ? { mode: 'wall', dx: -150, s: 1.3, alpha: 0.6 } : false }); });
  if (!L) veil(g, '#02030a', 0.45);
});
S('040', {"amb": ["roomtone", -26], "sfx": [["shimmer", 0.2, -14]], "scene": "moonlight only — no shadow anywhere"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.05, z1: 1.1, x0: 120, x1: 80 }), r = night(g, t, c, { lights: 0 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 + 200, y: r.GY, s: 1.15, facing: -1, poses: 'stand', expr: 'worried', look: [-0.5, 0.6], rim: rimMoon(r.M) }));
  veil(g, '#02030a', 0.4);
});
S('041', {"amb": ["roomtone", -26], "scene": "you sink onto the couch and breathe out"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.3, z1: 1.36, x0: 120, x1: 100, y0: 60, y1: 60 }), r = night(g, t, c, { lights: 0 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 + 40, y: r.GY - 20, s: 1.2, facing: 1, poses: 'sitBack', expr: [[0, 'sleepy'], [0.6, 'smile']], rim: rimMoon(r.M), contact: false }));
  veil(g, '#02030a', 0.4);
});
S('042', {"amb": ["roomtone", -26], "sfx": [["phonebuzz", 0.1, -8]], "scene": "insert: your phone lights up in the dark"}, (g, t, info) => phoneShot(g, t, info, (g, x, y, w, h) => {
  text(g, '11:42', x + w / 2, y + 150, { size: 72, color: '#e8eeff', font: 'Nunito', weight: 800 }); bubble(g, x + 24, y + 260, w - 48, 'Notification', 1, '#24283a', '#c8d4ff');
}, { on: ease.out(prog(t, 0.1, 0.3)) }));
const phoneLit = (g, t, info, o = {}) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.1, z1: o.z1 ?? 1.18, x0: o.x0 ?? 0, x1: o.x1 ?? -40, y0: 40, y1: 40 }), r = night(g, t, c, { lights: 0, window: false });
  veil(g, '#02030a', 0.35);
  layer(g, c, 1, (g) => {
    const hx = E.W / 2 + 260;
    glow(g, E.W / 2 - 120, r.GY - 320, 950, '#7fb8ff', 0.32);
    o.wall?.(g, r);
    person(g, t, r.M, { x: hx, y: r.GY - 20, s: 1.2, facing: -1, pose: { ...POSES.sit, eF: [20, -130], hF: [30, -150] }, expr: o.expr || 'neutral', rim: { color: '#9fd0ff', dir: [1, 0], w: 4 }, contact: false, prop: { type: 'phone', glow: '#bfe0ff' } });
    glow(g, hx - 36, r.GY - 200, 260, '#7fb8ff', 0.35);
  });
};
const WALLSH = (g, r, t, o = {}) => shadow(g, { x: o.x ?? E.W / 2 - 300, y: r.GY, s: o.s ?? 2.3, facing: o.facing ?? 1, pose: o.pose || POSES.stand, mode: 'wall', alpha: o.alpha ?? 0.92, skew: 0.08, crack: o.crack });
S('043', {"amb": ["roomtone", -26], "sfx": [["stinger", 0.4, -10]], "scene": "phone glow throws your shadow up the wall"}, (g, t, info) => phoneLit(g, t, info, { x0: -100, x1: -160, wall: (g, r) => WALLSH(g, r, t, { alpha: 0.92 * ease.out(prog(t, 0.2, 0.9)), pose: { ...POSES.sit, eF: [20, -130], hF: [30, -150] }, facing: -1, x: E.W / 2 - 160 }) }));
S('044', {"amb": ["roomtone", -26], "sfx": [["riser", 0.0, -14]], "scene": "except now… it stands up"}, (g, t, info) => phoneLit(g, t, info, { z0: 1.25, z1: 1.45, x0: -300, x1: -320, expr: 'scared', wall: (g, r) => WALLSH(g, r, t, { x: E.W / 2 - 160, facing: 1, pose: posesAt(t, [[0, { ...POSES.sit }], [0.5, POSES.stand]], 0.8) }) }));
S('045', {"amb": ["roomtone", -26], "sfx": [["hit", 0.25, -4, 0.55], ["hit", 0.58, -4, 0.55], ["hit", 0.91, -4, 0.55]], "scene": "it KNOCKS on the wall from inside — three times"}, (g, t, info) => {
  phoneLit(g, t, info, { z0: 1.6, z1: 1.7, x0: -380, x1: -390, y0: -40, expr: 'shocked', wall: (g, r) => {
    WALLSH(g, r, t, { x: E.W / 2 - 300, facing: 1, pose: knock(t, 0.17) });
    for (const k of [0.25, 0.58, 0.91]) if (t > k && t < k + 0.5) FX.rings(g, E.W / 2 - 300 + 76 * 2.3, r.GY - 176 * 2.3, t - k, { count: 2, r0: 20, r1: 160, color: '#cfe0ff', a: 0.6, speed: 2 });
  } });
});
S('047', {"amb": ["roomtone", -26], "sfx": [["blip", 0.3, -12, 0.6]], "scene": "insert: thumb kills the phone screen"}, (g, t, info) => phoneShot(g, t, info, (g, x, y, w, h) => { text(g, '11:43', x + w / 2, y + 150, { size: 72, color: '#e8eeff', font: 'Nunito', weight: 800 }); }, { on: 1 - ease.out(prog(t, 0.35, 0.5)) }));
S('048', {"amb": ["roomtone", -30], "scene": "silence: a black room, just the window"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.04, x0: -100, x1: -110 }); night(g, t, c, { lights: 0 }); veil(g, '#010106', 0.7);
});
S('049', {"amb": ["roomtone", -28], "sfx": [["hit", 0.85, -3, 0.45], ["hit", 1.2, -3, 0.45], ["hit", 1.55, -3, 0.45]], "scene": "three knocks on the front door"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.5, z1: 1.6, x0: 640, x1: 660, y0: 30, y1: 30 }), r = night(g, t, c, { lights: 0.6 });
  layer(g, c, 1, (g) => { for (const k of [0.85, 1.2, 1.55]) if (t > k && t < k + 0.6) FX.rings(g, DOORX + 90, r.GY - 190, t - k, { count: 2, r0: 30, r1: 220, color: '#ffffff', a: 0.5, speed: 1.6 }); });
});
S('050', {"amb": ["roomtone", -28], "sfx": [["footstep", 0.1, -16]], "scene": "POV through the peephole: the hallway, fish-eyed"}, (g, t, info) => {
  veil(g, '#000', 1); const R = 360;
  g.save(); g.beginPath(); g.arc(E.W / 2, E.H / 2, R, 0, 7); g.clip();
  g.translate(E.W / 2, E.H / 2); g.scale(0.62, 0.62); g.translate(-E.W / 2, -E.H / 2 + 160);
  hallway(g, t, { z: 1, x: Math.sin(t) * 20 }, { door: false });
  g.restore(); g.fillStyle = radGrad(g, E.W / 2, E.H / 2, R * 0.55, R, ['rgba(0,0,0,0)', 'rgba(0,0,0,.92)']); g.beginPath(); g.arc(E.W / 2, E.H / 2, R, 0, 7); g.fill();
});
S('051', {"amb": ["roomtone", -28], "scene": "nobody's there"}, (g, t, info) => {
  veil(g, '#000', 1); const R = 380 + t * 8;
  g.save(); g.beginPath(); g.arc(E.W / 2, E.H / 2, R, 0, 7); g.clip(); g.translate(E.W / 2, E.H / 2); g.scale(0.62, 0.62); g.translate(-E.W / 2 - 300, -E.H / 2 + 160);
  hallway(g, t, { z: 1, x: 0 }, { door: false }); g.restore();
  g.fillStyle = radGrad(g, E.W / 2, E.H / 2, R * 0.55, R, ['rgba(0,0,0,0)', 'rgba(0,0,0,.92)']); g.beginPath(); g.arc(E.W / 2, E.H / 2, R, 0, 7); g.fill();
});
S('052', {"amb": ["roomtone", -26], "sfx": [["riser", 0.2, -12]], "scene": "outside: something carved into the door"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.25, x0: 0, x1: 0, y0: 0, y1: -60 }), r = hallway(g, t, c, { scratch: 1 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 320, y: r.GY, s: 1.2, facing: 1, poses: 'stand', expr: 'shocked', rim: rimMoon(r.M) }));
});
S('053', {"bars": "scope", "sfx": [["stinger", 0.1, -5]], "scene": "close: DON'T GO TO WORK, gouged into the wood"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.08, x0: 0, x1: 0, shake: 1 });
  layer(g, c, 1, (g) => {
    g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['#4a2e24', '#3a2420', '#4a2e24']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + (i % 3) * 0.03})`; g.fillRect(-E.W, i * 32 + Math.sin(i) * 10, E.W * 3, 3); }
    scratch(g, E.W / 2, E.H / 2 - 126, ease.linear(prog(t, 0, 1.2)), t, 118);
  });
  veil(g, '#000', 0.15);
});
S('054', {"amb": ["roomtone", -26], "scene": "big face: a prank… right?"}, (g, t, info) => closeup(g, t, info, { bg: (g) => hallway(g, t, { z: 1.5, x: 200 }, { scratch: 1 }), expr: [[0, 'confused'], [0.8, 'smirk']], look: [0.6, 0], r: 290, rimSide: -1, rim: '#a9b8ff' }));
S('055', {"amb": ["roomtone", -26], "scene": "you shrug and walk off"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.05, z1: 1.08, x0: 0, x1: -60 }), r = hallway(g, t, c, { scratch: 1 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 320 - (t > 0.5 ? (t - 0.5) * 160 : 0), y: r.GY, s: 1.2, facing: t > 0.5 ? -1 : 1, pose: t > 0.5 ? walkPose(t * 5.6) : POSES.shrug, expr: 'smirk', rim: rimMoon(r.M) }));
});

// ---------- OFFICE + ELEVATOR ----------
const lobby = (g, t, c, o = {}) => office(g, t, c, o);
S('056', {"in": "dip", "amb": ["murmur", -26], "scene": "office lobby, morning: 20 minutes later"}, (g, t, info) => {
  const c = cam(t, info, { z0: 0.95, z1: 1.02, x0: -60, x1: 0 }), r = lobby(g, t, c, { open: 1 });
  layer(g, c, 1, (g) => { person(g, t, r.M, { x: E.W / 2 - 700 + 160 * t, y: r.GY, s: 1.1, facing: 1, walk: { speed: 0 }, pose: walkPose(t * 5.6), expr: 'neutral', sh: { mode: 'floor', kx: -0.3, ky: 0.25 } }); for (const [x, f] of [[E.W / 2 - 900, 1], [E.W / 2 + 820, -1]]) person(g, t, r.M, { who: { top: 'suit', color: '#2a2833' }, x, y: r.GY, s: 1.0, facing: f, poses: 'phone', prop: 'phone', expr: 'neutral' }); });
  const a = clamp(Math.min(t / 0.3, (info.dur - t) / 0.3)); text(g, '20 MINUTES LATER', E.W - 70, E.H - 150, { size: 34, color: '#ffd47e', font: 'Nunito', weight: 900, align: 'right', alpha: a, glow: 14, glowColor: 'rgba(255,200,100,.6)' });
});
const ELEV_IN = { ...POSES.stand };
S('057', {"amb": ["murmur", -26], "sfx": [["ding", 0.1, -12]], "scene": "you step into the elevator"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.2, z1: 1.25, x0: 0, x1: 0 }), r = lobby(g, t, c, { open: 1 });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 300 + Math.min(t, 1.6) * 190, y: r.GY, s: 1.15, facing: 1, pose: t < 1.6 ? walkPose(t * 5.6) : POSES.stand, expr: 'neutral', sh: { mode: 'floor', kx: -0.3, ky: 0.25 } }));
});
// hero inside the cabin (drawn inside the open doors), shadow outside on the lobby floor/wall
const cabin = (g, t, info, o) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.3, z1: o.z1 ?? 1.36, x0: o.x0 ?? 0, x1: o.x1 ?? 0, y0: o.y ?? 40, y1: o.y ?? 40, shake: o.shake });
  const r = lobby(g, t, c, { open: o.open ?? 1, floor: o.floor, inside: (g, x, y, w, h) => { if (o.hero !== false) drawFigure(g, { x: o.heroX ?? x + w / 2 + 40, y: y + h, s: 1.15, facing: o.heroFacing ?? -1, pose: breathe(o.heroPose || POSES.stand, t), outfit: HERO, expr: o.expr || 'neutral', look: o.look, rim: { color: '#fff0d0', dir: [0, -1], w: 4 } }); } });
  layer(g, c, 1, (g) => o.outside?.(g, r));
  return r;
};
S('058', {"amb": ["murmur", -26], "sfx": [["stinger", 0.4, -12]], "scene": "inside the cabin — your shadow stays OUTSIDE"}, (g, t, info) => cabin(g, t, info, { expr: [[0, 'neutral'], [0.6, 'confused']], look: [-1, 0.3], outside: (g, r) => shadow(g, { x: E.W / 2 - 330, y: r.GY, s: 1.25, facing: 1, pose: POSES.stand, mode: 'wall', alpha: 0.92 }) }));
const GRAB = { ...POSES.reach, eF: [40, -170], hF: [78, -176], eB: [30, -150], hB: [70, -140] };
S('059', {"amb": ["murmur", -26], "sfx": [["hit", 0.5, -8, 0.7]], "scene": "the doors slide — it GRABS them"}, (g, t, info) => {
  const open = lerp(1, 0.55, ease.out(prog(t, 0, 0.5)));
  cabin(g, t, info, { open, expr: 'surprised', look: [-1, 0], outside: (g, r) => shadow(g, { x: E.W / 2 - 170 - 170 * (1 - open) * 0 - 60, y: r.GY, s: 1.25, facing: 1, pose: posesAt(t, [[0, POSES.stand], [0.35, GRAB]], 0.2), mode: 'wall', alpha: 0.95 }) });
});
S('060', {"amb": ["murmur", -26], "sfx": [["glitch", 0.2, -12], ["hum", 0, -16]], "scene": "it refuses to let them close — doors shudder"}, (g, t, info) => {
  const open = 0.55 + Math.sin(t * 40) * 0.02;
  cabin(g, t, info, { open, z0: 1.55, z1: 1.62, x0: -60, x1: -60, shake: 2, expr: 'confused', look: [-1, 0], outside: (g, r) => shadow(g, { x: E.W / 2 - 230, y: r.GY, s: 1.25, facing: 1, pose: GRAB, mode: 'wall', alpha: 0.95 }) });
});
S('061', {"amb": ["murmur", -26], "sfx": [["footstep", 0.3, -10]], "scene": "you pull your foot back out"}, (g, t, info) => {
  const k = ease.inOut(prog(t, 0.1, 0.8));
  cabin(g, t, info, { open: 0.55, hero: false, outside: (g, r) => { shadow(g, { x: E.W / 2 - 230, y: r.GY, s: 1.25, facing: 1, pose: GRAB, mode: 'wall', alpha: 0.95 }); person(g, t, r.M, { x: E.W / 2 + 40 - k * 200, y: r.GY, s: 1.15, facing: 1, pose: k > 0 && k < 1 ? walkPose(-k * 4) : POSES.stand, expr: 'nervous', look: [1, 0] }); } });
});
S('062', {"amb": ["murmur", -26], "sfx": [["hit", 0.45, -6, 0.9]], "scene": "the doors shut"}, (g, t, info) => cabin(g, t, info, { open: lerp(0.55, 0, ease.in(prog(t, 0, 0.45))), hero: false, z0: 1.4, z1: 1.45, outside: (g, r) => person(g, t, r.M, { x: E.W / 2 - 220, y: r.GY, s: 1.15, facing: 1, poses: 'stand', expr: 'worried', sh: { mode: 'wall', dx: -40, alpha: 0.9 } }) }));
S('063', {"amb": ["hum", -22], "sfx": [["blip", 0.2, -14], ["blip", 0.6, -14], ["blip", 1.0, -14]], "scene": "the empty elevator rises: 2, 3, 4…"}, (g, t, info) => {
  const fl = String(1 + Math.min(9, Math.floor(t * 2.6)));
  const c = cam(t, info, { z0: 2.2, z1: 2.4, x0: 0, x1: 0, y0: -170, y1: -180 }); lobby(g, t, c, { open: 0, floor: fl });
});
S('064', {"amb": ["hum", -22], "sfx": [["riser", 0.0, -8]], "scene": "then… a cable groans"}, (g, t, info) => {
  const c = cam(t, info, { z0: 3.6, z1: 3.9, x0: 0, x1: 0, y0: -240, y1: -240, shake: 1 + t * 2 }); lobby(g, t, c, { open: 0, floor: '9' });
});
S('065', {"bars": "scope", "sfx": [["impact", 0.0, -2], ["glitch", 0.1, -8]], "scene": "CRASH — lights blow, everything shakes"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.15, z1: 1.2, x0: 0, x1: 0, shake: 26 * (1 - prog(t, 0, 1.2)) + 3, freq: 14 });
  const r = lobby(g, t, c, { open: 0, floor: '–' }); veil(g, '#000', t % 0.18 < 0.09 ? 0.55 : 0.15);
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 240, y: r.GY, s: 1.15, facing: 1, poses: [[0, 'stand'], [0.1, 'handsOnHead']], expr: 'shocked' }));
  FX.dust(g, t, { count: 120, color: '#ffffff', a: 0.5, speed: -120, size: 3 });
  if (t < 0.12) veil(g, '#ffffff', 1 - t / 0.12);
});
S('066', {"sfx": [["whoosh", 0.0, -4]], "scene": "cutaway: the cabin plummets down the shaft"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1, x0: 0, x1: 0, shake: 4 });
  layer(g, c, 1, (g) => {
    g.fillStyle = '#05060c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    const sx = E.W / 2 - 140; g.fillStyle = '#10131f'; g.fillRect(sx, -E.H, 280, E.H * 3);
    for (let y = ((t * 3000) % 160) - 160; y < E.H; y += 160) { g.fillStyle = 'rgba(160,180,255,.18)'; g.fillRect(sx, y, 280, 4); }
    seg(g, [[E.W / 2, -10], [E.W / 2, E.H * 0.36]], 3, '#5a6080'); seg(g, [[E.W / 2 + 30, -10], [E.W / 2 + 60, 60], [E.W / 2 + 10, 140], [E.W / 2 + 40, 220]], 3, '#8a90b0');
    rr(g, sx + 20, E.H * 0.36, 240, 300, 6); g.fillStyle = '#9aa0b4'; g.fill(); g.fillStyle = '#e8dcc0'; g.fillRect(sx + 40, E.H * 0.36 + 30, 200, 240);
    FX.speedLines(g, t, { cx: E.W / 2, cy: E.H * 1.8, a: 0.3, inner: 300, count: 80 });
    for (let i = 0; i < 12; i++) circle(g, sx + 20 + ((i * 53) % 240), E.H * 0.36 - 20 - ((t * 900 + i * 70) % 200), 3, '#ffd47e');
  });
});
S('067', {"bars": "scope", "sfx": [["impact", 0.05, -1]], "scene": "BASEMENT: it smashes into the floor, sparks"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.1, z1: 1.15, x0: 0, x1: 0, shake: 30 * (1 - prog(t, 0, 0.8)), freq: 12 });
  layer(g, c, 1, (g) => {
    g.fillStyle = '#05060c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.fillStyle = '#1a1c28'; g.fillRect(-E.W, E.H * 0.78, E.W * 3, E.H);
    const sq = ease.out(prog(t, 0, 0.15)); g.save(); g.translate(E.W / 2, E.H * 0.78); g.scale(1 + sq * 0.15, 1 - sq * 0.3); rr(g, -150, -320, 300, 320, 8); g.fillStyle = '#7a8098'; g.fill(); g.fillStyle = '#3a3020'; g.fillRect(-120, -290, 240, 260); g.restore();
    for (let i = 0; i < 40; i++) { const a = -Math.PI * (0.05 + (i * 0.618 % 0.9)), d = (t * (500 + (i * 37) % 400)); const x = E.W / 2 + Math.cos(a) * d, y = E.H * 0.78 + Math.sin(a) * d + 400 * t * t; seg(g, [[x, y], [x - Math.cos(a) * 18, y - Math.sin(a) * 18]], 3, alpha('#ffd47e', clamp(1 - t))); }
  });
  FX.dust(g, t, { count: 150, color: '#c8c0b0', a: 0.5, speed: -40, size: 4 });
  if (t < 0.1) veil(g, '#ffffff', 1 - t / 0.1);
});
S('068', {"amb": ["hum", -26], "sfx": [["heartbeat", 0.1, -8]], "scene": "big face: you would have been inside"}, (g, t, info) => { closeup(g, t, info, { bg: (g) => lobby(g, t, { z: 1.6, x: 0, y: -60 }, { open: 0, floor: '–' }), expr: 'shocked', r: 300, rimSide: 1, rim: '#cfe0ff', shake: 1.2 }); FX.dust(g, t, { count: 80, color: '#c8c0b0', a: 0.35, size: 3 }); });
S('069', {"amb": ["hum", -26], "sfx": [["shimmer", 0.3, -12]], "scene": "you and your shadow side by side — it nods"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.3, z1: 1.4, x0: -200, x1: -230, y0: 40, y1: 40 }), r = lobby(g, t, c, { open: 0, floor: '–' });
  veil(g, '#000', 0.2);
  layer(g, c, 1, (g) => { const nod = Math.max(0, Math.sin(prog(t, 1.0, 1.6) * Math.PI)) * 12; shadow(g, { x: E.W / 2 - 520, y: r.GY, s: 1.2, facing: 1, pose: { ...POSES.stand, head: [8, -206 + nod] }, mode: 'wall', alpha: 0.95 }); person(g, t, r.M, { x: E.W / 2 - 300, y: r.GY, s: 1.15, facing: -1, poses: 'stand', expr: [[0, 'shocked'], [1.4, 'awe']], look: [-1, 0] }); });
  FX.dust(g, t, { count: 60, color: '#c8c0b0', a: 0.3 });
});

// ---------- THAT NIGHT: the lamp test ----------
const lampRoom = (g, t, c, o = {}) => { const r = night(g, t, c, { lights: 0, window: false }); veil(g, '#02030a', 0.5); return r; };
const LAMPX = E.W / 2 + 180;
function floorLamp(g, x, y, on) { rr(g, x - 40, y - 30, 80, 30, 6); g.fillStyle = '#2a2430'; g.fill(); poly(g, [[x - 34, y - 30], [x + 34, y - 30], [x + 18, y - 90], [x - 18, y - 90]], on ? '#ffe8b8' : '#4a4450'); if (on) { glow(g, x, y - 60, 300, '#ffd59a', 0.6); FX.pool(g, x, y + 20, 360, 60, '#ffd59a', 0.4); } }
const lampScene = (g, t, info, o) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.15, z1: o.z1 ?? 1.22, x0: o.x0 ?? -80, x1: o.x1 ?? -110, y0: o.y ?? 40, y1: o.y ?? 40 }), r = lampRoom(g, t, c);
  layer(g, c, 1, (g) => {
    if (o.lamp !== false) { glow(g, E.W / 2 - 330, r.GY - 380, 1000, '#ffc68a', 0.42); }
    o.wall?.(g, r);
    floorLamp(g, LAMPX, r.GY, o.lamp !== false);
    person(g, t, r.M, { x: o.heroX ?? LAMPX + 170, y: r.GY, s: 1.15, facing: -1, poses: o.poses || 'kneel', expr: o.expr || 'neutral', look: o.look, talk: o.talk, rim: { color: '#ffd59a', dir: [-1, -0.2], w: 4 }, prop: o.prop });
  });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.3 });
};
const BIG = (g, r, pose, o = {}) => shadow(g, { x: o.x ?? E.W / 2 - 360, y: r.GY, s: 2.5, facing: o.facing ?? 1, pose, mode: 'wall', alpha: o.alpha ?? 0.94, skew: 0.06 });
S('070', {"in": "dip", "amb": ["roomtone", -26], "scene": "that night: you sit on the floor in the dark, lamp beside you"}, (g, t, info) => lampScene(g, t, info, { lamp: false, z0: 1.0, z1: 1.06, poses: 'sit', expr: 'determined' }));
S('071', {"amb": ["roomtone", -26], "sfx": [["tick", 0.55, -6]], "scene": "insert: you set the lamp down — click, on"}, (g, t, info) => {
  const on = t > 0.55, c = cam(t, info, { z0: 2.4, z1: 2.5, x0: 180, x1: 180, y0: 280, y1: 280 }), r = lampRoom(g, t, c);
  layer(g, c, 1, (g) => { floorLamp(g, LAMPX, r.GY, on); bigHand(g, LAMPX + 70, r.GY - 120 + (t < 0.4 ? 0 : 20), 0.35, Math.PI - 0.6, { closed: true, sleeve: HERO.color }); });
});
S('072', {"amb": ["roomtone", -26], "sfx": [["stinger", 0.2, -10]], "scene": "a giant shadow blooms up the wall"}, (g, t, info) => lampScene(g, t, info, { z0: 0.95, z1: 1.02, x0: -160, x1: -200, expr: 'awe', look: [-1, -0.8], wall: (g, r) => BIG(g, r, POSES.kneel, { facing: -1, alpha: 0.94 * ease.out(prog(t, 0.1, 0.6)) }) }));
S('073', {"amb": ["roomtone", -26], "scene": "you ask it: \"Can you understand me?\""}, (g, t, info) => lampScene(g, t, info, { talk: [1.25, 2.4], expr: 'nervous', look: [-1, -0.6], wall: (g, r) => BIG(g, r, POSES.kneel, { facing: -1 }) }));
const NOD = (t, a, b) => ({ ...POSES.stand, head: [6, -206 + Math.max(0, Math.sin(prog(t, a, b) * Math.PI * 2)) * 14] });
S('075', {"amb": ["roomtone", -26], "sfx": [["heartbeat", 0.15, -10]], "scene": "it NODS"}, (g, t, info) => lampScene(g, t, info, { z0: 1.3, z1: 1.4, x0: -330, x1: -340, y: -60, expr: 'shocked', look: [-1, -0.6], wall: (g, r) => BIG(g, r, NOD(t, 0.05, 0.6)) }));
S('076', {"bars": "scope", "in": "flash", "sfx": [["freeze", 0, -10]], "scene": "freeze: big face, eyes wide"}, (g, t, info) => closeup(g, t, info, { bg: (g) => { veil(g, '#05040a', 1); glow(g, E.W * 0.75, E.H * 0.8, 500, '#ffd59a', 0.3); }, expr: 'shocked', r: 320, grow: 0.02, noBlink: true, rimSide: 1, rim: '#ffd59a' }));
S('077', {"amb": ["roomtone", -26], "scene": "\"Can you see the future?\""}, (g, t, info) => lampScene(g, t, info, { z0: 1.5, z1: 1.55, x0: 260, x1: 250, y: 60, talk: [0.1, 1.2], expr: 'worried', look: [-1, -0.6], wall: (g, r) => BIG(g, r, POSES.stand) }));
S('078', {"amb": ["roomtone", -26], "sfx": [["heartbeat", 0.1, -10]], "scene": "it nods again"}, (g, t, info) => lampScene(g, t, info, { z0: 1.05, z1: 1.1, x0: -150, x1: -170, expr: 'scared', look: [-1, -0.6], wall: (g, r) => BIG(g, r, NOD(t, 0.05, 0.6)) }));
S('079', {"amb": ["roomtone", -26], "scene": "you grab a piece of paper"}, (g, t, info) => lampScene(g, t, info, { z0: 1.4, z1: 1.45, x0: 160, x1: 150, y: 60, poses: [[0, 'kneel'], [0.4, { ...POSES.kneel, eF: [30, -120], hF: [48, -132] }]], prop: t > 0.4 ? 'paper' : null, expr: 'determined', wall: (g, r) => BIG(g, r, POSES.stand) }));
S('080', {"amb": ["roomtone", -26], "scene": "\"Write something.\" — you hold the paper up"}, (g, t, info) => lampScene(g, t, info, { poses: { ...POSES.kneel, eF: [34, -150], hF: [56, -176] }, prop: 'paper', talk: [0.05, 0.8], expr: 'determined', look: [-1, -0.6], wall: (g, r) => BIG(g, r, POSES.stand) }));
S('081', {"amb": ["roomtone", -26], "sfx": [["swish", 0.2, -12]], "scene": "the shadow turns and points toward the kitchen"}, (g, t, info) => lampScene(g, t, info, { z0: 0.95, z1: 1.0, x0: -100, x1: -140, expr: 'confused', look: [-1, -0.6], wall: (g, r) => BIG(g, r, posesAt(t, [[0, POSES.stand], [0.4, POSES.point]], 0.4), { facing: -1, x: E.W / 2 - 300 }) }));
S('082', {"amb": ["roomtone", -26], "sfx": [["footstep", 0.2, -14], ["footstep", 0.6, -14]], "scene": "you follow it — it glides along the wall ahead of you"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.05, z1: 1.05, x0: -100, x1: -100 - 160 * info.dur }), r = apt(g, t, c, { mood: 'interiorCool', kind: 'kitchen', lights: 0.3, window: false });
  layer(g, c, 1, (g) => { shadow(g, { x: E.W / 2 - 300 - 160 * t, y: r.GY, s: 1.6, facing: -1, pose: walkPose(t * 5.6), mode: 'wall', alpha: 0.93 }); person(g, t, r.M, { x: E.W / 2 + 80 - 160 * t, y: r.GY, s: 1.15, facing: -1, pose: walkPose(t * 5.6), expr: 'nervous', rim: rimMoon(r.M) }); });
  veil(g, '#02030a', 0.25);
});
// ---------- KITCHEN ----------
const FRIDGEX = E.W / 2 + 260;
const kitchen = (g, t, c, o = {}) => { const r = apt(g, t, c, { mood: 'interiorCool', kind: 'kitchen', lights: 0.45, window: false, fridgeX: FRIDGEX, clockX: E.W / 2 - 300, ...o }); glow(g, E.W / 2, 0, 900, '#9fb8ff', 0.05); return r; };
S('083', {"amb": ["hum", -26], "sfx": [["hum", 0, -18]], "scene": "kitchen: on the fridge, a photo of you and Emma"}, (g, t, info) => {
  const k = ease.inOut(prog(t, 0.6, info.dur)); const c = { z: lerp(1.0, 2.6, k), x: lerp(0, 380, k), y: lerp(0, -380 + 140, k) };
  const r = kitchen(g, t, c);
  layer(g, c, 1, (g) => { shadow(g, { x: FRIDGEX - 140, y: r.GY, s: 1.5, facing: 1, pose: POSES.point, mode: 'wall', alpha: 0.93 }); person(g, t, r.M, { x: FRIDGEX - 420, y: r.GY, s: 1.15, facing: 1, poses: 'stand', expr: 'worried', look: [1, -0.5] }); });
});
S('084', {"amb": ["hum", -26], "sfx": [["stinger", 0.3, -12]], "scene": "close: a shadow finger lands on Emma"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.05, x0: 0, x1: 0 });
  layer(g, c, 1, (g) => {
    g.fillStyle = linGrad(g, 0, 0, E.W, 0, ['#9a96a8', '#c8c4d0', '#8a8698']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    photo(g, E.W / 2, E.H / 2, 2.6, 1, { rot: -0.03 });
    const k = ease.out(prog(t, 0.1, 0.7)); g.save(); g.globalAlpha = 0.9; seg(g, [[E.W + 200, E.H * 0.2], [lerp(E.W + 200, E.W / 2 + 160, k), lerp(E.H * 0.2, E.H / 2 - 40, k)]], 70, SHC); circle(g, lerp(E.W + 200, E.W / 2 + 160, k), lerp(E.H * 0.2, E.H / 2 - 40, k), 44, SHC); seg(g, [[lerp(E.W + 200, E.W / 2 + 160, k), lerp(E.H * 0.2, E.H / 2 - 40, k)], [lerp(E.W + 140, E.W / 2 + 100, k), lerp(E.H * 0.24, E.H / 2 + 10, k)]], 26, SHC); g.restore();
  });
});
const SLASH = (t, a) => { const k = ease.inOut(prog(t, a, a + 0.9)); return { ...POSES.stand, head: [4, -206], eF: [26, -170], hF: [lerp(-10, 40, k), -186] }; };
S('085', {"amb": ["hum", -26], "sfx": [["stinger", 0.4, -6], ["swish", 0.6, -10]], "scene": "it slowly draws a line across its own throat"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.6, z1: 1.8, x0: 300, x1: 300, y0: -150, y1: -160 }), r = kitchen(g, t, c);
  layer(g, c, 1, (g) => shadow(g, { x: FRIDGEX - 170, y: r.GY, s: 1.6, facing: 1, pose: SLASH(t, 0.3), mode: 'wall', alpha: 0.95 }));
  veil(g, '#000', 0.15);
});
S('086', {"amb": ["hum", -26], "sfx": [["hit", 0.3, -10, 0.8]], "scene": "you stumble backward into the counter"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.2, z1: 1.25, x0: 100, x1: 80, shake: 2 }), r = kitchen(g, t, c);
  layer(g, c, 1, (g) => { shadow(g, { x: FRIDGEX - 170, y: r.GY, s: 1.6, facing: 1, pose: SLASH(1, 0), mode: 'wall', alpha: 0.95 }); person(g, t, r.M, { x: FRIDGEX - 420 - ease.out(prog(t, 0, 0.6)) * 120, y: r.GY, s: 1.15, facing: 1, poses: [[0, 'stand'], [0.1, 'fall']], expr: 'shocked' }); });
});
S('087', {"amb": ["hum", -26], "sfx": [["clock", 0.5, -10]], "scene": "\"No.\" — the shadow points at the clock"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.08, x0: -60, x1: -100 }), r = kitchen(g, t, c);
  layer(g, c, 1, (g) => { shadow(g, { x: FRIDGEX - 170, y: r.GY, s: 1.6, facing: -1, pose: posesAt(t, [[0, POSES.stand], [0.5, { ...POSES.point, hF: [70, -200], eF: [36, -184] }]], 0.4), mode: 'wall', alpha: 0.95 }); person(g, t, r.M, { x: FRIDGEX - 560, y: r.GY, s: 1.15, facing: 1, poses: 'stand', expr: 'scared', talk: [0.0, 0.35] }); });
});
S('089', {"bars": "scope", "sfx": [["tick", 0.1, -8], ["tick", 0.6, -8], ["tick", 1.1, -8]], "scene": "close: 11:59 PM"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.1, x0: 0, x1: 0 }); veil(g, '#0a0c18', 1);
  layer(g, c, 1, (g) => { FX.clock(g, E.W / 2 - 280, E.H / 2, 230, 23 * 3600 + 59 * 60 + 40 + t, { face: '#e9e4f0' }); text(g, '11:59', E.W / 2 + 330, E.H / 2 - 30, { size: 150, color: '#ff4a4a', font: 'Nunito', weight: 900, glow: 30, glowColor: 'rgba(255,60,60,.7)' }); text(g, 'PM', E.W / 2 + 330, E.H / 2 + 90, { size: 60, color: '#ff8a7a', font: 'Nunito', weight: 900 }); });
});
S('090', {"amb": ["roomtone", -26], "sfx": [["phonering", 0.2, -14]], "scene": "you call Emma"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.35, z1: 1.4, x0: -180, x1: -200, y0: 40, y1: 40 }), r = kitchen(g, t, c);
  layer(g, c, 1, (g) => person(g, t, r.M, { x: FRIDGEX - 560, y: r.GY, s: 1.15, facing: 1, poses: { ...POSES.phone, hF: [16, -196], eF: [26, -160] }, prop: 'phone', expr: 'worried' }));
});
const callScreen = (g, x, y, w, h, line2, t) => { text(g, 'EMMA', x + w / 2, y + 170, { size: 46, color: '#ffffff', font: 'Nunito', weight: 900 }); text(g, line2, x + w / 2, y + 230, { size: 26, color: line2 === 'NO ANSWER' ? '#ff6a5a' : '#9fb6d8', font: 'Nunito', weight: 800 }); circle(g, x + w / 2, y + 90, 46, '#f2c21a'); circle(g, x + w / 2, y + h - 90, 40, '#e04a3a'); };
S('091', {"sfx": [["phonering", 0.0, -14]], "scene": "phone: calling… NO ANSWER"}, (g, t, info) => phoneShot(g, t, info, (g, x, y, w, h) => callScreen(g, x, y, w, h, t < 0.4 ? 'calling…' : 'NO ANSWER', t)));
S('092', {"sfx": [["phonering", 0.0, -14], ["phonering", 1.0, -16]], "scene": "big face, phone at ear: still nothing"}, (g, t, info) => closeup(g, t, info, { bg: (g) => kitchen(g, t, { z: 1.4, x: 300, y: -100 }), expr: [[0, 'worried'], [1.0, 'scared']], look: [0.6, 0.2], r: 290, rimSide: 1, rim: '#9fb8ff', front: (g, r) => { rr(g, E.W / 2 + r * 0.95, E.H * 0.6 - r * 0.4, r * 0.28, r * 0.55, 14); g.fillStyle = '#0c0c12'; g.fill(); } }));
S('094', {"sfx": [["phonebuzz", 0.15, -6]], "scene": "a message from Emma"}, (g, t, info) => phoneShot(g, t, info, (g, x, y, w, h) => { text(g, 'EMMA', x + w / 2, y + 70, { size: 30, color: '#ffffff', font: 'Nunito', weight: 900 }); seg(g, [[x, y + 110], [x + w, y + 110]], 2, '#2a3048'); bubble(g, x + 20, y + 150, 220, '•••', ease.out(prog(t, 0.2, 0.4)), '#3a3d50'); }));
S('095', {"bars": "scope", "sfx": [["stinger", 0.4, -6]], "scene": "\"Someone is standing outside my window.\""}, (g, t, info) => phoneShot(g, t, info, (g, x, y, w, h) => {
  text(g, 'EMMA', x + w / 2, y + 70, { size: 30, color: '#ffffff', font: 'Nunito', weight: 900 }); seg(g, [[x, y + 110], [x + w, y + 110]], 2, '#2a3048');
  const msg = 'Someone is standing outside my window.'; const n = Math.floor(clamp(t / 1.2) * msg.length); const words = msg.slice(0, n);
  rr(g, x + 18, y + 150, w - 36, 170, 22); g.fillStyle = '#3a3d50'; g.fill();
  const lines = ['Someone is standing', 'outside my window.']; let used = 0; lines.forEach((ln, i) => { const part = words.slice(used, used + ln.length + 1); used += ln.length + 1; text(g, part, x + 38, y + 205 + i * 52, { size: 28, color: '#ffffff', font: 'Nunito', weight: 800, align: 'left' }); });
}));
S('096', {"sfx": [["swish", 0.2, -8], ["hit", 0.35, -14, 1.6]], "scene": "insert: you snatch your keys"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.04, x0: 0, x1: 0 }); veil(g, '#141020', 1); const k = ease.out(prog(t, 0.15, 0.4));
  layer(g, c, 1, (g) => { g.fillStyle = '#3a2a2a'; g.fillRect(-E.W, E.H * 0.65, E.W * 3, E.H); const kx = E.W / 2 + 60, ky = E.H * 0.62 - k * 260; ring(g, kx, ky, 34, 7, '#c8c0a0'); for (const a of [0.4, 1.2]) { g.save(); g.translate(kx + Math.cos(a) * 34, ky + Math.sin(a) * 34); g.rotate(a); rr(g, 0, -10, 110, 20, 6); g.fillStyle = '#d8c890'; g.fill(); g.restore(); } bigHand(g, kx - 40, ky - 20, 0.9, 0.2 - k * 0.3, { closed: k > 0.5, sleeve: HERO.color }); });
});
S('097', {"amb": ["wind", -20], "sfx": [["whoosh", 0.1, -6]], "scene": "and you run out into the night"}, (g, t, info) => {
  const sp = 560, c = cam(t, info, { z0: 1.1, z1: 1.1, x0: 0, x1: sp * info.dur, shake: 3 }), r = street(g, t, c, { night: true });
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 100 + sp * t, y: r.GY - 30, s: 1.05, facing: 1, pose: walkPose(t * 10, { run: true }), expr: 'scared', rim: { color: r.M.practical, dir: [0, -1], w: 4 }, sh: { mode: 'floor', kx: -0.6, ky: 0.25 } }));
  FX.speedLines(g, t, { a: 0.12, inner: 500 });
});
