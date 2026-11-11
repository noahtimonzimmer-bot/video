// Eiffel sets: Victor's study (forged letters) and the Grand Hotel salon (the plan, the secret, the payment),
// plus dense Paris street dressing (lanterns, cafe tables, awnings, flower boxes, kiosk, bikes).
// Rooms are laid out in the shots' street coordinates and shifted by OFF (story.ts) to their place over the river.
import * as THREE from "three";
import { Batch, lam } from "./build";
import { D0, ROOM_S, ROOM_H, DESK, TERR, PAY, CAFE } from "./story";
import * as R from "./rooms";

const column = (b: Batch, x: number, y: number, z: number, h: number) => {
  const st = lam("rcol", () => ({ color: "#f4ead2" })), gd = lam("rcolG", () => ({ color: "#e0b25a" }));
  b.add(new THREE.CylinderGeometry(0.2, 0.22, h - 0.5, 16), st, new THREE.Matrix4().makeTranslation(x, y + 0.25 + (h - 0.5) / 2, z));
  b.add(new THREE.BoxGeometry(0.56, 0.25, 0.56), st, new THREE.Matrix4().makeTranslation(x, y + 0.125, z));
  b.add(new THREE.BoxGeometry(0.56, 0.25, 0.56), gd, new THREE.Matrix4().makeTranslation(x, y + h - 0.125, z));
};
const globe = (b: Batch, x: number, y: number, z: number) => {
  b.add(new THREE.CylinderGeometry(0.03, 0.09, 0.12, 10), lam("rglb", () => ({ color: "#7a4a2e" })), new THREE.Matrix4().makeTranslation(x, y + 0.06, z));
  b.add(new THREE.SphereGeometry(0.17, 16, 12), lam("rglo", () => ({ color: "#3f8fd0" })), new THREE.Matrix4().makeTranslation(x, y + 0.3, z));
  b.add(new THREE.TorusGeometry(0.2, 0.012, 6, 24), lam("rcolG", () => ({ color: "#e0b25a" })), new THREE.Matrix4().makeTranslation(x, y + 0.3, z));
};

