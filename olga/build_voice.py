"""Narration with Kokoro: one synth per line, natural gaps, writes voice.wav + script.json (cue timings)."""
import json, os, sys, numpy as np, soundfile as sf, subprocess
from kokoro_onnx import Kokoro
HERE = os.path.dirname(os.path.abspath(__file__))
MODEL, VOICES = sys.argv[1], sys.argv[2]
VOICE = sys.argv[3] if len(sys.argv) > 3 else 'am_michael'
SPEED, SR = 1.08, 24000
GAP, BIG, SECTION = 0.22, 0.8, 0.4
k = Kokoro(MODEL, VOICES)
def trim(a, th=0.01):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - 240): idx[-1] + 480] if len(idx) else a
lines = [l.rstrip('\n') for l in open(os.path.join(HERE, 'narration.txt'), encoding='utf-8') if l.strip()]
parts, cues, t, pending = [np.zeros(int(0.6 * SR), np.float32)], [], 0.6, 0.0
for line in lines:
    if line.startswith('##'): pending = max(pending, SECTION); continue
    big = line.startswith('!'); text = line.lstrip('!').strip()
    if pending: parts.append(np.zeros(int(pending * SR), np.float32)); t += pending
    a, _ = k.create(text.replace('"', '').replace('…', '...'), voice=VOICE, speed=SPEED, lang='en-us'); a = trim(a)
    cues.append({'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'text': text.replace('…', '...')})
    parts.append(a); t += len(a) / SR
    pending = BIG if big else GAP
    if text.endswith(('…', ':')): pending = max(pending, 0.55)
    print(f'{len(cues):3d} {t:7.2f} {text[:60]}', flush=True)
parts.append(np.zeros(int(2.0 * SR), np.float32))
raw = os.path.join(HERE, 'voice_raw.wav'); sf.write(raw, np.concatenate(parts), SR)
subprocess.run(['sox', raw, '-r', '48000', os.path.join(HERE, 'voice.wav'), 'bass', '+3', '180', 'reverb', '14', '50', '55', '100', '0', '0', 'norm', '-1'], check=True)
json.dump(cues, open(os.path.join(HERE, 'script.json'), 'w'), indent=1, ensure_ascii=False)
print(f'done {len(cues)} cues, {t + 2:.1f}s')
