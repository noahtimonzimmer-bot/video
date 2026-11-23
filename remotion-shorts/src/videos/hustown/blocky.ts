// Real 3D block characters (blocky avatar style: cube head with a painted face, box torso, box arms and legs swinging
// from shoulder / hip pivots), a block dog and the giant shadow monster. All parts use the world's two-tone toon
// materials and stay on the inked layer, so they get the same black outlines as the town.
import * as THREE from "three";
import { lam } from "./build";
import { ctex } from "./paint";

const TAU = Math.PI * 2;
export type Face = "smile" | "grin" | "shock" | "nervous" | "focus" | "sad" | "sweet" | "monster" | "closed";
export type Look = {
  shirt: string; pants: string; skin?: string; shoes?: string;
  hat?: "cap" | "bun" | "hair" | "bow" | "none"; hatCol?: string; hair?: string; glasses?: boolean; slippers?: boolean; tie?: string;
};
export type Pose = {
  phase?: number; run?: number; arms?: "side" | "phone" | "wave" | "up" | "point" | "tap"; head?: number; turn?: number;
  face?: Face; t?: number; jump?: number; screen?: THREE.Texture | null; sit?: boolean;
};

/** painted face on the front of the head */
const faceTex = (face: Face, skin: string) => ctex(`bface_${face}_${skin}`, 256, 256, (g) => {
  g.fillStyle = skin; g.fillRect(0, 0, 256, 256);
  const ink = "#1b1720", eye = (x: number, y: number, r = 16) => { g.fillStyle = ink; g.beginPath(); g.ellipse(x, y, r * 0.75, r, 0, 0, TAU); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x - 4, y - 6, r * 0.28, 0, TAU); g.fill(); };
  g.lineCap = "round"; g.strokeStyle = ink; g.lineWidth = 10;
  const arc = (y: number, w: number, d: number) => { g.beginPath(); g.moveTo(128 - w, y); g.quadraticCurveTo(128, y + d, 128 + w, y); g.stroke(); };
  switch (face) {
    case "smile": eye(92, 108); eye(164, 108); arc(168, 40, 30); break;
    case "grin": eye(92, 104); eye(164, 104); g.fillStyle = ink; g.beginPath(); g.moveTo(80, 160); g.quadraticCurveTo(128, 222, 176, 160); g.closePath(); g.fill(); g.fillStyle = "#fff"; g.fillRect(96, 160, 64, 12); break;
    case "shock": eye(92, 100, 20); eye(164, 100, 20); g.fillStyle = ink; g.beginPath(); g.ellipse(128, 182, 18, 26, 0, 0, TAU); g.fill(); break;
    case "nervous": eye(92, 108, 13); eye(164, 108, 13); g.beginPath(); for (let i = 0; i <= 8; i++) g.lineTo(84 + i * 11, 176 + (i % 2 ? -7 : 7)); g.stroke();
      g.fillStyle = "#7fc8ff"; g.beginPath(); g.ellipse(206, 70, 12, 18, 0, 0, TAU); g.fill(); break;
    case "focus": eye(92, 112, 13); eye(164, 112, 13); g.lineWidth = 9; g.beginPath(); g.moveTo(70, 80); g.lineTo(112, 92); g.moveTo(186, 80); g.lineTo(144, 92); g.stroke(); arc(176, 22, 0); break;
    case "sad": eye(92, 110, 13); eye(164, 110, 13); arc(186, 34, -24); g.fillStyle = "#7fc8ff"; g.beginPath(); g.ellipse(92, 140, 7, 14, 0, 0, TAU); g.fill(); break;
    case "sweet": g.beginPath(); g.arc(92, 112, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(164, 112, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); arc(168, 46, 36);
      g.fillStyle = "rgba(255,120,150,0.5)"; g.beginPath(); g.ellipse(64, 150, 20, 12, 0, 0, TAU); g.ellipse(192, 150, 20, 12, 0, 0, TAU); g.fill(); break;
    case "closed": g.beginPath(); g.moveTo(76, 110); g.lineTo(108, 110); g.moveTo(148, 110); g.lineTo(180, 110); g.stroke(); arc(170, 26, 10); break;
    case "monster": g.fillStyle = "#14101e"; g.fillRect(0, 0, 256, 256);
      for (const x of [86, 170]) { const gr = g.createRadialGradient(x, 110, 4, x, 110, 40); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.35, "#ffe23a"); gr.addColorStop(1, "rgba(255,180,0,0)"); g.fillStyle = gr; g.fillRect(x - 40, 70, 80, 80); }
      g.fillStyle = "#ffe23a"; g.beginPath(); g.moveTo(70, 190); for (let i = 0; i <= 8; i++) g.lineTo(70 + i * 15, i % 2 ? 176 : 204); g.lineTo(190, 190); g.fill(); break;
  }
});
const col = (c: string, em?: string) => lam("blk" + c + (em ?? ""), () => ({ color: c, ...(em ? { emissive: em } : {}) }));
const faceMat = (face: Face, skin: string) => lam(`bfacem_${face}_${skin}`, () => ({ map: faceTex(face, skin), ...(face === "monster" ? { emissive: "#ffffff", emissiveMap: faceTex(face, skin), emissiveIntensity: 1.6 } : {}) }));
const box = (w: number, h: number, d: number, y0 = 0) => new THREE.BoxGeometry(w, h, d).translate(0, y0, 0);