export const buildSets = (root: THREE.Object3D) => {
  const shell = new Batch(), b = new Batch();
  // ---------------- Victor's study (street coords x -6.8..1.6, z 87.2..94.2, back wall south) ----------------
  {
    const [ox, oz] = ROOM_S, X = (x: number) => x + ox, Z = (z: number) => z + oz, y = D0;
    const r = R.room(shell, { x0: X(-6.8), x1: X(1.6), z0: Z(87.2), z1: Z(94.4), y, h: 3.4, paper: R.wallpaper("study", "#3f8f6a", "#2f7a58", "damask", "#e0b25a"),
      floor: "parquet", floorCols: ["#b8743f", "#9a5f36"], wainscot: "#7a4a2e", ceiling: "#f4ead2", trim: "#e0c890" });
    const s = R.wallM(r, "s", 0), w = R.wallM(r, "w", 0), e = R.wallM(r, "e", 0), n = R.wallM(r, "n", 0);
    const dx = DESK[0] + ox, dz = DESK[2] + oz;
    R.desk(b, dx, y, dz, 0, 1.6, "#8a4f2e");
    R.typewriter(b, dx - 0.15, y + 0.78, dz - 0.05, 0.1); R.papers(b, dx + 0.45, y + 0.78, dz + 0.1, 6, 3); R.papers(b, dx - 0.6, y + 0.78, dz + 0.15, 3, 8);
    R.tableLamp(b, dx + 0.62, y + 0.78, dz - 0.2, "#3f8f4c"); R.cup(b, dx - 0.62, y + 0.78, dz - 0.2, "#2a2a34"); globe(b, dx - 0.35, y + 0.78, dz - 0.22);
    R.chair(b, dx - 0.1, y, dz - 0.75, 0, "#c2413b");
    R.bookcase(b, X(-5.9), y, Z(87.4), 0, 1.4, 2.4, 3); R.bookcase(b, X(-4.4), y, Z(87.4), 0, 1.4, 2.4, 4);
    R.windowOn(b, s, X(-2.2), 1.0, 1.3, 1.8, R.viewTex("study", true), "#c2413b");
    R.frame(b, s, X(-0.6), 2.0, 0.55, 0.7, R.picture("portrait")); R.wallClock(b, s, X(0.7), 2.3, 0.22);
    R.plant(b, X(0.9), y, Z(87.6), 1.4, "#2f6fb5"); R.floorLamp(b, X(-3.3), y, Z(87.6), "#ffd25a");
    R.rug(b, dx + 0.6, y, dz + 1.2, 3.2, 2.2, R.rugTex("study", "#8c2f3a", "#e0b25a", "#2f6a8f"));
    R.armchair(b, X(-6.2), y, Z(91.2), Math.PI / 2, "#c2413b"); R.frame(b, w, Z(91.2), 2.0, 0.9, 0.65, R.picture("hills"));
    R.box(b, X(-6.3), y, Z(92.6), 0.6, 0.6, 0.6, "#7a4a2e"); R.vase(b, X(-6.3), y + 0.6, Z(92.6), "#e0b25a");
    R.shelfOn(b, e, Z(90.0), 1.6, 1.4, 5, 7); R.frame(b, e, Z(90.0), 2.3, 0.8, 0.6, R.picture("sea"));
    R.door(b, e, Z(92.6), "#7a4a2e"); R.coatRack(b, X(1.1), y, Z(93.8), ["#7a3fa0", "#2a2a34"]);
    R.crate(b, X(0.9), y, Z(88.9), 0.55, 0.3, "#c98a52"); R.papers(b, X(0.9), y + 0.55, Z(88.9), 4, 11);
    R.windowOn(b, n, X(-2.6), 1.0, 1.3, 1.8, R.viewTex("study2", true), "#c2413b"); R.bookcase(b, X(-5.4), y, Z(94.2), Math.PI, 1.4, 2.3, 5);
  }
  // ---------------- Grand Hotel salon (street coords x -3.6..6.6, z 67.6..84.6, back wall north) ----------------
  {
    const [ox, oz] = ROOM_H, X = (x: number) => x + ox, Z = (z: number) => z + oz, y = D0;
    const r = R.room(shell, { x0: X(-3.6), x1: X(6.6), z0: Z(67.4), z1: Z(84.6), y, h: 3.9, paper: R.wallpaper("salon", "#f0c060", "#d8983a", "damask", "#c23a3f"),
      floor: "parquet", floorCols: ["#c98a52", "#a8693a"], wainscot: "#f4ead2", ceiling: "#fff4dc", trim: "#e0b25a" });
    const n = R.wallM(r, "n", 0), w = R.wallM(r, "w", 0), e = R.wallM(r, "e", 0), s = R.wallM(r, "s", 0);
    // north (back) wall: fireplace behind the payment, mirror, two tall windows with the tower, paintings
    R.fireplace(b, n, X(2.6)); R.frame(b, n, X(2.6), 2.2, 1.1, 0.8, R.screenTex("hmirror", (g) => { const gr = g.createLinearGradient(0, 0, 320, 240); gr.addColorStop(0, "#d8f0ff"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(1, "#a8d4f0"); g.fillStyle = gr; g.fillRect(0, 0, 320, 240); }), "#e0b25a");
    R.windowOn(b, n, X(-1.4), 1.0, 1.3, 2.2, R.viewTex("salon", true), "#2f6a43", "#f4ead2"); R.windowOn(b, n, X(5.2), 1.0, 1.0, 2.2, R.viewTex("salon2", true), "#2f6a43", "#f4ead2");
    R.vase(b, X(2.0), y + 1.28, Z(84.3), "#2f6fb5"); R.vase(b, X(3.2), y + 1.28, Z(84.3), "#e8443a"); R.wallClock(b, n, X(0.5), 2.6, 0.2);
    R.plant(b, X(0.4), y, Z(84.1), 1.6, "#e0b25a"); R.plant(b, X(4.6), y, Z(84.1), 1.5, "#e0b25a");
    // the conference table (plan + secret) under a chandelier
    R.table(b, TERR[0] + ox - 0.2, y, TERR[2] + oz, 2.0, 0.9, 0.76, 0, "#fbf7ec");
    R.papers(b, TERR[0] + ox - 0.6, y + 0.78, TERR[2] + oz, 4, 2); R.cup(b, TERR[0] + ox + 0.3, y + 0.78, TERR[2] + oz - 0.2); R.cup(b, TERR[0] + ox + 0.6, y + 0.78, TERR[2] + oz + 0.15);
    R.vase(b, TERR[0] + ox - 0.1, y + 0.78, TERR[2] + oz + 0.15, "#e0b25a");
    R.chandelier(b, TERR[0] + ox - 0.2, y + 2.9, TERR[2] + oz); R.chandelier(b, PAY[0] + ox, y + 2.9, PAY[2] + oz - 0.6);
    R.rug(b, TERR[0] + ox - 0.2, y, TERR[2] + oz, 4.6, 3.4, R.rugTex("salon", "#2f4f8f", "#e0b25a", "#8c2f3a"));
    R.rug(b, PAY[0] + ox, y, PAY[2] + oz - 0.4, 3.2, 2.0, R.rugTex("salon2", "#8c2f3a", "#f4ead2", "#2f6a43"));
    // side walls: columns, paintings, armchairs, sofa, side tables, lamps
    for (const z of [70, 75, 80]) { column(b, X(-3.25), y, Z(z), 3.9); column(b, X(6.25), y, Z(z), 3.9); }
    R.frame(b, w, Z(72.5), 2.0, 1.0, 0.75, R.picture("hills", 2)); R.frame(b, w, Z(77.5), 2.0, 0.7, 0.9, R.picture("portrait", 2)); R.frame(b, w, Z(82.3), 2.0, 0.9, 0.7, R.picture("sea", 2));
    R.frame(b, e, Z(72.5), 2.0, 0.9, 0.7, R.picture("flowers")); R.frame(b, e, Z(77.5), 2.0, 1.0, 0.75, R.picture("city", 2)); R.frame(b, e, Z(82.3), 2.0, 0.7, 0.9, R.picture("portrait", 3));
    R.armchair(b, X(-2.8), y, Z(73.0), Math.PI / 2, "#2f6a43"); R.armchair(b, X(-2.8), y, Z(78.0), Math.PI / 2, "#2f6a43");
    R.roundTable(b, X(-2.9), y, Z(75.5), 0.35, 0.6, "#e0b25a"); R.vase(b, X(-2.9), y + 0.6, Z(75.5), "#e8443a");
    R.sofa(b, X(6.0), y, Z(77.5), -Math.PI / 2, 2.2, "#2f6a43", "#e0b25a"); R.floorLamp(b, X(6.0), y, Z(73.2), "#ffd25a"); R.floorLamp(b, X(6.0), y, Z(81.8), "#ffd25a");
    R.plant(b, X(-3.0), y, Z(83.8), 1.5, "#2f6fb5"); R.plant(b, X(6.0), y, Z(83.8), 1.5, "#2f6fb5");
    R.door(b, s, X(1.5), "#f4ead2", "#e0b25a"); R.frame(b, s, X(4.5), 2.0, 1.2, 0.8, R.picture("hills", 3));
    R.chair(b, X(-1.6), y, Z(68.4), 0.4, "#c2413b", "#e0b25a"); R.chair(b, X(5.6), y, Z(68.4), -0.4, "#c2413b", "#e0b25a");
  }
  // ---------------- street dressing (main street, fronts at |x| = 6; nothing below z 62: the train crosses at 52) ----------------
  for (let z = 62; z < 148; z += 9) {
    for (const sx of [-1, 1]) {
      if (z % 18 === (sx > 0 ? 8 : 17)) R.lantern(b, sx * 5.35, D0, z + 1.5);
      R.flowerBox(b, sx * 5.82, D0 + 1.0, z + 3.1, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 1.0);
      R.flowerBox(b, sx * 5.82, D0 + 3.8, z + 5.0, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 1.0);
    }
  }
  R.awning(b, -6.0, D0 + 2.7, CAFE[2], Math.PI / 2, 4.6, "#e8443a"); R.awning(b, 6.0, D0 + 2.7, 115, -Math.PI / 2, 4.0, "#2f6fb5");
  R.awning(b, 6.0, D0 + 2.7, 128, -Math.PI / 2, 3.6, "#3f8f4c"); R.awning(b, -6.0, D0 + 2.7, 132, Math.PI / 2, 3.6, "#ffd25a");
  R.cafeSet(b, -4.9, D0, CAFE[2] - 2.4, 3, "#e8443a"); R.cafeSet(b, -4.9, D0, CAFE[2] + 2.2, 5, "#fbf7ec"); R.cafeSet(b, 4.6, D0, 116, 7, "#2f6fb5");
  R.flowerBox(b, -4.9, D0, CAFE[2] - 4.2, 0, 1.4); R.flowerBox(b, -4.9, D0, CAFE[2] + 3.9, 0, 1.4);
  for (const [x, z, yaw] of [[5.1, 96, -Math.PI / 2], [-5.1, 126, Math.PI / 2], [5.1, 140, -Math.PI / 2]] as const) R.bench(b, x, D0, z, yaw);
  for (const [x, z] of [[4.6, 88], [-4.7, 118.5]] as const) R.barrel(b, x, D0, z);
  for (const [x, z, s] of [[4.9, 86, 0.6], [4.9, 86.7, 0.5], [-4.8, 121, 0.6]] as const) R.crate(b, x, D0, z, s, z, "#c98a52");
  R.bike(b, 5.3, D0, 104, 0.15, "#e8443a"); R.bike(b, -5.3, D0, 136, -0.2, "#2f6fb5");
  R.kiosk(b, 4.4, D0, 133, "#2f6a43");
  shell.build(root, false);
  b.build(root, true);
};
