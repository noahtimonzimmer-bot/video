// "Dash" scenery: the town (main street, houses, school, bakery, mailbox, square with a wedding arch, bus stop with a bus)
// on a flat disc of cobbles and grass, which is the back of a giant sleeping creature: a scaly teal dome, ridge plates,
// a huge head with a closed eye to the north, a tail to the south, and the sea of clouds far below.
import * as THREE from "three";
import { Batch, V, lam, boxGeo, quad, house, addVeg } from "./build";
import { ctex, rep, rng, cobbleHD, grassHD } from "./paint";
import * as R from "./rooms";
import { STREET_HALF, TOWN_R, SCHOOL, BAKERY, MAILBOX, SQUARE, BUSSTOP, HEAD, EYE, V3 } from "./layout";

const TAU = Math.PI * 2;
/** teal scales with darker rims and a light sheen */
const scaleTex = () => ctex("scales", 1024, 1024, (g, r) => {
  g.fillStyle = "#1d6e6a"; g.fillRect(0, 0, 1024, 1024);
  const S = 64;
  for (let row = -1; row < 1024 / (S * 0.6) + 1; row++) for (let col = -1; col < 1024 / S + 1; col++) {
    const x = col * S + (row % 2 ? S / 2 : 0), y = row * S * 0.6;
    const c = ["#2fa39a", "#35b0a2", "#2a958e", "#3cbcad"][Math.floor(r() * 4)];
    g.fillStyle = c; g.beginPath(); g.ellipse(x, y, S * 0.52, S * 0.5, 0, 0, Math.PI); g.fill();
    g.strokeStyle = "#155a58"; g.lineWidth = 4; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.ellipse(x - 8, y + 10, 12, 6, 0, 0, TAU); g.fill();
  }
});
const bellyTex = () => ctex("belly", 512, 512, (g) => {
  g.fillStyle = "#e8c070"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#c79a4a"; g.lineWidth = 8; for (let y = 0; y < 512; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
});
const cloudSea = () => ctex("cloudsea", 1024, 1024, (g, r) => {
  g.fillStyle = "#d9ecff"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.8)" : "rgba(180,205,240,0.5)"; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 70, 18 + r() * 40, 0, 0, TAU); g.fill(); }
});
const schoolTex = () => ctex("schoolsign", 512, 128, (g) => {
  g.fillStyle = "#2f6fb5"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#ffffff"; g.font = "900 78px sans-serif"; g.textAlign = "center"; g.fillText("SCHOOL", 256, 92);
});
const bakeryTex = () => ctex("bakesign", 512, 128, (g) => {
  g.fillStyle = "#c2413b"; g.fillRect(0, 0, 512, 128); g.fillStyle = "#ffe08a"; g.font = "900 78px sans-serif"; g.textAlign = "center"; g.fillText("BAKERY", 256, 92);
});
const M = {
  scales: () => lam("scales", () => ({ map: rep(scaleTex(), 18, 10) })),
  scalesS: () => lam("scalesS", () => ({ map: rep(scaleTex(), 4, 4) })),
  belly: () => lam("belly", () => ({ map: bellyTex() })),
  plate: () => lam("plates", () => ({ color: "#f2b544" })),
  horn: () => lam("horns", () => ({ color: "#f4ead2" })),
  lid: () => lam("eyelid", () => ({ color: "#2a958e" })),
  cobble: () => lam("cobbleHD", () => ({ map: cobbleHD() })),
  grass: () => lam("grassHD", () => ({ map: grassHD() })),
  clouds: () => lam("cloudsea", () => ({ map: rep(cloudSea(), 6, 6), emissive: "#9fb8e0", emissiveIntensity: 0.4 })),
  red: () => lam("busRed", () => ({ color: "#e8443a" })),
  yellow: () => lam("busYellow", () => ({ color: "#ffd25a" })),
  glass: () => lam("busGlass", () => ({ color: "#9fd8ff", emissive: "#2a5a8a" })),
  tyre: () => lam("tyre", () => ({ color: "#2a2a34" })),
  white: () => lam("arch", () => ({ color: "#ffffff" })),
  pink: () => lam("flowersPink", () => ({ color: "#ff7ab8" })),
  sign: (t: THREE.Texture, k: string) => lam("sign" + k, () => ({ map: t })),
};
const up = (x0: number, x1: number, z0: number, z1: number, y: number, u = 1, v = 1) => quad(V(x0, y, z1), V(x1, y, z1), V(x1, y, z0), V(x0, y, z0), u, v);

