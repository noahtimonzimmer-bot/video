// life.js — REUSABLE ambient motion for painted 3D scenes. Call tick(st, t) every frame (first call indexes the scene).
// Wind in trees / grass / bushes (gusts travel across the land), drifting clouds, rising smoke, circling birds,
// breathing & swaying background people, pecking chickens, grazing horses, waving banners, shimmering water,
// and the painted sky (sky.js). Options: st.wind (default 1).
import * as SKY from './sky.js';
const KINDS = [
  ['tree', /^(tree\d|palm\d|prop_tree|prop_birch|prop_pine|prop_sakura)/], ['flutter', /^prop_(bill|petals)/], ['grass', /^prop_(grass|flowerbed)/], ['bush', /^prop_(bush|haystack)/],
  ['cloud', /^cloud/], ['smoke', /^prop_smoke/], ['bird', /^prop_bird/], ['person', /^person_/], ['small', /^prop_(chicken|dog|rat)/], ['horse', /^prop_horse/],
];
const hash = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };
function index(st) {
  const L = st.life = { flutter: [], tree: [], grass: [], bush: [], cloud: [], smoke: [], bird: [], person: [], small: [], horse: [], flag: [], water: [] };
  st.scene.traverse((o) => {
    if (o.userData.flag) L.flag.push(o); if (o.userData.water) L.water.push(o);
    if (!o.isSprite || !o.userData.key) return; const k = KINDS.find(([, re]) => re.test(o.userData.key)); if (!k) return;
    o.userData.b = { x: o.position.x, y: o.position.y, z: o.position.z, sx: o.scale.x, sy: o.scale.y, ph: hash(o.position.x, o.position.z) * 6.28 };
    if (k[0] === 'smoke') { o.material.transparent = true; o.material.depthWrite = false; }
    L[k[0]].push(o);
  });
}
// collision check: warns (console.error -> render log 'error') when a live person stands inside solid geometry
function solids(st) { const T = st.T, out = []; st.scene.updateMatrixWorld(true); st.scene.traverse((o) => { if (!o.isMesh || o.userData.noOutline || o.material?.side === T.THREE.BackSide) return; if (o.parent && o.parent.isMesh) return; const b = new T.THREE.Box3().setFromObject(o), sz = b.getSize(new T.THREE.Vector3()); if (b.max.y < 0.35 || Math.max(sz.x, sz.z) > 40 || Math.min(sz.x, sz.z) < 0.05) return; out.push(b); }); return out; }
export function checkPeople(st, t) { if (!st._solids) st._solids = solids(st); st._warned ||= new Set(); const T = st.T;
  st.scene.traverse((o) => { if (!o.isSprite || !o.userData.person || !o.visible || st._warned.has(o)) return; const r = o.userData.pw * 0.3, hs = o.userData.pw / 2.6; for (const y of [0.4, 1.2, 2.2, 3.0].map((v) => v * hs)) { const p = new T.THREE.Vector3(o.position.x, o.position.y + y, o.position.z); for (const b of st._solids) { const e = b, lo = b.max.y < 4.2 ? 0 : b.min.y; /* tops of tables/shelves occupy the space below them */ if (p.x > e.min.x - r && p.x < e.max.x + r && p.z > e.min.z - r && p.z < e.max.z + r && p.y > lo && p.y < e.max.y) { console.error(`ERROR COLLISION: person '${o.userData.person}' at (${o.position.x.toFixed(1)}, ${o.position.y.toFixed(1)}, ${o.position.z.toFixed(1)}) t=${t.toFixed(2)} inside box x[${b.min.x.toFixed(1)},${b.max.x.toFixed(1)}] y[${b.min.y.toFixed(1)},${b.max.y.toFixed(1)}] z[${b.min.z.toFixed(1)},${b.max.z.toFixed(1)}]`); st._warned.add(o); return; } } } }); }
