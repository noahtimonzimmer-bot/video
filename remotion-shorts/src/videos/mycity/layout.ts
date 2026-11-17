// "My City": where everything stands. Ground at y = 0, north = -z.
// Middle (the city) is a disc inside a round wall (r 40, 22 m tall, four gates). The labyrinth fills the square around
// it (7 m cells, 13 m walls). Story set pieces of the labyrinth are separate corridor kits far east (x >= 600) so their
// framing never depends on the generated maze; interiors are rooms far west (x <= -300).
export type V3 = [number, number, number];
export const D0 = 0;
export const WALL_R = 40, WALL_T = 3, WALL_H = 22, GATE_W = 6.5, GATE_H = 10;
export const MAZE_CELL = 7, MAZE_N = 51, MAZE_H = 13, MAZE_T = 1.2; // 50 x 50 cells over -175..175
export const COURT: V3 = [112, 0, -112], COURT_R = 18;
export const FOUNTAIN: V3 = [0, 0, 0];
export const STEPS_R = 3.6;
export const BT_A = -2.3; // bell tower stands in the inner ring, north-west of the plaza
export const BELLTOWER: V3 = [Math.cos(BT_A) * 15, 0, Math.sin(BT_A) * 15];
/** gates: inside centre of each opening (on the wall's inner face) and the direction out of the city */
export const GATES = {
  n: { pos: [0, 0, -WALL_R] as V3, out: [0, -1] as [number, number] },
  s: { pos: [0, 0, WALL_R] as V3, out: [0, 1] as [number, number] },
  e: { pos: [WALL_R, 0, 0] as V3, out: [1, 0] as [number, number] },
  w: { pos: [-WALL_R, 0, 0] as V3, out: [-1, 0] as [number, number] },
};
// ring streets: houses stand on rings (centre radius) with their fronts to the plaza
export const RINGS = [{ r: 15, w: 7.5 }, { r: 25, w: 8 }, { r: 34, w: 7 }];
// named houses: ring index + angle (rad, 0 = +x, measured toward +z). Fronts face the fountain.
export const NAMED = {
  kettle: { ring: 0, a: 0.62 },   // south-east of the plaza
  pebble: { ring: 0, a: 1.15 },
  bakery: { ring: 0, a: 2.55 },   // south-west
  brass: { ring: 0, a: -0.62 },   // north-east, looks at the north gate
};
export const houseAt = (ring: number, a: number) => {
  const r = RINGS[ring].r;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r, yaw: Math.atan2(-Math.cos(a), -Math.sin(a)), d: 8 };
};
/** the spot right in front of a named house's door (toward the plaza), + extra metres out */
export const doorOf = (k: keyof typeof NAMED, out = 1.2): V3 => {
  const n = NAMED[k], r = RINGS[n.ring].r - 4 - out;
  return [Math.cos(n.a) * r, 0, Math.sin(n.a) * r];
};
// labyrinth set pieces (corridor kits), each runs from its origin toward -z
export const KIT = {
  chalk: [600, 0, 0] as V3,     // straight corridor with chalk arrows, a side turn
  cross: [600, 0, 140] as V3,   // four-way crossing
  garden: [720, 0, 0] as V3,    // garden of stone benches
  stairs: [720, 0, 140] as V3,  // staircase down into water
  tally: [840, 0, 0] as V3,     // walls covered with tally marks
  kettle: [840, 0, 140] as V3,  // dead end in the deep west, a copper kettle in the dirt
  write: [960, 0, 0] as V3,     // Pebble's writing
  gate: [960, 0, 140] as V3,    // just outside a gate looking back at the city wall (corridor with the wall at its end)
};
export const KIT_W = 5.6;       // corridor width
// interiors (room shells, see sets.ts), laid out directly at these spots
export const ROOM = {
  bedroom: [-320, 0, 0] as V3,  // Kettle's bedroom with the tally wall
  pebble: [-320, 0, 40] as V3,  // Pebble's front room
  tower: [-320, 0, 80] as V3,   // bell tower floor with the giant map
  bakery: [-320, 0, 120] as V3, // Ladder's bakery
  brass: [-320, 0, 160] as V3,  // Old Brass's front door / hall
};
/** a point in front of a named house: `out` metres from its facade toward the plaza, `side` metres along it */
export const nearDoor = (k: keyof typeof NAMED, out: number, side = 0): V3 => {
  const n = NAMED[k], r = RINGS[n.ring].r - 4 - out, c = Math.cos(n.a), s = Math.sin(n.a);
  return [c * r - s * side, 0, s * r + c * side];
};
