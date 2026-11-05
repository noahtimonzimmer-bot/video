// <TITLE> — Shots. Muster: examples/shots/*.js. Meta = striktes JSON.
import { E, layer, ease, prog, clamp, lerp, seg, circle, ring, poly, glow, alpha, shade, mix, text, rr, linGrad, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import { S } from '../lib.js';
import { closeUp, finish, label } from '../lib2.js';
import { parchment, cosmic } from '../sets/ill.js';
import { calendar } from '../creatures.js';
import { CAST, OL, cloud } from '../toon.js';
import { scatter, wallProp } from '../props.js';

const SX = (n) => 'input/sfx/' + n + '.wav';
const big = (g, t, str, y, o = {}) => label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 });

// ---------- Welten (wiederverwendbar → nach dem Video in templates/ zurückführen) ----------
function world(T, o = {}) {
  const st = A.stage(T, { sky: ['#6aaee8', '#b8d8ee', '#f6e8c8'] });
  A.flatGround(st, 800, W.grassTex(T, '#8ab05a', [60, 60]));
  // Dichte-Budget (reference/style.md): Gebäude, 500+ Gras, Bäume, Props, Tiere, Rauch, Vögel, Menschen
  scatter(st, 'grass', 500, (r) => [-150 + r() * 300, 0, -150 + r() * 200], 2.6);
  return st;
}

S('000', {"bars": "none", "scene": "HOOK — spektakulärstes Bild zuerst"}, { kind: '3d', init(T) { const st = world(T); const p = A.livePerson(st, 2.6, 'adam'); return { stage: A.finish(T, st), p }; }, draw(s, t, info, T) { s.p.update(t, { pose: walkPose(t * 10), facing: 1, expr: 'determined' }); T.dolly(s.stage.camera, t, [[0, { pos: [0, 5, 20], look: [0, 3, 0], fov: 60 }], [info.dur, { pos: [0, 6, 15], look: [0, 3, 0], fov: 60 }]]); }, overlay: (g, t) => big(g, t, 'HOOK TITLE', E.H * 0.15) });
