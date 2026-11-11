// Shirt Guy sets: room A = Jason's flat (idea, website, sold out, getting dressed), room B = the photo studio,
// plus dense street dressing (lanterns, benches, flower boxes, cafe tables, bikes) along the main street.
// Rooms are laid out in the shots' street coordinates and shifted by OFF (story.ts) to their place over the river.
import * as THREE from "three";
import { Batch } from "./build";
import { D0, ROOM_A, ROOM_B, TABLE, BOARD, PHOTO, DRESS } from "./story";
import * as R from "./rooms";

const websiteScr = () => R.screenTex("shirtsite", (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 320, 240); g.fillStyle = "#2f6fb5"; g.fillRect(0, 0, 320, 40);
  g.fillStyle = "#ffffff"; g.font = "900 24px sans-serif"; g.fillText("I WEAR YOUR SHIRT", 14, 29);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) {
    const n = y * 6 + x + 1; g.fillStyle = n < 6 ? "#ffd25a" : "#e8f0fa"; g.fillRect(12 + x * 50, 52 + y * 46, 44, 40);
    g.fillStyle = "#2a1f2b"; g.font = "700 16px sans-serif"; g.fillText("$" + n, 18 + x * 50, 78 + y * 46);
  }
});
const shirtPoster = (c: string, k: string) => R.screenTex("tee" + k, (g) => {
  g.fillStyle = "#fff4dc"; g.fillRect(0, 0, 320, 240); g.fillStyle = c; g.strokeStyle = "#2a1f2b"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(110, 40); g.lineTo(60, 70); g.lineTo(80, 110); g.lineTo(105, 98); g.lineTo(105, 210); g.lineTo(215, 210); g.lineTo(215, 98); g.lineTo(240, 110); g.lineTo(260, 70); g.lineTo(210, 40); g.quadraticCurveTo(160, 70, 110, 40); g.closePath(); g.fill(); g.stroke();
});

