// sets.js — every location of the story. Each set(g, t, cam, opts) draws the world behind the characters
// and returns { GY, CX, M, ... }. Ground line GY = E.H * 0.8 unless noted. Walls/floors extend past the frame.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, text, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GY0 = () => E.H * 0.8;

// ---------------- ROOFTOP (40 floors up, sunset) ----------------
export function roof(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = GY0(), CX = E.W / 2, edge = o.edge ?? CX + 420;
  const sunY = GY - 300 + (o.sunset ?? 0) * 160;
  layer(g, cam, 0.08, (g) => {
    backdrop(g, M.sky);
    FX.stars(g, t, { count: 60, area: [-E.W, -E.H, E.W * 3, E.H * 0.9], color: '#ffffff' });
    FX.sun(g, CX + 520, sunY, 60, '#fff0d8', M.key, 6);
    FX.clouds(g, { y: 120, h: 260, color: '#ffc8a0', a: 0.1, seed: 4 });
  });
  layer(g, cam, 0.2, (g) => { // far skyline, mostly BELOW the roof level
    FX.skyline(g, { x: -E.W, y: GY + 380, w: E.W * 3, minH: 120, maxH: 520, color: mix(M.sky[1], '#000', 0.55), windowColor: alpha(M.practical, 0.55), lit: 0.25, seed: 21 });
    FX.fog(g, GY - 60, 300, M.fog, 0.22);
  });
  layer(g, cam, 0.4, (g) => {
    FX.skyline(g, { x: -E.W, y: GY + 700, w: E.W * 3, minH: 300, maxH: 760, minW: 60, maxW: 150, color: mix(M.dark, '#000', 0.35), windowColor: alpha(M.practical, 0.7), lit: 0.3, seed: 33 });
  });
  layer(g, cam, 1, (g) => {
    // the drop beyond the edge: outer wall of our tower going down
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 900, [shade(M.wall, -0.35), shade(M.dark, -0.5)]); g.fillRect(edge - 40, GY, 60, E.H * 2);
    for (let y = GY + 70; y < GY + 1200; y += 110) { g.fillStyle = alpha(M.practical, 0.25); g.fillRect(edge - 32, y, 8, 40); }
    // roof slab
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [shade(M.floor, -0.05), shade(M.dark, -0.4)]); g.fillRect(-E.W * 1.5, GY, edge + E.W * 1.5, E.H * 2);
    FX.floorLines(g, GY, GY + 400, 'rgba(0,0,0,.25)', 0.08);
    // parapet lip
    g.fillStyle = shade(M.wall, -0.2); g.fillRect(-E.W * 1.5, GY - 26, edge + E.W * 1.5 - 30, 26); g.fillStyle = alpha(M.rim, 0.55); g.fillRect(-E.W * 1.5, GY - 26, edge + E.W * 1.5 - 30, 3);
    g.fillStyle = shade(M.wall, -0.45); g.fillRect(edge - 30, GY - 10, 30, 10);
    // stairwell hut with the metal door
    if (o.hut !== false) {
      const hx = o.hutX ?? CX - 760, hw = 360, hh = 330;
      g.fillStyle = linGrad(g, hx, 0, hx + hw, 0, [shade(M.wall, -0.15), shade(M.wall, -0.5)]); g.fillRect(hx, GY - hh, hw, hh);
      g.fillStyle = shade(M.wall, -0.6); g.fillRect(hx - 12, GY - hh - 16, hw + 24, 18);
      const dx = hx + hw - 170, dw = 120, dh = 220, open = o.doorOpen ?? 0;
      g.fillStyle = '#05040a'; g.fillRect(dx, GY - dh, dw, dh);
      if (open > 0) glow(g, dx + dw * 0.5, GY - dh * 0.5, 160, '#9fb8ff', 0.25 * open);
      g.fillStyle = linGrad(g, dx, 0, dx + dw, 0, ['#5a5e6e', '#3a3d4a']); g.fillRect(dx + dw * open, GY - dh, dw * (1 - open), dh);
      g.strokeStyle = '#25262f'; g.lineWidth = 6; g.strokeRect(dx, GY - dh, dw, dh);
      if (open < 0.2) { circle(g, dx + dw * 0.18, GY - dh * 0.48, 6, '#9a9cab'); rr(g, dx + dw * 0.1, GY - dh * 0.4, 22, 26, 4); g.fillStyle = '#2a2b33'; g.fill(); }
      for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(dx + dw * open + 10, GY - dh + 20 + i * 52, dw * (1 - open) - 20, 4); }
    }
    // water tank + antenna with blinking red light
    const tx = o.tankX ?? CX - 1180;
    g.fillStyle = shade(M.dark, -0.3); rr(g, tx, GY - 420, 220, 260, 30); g.fill(); for (const lx of [tx + 30, tx + 190]) seg(g, [[lx, GY - 170], [lx, GY]], 12, shade(M.dark, -0.3));
    seg(g, [[CX + 140, GY - 26], [CX + 140, GY - 520]], 6, shade(M.dark, -0.2)); seg(g, [[CX + 110, GY - 420], [CX + 170, GY - 420]], 4, shade(M.dark, -0.2));
    const blink = (t % 1.6) < 0.5 ? 1 : 0.2; circle(g, CX + 140, GY - 526, 7, alpha('#ff3a3a', blink)); glow(g, CX + 140, GY - 526, 60, '#ff3a3a', 0.5 * blink);
    FX.pool(g, CX + 200, GY + 40, 900, 90, M.key, 0.12);
  });
  return { GY, CX, M, edge };
}

