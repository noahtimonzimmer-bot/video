// lib.js — the living shadow: an ink-black silhouette that can be cast on the floor or on a wall,
// with its own pose (it does NOT have to copy its owner), optional knife and white crack smile.
import { E, V, mood, layer, blurLayer, alpha, shade, mix, seg, circle, poly, glow, clamp, lerp, ease, noise } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';

export const SHC = '#050308';                                  // shadow ink
export const silOf = (of) => ({ ...of, color: SHC, headColor: SHC, color2: SHC, legs: null, face: null });

// draw the figure silhouette in local space, then extras (knife, crack) in the same space
function silhouette(g, o) {
  const c = o.color || SHC;
  drawFigure(g, { x: 0, y: 0, s: 1, facing: o.facing ?? 1, pose: o.pose, outfit: silOf(o.outfit || {}), ink: c, inkFar: c, rim: false, shadow: false, noFace: true });
  const f = o.facing ?? 1, p = o.pose;
  if (o.knife) { // blade from the near hand
    const [hx, hy] = p.hF, a = o.knifeAng ?? -1.2;
    g.save(); g.translate(hx * f, hy); g.scale(f, 1); g.rotate(a);
    poly(g, [[-4, -6], [70, -3], [92, 0], [70, 6], [-4, 6]], c);
    seg(g, [[6, -3], [86, -1]], 1.6, alpha('#d8e4ff', 0.75 * (o.glint ?? 1)));
    g.fillStyle = c; g.fillRect(-22, -8, 22, 16); g.restore();
  }
  if (o.crack) { // thin white crack smile across the head
    const [hx, hy] = p.head, k = clamp(o.crack);
    g.save(); g.translate(hx * f, hy);
    const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10 * k; pts.push([(-22 + u * 44), 4 + Math.sin(u * Math.PI) * 9 + (i % 2 ? -2.5 : 2)]); }
    if (pts.length > 1) { g.shadowColor = '#ffffff'; g.shadowBlur = 10; seg(g, pts, 2.4, '#f4f2ff'); }
    g.restore();
  }
  if (o.eyes) { const [hx, hy] = p.head; g.save(); g.translate(hx * f, hy); for (const dx of [-7, 9]) { circle(g, dx, -4, 3, alpha('#f4f2ff', o.eyes)); } g.restore(); }
}

// shadow(g, {x, y, s, facing, pose, outfit, mode:'floor'|'wall', kx, ky, alpha, knife, crack, blur})
//  floor: projected flat on the ground away from the light (kx = horizontal lean, ky = depth squash)
//  wall: upright on a wall (y = where its feet are), optionally scaled up (lamp on the floor)
export function shadow(g, o) {
  g.save(); g.globalAlpha *= o.alpha ?? 0.92;
  g.translate(o.x, o.y); const s = o.s ?? 1;
  if ((o.mode || 'floor') === 'floor') g.transform(s, 0, -(o.kx ?? 0.5) * s, -(o.ky ?? 0.32) * s, 0, 0);
  else { g.scale(s, s); if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0); }
  silhouette(g, o); g.restore();
}

export const wavePose = (t) => { const k = 0.5 + 0.5 * Math.sin(t * 9); return { ...POSES.wave, hF: [36 + k * 18, -236 + k * 6], eF: [28 + k * 6, -196] }; };
export const knock = (t, start = 0, n = 3) => { const u = (t - start) * 3; const on = u > 0 && u < n; const k = on ? Math.abs(Math.sin(u * Math.PI)) : 0; return { ...POSES.point, hF: [56 + k * 22, -176], eF: [30, -168] }; };
export const flicker = (t, seed = 1, rate = 7) => { const n = noise(t * rate, seed); return n > 0.35 ? 0.15 : n > 0.2 ? 0.55 : 1; };

