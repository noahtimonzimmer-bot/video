// "My City" timeline: shots from film.ts SPECS, each starting LEAD before its narration cue (or `at` seconds into it).
// Camera per shot from the spec; lens blur per shot (dof = blur radius at infinity, px at 1080 height).
import { SPECS, ShotSpec, Cam } from "./film";
import { CUES, TOTAL } from "./cues";
import { LightName } from "./lights";
export { TOTAL };
export const FPS = 30;
export const D0 = 0;
export type V3 = [number, number, number];
export type Light = LightName;
export type ShotDef = { id: number; a: number; b: number; light: Light; spec: ShotSpec };
const LEAD = 0.25;
const starts = SPECS.map((s, i) => (i === 0 ? 0 : Math.round(((CUES[s.cue - 1][0] - LEAD) + (s.at ?? 0)) * FPS)));
export const SHOTS: ShotDef[] = SPECS.map((s, i) => ({ id: i + 1, a: starts[i], b: i + 1 < SPECS.length ? starts[i + 1] : TOTAL, light: s.light, spec: s }));
/** crossfades (frames) where the light changes (day <-> night) */
export const XFADE: Record<number, number> = {};
SHOTS.forEach((s, i) => { if (i && SHOTS[i - 1].light !== s.light) XFADE[s.id] = 12; });
export const FLASH_AT = -100;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** shot-local progress */
export const shotU = (id: number, f: number) => { const s = SHOTS[id - 1]; return { u: Math.max(0, Math.min(1, (f - s.a) / Math.max(1, s.b - s.a))), g: f - s.a }; };
export const camAt = (id: number, f: number): Cam => { const s = SHOTS[id - 1], { u, g } = shotU(id, f); return s.spec.cam(u, g); };
export const dofAt = (f: number) => {
  const s = shotAt(f);
  return { cInf: s.spec.dof ?? 0, focus: s.spec.focus ? (_f: number) => s.spec.focus! : undefined };
};
