// "My City" scenery: Middle (plaza, fountain, bell tower, three rings of houses, trees, lanterns), the round ivy wall
// with four gates and gate towers, the generated labyrinth around it, the round courtyard with the door, and the
// corridor kits (story set pieces) far east. Everything is static: one Batch per material.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad, house, addVeg } from "./build";
import { ctex, rep, rng, cobbleHD, grassHD, stoneHD } from "./paint";
import * as R from "./rooms";
import {
  WALL_R, WALL_T, WALL_H, GATE_W, GATE_H, MAZE_CELL, MAZE_N, MAZE_H, MAZE_T, COURT, COURT_R, STEPS_R, BELLTOWER, BT_A, RINGS, NAMED, houseAt,
  KIT, KIT_W, V3,
} from "./layout";

const TAU = Math.PI * 2;
// ---------------- textures ----------------
/** warm sandstone blocks with ivy hanging from the top (one image = one wall face, top at v = 1) */
export const ivyTex = (key: string, w: number, h: number, ivy = 0.55, tally = 0) => ctex("ivy" + key, w, h, (g, r) => {
  const cols = ["#dcb47e", "#cf9f68", "#e6c38e", "#c4915a", "#d8ad74"];
  g.fillStyle = "#8a6a46"; g.fillRect(0, 0, w, h);
  const RH = Math.round(h / 22);
  for (let row = 0; row * RH < h; row++) {
    let x = (row % 2) * 50 - r() * 40;
    while (x < w) {
      const bw = 70 + r() * 70;
      g.fillStyle = cols[Math.floor(r() * cols.length)];
      g.fillRect(x + 3, row * RH + 3, bw - 6, RH - 6);
      g.fillStyle = "rgba(255,250,235,0.25)"; g.fillRect(x + 4, row * RH + 3, bw - 8, 4);
      g.fillStyle = "rgba(90,70,50,0.18)"; g.fillRect(x + 4, row * RH + RH - 7, bw - 8, 4);
      x += bw;
    }
  }
  // tally marks: groups of four strokes and a slash, scratched light into the stone
  if (tally > 0) {
    const n = Math.round(tally * (w * h) / 900);
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = h * (0.12 + 0.8 * r()), s = 10 + r() * 6;
      g.strokeStyle = r() < 0.5 ? "rgba(255,248,230,0.85)" : "rgba(70,50,40,0.6)"; g.lineWidth = 2.2;
      g.beginPath();
      for (let k = 0; k < 4; k++) { g.moveTo(x + k * 5, y); g.lineTo(x + k * 5 + 1, y + s); }
      if (r() < 0.8) { g.moveTo(x - 3, y + s * 0.8); g.lineTo(x + 19, y + s * 0.2); }
      g.stroke();
    }
  }
  // ivy: strands from the top edge, leaves as small dark/light green hearts
  const leaf = (x: number, y: number, s: number) => {
    const c = ["#2f8a3a", "#3f9e43", "#56b04a", "#2a7a3a", "#6cc152"][Math.floor(r() * 5)];
    g.fillStyle = c; g.beginPath(); g.ellipse(x, y, s, s * 0.8, r() * 3, 0, TAU); g.fill();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(x - s * 0.25, y - s * 0.25, s * 0.35, s * 0.25, 0, 0, TAU); g.fill();
  };
  const strands = Math.round((w / 26) * ivy * 2);
  for (let i = 0; i < strands; i++) {
    let x = r() * w;
    const len = h * (0.15 + Math.pow(r(), 1.6) * 0.8 * ivy);
    for (let y = 0; y < len; y += 12) { x += (r() - 0.5) * 10; leaf(x + (r() - 0.5) * 26, y, 14 + r() * 10); }
  }
  for (let i = 0; i < w / 4; i++) leaf(r() * w, r() * 60, 16 + r() * 10); // thick crown along the top
  // moss at the foot
  g.fillStyle = "rgba(70,140,60,0.35)";
  for (let i = 0; i < w / 10; i++) { g.beginPath(); g.ellipse(r() * w, h - r() * 30, 20 + r() * 30, 8 + r() * 12, 0, 0, TAU); g.fill(); }
});
const gravelTex = () => ctex("gravel", 1024, 1024, (g, r) => {
  g.fillStyle = "#cdb48a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 4200; i++) {
    const c = ["#bfa47a", "#dcc49a", "#b8996c", "#e6d2ad", "#a98d62"][Math.floor(r() * 5)];
    g.fillStyle = c; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, TAU); g.fill();
  }
  g.fillStyle = "rgba(90,160,70,0.5)";
  for (let i = 0; i < 160; i++) { g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 6 + r() * 14, 3 + r() * 6, r() * 3, 0, TAU); g.fill(); }
});
const flagTex = () => ctex("flags", 1024, 1024, (g, r) => {
  g.fillStyle = "#8e7f6a"; g.fillRect(0, 0, 1024, 1024);
  for (let y = 0; y < 1024; y += 128) for (let x = (y / 128) % 2 ? -64 : 0; x < 1024; x += 128) {
    g.fillStyle = ["#d8cbb2", "#cfc0a4", "#e2d6bd", "#c6b597"][Math.floor(r() * 4)];
    g.fillRect(x + 4, y + 4, 120, 120);
  }
});
const doorTex = () => ctex("bigdoor", 512, 1024, (g) => {
  g.fillStyle = "#1f5f6a"; g.fillRect(0, 0, 512, 1024);
  g.strokeStyle = "#e8b84a"; g.lineWidth = 14; g.strokeRect(30, 30, 452, 964);
  g.lineWidth = 8;
  for (let k = 0; k < 4; k++) { g.strokeRect(70, 80 + k * 230, 372, 190); }
  g.fillStyle = "#e8b84a"; g.beginPath(); g.arc(400, 560, 26, 0, TAU); g.fill();
  // a spiral, the labyrinth's sign
  g.strokeStyle = "#7fd6d8"; g.lineWidth = 10; g.beginPath();
  for (let a = 0; a < 6 * Math.PI; a += 0.1) { const rr = 8 + a * 9; g.lineTo(256 + Math.cos(a) * rr, 300 + Math.sin(a) * rr); }
  g.stroke();
});
const waterTex = () => ctex("pool", 512, 512, (g, r) => {
  g.fillStyle = "#2fb4d0"; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.45)" : "rgba(20,90,140,0.35)"; g.fillRect(r() * 512, r() * 512, 18 + r() * 30, 3); }
});

