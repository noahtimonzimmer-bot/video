// 01 — cold open on the roof (flash-forward) + day one: the shadow starts acting on its own.
import { E, V, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, poly, glow, alpha, shade, mix, text, rr, linGrad } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { roof, apt, street } from '../sets/sets.js';
import { S, cam, person, closeup, card, bigHand, shadow, rimOf, wavePose, SHC } from '../lib.js';
import { HERO, EMMA } from '../cast.js';

// ---------- the hanging tableau (also reused in the climax file) ----------
export const KNEEL_REACH = { head: [26, -150], sh: [16, -122], hip: [0, -62], eF: [52, -78], hF: [92, 30], eB: [-4, -92], hB: [-14, -40], kF: [36, -46], fF: [36, 0], kB: [-6, -4], fB: [-48, 0] };
export const HANG = { head: [12, -206], sh: [2, -172], hip: [0, -100], eF: [8, -230], hF: [8, -276], eB: [-6, -228], hB: [-2, -272], kF: [6, -50], fF: [10, 0], kB: [-6, -48], fB: [-6, 2] };
export const KNIFE_UP = { ...POSES.pointUp, eF: [20, -214], hF: [26, -262] };
export const KNIFE_FWD = { ...POSES.point, eF: [36, -160], hF: [72, -140] };
export const KNIFE_DOWN = { ...POSES.point, head: [10, -204], eF: [44, -150], hF: [74, -100] };
export function hangScene(g, t, c, o = {}) {
  const r = roof(g, t, c, { edge: o.edge, hutX: o.hutX, doorOpen: o.doorOpen, sunset: o.sunset ?? 0.4 });
  const { GY, M, edge } = r, s = o.s ?? 1.25;
  const hx = edge - 100 * s, H = [hx + KNEEL_REACH.hF[0] * s, GY + KNEEL_REACH.hF[1] * s];
  const swing = Math.sin(t * 1.4) * 0.04 * (o.swing ?? 1);
  layer(g, c, 1, (g) => {
    if (o.shadowFig !== false) shadow(g, { x: o.shX ?? edge - 640, y: GY, s: s * 1.35, facing: 1, pose: o.shPose || KNIFE_UP, mode: 'wall', knife: o.knife ?? true, knifeAng: o.knifeAng ?? -1.4, alpha: o.shAlpha ?? 0.96, crack: o.crack });
    // Emma hanging below the edge, hands joined with the hero
    g.save(); g.translate(H[0], H[1]); g.rotate(swing); g.translate(-H[0], -H[1]);
    const ex = H[0] + HANG.hF[0] * s, ey = H[1] - HANG.hF[1] * s;
    if (o.emmaShadow) shadow(g, { x: ex + 6, y: ey, s, facing: -1, pose: HANG, outfit: EMMA, mode: 'wall', alpha: 0.9, skew: -0.05 });
    drawFigure(g, { x: ex, y: ey, s, facing: -1, pose: o.emmaPose || HANG, outfit: EMMA, expr: o.emmaExpr || 'scared', look: [0.2, -1], rim: rimOf(M, [1, -0.2]), shadow: false });
    o.wrap?.(g, H, ex, ey, s);
    g.restore();
    drawFigure(g, { x: hx, y: GY, s, facing: 1, pose: o.heroPose || KNEEL_REACH, outfit: HERO, expr: o.heroExpr || 'determined', look: [0.4, 0.8], rim: rimOf(M, [1, -0.3]), shadow: true });
  });
  FX.dust(g, t, { count: 30, color: '#ffd8b0', a: 0.3, speed: -40 });
  FX.lensStreak(g, E.W / 2 + 520, GY - 300, E.W * 1.4, '#ffd0a0', 0.2);
  return { ...r, H, hx };
}

