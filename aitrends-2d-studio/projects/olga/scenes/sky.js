// sky.js — REUSABLE painted 2D skies for 3D scenes: a camera-centred dome with a hand-painted equirect sky
// (gradient, sun glow, god rays, lit clouds, stars) + a glowing sun / moon billboard. Clouds drift.
// usage: const st = SKY.stage(T, 'sunset', { az: 200 }) instead of A.stage; call SKY.update(st, t) each frame
// (life.tick does it for you).
import { rng, mix, alpha } from '/engine/core.js';
import * as A from './aerial.js';

export const PRESETS = {
  sunset: { stops: ['#2a3a86', '#5a3a8a', '#8a3a6a', '#e8604a', '#ffb060', '#ffe0a0'], sun: '#fff2b8', sunGlow: '#ffb050', elev: 6, cloud: '#5a2a5a', lit: '#ffb070', rim: '#fff0c0', fog: '#e89a78', key: '#ffb880', ki: 1.7, amb: '#e8a0b0', a: 1.5, rays: 0.12, clouds: 70 },
  golden: { stops: ['#2a5aa8', '#5a8ac8', '#a8c0d8', '#f0d0a0', '#ffd890', '#fff0c8'], sun: '#fffbe0', sunGlow: '#ffd070', elev: 16, cloud: '#c8a0a8', lit: '#fff0d0', rim: '#ffffff', fog: '#f0d8b0', key: '#ffe0b0', ki: 2.0, amb: '#f0e0d0', a: 1.8, rays: 0.1, clouds: 55 },
  dusk: { stops: ['#0a0c2a', '#1e1a4a', '#4a2a5a', '#a03a4a', '#e8704a', '#ffb070'], sun: '#ffd8a0', sunGlow: '#ff7a3a', elev: -1, cloud: '#2a1a3a', lit: '#e8604a', rim: '#ffb080', fog: '#8a4a5a', key: '#ff9a70', ki: 1.2, amb: '#a07aa8', a: 1.3, rays: 0.08, clouds: 60, stars: 80 },
  night: { stops: ['#02030c', '#060a22', '#10183a', '#1e2650', '#3a3a6a', '#6a4a6a'], moon: true, sun: '#f4f0dc', sunGlow: '#8aa0e0', elev: 24, cloud: '#141a34', lit: '#5a6aa0', rim: '#c8d4ff', fog: '#1a1e3a', key: '#a8b8ff', ki: 0.9, amb: '#6a70a8', a: 1.3, rays: 0, clouds: 40, stars: 500 },
  fire: { stops: ['#03020a', '#0a0614', '#2a0a18', '#6a1414', '#c8401a', '#ff8a3a'], moon: true, sun: '#ffe8c8', sunGlow: '#ff8a5a', elev: 30, cloud: '#1a0a10', lit: '#c8401a', rim: '#ff9a50', fog: '#4a1a14', key: '#ff9a50', ki: 1.4, amb: '#c86a4a', a: 1.5, rays: 0, clouds: 50, stars: 260 },
};