// ---------------- materials ----------------
const M = {
  ivyWall: () => lam("ivyWall", () => ({ map: ivyTex("wall", 2048, 2048, 0.75) })),
  maze: () => lam("mazeWall", () => ({ map: ivyTex("maze", 1024, 1600, 0.6) })),
  tally: () => lam("tallyWall", () => ({ map: ivyTex("tally", 1024, 1600, 0.35, 1) })),
  top: () => lam("wallTop", () => ({ color: "#5fae4a" })),
  gravel: () => lam("gravel", () => ({ map: rep(gravelTex(), 1, 1) })),
  cobble: () => lam("cobbleHD", () => ({ map: cobbleHD() })),
  grass: () => lam("grassHD", () => ({ map: grassHD() })),
  flags: () => lam("flags", () => ({ map: flagTex() })),
  stone: () => lam("towerHD", () => ({ map: stoneHD("towerHD") })),
  roofT: () => lam("towerRoof", () => ({ color: "#2f6fb5" })),
  roofR: () => lam("towerRoofR", () => ({ color: "#d9573f" })),
  wood: () => lam("gateWood", () => ({ color: "#8a5432" })),
  brass: () => lam("brass", () => ({ color: "#f0b53a", emissive: "#4a2a00" })),
  water: () => lam("fountainWater", () => ({ map: waterTex(), emissive: "#0d4a66" })),
  door: () => lam("bigDoor", () => ({ map: doorTex() })),
  bench: () => lam("benchStone", () => ({ color: "#ecd6a8" })),
  sand: () => lam("fountainSand", () => ({ color: "#e3b77a" })),
};

/** quad facing up at height y */
const up = (x0: number, x1: number, z0: number, z1: number, y: number, u = 1, v = 1) =>
  quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), u, v);
/** box of length len along direction a (rad, in xz), centred at (x, z), thickness t, from y0 to y1 */
const segBox = (b: Batch, mat: THREE.Material, x: number, z: number, a: number, len: number, t: number, y0: number, y1: number, tile = 0) => {
  const g = boxGeo(V(-len / 2, y0, -t / 2), V(len / 2, y1, t / 2), tile);
  b.add(g, mat, new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -a), V(1, 1, 1)));
};
const bell = (b: Batch, x: number, y: number, z: number, s = 1) => {
  const pts = [[0, 0.05], [0.45, 0.02], [0.5, 0.1], [0.42, 0.3], [0.32, 0.75], [0.28, 0.95], [0.12, 1.02], [0, 1.03]].map(([a, c]) => new THREE.Vector2(a * s, c * s));
  const g = new THREE.LatheGeometry(pts, 20);
  b.add(g, M.brass(), new THREE.Matrix4().makeTranslation(x, y - 1.03 * s, z));
};