// ---------- shot registration: S('012', {meta json}, draw) -> shot id 'c012' (timing from story/plan) ----------
import { registerShot, veil, prog, key as keyf, shake as shk, rr, ring, text, linGrad } from '/engine/core.js';
import { bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { HERO, EMMA } from './cast.js';
export function S(id, meta, draw) { registerShot('c' + id, typeof draw === 'function' ? { draw } : draw); }

// camera: push-in from z0 to z1 and drift x0 -> x1 over the shot
export const cam = (t, info, o = {}) => { const k = ease.inOut(t / info.dur); const c = { z: lerp(o.z0 ?? 1, o.z1 ?? 1.07, k), x: lerp(o.x0 ?? 0, o.x1 ?? -30, k), y: lerp(o.y0 ?? 0, o.y1 ?? 0, k), r: o.r ?? 0 }; if (o.shake) { const [a, b] = shk(t, o.shake, o.freq ?? 6); c.x += a; c.y += b; } return c; };
export const rimOf = (M, dir = [0.8, -0.4]) => ({ color: M.rim, dir, w: 4 });
const exprAt = (t, e) => (Array.isArray(e) ? e.reduce((a, [tt, v]) => (t >= tt ? v : a), e[0][1]) : e);
// person(g, t, M, {who:'hero'|'emma'|outfit, x, y, s, facing, poses, walk:{speed, run}, expr, look, talk, sh:{...}, prop})
export function person(g, t, M, o) {
  const outfit = o.who === 'emma' ? EMMA : o.who === 'hero' || !o.who ? HERO : o.who;
  let x = o.x, pose;
  if (o.walk) { const sp = o.walk.speed ?? 160, run = !!o.walk.run; x = o.x + sp * t * (o.facing ?? 1); pose = walkPose(t * 2 * Math.PI * (run ? 1.6 : 0.9) + (o.walk.ph ?? 0), { run }); }
  else pose = breathe(Array.isArray(o.poses) ? posesAt(t, o.poses) : (typeof o.poses === 'object' && o.poses ? o.poses : POSES[o.poses || 'stand']), t, 1, o.seed ?? 0);
  if (o.pose) pose = o.pose;
  const s = o.s ?? 1.2, y = o.y;
  if (o.sh && o.sh !== false) { // cast shadow (copies the owner unless sh.pose/sh.poses given)
    const sh = o.sh; let sp = pose;
    if (sh.poses) sp = posesAt(t, sh.poses); if (sh.pose) sp = typeof sh.pose === 'function' ? sh.pose(t) : sh.pose;
    if (sh.walk) sp = walkPose(t * 2 * Math.PI * (sh.walk.run ? 1.6 : 0.9) + (sh.walk.ph ?? 0), { run: !!sh.walk.run });
    shadow(g, { x: (sh.x ?? x) + (sh.dx ?? 0), y: sh.y ?? y, s: sh.s ?? s, facing: sh.facing ?? o.facing ?? 1, pose: sp, outfit, mode: sh.mode || 'floor', kx: sh.kx, ky: sh.ky, alpha: sh.alpha, knife: sh.knife, crack: sh.crack, knifeAng: sh.knifeAng, skew: sh.skew });
  }
  drawFigure(g, { x, y, s, facing: o.facing ?? 1, pose, outfit, expr: exprAt(t, o.expr || 'neutral'), look: o.look, talk: o.talk ? talkAmountLocal(t, o.talk) : 0, blink: (t + (o.seed ?? 0)) % 3.3 > 3.18, rim: o.rim ?? rimOf(M, o.rimDir), prop: o.prop, rot: o.rot, dim: o.dim, alpha: o.alpha, shadow: o.contact ?? true });
  return { x, y, s, pose, head: headPos({ x, y, s, facing: o.facing ?? 1, pose, outfit }) };
}
const talkAmountLocal = (t, [a, b]) => (t < a || t > b ? 0 : clamp(0.3 + 0.7 * Math.abs(Math.sin(t * 15)) * (0.6 + 0.4 * Math.sin(t * 4.3))));

// giant face close-up over a blurred, darkened background
export function closeup(g, t, info, o) {
  if (o.bg) { blurLayer(g, o.blur ?? 12, (g) => o.bg(g)); veil(g, '#06040a', o.veil ?? 0.4); }
  const M = mood(o.mood || 'night'), r = (o.r ?? 300) * (1 + (o.grow ?? 0.05) * t / Math.max(1, info.dur));
  const [sx, sy] = o.shake ? shk(t, o.shake, 8) : [0, 0];
  o.behind?.(g, r);
  bigFace(g, (o.x ?? E.W / 2) + sx, (o.y ?? E.H * 0.6) + sy, r, { outfit: o.who === 'emma' ? EMMA : HERO, expr: exprAt(t, o.expr || 'neutral'), look: o.look, talk: o.talk ? talkAmountLocal(t, o.talk) : 0, blink: !o.noBlink && t % 3.1 > 3.0, rimColor: o.rim || M.rim, rimSide: o.rimSide ?? 1, tilt: o.tilt });
  o.front?.(g, r);
}
// title / text card on black
export function card(g, t, info, str, o = {}) {
  veil(g, '#000', 1); const a = clamp(Math.min(t / 0.35, (info.dur - t) / 0.35));
  const sz = o.size ?? 92, k = 1 + 0.04 * t / info.dur;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(k, k);
  text(g, str, 0, 0, { size: sz, color: o.color || '#f2ecf6', font: 'Fredoka', weight: 700, spacing: 8, glow: 30, glowColor: o.glowC || 'rgba(200,40,40,.8)', alpha: a });
  g.restore();
}
// big white hand (insert shots): capsule arm from off-screen to (x,y), angle a, closed fist or open
export function bigHand(g, x, y, s, ang, o = {}) {
  const ink = o.color || '#eeeaf2', sleeve = o.sleeve;
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  if (o.rim) { g.save(); g.translate(-4, -4); seg(g, [[-900, 0], [0, 0]], 64, o.rim); circle(g, 30, 0, 52, o.rim); g.restore(); }
  seg(g, [[-900, 0], [0, 0]], 60, ink); if (sleeve) seg(g, [[-900, 0], [-120, 0]], 78, sleeve);
  circle(g, 30, 0, 50, ink);
  if (!o.closed) for (const [dy, l] of [[-34, 80], [-12, 92], [12, 88], [34, 74]]) seg(g, [[50, dy], [50 + l, dy * 1.15]], 22, ink);
  else for (const dy of [-30, -10, 10, 30]) circle(g, 72, dy, 15, ink);
  seg(g, [[20, -40], [60, -80]], 22, ink);
  g.restore();
}
