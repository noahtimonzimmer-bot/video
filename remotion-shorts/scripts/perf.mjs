// usage: COMP=Id node scripts/perf.mjs <from> <to> <scale> '<inputProps json>' [concurrency]  -> seconds per frame
import fs from "node:fs"; import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler"; import { renderMedia, selectComposition } from "@remotion/renderer";
const [from, to, scale = "1", props = "{}", conc = "1"] = process.argv.slice(2);
const inputProps = JSON.parse(props);
const browserExecutable = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium", chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP, browserExecutable, chromiumOptions, inputProps });
let t1 = 0; const t0 = Date.now();
await renderMedia({ composition, serveUrl, codec: "h264", outputLocation: "out/perf.mp4", frameRange: [Number(from), Number(to)], scale: Number(scale), concurrency: Number(conc), inputProps,
  browserExecutable, chromiumOptions, timeoutInMilliseconds: 600000, muted: true,
  onProgress: ({ renderedFrames }) => { if (renderedFrames === 1 && !t1) t1 = Date.now(); } });
const n = Number(to) - Number(from);
console.log(props, "first", ((t1 - t0) / 1000).toFixed(0) + "s", "per frame after first", ((Date.now() - t1) / 1000 / Math.max(1, n)).toFixed(1) + "s");
