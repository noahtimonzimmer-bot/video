// <TITLE> — shots as flowing SEQUENCES (1 shot = 2–4 cues). Muster: examples/shots/olga_sequences.js. Meta = striktes JSON.
import { E, ease, clamp, lerp, seg, circle, ring, poly, glow, alpha, text, rr, linGrad, rng, shake } from '/engine/core.js';
import { POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import * as A from '../aerial.js';
import * as R from '../rus.js';
import * as SKY from '../sky.js';
import * as L from '../life.js';
import { S } from '../lib.js';
import { finish, label } from '../lib2.js';
import { CAST, OL, toonFigure } from '../toon.js';
import { scatter, PROPS } from '../props.js';

// Cue-Startzeiten aus input/script.json einsetzen (python3 -c "import json;print([c['start'] for c in json.load(open('input/script.json'))])")
const CUE = [1.0];
const st0 = (c) => (c === 0 ? 0 : CUE[c] - 0.12), rel = (c0, c) => CUE[c] - st0(c0);
const big = (g, t, str, y, o = {}) => { if (o.dur !== undefined && t > (o.at ?? 0.15) + o.dur) return; label(g, t, str, E.W / 2, y ?? E.H * 0.2, { at: o.at ?? 0.15, size: o.size || 110, color: o.color || '#fff2c8', stroke: 18 }); };
// jede 3D-Sequenz: Wind/Himmel/Vögel/Rauch/Leute leben automatisch
const S3 = (id, meta, o) => S(id, meta, { ...o, kind: '3d', draw(s, t, info, T) { L.tick(s.stage, t); o.draw(s, t, info, T); } });

function world(T, o = {}) {
  const st = SKY.stage(T, o.sky || 'sunset', { az: o.az ?? Math.PI / 2 });   // Sonne vor der Kamera (Kamera schaut nach -z)
  R.steppe(st, { trees: 240, birch: 80, tufts: 700, clear: (x, z) => Math.hypot(x, z) < 40 });
  scatter(st, 'bird', 24, (r) => [-150 + r() * 300, 50 + r() * 40, -150 + r() * 300], 3, { fog: false });
  // Dichte-Budget (reference/style.md) erfüllen!
  return st;
}

S3('000', {"bars": "none", "scene": "HOOK — spektakulärstes Bild zuerst, ein flüssiger Flug"}, {
  init(T) { const st = world(T); const hero = A.livePerson(st, 2.8, 'adam'); return { stage: A.finish(T, st), hero }; },
  draw(s, t, info, T) { const x = -6 + t * 1.6; s.hero.update(t, { pose: walkPose(t * 9), facing: 1, expr: 'determined' }); s.hero.sprite.position.set(x, 0, 0);
    L.glide(s.stage.camera, t, [[0, { pos: [x - 4, 4, 12], look: [x, 3, 0], fov: 52 }], [info.dur, { pos: [x + 2, 5, 10], look: [x + 1, 3, 0], fov: 50 }]]); },
  overlay: (g, t) => big(g, t, 'HOOK TITLE', E.H * 0.14) });
