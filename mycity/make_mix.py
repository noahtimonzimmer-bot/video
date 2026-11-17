"""Soundtrack for "My City": voice + CC0 freepd music per story section + real BigSoundBank SFX and ambiences.
Rules: music +3 dB vs the old default (voice -13 dB, ducked 9 dB under speech), SFX -6 dB vs the old defaults, voice unchanged.
  python3 make_mix.py      -> mix.wav (48 kHz stereo, 572 s)
"""
import json, os, subprocess, numpy as np
SR = 48000; H = os.path.dirname(os.path.abspath(__file__)); TOTAL = 17160 / 30
CUES = json.load(open(f"{H}/script.json"))
at = lambda cue, off=0.0: CUES[cue - 1]["start"] + off
end = lambda cue: CUES[cue - 1]["end"]


def load(p, speed=1.0):
    af = ["-af", f"asetrate={int(SR * speed)},aresample={SR}"] if speed != 1.0 else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, *af, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


db = lambda x: 10 ** (x / 20)
rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
n = int(TOTAL * SR)
voice = load(f"{H}/voice.wav"); voice = np.concatenate([voice, np.zeros((max(0, n - len(voice)), 2), np.float32)])[:n]
vr = rms(voice[np.abs(voice).mean(1) > db(-40)])
mono = np.abs(voice).mean(1); hop = 480
fr = np.sqrt(np.add.reduceat(mono ** 2, np.arange(0, n, hop)) / hop)
lv = np.clip((20 * np.log10(fr + 1e-9) + 50) / 30, 0, 1); env = np.zeros_like(lv); v = 0
for i, s in enumerate(lv):
    v = (0.7 * v + 0.3 * s) if s > v else (0.98 * v + 0.02 * s); env[i] = v
env = np.repeat(env, hop)[:n]
mix = voice.copy()

# ---- music: one CC0 track per story section, 2.5 s crossfades, looped when the section is longer ----
SECTIONS = [  # (from time, track, start offset in the track)
    (0.0, "m_mysteriouslights", 0), (at(19, -1.5), "m_atticsecrets", 0), (at(25, -1.5), "m_nightvigil", 0),
    (at(40, -1.5), "m_infinitewonder", 0), (at(56, -1.5), "m_mysteriouslights", 60), (at(67, -1.5), "m_creepyhallow", 0),
    (at(83, -1.5), "m_nightvigil", 120), (at(97, -1.5), "m_landrasdream", 0), (at(120, -1.5), "m_infinitewonder", 100),
]
music = np.zeros((n, 2), np.float32); XF = int(2.5 * SR)
for k, (t0, name, off) in enumerate(SECTIONS):
    t1 = SECTIONS[k + 1][0] if k + 1 < len(SECTIONS) else TOTAL
    a, b = int(t0 * SR), min(n, int(t1 * SR) + XF)
    tr = load(f"{H}/sfx/{name}.mp3")[int(off * SR):]
    while len(tr) < b - a: tr = np.concatenate([tr, load(f"{H}/sfx/{name}.mp3")])
    seg = tr[: b - a].copy(); seg *= db(vr - 13 - rms(seg))
    if k: seg[:XF] *= np.linspace(0, 1, XF)[:, None]
    if b < n: seg[-XF:] *= np.linspace(1, 0, XF)[:, None]
    music[a:b] += seg
f = int(4 * SR); music[-f:] *= np.linspace(1, 0, f)[:, None]
music *= db(-9 * env)[:, None]
mix += music

