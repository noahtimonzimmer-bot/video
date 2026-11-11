// Interiors + street dressing, built from inked boxes so the world ink pass outlines every piece (reference look:
// dense, saturated rooms - patterned wallpaper, rugs, framed pictures, shelves full of books, lamps, plants).
// Rooms float over the river west of the bridge (nothing else is seen there); walls and ceiling never cast shadows,
// furniture does. Every builder takes WORLD coordinates; local +z of a piece is its front.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad } from "./build";
import { ctex, rep, rng } from "./paint";

const INK = "#2a1f2b";
export type Side = "n" | "s" | "e" | "w";
const Q = (yaw: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw);
const M = (x: number, y: number, z: number, yaw = 0) => new THREE.Matrix4().compose(V(x, y, z), Q(yaw), V(1, 1, 1));
const UB = new THREE.BoxGeometry(1, 1, 1);
/** axis box in the local frame of m: centre (cx, cy, cz), size (sx, sy, sz) */
const bx = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) =>
  b.add(UB, mat, m.clone().multiply(new THREE.Matrix4().compose(V(cx, cy, cz), new THREE.Quaternion(), V(sx, sy, sz))));
const cyl = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, cx: number, cy: number, cz: number, r0: number, r1: number, h: number, seg = 14) =>
  b.add(new THREE.CylinderGeometry(r0, r1, h, seg), mat, m.clone().multiply(new THREE.Matrix4().makeTranslation(cx, cy, cz)));
const col = (c: string, emissive?: string) => lam("rc" + c + (emissive ?? ""), () => ({ color: c, ...(emissive ? { emissive } : {}) }));
const tmat = (key: string, t: THREE.Texture, emissive = false) => lam("rt" + key, () => ({ map: t, ...(emissive ? { emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0.55 } : {}) }));
/** a textured quad facing local +z, centred at (cx, cy, cz) in the frame of m */
const face = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, cx: number, cy: number, cz: number, w: number, h: number, u = 1, v = 1) =>
  b.add(quad(V(cx - w / 2, cy - h / 2, cz), V(cx + w / 2, cy - h / 2, cz), V(cx + w / 2, cy + h / 2, cz), V(cx - w / 2, cy + h / 2, cz), u, v), mat, m);

