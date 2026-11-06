"""Kievan Rus' sound kit + score for the Olga short (gusli, low male drone, frame drums) (all synthesized, deterministic).
usage: python make_sounds.py OUTDIR DURATION_SECONDS"""
import os, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; OUT = sys.argv[1]; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 62
os.makedirs(OUT, exist_ok=True); rng = np.random.default_rng(2024)
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

def hit(d=2.5):
    t = T(d); x = np.sin(2 * np.pi * (70 * np.exp(-t * 6) + 34) * t) * np.exp(-t * 3) + 0.8 * bp(rng.standard_normal(len(t)), 200, 4000) * np.exp(-t * 30)
    return verb(x, 2.2, 0.35)
def wings(d=3.0, n=14):
    t = T(d); x = np.zeros_like(t)
    for b in range(n):
        rate = rng.uniform(7, 11); ph = rng.random(); lo = rng.uniform(500, 1400); src_ = bp(rng.standard_normal(len(t)), lo, lo * 3)
        flap = np.maximum(0, np.sin(2 * np.pi * (rate * t + ph))) ** 6; start = rng.uniform(0, 0.6)
        x += src_ * flap * (t > start) * rng.uniform(0.4, 1)
    return x * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.8)
def sizzle(d=2.5):
    t = T(d); x = hp(rng.standard_normal(len(t)), 3000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3.3 * t))) * 0.5
    for k in range(int(d * 30)):
        i = int(rng.random() * (d - 0.01) * SR); n = int(0.003 * SR); x[i:i + n] += hp(rng.standard_normal(n), 4000) * rng.uniform(0.5, 1.5)
    return x * np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.6)
def voice(f0, vowel, t, glide=0.0):
    F = {'a': [(750, 110), (1200, 130), (2600, 250)], 'o': [(450, 90), (800, 110), (2500, 250)], 'e': [(500, 90), (1800, 150), (2600, 250)]}[vowel]
    f = f0 * (1 + glide * t / max(t[-1], 1e-3)) * (1 + 0.01 * np.sin(2 * np.pi * 5.5 * t)); ph = 2 * np.pi * np.cumsum(f) / SR; y = np.zeros_like(t)
    for h in range(1, 30):
        fh = f0 * h; w = sum(np.exp(-((fh - Fc) / B) ** 2) for Fc, B in F) + 0.05 / h; y += w * np.sin(h * ph) / h ** 0.6
    return y
def laugh(d=2.4):
    t = T(d); x = np.zeros_like(t)
    for v in range(4):
        f0 = rng.uniform(110, 210); st_ = rng.uniform(0, 0.4)
        for k in range(int((d - st_ - 0.3) * 5.5)):
            a = int((st_ + k / 5.5) * SR); n = int(0.13 * SR); tt = np.arange(n) / SR
            if a + n < len(x): x[a:a + n] += voice(f0 * (1 - k * 0.02), 'a', tt) * np.sin(np.pi * tt / tt[-1]) * 0.25 + bp(rng.standard_normal(n), 1000, 3000) * np.exp(-tt * 40) * 0.1
    return verb(x, 1.4, 0.25)
def screams(d=4.0):
    t = T(d); x = np.zeros_like(t)
    for v in range(8):
        f0 = rng.uniform(280, 520); st_ = rng.uniform(0, 1.5); L = rng.uniform(0.8, 1.8); m = (t > st_) & (t < st_ + L); tt = t[m] - st_
        if len(tt): x[m] += voice(f0, rng.choice(['a', 'e']), tt, glide=rng.uniform(-0.25, 0.15)) * np.sin(np.pi * tt / L) * 0.18
    return verb(lp(x, 3500), 3.0, 0.55)
def horn(d=3.5):
    t = T(d); f = np.where(t < 0.9, 110, 146.8) * (1 + 0.006 * np.sin(2 * np.pi * 4.8 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h for h in range(1, 14)); x = lp(x, 1600) * np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.7)
    return verb(x, 3.5, 0.5)
def wind(d=6.0):
    t = T(d); x = lp(rng.standard_normal(len(t)), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * t) ** 2) + 0.3 * bp(rng.standard_normal(len(t)), 900, 1300) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t + 1))
    return x * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1.5)
def oars(d=5.0):
    t = T(d); x = np.zeros_like(t)
    for k in range(int(d / 1.15)):
        a = int((0.2 + k * 1.15) * SR); n = int(0.6 * SR); tt = np.arange(n) / SR
        if a + n < len(x): x[a:a + n] += bp(rng.standard_normal(n), 600, 3200) * np.exp(-tt * 7) + 0.5 * lp(rng.standard_normal(n), 300) * np.exp(-tt * 4)
    return verb(x, 1.5, 0.3)
