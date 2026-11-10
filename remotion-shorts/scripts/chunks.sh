#!/bin/bash
# Resumable chunked render on a CPU-only machine: real 720p inside (dpr 0.6667), muted chunks, then concat,
# upscale to 1080x1920 (lanczos) and mux the soundtrack.
# usage: scripts/chunks.sh <CompId> <totalFrames> <outDir> <mix.wav> [chunk=150]
set -u
COMP=$1; TOTAL=$2; OUT=$3; MIX=$4; CH=${5:-150}
mkdir -p "$OUT"; export REMOTION_TMP=${REMOTION_TMP:-/home/user/remotion-tmp} PROPS='{"post":{"dpr":0.6667}}' MUTED=1
for ((a=0; a<TOTAL; a+=CH)); do
  b=$((a+CH-1)); [ $b -ge $TOTAL ] && b=$((TOTAL-1))
  f=$(printf "%s/c%05d.mp4" "$OUT" $a)
  [ -s "$f" ] && continue
  echo "CHUNK $a-$b start $(date +%H:%M)"
  node scripts/range.mjs "$COMP" $a $b 0.6667 1 "$f.tmp.mp4" > "$OUT/log_$a.txt" 2>&1 && mv "$f.tmp.mp4" "$f" || { echo "CHUNK $a FAILED"; exit 1; }
  echo "CHUNK $a-$b done $(date +%H:%M)"
done
ls "$OUT"/c*.mp4 | sed "s#^#file '#; s#\$#'#" > "$OUT/list.txt"
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -i "$MIX" -map 0:v:0 -map 1:a:0 -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$OUT/final.mp4" && echo "FINAL DONE $OUT/final.mp4"