function paint(P, az, seed) {
  const W = 2048, H = 1024, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), r = rng(seed);
  const hy = H / 2, top = 0, gr = g.createLinearGradient(0, top, 0, hy); P.stops.forEach((s, i) => gr.addColorStop(i / (P.stops.length - 1), s)); g.fillStyle = gr; g.fillRect(0, 0, W, hy); g.fillStyle = P.stops[P.stops.length - 1]; g.fillRect(0, hy, W, H - hy);
  const su = (((Math.atan2(Math.sin(az), -Math.cos(az)) / (Math.PI * 2)) % 1) + 1) % 1, sx = su * W, sy = hy - (P.elev / 180) * H;
  const prox = (x) => { let d = Math.abs(x - sx) / W; d = Math.min(d, 1 - d); return Math.max(0, 1 - d * 3.2); };
  if (P.stars) for (let i = 0; i < P.stars; i++) { const x = r() * W, y = r() * hy * 0.8; g.fillStyle = alpha('#ffffff', 0.4 + r() * 0.6); g.fillRect(x, y, r() < 0.1 ? 3 : 2, r() < 0.1 ? 3 : 2); }
  // sun glow (wraps)
  for (const ox of [-W, 0, W]) { const rg = g.createRadialGradient(sx + ox, sy, 0, sx + ox, sy, 700); rg.addColorStop(0, alpha(P.sunGlow, 0.85)); rg.addColorStop(0.25, alpha(P.sunGlow, 0.35)); rg.addColorStop(1, alpha(P.sunGlow, 0)); g.fillStyle = rg; g.fillRect(sx + ox - 700, 0, 1400, H); }
  // god rays
  if (P.rays) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 16; i++) { const a = -Math.PI * (0.06 + i / 16 * 0.88), w = 0.03 + r() * 0.04, L = 900; for (const ox of [-W, 0, W]) { const lg = g.createLinearGradient(sx + ox, sy, sx + ox + Math.cos(a) * L, sy + Math.sin(a) * L); lg.addColorStop(0, alpha(P.sunGlow, P.rays * (0.6 + r() * 0.8))); lg.addColorStop(1, alpha(P.sunGlow, 0)); g.fillStyle = lg; g.beginPath(); g.moveTo(sx + ox, sy); g.lineTo(sx + ox + Math.cos(a - w) * L, sy + Math.sin(a - w) * L); g.lineTo(sx + ox + Math.cos(a + w) * L, sy + Math.sin(a + w) * L); g.closePath(); g.fill(); } } g.restore(); }
  // horizon haze band
  const hz = g.createLinearGradient(0, hy - 90, 0, hy + 10); hz.addColorStop(0, alpha(P.stops[P.stops.length - 1], 0)); hz.addColorStop(1, alpha(P.stops[P.stops.length - 1], 0.9)); g.fillStyle = hz; g.fillRect(0, hy - 90, W, 100);
  // painted clouds: dark body, sun-lit underside + bright rim, stratus streaks near the horizon
  const blob = (x, y, w, h, k) => { const p = prox(x), body = mix(P.cloud, P.lit, p * 0.35), lit = mix(mix(P.cloud, P.lit, 0.55), P.lit, p), n = 4 + Math.floor(w / 60); const parts = []; for (let i = 0; i < n; i++) parts.push([x - w / 2 + (i + 0.5) * w / n + (r() - 0.5) * 20, y - Math.sin((i + 0.5) / n * Math.PI) * h * 0.55 - r() * h * 0.2, (w / n) * (0.7 + r() * 0.5)]);
    for (const ox of [-W, 0, W]) { g.fillStyle = body; for (const [px, py, pr] of parts) { g.beginPath(); g.ellipse(px + ox, py, pr, pr * 0.62, 0, 0, 7); g.fill(); } g.fillStyle = lit; for (const [px, py, pr] of parts) { g.beginPath(); g.ellipse(px + ox, py + pr * 0.24, pr * 0.9, pr * 0.38, 0, 0, 7); g.fill(); } g.strokeStyle = alpha(P.rim, 0.35 + p * 0.6); g.lineWidth = 3 + p * 3; for (const [px, py, pr] of parts) { g.beginPath(); g.ellipse(px + ox, py + pr * 0.1, pr * 0.92, pr * 0.55, 0, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); } } };
  for (let i = 0; i < P.clouds; i++) { const y = hy * (0.42 + r() * 0.48); blob(r() * W, y, 90 + r() * 260 * (1 - (hy - y) / hy * 0.3), 50 + r() * 50, i); }
  for (let i = 0; i < 40; i++) { const x = r() * W, y = hy - 12 - r() * 120, w = 200 + r() * 500, p = prox(x); for (const ox of [-W, 0, W]) { g.fillStyle = alpha(mix(mix(P.cloud, P.lit, 0.5), P.rim, p * 0.7), 0.5 + p * 0.4); g.beginPath(); g.ellipse(x + ox, y, w / 2, 4 + r() * 6, 0, 0, 7); g.fill(); } }
  return c;
}
function orb(T, P) { const { THREE } = T, c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), m = 256;
  const rg = g.createRadialGradient(m, m, 0, m, m, m); rg.addColorStop(0, alpha(P.sun, 1)); rg.addColorStop(0.12, alpha(P.sun, 1)); rg.addColorStop(0.16, alpha(P.sunGlow, 0.7)); rg.addColorStop(0.45, alpha(P.sunGlow, 0.18)); rg.addColorStop(1, alpha(P.sunGlow, 0)); g.fillStyle = rg; g.fillRect(0, 0, 512, 512);
  if (P.moon) { g.fillStyle = alpha('#c8c4b0', 0.5); for (const [x, y, rr] of [[230, 236, 14], [282, 270, 10], [250, 290, 8], [276, 226, 7]]) { g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } }
  else { g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, L = 150 + (i % 3) * 70; const lg = g.createLinearGradient(m, m, m + Math.cos(a) * L, m + Math.sin(a) * L); lg.addColorStop(0, alpha(P.sun, 0.55)); lg.addColorStop(1, alpha(P.sun, 0)); g.strokeStyle = lg; g.lineWidth = 6; g.beginPath(); g.moveTo(m, m); g.lineTo(m + Math.cos(a) * L, m + Math.sin(a) * L); g.stroke(); } }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex; }

// build a stage with a painted sky. az = sun azimuth (radians, 0 = +x, PI/2 = -z i.e. straight ahead of a camera looking down -z)
export function stage(T, preset = 'sunset', o = {}) {
  const P = { ...PRESETS[preset], ...(o.over || {}) }, az = o.az ?? Math.PI / 2, { THREE } = T;
  const el = (P.elev * Math.PI) / 180, dir = [Math.cos(az) * Math.cos(Math.max(el, 0.08)), Math.sin(Math.max(el, 0.08)), -Math.sin(az) * Math.cos(Math.max(el, 0.08))];
  const st = A.stage(T, { sky: P.stops.slice(0, 3), fogColor: P.fog, fog: o.fog || [240, 480], amb: P.amb, key: P.key, keyPos: dir.map((v) => v * 120), ki: P.ki, a: P.a, ss: o.ss });
  st.camera.far = 600; st.camera.updateProjectionMatrix();
  const tex = new THREE.CanvasTexture(paint(P, az, o.seed || 7)); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(520, 48, 24), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -10; dome.userData.noOutline = true; st.add(dome);
  const sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: orb(T, P), transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); const sz = P.moon ? 90 : 170; sun.scale.set(sz, sz, 1); sun.renderOrder = -9; sun.userData.noOutline = true; st.add(sun);
  st.skyObj = { dome, tex, sun, dir: [Math.cos(az) * Math.cos(el), Math.sin(el), -Math.sin(az) * Math.cos(el)], drift: o.drift ?? 0.0025 };
  st.scene.background = new THREE.Color(P.stops[2]);
  update(st, 0); return st;
}
export function update(st, t) { const s = st.skyObj; if (!s) return; const c = st.camera.position; s.dome.position.copy(c); s.sun.position.set(c.x + s.dir[0] * 480, c.y + s.dir[1] * 480, c.z + s.dir[2] * 480); s.tex.offset.x = t * s.drift; s.sun.material.rotation = t * 0.05; }
