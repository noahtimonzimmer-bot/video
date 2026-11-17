// "My City" interiors, built in place at layout ROOM spots (far west, nothing else is seen there):
// Kettle's bedroom (tally wall, window on the night street), Pebble's front room (floor rug, empty bed),
// the bell tower floor with the giant chalk map, and Ladder's bakery.
import * as THREE from "three";
import { Batch } from "./build";
import { ctex } from "./paint";
import * as R from "./rooms";
import { ROOM } from "./layout";
import { tallyMarks } from "./people";
import { Pen } from "./toon";

const TAU = Math.PI * 2;
/** night street seen through a window: deep blue sky, stars, the round wall with ivy, a lantern glow */
export const nightView = (key: string) => ctex("nview" + key, 256, 384, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#14246a"); gr.addColorStop(1, "#3d5fb0");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
  for (let i = 0; i < 40; i++) { g.fillStyle = "#ffffff"; g.fillRect(r() * 256, r() * 200, 2, 2); }
  g.fillStyle = "#f4f0c8"; g.beginPath(); g.arc(196, 70, 22, 0, TAU); g.fill();
  g.fillStyle = "#3a4c7a"; g.fillRect(0, 210, 256, 174);
  g.fillStyle = "#2a6a4a"; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(r() * 256, 214 + r() * 40, 6 + r() * 6, 0, TAU); g.fill(); }
  g.fillStyle = "#26304e"; g.fillRect(0, 300, 256, 84);
  g.fillStyle = "#ffd25a"; g.beginPath(); g.arc(60, 290, 9, 0, TAU); g.fill();
  g.fillStyle = "rgba(255,210,90,0.25)"; g.beginPath(); g.arc(60, 290, 30, 0, TAU); g.fill();
});
const tallyWall = () => ctex("tallywall", 1024, 512, (g) => {
  g.fillStyle = "#f2dca8"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#c9a46e"; g.lineWidth = 10; g.strokeRect(5, 5, 1014, 502);
  tallyMarks(new Pen(g), 312, 3);
});
/** the giant chalk map: white chalk corridors on a dark slate floor, the round city in the middle, arrows, crossings out */
const mapTex = () => ctex("chalkmap", 2048, 2048, (g, r) => {
  g.fillStyle = "#2c3a40"; g.fillRect(0, 0, 2048, 2048);
  g.fillStyle = "rgba(255,255,255,0.04)"; for (let i = 0; i < 600; i++) g.fillRect(r() * 2048, r() * 2048, 40 + r() * 80, 2);
  g.strokeStyle = "rgba(255,255,255,0.92)"; g.lineCap = "round";
  const C = 64, N = 32, valid = (i: number, j: number) => Math.hypot(i - N / 2 + 0.5, j - N / 2 + 0.5) > 6;
  g.lineWidth = 6;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    if (!valid(i, j)) continue;
    const x = i * C, y = j * C;
    if (r() < 0.55) { g.beginPath(); g.moveTo(x + C, y + (r() - 0.5) * 3); g.lineTo(x + C + (r() - 0.5) * 3, y + C); g.stroke(); }
    if (r() < 0.55) { g.beginPath(); g.moveTo(x, y + C); g.lineTo(x + C, y + C + (r() - 0.5) * 3); g.stroke(); }
  }
  g.lineWidth = 10; g.beginPath(); g.arc(1024, 1024, 5.6 * C, 0, TAU); g.stroke();
  g.fillStyle = "rgba(255,210,90,0.9)"; g.beginPath(); g.arc(1024, 1024, 26, 0, TAU); g.fill();
  // arrows and crossed-out bits in colours
  for (let k = 0; k < 40; k++) {
    const x = r() * 2048, y = r() * 2048; if (Math.hypot(x - 1024, y - 1024) < 420) continue;
    g.strokeStyle = ["#ffd25a", "#ff8a8a", "#8ad8ff", "#ffffff"][k % 4]; g.lineWidth = 7;
    const a = Math.floor(r() * 4) * (Math.PI / 2);
    g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.moveTo(26, 0); g.lineTo(10, -14); g.moveTo(26, 0); g.lineTo(10, 14); g.stroke(); g.restore();
    if (k % 5 === 0) { g.strokeStyle = "#ff6a6a"; g.beginPath(); g.moveTo(x - 30, y - 30); g.lineTo(x + 30, y + 30); g.moveTo(x + 30, y - 30); g.lineTo(x - 30, y + 30); g.stroke(); }
  }
});
const breadTex = () => ctex("bread", 256, 128, (g) => {
  g.fillStyle = "#8a5634"; g.fillRect(0, 0, 256, 128);
  for (let k = 0; k < 6; k++) { g.fillStyle = ["#e0a050", "#c98a3a", "#f0c070"][k % 3]; g.beginPath(); g.ellipse(22 + k * 42, 70, 18, 26, 0, 0, TAU); g.fill(); g.strokeStyle = "#7a4a2e"; g.lineWidth = 3; g.stroke(); }
});