// ---------------- APARTMENT INTERIOR (living / kitchen / bedroom) ----------------
export function apt(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), GY = GY0(), CX = E.W / 2, L = o.lights ?? 1, kind = o.kind || 'living';
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.2), mix(shade(M.wall, -0.55), M.wall, L * 0.8)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    g.fillStyle = shade(M.wall, -0.6); g.fillRect(-E.W, GY - 24, E.W * 3, 24);
    if (o.window !== false) {
      const wx = o.winX ?? CX - 640, wy = GY - 640, ww = 420, wh = 400;
      FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 2, frame: shade(M.wall, -0.6), bar: 10, blinds: o.blinds ?? 0 }, (g, x, y, w, h) => {
        g.fillStyle = linGrad(g, 0, y, 0, y + h, o.day ? ['#f7d9a8', '#f2b585', '#c98a74'] : ['#0b1028', '#1d2550', '#3a3570']); g.fillRect(x, y, w, h);
        if (o.day) FX.sun(g, x + w * 0.3, y + h * 0.35, 40, '#fff6e0', '#ffd59a', 4); else FX.moon(g, x + w * 0.7, y + h * 0.25, 18);
        FX.skyline(g, { x, y: y + h, w, maxH: h * 0.5, color: o.day ? alpha('#6a4a50', 0.8) : alpha('#141830', 0.95), windowColor: alpha(M.practical, 0.8), lit: o.day ? 0.05 : 0.35, seed: 6 });
      });
      if (o.day) FX.godRays(g, wx + 200, wy + 150, { angle: 0.95, spread: 0.5, len: 1500, color: '#ffd9a0', a: 0.12, t });
      else FX.lightCone(g, wx + ww / 2, wy + wh * 0.2, { angle: 1.25, spread: 0.6, len: 900, color: '#a9b8ff', a: 0.08 });
    }
    if (kind === 'living') {
      // couch + floor lamp + light switch + front door at right
      g.fillStyle = shade(M.wall, -0.5); rr(g, CX - 120, GY - 150, 420, 130, 24); g.fill(); rr(g, CX - 150, GY - 110, 480, 90, 30); g.fillStyle = shade(M.wall, -0.4); g.fill();
      const lx = CX + 400; seg(g, [[lx, GY - 20], [lx, GY - 330]], 6, '#141018'); poly(g, [[lx - 50, GY - 330], [lx + 50, GY - 330], [lx + 32, GY - 400], [lx - 32, GY - 400]], L > 0.5 ? '#ffe2a8' : '#3a3440');
      if (L > 0.5) { glow(g, lx, GY - 360, 260, M.practical, 0.35 * L); FX.lightCone(g, lx, GY - 330, { angle: Math.PI / 2, spread: 1.1, len: 400, color: M.practical, a: 0.12 * L }); }
      const dx = o.doorX ?? CX + 640; g.fillStyle = shade(M.wall, -0.7); g.fillRect(dx - 10, GY - 330, 200, 330); g.fillStyle = shade(M.wall, -0.45); g.fillRect(dx, GY - 320, 180, 320);
      circle(g, dx + 26, GY - 160, 8, '#c8c0b0'); rr(g, dx + 18, GY - 150, 16, 34, 4); g.fillStyle = '#8a8478'; g.fill();
      rr(g, dx - 60, GY - 200, 26, 40, 4); g.fillStyle = '#d8d2c8'; g.fill();
    }
    if (kind === 'kitchen') {
      // fridge with photo, counter, wall clock
      const fx = o.fridgeX ?? CX + 260; g.fillStyle = linGrad(g, fx, 0, fx + 240, 0, ['#c8c4d0', '#8a8698']); rr(g, fx, GY - 460, 240, 460, 14); g.fill();
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(fx, GY - 300, 240, 5); seg(g, [[fx + 24, GY - 420], [fx + 24, GY - 330]], 7, '#6a6678'); seg(g, [[fx + 24, GY - 260], [fx + 24, GY - 170]], 7, '#6a6678');
      photo(g, fx + 120, GY - 380, 0.55, o.photoEmma ?? 1);
      FX.counter(g, { x: CX - 900, y: GY, w: 1100, h: 230, color: shade(M.wall, -0.55), top: shade(M.wall, -0.2), doors: 6 });
      FX.clock(g, o.clockX ?? CX - 300, GY - 560, 64, 23 * 3600 + 59 * 60 + 30 + t, { face: '#e9e4f0' });
    }
    if (kind === 'bedroom') {
      FX.bed(g, { x: o.bedX ?? CX - 200, y: GY, w: 520, color: o.bedColor || '#5a5aa0', frame: shade(M.wall, -0.6), pillow: '#e8e4f4' });
      if (o.mirror) mirrorFrame(g, o.mirror, M);
      g.fillStyle = shade(M.wall, -0.5); rr(g, CX + 420, GY - 160, 120, 140, 6); g.fill();
    }
    if (o.emmaRoom) { // night window with a figure silhouette behind the glass
      FX.bed(g, { x: CX - 380, y: GY, w: 560, color: '#6a3a5a', frame: '#1a1420', pillow: '#d8d0e4' });
    }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [mix(shade(M.floor, -0.4), M.floor, L), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.07);
    if (o.day) FX.pool(g, CX - 200, GY + 60, 600, 90, '#ffd59a', 0.25);
  });
  return { GY, CX, M };
}
export function mirrorFrame(g, m, M) {
  rr(g, m.x - 14, m.y - 14, m.w + 28, m.h + 28, 10); g.fillStyle = '#2a2230'; g.fill();
  g.fillStyle = linGrad(g, m.x, m.y, m.x + m.w, m.y + m.h, ['#3a4560', '#1a2034', '#2a3450']); g.fillRect(m.x, m.y, m.w, m.h);
}
// photograph: hero (red hoodie) + Emma (yellow) as tiny white figures
export function photo(g, x, y, s = 1, emma = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? -0.05);
  g.fillStyle = '#f2ece0'; g.fillRect(-120, -90, 240, 180);
  g.fillStyle = linGrad(g, 0, -78, 0, 70, ['#f2b585', '#c98a74', '#6a4a50']); g.fillRect(-106, -78, 212, 148);
  const fig = (fx, col, head) => { seg(g, [[fx, -10], [fx, 30]], 9, '#f4f0f6'); seg(g, [[fx, 30], [fx - 8, 64]], 7, '#f4f0f6'); seg(g, [[fx, 30], [fx + 8, 64]], 7, '#f4f0f6'); poly(g, [[fx - 10, -8], [fx + 10, -8], [fx + 12, 32], [fx - 12, 32]], col); circle(g, fx, -26, 15, '#f4f0f6'); if (head) seg(g, [[fx - 12, -34], [fx - 22, -10]], 6, '#f4f0f6'); };
  fig(-36, '#d64a33', false); if (emma) fig(34, '#f2c21a', true);
  if (o.shadowFace) { g.fillStyle = 'rgba(5,3,8,.92)'; g.beginPath(); g.ellipse(-36, 70, 40, 7, 0, 0, 7); g.fill(); g.save(); g.translate(-60, 70); g.transform(1, 0, -0.9, -0.28, 0, 0); seg(g, [[0, 0], [0, -60]], 10, '#050308'); circle(g, 0, -80, 15, '#050308'); seg(g, [[0, -45], [18, -30]], 6, '#050308'); g.restore(); }
  g.restore();
}