/** one block person; parts are re-dressed per frame (cheap: materials are shared and cached) */
export class Blocky {
  root = new THREE.Group();
  private hips = new THREE.Group(); private torso: THREE.Mesh; private head: THREE.Mesh; private headPivot = new THREE.Group();
  private armL = new THREE.Group(); private armR = new THREE.Group(); private legL = new THREE.Group(); private legR = new THREE.Group();
  private armMeshes: THREE.Mesh[] = []; private legMeshes: THREE.Mesh[] = []; private shoes: THREE.Mesh[] = [];
  private hat: THREE.Mesh; private brim: THREE.Mesh; private glasses: THREE.Mesh; private tie: THREE.Mesh; private bun: THREE.Mesh;
  private phone: THREE.Mesh; private screen: THREE.Mesh; private screenMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  constructor(parent: THREE.Object3D) {
    const R = this.root;
    R.add(this.hips); this.hips.position.y = 0.8;
    this.torso = new THREE.Mesh(box(0.8, 0.8, 0.42, 0.4)); this.hips.add(this.torso);
    this.headPivot.position.y = 0.8; this.hips.add(this.headPivot);
    this.head = new THREE.Mesh(box(0.56, 0.56, 0.56, 0.3)); this.headPivot.add(this.head);
    this.hat = new THREE.Mesh(box(0.6, 0.18, 0.6, 0.66)); this.headPivot.add(this.hat);
    this.brim = new THREE.Mesh(box(0.5, 0.05, 0.3, 0.6).translate(0, 0, 0.38)); this.headPivot.add(this.brim);
    this.bun = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8).translate(0, 0.66, -0.12)); this.headPivot.add(this.bun);
    this.glasses = new THREE.Mesh(box(0.5, 0.1, 0.04, 0.36).translate(0, 0, 0.3)); this.headPivot.add(this.glasses);
    this.tie = new THREE.Mesh(box(0.12, 0.5, 0.04, 0.45).translate(0, 0, 0.22)); this.hips.add(this.tie);
    for (const [g, x] of [[this.armL, -0.6], [this.armR, 0.6]] as const) {
      g.position.set(x, 0.72, 0); this.hips.add(g);
      const m = new THREE.Mesh(box(0.38, 0.8, 0.38, -0.33)); g.add(m); this.armMeshes.push(m);
    }
    for (const [g, x] of [[this.legL, -0.2], [this.legR, 0.2]] as const) {
      g.position.set(x, 0, 0); this.hips.add(g);
      const m = new THREE.Mesh(box(0.39, 0.8, 0.4, -0.4)); g.add(m); this.legMeshes.push(m);
      const s = new THREE.Mesh(box(0.42, 0.14, 0.5, -0.76).translate(0, 0, 0.05)); g.add(s); this.shoes.push(s);
    }
    this.phone = new THREE.Mesh(box(0.26, 0.46, 0.04, 0), col("#1b1a22")); this.phone.position.set(0, -0.78, 0.2); this.armR.add(this.phone);
    this.screen = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.4), this.screenMat); this.screen.position.set(0, 0, 0.022); this.phone.add(this.screen);
    R.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    this.screen.castShadow = false;
    R.visible = false; parent.add(R);
  }
  dress(L: Look, face: Face) {
    const skin = L.skin ?? "#ffd25a";
    this.torso.material = col(L.shirt); this.head.material = [col(skin), col(skin), col(skin), col(skin), faceMat(face, skin), col(skin)];
    for (const m of this.armMeshes) m.material = col(skin === "#14101e" ? skin : L.shirt);
    this.armMeshes[0].material = this.armMeshes[1].material = col(L.shirt);
    for (const m of this.legMeshes) m.material = col(L.pants);
    for (const s of this.shoes) s.material = L.slippers ? col("#ff8ac8", "#5a1838") : col(L.shoes ?? "#2a2630");
    this.hat.visible = L.hat === "cap" || L.hat === "hair"; this.brim.visible = L.hat === "cap"; this.bun.visible = L.hat === "bun"; this.glasses.visible = !!L.glasses;
    this.hat.material = this.brim.material = col(L.hat === "hair" ? L.hair ?? "#3a2418" : L.hatCol ?? "#e8443a");
    this.bun.material = col(L.hair ?? "#e6e6ea"); this.glasses.material = col("#1b1a22");
    this.tie.visible = !!L.tie; if (L.tie) this.tie.material = col(L.tie);
  }
  pose(p: Pose) {
    const ph = (p.phase ?? 0) * TAU, run = p.run ?? 0, sw = Math.sin(ph) * (0.35 + 0.65 * run), t = p.t ?? 0;
    this.legL.rotation.x = p.sit ? -1.45 : sw; this.legR.rotation.x = p.sit ? -1.45 : -sw;
    this.hips.position.y = (p.sit ? 0.48 : 0.8) + (run ? Math.abs(Math.cos(ph)) * 0.12 * run : 0) + (p.jump ?? 0);
    this.torso.rotation.x = run * 0.18;
    const arms = p.arms ?? "side";
    this.armL.rotation.set(0, 0, 0); this.armR.rotation.set(0, 0, 0);
    if (arms === "side") { this.armL.rotation.x = -sw; this.armR.rotation.x = sw; this.armL.rotation.z = -0.06; this.armR.rotation.z = 0.06; }
    else if (arms === "phone" || arms === "tap") {
      const tap = arms === "tap" ? 0.12 * Math.max(0, Math.sin(t * 22)) : 0;
      this.armL.rotation.set(-1.15, 0, 0.42); this.armR.rotation.set(-1.15 - tap, 0, -0.42);
    } else if (arms === "wave") { this.armR.rotation.set(0, 0, 2.6 + 0.35 * Math.sin(t * 9)); this.armL.rotation.x = -sw; }
    else if (arms === "up") { this.armL.rotation.set(0, 0, -2.7 + 0.2 * Math.sin(t * 14)); this.armR.rotation.set(0, 0, 2.7 - 0.2 * Math.sin(t * 14 + 1)); }
    else if (arms === "point") { this.armR.rotation.set(-1.5, 0, 0); this.armL.rotation.x = -sw * 0.3; }
    this.phone.visible = arms === "phone" || arms === "tap";
    this.screenMat.map = p.screen ?? null; this.screenMat.color.set(p.screen ? "#ffffff" : "#20d0a0"); this.screenMat.needsUpdate = true;
    this.headPivot.rotation.set(p.head ?? (arms === "phone" || arms === "tap" ? 0.38 : 0), p.turn ?? 0, 0);
  }
}