export const buildSets = (root: THREE.Object3D) => {
  const shell = new Batch(), b = new Batch();
  // ---------------- Kettle's bedroom: x -323.5..-316.5, z -3..3; back wall south (window), east wall tallies, bed west
  {
    const [ox, , oz] = ROOM.bedroom, y = 0;
    const r = R.room(shell, { x0: ox - 3.5, x1: ox + 3.5, z0: oz - 3, z1: oz + 3, y, h: 3.1, paper: R.wallpaper("kettle", "#f6d58a", "#e8b84a", "dots"),
      floor: "boards", floorCols: ["#c98a52", "#b47442"], wainscot: "#2f8f8f", ceiling: "#fff4dc" });
    const s = R.wallM(r, "s", 0), e = R.wallM(r, "e", 0), w = R.wallM(r, "w", 0), n = R.wallM(r, "n", 0);
    R.windowOn(b, s, ox + 0.6, 1.0, 1.3, 1.5, nightView("bed"), "#c2413b");
    R.poster(b, e, oz + 0.2, 1.75, 4.6, 2.3, tallyWall());          // the tally wall
    R.bed(b, ox - 2.4, y, oz - 1.0, 0, "#e86a3a");                  // headboard against the south wall... foot to +z
    R.shelfOn(b, w, oz + 1.4, 1.9, 1.2, 4, 5);
    R.frame(b, w, oz + 1.4, 2.5, 0.6, 0.45, R.picture("hills"));
    R.desk(b, ox + 2.1, y, oz - 2.6, 0, 1.3); R.tableLamp(b, ox + 1.7, y + 0.78, oz - 2.6, "#ffd25a");
    R.chair(b, ox + 2.1, y, oz - 1.9, Math.PI, "#2f6fb5");
    R.rug(b, ox - 0.3, y + 0.01, oz + 0.6, 2.6, 1.8, R.rugTex("bed", "#2f6fb5", "#ffd25a", "#e8443a"));
    R.door(b, n, ox - 2.2);
    R.plant(b, ox + 3.0, y, oz + 2.4, 1.0); R.wallClock(b, n, ox + 1.4, 2.3, 0.2);
    R.pendant(b, ox, y + 3.1, oz, "#e8443a");
    R.box(b, ox + 2.9, y, oz - 0.4, 0.5, 0.4, 0.5, "#c98a52");
  }
  // ---------------- Pebble's front room: night refuge (they sit on the rug), window south, door north, empty bed east
  {
    const [ox, , oz] = ROOM.pebble, y = 0;
    const r = R.room(shell, { x0: ox - 4, x1: ox + 4, z0: oz - 3, z1: oz + 3, y, h: 3.1, paper: R.wallpaper("pebble", "#9fd8d0", "#5fb8b0", "flower", "#ffd25a"),
      floor: "parquet", floorCols: ["#c98a52", "#a86a3a"], wainscot: "#7b5ac9", ceiling: "#fff4dc" });
    const s = R.wallM(r, "s", 0), e = R.wallM(r, "e", 0), w = R.wallM(r, "w", 0), n = R.wallM(r, "n", 0);
    R.windowOn(b, s, ox - 0.4, 1.0, 1.5, 1.5, nightView("peb"), "#e8443a");
    R.rug(b, ox - 0.4, y + 0.01, oz + 0.3, 3.2, 2.2, R.rugTex("peb", "#e8443a", "#ffd25a", "#2f6fb5", true));
    R.bed(b, ox + 3.0, y, oz - 1.6, 0, "#7b5ac9");
    R.armchair(b, ox - 3.1, y, oz - 2.1, Math.PI / 4, "#e8443a");
    R.bookcase(b, ox - 3.6, y, oz + 1.2, Math.PI / 2, 1.3, 2.1, 4);
    R.shelfOn(b, e, oz + 1.6, 1.8, 1.1, 4, 8); R.frame(b, s, ox + 1.6, 1.9, 0.6, 0.5, R.picture("abstract"));
    R.door(b, n, ox + 1.4, "#2f6fb5");
    R.floorLamp(b, ox + 1.4, y, oz - 2.5); R.plant(b, ox - 2.0, y, oz - 2.5, 1.2);
    R.pendant(b, ox - 0.4, y + 3.1, oz + 0.3, "#ffd25a");
    void w;
  }
  // ---------------- bell tower floor: stone, 10 x 10 m, the giant chalk map covers the floor
  {
    const [ox, , oz] = ROOM.tower, y = 0;
    const r = R.room(shell, { x0: ox - 5, x1: ox + 5, z0: oz - 5, z1: oz + 5, y, h: 5.2, paper: R.wallpaper("tower", "#e2cfa8", "#c7ad80", "diamond", "#d9a43a"),
      floor: "boards", floorCols: ["#7a5a40", "#6a4a32"], wainscot: "#8c3b4a", ceiling: "#fff4dc" });
    const s = R.wallM(r, "s", 0), e = R.wallM(r, "e", 0), w = R.wallM(r, "w", 0), n = R.wallM(r, "n", 0);
    R.rug(b, ox, y + 0.012, oz, 8.6, 8.6, mapTex());
    R.windowOn(b, s, ox - 2.2, 1.6, 1.0, 2.0, R.viewTex("tower1"), "");
    R.windowOn(b, s, ox + 2.2, 1.6, 1.0, 2.0, R.viewTex("tower2"), "");
    R.windowOn(b, e, oz, 1.6, 1.0, 2.0, R.viewTex("tower3"), "");
    R.table(b, ox - 4.2, y, oz + 2.5, 0.8, 2.0, 0.8, 0); R.papers(b, ox - 4.2, y + 0.8, oz + 2.4, 5, 2);
    for (let k = 0; k < 6; k++) R.box(b, ox - 4.2 + (k % 2) * 0.2, y + 0.8, oz + 1.8 + k * 0.2, 0.06, 0.06, 0.16, "#ffffff");
    R.shelfOn(b, w, oz - 2.0, 1.7, 2.0, 6, 11); R.shelfOn(b, w, oz - 2.0, 2.4, 2.0, 5, 12);
    R.door(b, n, ox + 3.0, "#8a5432");
    for (const [x, z] of [[-4.4, -4.4], [4.4, -4.4], [4.4, 4.4], [-4.4, 4.4]] as const) R.floorLamp(b, ox + x, y, oz + z, "#ffd25a");
    R.chandelier(b, ox, y + 5.2, oz);
    void n;
  }
  // ---------------- bakery: counter, oven, bread shelves, a ladder against the wall
  {
    const [ox, , oz] = ROOM.bakery, y = 0;
    const r = R.room(shell, { x0: ox - 4, x1: ox + 4, z0: oz - 3, z1: oz + 3, y, h: 3.2, paper: R.wallpaper("bakery", "#ffe6b0", "#f2b84a", "stripe"),
      floor: "tiles", floorCols: ["#f4f0e4", "#c2413b"], wainscot: "#c2413b", ceiling: "#fff4dc" });
    const s = R.wallM(r, "s", 0), e = R.wallM(r, "e", 0), w = R.wallM(r, "w", 0);
    // oven: brick block with a glowing mouth
    R.box(b, ox + 2.4, y, oz - 2.3, 2.0, 2.0, 1.2, "#b5543c"); R.box(b, ox + 2.4, y + 2.0, oz - 2.3, 1.6, 0.5, 1.0, "#9a4532");
    R.face(b, R.col("#ffb84a", "#ff8a2a"), R.M(ox + 2.4, y, oz - 1.69), 0, 0.85, 0, 0.9, 0.6);
    R.table(b, ox - 0.6, y, oz - 0.2, 3.0, 0.9, 0.95, 0, "#ffffff");   // counter
    for (let k = 0; k < 5; k++) R.box(b, ox - 1.8 + k * 0.6, y + 0.97, oz - 0.2, 0.36, 0.16, 0.22, ["#e0a050", "#c98a3a", "#f0c070"][k % 3]);
    R.poster(b, s, ox - 1.6, 1.4, 2.8, 1.4, breadTex()); R.poster(b, s, ox - 1.6, 2.5, 2.8, 0.7, breadTex());
    R.shelfOn(b, w, oz + 1.0, 1.8, 1.6, 4, 21);
    R.windowOn(b, e, oz + 1.2, 1.0, 1.2, 1.4, R.viewTex("bak"), "#3f8f4c");
    // the ladder, leaning on the west wall
    const lm = R.M(ox - 3.75, y, oz - 1.6, Math.PI / 2).multiply(new THREE.Matrix4().makeRotationX(-0.22));
    for (const sx of [-0.25, 0.25]) R.bx(b, R.col("#c98a52"), lm, sx, 1.4, 0, 0.06, 2.8, 0.06);
    for (let k = 0; k < 7; k++) R.bx(b, R.col("#c98a52"), lm, 0, 0.3 + k * 0.38, 0, 0.5, 0.05, 0.05);
    R.pendant(b, ox - 0.6, y + 3.2, oz - 0.2, "#e8443a");
    R.crate(b, ox - 3.0, y, oz + 2.2, 0.6, 0.2); R.barrel(b, ox + 3.2, y, oz + 2.2);
  }
  shell.build(root, false);
  b.build(root);
};
