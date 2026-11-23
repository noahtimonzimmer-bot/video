"""Soundtrack for "HUS town": sped-up voice + CC0 music (City Run, cut to silence when the new kid walks, tension under the
rumble, back on for the last line) + real BigSoundBank SFX (running feet, crowd, thunder slowed into a rumble, whooshes).
Rules: music +3 dB vs old default (voice -13 dB, ducked 9 dB), SFX -6 dB, voice unchanged.  -> mix.wav, mix.mp3"""
import json, os, subprocess, numpy as np
SR = 48000; H = os.path.dirname(os.path.abspath(__file__)); TOTAL = 2438 / 30
CUES = json.load(open(f"{H}/script.json")); at = lambda c, o=0.0: CUES[c - 1]["start"] + o
def load(p, speed=1.0):
    af = ["-af", f"asetrate={int(SR * speed)},aresample={SR}"] if speed != 1.0 else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, *af, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
db = lambda x: 10 ** (x / 20); rms = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
n = int(TOTAL * SR)
voice = load(f"{H}/voice.wav"); voice = np.concatenate([voice, np.zeros((max(0, n - len(voice)), 2), np.float32)])[:n]
vr = rms(voice[np.abs(voice).mean(1) > db(-40)])
mono = np.abs(voice).mean(1); hop = 480
fr = np.sqrt(np.add.reduceat(mono ** 2, np.arange(0, n, hop)) / hop)
lv = np.clip((20 * np.log10(fr + 1e-9) + 50) / 30, 0, 1); env = np.zeros_like(lv); v = 0
for i, s in enumerate(lv): v = (0.7 * v + 0.3 * s) if s > v else (0.98 * v + 0.02 * s); env[i] = v
env = np.repeat(env, hop)[:n]; mix = voice.copy(); music = np.zeros((n, 2), np.float32)
def put(buf, t0, t1, track, off=0.0, fin=0.05, fout=0.3, gain=-13):
    a, b = int(t0 * SR), min(n, int(t1 * SR)); tr = load(f"{H}/sfx/{track}.mp3")[int(off * SR):]
    while len(tr) < b - a: tr = np.concatenate([tr, tr])
    seg = tr[: b - a].copy(); seg *= db(vr + gain - rms(seg))
    fi, fo = max(1, int(fin * SR)), max(1, int(fout * SR)); seg[:fi] *= np.linspace(0, 1, fi)[:, None]; seg[-fo:] *= np.linspace(1, 0, fo)[:, None]
    buf[a:b] += seg
put(music, 0, TOTAL, "m_town", 0, 0.05, 2.5)                            # the user's own track under the whole ad
music *= db(-9 * env)[:, None]; mix += music
def fx(t, name, g, mx=None, sp=1.0, fade=0.25):
    s = load(f"{H}/sfx/{name}.wav", sp)
    if mx: s = s[: int(mx * SR)]
    fl = min(int(fade * SR), len(s) // 3); s[-fl:] *= np.linspace(1, 0, fl)[:, None]
    s = s * db(vr + g - 6 + 12 - 20 * np.log10(np.abs(s).max() + 1e-9))
    a = int(t * SR); b = min(n, a + len(s)); mix[a:b] += s[: b - a]
for c in (2, 4, 11, 18, 32):
    s0, s1 = CUES[c - 1]["start"], CUES[c - 1]["end"]
    for k in range(3): fx(s0 + (s1 - s0) * (0.15 + k * 0.85 / 3), "slam", -24, 0.25, 1.6, 0.08)   # a "tap" on every hus
fx(at(1, -0.3), "whoosh", -16); fx(at(5, 0.2), "crowd", -26, 2.0)
fx(at(6), "thunder", -12, 3.5, 0.5, 1.0); fx(at(6, 0.5), "heart", -18, 2.5); fx(at(7, 1.0), "whoosh", -12, None, 0.7)
fx(at(10), "crickets", -30, 4.0); fx(at(13), "creak", -24, 1.5); fx(at(15), "heart", -14, 2.5); fx(at(17, -0.2), "whoosh", -16)
fx(at(19), "bell", -18, 2.0, 1.5); fx(at(20, 0.3), "creak", -12, 3.0, 0.85); fx(at(24), "whoosh", -14)
fx(at(25), "thunder", -10, 4.0, 0.45, 1.0); fx(at(26, 0.3), "slam", -20, 0.5, 0.6); fx(at(27, 2.0), "slam", -22, 0.3, 2.2); fx(at(27, 2.4), "slam", -22, 0.3, 2.2)
fx(at(29), "heart", -12, 4.0, 1.2); fx(at(32), "heart", -14, 3.0, 1.3); fx(at(33, 0.6), "thunder", -14, 2.5, 0.5, 1.2)
pk = np.abs(mix).max(); mix *= db(-1.0) / pk if pk > db(-1.0) else 1.0
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "libmp3lame", "-b:a", "256k", f"{H}/mix.mp3"], input=mix.astype(np.float32).tobytes(), check=True)
print("mix", f"{n / SR:.1f}s")