// ---------------- STREET (day morning or night) ----------------
export function street(g, t, cam, o = {}) {
  const night = o.night ?? false, M = mood(night ? 'night' : (o.mood || 'golden')), GY = GY0(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    if (night) { FX.stars(g, t, { count: 90 }); FX.moon(g, CX + 480, 170, 34); }
    else FX.sun(g, CX - 760, GY - 380, 70, '#fff3dc', M.key, 6);
    FX.skyline(g, { x: -E.W, y: GY - 260, w: E.W * 3, minH: 120, maxH: 420, color: mix(M.sky[1], M.dark, 0.7), windowColor: alpha(M.practical, 0.6), lit: night ? 0.35 : 0.06, seed: 12 });
  });
  layer(g, cam, 0.55, (g) => {
    const r = rng(o.seed || 5);
    for (let i = -4; i <= 5; i++) { const w = 380 + r() * 80, h = 420 + r() * 220; FX.facade(g, { x: CX + i * 470 - w / 2, y: GY - 60, w, h, color: shade(M.wall, -0.25 - r() * 0.2), win: night ? M.practical : shade(M.practical, -0.35), dark: shade(M.dark, -0.2), cols: 3, rows: 3, lit: night ? 0.5 : 0.15, seed: 40 + i }); }
    if (o.abandoned) { const ax = o.abandoned; g.fillStyle = '#100c16'; g.fillRect(ax - 260, GY - 760, 520, 700); for (let j = 0; j < 6; j++) for (let k = 0; k < 4; k++) { g.fillStyle = (j + k) % 3 ? '#07050a' : '#1a1622'; g.fillRect(ax - 220 + k * 115, GY - 720 + j * 105, 70, 70); } g.fillStyle = '#05040a'; g.fillRect(ax - 60, GY - 200, 120, 140); }
  });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = shade(M.floor, -0.1); g.fillRect(-E.W, GY - 60, E.W * 3, 70);
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, [M.road, shade(M.dark, -0.4)]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    g.fillStyle = shade(M.floor, 0.1); g.fillRect(-E.W, GY - 2, E.W * 3, 6);
    for (let x = -E.W; x < E.W * 2; x += 260) { g.fillStyle = alpha('#e8e0c8', 0.25); g.fillRect(x, GY + 120, 120, 8); }
    const lamps = o.lamps ?? [CX - 600, CX + 520];
    for (const lx of lamps) { FX.lampPost(g, lx, GY, 380, { color: '#0e0b14', light: M.practical, on: night, a: 0.2 }); if (night) FX.pool(g, lx + 37, GY + 30, 260, 50, M.practical, 0.35); }
    for (const tx of o.trees ?? [CX - 1000, CX + 950]) FX.tree(g, tx, GY - 40, 1.4, shade(M.dark, -0.2));
    if (o.busStop != null) { const bx = o.busStop; g.fillStyle = alpha('#9fc0e0', 0.12); g.fillRect(bx - 140, GY - 260, 280, 220); g.fillStyle = '#16121e'; g.fillRect(bx - 150, GY - 270, 300, 14); seg(g, [[bx - 140, GY - 260], [bx - 140, GY]], 6, '#16121e'); seg(g, [[bx + 140, GY - 260], [bx + 140, GY]], 6, '#16121e'); rr(g, bx + 160, GY - 330, 60, 60, 30); g.fillStyle = '#e8e0c8'; g.fill(); seg(g, [[bx + 190, GY - 270], [bx + 190, GY]], 5, '#16121e'); text(g, 'BUS', bx + 190, GY - 300, { size: 18, color: '#16121e', font: 'Nunito', weight: 900 }); }
  });
  return { GY, CX, M, lampX: (o.lamps ?? [CX - 600, CX + 520]) };
}

