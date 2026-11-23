import { SHOTS } from "../src/videos/hustown/story";
console.log(SHOTS.map((s) => Math.round(s.a + (s.b - s.a) * 0.6)).join(","));