S('000', {"in": "fade", "bars": "scope", "amb": ["wind", -18], "sfx": [["wind", 0, -14]], "scene": "roof wide at sunset: you kneel at the edge holding Emma, a black shape behind"},
  (g, t, info) => hangScene(g, t, cam(t, info, { z0: 0.8, z1: 0.88, x0: 140, x1: 60, y0: 120, y1: 150 }), { shAlpha: 0.0 }));
S('001', {"bars": "scope", "amb": ["wind", -18], "scene": "medium at the edge: Emma dangling over 40 floors"},
  (g, t, info) => hangScene(g, t, cam(t, info, { z0: 1.45, z1: 1.55, x0: 470, x1: 460, y0: 420, y1: 440 }), { shAlpha: 0, swing: 2.5 }));
S('002', {"bars": "scope", "amb": ["wind", -18], "sfx": [["hit", 0.1, -16, 0.6]], "scene": "insert: two hands gripping over the abyss"}, (g, t, info) => {
  const M = mood('dusk'), c = cam(t, info, { z0: 1, z1: 1.08, x0: 0, x1: 0 });
  layer(g, c, 0.3, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1a30', '#120a18', '#05030a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.skyline(g, { x: -E.W, y: E.H + 200, w: E.W * 3, minH: 200, maxH: 700, color: '#0a0610', windowColor: alpha(M.practical, 0.8), lit: 0.35, seed: 3 }); });
  const [sx, sy] = shake(t, 3, 5);
  layer(g, c, 1, (g) => {
    bigHand(g, E.W * 0.5 + sx, E.H * 0.42 + sy, 1.25, Math.PI / 2 + 0.15, { closed: true, sleeve: HERO.color, rim: M.rim });
    bigHand(g, E.W * 0.5 - sx, E.H * 0.6 - sy, 1.2, -Math.PI / 2 + 0.1, { closed: true, rim: M.rim });
  });
  FX.dust(g, t, { count: 40, color: '#ffd8b0', a: 0.35, speed: -80 });
});
S('003', {"bars": "scope", "amb": ["wind", -18], "sfx": [["stinger", 0.25, -6]], "scene": "pull back: your shadow stands behind you holding a knife"},
  (g, t, info) => hangScene(g, t, cam(t, info, { z0: 1.35, z1: 1.0, x0: 180, x1: -60, y0: 120, y1: 0 }), { shAlpha: clamp(t / 0.6) * 0.96, shPose: KNIFE_UP, knifeAng: -1.5 }));
S('004', {"bars": "scope", "amb": ["wind", -18], "sfx": [["heartbeat", 0.0, -8]], "scene": "big face: you, terrified"}, (g, t, info) => {
  closeup(g, t, info, { mood: 'dusk', bg: (g) => roof(g, t, { z: 1.6, x: 300, y: 80 }, {}), expr: [[0, 'worried'], [0.9, 'scared']], look: [-0.7, 0], r: 300, rimSide: 1, shake: 1.5 });
});
S('005', {"bars": "scope", "amb": ["wind", -18], "scene": "the knife is not aimed at Emma"},
  (g, t, info) => hangScene(g, t, cam(t, info, { z0: 1.25, z1: 1.32, x0: -60, x1: -20, y0: 60, y1: 60 }), { shPose: KNIFE_FWD, knifeAng: 0.3, shX: E.W / 2 + 420 - 520 }));
S('006', {"bars": "scope", "amb": ["wind", -18], "in": "whip", "sfx": [["swish", 0.05, -8], ["hit", 0.3, -10]], "scene": "it turns: the blade points at YOU"}, (g, t, info) => {
  const k = ease.out(prog(t, 0, 0.4));
  hangScene(g, t, cam(t, info, { z0: 1.55, z1: 1.75, x0: 60, x1: 90, y0: 120, y1: 130, shake: 3 * (1 - k) }), { shPose: KNIFE_DOWN, knifeAng: lerp(0.3, 0.75, k), shX: E.W / 2 + 420 - 430, heroExpr: 'shocked' });
});
S('007', {"bars": "scope", "amb": ["wind", -18], "sfx": [["stinger", 0.0, -5]], "scene": "big face scream"}, (g, t, info) => {
  closeup(g, t, info, { mood: 'dusk', bg: (g) => roof(g, t, { z: 1.8, x: -200, y: 60 }, {}), expr: 'shocked', r: 340, shake: 7, grow: 0.12, noBlink: true });
  FX.rings(g, E.W / 2, E.H * 0.7, t, { count: 3, r0: 200, r1: 700, color: '#ffffff', a: 0.25, speed: 2 });
});
S('008', {"bars": "scope", "amb": ["wind", -18], "sfx": [["riser", 0, -8], ["flash", 1.25, -6]], "scene": "low angle: the shadow raises its knife against the sun"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.12, x0: 0, x1: 0 }), M = mood('dusk');
  layer(g, c, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.sun(g, E.W * 0.62, E.H * 0.5, 90, '#fff0d8', M.key, 6); FX.godRays(g, E.W * 0.62, E.H * 0.5, { angle: Math.PI * 1.5, spread: 6, count: 14, len: 1400, a: 0.08, t }); });
  const raise = ease.inOut(prog(t, 0.1, 1.2));
  layer(g, c, 1, (g) => {
    g.fillStyle = '#0a0610'; g.fillRect(-E.W, E.H * 0.92, E.W * 3, E.H);
    const p = { ...KNIFE_UP, eF: [lerp(36, 20, raise), lerp(-160, -214, raise)], hF: [lerp(72, 26, raise), lerp(-140, -270, raise)] };
    shadow(g, { x: E.W * 0.46, y: E.H * 0.98, s: 3.4, facing: 1, pose: p, mode: 'wall', knife: true, knifeAng: lerp(0.4, -1.6, raise), alpha: 1 });
  });
  if (t > info.dur - 0.15) veil(g, '#ffffff', prog(t, info.dur - 0.15, info.dur));
});
S('009', {"bars": "scope", "in": "dip", "sfx": [["impact", 0.05, -8]], "scene": "title: THREE DAYS EARLIER"}, (g, t, info) => card(g, t, info, 'THREE DAYS EARLIER', { size: 84 }));