// ---------------- HALLWAY / FRONT DOOR (outside view of the door, or inside with peephole) ----------------
export function hallway(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = GY0(), CX = E.W / 2;
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#0a0c18', '#262a46']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (const x of [CX - 700, CX + 700]) { circle(g, x, GY - 620, 16, '#d8e0ff'); glow(g, x, GY - 620, 260, '#a9b8ff', 0.25 * (o.lights ?? 1)); }
    const dw = 300, dh = 560, dx = CX - dw / 2;
    if (o.door === false) { for (let i = -3; i <= 3; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(CX + i * 420 - 4, -E.H, 8, GY + E.H); } FX.door(g, { x: CX + 380, y: GY, w: 200, h: 420, color: '#3a2a36' }); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-E.W, GY - 16, E.W * 3, 16); return; }
    g.fillStyle = '#120c10'; g.fillRect(dx - 20, GY - dh - 20, dw + 40, dh + 20);
    g.fillStyle = linGrad(g, dx, 0, dx + dw, 0, ['#5a3a2e', '#3a2420']); g.fillRect(dx, GY - dh, dw, dh);
    for (const [yy, hh] of [[60, 200], [300, 220]]) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 5; g.strokeRect(dx + 40, GY - dh + yy, dw - 80, hh); }
    circle(g, CX, GY - dh + 40, 9, '#c8b890'); circle(g, CX, GY - dh + 40, 4, '#120c10');
    circle(g, dx + dw - 44, GY - 270, 12, '#c8b890');
    if (o.open) { g.fillStyle = '#020205'; g.fillRect(dx, GY - dh, dw, dh); const L = o.lights ?? 1; if (L > 0.5) glow(g, CX, GY - dh * 0.6, 200, '#cfe0ff', 0.2 * L); poly(g, [[dx + dw, GY - dh], [dx + dw + 90, GY - dh - 30], [dx + dw + 90, GY + 30], [dx + dw, GY]], '#4a2e24'); }
    if (o.scratch) scratch(g, CX, GY - dh + 210, o.scratch, t);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-E.W, GY - 16, E.W * 3, 16);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#1b1e33', '#0a0b14']); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, GY + 300, 'rgba(0,0,0,.3)', 0.08); });
  return { GY, CX, M };
}
// scratched letters "DON'T GO TO WORK" carved in wood (k = 0..1 reveal)
export function scratch(g, x, y, k = 1, t = 0, size = 56) {
  const lines = ["DON'T", 'GO TO', 'WORK'];
  g.save(); lines.forEach((ln, i) => {
    const a = clamp(k * 3 - i);
    if (a <= 0) return;
    text(g, ln, x + 2, y + i * size * 1.05 + 2, { size, font: 'Fredoka', weight: 700, color: 'rgba(0,0,0,.6)', alpha: a, spacing: 6 });
    text(g, ln, x, y + i * size * 1.05, { size, font: 'Fredoka', weight: 700, color: '#e8c9a0', alpha: a, spacing: 6 });
  }); g.restore();
}