// ---------------- Middle ----------------
/** trees, lanterns, benches, flower boxes, barrels of the city (also used by the collision check): rad = footprint */
export const propSpots = () => {
  const r = rng(43), out: { kind: string; i: number; x: number; z: number; h: number; yaw: number; rad: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const a = r() * TAU, rr = [20, 29.8, 38][i % 3] + (r() - 0.5) * 1.2, h = 5 + r() * 2;
    const near = Math.min(...[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((t) => Math.abs(Math.atan2(Math.sin(a - t), Math.cos(a - t)))));
    if (near * rr < 4) continue;
    out.push({ kind: "tree", i, x: Math.cos(a) * rr, z: Math.sin(a) * rr, h, yaw: 0, rad: 0.3 * h });
  }
  for (let i = 0; i < 12; i++) {
    const a = (i + 0.5) * (TAU / 12), yaw = Math.atan2(-Math.cos(a), -Math.sin(a));
    out.push({ kind: "lantern", i, x: Math.cos(a) * 8.6, z: Math.sin(a) * 8.6, h: 3.8, yaw: 0, rad: 0.25 });
    if (i % 3 === 1) out.push({ kind: "bench", i, x: Math.cos(a + 0.13) * 8.2, z: Math.sin(a + 0.13) * 8.2, h: 1, yaw: yaw + Math.PI, rad: 0.85 });
    if (i % 3 === 2) out.push({ kind: "flowers", i, x: Math.cos(a + 0.12) * 9.3, z: Math.sin(a + 0.12) * 9.3, h: 0.8, yaw, rad: 0.75 });
  }
  for (const [x, z] of [[5.2, 9.5], [-6.4, 8.4], [9.8, -3.6]] as const) out.push({ kind: "barrel", i: 0, x: x + 0.4, z: z + 0.15, h: 1, yaw: 0, rad: 0.85 });
  // keep the ground in front of the named houses clear (scenes play at those doors)
  const doors = Object.values(NAMED).map((n) => [Math.cos(n.a) * 9.5, Math.sin(n.a) * 9.5]);
  return out.filter((p) => p.kind === "tree" || doors.every(([dx, dz]) => Math.hypot(p.x - dx, p.z - dz) > 4.2));
};
/** every house of the city: centre, yaw (front to the plaza), width, height, style */
export const houseSpots = () => {
  const r = rng(41), out: { x: number; z: number; yaw: number; w: number; h: number; si: number }[] = [];
  const named = Object.values(NAMED);
  RINGS.forEach((ring, ri) => {
    const circ = TAU * ring.r, n = Math.floor(circ / (ring.w + 0.9));
    for (let k = 0; k < n; k++) {
      const a = (k + 0.5) * (TAU / n);
      const near = (t: number) => Math.abs(Math.atan2(Math.sin(a - t), Math.cos(a - t)));
      const street = Math.min(near(0), near(Math.PI / 2), near(Math.PI), near(-Math.PI / 2)) * ring.r < 4.5 + ring.w / 2;
      if (street) continue;
      if (ri === 0 && near(BT_A) * ring.r < 7) continue; // bell tower plot
      const nm = named.find((q) => q.ring === ri && near(q.a) * ring.r < ring.w * 0.7);
      const aa = nm ? nm.a : a, h = [6.2, 7.4, 8.6][(k + ri) % 3];
      const p = houseAt(ri, aa);
      out.push({ x: p.x, z: p.z, yaw: p.yaw, w: ring.w, h, si: Math.floor(r() * 8) });
    }
  });
  return out;
};
const buildMiddle = (b: Batch, shell: Batch) => {
  // ground: grass everywhere (maze floor is gravel strips, see maze), cobbles inside the wall
  const disc = new THREE.CircleGeometry(WALL_R + 1, 96); disc.rotateX(-Math.PI / 2);
  const uv = disc.attributes.uv as THREE.BufferAttribute, pos = disc.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 6, pos.getZ(i) / 6);
  b.add(disc, M.cobble(), new THREE.Matrix4().makeTranslation(0, 0.0, 0));
  // fountain: two round steps, basin, pillar, top bowl, water
  for (const [rr, h] of [[STEPS_R, 0.18], [STEPS_R - 0.45, 0.36]] as const) b.add(new THREE.CylinderGeometry(rr, rr, h, 48).translate(0, h / 2, 0), M.bench());
  b.add(new THREE.CylinderGeometry(2.55, 2.7, 0.9, 48, 1, true).translate(0, 0.36 + 0.45, 0), M.sand());
  b.add(new THREE.TorusGeometry(2.6, 0.14, 8, 48).rotateX(Math.PI / 2).translate(0, 1.27, 0), M.bench());
  const wd = new THREE.CircleGeometry(2.5, 48); wd.rotateX(-Math.PI / 2); b.add(wd, M.water(), new THREE.Matrix4().makeTranslation(0, 1.12, 0));
  b.add(new THREE.CylinderGeometry(0.32, 0.45, 2.2, 16).translate(0, 1.2 + 1.1, 0), M.bench());
  b.add(new THREE.CylinderGeometry(1.1, 0.4, 0.45, 32).translate(0, 3.4, 0), M.bench());
  const wt = new THREE.CircleGeometry(1.0, 32); wt.rotateX(-Math.PI / 2); b.add(wt, M.water(), new THREE.Matrix4().makeTranslation(0, 3.6, 0));
  b.add(new THREE.SphereGeometry(0.28, 16, 10).translate(0, 3.95, 0), M.brass());
  // bell tower: stone shaft, open belfry with 4 posts, red pyramid roof, the bell
  const [bx0, , bz0] = BELLTOWER;
  b.add(boxGeo(V(bx0 - 2.4, 0, bz0 - 2.4), V(bx0 + 2.4, 13, bz0 + 2.4), 3), M.stone());
  b.add(boxGeo(V(bx0 - 2.7, 13, bz0 - 2.7), V(bx0 + 2.7, 13.5, bz0 + 2.7), 3), M.bench());
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(boxGeo(V(bx0 + sx * 2.3 - 0.35, 13.5, bz0 + sz * 2.3 - 0.35), V(bx0 + sx * 2.3 + 0.35, 17, bz0 + sz * 2.3 + 0.35), 2), M.stone());
  b.add(boxGeo(V(bx0 - 2.7, 17, bz0 - 2.7), V(bx0 + 2.7, 17.5, bz0 + 2.7), 3), M.bench());
  const pyr = new THREE.ConeGeometry(3.9, 5, 4); pyr.rotateY(Math.PI / 4);
  b.add(pyr, M.roofR(), new THREE.Matrix4().makeTranslation(bx0, 17.5 + 2.5, bz0));
  bell(b, bx0, 16.8, bz0, 1.5);
  b.add(boxGeo(V(bx0 - 0.9, 0, bz0 + 2.4), V(bx0 + 0.9, 2.6, bz0 + 2.5)), M.wood()); // door
  for (const hs of houseSpots()) house(b, hs.x, hs.z, hs.yaw, hs.w, 8, hs.h, hs.si);
  // trees between the rings, lanterns + benches + flower boxes around the plaza
  for (const t of propSpots()) {
    if (t.kind === "tree") addVeg(b, t.i % 4 ? "round" : "fat", t.x, 0, t.z, t.h, t.i * 77.1);
    else if (t.kind === "lantern") R.lantern(b, t.x, 0, t.z, 3.4);
    else if (t.kind === "bench") R.bench(b, t.x, 0, t.z, t.yaw, ["#3f8f4c", "#2f6fb5", "#d9573f"][t.i % 3]);
    else if (t.kind === "flowers") R.flowerBox(b, t.x, 0, t.z, t.yaw, 1.4);
  }
  for (const t of propSpots()) if (t.kind === "barrel") { R.barrel(b, t.x - 0.4, 0, t.z - 0.15); R.crate(b, t.x + 0.4, 0, t.z + 0.15, 0.6, 0.3); }
  void shell;
};