export const buildSets = (root: THREE.Object3D) => {
  const shell = new Batch(), b = new Batch();
  // ---------------- room A: Jason's flat (street coords x -6.6..4.4, z 77..86.6, back wall south) ----------------
  {
    const [ox, oz] = ROOM_A, X = (x: number) => x + ox, Z = (z: number) => z + oz, y = D0;
    const r = R.room(shell, { x0: X(-6.6), x1: X(4.4), z0: Z(77), z1: Z(86.6), y, h: 3.3, paper: R.wallpaper("jason", "#ffd98a", "#f2b84a", "stripe"),
      floor: "parquet", floorCols: ["#c98a52", "#b47442"], wainscot: "#2f8f8f", ceiling: "#fff4dc" });
    const s = R.wallM(r, "s", 0), w = R.wallM(r, "w", 0), e = R.wallM(r, "e", 0), n = R.wallM(r, "n", 0);
    // south (back) wall: bookcase, window, desk + computer, pictures, clock, shelf, plant, lamp
    R.bookcase(b, X(-5.6), y, Z(77.2), 0, 1.4, 2.2, 1);
    R.windowOn(b, s, X(-3.5), 1.0, 1.4, 1.6, R.viewTex("jason"), "#e8443a");
    R.desk(b, X(-0.7), y, Z(77.42), 0, 1.6); R.computer(b, X(-0.5), y + 0.78, Z(77.35), 0, websiteScr()); R.tableLamp(b, X(-1.25), y + 0.78, Z(77.3), "#ffd25a");
    R.papers(b, X(0.0), y + 0.78, Z(77.6), 3, 4); R.cup(b, X(-1.1), y + 0.78, Z(77.65), "#e8443a");
    R.chair(b, X(-0.5), y, Z(78.25), Math.PI, "#e8443a");
    R.frame(b, s, X(-1.0), 2.15, 0.7, 0.5, R.picture("hills")); R.frame(b, s, X(0.05), 2.25, 0.5, 0.65, R.picture("abstract"), "#2a2a34");
    R.wallClock(b, s, X(1.1), 2.35, 0.24); R.shelfOn(b, s, X(2.6), 1.75, 1.4, 5, 2); R.shelfOn(b, s, X(2.6), 2.35, 1.4, 4, 3);
    R.plant(b, X(1.6), y, Z(77.45), 1.3); R.floorLamp(b, X(3.7), y, Z(77.5));
    R.box(b, X(2.7), y, Z(77.4), 0.9, 0.45, 0.5, "#e86ab0"); R.vase(b, X(2.7), y + 0.45, Z(77.4));
    // the table (idea / experiment) with the laptop
    R.table(b, TABLE[0] + ox, y, TABLE[2] + oz - 0.1, 1.5, 0.85, 0.76, 0, "#e8f0fa");
    R.laptop(b, TABLE[0] + ox - 0.05, y + 0.78, TABLE[2] + oz, 0, websiteScr()); R.cup(b, TABLE[0] + ox + 0.5, y + 0.78, TABLE[2] + oz + 0.1, "#2f6fb5");
    R.papers(b, TABLE[0] + ox - 0.5, y + 0.78, TABLE[2] + oz + 0.05, 3, 9); R.vase(b, TABLE[0] + ox + 0.45, y + 0.78, TABLE[2] + oz - 0.3, "#ffd25a");
    R.chair(b, TABLE[0] + ox - 0.4, y, TABLE[2] + oz - 0.75, 0, "#2f6fb5"); R.chair(b, TABLE[0] + ox - 1.05, y, TABLE[2] + oz + 0.1, Math.PI / 2, "#3f8f4c");
    // rug under the website board
    R.rug(b, BOARD[0] + ox + 0.3, y, BOARD[2] + oz + 0.6, 3.4, 2.4, R.rugTex("jason", "#c2413b", "#ffd25a", "#2f6fb5"));
    R.rug(b, TABLE[0] + ox, y, TABLE[2] + oz, 2.4, 1.8, R.rugTex("jason2", "#2f8f8f", "#f4ead2", "#e8443a", true));
    // west wall: wardrobe by the dressing spot, mirror, coat rack, poster
    R.wardrobe(b, X(-6.25), y, DRESS[2] + oz + 1.3, Math.PI / 2, 1.3, 2.2);
    R.frame(b, w, DRESS[2] + oz - 0.3, 1.5, 0.5, 1.3, R.screenTex("mirror", (g) => { const gr = g.createLinearGradient(0, 0, 320, 240); gr.addColorStop(0, "#d8f0ff"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(1, "#a8d4f0"); g.fillStyle = gr; g.fillRect(0, 0, 320, 240); }), "#e0b25a");
    R.coatRack(b, X(-6.0), y, Z(80.9), ["#e8443a", "#2f6fb5", "#ffd25a"]);
    R.poster(b, w, Z(79.0), 2.0, 0.7, 0.55, shirtPoster("#e8443a", "r"));
    // east wall: sofa, posters, door, plant
    R.sofa(b, X(3.85), y, Z(81.6), -Math.PI / 2, 2.2, "#2f6fb5", "#ffd25a");
    R.poster(b, e, Z(81.0), 1.75, 0.6, 0.45, shirtPoster("#3f8f4c", "g")); R.poster(b, e, Z(82.2), 1.75, 0.6, 0.45, shirtPoster("#ffd25a", "y"));
    R.door(b, e, Z(85.3), "#7a4a2e"); R.plant(b, X(3.9), y, Z(79.6), 1.4, "#2f6fb5");
    R.box(b, X(3.0), y, Z(81.6), 0.5, 0.42, 0.9, "#9a5f36", Math.PI / 2); R.cup(b, X(3.0), y + 0.42, Z(81.4)); R.papers(b, X(3.0), y + 0.42, Z(81.9), 2, 5);
    // north wall (behind most lenses): window + frames, so reverse angles are dressed too
    R.pendant(b, X(-2.6), y + 3.3, Z(80.4)); R.pendant(b, X(0.6), y + 3.3, Z(83.0), "#e8443a");
    R.windowOn(b, n, X(-1.5), 1.0, 1.4, 1.6, R.viewTex("jason2"), "#e8443a");
    R.frame(b, n, X(1.5), 1.9, 0.8, 0.6, R.picture("sea")); R.bookcase(b, X(-4.6), y, Z(86.4), Math.PI, 1.3, 2.1, 2);
  }
  // ---------------- room B: the photo studio (street coords x -3..5, z 89..98.5) ----------------
  {
    const [ox, oz] = ROOM_B, X = (x: number) => x + ox, Z = (z: number) => z + oz, y = D0;
    const r = R.room(shell, { x0: X(-3.2), x1: X(5.2), z0: Z(88.6), z1: Z(98.6), y, h: 3.6, paper: R.wallpaper("studio", "#f4ead2", "#e6d6b8", "dots"),
      floor: "boards", floorCols: ["#b8794a", "#b8794a"], ceiling: "#fff4dc", trim: "#ffffff" });
    const s = R.wallM(r, "s", 0), e = R.wallM(r, "e", 0), w = R.wallM(r, "w", 0);
    R.backdrop(b, PHOTO[0] + ox, y, PHOTO[2] + oz - 2.0, 0, 3.0, "#ffd25a"); R.pendant(b, X(1.0), y + 3.6, Z(94.5), "#2a2a34");
    R.softbox(b, PHOTO[0] + ox - 1.9, y, PHOTO[2] + oz + 0.4, 1.0); R.softbox(b, PHOTO[0] + ox + 1.6, y, PHOTO[2] + oz - 0.9, -0.7);
    R.coatRack(b, X(-2.4), y, Z(94.5), ["#e8443a", "#ffd25a", "#3f8f4c", "#e86ab0", "#2f6fb5"]);
    R.crate(b, X(4.3), y, Z(89.4), 0.7, 0.2, "#c98a52"); R.crate(b, X(4.35), y + 0.7, Z(89.4), 0.5, -0.3, "#e0a72e");
    R.plant(b, X(-2.6), y, Z(89.3), 1.5); R.floorLamp(b, X(4.6), y, Z(91.2), "#ffd25a");
    R.windowOn(b, e, Z(94.2), 1.0, 1.4, 1.7, R.viewTex("studio"), "#2f6fb5");
    R.poster(b, s, X(-2.3), 1.9, 0.6, 0.45, shirtPoster("#e8443a", "r")); R.poster(b, s, X(3.4), 1.9, 0.6, 0.45, shirtPoster("#3f8f4c", "g"));
    R.frame(b, w, Z(92.0), 1.9, 0.6, 0.8, R.picture("portrait")); R.frame(b, w, Z(96.5), 1.9, 0.8, 0.6, R.picture("city"));
    R.table(b, X(3.8), y, Z(96.2), 1.2, 0.7, 0.76, Math.PI / 2, undefined, "#f4f0e4"); R.laptop(b, X(3.8), y + 0.78, Z(96.2), -Math.PI / 2, websiteScr());
    R.cup(b, X(3.7), y + 0.78, Z(95.7), "#ffd25a"); R.chair(b, X(3.1), y, Z(96.2), Math.PI / 2, "#2a2a34", "#3a3a46");
    R.rug(b, X(1.2), y, Z(94.8), 2.6, 1.8, R.rugTex("studio", "#e86ab0", "#ffffff", "#ffd25a", true));
  }
  // ---------------- street dressing (main street, fronts at |x| = 6, z 46..150) ----------------
  for (let z = 50; z < 148; z += 9) {
    for (const sx of [-1, 1]) {
      if (z % 18 === (sx > 0 ? 5 : 14)) R.lantern(b, sx * 5.35, D0, z + 1.5);
      R.flowerBox(b, sx * 5.82, D0 + 1.0, z + 3.1, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 1.0);
      R.flowerBox(b, sx * 5.82, D0 + 3.8, z + 5.0, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 1.0);
    }
  }
  for (const [x, z, yaw] of [[5.1, 88, -Math.PI / 2], [-5.1, 96, Math.PI / 2], [5.1, 110, -Math.PI / 2], [-5.1, 66, Math.PI / 2]] as const) R.bench(b, x, D0, z, yaw);
  for (const [x, z] of [[4.6, 63], [-4.7, 103.5], [4.7, 118]] as const) R.barrel(b, x, D0, z);
  for (const [x, z, s] of [[-4.9, 62, 0.6], [-4.9, 62.7, 0.5], [4.8, 99, 0.6]] as const) R.crate(b, x, D0, z, s, z, "#c98a52");
  R.bike(b, 5.3, D0, 75, 0.15, "#e8443a"); R.bike(b, -5.3, D0, 108, -0.2, "#2f6fb5");
  R.awning(b, 6.0, D0 + 2.7, 92, -Math.PI / 2, 4.0, "#e8443a"); R.awning(b, -6.0, D0 + 2.7, 113, Math.PI / 2, 4.0, "#2f6fb5");
  R.awning(b, 6.0, D0 + 2.7, 120, -Math.PI / 2, 3.6, "#3f8f4c");
  R.cafeSet(b, 4.3, D0, 91, 3, "#e8443a"); R.cafeSet(b, 4.4, D0, 93.6, 5, "#ffd25a"); R.cafeSet(b, -4.3, D0, 112, 7, "#2f6fb5");
  R.kiosk(b, 4.3, D0, 128);
  shell.build(root, false);
  b.build(root, true);
};
