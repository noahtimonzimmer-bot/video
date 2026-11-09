# Render "The Shirt Guy" on your PC (2K 1440x2560, with sound)

Needs Node.js 18+ and git. A GPU makes it fast (a CPU-only render takes hours).

```
git clone -b claude/busy-mayer-yoehkp https://github.com/noahtimonzimmer-bot/video.git
cd video/remotion-shorts
npm install
npm run render:shirt
```

The result is `remotion-shorts/out/shirt/ShirtGuy_2K.mp4`. The sound (voice, music, SFX) is already built in from `public/shirt/mix.wav`.
Preview in the browser first: `npm run studio`, then pick ShirtShort.
If the GPU flag errors on your machine, run without it:
`npx remotion render src/index.ts ShirtShort out/shirt/ShirtGuy_2K.mp4 --codec h264 --crf 16 --scale 1.3333`