/** block dog with a phone on the ground: taps it with its nose */
export class BlockDog {
  root = new THREE.Group(); private head = new THREE.Group(); private legs: THREE.Mesh[] = []; private tail: THREE.Mesh; private screenMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  constructor(parent: THREE.Object3D) {
    const fur = col("#c98a52"), dark = col("#7a4a2e");
    const body = new THREE.Mesh(box(0.42, 0.36, 0.8, 0.52), fur); this.root.add(body);
    this.head.position.set(0, 0.72, 0.42); this.root.add(this.head);
    this.head.add(new THREE.Mesh(box(0.36, 0.34, 0.36, 0), fur));
    const snout = new THREE.Mesh(box(0.2, 0.16, 0.2, -0.06).translate(0, 0, 0.26), col("#e8c49a")); this.head.add(snout);
    this.head.add(new THREE.Mesh(box(0.08, 0.06, 0.04, -0.01).translate(0, 0, 0.37), col("#1b1720")));
    for (const s of [-1, 1]) this.head.add(new THREE.Mesh(box(0.08, 0.22, 0.14, 0.1).translate(s * 0.19, 0, -0.02), dark));
    for (const s of [-1, 1]) this.head.add(new THREE.Mesh(box(0.06, 0.06, 0.02, 0.06).translate(s * 0.09, 0, 0.18), col("#1b1720")));
    for (const [x, z] of [[-0.13, 0.28], [0.13, 0.28], [-0.13, -0.28], [0.13, -0.28]]) { const l = new THREE.Mesh(box(0.12, 0.36, 0.12, 0.18), fur); l.position.set(x, 0, z); this.root.add(l); this.legs.push(l); }
    this.tail = new THREE.Mesh(box(0.08, 0.08, 0.3, 0).translate(0, 0, -0.15), fur); this.tail.position.set(0, 0.66, -0.4); this.root.add(this.tail);
    const phone = new THREE.Mesh(box(0.26, 0.03, 0.46, 0.015), col("#1b1a22")); phone.position.set(0, 0, 0.78); this.root.add(phone);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.4).rotateX(-Math.PI / 2), this.screenMat); scr.position.set(0, 0.032, 0.78); this.root.add(scr);
    this.root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    this.root.visible = false; parent.add(this.root);
  }
  pose(t: number, screen: THREE.Texture | null) {
    const tap = Math.max(0, Math.sin(t * 9));
    this.head.rotation.x = 0.5 + 0.35 * tap; this.head.position.z = 0.42 + 0.06 * tap;
    this.tail.rotation.y = 0.6 * Math.sin(t * 14);
    this.screenMat.map = screen; this.screenMat.needsUpdate = true;
  }
}