// ---------------- OFFICE LOBBY + ELEVATOR ----------------
export function office(g, t, cam, o = {}) {
  const M = mood('interiorCool'), GY = GY0(), CX = E.W / 2, open = o.open ?? 1, ex = o.elevX ?? CX;
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#141830', '#3a4060']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let x = -E.W; x < E.W * 2; x += 320) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, -E.H, 6, GY + E.H); }
    for (const x of [CX - 600, CX, CX + 600]) { g.fillStyle = '#e8eeff'; g.fillRect(x - 120, 40, 240, 10); FX.lightCone(g, x, 50, { angle: Math.PI / 2, spread: 0.9, len: 700, color: '#cfe0ff', a: 0.06 }); }
    const w = 340, h = 520, x0 = ex - w / 2;
    g.fillStyle = '#20232f'; g.fillRect(x0 - 40, GY - h - 50, w + 80, h + 50);
    // cabin interior
    g.fillStyle = linGrad(g, 0, GY - h, 0, GY, ['#e8dcc0', '#a89878']); g.fillRect(x0, GY - h, w, h); glow(g, ex, GY - h + 30, 220, '#fff0d0', 0.4);
    o.inside?.(g, x0, GY - h, w, h);
    const half = (w / 2) * (1 - open);
    g.fillStyle = linGrad(g, x0, 0, x0 + w, 0, ['#9aa0b4', '#6a7088', '#9aa0b4']); g.fillRect(x0, GY - h, half, h); g.fillRect(x0 + w - half, GY - h, half, h);
    seg(g, [[ex, GY - h], [ex, GY]], open < 0.02 ? 3 : 0.01, 'rgba(0,0,0,.5)');
    rr(g, ex - 70, GY - h - 42, 140, 32, 6); g.fillStyle = '#0a0a10'; g.fill(); text(g, o.floor || '1', ex, GY - h - 26, { size: 22, color: '#ff8a5c', font: 'Nunito', weight: 900 });
    rr(g, x0 + w + 60, GY - 300, 30, 70, 6); g.fillStyle = '#2a2d3a'; g.fill(); circle(g, x0 + w + 75, GY - 278, 7, '#ffd47e');
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#5a6080', '#1a1c2a']); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, GY + 400, 'rgba(0,0,0,.2)', 0.06); FX.pool(g, CX, GY + 40, 600, 70, '#cfe0ff', 0.15); });
  return { GY, CX, M };
}