# ---- ambiences (loops under whole stretches), level relative to the voice ----
def bed(name, t0, t1, gain, fade=1.5):
    a, b = int(t0 * SR), min(n, int(t1 * SR))
    tr = load(f"{H}/sfx/{name}.wav")
    while len(tr) < b - a: tr = np.concatenate([tr, tr])
    seg = tr[: b - a] * db(vr + gain - rms(tr)); fl = min(int(fade * SR), (b - a) // 2)
    seg[:fl] *= np.linspace(0, 1, fl)[:, None]; seg[-fl:] *= np.linspace(1, 0, fl)[:, None]
    mix[a:b] += seg
bed("birds", 0, at(24), -32); bed("crickets", at(25, -0.5), at(39), -30); bed("owl", at(37), at(38, 2), -34)
bed("birds", at(39), at(70), -33); bed("wind", at(43), at(55, 3), -34); bed("crickets", at(70, -0.5), at(76), -30)
bed("wind", at(77), at(96, 3), -33); bed("birds", at(104), at(117), -34); bed("birds", at(120), TOTAL, -33)
for c in (2, 14, 56, 57, 59, 98, 105, 121, 122): bed("fountain", at(c, -0.3), end(c) + 0.6, -31, 0.6)

# ---- one-shot effects: (time, file, gain dB vs voice, max length, speed) ----
FX = [
    (at(1, -0.2), "whoosh", -16, None, 1.0), (at(8, -0.2), "whoosh", -18, None, 1.0), (at(9, -0.2), "gravel", -24, 3.0, 1.0),
    (at(3), "crowd", -26, 3.2, 1.0), (at(11, 0.3), "chalk", -18, 2.0, 1.0), (at(19), "crowd", -28, 3.0, 1.0),
    (at(20, 0.0), "bell", -12, 6.0, 1.0), (at(20, 2.7), "run", -22, 3.0, 1.0), (at(21), "gravel", -22, 3.5, 1.0),
    (at(24, -0.1), "heart", -18, 4.0, 1.0),
    (at(26), "bell", -12, 5.0, 1.0), (at(26, 2.0), "run", -20, 3.0, 1.0), (at(26, 3.6), "slam", -14, 1.2, 1.0), (at(26, 4.2), "slam", -16, 1.2, 1.0),
    (at(28), "chalk2", -14, 3.0, 0.55), (at(29), "chalk2", -14, 3.0, 0.5), (at(30, 0.5), "chalk2", -16, 2.5, 0.5),
    (at(34, -0.2), "heart", -14, 6.0, 1.0), (at(36, 0.6), "slam", -12, 1.2, 1.0), (at(38), "chalk2", -20, 3.0, 0.5),
    (at(41), "crowd", -30, 2.5, 1.0), (at(42), "gravel", -20, 4.0, 1.0), (at(43, 0.5), "chalk", -16, 2.4, 1.0),
    (at(47, 1.0), "whoosh", -20, None, 1.0), (at(50), "gravel", -22, 4.0, 1.0), (at(63, -0.2), "whoosh", -18, None, 1.0),
    (at(68), "gravel", -20, 3.0, 1.0), (at(69), "heart", -18, 3.0, 1.0), (at(71), "chalk2", -16, 3.5, 0.5), (at(72), "chalk2", -16, 3.0, 0.5),
    (at(73, -0.2), "heart", -14, 5.0, 1.0), (at(75, 0.4), "slam", -18, 1.0, 1.0), (at(76), "creak", -16, 3.0, 1.0), (at(76, 1.0), "gravel", -20, 4.0, 1.0),
    (at(77), "gravel", -22, 4.0, 1.0), (at(83), "gravel", -20, 4.0, 1.0), (at(85), "gravel", -22, 3.0, 1.0),
    (at(88), "gravel", -20, 3.0, 1.0), (at(89, -0.2), "whoosh", -18, None, 1.0), (at(93), "heart", -16, 5.0, 1.0),
    (at(97, -0.2), "whoosh", -18, None, 1.0), (at(100, 1.0), "creak", -12, 4.0, 0.8), (at(102), "chalk2", -18, 3.0, 0.5),
    (at(103, -0.2), "whoosh", -18, None, 1.0), (at(110, -0.2), "whoosh", -18, None, 1.0), (at(117, 0.8), "bell", -12, 6.0, 1.0),
    (at(118, 0.2), "creak", -16, 3.0, 1.0), (at(120, -0.2), "whoosh", -16, None, 1.0),
]
for t, name, g, mx, sp in FX:
    s = load(f"{H}/sfx/{name}.wav", sp)
    if mx: s = s[: int(mx * SR)]; fl = min(int(0.25 * SR), len(s) // 3); s[-fl:] *= np.linspace(1, 0, fl)[:, None]
    pk = 20 * np.log10(np.abs(s).max() + 1e-9)
    s = s * db(vr + g - 6 + 12 - pk)  # peak-normalised, then -6 dB SFX rule
    a = int(t * SR); b = min(n, a + len(s)); mix[a:b] += s[: b - a]

pk = np.abs(mix).max(); mix *= db(-1.0) / max(pk, 1e-9) if pk > db(-1.0) else 1.0
out = f"{H}/mix.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_s16le", out], input=mix.astype(np.float32).tobytes(), check=True)
print("mix", out, f"{n / SR:.1f}s")
