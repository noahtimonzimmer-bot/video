// "Dash": a small town on the flat back of a giant sleeping creature. Ground at y = 0, north = -z.
// Main street runs along z (x = 0, 12 m wide), houses both sides with fronts on |x| = 6. The square (wedding) is at
// z = 0, the school at the north end, the bakery and the mailbox on the street, the bus stop at the south end.
// The creature: body = huge flattened dome under the town, head to the north (far below the edge), tail south.
export type V3 = [number, number, number];
export const D0 = 0;
export const STREET_HALF = 6;
export const TOWN_R = 70;            // flat town disc on the creature's back
export const SCHOOL: V3 = [0, 0, -52];
export const BAKERY: V3 = [-6, 0, -20];   // front door on the west side of the street (house front faces +x)
export const MAILBOX: V3 = [4.6, 0, -8];
export const SQUARE: V3 = [0, 0, 6];
export const BUSSTOP: V3 = [3.8, 0, 44];
export const CLASSROOM: V3 = [-300, 0, 0];
/** the narrator's house (east side) and the best friend's house (west side), fronts on the street */
export const MYHOUSE: V3 = [6, 0, 20];
export const FRIEND: V3 = [-6, 0, 28];
