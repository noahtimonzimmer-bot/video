// world3d.js — detailed low-poly 3D landscapes (Three.js via the three-kit `T`): terrain with mountains,
// patchwork fields, rivers, stone bridges, mud-brick houses, palms, fruit trees, ziggurat, ships, dunes.
// 1 unit = 1 m. Everything is deterministic (rng/noise from core).
import { rng, noise, shade, mix } from '/engine/core.js';

// fractal noise
const fbm = (x, z, seed = 1, oct = 4) => { let a = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < oct; i++) { a += amp * (noise(x * f, seed + i * 13) + noise(z * f + 31.7, seed + i * 7)) * 0.5; n += amp; amp *= 0.5; f *= 2.03; } return a / n; };

// height field: flat valley floor (|x|,|z| < flat) rising into mountains toward the edges
export function heightAt(x, z, o = {}) {
  const { seed = 3, mount = 38, flat = 60, rough = 1.2, ridgeZ = null } = o;
  const d = Math.max(0, Math.hypot(x * (o.sx ?? 1), z * (o.sz ?? 1)) - flat);
  const m = Math.min(1, d / 120) ** 1.6 * mount * (0.6 + 0.8 * Math.abs(fbm(x * 0.012, z * 0.012, seed, 5)));
  return m + fbm(x * 0.05, z * 0.05, seed + 5, 3) * rough;
}
export function terrain(T, o = {}) {
  const { THREE } = T, { size = 600, seg = 220, grass = '#5f8f3c', rock = '#7a6a5a', snow = '#f4efe6', sand = '#d8b878', snowLine = 34, seed = 3 } = o;
  const geo = new THREE.PlaneGeometry(size, size, seg, seg); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = [], c = new THREE.Color(), r = rng(seed);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i); const h = (o.height || heightAt)(x, z, o); pos.setY(i, h);
    const slope = Math.min(1, Math.max(0, (h - 4) / 18)), jitter = (r() - 0.5) * 0.06;
    c.set(h > snowLine + fbm(x * 0.03, z * 0.03, 9) * 6 ? snow : mix(o.desert ? sand : grass, rock, slope));
    c.offsetHSL(0, 0, jitter); cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })); m.receiveShadow = true; m.castShadow = true; return m;
}
// water surface (slightly emissive so it glows under bloom)
export function water(T, w, d, y = 0.15, color = '#3a8cc8') { const { THREE } = T; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d, 1, 1), new THREE.MeshStandardMaterial({ color, roughness: 0.15, metalness: 0.4, emissive: color, emissiveIntensity: 0.25, transparent: true, opacity: 0.92 })); m.rotation.x = -Math.PI / 2; m.position.y = y; m.receiveShadow = true; return m; }
// river ribbon along a polyline [[x,z],...] carved slightly above terrain
export function river(T, pts, width = 8, color = '#3f95d0', o = {}) {
  const { THREE } = T, v = [], idx = []; const hf = o.height || ((x, z) => heightAt(x, z, o));
  for (let i = 0; i < pts.length; i++) { const [x, z] = pts[i], [x2, z2] = pts[Math.min(pts.length - 1, i + 1)], [x0, z0] = pts[Math.max(0, i - 1)]; let dx = x2 - x0, dz = z2 - z0; const L = Math.hypot(dx, dz) || 1; const nx = -dz / L * width / 2, nz = dx / L * width / 2; const y = Math.max(hf(x, z), 0) + 0.35; v.push(x + nx, y, z + nz, x - nx, y, z - nz); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide })); m.receiveShadow = true; return m;
}
// patchwork fields with furrows (canvas texture), laid on a flat area
export function fields(T, x0, z0, cols = 4, rows = 3, cell = 14, o = {}) {
  const { THREE } = T, g = new THREE.Group(), r = rng(o.seed || 5), palette = o.colors || ['#a8b84a', '#d4b04a', '#7a9a3a', '#c89a4a', '#8aa84a', '#b8c060'];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const col = palette[Math.floor(r() * palette.length)], rot = r() < 0.5;
    const tex = T.canvasTex(128, 128, (c, W, H) => { c.fillStyle = col; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; for (let k = 4; k < W; k += 10) { c.beginPath(); rot ? (c.moveTo(k, 0), c.lineTo(k, H)) : (c.moveTo(0, k), c.lineTo(W, k)); c.stroke(); } });
    const p = T.plane(cell - 0.8, cell - 0.8, T.mat('#ffffff', { map: tex })); p.rotation.x = -Math.PI / 2; p.position.set(x0 + i * cell, (o.y ?? 0.2) + r() * 0.05, z0 + j * cell); g.add(p);
    if (r() < 0.35) for (let k = 0; k < 6; k++) { const s = T.cone(0.35, 1.0, shade(col, -0.2), x0 + i * cell - cell / 3 + k * 1.6, (o.y ?? 0.2) + 0.5, z0 + j * cell + (r() - 0.5) * 6, 6); g.add(s); }
  }
  return g;
}
// stone arch bridge spanning `len` along x, centred at (x,y,z), rotated by rotY
export function bridge(T, x, y, z, len = 18, rotY = 0, o = {}) {
  const { THREE } = T, g = new THREE.Group(), stone = T.mat(o.color || '#b8a888', { flat: true }), dark = T.mat(shade(o.color || '#b8a888', -0.25), { flat: true }), w = o.width || 4;
  g.add(T.box(len, 0.8, w, stone, 0, 3.2, 0));
  for (const s of [-1, 1]) g.add(T.box(len, 0.7, 0.4, dark, 0, 3.9, s * (w / 2 - 0.2)));
  const arches = o.arches || 3, aw = len / arches;
  for (let i = 0; i < arches; i++) { const ax = -len / 2 + aw * (i + 0.5); const ring = new THREE.Mesh(new THREE.TorusGeometry(aw / 2 - 0.4, 0.55, 6, 16, Math.PI), stone); ring.position.set(ax, 0.6, 0); ring.scale.z = w / 1.1; ring.castShadow = true; g.add(ring); }
  for (let i = 0; i <= arches; i++) g.add(T.box(1.2, 3.6, w, stone, -len / 2 + aw * i, 1.4, 0));
  g.position.set(x, y, z); g.rotation.y = rotY; return g;
}
// mud-brick house: flat roof with parapet, dark door + windows; optional upper storey / awning
export function house(T, x, y, z, o = {}) {
  const { THREE } = T, g = new THREE.Group(), w = o.w || 6, d = o.d || 5, h = o.h || 3.4, col = o.color || '#d9b98a', wall = T.mat(col, { flat: true }), dark = T.basic('#2a1a10'), warm = o.lit ? T.basic('#ffcf7a') : dark;
  g.add(T.box(w, h, d, wall, 0, h / 2, 0)); g.add(T.box(w + 0.3, 0.35, d + 0.3, T.mat(shade(col, -0.12)), 0, h + 0.1, 0));
  g.add(T.box(1.1, 2, 0.1, dark, 0, 1, d / 2 + 0.03)); for (const sx of [-w / 3, w / 3]) g.add(T.box(0.8, 0.7, 0.1, warm, sx, h * 0.62, d / 2 + 0.03));
  if (o.upper) { g.add(T.box(w * 0.55, h * 0.8, d * 0.6, wall, -w * 0.18, h + h * 0.4, -d * 0.1)); g.add(T.box(0.7, 0.6, 0.1, warm, -w * 0.18, h + h * 0.45, d * 0.2 + 0.03)); }
  if (o.awning) { const cl = T.mat(o.awning, { side: THREE.DoubleSide }); const a = T.plane(w * 0.6, 2, cl); a.position.set(w * 0.15, h * 0.75, d / 2 + 0.9); a.rotation.x = -1.1; g.add(a); }
  if (o.gable) { const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, 2.4, 4), T.mat(o.gable, { flat: true })); roof.rotation.y = Math.PI / 4; roof.position.y = h + 1.3; roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); roof.castShadow = true; g.add(roof); }
  g.position.set(x, y, z); g.rotation.y = o.rot || 0; return g;
}
export function village(T, cx, cz, n = 14, o = {}) { const { THREE } = T, g = new THREE.Group(), r = rng(o.seed || 8); const hf = o.height || ((x, z) => heightAt(x, z, o.terrain || {})); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = 4 + r() * (o.radius || 26), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; g.add(house(T, x, hf(x, z) - 0.2, z, { w: 4 + r() * 4, d: 4 + r() * 3, h: 2.6 + r() * 1.6, rot: Math.round(r() * 4) * Math.PI / 2 + (r() - 0.5) * 0.2, upper: r() < 0.3, lit: o.lit && r() < 0.6, awning: r() < 0.25 ? ['#b84a3a', '#3a6ea5', '#e8d8b8'][Math.floor(r() * 3)] : null, color: ['#d9b98a', '#cfa978', '#e4c89a', '#c8a070'][Math.floor(r() * 4)], gable: o.gable ? o.gable : null })); } return g; }
// palm tree (curved trunk segments + drooping leaf blades)
export function palm(T, x, y, z, s = 1, o = {}) { const { THREE } = T, g = new THREE.Group(), trunk = T.mat('#9a7a52', { flat: true }), leaf = T.mat(o.leaf || '#5aa040', { flat: true }); let px = 0, py = 0; const lean = o.lean ?? 0.25; for (let i = 0; i < 7; i++) { const seg = T.cyl(0.2 * s, 0.26 * s, 1.3 * s, trunk, px, py + 0.65 * s, 0, 6); seg.rotation.z = -lean * 0.4; g.add(seg); px += lean * 0.5 * s; py += 1.25 * s; } for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 4), leaf); b.scale.set(2.3 * s, 0.12 * s, 0.55 * s); b.position.set(px + Math.cos(a) * 1.9 * s, py - 0.5 * s, Math.sin(a) * 1.9 * s); b.rotation.y = -a; b.rotation.z = -0.45; b.castShadow = true; g.add(b); } g.add(T.sphere(0.45 * s, T.mat('#6a5030'), px, py - 0.2 * s, 0)); g.position.set(x, y, z); return g; }
// rounded fruit tree; fruit spheres; glow for the tree of life
export function fruitTree(T, x, y, z, s = 1, o = {}) { const { THREE } = T, g = new THREE.Group(); g.add(T.cyl(0.25 * s, 0.4 * s, 3 * s, T.mat('#6a4a30', { flat: true }), 0, 1.5 * s, 0, 7)); const leaf = T.mat(o.leaf || '#3f7a32', { flat: true }); const r = rng(o.seed || 2); for (let i = 0; i < 6; i++) g.add(T.sphere((1.2 + r() * 0.8) * s, leaf, (r() - 0.5) * 2.4 * s, (3.6 + r() * 1.6) * s, (r() - 0.5) * 2.4 * s)); if (o.fruit) for (let i = 0; i < 14; i++) { const fm = o.glow ? T.basic(o.fruit) : T.mat(o.fruit); g.add(T.sphere(0.18 * s, fm, (r() - 0.5) * 3.6 * s, (3 + r() * 2.6) * s, (r() - 0.5) * 3.6 * s)); } g.position.set(x, y, z); return g; }
export function forest(T, cx, cz, n, radius, o = {}) { const { THREE } = T, g = new THREE.Group(), r = rng(o.seed || 4); const hf = o.height || ((x, z) => heightAt(x, z, o.terrain || {})); for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, d = (o.inner || 0) + r() * radius, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d, h = hf(x, z); if (h > (o.maxH ?? 14)) continue; const kind = r(); g.add(kind < (o.palms ?? 0.3) ? palm(T, x, h, z, 0.8 + r() * 0.6, { lean: (r() - 0.5) * 0.6 }) : fruitTree(T, x, h, z, 0.7 + r() * 0.6, { seed: i, leaf: ['#3f7a32', '#4a8a3a', '#5a9a42', '#2f6a2a'][Math.floor(r() * 4)], fruit: r() < 0.4 ? ['#e04a3a', '#f2a23a', '#c83a6a'][Math.floor(r() * 3)] : null })); } return g; }
// stepped ziggurat temple
export function ziggurat(T, x, y, z, s = 1, col = '#c8a070') { const { THREE } = T, g = new THREE.Group(); for (let i = 0; i < 4; i++) g.add(T.box((24 - i * 5) * s, 4 * s, (24 - i * 5) * s, T.mat(shade(col, -i * 0.05), { flat: true }), 0, (2 + i * 4) * s, 0)); g.add(T.box(3 * s, 12 * s, 10 * s, T.mat(shade(col, -0.15)), 0, 6 * s, 13 * s)); g.position.set(x, y, z); return g; }
// simple ancient ship with sail
export function ship(T, x, z, rot = 0, o = {}) { const { THREE } = T, g = new THREE.Group(); const hull = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.0, 9, 8, 1, false, 0, Math.PI), T.mat('#6a4a30', { flat: true })); hull.rotation.z = Math.PI / 2; hull.rotation.y = Math.PI / 2; hull.position.y = 1; hull.castShadow = true; g.add(hull); g.add(T.cyl(0.12, 0.15, 7, T.mat('#4a3020'), 0, 4.5, 0, 6)); const sail = T.plane(4.5, 4, T.mat(o.sail || '#e8d8b8', { side: THREE.DoubleSide })); sail.position.set(0, 5, 0); sail.rotation.y = Math.PI / 2; sail.castShadow = true; g.add(sail); g.position.set(x, 0, z); g.rotation.y = rot; return g; }
// city wall ring with towers
export function cityWall(T, cx, cz, rad = 40, o = {}) { const { THREE } = T, g = new THREE.Group(), stone = T.mat(o.color || '#c8b088', { flat: true }); const n = 22; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2; const x = cx + Math.cos(a) * rad, z = cz + Math.sin(a) * rad, x2 = cx + Math.cos(a2) * rad, z2 = cz + Math.sin(a2) * rad; const L = Math.hypot(x2 - x, z2 - z); const w = T.box(L, 6, 1.6, stone, (x + x2) / 2, 3 + (o.y || 0), (z + z2) / 2); w.rotation.y = -Math.atan2(z2 - z, x2 - x); g.add(w); if (i % 3 === 0) g.add(T.box(3.2, 9, 3.2, stone, x, 4.5 + (o.y || 0), z)); } return g; }
// desert tents
export function tent(T, x, y, z, s = 1, col = '#a87a4a') { const { THREE } = T; const m = new THREE.Mesh(new THREE.ConeGeometry(2.6 * s, 2.4 * s, 4), T.mat(col, { flat: true })); m.position.set(x, y + 1.2 * s, z); m.rotation.y = Math.PI / 4; m.castShadow = true; return m; }