// ---------------- the wall ----------------
const GATE_A = [0, Math.PI / 2, Math.PI, -Math.PI / 2]; // e, s, w, n (angle measured from +x toward +z)
const buildWall = (b: Batch) => {
  const rm = WALL_R + WALL_T / 2, seg = 120, half = (GATE_W / 2 + 0.2) / rm;
  const gateNear = (a: number) => GATE_A.some((g) => Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) < half + Math.PI / seg);
  for (let k = 0; k < seg; k++) {
    const a = (k + 0.5) * (TAU / seg), len = (TAU * rm) / seg + 0.08;
    const x = Math.cos(a) * rm, z = Math.sin(a) * rm, ta = a + Math.PI / 2; // tangent direction
    if (gateNear(a)) { segBox(b, M.ivyWall(), x, z, ta, len, WALL_T, GATE_H, WALL_H, WALL_H); continue; }
    segBox(b, M.ivyWall(), x, z, ta, len, WALL_T, 0, WALL_H, WALL_H);
    segBox(b, M.top(), x, z, ta, len, WALL_T + 0.4, WALL_H, WALL_H + 0.6);
  }
  // gates: towers either side, open wooden doors, brass bell over the north gate
  GATE_A.forEach((ga, gi) => {
    const cx = Math.cos(ga), cz = Math.sin(ga), tx = -cz, tz = cx;
    for (const s of [-1, 1]) {
      const px = cx * (WALL_R + 1.5) + tx * s * (GATE_W / 2 + 2.6), pz = cz * (WALL_R + 1.5) + tz * s * (GATE_W / 2 + 2.6);
      b.add(new THREE.CylinderGeometry(2.8, 3.0, WALL_H + 4, 24).translate(px, (WALL_H + 4) / 2, pz), M.ivyWall());
      b.add(new THREE.CylinderGeometry(3.1, 3.1, 0.6, 24).translate(px, WALL_H + 4.3, pz), M.bench());
      b.add(new THREE.ConeGeometry(3.4, 5.5, 24).translate(px, WALL_H + 4.6 + 2.75, pz), gi % 2 ? M.roofR() : M.roofT());
      // open door leaf, swung inward along the wall
      const hx = cx * WALL_R + tx * s * (GATE_W / 2), hz = cz * WALL_R + tz * s * (GATE_W / 2);
      const k70 = Math.cos(1.2), s70 = Math.sin(1.2);
      const dx = -s * tx * k70 - cx * s70, dz = -s * tz * k70 - cz * s70;
      const leaf = boxGeo(V(0, 0, -0.15), V(GATE_W / 2, GATE_H - 0.3, 0.15), 0);
      b.add(leaf, M.wood(), new THREE.Matrix4().compose(V(hx - cx * 0.3, 0, hz - cz * 0.3), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.atan2(-dz, dx)), V(1, 1, 1)));
    }
    if (gi === 3) { // north gate: a bell hanging in a little frame on top of the gate
      const px = cx * (WALL_R + 0.2), pz = cz * (WALL_R + 0.2);
      for (const s of [-1, 1]) b.add(boxGeo(V(px + tx * s * 1.2 - 0.15, WALL_H, pz - 0.15), V(px + tx * s * 1.2 + 0.15, WALL_H + 3.2, pz + 0.15)), M.wood());
      b.add(boxGeo(V(px - 1.5, WALL_H + 3.2, pz - 0.2), V(px + 1.5, WALL_H + 3.5, pz + 0.2)), M.wood());
      bell(b, px, WALL_H + 3.2, pz, 1.1);
    }
  });
};

