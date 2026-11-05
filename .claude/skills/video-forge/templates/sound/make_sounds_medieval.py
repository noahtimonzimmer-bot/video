"""Custom medieval sound kit + score for the Friday-the-13th short (all synthesized, deterministic).
usage: python make_sounds.py OUTDIR DURATION_SECONDS"""
import os, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; OUT = sys.argv[1]; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 62
os.makedirs(OUT, exist_ok=True); rng = np.random.default_rng(13)
T = lambda d: np.arange(int(d * SR)) / SR
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def verb(x, size=2.4, wet=0.35):
    n = int(size * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * size / 6)); ir = lp(ir, 6000)
    y = fftconvolve(x, ir); y = np.concatenate([y, np.zeros(len(x) + n - len(y))])[:len(x) + n]; y /= np.abs(y).max() + 1e-9; dry = np.concatenate([x, np.zeros(n)]) / (np.abs(x).max() + 1e-9)
    return dry * (1 - wet) + y * wet
def save(name, x, gain=0.9):
    x = x / (np.abs(x).max() + 1e-9) * gain; sf.write(os.path.join(OUT, name + '.wav'), np.stack([x, x], 1).astype(np.float32), SR)
def bell(f0=220, d=6.0):
    t = T(d); x = np.zeros_like(t)
    for r, a, dec in [(0.5, 1.0, 2.2), (1.0, 0.8, 1.6), (1.19, 0.6, 1.2), (1.5, 0.5, 1.0), (2.0, 0.45, 0.8), (2.51, 0.3, 0.6), (3.01, 0.2, 0.45), (4.07, 0.12, 0.3)]:
        x += a * np.sin(2 * np.pi * f0 * r * t + rng.random() * 6) * np.exp(-t / (dec * d / 3))
    x += 0.3 * hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 60)
    return verb(x, 3.0, 0.4)
def drum(d=1.6, f0=95):
    t = T(d); f = f0 * np.exp(-t * 3) + 38; ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 3.2) + 0.5 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 18)
    return verb(x, 1.8, 0.3)
def clop():
    t = T(0.12); return bp(rng.standard_normal(len(t)), 300, 2500) * np.exp(-t * 55) + 0.6 * np.sin(2 * np.pi * 140 * t) * np.exp(-t * 40)
def gallop(d=4.0):
    x = np.zeros(int(d * SR)); c = clop(); beat = 0.42
    for k in range(int(d / beat)):
        for off, a in [(0, 1.0), (0.09, 0.8), (0.17, 0.9)]:
            i = int((k * beat + off + rng.random() * 0.01) * SR)
            if i + len(c) < len(x): x[i:i + len(c)] += c * a * (0.8 + 0.4 * rng.random())
    return verb(x, 0.8, 0.15)
def seal(d=0.7):
    t = T(d); x = np.zeros_like(t)
    for k in range(9):
        i = int((0.02 + k * 0.025 + rng.random() * 0.02) * SR); n = int(0.006 * SR); x[i:i + n] += hp(rng.standard_normal(n), 3000) * (1 - k / 10)
    x += 0.5 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 30)
    return verb(x, 0.6, 0.2)
def sword(d=1.4):
    t = T(d); env = np.minimum(1, t / 0.35) * np.exp(-np.maximum(0, t - 0.35) * 6)
    sweep = np.zeros_like(t)
    for lo in [2500, 3400, 5200]: sweep += bp(rng.standard_normal(len(t)), lo, lo * 1.2)
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - 0.35) * 3) for f in [2240, 3310, 4870]) * (t > 0.35)
    return verb(sweep * env * 0.6 + ring * 0.25, 1.4, 0.3)
def chains(d=1.8):
    t = T(d); x = np.zeros_like(t)
    for k in range(26):
        i = int(rng.random() * (d - 0.15) * SR); n = int(0.15 * SR); tt = np.arange(n) / SR
        x[i:i + n] += sum(np.sin(2 * np.pi * f * tt) for f in rng.uniform(1800, 6500, 3)) * np.exp(-tt * 45) * rng.uniform(0.3, 1)
    return verb(x, 1.2, 0.35)