export function tick(st, t) {
  if (!st.life) index(st); const L = st.life, w = st.wind ?? 1;
  const gust = (x, z) => 0.6 + 0.4 * Math.sin(t * 0.9 - x * 0.025 - z * 0.012);
  for (const o of L.tree) { const b = o.userData.b; o.material.rotation = (Math.sin(t * 1.4 + b.ph) * 0.03 + Math.sin(t * 3.3 + b.ph * 2) * 0.008) * w * gust(b.x, b.z); }
  for (const o of L.grass) { const b = o.userData.b; o.material.rotation = Math.sin(t * 2.6 + b.ph + b.x * 0.2) * 0.13 * w * gust(b.x, b.z); }
  for (const o of L.bush) { const b = o.userData.b; o.material.rotation = Math.sin(t * 1.8 + b.ph) * 0.035 * w * gust(b.x, b.z); }
  for (const o of L.cloud) { const b = o.userData.b; o.position.x = b.x + t * 2.5 * w; }
  for (const o of L.smoke) { const b = o.userData.b, k = ((t * 0.35 + b.ph / 6.28) % 1); o.position.set(b.x + k * 3 * w, b.y + k * b.sy * 0.9, b.z); o.scale.set(b.sx * (0.7 + k * 0.8), b.sy * (0.7 + k * 0.8), 1); o.material.opacity = Math.sin(k * Math.PI) * 0.95; }
  for (const o of L.bird) { const b = o.userData.b, a = t * 0.35 + b.ph; o.position.set(b.x + Math.cos(a) * 24, b.y + Math.sin(t * 0.9 + b.ph) * 3, b.z + Math.sin(a) * 24); o.scale.y = b.sy * (0.35 + 0.65 * Math.abs(Math.sin(t * 7 + b.ph))); }
  for (const o of L.person) { const b = o.userData.b; o.position.y = b.y + Math.abs(Math.sin(t * 2.2 + b.ph)) * b.sy * 0.025; o.material.rotation = Math.sin(t * 1.3 + b.ph) * 0.035; o.scale.y = b.sy * (1 + Math.sin(t * 2.4 + b.ph) * 0.015); }
  for (const o of L.small) { const b = o.userData.b; o.position.x = b.x + Math.sin(t * 0.7 + b.ph) * 0.8; o.material.rotation = Math.max(0, Math.sin(t * 3 + b.ph)) * 0.35; }
  for (const o of L.horse) { const b = o.userData.b; o.material.rotation = Math.sin(t * 0.8 + b.ph) * 0.03; o.position.y = b.y + Math.abs(Math.sin(t * 1.1 + b.ph)) * 0.08; }
  for (const o of L.flutter) { const b = o.userData.b, k = ((t * 0.18 + b.ph / 6.28) % 1); o.position.set(b.x + Math.sin(t * 1.3 + b.ph) * 2.5 + k * 6 * w, b.y + 8 - k * 16, b.z + Math.cos(t * 1.1 + b.ph) * 1.5); o.material.rotation = Math.sin(t * 3 + b.ph) * 1.2; o.scale.x = b.sx * Math.abs(Math.cos(t * 4 + b.ph)) + 0.05; }
  for (const o of L.flag) { o.userData.ry ??= o.rotation.y; o.rotation.y = o.userData.ry + Math.sin(t * 2.4 + o.position.x) * 0.22 * w; o.scale.x = 1 + Math.sin(t * 3.1 + o.position.z) * 0.06; }
  for (const o of L.water) { const m = o.material.map; if (m) m.offset.y = -t * 0.04; }
  SKY.update(st, t); checkPeople(st, t);
}
// ---------- camera helpers ----------
// smooth spline through keyframes [[time, {pos, look, fov}]] without stopping at keys (Catmull-Rom on pos/look)
const cr = (p0, p1, p2, p3, u) => { const u2 = u * u, u3 = u2 * u; return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3); };
export function glide(cam, t, keys) {
  const n = keys.length; let i = 0; while (i < n - 2 && t > keys[i + 1][0]) i++;
  const [t1, k1] = keys[i], [t2, k2] = keys[Math.min(i + 1, n - 1)], k0 = keys[Math.max(0, i - 1)][1], k3 = keys[Math.min(n - 1, i + 2)][1];
  let u = t2 > t1 ? Math.min(1, Math.max(0, (t - t1) / (t2 - t1))) : 0; if (i === 0) u = u * u * (3 - 2 * u) * 0.5 + u * 0.5; if (i === n - 2) u = 1 - (1 - u) * (1 - u) * 0.5 - (1 - u) * 0.5; // soft ends
  const f = (a) => [0, 1, 2].map((j) => cr(k0[a][j], k1[a][j], k2[a][j], k3[a][j], u));
  const p = f('pos'), l = f('look'); cam.position.set(...p); cam.lookAt(...l); const fov = (k1.fov ?? 55) + ((k2.fov ?? 55) - (k1.fov ?? 55)) * u; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
}
// follow a moving subject: camera = subject + offset, looking at subject + lookOff; smoothing via caller-supplied path
export function follow(cam, p, off = [0, 4, 14], lookOff = [0, 2.5, 0], fov = 52) { cam.position.set(p[0] + off[0], p[1] + off[1], p[2] + off[2]); cam.lookAt(p[0] + lookOff[0], p[1] + lookOff[1], p[2] + lookOff[2]); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); } }