// ---------------- the labyrinth ----------------
/** axis boxes [x0, x1, z0, z1] of every labyrinth wall (filled by buildMaze, used by the collision check) */
export const MAZE_WALLS: [number, number, number, number][] = [];
export const buildMazeOnly = (b: Batch) => buildMaze(b);
const cellC = (i: number) => -(MAZE_N * MAZE_CELL) / 2 + (i + 0.5) * MAZE_CELL;
const buildMaze = (b: Batch) => {
  const r = rng(7), N = MAZE_N;
  const valid = (i: number, j: number) => {
    if (i < 0 || j < 0 || i >= N || j >= N) return false;
    const x = cellC(i), z = cellC(j);
    return Math.hypot(x, z) > WALL_R + WALL_T + 5 && Math.hypot(x - COURT[0], z - COURT[2]) > COURT_R + 3.5;
  };
  const id = (i: number, j: number) => j * N + i;
  const seen = new Uint8Array(N * N), open = new Set<string>();
  const link = (a: number, c: number) => open.add(a < c ? `${a}-${c}` : `${c}-${a}`);
  const isOpen = (a: number, c: number) => open.has(a < c ? `${a}-${c}` : `${c}-${a}`);
  // straight approach corridors: 5 cells out of every gate and into the courtyard
  const cellOf = (x: number) => Math.floor((x + (N * MAZE_CELL) / 2) / MAZE_CELL);
  const straight = (i0: number, j0: number, di: number, dj: number, n: number) => {
    for (let k = 0; k < n; k++) { const a = id(i0 + di * k, j0 + dj * k), c = id(i0 + di * (k + 1), j0 + dj * (k + 1)); if (valid(i0 + di * (k + 1), j0 + dj * (k + 1))) link(a, c); }
  };
  const c0 = cellOf(0.01);
  const gn = cellOf(-(WALL_R + WALL_T + 6)), gs = cellOf(WALL_R + WALL_T + 6);
  straight(c0, gn, 0, -1, 5); straight(c0, gs, 0, 1, 5); straight(gs, c0, 1, 0, 5); straight(gn, c0, -1, 0, 5);
  const ci = cellOf(COURT[0] - COURT_R - 4), cj = cellOf(COURT[2]);
  straight(ci, cj, -1, 0, 5);
  // depth-first carve over all valid cells
  const stack: [number, number][] = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (valid(i, j) && !seen[id(i, j)]) {
    seen[id(i, j)] = 1; stack.push([i, j]);
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const nb = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).map(([dx, dy]) => [x + dx, y + dy] as [number, number]).filter(([a, c]) => valid(a, c) && !seen[id(a, c)]);
      if (!nb.length) { stack.pop(); continue; }
      const [a, c] = nb[Math.floor(r() * nb.length)];
      link(id(x, y), id(a, c)); seen[id(a, c)] = 1; stack.push([a, c]);
    }
  }
  // walls: east and south edge of every cell, plus the outer border
  const mat = M.maze(), top = M.top(), half = MAZE_CELL / 2;
  const wallX = (x: number, z: number) => { MAZE_WALLS.push([x - MAZE_T / 2, x + MAZE_T / 2, z - half - MAZE_T / 2, z + half + MAZE_T / 2]); b.add(boxGeo(V(x - MAZE_T / 2, 0, z - half - MAZE_T / 2), V(x + MAZE_T / 2, MAZE_H, z + half + MAZE_T / 2), 0), mat); b.add(boxGeo(V(x - MAZE_T / 2 - 0.15, MAZE_H, z - half - 0.6), V(x + MAZE_T / 2 + 0.15, MAZE_H + 0.45, z + half + 0.6), 0), top); };
  const wallZ = (x: number, z: number) => { MAZE_WALLS.push([x - half - MAZE_T / 2, x + half + MAZE_T / 2, z - MAZE_T / 2, z + MAZE_T / 2]); b.add(boxGeo(V(x - half - MAZE_T / 2, 0, z - MAZE_T / 2), V(x + half + MAZE_T / 2, MAZE_H, z + MAZE_T / 2), 0), mat); b.add(boxGeo(V(x - half - 0.6, MAZE_H, z - MAZE_T / 2 - 0.15), V(x + half + 0.6, MAZE_H + 0.45, z + MAZE_T / 2 + 0.15), 0), top); };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!valid(i, j)) continue;
    const x = cellC(i), z = cellC(j);
    if (!valid(i - 1, j) && i === 0) wallX(x - half, z);
    if (!valid(i, j - 1) && j === 0) wallZ(x, z - half);
    if (valid(i + 1, j) ? !isOpen(id(i, j), id(i + 1, j)) : i === N - 1) wallX(x + half, z);
    if (valid(i, j + 1) ? !isOpen(id(i, j), id(i, j + 1)) : j === N - 1) wallZ(x, z + half);
  }
  // floor: gravel over the whole labyrinth square (the city disc and the court sit on top)
  const S = (N * MAZE_CELL) / 2;
  b.add(up(-S - 300, S + 300, -S - 300, S + 300, -0.06, (2 * S + 600) / 8, (2 * S + 600) / 8), M.grass());
  b.add(up(-S, S, -S, S, -0.025, (2 * S) / 7, (2 * S) / 7), M.gravel());
};