// ---------------- painted textures ----------------
type Paper = "stripe" | "damask" | "dots" | "diamond" | "flower";
export const wallpaper = (key: string, base: string, ink: string, kind: Paper, accent = "#ffffff") => ctex("wp" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  g.fillStyle = ink; g.strokeStyle = ink;
  if (kind === "stripe") { for (let x = 0; x < 512; x += 64) { g.fillRect(x, 0, 22, 512); g.globalAlpha = 0.5; g.fillRect(x + 34, 0, 6, 512); g.globalAlpha = 1; } }
  if (kind === "dots") for (let y = 0; y < 512; y += 64) for (let x = (y / 64) % 2 ? 32 : 0; x < 512 + 32; x += 64) { g.beginPath(); g.arc(x, y + 32, 9, 0, 7); g.fill(); }
  if (kind === "diamond") { g.lineWidth = 5; for (let k = -512; k < 1024; k += 85) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 512, 512); g.moveTo(k + 512, 0); g.lineTo(k, 512); g.stroke(); }
    g.fillStyle = accent; for (let y = 0; y < 512; y += 85.3) for (let x = 0; x < 512; x += 85.3) { g.beginPath(); g.arc(x + 42.6, y + 42.6, 6, 0, 7); g.fill(); } }
  if (kind === "damask" || kind === "flower") for (let y = 0; y < 512; y += 128) for (let x = (y / 128) % 2 ? 64 : 0; x < 576; x += 128) {
    g.save(); g.translate(x, y + 64);
    if (kind === "damask") { g.beginPath(); g.ellipse(0, 0, 22, 40, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-26, -6, 10, 22, -0.5, 0, 7); g.ellipse(26, -6, 10, 22, 0.5, 0, 7); g.fill();
      g.fillStyle = accent; g.beginPath(); g.ellipse(0, 0, 8, 16, 0, 0, 7); g.fill(); g.fillStyle = ink; }
    else { g.fillStyle = accent; for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.283; g.beginPath(); g.ellipse(Math.cos(a) * 13, Math.sin(a) * 13, 11, 7, a, 0, 7); g.fill(); }
      g.fillStyle = ink; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); g.fillStyle = "#5fa24a"; g.beginPath(); g.ellipse(22, 22, 12, 5, 0.8, 0, 7); g.fill(); g.fillStyle = ink; }
    g.restore();
  }
  void r;
});
const parquet = (key: string, a: string, c: string) => ctex("pq" + key, 512, 512, (g, r) => {
  for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) {
    const v = (x / 64 + y / 64) % 2;
    g.fillStyle = v ? a : c; g.fillRect(x, y, 64, 64);
    g.strokeStyle = "rgba(60,30,20,.35)"; g.lineWidth = 2;
    for (let k = 1; k < 4; k++) { g.beginPath(); if (v) { g.moveTo(x + k * 16, y); g.lineTo(x + k * 16, y + 64); } else { g.moveTo(x, y + k * 16); g.lineTo(x + 64, y + k * 16); } g.stroke(); }
    g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.06})`; g.fillRect(x, y, 64, 64);
  }
  g.strokeStyle = "rgba(50,25,20,.6)"; g.lineWidth = 3; for (let k = 0; k <= 512; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
});
const tiles = (key: string, a: string, c: string) => ctex("tl" + key, 512, 512, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? a : c; g.fillRect(x * 64, y * 64, 64, 64); }
  g.strokeStyle = "rgba(40,30,40,.35)"; g.lineWidth = 2; for (let k = 0; k <= 512; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 512); g.moveTo(0, k); g.lineTo(512, k); g.stroke(); }
});
const boards = (key: string, base: string) => ctex("bd" + key, 512, 512, (g, r) => {
  for (let y = 0; y < 512; y += 51.2) { g.fillStyle = base; g.fillRect(0, y, 512, 51.2); g.fillStyle = `rgba(${r() < 0.5 ? "255,240,210" : "70,35,20"},${0.06 + r() * 0.1})`; g.fillRect(0, y, 512, 51.2);
    g.strokeStyle = "rgba(60,30,15,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke();
    const j = r() * 512; g.beginPath(); g.moveTo(j, y); g.lineTo(j, y + 51.2); g.stroke(); }
});
export const rugTex = (key: string, c1: string, c2: string, c3: string, round = false) => ctex("rug" + key, 512, 512, (g) => {
  if (round) { [c1, c2, c3, c1, c2, c3, c1].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(256, 256, 250 - i * 36, 0, 7); g.fill(); }); return; }
  g.fillStyle = c1; g.fillRect(0, 0, 512, 512); g.fillStyle = c2; g.fillRect(34, 34, 444, 444); g.fillStyle = c3; g.fillRect(60, 60, 392, 392);
  g.fillStyle = c1; g.beginPath(); g.moveTo(256, 96); g.lineTo(416, 256); g.lineTo(256, 416); g.lineTo(96, 256); g.closePath(); g.fill();
  g.fillStyle = c3; g.beginPath(); g.moveTo(256, 130); g.lineTo(382, 256); g.lineTo(256, 382); g.lineTo(130, 256); g.closePath(); g.fill();
  g.fillStyle = c1; for (const [x, y] of [[110, 110], [402, 110], [110, 402], [402, 402]]) { g.beginPath(); g.arc(x, y, 26, 0, 7); g.fill(); }
  g.fillStyle = c2; g.beginPath(); g.arc(256, 256, 54, 0, 7); g.fill(); g.fillStyle = c1; g.beginPath(); g.arc(256, 256, 24, 0, 7); g.fill();
  g.fillStyle = c3; for (let k = 46; k < 466; k += 26) { g.fillRect(k, 44, 12, 8); g.fillRect(k, 460, 12, 8); g.fillRect(44, k, 8, 12); g.fillRect(460, k, 8, 12); }
});
const books = (key: string) => ctex("bk" + key, 512, 512, (g, r) => {
  const C = ["#c23b3b", "#2f6fb5", "#e0a72e", "#3f8f4c", "#7a3fa0", "#e06a2e", "#1f8f8f", "#b5325a", "#f0d27a", "#5a4fbf"];
  g.fillStyle = "#6b3f26"; g.fillRect(0, 0, 512, 512);
  for (let s = 0; s < 4; s++) {
    const y0 = s * 128 + 14, y1 = (s + 1) * 128 - 8;
    let x = 10;
    while (x < 500) {
      const w = 12 + r() * 16, h = (y1 - y0) * (0.68 + r() * 0.3);
      if (r() < 0.08) { x += 20; continue; }
      if (r() < 0.1) { g.fillStyle = C[Math.floor(r() * 10)]; g.fillRect(x, y1 - 14, 64, 14); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, y1 - 14, 64, 14); x += 68; continue; }
      g.fillStyle = C[Math.floor(r() * 10)]; g.fillRect(x, y1 - h, w, h);
      g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(x, y1 - h, w, h);
      g.fillStyle = "rgba(255,240,200,.75)"; g.fillRect(x + 2, y1 - h * 0.75, w - 4, 4); g.fillRect(x + 2, y1 - h * 0.3, w - 4, 3);
      x += w + 1;
    }
    g.fillStyle = "#8a5634"; g.fillRect(0, y1, 512, 22); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(-2, y1, 516, 22);
  }
});
type Pic = "hills" | "sea" | "flowers" | "portrait" | "city" | "abstract";
export const picture = (kind: Pic, seed = 1) => ctex("pic" + kind + seed, 256, 256, (g) => {
  const sk = g.createLinearGradient(0, 0, 0, 256); sk.addColorStop(0, "#7ec8f2"); sk.addColorStop(1, "#e8f6ff"); g.fillStyle = sk; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 4; g.strokeStyle = INK;
  if (kind === "hills") { g.fillStyle = "#ffd25a"; g.beginPath(); g.arc(190, 70, 26, 0, 7); g.fill(); g.fillStyle = "#6fbf4f"; g.beginPath(); g.ellipse(70, 256, 150, 120, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#4f9f3f"; g.beginPath(); g.ellipse(220, 256, 130, 90, 0, 0, 7); g.fill(); g.stroke(); }
  if (kind === "sea") { g.fillStyle = "#2f7fd0"; g.fillRect(0, 150, 256, 106); g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(110, 140); g.lineTo(150, 60); g.lineTo(150, 140); g.fill(); g.stroke(); g.fillStyle = "#b5552e"; g.fillRect(90, 140, 90, 22); g.strokeRect(90, 140, 90, 22); }
  if (kind === "flowers") { g.fillStyle = "#f4e0c0"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#3f7fbf"; g.fillRect(96, 150, 64, 90); g.strokeRect(96, 150, 64, 90);
    for (const [x, y, c] of [[100, 110, "#e8443a"], [150, 95, "#ffd25a"], [128, 70, "#e86ab0"], [80, 80, "#ff8a3a"], [175, 125, "#e8443a"]] as const) { g.fillStyle = c; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); g.stroke(); } }
  if (kind === "portrait") { g.fillStyle = "#3f6f4f"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#7a3a5a"; g.beginPath(); g.ellipse(128, 260, 90, 80, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#f2d2b0"; g.beginPath(); g.ellipse(128, 120, 52, 62, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(110, 115, 6, 0, 7); g.arc(146, 115, 6, 0, 7); g.fill(); g.beginPath(); g.arc(128, 140, 16, 0.3, 2.8); g.stroke(); g.fillStyle = "#5a3a2a"; g.beginPath(); g.ellipse(128, 70, 56, 26, 0, Math.PI, 0); g.fill(); }
  if (kind === "city") { g.fillStyle = "#ffb070"; g.fillRect(0, 0, 256, 256); for (let k = 0; k < 8; k++) { g.fillStyle = ["#7a4fa0", "#c2503b", "#3f6fb5", "#e0a72e"][k % 4]; const h = 60 + ((k * 53) % 90); g.fillRect(k * 32, 256 - h, 30, h); g.strokeRect(k * 32, 256 - h, 30, h); } }
  if (kind === "abstract") { g.fillStyle = "#fff4dc"; g.fillRect(0, 0, 256, 256); g.fillStyle = "#e8443a"; g.fillRect(30, 30, 110, 110); g.fillStyle = "#2f6fb5"; g.fillRect(140, 120, 90, 110); g.fillStyle = "#ffd25a"; g.beginPath(); g.arc(80, 190, 40, 0, 7); g.fill(); g.strokeRect(30, 30, 110, 110); g.strokeRect(140, 120, 90, 110); }
  void seed;
});
/** the view through a window: sky, clouds, roofs; tower = the iron tower on the skyline */
export const viewTex = (key: string, tower = false) => ctex("view" + key, 256, 384, (g, r) => {
  const sk = g.createLinearGradient(0, 0, 0, 384); sk.addColorStop(0, "#4fa8ec"); sk.addColorStop(1, "#cbeaff"); g.fillStyle = sk; g.fillRect(0, 0, 256, 384);
  g.fillStyle = "#ffffff"; for (let k = 0; k < 3; k++) { const x = r() * 256, y = 40 + r() * 120; g.beginPath(); g.arc(x, y, 22, 0, 7); g.arc(x + 24, y - 8, 26, 0, 7); g.arc(x + 50, y, 20, 0, 7); g.fill(); }
  if (tower) { g.fillStyle = "#9a6440"; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(150, 60); g.lineTo(170, 300); g.lineTo(200, 300); g.lineTo(156, 60); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(150, 60); g.lineTo(130, 300); g.lineTo(100, 300); g.lineTo(144, 60); g.closePath(); g.fill(); g.fillRect(118, 210, 64, 7); g.fillRect(132, 150, 36, 6); g.fillRect(148, 40, 4, 24); }
  for (let x = -10; x < 256; x += 40 + r() * 20) { const h = 70 + r() * 70; g.fillStyle = ["#e9b36a", "#d9785a", "#f0d6a8", "#c9884a"][Math.floor(r() * 4)]; g.fillRect(x, 384 - h, 44, h);
    g.fillStyle = "#c2503b"; g.beginPath(); g.moveTo(x - 4, 384 - h); g.lineTo(x + 22, 384 - h - 22); g.lineTo(x + 48, 384 - h); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(x, 384 - h, 44, h); g.fillStyle = "#4f86c6"; for (let y = 384 - h + 14; y < 370; y += 26) { g.fillRect(x + 8, y, 10, 14); g.fillRect(x + 26, y, 10, 14); } }
});
const clockFace = () => ctex("rclock", 256, 256, (g) => {
  g.fillStyle = "#fff8e8"; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
  g.lineWidth = 6; for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283; g.beginPath(); g.moveTo(128 + Math.cos(a) * 96, 128 + Math.sin(a) * 96); g.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); g.stroke(); }
  g.lineWidth = 9; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 60); g.moveTo(128, 128); g.lineTo(178, 150); g.stroke();
});
export const screenTex = (key: string, draw: (g: CanvasRenderingContext2D) => void) => ctex("scr" + key, 320, 240, draw);
const curtainTex = (c: string) => ctex("curt" + c, 128, 256, (g) => {
  g.fillStyle = c; g.fillRect(0, 0, 128, 256);
  for (let x = 0; x < 128; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, "rgba(0,0,0,.22)"); gr.addColorStop(0.5, "rgba(255,255,255,.18)"); gr.addColorStop(1, "rgba(0,0,0,.22)"); g.fillStyle = gr; g.fillRect(x, 0, 32, 256); }
});

// ---------------- room shell ----------------
export type RoomSpec = {
  x0: number; x1: number; z0: number; z1: number; y: number; h: number;
  paper: THREE.Texture; floor: "parquet" | "tiles" | "boards"; floorCols?: [string, string];
  wainscot?: string; open?: Side[]; trim?: string; ceiling?: string;
};
export type Room = RoomSpec & { cx: number; cz: number };
/** frame on a wall: local x along the wall, y up from the floor, +z into the room */
export const wallM = (r: Room, side: Side, along: number, y = 0) => {
  if (side === "s") return M(along, r.y + y, r.z0, 0);
  if (side === "n") return M(along, r.y + y, r.z1, Math.PI);
  if (side === "w") return M(r.x0, r.y + y, along, Math.PI / 2);
  return M(r.x1, r.y + y, along, -Math.PI / 2);
};
export const room = (shell: Batch, spec: RoomSpec): Room => {
  const r: Room = { ...spec, cx: (spec.x0 + spec.x1) / 2, cz: (spec.z0 + spec.z1) / 2 };
  const W = r.x1 - r.x0, D = r.z1 - r.z0, fc = r.floorCols ?? ["#c98a52", "#b47442"];
  const ft = r.floor === "parquet" ? parquet(fc.join(), fc[0], fc[1]) : r.floor === "tiles" ? tiles(fc.join(), fc[0], fc[1]) : boards(fc[0], fc[0]);
  shell.add(quad(V(r.x0, r.y, r.z1), V(r.x1, r.y, r.z1), V(r.x1, r.y, r.z0), V(r.x0, r.y, r.z0), W / 1.6, D / 1.6), lam("rfl" + ft.uuid, () => ({ map: ft })));
  shell.add(boxGeo(V(r.x0 - 0.3, r.y - 0.6, r.z0 - 0.3), V(r.x1 + 0.3, r.y - 0.01, r.z1 + 0.3)), col("#6b4a3a"));
  if (r.ceiling) { // lit from below by the room, never the sun: a self-lit warm plaster with painted beams
    const cm = lam("rceil" + r.ceiling, () => ({ color: r.ceiling, emissive: r.ceiling, emissiveIntensity: 0.62 }));
    shell.add(quad(V(r.x0, r.y + r.h, r.z0), V(r.x1, r.y + r.h, r.z0), V(r.x1, r.y + r.h, r.z1), V(r.x0, r.y + r.h, r.z1)), cm);
    const bm = lam("rbeam", () => ({ color: "#b5754a", emissive: "#5a3420", emissiveIntensity: 0.5 }));
    for (let x = r.x0 + 1.2; x < r.x1 - 0.6; x += 1.6) shell.add(UB, bm, new THREE.Matrix4().compose(V(x, r.y + r.h - 0.09, r.cz), new THREE.Quaternion(), V(0.16, 0.18, D)));
  }
  const pm = lam("rwp" + r.paper.uuid, () => ({ map: r.paper })), tr = col(r.trim ?? "#f4ead2"), wn = r.wainscot ? col(r.wainscot) : null;
  for (const side of ["n", "s", "e", "w"] as Side[]) {
    if (r.open?.includes(side)) continue;
    const len = side === "n" || side === "s" ? W : D, mid = side === "n" || side === "s" ? r.cx : r.cz, m = wallM(r, side, mid);
    shell.add(quad(V(-len / 2, 0, 0), V(len / 2, 0, 0), V(len / 2, r.h, 0), V(-len / 2, r.h, 0), len / 1.2, r.h / 1.2), pm, m);
    bx(shell, col("#7a5a4a"), m, 0, r.h / 2, -0.12, len + 0.5, r.h + 1.2, 0.2); // wall body (no light leaks)
    if (wn) { bx(shell, wn, m, 0, 0.5, 0.025, len, 1.0, 0.05); bx(shell, tr, m, 0, 1.02, 0.05, len, 0.07, 0.1); }
    bx(shell, tr, m, 0, 0.07, 0.04, len, 0.14, 0.08);           // skirting
    bx(shell, tr, m, 0, r.h - 0.08, 0.05, len, 0.16, 0.1);      // cornice
  }
  return r;
};

// ---------------- wall pieces (on a wall frame from wallM) ----------------
export const frame = (b: Batch, m: THREE.Matrix4, u: number, y: number, w: number, h: number, pic: THREE.Texture, fr = "#d9a43a") => {
  bx(b, col(fr), m, u, y, 0.03, w + 0.12, h + 0.12, 0.06);
  face(b, tmat("pic" + pic.uuid, pic), m, u, y, 0.065, w, h);
};
export const windowOn = (b: Batch, m: THREE.Matrix4, u: number, y0: number, w: number, h: number, view: THREE.Texture, curtain = "#c2413b", frameCol = "#f4f0e4") => {
  face(b, tmat("view" + view.uuid, view, true), m, u, y0 + h / 2, 0.02, w, h);
  const fm = col(frameCol);
  bx(b, fm, m, u, y0 - 0.05, 0.08, w + 0.24, 0.1, 0.18); bx(b, fm, m, u, y0 + h + 0.05, 0.05, w + 0.24, 0.1, 0.1);
  for (const s of [-1, 1]) bx(b, fm, m, u + s * (w / 2 + 0.06), y0 + h / 2, 0.05, 0.12, h + 0.2, 0.1);
  bx(b, fm, m, u, y0 + h / 2, 0.04, 0.05, h, 0.05); bx(b, fm, m, u, y0 + h * 0.62, 0.04, w, 0.05, 0.05);
  if (curtain) {
    const cm = tmat("curt" + curtain, curtainTex(curtain));
    for (const s of [-1, 1]) { const cx = u + s * (w / 2 + 0.22); bx(b, col(curtain), m, cx, y0 + h / 2 + 0.1, 0.13, 0.42, h + 0.55, 0.08); face(b, cm, m, cx, y0 + h / 2 + 0.1, 0.171, 0.42, h + 0.55); }
    cyl(b, col("#8a5a2a"), m.clone().multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)), y0 + h + 0.4, -u, 0.18, 0.025, 0.025, w + 1.2, 8);
  }
};
export const door = (b: Batch, m: THREE.Matrix4, u: number, c = "#7a4a2e", trim = "#f4ead2") => {
  bx(b, col(trim), m, u, 1.08, 0.03, 1.12, 2.24, 0.06);
  bx(b, col(c), m, u, 1.04, 0.06, 0.94, 2.08, 0.04);
  for (const [y, hh] of [[1.55, 0.7], [0.55, 0.6]]) bx(b, col(c === "#7a4a2e" ? "#8f5a38" : "#ffffff"), m, u, y, 0.085, 0.66, hh, 0.02);
  cyl(b, col("#e0b25a"), m.clone().multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)), u + 0.36, 0.1, -1.0, 0.04, 0.04, 0.06, 8);
};
export const wallClock = (b: Batch, m: THREE.Matrix4, u: number, y: number, r = 0.22) => {
  cyl(b, col("#8a5a2a"), m.clone().multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2)), u, 0.03, -y, r + 0.03, r + 0.03, 0.06, 24);
  face(b, lam("rclockf", () => ({ map: clockFace(), alphaTest: 0.5 })), m, u, y, 0.065, r * 2, r * 2);
};
export const shelfOn = (b: Batch, m: THREE.Matrix4, u: number, y: number, w: number, items: number, seed = 1) => {
  bx(b, col("#8a5634"), m, u, y, 0.13, w, 0.05, 0.26);
  const r = rng(seed * 7 + 3), C = ["#e8443a", "#2f6fb5", "#ffd25a", "#3f8f4c", "#e86ab0", "#ff8a3a", "#ffffff"];
  for (let k = 0; k < items; k++) {
    const x = u - w / 2 + 0.1 + (k + 0.5) * ((w - 0.2) / items), c = col(C[Math.floor(r() * C.length)]), t = r();
    if (t < 0.35) cyl(b, c, m, x, y + 0.12, 0.13, 0.05, 0.06, 0.2, 10);
    else if (t < 0.65) bx(b, c, m, x, y + 0.08, 0.13, 0.12, 0.12, 0.12);
    else { cyl(b, col("#c9774a"), m, x, y + 0.07, 0.13, 0.07, 0.05, 0.12, 10); b.add(new THREE.SphereGeometry(0.1, 10, 8), col("#5aa83c"), m.clone().multiply(new THREE.Matrix4().makeTranslation(x, y + 0.2, 0.13))); }
  }
};
export const poster = (b: Batch, m: THREE.Matrix4, u: number, y: number, w: number, h: number, t: THREE.Texture) => face(b, tmat("post" + t.uuid, t), m, u, y, 0.015, w, h);

// ---------------- furniture (world x, z, yaw; local +z = front) ----------------
const WOOD = "#9a5f36", WOOD2 = "#7a4a2e";
export const table = (b: Batch, x: number, y: number, z: number, w: number, d: number, h = 0.76, yaw = 0, cloth?: string, top = WOOD) => {
  const m = M(x, y, z, yaw);
  bx(b, col(top), m, 0, h - 0.03, 0, w, 0.06, d);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(b, col(WOOD2), m, sx * (w / 2 - 0.07), (h - 0.06) / 2, sz * (d / 2 - 0.07), 0.07, h - 0.06, 0.07);
  if (cloth) { bx(b, col(cloth), m, 0, h + 0.005, 0, w + 0.06, 0.02, d + 0.06); for (const sz of [-1, 1]) bx(b, col(cloth), m, 0, h - 0.13, sz * (d / 2 + 0.035), w + 0.06, 0.26, 0.02); }
};
export const roundTable = (b: Batch, x: number, y: number, z: number, r: number, h = 0.74, c = "#f4f0e4") => {
  const m = M(x, y, z);
  cyl(b, col(c), m, 0, h - 0.02, 0, r, r, 0.04, 24); cyl(b, col("#3a3a46"), m, 0, h / 2, 0, 0.035, 0.035, h, 8); cyl(b, col("#3a3a46"), m, 0, 0.02, 0, 0.24, 0.26, 0.04, 16);
};
export const chair = (b: Batch, x: number, y: number, z: number, yaw: number, c = "#c2413b", frameC = WOOD2) => {
  const m = M(x, y, z, yaw);
  bx(b, col(c), m, 0, 0.46, 0, 0.44, 0.07, 0.44);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(b, col(frameC), m, sx * 0.19, 0.23, sz * 0.19, 0.045, 0.46, 0.045);
  for (const sx of [-1, 1]) bx(b, col(frameC), m, sx * 0.19, 0.72, -0.2, 0.045, 0.52, 0.045);
  bx(b, col(c), m, 0, 0.8, -0.2, 0.4, 0.26, 0.05);
};
export const sofa = (b: Batch, x: number, y: number, z: number, yaw: number, w = 2.0, c = "#2f8f8f", cushion = "#ffd25a") => {
  const m = M(x, y, z, yaw);
  bx(b, col(c), m, 0, 0.24, 0, w, 0.32, 0.86); bx(b, col(c), m, 0, 0.62, -0.33, w, 0.56, 0.22);
  for (const s of [-1, 1]) bx(b, col(c), m, s * (w / 2 - 0.1), 0.5, 0.02, 0.2, 0.36, 0.82);
  const n = Math.max(2, Math.round(w / 0.8));
  for (let k = 0; k < n; k++) bx(b, col(c === "#2f8f8f" ? "#3fa3a0" : c), m, -w / 2 + 0.2 + (k + 0.5) * ((w - 0.4) / n), 0.45, 0.05, (w - 0.45) / n, 0.12, 0.66);
  bx(b, col(cushion), m, -w / 2 + 0.42, 0.66, -0.12, 0.38, 0.34, 0.14); bx(b, col("#e8443a"), m, w / 2 - 0.42, 0.66, -0.12, 0.38, 0.34, 0.14);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(b, col(WOOD2), m, sx * (w / 2 - 0.08), 0.04, sz * 0.36, 0.06, 0.08, 0.06);
};
export const armchair = (b: Batch, x: number, y: number, z: number, yaw: number, c = "#c2413b") => sofa(b, x, y, z, yaw, 0.95, c, "#ffd25a");
export const bed = (b: Batch, x: number, y: number, z: number, yaw: number, blanket = "#3f6fb5") => {
  const m = M(x, y, z, yaw); // headboard at local -z
  bx(b, col(WOOD), m, 0, 0.22, 0, 1.5, 0.3, 2.1); bx(b, col("#f6f2ea"), m, 0, 0.44, 0, 1.42, 0.16, 2.0);
  bx(b, col(blanket), m, 0, 0.53, 0.25, 1.52, 0.08, 1.5); bx(b, col(blanket), m, 0, 0.35, 1.0, 1.52, 0.38, 0.04);
  for (const s of [-1, 1]) bx(b, col("#ffffff"), m, s * 0.35, 0.6, -0.78, 0.6, 0.16, 0.36);
  bx(b, col(WOOD2), m, 0, 0.6, -1.06, 1.6, 1.2, 0.08); bx(b, col(WOOD), m, 0, 1.2, -1.06, 1.7, 0.1, 0.12);
};
export const wardrobe = (b: Batch, x: number, y: number, z: number, yaw: number, w = 1.2, h = 2.1, c = WOOD) => {
  const m = M(x, y, z, yaw);
  bx(b, col(c), m, 0, h / 2 + 0.06, 0, w, h - 0.12, 0.6); bx(b, col(WOOD2), m, 0, h - 0.03, 0, w + 0.1, 0.08, 0.66); bx(b, col(WOOD2), m, 0, 0.05, 0, w, 0.1, 0.56);
  for (const s of [-1, 1]) { bx(b, col("#b5754a"), m, s * w / 4, h / 2 + 0.1, 0.305, w / 2 - 0.12, h - 0.45, 0.02); cyl(b, col("#e0b25a"), m, s * 0.06, h / 2, 0.32, 0.025, 0.025, 0.12, 8); }
};
export const bookcase = (b: Batch, x: number, y: number, z: number, yaw: number, w = 1.3, h = 2.1, seed = 1) => {
  const m = M(x, y, z, yaw);
  bx(b, col(WOOD2), m, 0, h / 2, -0.05, w, h, 0.3);
  for (const s of [-1, 1]) bx(b, col(WOOD), m, s * (w / 2 - 0.03), h / 2, 0.08, 0.06, h, 0.06);
  bx(b, col(WOOD), m, 0, h - 0.03, 0.08, w, 0.08, 0.08); bx(b, col(WOOD), m, 0, 0.04, 0.08, w, 0.08, 0.08);
  face(b, tmat("books" + seed, rep(books("s" + seed), 1, 1)), m, 0, h / 2, 0.105, w - 0.1, h - 0.14);
};
export const desk = (b: Batch, x: number, y: number, z: number, yaw: number, w = 1.5, c = WOOD) => {
  const m = M(x, y, z, yaw);
  bx(b, col(c), m, 0, 0.75, 0, w, 0.06, 0.75);
  bx(b, col(WOOD2), m, -w / 2 + 0.25, 0.36, 0, 0.46, 0.72, 0.7);
  for (const yy of [0.18, 0.42, 0.62]) { bx(b, col("#b5754a"), m, -w / 2 + 0.25, yy, 0.355, 0.4, 0.17, 0.02); cyl(b, col("#e0b25a"), m, -w / 2 + 0.25, yy, 0.375, 0.02, 0.02, 0.02, 8); }
  for (const sz of [-1, 1]) bx(b, col(WOOD2), m, w / 2 - 0.05, 0.36, sz * 0.32, 0.06, 0.72, 0.06);
};
export const tableLamp = (b: Batch, x: number, y: number, z: number, shade = "#ffd25a") => {
  const m = M(x, y, z);
  cyl(b, col("#2f6a43"), m, 0, 0.03, 0, 0.1, 0.12, 0.06, 12); cyl(b, col("#e0b25a"), m, 0, 0.2, 0, 0.02, 0.02, 0.34, 8);
  cyl(b, col(shade, "#7a5a10"), m, 0, 0.42, 0, 0.1, 0.19, 0.2, 16);
};
export const floorLamp = (b: Batch, x: number, y: number, z: number, shade = "#ffb84a") => {
  const m = M(x, y, z);
  cyl(b, col("#3a3a46"), m, 0, 0.02, 0, 0.18, 0.2, 0.04, 14); cyl(b, col("#3a3a46"), m, 0, 0.8, 0, 0.02, 0.02, 1.56, 8);
  cyl(b, col(shade, "#6a4a10"), m, 0, 1.62, 0, 0.16, 0.28, 0.3, 16);
};
export const plant = (b: Batch, x: number, y: number, z: number, h = 1.1, pot = "#c9774a") => {
  const m = M(x, y, z), r = rng(Math.round(x * 13 + z * 7));
  cyl(b, col(pot), m, 0, 0.17, 0, 0.2, 0.15, 0.34, 14); bx(b, col("#5a3a2a"), m, 0, 0.33, 0, 0.3, 0.02, 0.3);
  const L = [col("#4f9f3f"), col("#5fb04a"), col("#3f8f3c")];
  for (let k = 0; k < 7; k++) { const a = r() * 6.283, d = k ? 0.12 + r() * 0.12 : 0, s = 0.17 + r() * 0.1;
    b.add(new THREE.SphereGeometry(s, 12, 9), L[k % 3], m.clone().multiply(new THREE.Matrix4().makeTranslation(Math.cos(a) * d, 0.35 + (h - 0.35) * (0.45 + r() * 0.45), Math.sin(a) * d))); }
};
export const rug = (b: Batch, x: number, y: number, z: number, w: number, d: number, t: THREE.Texture, yaw = 0) =>
  b.add(quad(V(-w / 2, 0.012, d / 2), V(w / 2, 0.012, d / 2), V(w / 2, 0.012, -d / 2), V(-w / 2, 0.012, -d / 2)), lam("rrug" + t.uuid, () => ({ map: t, alphaTest: 0.5 })), M(x, y, z, yaw));
export const chandelier = (b: Batch, x: number, y: number, z: number) => {
  const m = M(x, y, z), g = col("#e0b25a");
  cyl(b, g, m, 0, 0.5, 0, 0.015, 0.015, 1.0, 6); cyl(b, g, m, 0, 0, 0, 0.12, 0.05, 0.18, 12);
  b.add(new THREE.TorusGeometry(0.45, 0.025, 6, 32).rotateX(Math.PI / 2), g, m);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; cyl(b, col("#fff4d0", "#ffd890"), m, Math.cos(a) * 0.45, 0.1, Math.sin(a) * 0.45, 0.025, 0.025, 0.16, 6);
    b.add(new THREE.SphereGeometry(0.045, 8, 6), col("#fff8e0", "#ffe0a0"), m.clone().multiply(new THREE.Matrix4().makeTranslation(Math.cos(a) * 0.45, 0.21, Math.sin(a) * 0.45))); }
};
export const fireplace = (b: Batch, m: THREE.Matrix4, u: number, c = "#e9dcc4") => {
  bx(b, col(c), m, u, 0.6, 0.18, 1.7, 1.2, 0.36); bx(b, col("#2a1f2b"), m, u, 0.42, 0.25, 0.9, 0.7, 0.3);
  bx(b, col(c), m, u, 1.24, 0.24, 1.95, 0.08, 0.48);
  for (let k = 0; k < 3; k++) b.add(new THREE.ConeGeometry(0.12 - k * 0.02, 0.36 - k * 0.06, 8), col(["#ff8a2a", "#ffd25a", "#ff5a2a"][k], ["#ff6a00", "#ffb000", "#ff3a00"][k]), m.clone().multiply(new THREE.Matrix4().makeTranslation(u - 0.18 + k * 0.18, 0.3, 0.28)));
  bx(b, col("#6b3f26"), m, u, 0.12, 0.3, 0.7, 0.08, 0.12);
};
export const computer = (b: Batch, x: number, y: number, z: number, yaw: number, scr: THREE.Texture) => {
  const m = M(x, y, z, yaw);
  bx(b, col("#e6e2d6"), m, 0, 0.34, -0.05, 0.62, 0.48, 0.4); face(b, tmat("scr" + scr.uuid, scr, true), m, 0, 0.36, 0.152, 0.52, 0.38);
  bx(b, col("#e6e2d6"), m, 0, 0.06, 0, 0.3, 0.1, 0.24); bx(b, col("#d8d4c8"), m, 0, 0.015, 0.36, 0.5, 0.03, 0.17);
  bx(b, col("#d8d4c8"), m, 0.42, 0.015, 0.36, 0.08, 0.03, 0.12);
};
export const typewriter = (b: Batch, x: number, y: number, z: number, yaw: number) => {
  const m = M(x, y, z, yaw);
  bx(b, col("#2a2a34"), m, 0, 0.06, 0, 0.42, 0.12, 0.34); bx(b, col("#2a2a34"), m, 0, 0.15, -0.1, 0.46, 0.08, 0.1);
  bx(b, col("#ffffff"), m, 0, 0.27, -0.12, 0.26, 0.24, 0.01);
  for (let k = 0; k < 10; k++) cyl(b, col("#f4f0e4"), m, -0.16 + k * 0.035, 0.13, 0.1, 0.012, 0.012, 0.02, 6);
};
export const papers = (b: Batch, x: number, y: number, z: number, n = 4, seed = 1) => {
  const r = rng(seed);
  for (let k = 0; k < n; k++) b.add(quad(V(-0.1, 0, 0.14), V(0.1, 0, 0.14), V(0.1, 0, -0.14), V(-0.1, 0, -0.14)), col(k % 3 ? "#ffffff" : "#fff2c0"), M(x + (r() - 0.5) * 0.3, y + 0.002 + k * 0.002, z + (r() - 0.5) * 0.2, r() * 1.2 - 0.6));
};
export const cup = (b: Batch, x: number, y: number, z: number, c = "#ffffff") => { const m = M(x, y, z); cyl(b, col(c), m, 0, 0.05, 0, 0.045, 0.04, 0.1, 10); cyl(b, col("#ffffff"), m, 0, 0.003, 0, 0.08, 0.08, 0.006, 14); };
export const vase = (b: Batch, x: number, y: number, z: number, c = "#2f6fb5") => {
  const m = M(x, y, z); cyl(b, col(c), m, 0, 0.12, 0, 0.05, 0.08, 0.24, 12);
  for (const [dx, dz, fc] of [[0, 0, "#e8443a"], [0.07, 0.03, "#ffd25a"], [-0.06, 0.04, "#e86ab0"], [0.02, -0.07, "#ff8a3a"]] as const) {
    cyl(b, col("#3f8f3c"), m, dx / 2, 0.3, dz / 2, 0.006, 0.006, 0.16, 5); b.add(new THREE.SphereGeometry(0.045, 8, 6), col(fc), m.clone().multiply(new THREE.Matrix4().makeTranslation(dx, 0.4, dz))); }
};
export const box = (b: Batch, x: number, y: number, z: number, w: number, h: number, d: number, c: string, yaw = 0) => bx(b, col(c), M(x, y, z, yaw), 0, h / 2, 0, w, h, d);
export const coatRack = (b: Batch, x: number, y: number, z: number, coats: string[]) => {
  const m = M(x, y, z);
  cyl(b, col(WOOD2), m, 0, 0.9, 0, 0.03, 0.04, 1.8, 8); cyl(b, col(WOOD2), m, 0, 0.03, 0, 0.25, 0.28, 0.06, 12);
  coats.forEach((c, k) => { const a = (k / coats.length) * 6.283; bx(b, col(c), M(x + Math.cos(a) * 0.14, y, z + Math.sin(a) * 0.14, -a), 0, 1.25, 0, 0.32, 0.8, 0.12); });
};
export const softbox = (b: Batch, x: number, y: number, z: number, yaw: number) => {
  const m = M(x, y, z, yaw);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * 6.283; bx(b, col("#2a2a34"), m, Math.cos(a) * 0.22, 0.4, Math.sin(a) * 0.22, 0.03, 0.8, 0.03); }
  cyl(b, col("#2a2a34"), m, 0, 1.2, 0, 0.02, 0.02, 0.9, 6);
  bx(b, col("#2a2a34"), m, 0, 1.75, -0.1, 0.62, 0.5, 0.26); face(b, col("#ffffff", "#ffffff"), m, 0, 1.75, 0.035, 0.56, 0.44);
};
/** seamless photo backdrop: paper hanging from a pole and curving onto the floor */
export const backdrop = (b: Batch, x: number, y: number, z: number, yaw: number, w: number, c: string) => {
  const m = M(x, y, z, yaw), pm = lam("rbd" + c, () => ({ color: c, emissive: c, emissiveIntensity: 0.45 }));
  face(b, pm, m, 0, 1.45, 0, w, 2.5);
  b.add(quad(V(-w / 2, 0.01, 1.4), V(w / 2, 0.01, 1.4), V(w / 2, 0.2, 0), V(-w / 2, 0.2, 0)).rotateX(0), pm, m);
  cyl(b, col("#3a3a46"), m.clone().multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)), 2.75, 0, 0, 0.06, 0.06, w + 0.3, 10);
  for (const s of [-1, 1]) cyl(b, col("#3a3a46"), m, s * (w / 2 + 0.12), 1.4, 0, 0.025, 0.025, 2.8, 6);
};

// ---------------- street dressing ----------------
export const lantern = (b: Batch, x: number, y: number, z: number, h = 3.2) => {
  const m = M(x, y, z), k = col("#2f3a4a");
  cyl(b, k, m, 0, 0.15, 0, 0.14, 0.18, 0.3, 10); cyl(b, k, m, 0, h / 2, 0, 0.05, 0.07, h, 8);
  cyl(b, col("#fff0b0", "#ffcf60"), m, 0, h + 0.18, 0, 0.16, 0.12, 0.34, 6); cyl(b, k, m, 0, h + 0.4, 0, 0.02, 0.24, 0.12, 6);
};
export const bench = (b: Batch, x: number, y: number, z: number, yaw: number, c = "#3f8f4c") => {
  const m = M(x, y, z, yaw);
  for (let k = 0; k < 3; k++) bx(b, col(c), m, 0, 0.44, -0.16 + k * 0.14, 1.6, 0.04, 0.11);
  for (let k = 0; k < 2; k++) bx(b, col(c), m, 0, 0.62 + k * 0.16, -0.28, 1.6, 0.11, 0.04);
  for (const s of [-1, 1]) { bx(b, col("#2f3a4a"), m, s * 0.7, 0.22, 0, 0.06, 0.44, 0.42); bx(b, col("#2f3a4a"), m, s * 0.7, 0.62, -0.3, 0.06, 0.44, 0.05); }
};
export const flowerBox = (b: Batch, x: number, y: number, z: number, yaw: number, w = 1.0) => {
  const m = M(x, y, z, yaw), r = rng(Math.round(x * 31 + z * 17 + y * 5));
  bx(b, col("#b5552e"), m, 0, 0.12, 0, w, 0.24, 0.26);
  const C = ["#e8443a", "#ffd25a", "#e86ab0", "#ffffff", "#ff8a3a"];
  for (let k = 0; k < Math.round(w * 7); k++) {
    const px = -w / 2 + 0.07 + r() * (w - 0.14);
    b.add(new THREE.SphereGeometry(0.07, 8, 6), col("#4f9f3f"), m.clone().multiply(new THREE.Matrix4().makeTranslation(px, 0.27, (r() - 0.5) * 0.12)));
    b.add(new THREE.SphereGeometry(0.045, 8, 6), col(C[Math.floor(r() * C.length)]), m.clone().multiply(new THREE.Matrix4().makeTranslation(px + 0.02, 0.36 + r() * 0.06, (r() - 0.5) * 0.14)));
  }
};
export const barrel = (b: Batch, x: number, y: number, z: number) => {
  const m = M(x, y, z);
  cyl(b, col("#a8683a"), m, 0, 0.42, 0, 0.3, 0.26, 0.84, 14);
  for (const yy of [0.15, 0.69]) cyl(b, col("#3a3a46"), m, 0, yy, 0, 0.29, 0.29, 0.05, 14);
};
export const crate = (b: Batch, x: number, y: number, z: number, s = 0.6, yaw = 0, c = "#c98a52") => {
  const m = M(x, y, z, yaw);
  bx(b, col(c), m, 0, s / 2, 0, s, s, s);
  for (const sz of [-1, 1]) { bx(b, col("#8a5634"), m, 0, s / 2, sz * (s / 2 + 0.005), s, 0.07, 0.01); bx(b, col("#8a5634"), m, 0, s / 2, sz * (s / 2 + 0.01), 0.07, s, 0.01); }
};
export const awning = (b: Batch, x: number, y: number, z: number, yaw: number, w: number, a = "#e8443a", c = "#ffffff") => {
  const m = M(x, y, z, yaw), n = Math.round(w / 0.4);
  for (let k = 0; k < n; k++) {
    const u = -w / 2 + (k + 0.5) * (w / n), mm = col(k % 2 ? a : c);
    b.add(quad(V(u - w / n / 2, 0, 1.2), V(u + w / n / 2, 0, 1.2), V(u + w / n / 2, 0.55, 0), V(u - w / n / 2, 0.55, 0)), mm, m);
    b.add(quad(V(u - w / n / 2, -0.2, 1.21), V(u + w / n / 2, -0.2, 1.21), V(u + w / n / 2, 0, 1.21), V(u - w / n / 2, 0, 1.21)), mm, m);
  }
};
export const cafeSet = (b: Batch, x: number, y: number, z: number, seed = 1, cloth = "#e8443a") => {
  roundTable(b, x, y, z, 0.38, 0.74, cloth);
  const r = rng(seed);
  for (let k = 0; k < 2; k++) { const a = r() * 0.6 + k * Math.PI; chair(b, x + Math.cos(a) * 0.62, y, z + Math.sin(a) * 0.62, -a - Math.PI / 2, k ? "#2f6fb5" : "#3f8f4c", "#3a3a46"); }
  cup(b, x + 0.1, y + 0.74, z - 0.05);
};
export const kiosk = (b: Batch, x: number, y: number, z: number, c = "#2f6a43") => {
  const m = M(x, y, z);
  cyl(b, col(c), m, 0, 1.5, 0, 0.75, 0.75, 3.0, 12); cyl(b, col(c), m, 0, 3.1, 0, 0.2, 0.95, 0.5, 12); b.add(new THREE.SphereGeometry(0.18, 10, 8), col("#e0b25a"), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 3.45, 0)));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283; b.add(quad(V(-0.25, 0, 0), V(0.25, 0, 0), V(0.25, 0.7, 0), V(-0.25, 0.7, 0)), col(["#ffd25a", "#e8443a", "#ffffff", "#2f6fb5"][k % 4]), M(x + Math.cos(a) * 0.765, y + 1.3, z + Math.sin(a) * 0.765, Math.PI / 2 - a)); }
};
export const bike = (b: Batch, x: number, y: number, z: number, yaw: number, c = "#e8443a") => {
  const m = M(x, y, z, yaw), k = col("#2a2a34");
  for (const s of [-1, 1]) b.add(new THREE.TorusGeometry(0.32, 0.03, 6, 24).rotateY(Math.PI / 2), k, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.34, s * 0.5)));
  bx(b, col(c), m, 0, 0.55, 0, 0.04, 0.04, 0.8); bx(b, col(c), m, 0, 0.62, -0.32, 0.04, 0.5, 0.04); bx(b, col(c), m, 0, 0.72, 0.34, 0.04, 0.5, 0.04);
  bx(b, k, m, 0, 0.9, -0.32, 0.12, 0.04, 0.22); bx(b, k, m, 0, 0.98, 0.34, 0.5, 0.03, 0.03);
};
export const pendant = (b: Batch, x: number, y: number, z: number, c = "#2f8f8f") => { // y = ceiling height
  const m = M(x, y, z);
  cyl(b, col("#2a2a34"), m, 0, -0.35, 0, 0.01, 0.01, 0.7, 5); cyl(b, col(c), m, 0, -0.8, 0, 0.08, 0.34, 0.24, 18);
  b.add(new THREE.SphereGeometry(0.08, 10, 8), col("#fff8e0", "#ffe8a0"), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, -0.92, 0)));
};
export const laptop = (b: Batch, x: number, y: number, z: number, yaw: number, scr: THREE.Texture) => {
  const m = M(x, y, z, yaw);
  bx(b, col("#c9ccd6"), m, 0, 0.012, 0.08, 0.42, 0.024, 0.3);
  const lid = m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.024, -0.07)).multiply(new THREE.Matrix4().makeRotationX(-0.25));
  bx(b, col("#3a3f4c"), lid, 0, 0.15, 0, 0.42, 0.3, 0.02); face(b, tmat("scr" + scr.uuid, scr, true), lid, 0, 0.15, 0.011, 0.37, 0.25);
};