def fire(d=6.0):
    t = T(d); x = lp(rng.standard_normal(len(t)), 500) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)) * 3
    for k in range(int(d * 14)):
        i = int(rng.random() * (d - 0.02) * SR); n = int(0.004 * SR); x[i:i + n] += hp(rng.standard_normal(n), 2500) * rng.uniform(0.5, 2)
    return x
def door(d=3.0):
    t = T(d); x = np.sin(2 * np.pi * (60 * np.exp(-t * 2) + 35) * t) * np.exp(-t * 6) + 0.7 * lp(rng.standard_normal(len(t)), 700) * np.exp(-t * 25)
    return verb(x, 2.6, 0.5)
def crowd(d=6.0):
    t = T(d); x = np.zeros_like(t)
    for k in range(10): x += bp(rng.standard_normal(len(t)), 250 + k * 40, 900 + k * 60) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.2, 1.4) * t + k))
    return x
def whoosh(d=1.2):
    t = T(d); env = np.sin(np.pi * np.minimum(1, t / d)) ** 2; x = np.zeros_like(t); n = rng.standard_normal(len(t))
    for i, f in enumerate(np.linspace(300, 2400, 8)): x += bp(n, f, f * 1.4) * np.exp(-((t / d - i / 8) ** 2) * 30)
    return x * env
def quill(d=1.5):
    t = T(d); x = hp(rng.standard_normal(len(t)), 3500) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * t))) * 0.5
    return x * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2)
def boom(d=4.0):
    t = T(d); x = np.sin(2 * np.pi * (45 * np.exp(-t) + 28) * t) * np.exp(-t * 1.4) + 0.4 * lp(rng.standard_normal(len(t)), 200) * np.exp(-t * 2)
    return verb(x, 3.5, 0.45)
for name, fn in [('bell', lambda: bell(196)), ('bell_hi', lambda: bell(294, 4)), ('drum', drum), ('gallop', gallop), ('seal', seal), ('sword', sword), ('chains', chains), ('fire', fire), ('door', door), ('crowd', crowd), ('whoosh2', whoosh), ('quill', quill), ('boom', boom)]: save(name, fn())

# ---------- score: monk-choir drone + organ + war drums (D minor) ----------
t = T(DUR); mus = np.zeros_like(t)
def choir(freqs, t, amp):
    y = np.zeros_like(t)
    for f in freqs:
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.1 * t + f)
        for h in range(1, 16):
            fh = f * h; w = sum(np.exp(-((fh - F) / B) ** 2) for F, B in [(650, 140), (1080, 160), (2650, 300)]) + 0.15 / h
            y += w * np.sin(2 * np.pi * fh * vib * t + h) / h ** 0.5
    return y * amp
chords = [[73.4, 146.8, 174.6, 220], [58.3, 116.5, 174.6, 233.1], [65.4, 130.8, 164.8, 196], [73.4, 146.8, 174.6, 220]]
seg = DUR / 8
for k in range(8):
    a, b = int(k * seg * SR), int(min(DUR, (k + 1) * seg + 1.5) * SR); tt = t[a:b] - t[a]; ch = chords[k % 4]
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (tt[-1] - tt) / 1.4 + 1e-3)
    mus[a:b] += (choir(ch[1:], tt, 0.5) + 0.6 * sum(np.sin(2 * np.pi * ch[0] * h * tt) / h for h in range(1, 6))) * env
mus = lp(mus, 3500)
intens = np.clip((t - 8) / 6, 0, 1) * np.clip((DUR - 6 - t) / 3, 0.25, 1)
d = drum(1.4, 80); beat = 60 / 72
for k in range(int(DUR / beat)):
    tk = k * beat
    if tk < 9 or tk > DUR - 5: continue
    i = int(tk * SR); g = intens[i] * (1.0 if k % 2 == 0 else 0.55)
    if i + len(d) < len(mus): mus[i:i + len(d)] += d * g * 0.9
mus = verb(mus, 3.0, 0.3)[:len(t)]
mus *= np.minimum(1, t / 2) * np.minimum(1, (DUR - t) / 2.5)
save('score', mus, 0.8)
print('ok', sorted(os.listdir(OUT)))