// ---------- DAY ONE ----------
const day = (g, t, c, o = {}) => apt(g, t, c, { mood: 'interiorWarm', day: true, kind: 'bedroom', bedX: E.W / 2 - 420, ...o });
const WAKE = { ...POSES.sit, head: [8, -176] };
S('010', {"in": "dip", "amb": ["roomtone", -24], "sfx": [["phonering", 0.1, -16]], "scene": "bedroom morning: you jerk awake, alarm ringing"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.45, z1: 1.55, x0: -170, x1: -190, y0: 120, y1: 120 }); const r = day(g, t, c);
  layer(g, c, 1, (g) => {
    const lying = t < 0.5; const bx = E.W / 2 - 420;
    person(g, t, r.M, { x: bx + 160, y: r.GY - 72, s: 1.1, facing: 1, pose: lying ? { ...POSES.lie } : WAKE, rot: lying ? -Math.PI / 2 : 0, expr: lying ? 'sleepy' : 'shocked', contact: false });
    g.fillStyle = '#4a4a90'; rr(g, bx + 150, r.GY - 110, 360, 44, 16); g.fill();
    FX.clock(g, bx + 640, r.GY - 200, 34, 8 * 3600 + 47 * 60 + t * 60, { face: '#f2ece0' }); text(g, '8:47', bx + 640, r.GY - 250, { size: 26, color: '#ff6a5a', font: 'Nunito', weight: 900 });
  });
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
});
S('011', {"amb": ["roomtone", -24], "scene": "bathroom mirror: brushing teeth, shadow copies on the wall"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.2, z1: 1.26, x0: 100, x1: 60 }); const r = apt(g, t, c, { mood: 'interiorWarm', day: true, kind: 'none', window: false });
  const brush = (t) => ({ ...POSES.phone, hF: [30 + Math.sin(t * 22) * 6, -186] });
  layer(g, c, 1, (g) => {
    const x = E.W / 2 + 40; g.fillStyle = '#d8d4e0'; rr(g, x + 90, r.GY - 200, 220, 40, 8); g.fill(); seg(g, [[x + 200, r.GY - 160], [x + 200, r.GY]], 30, '#b8b4c4');
    rr(g, x + 110, r.GY - 520, 180, 240, 10); g.fillStyle = '#2a3048'; g.fill();
    person(g, t, r.M, { x, y: r.GY, s: 1.35, facing: 1, pose: brush(t), expr: 'sleepy', sh: { mode: 'wall', dx: -260, s: 1.6, alpha: 0.78 } });
    const hx = x + 30 * 1.35, hy = r.GY - 186 * 1.35; seg(g, [[hx, hy], [hx + 40, hy - 6]], 6, '#5fb8e8');
  });
});
S('012', {"amb": ["roomtone", -24], "sfx": [["footstep", 0.6, -14]], "scene": "putting on shoes by the door"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.35, z1: 1.42, x0: 360, x1: 330, y0: 120, y1: 130 }); const r = apt(g, t, c, { mood: 'interiorWarm', day: true, kind: 'living' });
  layer(g, c, 1, (g) => { person(g, t, r.M, { x: E.W / 2 + 420, y: r.GY, s: 1.3, facing: 1, poses: [[0, 'crouch'], [0.7, { ...POSES.crouch, hF: [44, -40] }]], expr: 'neutral', sh: { kx: -0.4, ky: 0.25 } }); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
});
S('013', {"amb": ["city", -24], "sfx": [["footstep", 0.2, -16], ["footstep", 0.75, -16]], "scene": "street morning: you walk out of your building"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1, z1: 1.04, x0: -100, x1: 0 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => { person(g, t, r.M, { x: E.W / 2 - 380, y: r.GY - 30, s: 1.05, facing: 1, walk: { speed: 160 }, expr: 'neutral', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58 } }); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
});
const walkDay = (g, t, info, o = {}) => {
  const sp = 160, x0 = E.W / 2 - 200; const c = cam(t, info, { z0: o.z ?? 1.1, z1: (o.z ?? 1.1) + 0.04, x0: (o.cx ?? 0) + sp * 0, x1: (o.cx ?? 0) + sp * info.dur, y0: o.cy ?? 0, y1: o.cy ?? 0 });
  const r = street(g, t, c, {});
  layer(g, c, 1, (g) => { o.draw?.(g, r, x0, sp); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.3 });
  return r;
};
S('014', {"amb": ["city", -24], "scene": "everything seems normal: walking, long morning shadow"}, (g, t, info) => walkDay(g, t, info, { z: 1.0, draw: (g, r, x0) => person(g, t, r.M, { x: x0, y: r.GY - 30, s: 1.05, facing: 1, walk: { speed: 160 }, expr: 'smile', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58 } }) }));
S('015', {"amb": ["city", -24], "sfx": [["shimmer", 0.3, -14]], "scene": "something strange: you glance down"}, (g, t, info) => walkDay(g, t, info, { z: 1.6, cy: 140, cx: -100, draw: (g, r, x0) => person(g, t, r.M, { x: x0, y: r.GY - 30, s: 1.05, facing: 1, walk: { speed: 160 }, expr: [[0, 'neutral'], [0.8, 'confused']], look: [0.3, 0.9], sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58 } }) }));
S('016', {"amb": ["city", -24], "sfx": [["stinger", 0.1, -10]], "scene": "on the pavement: your shadow WAVES while you walk"}, (g, t, info) => walkDay(g, t, info, { z: 2.0, cy: 260, cx: 140, draw: (g, r, x0) => person(g, t, r.M, { x: x0, y: r.GY - 30, s: 1.05, facing: 1, walk: { speed: 160 }, expr: 'neutral', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 582, pose: wavePose } }) }));
S('017', {"amb": ["city", -24], "scene": "you are not waving"}, (g, t, info) => walkDay(g, t, info, { z: 1.45, cy: 120, cx: 0, draw: (g, r, x0) => person(g, t, r.M, { x: x0, y: r.GY - 30, s: 1.05, facing: 1, walk: { speed: 160 }, expr: 'confused', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58, pose: wavePose } }) }));
S('018', {"amb": ["city", -24], "sfx": [["footstep", 0.3, -12]], "scene": "you stop walking"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.3, z1: 1.36, x0: 0, x1: 20, y0: 80, y1: 80 }); const r = street(g, t, c, {}); const stop = 0.45;
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 120 + 160 * Math.min(t, stop), y: r.GY - 30, s: 1.05, facing: 1, pose: t < stop ? walkPose(t * 5.6) : breathe(POSES.stand, t), expr: 'worried', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58, pose: t < stop + 0.35 ? walkPose(t * 5.6) : POSES.stand } }));
});
S('019', {"amb": ["city", -24], "sfx": [["footstep", 0.15, -18]], "scene": "it stops too — a beat late"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.9, z1: 1.95, x0: 160, x1: 170, y0: 250, y1: 250 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 50, y: r.GY - 30, s: 1.05, facing: 1, poses: 'stand', expr: 'worried', look: [0.5, 1], sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58, pose: t < 0.3 ? walkPose(t * 5.6) : POSES.stand } }));
});
const RAISE_R = { ...POSES.wave, eF: [24, -200], hF: [30, -244] };
const RAISE_FAR = { ...POSES.stand, eB: [-20, -200], hB: [-26, -244] };
S('020', {"amb": ["city", -24], "scene": "test: you raise your right hand"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.5, z1: 1.55, x0: 80, x1: 60, y0: 160, y1: 160 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 50, y: r.GY - 30, s: 1.05, facing: 1, poses: [[0, 'stand'], [0.3, RAISE_R]], expr: 'thinking', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58, poses: [[0, POSES.stand], [0.3, RAISE_R]] } }));
});
S('021', {"amb": ["city", -24], "sfx": [["stinger", 0.4, -10]], "scene": "the shadow raises its LEFT — the wrong one"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.9, z1: 2.0, x0: 200, x1: 220, y0: 250, y1: 250 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 50, y: r.GY - 30, s: 1.05, facing: 1, pose: RAISE_R, expr: 'surprised', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58, poses: [[0, RAISE_R], [0.5, RAISE_FAR]] } }));
});
S('022', {"amb": ["city", -24], "scene": "you laugh it off"}, (g, t, info) => closeup(g, t, info, { mood: 'golden', bg: (g) => street(g, t, { z: 1.5, x: 100 }, {}), expr: 'happy', r: 290, shake: 2.5, rimSide: -1, rim: '#ffcf8f' }));
S('023', {"amb": ["city", -24], "scene": "just tired: rubbing your eyes"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.4, z1: 1.46, x0: 40, x1: 20, y0: 120, y1: 120 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 50, y: r.GY - 30, s: 1.05, facing: 1, poses: 'facepalm', expr: 'sleepy', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58 } }));
});
S('024', {"amb": ["city", -24], "sfx": [["swish", 0.2, -16]], "scene": "you turn around"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.2, z1: 1.18, x0: 0, x1: -60, y0: 80, y1: 80 }); const r = street(g, t, c, {}); const turned = t > 0.35;
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2 - 50 - (turned ? 160 * (t - 0.35) : 0), y: r.GY - 30, s: 1.05, facing: turned ? -1 : 1, pose: turned ? walkPose((t - 0.35) * 5.6) : POSES.stand, expr: 'neutral', sh: { x: E.W / 2 - 50, kx: 1.4, ky: 0.2, facing: 1, pose: POSES.stand } }));
});
S('025', {"amb": ["city", -24], "sfx": [["stinger", 0.3, -8]], "scene": "you walk away — your shadow stays where it is"}, (g, t, info) => {
  const c = cam(t, info, { z0: 1.0, z1: 1.08, x0: -120, x1: -160, y0: 40, y1: 60 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => {
    const x = E.W / 2 - 220 - 160 * t;
    person(g, t, r.M, { x, y: r.GY - 30, s: 1.05, facing: -1, walk: { speed: 0 }, pose: walkPose(t * 5.6), expr: 'neutral', sh: false });
    shadow(g, { x: E.W / 2 + 140, y: r.GY - 58, s: 1.05, facing: 1, pose: POSES.stand, mode: 'wall', alpha: 0.82 });
    g.fillStyle = 'rgba(0,0,0,.0)';
  });
});
S('026', {"amb": ["city", -24], "sfx": [["heartbeat", 0.1, -12]], "scene": "big face: you stare at it"}, (g, t, info) => closeup(g, t, info, { mood: 'golden', bg: (g) => street(g, t, { z: 1.6, x: -150 }, {}), expr: 'worried', look: [0.8, 0.6], r: 300, rimSide: -1, rim: '#ffcf8f', tilt: -0.05 }));
// from here the shadow stands UP on the building wall behind the pavement
const wallShadow = (g, t, info, o = {}) => {
  const c = cam(t, info, { z0: o.z0 ?? 1.3, z1: o.z1 ?? 1.4, x0: o.x0 ?? 0, x1: o.x1 ?? 0, y0: o.y ?? 60, y1: o.y ?? 60, shake: o.shake }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => { o.draw?.(g, r); });
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 }); return r;
};
S('027', {"amb": ["city", -24], "sfx": [["glitch", 0.2, -14]], "scene": "it stares back: the shadow peels up onto the wall and tilts its head"}, (g, t, info) => wallShadow(g, t, info, { z0: 1.5, z1: 1.7, x0: 260, x1: 260, y: 40, draw: (g, r) => {
  const up = ease.inOut(prog(t, 0, 0.9));
  shadow(g, { x: E.W / 2 + 260, y: r.GY - 60, s: 1.15, facing: -1, pose: { ...POSES.stand, head: [3 + up * 8, -206 + up * 4] }, mode: up < 0.5 ? 'floor' : 'wall', kx: 0.4 * (1 - up), ky: 0.2 + 0.8 * up });
} }));
S('028', {"amb": ["city", -26], "scene": "close on its head: no eyes at all"}, (g, t, info) => wallShadow(g, t, info, { z0: 3.0, z1: 3.3, x0: 270, x1: 260, y: 20, draw: (g, r) => {
  shadow(g, { x: E.W / 2 + 260, y: r.GY - 60, s: 1.15, facing: -1, pose: { ...POSES.stand, head: [11 + Math.sin(t * 0.8) * 3, -202] }, mode: 'wall' });
} }));
S('030', {"amb": ["city", -26], "sfx": [["riser", 0.2, -12]], "scene": "big face: you know it's watching"}, (g, t, info) => closeup(g, t, info, { mood: 'golden', bg: (g) => { street(g, t, { z: 1.4, x: 260 }, {}); shadow(g, { x: E.W / 2 + 120, y: E.H * 0.8, s: 2.2, facing: -1, pose: POSES.stand, mode: 'wall' }); }, x: E.W * 0.36, expr: 'scared', look: [1, 0], r: 280, rimSide: -1, rim: '#ffcf8f' }));
S('031', {"amb": ["city", -26], "sfx": [["footstep", 0.4, -12]], "scene": "you take one step back"}, (g, t, info) => wallShadow(g, t, info, { z0: 1.2, z1: 1.22, x0: 120, x1: 100, draw: (g, r) => {
  const k = ease.inOut(prog(t, 0.2, 0.9));
  shadow(g, { x: E.W / 2 + 300, y: r.GY - 60, s: 1.15, facing: -1, pose: POSES.stand, mode: 'wall' });
  person(g, t, r.M, { x: E.W / 2 - 80 - k * 70, y: r.GY - 30, s: 1.05, facing: 1, pose: k > 0 && k < 1 ? walkPose(-k * 3) : POSES.stand, expr: 'scared' });
} }));
S('032', {"amb": ["city", -26], "sfx": [["footstep", 0.5, -10, 0.7]], "scene": "it takes one step forward"}, (g, t, info) => wallShadow(g, t, info, { z0: 1.25, z1: 1.32, x0: 120, x1: 100, draw: (g, r) => {
  const k = ease.inOut(prog(t, 0.3, 1.1));
  shadow(g, { x: E.W / 2 + 300 - k * 90, y: r.GY - 60, s: 1.15, facing: -1, pose: k > 0 && k < 1 ? walkPose(k * 3) : POSES.stand, mode: 'wall' });
  person(g, t, r.M, { x: E.W / 2 - 150, y: r.GY - 30, s: 1.05, facing: 1, poses: 'stand', expr: 'shocked' });
} }));
S('033', {"amb": ["city", -24], "sfx": [["whoosh", 0.05, -8]], "scene": "you RUN"}, (g, t, info) => {
  const sp = 520, c = cam(t, info, { z0: 1.1, z1: 1.1, x0: -sp * 0.2, x1: -sp * info.dur * 0.8, shake: 3 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => person(g, t, r.M, { x: E.W / 2, y: r.GY - 30, s: 1.05, facing: -1, walk: { speed: sp, run: true }, expr: 'scared', sh: { mode: 'wall', dx: 190, alpha: 0.82, y: r.GY - 58 } }));
  FX.speedLines(g, t, { a: 0.12, inner: 500 });
});
S('034', {"amb": ["city", -24], "sfx": [["whoosh", 0.3, -10], ["glitch", 1.2, -14]], "scene": "it follows — sliding along the walls, unnatural"}, (g, t, info) => {
  const sp = 520, c = cam(t, info, { z0: 1.0, z1: 1.0, x0: 0, x1: -sp * info.dur, shake: 3 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => {
    const hx = E.W / 2 - 200 - sp * t; person(g, t, r.M, { x: hx, y: r.GY - 30, s: 1.05, facing: -1, pose: walkPose(t * 10), expr: 'scared', sh: false });
    const lag = 520 - Math.min(1, t / info.dur) * 360;
    shadow(g, { x: hx + lag, y: r.GY - 60, s: 1.25, facing: -1, pose: { ...walkPose(t * 10 + 1, { run: true }), head: [26, -200] }, mode: 'wall', skew: -0.25 });
  });
  FX.speedLines(g, t, { a: 0.12, inner: 500 });
});
S('036', {"amb": ["city", -24], "sfx": [["heartbeat", 0.1, -10]], "scene": "tracking: it runs right beside you"}, (g, t, info) => {
  const sp = 520, c = cam(t, info, { z0: 1.35, z1: 1.4, x0: 0, x1: -sp * info.dur, y0: 80, y1: 80, shake: 2.5 }); const r = street(g, t, c, {});
  layer(g, c, 1, (g) => {
    const hx = E.W / 2 + 80 - sp * t;
    shadow(g, { x: hx - 60, y: r.GY - 60, s: 1.2, facing: -1, pose: walkPose(t * 10 + 0.4, { run: true }), mode: 'wall' });
    person(g, t, r.M, { x: hx, y: r.GY - 30, s: 1.05, facing: -1, pose: walkPose(t * 10, { run: true }), expr: 'scared', look: [-1, 0], sh: false });
  });
});
