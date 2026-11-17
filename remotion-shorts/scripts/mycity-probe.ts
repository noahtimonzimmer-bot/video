import * as THREE from "three";
import { shotAt, camAt, shotU } from "../src/videos/mycity/story";
import { stageSpec } from "../src/videos/mycity/film";
for (const f of process.argv.slice(2).map(Number)) {
  const s = shotAt(f), c = camAt(s.id, f), { u, g } = shotU(s.id, f);
  const st = stageSpec(s.spec, f / 30, u, g, { pos: new THREE.Vector3(...c.pos), right: new THREE.Vector3(1, 0, 0) });
  console.log(f, "shot", s.id, "cue", s.spec.cue, "cam", c.pos.map((v) => v.toFixed(1)), "look", c.look.map((v) => v.toFixed(1)), st.places.map((p) => `${p.key.slice(0, 12)}@${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)}`).join(" "));
}