def dig(d=1.0):
    t = T(d); x = bp(rng.standard_normal(len(t)), 300, 2200) * np.exp(-t * 9) + 0.6 * np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18)
    return x
def thud(d=1.6):
    t = T(d); return verb(np.sin(2 * np.pi * (55 * np.exp(-t * 4) + 40) * t) * np.exp(-t * 7) + 0.4 * lp(rng.standard_normal(len(t)), 400) * np.exp(-t * 20), 1.2, 0.3)
def steam(d=3.0):
    t = T(d); return hp(rng.standard_normal(len(t)), 2200) * np.sin(np.pi * t / d) ** 1.5 * 0.6
def cups(d=1.5):
    t = T(d); x = np.zeros_like(t)
    for k in range(4):
        a = int((0.05 + k * 0.28 + rng.random() * 0.08) * SR); n = int(0.6 * SR); tt = np.arange(n) / SR
        if a + n < len(x): x[a:a + n] += sum(np.sin(2 * np.pi * f * tt) for f in rng.uniform(1500, 4200, 3)) * np.exp(-tt * 14) * 0.4
    return verb(x, 1.0, 0.3)
def tick(d=2.4):
    t = T(d); x = np.zeros_like(t)
    for k in range(int(d * 9)):
        a = int(k / 9 * SR); n = int(0.03 * SR)
        x[a:a + n] += bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / SR * 120) * (0.4 + 0.6 * k / (d * 9))
    return x
def choirhit(d=4.0):
    t = T(d); y = sum(voice(f, 'o', t) for f in [110, 164.8, 220, 261.6]) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 1.2)
    return verb(y, 3.5, 0.5)
def coo(d=1.6):
    t = T(d); x = np.zeros_like(t)
    for a0, L in [(0.0, 0.35), (0.45, 0.6)]:
        m = (t >= a0) & (t < a0 + L); tt = t[m] - a0; f = 480 + 80 * np.sin(np.pi * tt / L); x[m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / L) * (1 + 0.5 * np.sin(2 * np.pi * 30 * tt))
    return verb(lp(x, 1500), 0.8, 0.2)
def chirp(d=1.2):
    t = T(d); x = np.zeros_like(t)
    for k in range(6):
        a = int((0.05 + k * 0.17) * SR); n = int(0.07 * SR); tt = np.arange(n) / SR; f = 3500 + 2500 * tt / tt[-1]
        x[a:a + n] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1])
    return x * 0.6
def pop(d=0.4):
    t = T(d); return np.sin(2 * np.pi * (700 * np.exp(-t * 18) + 180) * t) * np.exp(-t * 22)

def tone(f, d, a=1.0, dec=8.0, harm=(1,)):
    t = T(d); return sum(np.sin(2 * np.pi * f * h * t) / (k + 1) for k, h in enumerate(harm)) * np.exp(-t * dec) * a
def kaching(d=1.6):
    t = T(d); x = np.zeros_like(t); n = int(0.08 * SR); x[:n] += bp(rng.standard_normal(n), 1500, 5000) * np.exp(-np.arange(n) / SR * 50)
    for k, f in enumerate([2093, 2637, 3136]): a = int((0.08 + k * 0.03) * SR); y = tone(f, d - 0.2, 0.5, 3.5, (1, 2.76, 5.4)); x[a:a + len(y)] += y[:len(x) - a]
    return verb(x, 1.2, 0.25)
def riser(d=4.0):
    t = T(d); f = 200 * (6 ** (t / d)); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + hp(rng.standard_normal(len(t)), 2000) * (t / d) ** 2 * 0.5
    return x * (t / d) ** 1.5
def stamp(d=1.2):
    t = T(d); return verb(np.sin(2 * np.pi * (90 * np.exp(-t * 10) + 50) * t) * np.exp(-t * 9) + 0.6 * bp(rng.standard_normal(len(t)), 500, 3000) * np.exp(-t * 40), 0.8, 0.2)
def typing(d=2.0):
    t = T(d); x = np.zeros_like(t)
    for k in range(int(d * 11)):
        a = int((k / 11 + rng.random() * 0.03) * SR); n = int(0.025 * SR)
        if a + n < len(x): x[a:a + n] += bp(rng.standard_normal(n), 1800, 6000) * np.exp(-np.arange(n) / SR * 200) * rng.uniform(0.5, 1)
    return x
