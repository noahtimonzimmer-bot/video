// lib2.js — shot helpers for the illustrated style: actors, close-ups, talk timing, captions.
import { E, layer, ease, prog, clamp, lerp, shake, text, alpha, rr, glow } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { toonFigure, CAST, paper } from './toon.js';
export { POSES };
export const cam = (t, info, o = {}) => { const k = ease.inOut(t / info.dur); const c = { z: lerp(o.z0 ?? 1, o.z1 ?? 1.06, k), x: lerp(o.x0 ?? 0, o.x1 ?? -25, k), y: lerp(o.y0 ?? 0, o.y1 ?? 0, k) }; if (o.shake) { const [a, b] = shake(t, o.shake, o.freq ?? 6); c.x += a; c.y += b; } return c; };
const pick = (t, v) => (Array.isArray(v) && Array.isArray(v[0]) ? v.reduce((a, [tt, x]) => (t >= tt ? x : a), v[0][1]) : v);
export const talkAt = (t, span) => (span && t > span[0] && t < span[1] ? clamp(0.35 + 0.65 * Math.abs(Math.sin(t * 15)) * (0.6 + 0.4 * Math.sin(t * 4.3))) : 0);
// actor(g, t, {who, x, y, s, facing, poses|pose, walk:{speed, run}, expr, talk:[a,b]})
export function actor(g, t, o) {
  let x = o.x, pose;
  if (o.walk) { x = o.x + (o.walk.speed ?? 150) * t * (o.facing ?? 1); pose = walkPose(t * 2 * Math.PI * (o.walk.run ? 1.6 : 0.9), { run: !!o.walk.run }); }
  else pose = o.pose || breathe(Array.isArray(o.poses) ? posesAt(t, o.poses) : POSES[o.poses || 'stand'] || o.poses, t, 1, o.seed ?? 0);
  toonFigure(g, { x, y: o.y, s: o.s ?? 1.4, facing: o.facing ?? 1, pose, who: typeof o.who === 'string' ? CAST[o.who] : o.who, expr: pick(t, o.expr || 'neutral'), talk: talkAt(t, o.talk), blink: (t + (o.seed ?? 0)) % 3.4 > 3.28, rot: o.rot, prop: o.prop });
  return { x, pose };
}
// big close-up: same figure scaled up so the head fills the frame (feet off-screen)
export function closeUp(g, t, info, o) {
  if (o.bg) o.bg(g); const k = ease.inOut(t / info.dur), s = (o.s ?? 3.6) * (1 + (o.grow ?? 0.05) * k), [sx, sy] = o.shake ? shake(t, o.shake, 8) : [0, 0];
  toonFigure(g, { x: (o.x ?? E.W / 2) + sx, y: E.H * 0.5 + 226 * 1.05 * s + (o.dy ?? 40) + sy, s, facing: o.facing ?? 1, pose: o.pose || breathe(POSES.stand, t, 0.6), who: typeof o.who === 'string' ? CAST[o.who] : o.who, expr: pick(t, o.expr || 'neutral'), talk: talkAt(t, o.talk), blink: !o.noBlink && t % 3.4 > 3.28, shadow: false });
  o.front?.(g);
}
export function finish(g, t) { paper(g, t, 0.05); }
export function rings(g, x, y, t, col = '#ffffff') { FX.rings(g, x, y, t, { count: 3, r0: 50, r1: 160, color: col, a: 0.55 }); }
export function label(g, t, str, x, y, o = {}) { const a = clamp(Math.min((t - (o.at ?? 0)) / 0.3, ((o.dur ?? 99) - t) / 0.3)); if (a <= 0) return; const s = ease.outBack(clamp((t - (o.at ?? 0)) / 0.35)); g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); text(g, str, 0, 0, { size: o.size || 64, color: o.color || '#fff2c8', font: 'Fredoka', weight: 700, spacing: 4, stroke: o.stroke ?? 12, strokeColor: '#3a2a22' }); g.restore(); }
