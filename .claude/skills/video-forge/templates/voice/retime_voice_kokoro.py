"""Replace the narration with Kokoro TTS while keeping every line at its original start time
(so the already-rendered picture stays in sync). Reads script.json (cue timings), writes voice_kokoro.wav."""
import json, os, sys, numpy as np, soundfile as sf, subprocess
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__))
MODEL, VOICES = sys.argv[1], sys.argv[2]
VOICE = sys.argv[3] if len(sys.argv) > 3 else 'am_michael'
BASE = 1.05                      # natural pace; raised per line only when a line must fit its slot
SR = 24000
k = Kokoro(MODEL, VOICES)
cues = json.load(open(os.path.join(HERE, 'script.json')))
total = float(subprocess.check_output(['soxi', '-D', os.path.join(HERE, 'voice.wav')]).decode())
out = np.zeros(int((total + 1) * SR), np.float32)
def trim(a, th=0.01):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
stats = []
for i, c in enumerate(cues):
    slot = (cues[i + 1]['start'] if i + 1 < len(cues) else total - 0.3) - c['start'] - 0.08
    text = c['text'].replace('"', '').replace('...', '…')
    sp = BASE; a, _ = k.create(text, voice=VOICE, speed=sp, lang='en-us'); a = trim(a)
    if len(a) / SR > slot:                       # too long for its slot: speak faster (max 1.45)
        sp = min(1.45, BASE * (len(a) / SR) / slot * 1.03); a, _ = k.create(text, voice=VOICE, speed=sp, lang='en-us'); a = trim(a)
    if len(a) / SR > slot + 0.05:                # still too long: hard fade at the slot end
        n = int((slot + 0.05) * SR); a = a[:n].copy(); f = min(len(a), 1200); a[-f:] *= np.linspace(1, 0, f)
    s0 = int(c['start'] * SR); out[s0:s0 + len(a)] += a
    stats.append(sp)
    print(f'{i:3d} {c["start"]:7.2f} slot {slot:5.2f} got {len(a)/SR:5.2f} speed {sp:.2f}  {text[:50]}', flush=True)
out = out[:int(total * SR)]
raw = os.path.join(HERE, 'voice_kokoro_raw.wav'); sf.write(raw, out, SR)
final = os.path.join(HERE, 'voice_kokoro.wav')
subprocess.run(['sox', raw, '-r', '48000', final, 'bass', '+3', '180', 'reverb', '12', '50', '50', '100', '0', '0', 'norm', '-1'], check=True)
print(f'done: {final}  {total:.1f}s, speed median {sorted(stats)[len(stats)//2]:.2f}, max {max(stats):.2f}')
