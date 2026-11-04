// style test: illustrated 2D ground shot + painted mixed 2D/3D aerial
import { E, registerShot, layer, ease, linGrad, poly, seg, circle, alpha, shade, mix, rng, glow } from '/engine/core.js';
import { POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as W from '../world3d.js';
import { toonFigure, CAST, cloud, leafyTree, meadow, paper, OL } from '../toon.js';

function mountains(g, y, col, snow, seed, amp, step = 260) { const r = rng(seed); const pts = []; for (let x = -E.W; x <= E.W * 2; x += step) pts.push([x, y - (0.4 + r() * 0.6) * amp]); g.beginPath(); g.moveTo(-E.W, y + 400); for (let i = 0; i < pts.length; i++) { const [x, py] = pts[i]; g.lineTo(x - step / 2, y - amp * 0.15); g.lineTo(x, py); } g.lineTo(E.W * 2, y + 400); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = 3; g.strokeStyle = alpha(OL, 0.35); g.stroke(); for (const [x, py] of pts) { g.beginPath(); g.moveTo(x, py); g.lineTo(x + step / 2, y - amp * 0.15); g.lineTo(x + 30, y + 60); g.closePath(); g.fillStyle = 'rgba(40,40,90,.16)'; g.fill(); for (let k = 1; k < 4; k++) seg(g, [[x + k * 8, py + k * 22], [x + k * 22, py + k * 50]], 2, 'rgba(40,40,90,.12)'); } if (snow) for (const [x, py] of pts) { g.beginPath(); g.moveTo(x - 38, py + 34); g.lineTo(x, py); g.lineTo(x + 38, py + 34); g.lineTo(x + 18, py + 26); g.lineTo(x, py + 38); g.lineTo(x - 16, py + 26); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); } }
registerShot('st1', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1 + 0.06 * k, x: -20 * k }, GY = E.H * 0.62;
  layer(g, cam, 0.05, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, GY, ['#7ab4e8', '#b8dcf4', '#eef4e8']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); });
  layer(g, cam, 0.12, (g) => { cloud(g, 300, 160, 1.3, 1); cloud(g, 1500, 120, 1.6, 2); cloud(g, 950, 260, 0.9, 3); cloud(g, -100, 300, 1.0, 4); });
  layer(g, cam, 0.2, (g) => { mountains(g, GY - 40, '#a8bcd8', true, 3, 300); mountains(g, GY, '#8aa8c8', false, 7, 160, 200); });
  layer(g, cam, 0.35, (g) => { g.fillStyle = '#9ac86a'; g.beginPath(); g.moveTo(-E.W, GY); for (let x = -E.W; x <= E.W * 2; x += 60) g.lineTo(x, GY - 20 - Math.sin(x * 0.004) * 30); g.lineTo(E.W * 2, E.H); g.lineTo(-E.W, E.H); g.fill(); const r = rng(5); for (let i = 0; i < 60; i++) leafyTree(g, -E.W + r() * E.W * 3, GY - 10 + r() * 40, 0.18 + r() * 0.1, i, { leaf: ['#5a9a3a', '#6aaa4a', '#4a8a3a'][i % 3] }); g.fillStyle = '#8ad0f0'; g.beginPath(); g.moveTo(E.W * 0.62, GY + 10); g.quadraticCurveTo(E.W * 0.8, GY + 60, E.W * 1.4, GY + 70); g.lineTo(E.W * 1.4, GY + 100); g.quadraticCurveTo(E.W * 0.8, GY + 90, E.W * 0.6, GY + 18); g.fill(); });
  layer(g, cam, 0.7, (g) => { g.fillStyle = linGrad(g, 0, GY + 20, 0, E.H, ['#8ac05a', '#6aa83a', '#4a8a2a']); g.fillRect(-E.W, GY + 20, E.W * 3, E.H); g.fillStyle = '#c8a070'; g.beginPath(); g.moveTo(E.W / 2 - 30, GY + 20); g.lineTo(E.W / 2 + 30, GY + 20); g.lineTo(E.W / 2 + 330, E.H + 60); g.lineTo(E.W / 2 - 330, E.H + 60); g.fill(); for (const d of [-0.5, 0.5]) seg(g, [[E.W / 2 + d * 30, GY + 22], [E.W / 2 + d * 330, E.H + 60]], 6, '#a87a4a'); const r = rng(8); for (let i = 0; i < 70; i++) { const u = r(), y = GY + 30 + u * (E.H - GY), x = E.W / 2 + (r() - 0.5) * (40 + u * 520); circle(g, x, y, 2 + u * 5, shade('#c8a070', -0.2 - r() * 0.1)); } meadow(g, -E.W, E.W / 2 - 60, GY + 22, E.H + 40, 3, { n: 1600, flowers: 120 }); meadow(g, E.W / 2 + 60, E.W * 2, GY + 22, E.H + 40, 4, { n: 1600, flowers: 120 }); });
  layer(g, cam, 0.85, (g) => { leafyTree(g, E.W * 0.12, E.H * 0.86, 1.2, 11, { fruit: '#e04a3a' }); leafyTree(g, E.W * 0.9, E.H * 0.9, 1.4, 12, { fruit: '#f2a23a' }); });
  layer(g, cam, 1, (g) => {
    toonFigure(g, { x: E.W * 0.4, y: E.H * 0.9, s: 1.5, facing: 1, pose: breathe(posesAt(t, [[0, POSES.stand], [1.2, POSES.talk]]), t), who: CAST.adam, expr: 'happy', talk: t > 1.2 && t < 2.6 ? Math.abs(Math.sin(t * 14)) : 0 });
    toonFigure(g, { x: E.W * 0.6, y: E.H * 0.9, s: 1.45, facing: -1, pose: breathe(POSES.relaxed, t, 1, 2), who: CAST.eve, expr: 'smile', blink: t % 3.2 > 3.08 });
    // flower clumps in the foreground
    meadow(g, -200, E.W + 200, E.H * 0.94, E.H + 30, 9, { n: 300, flowers: 30 });
  });
  paper(g, t, 0.06);
} });
// painted aerial: river, stone bridge, patchwork fields, plaster houses; trees/clouds/people are 2D sprites
registerShot('st2', { kind: '3d', init(T) {
  const { THREE } = T, st = T.stage({ mood: 'golden', fov: 42, fog: [180, 700], fogColor: '#dceaf0', ambientSky: '#e8f2ff', keyColor: '#fff4e0', keyPos: [-40, 90, 30], keyIntensity: 2.2, ambient: 2.4, shadowSize: 140, sky: ['#7ab4e8', '#b8dcf4', '#eef4e8'] });
  st.sun.shadow.camera.far = 400; st.sun.shadow.camera.updateProjectionMatrix();
  const g0 = T.ground(1200, 1200, '#ffffff', W.grassTex(T, '#7ab84a', [60, 60])); g0.userData.noOutline = true; st.add(g0);
  const riv = T.plane(26, 1200, T.mat('#ffffff', { map: W.waterTex(T, [3, 40]) })); riv.rotation.x = -Math.PI / 2; riv.position.y = 0.12; riv.userData.noOutline = true; st.add(riv);
  for (const sx of [-1, 1]) { const bank = T.plane(4, 1200, T.mat('#c8a070')); bank.rotation.x = -Math.PI / 2; bank.position.set(sx * 15, 0.1, 0); bank.userData.noOutline = true; st.add(bank); }
  const fc = ['#c8b84a', '#9ac04a', '#e0c060', '#b8a840', '#8ab84a', '#d8a850'];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 14; j++) for (const sx of [-1, 1]) { const p = T.plane(17, 17, T.mat('#ffffff', { map: W.fieldTex(T, fc[(i * 3 + j + (sx > 0 ? 2 : 0)) % fc.length], (i + j) % 2 ? 'h' : 'v', i * 31 + j) })); p.rotation.x = -Math.PI / 2; p.position.set(sx * (30 + i * 18), 0.15, -120 + j * 18); p.userData.noOutline = true; st.add(p); }
  // stone bridge with painted bricks
  const sm = T.mat('#ffffff', { map: W.stoneTex(T, '#d8c4a0', [5, 1]) });
  st.add(T.box(40, 2.2, 7, sm, 0, 4.4, 30)); for (const sx of [-1, 1]) st.add(T.box(40, 1.2, 0.8, sm, 0, 6.1, 30 + sx * 3.1));
  for (const x of [-16, -6, 6, 16]) st.add(T.box(3, 4.4, 7, sm, x, 2.2, 30));
  for (const x of [-11, 0, 11]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.9, 8, 18, Math.PI), sm); ring.position.set(x, 1.0, 30); ring.scale.z = 4; st.add(ring); }
  // plaster houses with red roofs
  const r = rng(4); for (let i = 0; i < 16; i++) { const x = (r() < 0.5 ? -1 : 1) * (32 + r() * 60), z = 40 + r() * 70, w = 6 + r() * 4, d = 5 + r() * 3, h = 4 + r() * 2; st.add(T.box(w, h, d, T.mat('#ffffff', { map: W.plasterTex(T) }), x, h / 2, z)); const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 3, 4), T.mat(['#d85a4a', '#c84a3a', '#e07a4a'][i % 3])); roof.rotation.y = Math.PI / 4; roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); roof.position.set(x, h + 1.5, z); st.add(roof); }
  W.paintify(T, st.scene);
  // 2D billboards: trees along the banks, clouds, people on the bridge
  const treeKey = (i) => 'tree' + (i % 4);
  for (let i = 0; i < 140; i++) { const side = r() < 0.5 ? -1 : 1, x = side * (18 + r() * 140), z = -260 + r() * 260; const s = 7 + r() * 5; st.add(Object.assign(W.sprite(T, treeKey(i), s, s * 1.3, (g, Wd, H) => { g.save(); g.scale(Wd / 300, H / 390); leafyTree(g, 150, 385, 1.2, i % 4, { leaf: ['#5a9a3a', '#6aaa4a', '#4a8a3a', '#7aba5a'][i % 4], fruit: i % 3 ? null : '#e04a3a' }); g.restore(); }), {}).translateX(x).translateZ(z)); }
  for (let i = 0; i < 12; i++) { const c = W.sprite(T, 'cloud' + (i % 4), 80, 40, (g, Wd, H) => { g.save(); g.scale(Wd / 400, H / 200); cloud(g, 200, 170, 1.15, i % 4 + 1); g.restore(); }, { fog: false, cy: 0.5 }); c.position.set(-250 + i * 45, 70 + (i % 3) * 14, -250 - (i % 4) * 60); st.add(c); }
  const people = [CAST.king, CAST.moses, CAST.adam, CAST.eve, CAST.joseph];
  people.forEach((who, i) => { const sp = W.sprite(T, 'p' + i, 2.2, 3.4, (g, Wd, H) => { g.save(); g.scale(Wd / 140, H / 220); toonFigure(g, { x: 70, y: 214, s: 0.7, facing: i % 2 ? -1 : 1, pose: POSES.stand, who, expr: 'smile', shadow: false }); g.restore(); }, { px: 160 }); sp.position.set(-6 + i * 3, 5.5, 30); st.add(sp); });
  return { stage: st };
}, draw(s, t, info, T) { T.dolly(s.stage.camera, t, [[0, { pos: [0, 70, 150], look: [0, 0, -40] }], [info.dur, { pos: [0, 45, 105], look: [0, 3, 10] }]]); } });