/** every house along the main street: centre, yaw, width, height, style (fronts on |x| = 6) */
export const houseSpots = () => {
  const r = rng(17), out: { x: number; z: number; yaw: number; w: number; h: number; si: number }[] = [];
  for (const sx of [-1, 1]) {
    let z = -44;
    while (z < 40) {
      const w = [7, 8, 9][Math.floor(r() * 3)], cz = z + w / 2;
      const skip = Math.abs(cz - SQUARE[2]) < 9 || (sx < 0 && Math.abs(cz - BAKERY[2]) < 4);
      if (!skip) out.push({ x: sx * (STREET_HALF + 4), z: cz, yaw: sx < 0 ? Math.PI / 2 : -Math.PI / 2, w, h: [6.2, 7.4, 8.6][Math.floor(r() * 3)], si: Math.floor(r() * 8) });
      z += w + 0.4;
    }
  }
  return out;
};
/** small things on the street (also for the collision check) */
export const propSpots = () => {
  const out: { kind: string; x: number; z: number; rad: number; h: number }[] = [];
  for (let z = -40; z <= 36; z += 10) for (const sx of [-1, 1]) if (Math.abs(z - SQUARE[2]) > 6) out.push({ kind: "lantern", x: sx * 5.3, z: z + (sx > 0 ? 5 : 0), rad: 0.25, h: 3.8 });
  out.push({ kind: "mailbox", x: MAILBOX[0], z: MAILBOX[2], rad: 0.4, h: 1.3 });
  out.push({ kind: "bus", x: BUSSTOP[0] + 0.6, z: BUSSTOP[2] + 2, rad: 0, h: 3.4 });
  return out;
};

const buildTown = (b: Batch) => {
  const r = rng(9);
  // grass disc (back of the creature, mossy) + cobbled street and square
  const disc = new THREE.CircleGeometry(TOWN_R, 96); disc.rotateX(-Math.PI / 2);
  const uv = disc.attributes.uv as THREE.BufferAttribute, pos = disc.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 8, pos.getZ(i) / 8);
  b.add(disc, M.grass(), new THREE.Matrix4().makeTranslation(0, -0.03, 0));
  b.add(up(-STREET_HALF, STREET_HALF, -60, 52, 0, 12 / 6, 112 / 6), M.cobble());
  const sq = new THREE.CircleGeometry(11, 48); sq.rotateX(-Math.PI / 2);
  const su = sq.attributes.uv as THREE.BufferAttribute, sp = sq.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < su.count; i++) su.setXY(i, sp.getX(i) / 6, sp.getZ(i) / 6);
  b.add(sq, M.cobble(), new THREE.Matrix4().makeTranslation(SQUARE[0], 0.004, SQUARE[2]));
  for (const h of houseSpots()) house(b, h.x, h.z, h.yaw, h.w, 8, h.h, h.si);
  // bakery: a house with a red sign and an awning (front faces the street, +x)
  house(b, BAKERY[0] - 4, BAKERY[2], Math.PI / 2, 7, 8, 7.4, 1);
  R.awning(b, BAKERY[0] + 0.05, 2.6, BAKERY[2], Math.PI / 2, 5, "#e8443a", "#ffffff");
  b.add(quad(V(0, 0, 0), V(3.2, 0, 0), V(3.2, 0.8, 0), V(0, 0.8, 0)), M.sign(bakeryTex(), "bak"), new THREE.Matrix4().compose(V(BAKERY[0] + 0.04, 3.4, BAKERY[2] + 1.6), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2), V(1, 1, 1)));
  // school at the north end: wide building, blue roof, bell turret, sign
  const [sx0, , sz0] = SCHOOL;
  house(b, sx0, sz0 - 4, 0, 16, 9, 8.6, 0);
  b.add(quad(V(-2.4, 0, 0), V(2.4, 0, 0), V(2.4, 1.2, 0), V(-2.4, 1.2, 0)), M.sign(schoolTex(), "sch"), new THREE.Matrix4().makeTranslation(sx0, 6.3, sz0 + 0.55));
  // mailbox: red post box
  R.box(b, MAILBOX[0], 0, MAILBOX[2], 0.12, 0.8, 0.12, "#2f3a4a");
  R.box(b, MAILBOX[0], 0.8, MAILBOX[2], 0.55, 0.45, 0.4, "#e8443a");
  // square: wedding arch with flowers, benches, a fountain-less round bed of flowers
  const [qx, , qz] = SQUARE;
  for (const s of [-1, 1]) R.cyl(b, M.white(), R.M(qx + s * 1.6, 0, qz - 3.5), 0, 1.4, 0, 0.12, 0.12, 2.8, 10);
  b.add(new THREE.TorusGeometry(1.6, 0.12, 8, 24, Math.PI).translate(0, 2.8, 0), M.white(), new THREE.Matrix4().makeTranslation(qx, 0, qz - 3.5));
  for (let k = 0; k < 14; k++) { const a = (k / 13) * Math.PI; b.add(new THREE.SphereGeometry(0.2, 8, 6), k % 2 ? M.pink() : M.white(), new THREE.Matrix4().makeTranslation(qx + Math.cos(a) * 1.6, 2.8 + Math.sin(a) * 1.6, qz - 3.5)); }
  for (const s of [-1, 1]) R.bench(b, qx + s * 8.5, 0, qz, s < 0 ? Math.PI / 2 : -Math.PI / 2, "#2f6fb5");
  // lanterns, flower boxes, trees behind the houses
  for (const p of propSpots()) if (p.kind === "lantern") R.lantern(b, p.x, 0, p.z, 3.4);
  for (let i = 0; i < 60; i++) { const a = r() * TAU, d = 22 + r() * 40; const x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs(x) < 16) continue; addVeg(b, i % 3 ? "round" : "cone", x, 0, z, 5 + r() * 3, i * 41.3); }
  // bus stop + bus (pointing north, parked on the east side of the street)
  const [bx, , bz] = BUSSTOP;
  R.box(b, bx + 1.2, 0, bz - 3, 0.1, 2.6, 0.1, "#2f3a4a"); R.box(b, bx + 1.2, 2.6, bz - 3, 0.6, 0.6, 0.06, "#ffd25a");
  const bm = R.M(bx + 0.6, 0, bz + 2);
  R.bx(b, M.yellow(), bm, 0, 1.75, 0, 2.5, 2.6, 9);
  R.bx(b, M.red(), bm, 0, 0.75, 0, 2.52, 0.5, 9.02);
  for (let k = 0; k < 4; k++) R.bx(b, M.glass(), bm, -1.26, 2.25, -3 + k * 2, 0.04, 0.9, 1.6);
  R.bx(b, M.glass(), bm, 0, 2.25, -4.51, 2.2, 0.9, 0.04);
  for (const [x, z] of [[-1.1, -3], [1.1, -3], [-1.1, 3], [1.1, 3]]) b.add(new THREE.CylinderGeometry(0.5, 0.5, 0.35, 16).rotateZ(Math.PI / 2), M.tyre(), bm.clone().multiply(new THREE.Matrix4().makeTranslation(x, 0.5, z)));
};