// ---------------- the courtyard and the door ----------------
const buildCourt = (b: Batch) => {
  const [cx, , cz] = COURT, seg = 64;
  const disc = new THREE.CircleGeometry(COURT_R, 64); disc.rotateX(-Math.PI / 2);
  const uv = disc.attributes.uv as THREE.BufferAttribute, pos = disc.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 5, pos.getZ(i) / 5);
  b.add(disc, M.flags(), new THREE.Matrix4().makeTranslation(cx, 0.0, cz));
  for (let k = 0; k < seg; k++) {
    const a = (k + 0.5) * (TAU / seg);
    if (Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) < 0.2) continue; // opening to the west
    const rr = COURT_R + 0.7, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr, ta = a + Math.PI / 2;
    segBox(b, M.maze(), x, z, ta, (TAU * rr) / seg + 0.1, 1.4, 0, MAZE_H);
  }
  // the door: freestanding stone frame, tall teal door, steps
  const dz = cz + 2;
  b.add(boxGeo(V(cx - 3.6, 0, dz - 1.2), V(cx + 3.6, 0.35, dz + 1.6), 2), M.bench());
  for (const s of [-1, 1]) b.add(boxGeo(V(cx + s * 2.6 - 0.7, 0.35, dz - 0.7), V(cx + s * 2.6 + 0.7, 9.6, dz + 0.7), 2), M.stone());
  b.add(boxGeo(V(cx - 3.4, 9.6, dz - 0.8), V(cx + 3.4, 11, dz + 0.8), 2), M.stone());
  b.add(boxGeo(V(cx - 1.9, 0.35, dz - 0.18), V(cx + 1.9, 9.6, dz + 0.18), 0), M.door());
  // stone bench to the right of the door (camera side = west, -x)
  // (the stone bench is drawn into the sitting Hollow card, so the card can never cut through it)
};

