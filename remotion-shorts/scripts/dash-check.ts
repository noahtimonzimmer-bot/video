// Collision check for "Dash": cameras and characters vs houses, school, bakery, lanterns, mailbox, bus.
import * as THREE from "three";
import { SHOTS, camAt, shotU } from "../src/videos/dash/story";
import { stageSpec } from "../src/videos/dash/film";
import { houseSpots, propSpots } from "../src/videos/dash/city";
import { SCHOOL, BAKERY, BUSSTOP } from "../src/videos/dash/layout";
const houses = [...houseSpots(), { x: SCHOOL[0], z: SCHOOL[2] - 4, yaw: 0, w: 16, h: 8.6 }, { x: BAKERY[0] - 4, z: BAKERY[2], yaw: Math.PI / 2, w: 7, h: 7.4 }];
const props = propSpots();
const hit = (x: number, y: number, z: number, m: number): string | null => {
  for (const h of houses) {
    const dx = x - h.x, dz = z - h.z, c = Math.cos(h.yaw), s = Math.sin(h.yaw), lx = dx * c - dz * s, lz = dx * s + dz * c;
    if (Math.abs(lx) < h.w / 2 + m && Math.abs(lz) < 4 + m && y < h.h + 4) return `house@${h.x.toFixed(1)},${h.z.toFixed(1)}`;
  }
  for (const p of props) if (p.kind !== "bus" && Math.hypot(x - p.x, z - p.z) < p.rad + m && y < p.h) return p.kind;
  if (Math.abs(x - (BUSSTOP[0] + 0.6)) < 1.25 + m && Math.abs(z - (BUSSTOP[2] + 2)) < 4.5 + m && y < 3.2) return "bus";
  return null;
};
let bad = 0; const seen = new Set<string>();
for (const s of SHOTS) for (let f = s.a; f < s.b; f += 5) {
  const c = camAt(s.id, f), { u, g } = shotU(s.id, f);
  const hc = hit(c.pos[0], c.pos[1], c.pos[2], 0.35);
  if (hc && !seen.has(`${s.id}c`)) { seen.add(`${s.id}c`); bad++; console.log(`shot ${s.id} cue ${s.spec.cue} f${f} CAMERA in ${hc} at ${c.pos.map((v) => v.toFixed(1))}`); }
  const st = stageSpec(s.spec, f / 30, u, g, { pos: new THREE.Vector3(...c.pos), right: new THREE.Vector3(1, 0, 0) });
  for (const p of st.places) { const hp = hit(p.x, 0.5, p.z, 0.25), k = `${s.id}${hp}${p.key.slice(0, 20)}`; if (hp && !seen.has(k)) { seen.add(k); bad++; console.log(`shot ${s.id} cue ${s.spec.cue} f${f} PERSON in ${hp} at ${p.x.toFixed(1)},${p.z.toFixed(1)}`); } }
}
console.log(`${SHOTS.length} shots, ${bad} problems`);
