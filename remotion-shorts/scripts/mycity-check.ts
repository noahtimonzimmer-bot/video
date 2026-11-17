// Collision check for "My City" (no rendering): every camera and every character of every shot against houses,
// bell tower, fountain, city wall + gate towers, labyrinth walls, courtyard, corridor kits and room bounds.
// usage: node_modules/.bin/esbuild scripts/mycity-check.ts --bundle --platform=node --outfile=/tmp/x.cjs && node /tmp/x.cjs
const stubCtx = new Proxy({}, { get: () => () => ({ addColorStop() {} }) });
(globalThis as any).document = { createElement: () => ({ width: 2, height: 2, getContext: () => stubCtx }) };
import * as THREE from "three";
import { SHOTS, camAt, shotU } from "../src/videos/mycity/story";
import { stageSpec } from "../src/videos/mycity/film";
import { houseSpots, MAZE_WALLS, buildMazeOnly } from "../src/videos/mycity/city";
import { Batch } from "../src/videos/mycity/build";
import { WALL_R, WALL_T, GATE_W, GATE_H, MAZE_H, COURT, COURT_R, BELLTOWER, KIT, KIT_W, ROOM } from "../src/videos/mycity/layout";
buildMazeOnly(new Batch());
const houses = houseSpots();
const GATE_A = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
const hit = (x: number, y: number, z: number, m: number): string | null => {
  for (const h of houses) {
    const dx = x - h.x, dz = z - h.z, c = Math.cos(h.yaw), s = Math.sin(h.yaw);
    const lx = dx * c - dz * s, lz = dx * s + dz * c; // local (x along front, z out of front)
    if (Math.abs(lx) < h.w / 2 + m && Math.abs(lz) < 4 + m && y < h.h + 4) return `house@${h.x.toFixed(1)},${h.z.toFixed(1)}`;
  }
  if (Math.abs(x - BELLTOWER[0]) < 2.7 + m && Math.abs(z - BELLTOWER[2]) < 2.7 + m && y < 22) return "belltower";
  const r = Math.hypot(x, z);
  if (r < 2.75 + m && y < 4.2) return "fountain";
  if (r > WALL_R - m && r < WALL_R + WALL_T + m && y < 23) {
    const a = Math.atan2(z, x);
    const inGate = GATE_A.some((g) => Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) * r < GATE_W / 2 - m) && y < GATE_H - 0.3;
    if (!inGate) return "citywall";
  }
  for (const g of GATE_A) for (const sd of [-1, 1]) {
    const cx = Math.cos(g), cz = Math.sin(g), px = cx * (WALL_R + 1.5) - cz * sd * (GATE_W / 2 + 2.6), pz = cz * (WALL_R + 1.5) + cx * sd * (GATE_W / 2 + 2.6);
    if (Math.hypot(x - px, z - pz) < 3.0 + m && y < 30) return "gatetower";
  }
  if (y < MAZE_H + 0.5) for (const [x0, x1, z0, z1] of MAZE_WALLS) if (x > x0 - m && x < x1 + m && z > z0 - m && z < z1 + m) return "mazewall";
  const cr = Math.hypot(x - COURT[0], z - COURT[2]);
  if (cr > COURT_R - m && cr < COURT_R + 1.4 + m && y < MAZE_H + 0.5 && Math.abs(Math.atan2(z - COURT[2], x - COURT[0]) - Math.PI) > 0.2 && Math.abs(Math.atan2(z - COURT[2], x - COURT[0]) + Math.PI) > 0.2) return "courtwall";
  if (Math.abs(x - COURT[0]) < 3.4 + m && Math.abs(z - COURT[2] - 2) < 0.9 + m && y < 11) return "door";
  if (x > 550) {
    for (const [name, o] of Object.entries(KIT)) {
      if (Math.abs(x - o[0]) > 16 || z > o[2] + 7 || z < o[2] - 70) continue;
      if (name === "garden" && z < o[2] - 13 && z > o[2] - 36 && Math.abs(x - o[0]) < 10.4 - m) return null;
      if (Math.abs(x - o[0]) > KIT_W / 2 - m) return `kitwall:${name}`;
      return null;
    }
  }
  if (x < -300) {
    for (const [name, o] of Object.entries(ROOM)) {
      const hw = name === "tower" ? 5 : name === "bedroom" ? 3.5 : 4, hd = name === "tower" ? 5 : 3;
      if (Math.abs(x - o[0]) < hw + 3 && Math.abs(z - o[2]) < hd + 3) return Math.abs(x - o[0]) < hw - m && Math.abs(z - o[2]) < hd - m ? null : `roomwall:${name}`;
    }
  }
  return null;
};
let bad = 0;
const seen = new Set<string>();
for (const s of SHOTS) {
  for (let f = s.a; f < s.b; f += 10) {
    const c = camAt(s.id, f), { u, g } = shotU(s.id, f);
    const hc = hit(c.pos[0], c.pos[1], c.pos[2], 0.35);
    if (hc && !seen.has(`${s.id}c${hc}`)) { seen.add(`${s.id}c${hc}`); bad++; console.log(`shot ${s.id} cue ${s.spec.cue} f${f} CAMERA in ${hc} at ${c.pos.map((v) => v.toFixed(1))}`); }
    const right = new THREE.Vector3(1, 0, 0);
    const st = stageSpec(s.spec, f / 30, u, g, { pos: new THREE.Vector3(...c.pos), right });
    for (const p of st.places) {
      const hp = hit(p.x, 0.5, p.z, 0.25);
      const k = `${s.id}p${p.x.toFixed(0)},${p.z.toFixed(0)}${hp}`;
      if (hp && !seen.has(k)) { seen.add(k); bad++; console.log(`shot ${s.id} cue ${s.spec.cue} f${f} PERSON in ${hp} at ${p.x.toFixed(1)},${p.z.toFixed(1)}`); }
      const d = Math.hypot(p.x - c.pos[0], p.z - c.pos[2]);
      if (d < 1.0 && !seen.has(k + "near")) { seen.add(k + "near"); console.log(`shot ${s.id} cue ${s.spec.cue} f${f} person ${d.toFixed(2)} m from lens`); }
    }
  }
}
console.log(`${SHOTS.length} shots, ${bad} problems`);