// ---------------- STAIRWELL ----------------
export function stairs(g, t, cam, o = {}) {
  const M = mood('night'), GY = GY0(), CX = E.W / 2, L = o.lights ?? 1;
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#06060c', mix('#06060c', '#2a2c40', L)]); g.fillRect(-E.W, -E.H * 2, E.W * 3, GY + E.H * 3);
    for (let k = -3; k < 4; k++) { // zig-zag flights
      const y0 = GY - k * 360, dir = k % 2 ? 1 : -1, x0 = CX - dir * 520;
      g.fillStyle = mix('#08080e', '#3a3c52', L);
      g.beginPath(); g.moveTo(x0, y0); for (let s = 0; s <= 12; s++) { g.lineTo(x0 + dir * s * 87, y0 - s * 30); g.lineTo(x0 + dir * (s + 1) * 87, y0 - s * 30); } g.lineTo(x0 + dir * 1100, y0 + 40); g.lineTo(x0, y0 + 40); g.closePath(); g.fill();
      seg(g, [[x0, y0 - 110], [x0 + dir * 1100, y0 - 470]], 6, mix('#0a0a10', '#8a8ca0', L));
    }
    const ex = (o.signX ?? CX + 640); rr(g, ex - 60, GY - 640, 120, 50, 6); g.fillStyle = '#1a6a3a'; g.fill(); text(g, 'EXIT', ex, GY - 615, { size: 30, color: '#bfffd0', font: 'Nunito', weight: 900 }); glow(g, ex, GY - 615, 200, '#3fe07a', 0.25);
    if (L > 0.3) { circle(g, CX, GY - 760, 18, '#fff6dc'); glow(g, CX, GY - 760, 500, '#ffe2a8', 0.3 * L); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = mix('#040408', '#20222e', L); g.fillRect(-E.W, GY, E.W * 3, E.H); });
  return { GY, CX, M };
}

