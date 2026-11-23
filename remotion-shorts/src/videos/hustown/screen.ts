// The HUS HUS HUS game as it looks on the phones in town (after the user's own game): dark screen, logo with the
// orange middle HUS, score, the wrapping paper folding over the burger in three steps, PERFEKT pill, green HUS! button.
// Also: a grid of wrapped burgers with little accessories (the twist), the high score list and the midnight timer.
import * as THREE from "three";
import { ctex } from "./paint";

const TAU = Math.PI * 2;
export type Scr =
  | { mode: "play"; score: number; fold: number; label?: "PERFEKT" | "DANEBEN" | "EINGEPACKT"; cap?: string; dark?: boolean }
  | { mode: "many" } | { mode: "scores" } | { mode: "timer"; sec: number; score: number } | { mode: "logo" };
const W = 360, H = 640;
const logo = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  g.font = `900 ${s}px sans-serif`; g.textBaseline = "top";
  const parts = [["HUS ", "#ffffff"], ["HUS ", "#ff7a1a"], ["HUS", "#ffffff"]] as const;
  let cx = x; for (const [t, c] of parts) { g.fillStyle = c; g.fillText(t, cx, y); cx += g.measureText(t).width; }
};
const burger = (g: CanvasRenderingContext2D, x: number, y: number, r: number, cap?: string) => {
  g.fillStyle = "#3f9e43"; g.beginPath(); for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; g.lineTo(x + Math.cos(a) * r * 1.08, y + 6 + Math.sin(a) * r * 0.5); } g.fill();
  g.fillStyle = "#ffcc33"; g.fillRect(x - r, y + 2, r * 2, r * 0.18);
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.5, 4, x, y - r * 0.2, r); gr.addColorStop(0, "#ffd08a"); gr.addColorStop(1, "#d98a3a");
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - r * 0.08, r, r * 0.72, 0, Math.PI, TAU); g.fill();
  g.fillStyle = "#fff4d0"; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(x - r * 0.6 + i * r * 0.2, y - r * 0.45 + (i % 2) * 8, 3, 5, 0.5, 0, TAU); g.fill(); }
  if (cap) { // the friend's cap on top of the burger
    g.fillStyle = cap; g.beginPath(); g.ellipse(x, y - r * 0.62, r * 0.62, r * 0.42, 0, Math.PI, TAU); g.fill(); g.fillRect(x - 4, y - r * 0.66, r * 0.95, r * 0.12);
    g.fillStyle = "#ffffff"; g.font = `900 ${r * 0.28}px sans-serif`; g.textAlign = "center"; g.fillText("B", x, y - r * 0.95); g.textAlign = "left";
  }
};
const paper = (g: CanvasRenderingContext2D, fold: number, cap?: string) => {
  const cx = W / 2, top = 200, w = 220;
  g.fillStyle = "#f1ead8"; g.fillRect(cx - w / 2, top, w, 230);                        // paper
  if (fold < 1) { g.fillStyle = "#e6dcc4"; g.fillRect(cx - w / 2 - 80, top, 80, 120); g.fillRect(cx + w / 2, top, 80, 120); }
  burger(g, cx, top + 90, 70, cap);
  g.fillStyle = "#e9e0c8"; g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 2;
  if (fold >= 1) { g.fillRect(cx - w / 2, top, w * 0.55, 140); g.strokeRect(cx - w / 2, top, w * 0.55, 140); }
  if (fold >= 2) { g.fillStyle = "#f4eddc"; g.fillRect(cx - w / 2 + w * 0.45, top, w * 0.55, 140); g.strokeRect(cx - w / 2 + w * 0.45, top, w * 0.55, 140); }
  if (fold >= 3) { g.fillStyle = "#efe6d0"; g.fillRect(cx - w / 2, top + 110, w, 120); g.strokeRect(cx - w / 2, top + 110, w, 120); }
};
const pill = (g: CanvasRenderingContext2D, t: string, y: number, bg: string, fg: string) => {
  g.font = "900 22px sans-serif"; const w = g.measureText(t).width + 36;
  g.fillStyle = bg; g.beginPath(); g.roundRect(W / 2 - w / 2, y, w, 38, 19); g.fill(); g.fillStyle = fg; g.textAlign = "center"; g.fillText(t, W / 2, y + 8); g.textAlign = "left";
};
const button = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#b8ff3a"; g.shadowColor = "#b8ff3a"; g.shadowBlur = 24; g.beginPath(); g.roundRect(220, 520, 120, 60, 14); g.fill(); g.shadowBlur = 0;
  g.fillStyle = "#16301a"; g.font = "900 30px sans-serif"; g.fillText("HUS!", 242, 534);
};
export const drawScreen = (g: CanvasRenderingContext2D, s: Scr) => {
  g.fillStyle = "#15131c"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(255,255,255,0.03)"; for (let y = 0; y < H; y += 24) for (let x = (y / 24) % 2 ? 12 : 0; x < W; x += 24) g.fillRect(x, y, 12, 12);
  logo(g, 18, 18, 24);
  if (s.mode === "play" || s.mode === "timer") {
    g.fillStyle = "#9a96a8"; g.font = "700 14px sans-serif"; g.fillText("PUNKTE", 240, 16);
    g.fillStyle = "#ffffff"; g.font = "900 34px sans-serif"; g.fillText(s.score.toLocaleString("de-DE"), 240, 34);
  }
  if (s.mode === "play") {
    paper(g, s.fold, s.cap);
    if (s.label) pill(g, s.label === "PERFEKT" ? "PERFEKT · " + Math.max(1, s.fold) + "/3" : s.label === "DANEBEN" ? "DANEBEN" : "EINGEPACKT!", 452, s.label === "DANEBEN" ? "#ff4a4a" : "#1b1a22", s.label === "DANEBEN" ? "#ffffff" : "#b8ff3a");
    g.fillStyle = "#2a2834"; g.beginPath(); g.roundRect(60, 500, 240, 14, 7); g.fill(); g.fillStyle = "#b8ff3a"; g.fillRect(170, 496, 20, 22);
    button(g); g.fillStyle = "#9a96a8"; g.font = "700 15px sans-serif"; g.fillText(["Faltung 1/3 – links rüber", "Faltung 2/3 – rechts rüber", "Faltung 3/3 – unten hoch", "Eingepackt!"][Math.min(3, s.fold)], 20, 540);
  } else if (s.mode === "many") {
    const acc = ["#e8443a", "bow", "glasses", "#2f6fb5", "bow", "#ffd25a", "glasses", "#3f9e43", "#7b5ac9", "bow", "#e8443a", "glasses"];
    acc.forEach((a, i) => {
      const x = 70 + (i % 3) * 110, y = 140 + Math.floor(i / 3) * 120;
      g.fillStyle = "#f1ead8"; g.fillRect(x - 44, y - 30, 88, 74);
      if (a === "bow") { g.fillStyle = "#ff5aa0"; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x - 22, y - 44); g.lineTo(x - 22, y - 16); g.moveTo(x, y - 30); g.lineTo(x + 22, y - 44); g.lineTo(x + 22, y - 16); g.fill(); }
      else if (a === "glasses") { g.strokeStyle = "#1b1a22"; g.lineWidth = 4; g.beginPath(); g.arc(x - 14, y - 2, 10, 0, TAU); g.arc(x + 14, y - 2, 10, 0, TAU); g.stroke(); }
      else { g.fillStyle = a; g.beginPath(); g.ellipse(x, y - 30, 30, 18, 0, Math.PI, TAU); g.fill(); g.fillRect(x, y - 33, 30, 6); }
    });
  } else if (s.mode === "scores") {
    g.fillStyle = "#ffffff"; g.font = "900 30px sans-serif"; g.fillText("HIGHSCORE", 18, 80);
    const rows = [["1", "GRANDMA", "15.000"], ["2", "MR. KLOTZ", "9.205"], ["3", "BUDDY", "8.125"], ["4", "ME", "4.105"], ["5", "MAYOR", "3.385"]];
    rows.forEach(([n, who, sc], i) => {
      const y = 130 + i * 74; g.fillStyle = i === 0 ? "#ff7a1a" : "#24222e"; g.beginPath(); g.roundRect(14, y, 332, 60, 12); g.fill();
      g.fillStyle = "#ffffff"; g.font = "900 26px sans-serif"; g.fillText(n, 30, y + 16); g.fillText(who, 70, y + 16); g.textAlign = "right"; g.fillText(sc, 330, y + 16); g.textAlign = "left";
    });
  } else if (s.mode === "timer") {
    g.fillStyle = "#ff4a4a"; g.font = "900 96px sans-serif"; g.textAlign = "center"; g.fillText(`00:${String(s.sec).padStart(2, "0")}`, W / 2, 230);
    g.fillStyle = "#ffffff"; g.font = "800 24px sans-serif"; g.fillText("bis Mitternacht", W / 2, 340); g.textAlign = "left"; button(g);
  } else { logo(g, 40, 260, 56); }
};
/** cached texture for a screen state (quantise the state before calling) */
export const screenTex = (s: Scr): THREE.Texture => ctex("scr" + JSON.stringify(s), W, H, (g) => drawScreen(g, s));
/** the user's billboard at the end: the logo, "wie viele schaffst du?" and "link in bio" */
export const billboardTex = () => ctex("hus_billboard", 1024, 640, (g) => {
  g.fillStyle = "#15131c"; g.fillRect(0, 0, 1024, 640);
  g.font = "900 150px sans-serif"; g.textBaseline = "top"; g.textAlign = "center";
  const grd = g.createLinearGradient(0, 40, 0, 400); grd.addColorStop(0, "#ffd23a"); grd.addColorStop(1, "#ff7a1a");
  g.fillStyle = grd; g.fillText("HUS HUS HUS", 512, 70);
  g.fillStyle = "#ffffff"; g.font = "800 58px sans-serif"; g.fillText("wie viele schaffst du?", 512, 280);
  g.fillStyle = "#b8ff3a"; g.beginPath(); g.roundRect(312, 400, 400, 120, 30); g.fill(); g.fillStyle = "#16301a"; g.font = "900 64px sans-serif"; g.fillText("link in bio", 512, 425);
});
