#!/usr/bin/env bash
# Einmal pro frischem Container: Studio-Abhängigkeiten, Kokoro-TTS (über npm, da HuggingFace blockiert), sox.
# usage: bash setup.sh [KOKORO_DIR]   (Default: $HOME/kokoro)
set -e
ROOT=$(cd "$(dirname "$0")/../../../.." && pwd)          # /home/user/video
K=${1:-$HOME/kokoro}; mkdir -p "$K"
command -v sox >/dev/null || (DEBIAN_FRONTEND=noninteractive apt-get install -y -qq sox libsox-fmt-all >/dev/null)
pip install -q --break-system-packages numpy scipy soundfile kokoro-onnx 2>&1 | grep -v WARN || true
(cd "$ROOT/aitrends-2d-studio" && [ -d node_modules ] || npm install --silent)
if [ ! -f "$K/model_q8.onnx" ]; then
  T=$(mktemp -d); (cd "$T" && npm pack -s kokoro-q8-shards@1.0.0 >/dev/null && tar xzf kokoro-q8-shards-1.0.0.tgz)
  cat "$T"/package/kokoro-q8.part{0,1,2,3,4,5}.bin > "$K/model_q8.onnx"; rm -rf "$T"
fi
if [ ! -f "$K/voices.npz" ]; then
  T=$(mktemp -d); (cd "$T" && npm pack -s kokoro-js@1.2.1 >/dev/null && tar xzf kokoro-js-1.2.1.tgz)
  python3 - "$T/package/voices" "$K/voices.npz" <<'PY'
import numpy as np, glob, os, sys
d = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob(sys.argv[1] + '/*.bin')}
np.savez(sys.argv[2], **d); print(len(d), 'voices')
PY
  rm -rf "$T"
fi
python3 -c "import kokoro_onnx; print('kokoro ok')"
echo "export CHROMIUM_PATH=/opt/pw-browsers/chromium  KOKORO=$K"