const buildCreature = (b: Batch) => {
  // back: a flattened dome whose top is the town disc (top at y = -0.25)
  const body = new THREE.SphereGeometry(1, 96, 48);
  b.add(body, M.scales(), new THREE.Matrix4().compose(V(0, -70.25, 0), new THREE.Quaternion(), V(230, 70, 300)));
  // ridge plates along the spine beyond the town, both ends
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) {
    const z = s * (TOWN_R + 12 + k * 22), y = -70 + 70 * Math.sqrt(Math.max(0, 1 - (z / 300) ** 2)) - 0.5;
    const pl = new THREE.ConeGeometry(6 - k * 0.4, 14 - k * 0.8, 4); pl.scale(0.35, 1, 1);
    b.add(pl, M.plate(), new THREE.Matrix4().makeTranslation(0, y + 5, z));
  }
  // neck + head to the north, low; snout, horns, nostrils
  b.add(new THREE.CylinderGeometry(55, 80, 120, 32).rotateX(Math.PI / 2.6), M.scalesS(), new THREE.Matrix4().makeTranslation(0, -60, -290));
  const head = new THREE.SphereGeometry(1, 64, 32);
  b.add(head, M.scalesS(), new THREE.Matrix4().compose(V(...HEAD), new THREE.Quaternion(), V(48, 38, 62)));
  b.add(new THREE.SphereGeometry(1, 48, 24), M.scalesS(), new THREE.Matrix4().compose(V(HEAD[0], HEAD[1] - 10, HEAD[2] - 50), new THREE.Quaternion(), V(34, 22, 40)));
  b.add(new THREE.SphereGeometry(1, 32, 16), M.belly(), new THREE.Matrix4().compose(V(HEAD[0], HEAD[1] - 26, HEAD[2] - 48), new THREE.Quaternion(), V(30, 8, 34)));
  for (const s of [-1, 1]) {
    const horn = new THREE.ConeGeometry(7, 40, 16); horn.rotateX(-0.9); horn.rotateZ(-s * 0.4);
    b.add(horn, M.horn(), new THREE.Matrix4().makeTranslation(HEAD[0] + s * 26, HEAD[1] + 34, HEAD[2] + 18));
    b.add(new THREE.SphereGeometry(3, 12, 8), M.tyre(), new THREE.Matrix4().makeTranslation(HEAD[0] + s * 9, HEAD[1] - 2, HEAD[2] - 89));
  }
  // closed eye: a bulge with a heavy lid (the open eye is a drawn card, see film.ts)
  const [ex, ey, ez] = EYE;
  b.add(new THREE.SphereGeometry(1, 32, 16), M.lid(), new THREE.Matrix4().compose(V(ex, ey, ez), new THREE.Quaternion(), V(12, 9, 14)));
  // tail to the south, curling down
  for (let k = 0; k < 10; k++) {
    const z = 300 + k * 26, y = -40 - k * 9, rr = 40 - k * 3.6;
    b.add(new THREE.SphereGeometry(1, 32, 16), M.scalesS(), new THREE.Matrix4().compose(V(Math.sin(k * 0.5) * 20, y, z), new THREE.Quaternion(), V(rr, rr * 0.8, rr * 1.2)));
  }
  // sea of clouds far below
  b.add(up(-3000, 3000, -3000, 3000, -150, 1, 1), M.clouds());
};

export const buildCity = (root: THREE.Object3D) => {
  const b = new Batch();
  buildTown(b);
  buildCreature(b);
  b.build(root);
};
export type { V3 };