// ---------------- MIRROR ROOM (inside the metal door on the roof) ----------------
export function mirrorRoom(g, t, cam, o = {}) {
  const M = mood('night'), GY = GY0(), CX = E.W / 2;
  const m = { x: CX - 260, y: GY - 620, w: 520, h: 600 };
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#05060c', '#1e2236']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let x = -E.W; x < E.W * 2; x += 140) { g.fillStyle = 'rgba(160,180,255,.035)'; g.fillRect(x, -E.H, 4, GY + E.H); }
    for (let y = 0; y < GY; y += 160) { for (let x = -E.W; x < E.W * 2; x += 140) circle(g, x + 20, y + 30, 3, 'rgba(160,180,255,.08)'); }
    glow(g, CX, GY - 860, 600, '#9fb8ff', 0.18);
    if (o.words) text(g, 'ONLY ONE OF YOU BELONGS HERE.', CX, m.y - 70, { size: 46, color: '#e8eeff', font: 'Fredoka', weight: 700, spacing: 5, glow: 26, glowColor: 'rgba(160,190,255,.9)', alpha: o.words });
    rr(g, m.x - 22, m.y - 22, m.w + 44, m.h + 44, 14); g.fillStyle = '#0c0c14'; g.fill(); ring(g, 0, 0, 0, 0, '#000');
    g.save(); g.beginPath(); g.rect(m.x, m.y, m.w, m.h); g.clip();
    g.fillStyle = linGrad(g, m.x, m.y, m.x + m.w, m.y + m.h, ['#2a3450', '#121828', '#26304a']); g.fillRect(m.x, m.y, m.w, m.h);
    o.reflect?.(g, m);
    g.fillStyle = 'rgba(200,220,255,.07)'; poly(g, [[m.x + 60, m.y], [m.x + 180, m.y], [m.x + 40, m.y + m.h], [m.x - 80, m.y + m.h]], 'rgba(200,220,255,.06)');
    if (o.crack) cracks(g, CX, m.y + m.h * 0.45, o.crack);
    g.restore();
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 300, ['#22263a', '#07080e']); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.pool(g, CX, GY + 30, 500, 60, '#9fb8ff', 0.18); });
  return { GY, CX, M, m };
}
export function cracks(g, x, y, k, seed = 9) {
  const r = rng(seed); g.save(); g.shadowColor = '#ffffff'; g.shadowBlur = 6;
  const n = Math.round(4 + k * 14);
  for (let i = 0; i < n; i++) { const a = r() * Math.PI * 2, len = (80 + r() * 380) * clamp(k * 1.4); let px = x, py = y; const pts = [[px, py]]; for (let j = 1; j <= 5; j++) { px += Math.cos(a + (r() - 0.5) * 0.8) * len / 5; py += Math.sin(a + (r() - 0.5) * 0.8) * len / 5; pts.push([px, py]); } seg(g, pts, 1.5 + r() * 1.5, 'rgba(235,240,255,.85)'); }
  g.restore();
}