def notify(d=1.0): t = T(d); return tone(1318, d, 0.6, 6) + np.concatenate([np.zeros(int(0.12 * SR)), tone(1760, d - 0.12, 0.6, 6)])
def sadhorn(d=2.4):
    t = T(d); x = np.zeros_like(t)
    for k, f in enumerate([392, 370, 349, 330]):
        a = int(k * 0.42 * SR); L = 0.42 if k < 3 else 1.0; n = int(L * SR); tt = np.arange(n) / SR; vib = 1 + 0.02 * np.sin(2 * np.pi * 6 * tt) * (k == 3)
        y = sum(np.sin(2 * np.pi * f * h * vib * tt) / h for h in range(1, 8)); y = lp(y, 1800) * np.minimum(1, tt / 0.03) * np.minimum(1, (L - tt) / 0.08)
        if a + n <= len(x): x[a:a + n] += y * 0.4
    return verb(x, 1.0, 0.2)
def jingle(d=2.0):
    t = T(d); x = np.zeros_like(t)
    for k, f in enumerate([523, 659, 784, 1047]):
        a = int(k * 0.14 * SR); y = tone(f, d - 0.6, 0.5, 4, (1, 2, 3))
        x[a:a + len(y)] += y[:len(x) - a]
    return verb(x, 1.0, 0.25)
def carpass(d=3.0):
    t = T(d); env = np.exp(-((t - d / 2) / (d / 5)) ** 2); return lp(rng.standard_normal(len(t)), 300 + 500 * env.max()) * env * 2 + 0.3 * np.sin(2 * np.pi * (90 + 20 * np.tanh((t - d / 2) * 3)) * t) * env
def steps(d=3.0):
    t = T(d); x = np.zeros_like(t)
    for k in range(int(d * 2.2)):
        a = int(k / 2.2 * SR); n = int(0.06 * SR); x[a:a + n] += lp(rng.standard_normal(n), 900) * np.exp(-np.arange(n) / SR * 60)
    return x
def question(d=0.8): t = T(d); f = 500 + 500 * (t / d) ** 2; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2) * 0.6
def dumpster(d=1.8): t = T(d); return verb(sum(np.sin(2 * np.pi * f * t) for f in [180, 410, 870]) * np.exp(-t * 6) * 0.4 + lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 18), 1.4, 0.3)
def bagdrop(d=1.0): t = T(d); return bp(rng.standard_normal(len(t)), 300, 3500) * np.exp(-t * 7) * (1 + np.sin(2 * np.pi * 30 * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14)
def laughsmall(d=1.4): return laugh(d) * 0.6
def drag(d=4.0):
    t = T(d); return bp(rng.standard_normal(len(t)), 250, 2400) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.1 * t))) * 0.7 * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)
def crickets(d=6.0):
    t = T(d); x = np.zeros_like(t)
    for c in range(3):
        f = rng.uniform(4200, 5200); gate = (np.sin(2 * np.pi * rng.uniform(2.2, 3.2) * t + c) > 0.6) * (np.sin(2 * np.pi * 60 * t) > 0)
        x += np.sin(2 * np.pi * f * t) * gate * 0.15
    return x * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1)
def error(d=0.6): t = T(d); return (np.sign(np.sin(2 * np.pi * 180 * t)) * 0.3 * (t < 0.18) + np.sign(np.sin(2 * np.pi * 140 * t)) * 0.3 * ((t > 0.22) & (t < 0.45)))
def success(d=2.4):
    t = T(d); x = np.zeros_like(t)
    for k, f in enumerate([784, 988, 1175, 1568]):
        a = int(k * 0.09 * SR); y = tone(f, d - 0.4, 0.45, 2.5, (1, 2, 3)); x[a:a + len(y)] += y[:len(x) - a]
    return verb(x, 1.6, 0.35)
def glitch(d=1.0):
    t = T(d); x = np.zeros_like(t)
    for k in range(14):
        a = int(rng.random() * (d - 0.06) * SR); n = int(rng.uniform(0.01, 0.06) * SR); x[a:a + n] += np.sign(np.sin(2 * np.pi * rng.uniform(200, 3000) * np.arange(n) / SR)) * 0.4
    return x
def truck(d=3.0): t = T(d); return lp(rng.standard_normal(len(t)), 220) * 2 * np.sin(np.pi * t / d) + 0.3 * np.sign(np.sin(2 * np.pi * 38 * t)) * np.sin(np.pi * t / d) * 0.3
def coins(d=1.6):
    t = T(d); x = np.zeros_like(t)
    for k in range(18):
        a = int(rng.random() * (d - 0.3) * SR); y = tone(rng.uniform(2500, 5500), 0.3, rng.uniform(0.2, 0.5), 18, (1, 2.4)); x[a:a + len(y)] += y
    return x
