import fs from "node:fs"; import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler"; import { renderMedia, selectComposition } from "@remotion/renderer";
const [id, from, to, scale = "0.5", conc = "4", out = "out/range.mp4"] = process.argv.slice(2);
const browserExecutable = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium", chromiumOptions = { gl: process.env.REMOTION_GL || "swangle" };
const inputProps = JSON.parse(process.env.PROPS || "{}");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
const t0 = Date.now();
await renderMedia({ composition, serveUrl, inputProps, muted: process.env.MUTED === "1", codec: "h264", crf: 16, outputLocation: out, frameRange: [Number(from), Number(to)], scale: Number(scale), concurrency: Number(conc), browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000,
  onProgress: ({ renderedFrames }) => { if (renderedFrames % 10 === 0) console.log("frames", renderedFrames, ((Date.now() - t0) / 1000).toFixed(0) + "s"); } });
console.log("done", ((Date.now() - t0) / 1000).toFixed(0) + "s");
