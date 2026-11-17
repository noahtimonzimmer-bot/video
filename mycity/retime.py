"""Slow the Kokoro narration (tempo, pitch kept) and widen the pauses so the film runs ~9.5-10 min.
Reads voice_raw.wav + script_raw.json (cue times of the raw take), writes voice.wav + script.json."""
import json, os, subprocess, numpy as np, soundfile as sf
H = os.path.dirname(os.path.abspath(__file__)); SR = 24000
TEMPO, GAP, BIG, SECTION, LEAD, TAIL = 0.88, 0.6, 1.8, 3.0, 1.2, 5.0
raw, sr = sf.read(f"{H}/voice_raw.wav", dtype="float32"); assert sr == SR
cues = json.load(open(f"{H}/script_raw.json"))
lines = [l.rstrip('\n') for l in open(f"{H}/narration.txt", encoding='utf-8') if l.strip()]
marks, pending = [], 0.0
for l in lines:
    if l.startswith('##'): pending = SECTION; continue
    marks.append((pending, l.startswith('!'), l.lstrip('!').strip())); pending = 0.0
assert len(marks) == len(cues), (len(marks), len(cues))
tmp = f"{H}/_seg"; os.makedirs(tmp, exist_ok=True)
parts, out, t, prev_big = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD, False
for i, (c, (sec, big, text)) in enumerate(zip(cues, marks)):
    seg = raw[int(c['start'] * SR): int(c['end'] * SR)]
    sf.write(f"{tmp}/a.wav", seg, SR)
    subprocess.run(['sox', f"{tmp}/a.wav", f"{tmp}/b.wav", 'tempo', '-s', str(TEMPO)], check=True)
    seg, _ = sf.read(f"{tmp}/b.wav", dtype="float32")
    if i:
        gap = max(sec, BIG if prev_big else GAP)
        if text and cues[i - 1]['text'].endswith(('...', ':')): gap = max(gap, 0.9)
        parts.append(np.zeros(int(gap * SR), np.float32)); t += gap
    out.append({'start': round(t, 3), 'end': round(t + len(seg) / SR, 3), 'text': c['text']})
    parts.append(seg); t += len(seg) / SR; prev_big = big
parts.append(np.zeros(int(TAIL * SR), np.float32)); t += TAIL
sf.write(f"{H}/voice_slow_raw.wav", np.concatenate(parts), SR)
subprocess.run(['sox', f"{H}/voice_slow_raw.wav", '-r', '48000', f"{H}/voice.wav", 'bass', '+3', '180', 'reverb', '14', '50', '55', '100', '0', '0', 'norm', '-1'], check=True)
json.dump(out, open(f"{H}/script.json", 'w'), indent=1, ensure_ascii=False)
print(f"total {t:.1f}s = {t/60:.2f} min, {len(out)} cues")
