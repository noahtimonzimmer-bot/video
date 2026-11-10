"""Soundtrack for "The Man Who Sold the Eiffel Tower": voice + CC0 music (Lucky Break) + real BigSoundBank SFX.
Rule (cartoon design): music +3 dB, SFX -6 dB vs. the old defaults, voice unchanged. Output: mix.wav (57.5 s, 48 kHz stereo).
  python3 make_mix.py
"""
import subprocess, numpy as np, os
SR = 48000; H = os.path.dirname(os.path.abspath(__file__)); TOTAL = 1725 / 30


def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


db = lambda x: 10 ** (x / 20)
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
n = int(TOTAL * SR)
voice = load(f"{H}/voice.wav"); voice = np.concatenate([voice, np.zeros((max(0, n - len(voice)), 2), np.float32)])[:n]
vr = rms(voice[np.abs(voice).mean(1) > db(-40)])

# voice envelope for ducking
mono = np.abs(voice).mean(1); hop = 480
fr = np.sqrt(np.add.reduceat(mono ** 2, np.arange(0, n, hop)) / hop)
lv = np.clip((20 * np.log10(fr + 1e-9) + 50) / 30, 0, 1); env = np.zeros_like(lv); v = 0
for i, s in enumerate(lv):
    v = (0.7 * v + 0.3 * s) if s > v else (0.98 * v + 0.02 * s); env[i] = v
env = np.repeat(env, hop)[:n]

mix = voice.copy()
# music: start 2 s into the track (skips the soft intro), level voice-13 dB (was -16, +3), ducked 9 dB under speech
mus = load(f"{H}/sfx/score.mp3")[2 * SR: 2 * SR + n]
mus *= db(vr - 13 - rms(mus)); mus *= db(-9 * env)[:, None]
f = int(0.3 * SR); mus[:f] *= np.linspace(0, 1, f)[:, None]; f = int(2.5 * SR); mus[-f:] *= np.linspace(1, 0, f)[:, None]
mix += mus

# SFX cues: (time s, file, gain dB, max length s). Gains are already -6 dB vs. the paperclip mix.
CUES = [
    (0.05, "whoosh", -16, None), (1.6, "chime", -16, None), (2.45, "chime", -14, None),   # hook: sold ... twice
    (3.73, "whoosh", -18, None), (4.0, "street", -24, 4.0),                               # flash -> cafe, street life
    (9.0, "click", -18, None), (12.6, "idea", -14, None),                                 # paper unfolds, idea
    (14.5, "whoosh", -18, None), (15.6, "keyboard", -22, 1.2), (16.3, "pop", -18, None), (16.62, "pop", -18, None), (16.94, "pop", -18, None),
    (17.26, "pop", -18, None), (17.58, "pop", -18, None), (17.9, "pop", -18, None),       # letters fly
    (18.5, "street", -24, 3.6), (21.9, "door", -20, 1.0),                                 # dealers walk in
    (25.3, "chime", -14, None),                                                            # 7,000 tons
    (28.6, "cheer", -24, 1.5),                                                             # riot cloud
    (33.6, "message", -14, None), (33.6, "applause", -24, 1.6), (35.0, "pop", -14, None),  # pays, bribe
    (36.2, "whoosh", -16, None), (36.4, "street", -22, 4.2),                              # train
    (40.9, "door", -22, 1.0),
    (43.8, "whoosh", -18, None), (46.6, "message", -14, None), (46.7, "chime", -18, None),  # sold again
    (47.9, "pop", -12, None), (48.4, "paparazzi", -26, 0.2), (49.3, "whoosh", -12, None),  # police, he runs
    (51.7, "whoosh", -18, None), (54.6, "applause", -22, 2.6),                             # tower stands
]
for t, name, g, mx in CUES:
    s = load(f"{H}/sfx/{name}.wav")
    if mx: s = s[: int(mx * SR)]; k = min(len(s) // 2, int(0.12 * SR)); s[-k:] *= np.linspace(1, 0, k)[:, None]
    a = int(t * SR); b = min(n, a + len(s)); mix[a:b] += s[: b - a] * db(vr + g - rms(s[np.abs(s).mean(1) > db(-45)] if np.any(np.abs(s).mean(1) > db(-45)) else s))

# master: normalise to about -14 LUFS-ish RMS, soft limit
mix *= db(-16 - rms(mix)); peak = np.abs(mix).max()
if peak > 0.97: mix = np.tanh(mix / 0.97 * 1.0) * 0.97
open(f"{H}/mix.raw", "wb").write(mix.astype(np.float32).tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", f"{H}/mix.raw", "-c:a", "pcm_s16le", f"{H}/mix.wav"], check=True)
os.remove(f"{H}/mix.raw"); print("mix.wav", round(n / SR, 2), "s, peak", round(float(np.abs(mix).max()), 3))