def plane(d=5.0): t = T(d); return (lp(rng.standard_normal(len(t)), 900) * 1.4 + 0.2 * hp(rng.standard_normal(len(t)), 3000)) * np.sin(np.pi * t / d) ** 1.5
def chime(d=3.0):
    t = T(d); x = np.zeros_like(t)
    for k, f in enumerate([1047, 1319, 1568, 2093, 1568]):
        a = int(k * 0.22 * SR); y = tone(f, d - 1.2, 0.4, 2.2, (1, 3.9)); x[a:a + len(y)] += y[:len(x) - a]
    return verb(x, 2.4, 0.45)
for name, fn in [('hit', hit), ('kaching', kaching), ('riser', riser), ('stamp', stamp), ('typing', typing), ('notify', notify), ('sadhorn', sadhorn), ('crowd', crowd), ('jingle', jingle), ('carpass', carpass), ('steps', steps), ('question', question), ('dumpster', dumpster), ('bagdrop', bagdrop), ('laughsmall', laughsmall), ('drag', drag), ('crickets', crickets), ('tick', tick), ('error', error), ('success', success), ('glitch', glitch), ('pop', pop), ('truck', truck), ('door', door), ('coins', coins), ('plane', plane), ('chime', chime), ('wind', wind)]: save(name, fn())

# ---------- score: heist lo-fi groove (kick/snare/hats, bass, e-piano chords), C minor, 96 bpm ----------
t = T(DUR); mus = np.zeros_like(t); bpm = 96; beat = 60 / bpm
def kick(): tt = T(0.4); return np.sin(2 * np.pi * (120 * np.exp(-tt * 30) + 45) * tt) * np.exp(-tt * 9)
def snare(): tt = T(0.25); return (bp(rng.standard_normal(len(tt)), 1200, 6000) * 0.7 + np.sin(2 * np.pi * 190 * tt) * 0.4) * np.exp(-tt * 18)
def hat(): tt = T(0.06); return hp(rng.standard_normal(len(tt)), 7000) * np.exp(-tt * 70) * 0.35
def ep(freqs, d):  # e-piano chord
    tt = T(d); y = sum(np.sin(2 * np.pi * f * tt) * (1 + 0.3 * np.sin(2 * np.pi * 5 * tt)) + 0.25 * np.sin(2 * np.pi * f * 2 * tt) * np.exp(-tt * 4) for f in freqs); return y * np.exp(-tt * 1.2) * 0.22
K, Sn, H = kick(), snare(), hat()
prog = [[261.6, 311.1, 392, 466.2], [207.7, 261.6, 311.1, 392], [233.1, 293.7, 349.2, 415.3], [196, 246.9, 293.7, 349.2]]; bass = [65.4, 51.9, 58.3, 49.0]
def put(y, at, g=1.0):
    i = int(at * SR)
    if i < len(mus): n = min(len(y), len(mus) - i); mus[i:i + n] += y[:n] * g
bars = int(DUR / (4 * beat)) + 1
for b in range(bars):
    t0 = b * 4 * beat; ch = prog[b % 4]; sec = 0 if t0 < 7 else 1 if t0 < 40 else 2 if t0 < 54 else 3
    put(ep(ch, 4 * beat), t0, 0.9 if sec != 2 else 0.6)
    bl = T(4 * beat); put(np.sin(2 * np.pi * bass[b % 4] * bl) * np.exp(-bl * 0.6) * 0.5 + 0.15 * np.sin(2 * np.pi * bass[b % 4] * 2 * bl) * np.exp(-bl), t0)
    if sec >= 1:
        for k in range(4): put(K, t0 + k * beat, 0.9 if k in (0, 2) else 0.0); put(Sn, t0 + k * beat, 0.7 if k in (1, 3) else 0.0)
        for k in range(8): put(H, t0 + k * beat / 2, 1.0 if sec != 2 else 1.4)
    if sec == 0:
        for k in range(4): put(K, t0 + k * beat, 0.5)
mus = verb(lp(mus, 6000), 1.4, 0.18)[:len(t)]
mus *= np.minimum(1, t / 1.0) * np.minimum(1, (DUR - t) / 2.5)
save('score', mus, 0.8)
print('ok', len(os.listdir(OUT)))