// ---------------- corridor kits ----------------
type Opening = { side: -1 | 1; at: number; w?: number };
/** corridor from o toward -z: floor, two ivy walls with optional side openings (each leads into a short side passage
 *  that turns away), a cross wall at the far end unless `open`. */
const corridor = (b: Batch, o: V3, len: number, opts: { open?: boolean; openings?: Opening[]; mat?: THREE.Material; h?: number } = {}) => {
  const [ox, , oz] = o, W = KIT_W, h = opts.h ?? MAZE_H, mat = opts.mat ?? M.maze(), top = M.top();
  b.add(up(ox - W / 2 - 1, ox + W / 2 + 1, oz - len - 1, oz + 1, 0.01, (W + 2) / 7, (len + 2) / 7), M.gravel());
  for (const s of [-1, 1] as const) {
    const x = ox + s * (W / 2 + MAZE_T / 2);
    const cuts = (opts.openings ?? []).filter((q) => q.side === s).map((q) => [oz - q.at - (q.w ?? W) / 2, oz - q.at + (q.w ?? W) / 2]).sort((a, c) => c[0] - a[0]);
    let z1 = oz + 6;
    for (const [c0, c1] of cuts) {
      if (z1 > c1) { b.add(boxGeo(V(x - MAZE_T / 2, 0, c1), V(x + MAZE_T / 2, h, z1), 0), mat); b.add(boxGeo(V(x - MAZE_T / 2 - 0.15, h, c1), V(x + MAZE_T / 2 + 0.15, h + 0.45, z1), 0), top); }
      // side passage: floor, two walls, end wall
      const sx = x + s * 7;
      b.add(up(Math.min(x, sx) - 1, Math.max(x, sx) + 1, c0, c1, 0.01, 1, 1), M.gravel());
      for (const zz of [c0, c1]) b.add(boxGeo(V(Math.min(x, sx) - MAZE_T / 2, 0, zz - MAZE_T / 2), V(Math.max(x, sx) + MAZE_T / 2, h, zz + MAZE_T / 2), 0), mat);
      b.add(boxGeo(V(sx - MAZE_T / 2, 0, c0), V(sx + MAZE_T / 2, h, c1), 0), mat);
      z1 = c0;
    }
    const zEnd = oz - len - (opts.open ? 30 : 0);
    if (z1 > zEnd) { b.add(boxGeo(V(x - MAZE_T / 2, 0, zEnd), V(x + MAZE_T / 2, h, z1), 0), mat); b.add(boxGeo(V(x - MAZE_T / 2 - 0.15, h, zEnd), V(x + MAZE_T / 2 + 0.15, h + 0.45, z1), 0), top); }
  }
  if (!opts.open) b.add(boxGeo(V(ox - W / 2 - MAZE_T, 0, oz - len - MAZE_T), V(ox + W / 2 + MAZE_T, h, oz - len), 0), mat);
  // behind the camera: close it too, so a reverse angle never looks into nothing
  b.add(boxGeo(V(ox - W / 2 - MAZE_T, 0, oz + 6), V(ox + W / 2 + MAZE_T, h, oz + 6 + MAZE_T), 0), mat);
};
const buildKits = (b: Batch) => {
  const r = rng(5);
  corridor(b, KIT.chalk, 46, { openings: [{ side: -1, at: 18 }, { side: 1, at: 34 }] });
  // crossing: a long corridor with openings both sides at 20
  corridor(b, KIT.cross, 44, { openings: [{ side: -1, at: 20 }, { side: 1, at: 20 }] });
  // garden: a square court 22 x 22 at 14 m in, stone benches, flower beds, trees
  {
    const [ox, , oz] = KIT.garden, gz = oz - 14 - 11;
    corridor(b, KIT.garden, 13, { open: true });
    b.add(up(ox - 11, ox + 11, gz - 11, gz + 11, 0.012, 3, 3), M.grass());
    for (const [x0, z0, x1, z1] of [[-11, -11, -2.8, -11], [2.8, -11, 11, -11], [-11, 11, -2.8, 11], [2.8, 11, 11, 11]] as const)
      b.add(boxGeo(V(ox + x0, 0, gz + z0 - 0.6), V(ox + x1, MAZE_H, gz + z1 + 0.6), 0), M.maze());
    for (const s of [-1, 1]) b.add(boxGeo(V(ox + s * 11 - 0.6, 0, gz - 11), V(ox + s * 11 + 0.6, MAZE_H, gz + 11), 0), M.maze());
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU, x = ox + Math.cos(a) * 6.5, z = gz + Math.sin(a) * 6.5, yaw = -a - Math.PI / 2;
      b.add(boxGeo(V(-1.0, 0, -0.35), V(1.0, 0.45, 0.35), 0), M.bench(), new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(1, 1, 1)));
    }
    b.add(new THREE.CylinderGeometry(2.2, 2.4, 0.6, 32).translate(ox, 0.3, gz), M.bench());
    for (let k = 0; k < 14; k++) addVeg(b, "bush", ox + (r() - 0.5) * 19, 0, gz + (r() < 0.5 ? -1 : 1) * (8.5 + r() * 1.5), 1.1 + r() * 0.6, k * 31.7);
    for (const s of [-1, 1]) addVeg(b, "round", ox + s * 8.6, 0, gz - 8.4, 6, s * 99);
  }
  // staircase down into water at the end of a corridor
  {
    const [ox, , oz] = KIT.stairs;
    corridor(b, KIT.stairs, 26, { open: true });
    const z0 = oz - 26;
    for (let k = 0; k < 10; k++) b.add(boxGeo(V(ox - KIT_W / 2, -0.35 * (k + 1), z0 - k * 0.6 - 0.6), V(ox + KIT_W / 2, -0.35 * k, z0 - k * 0.6), 0), M.bench());
    b.add(up(ox - KIT_W / 2 - 0.2, ox + KIT_W / 2 + 0.2, z0 - 30, z0 - 2.2, -1.1, 2, 4), M.water());
    for (const s of [-1, 1]) b.add(boxGeo(V(ox + s * (KIT_W / 2 + MAZE_T / 2) - MAZE_T / 2, -4, z0 - 30), V(ox + s * (KIT_W / 2 + MAZE_T / 2) + MAZE_T / 2, MAZE_H, z0), 0), M.maze());
    b.add(boxGeo(V(ox - KIT_W / 2 - MAZE_T, -4, z0 - 31.2), V(ox + KIT_W / 2 + MAZE_T, MAZE_H, z0 - 30), 0), M.maze());
  }
  corridor(b, KIT.tally, 40, { mat: M.tally(), openings: [{ side: 1, at: 26 }] });
  corridor(b, KIT.kettle, 22, {});
  corridor(b, KIT.write, 44, { openings: [{ side: -1, at: 30 }] });
  corridor(b, KIT.gate, 30, { open: true });
};

export const buildCity = (root: THREE.Object3D) => {
  const b = new Batch(), shell = new Batch();
  buildMiddle(b, shell);
  buildWall(b);
  buildMaze(b);
  buildCourt(b);
  buildKits(b);
  b.build(root);
  shell.build(root, false);
};
