"""Kievan Rus' sound kit + score for the Olga short (gusli, low male drone, frame drums) (all synthesized, deterministic).
usage: python make_sounds.py OUTDIR DURATION_SECONDS"""
import os, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; OUT = sys.argv[1]; DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 62
os.makedirs(OUT, exist_ok=True); rng = np.random.default_rng(945)
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
for name, fn in [('bell', lambda: bell(146.8, 7)), ('drum', lambda: drum(1.6, 70)), ('sword', sword), ('fire', lambda: fire(7.0)), ('door', door), ('crowd', crowd), ('whoosh', whoosh), ('boom', boom),
                 ('hit', hit), ('wings', wings), ('sizzle', sizzle), ('laugh', laugh), ('screams', screams), ('horn', horn), ('wind', wind), ('oars', oars), ('dig', dig), ('thud', thud), ('steam', steam), ('cups', cups), ('tick', tick), ('choir', choirhit), ('coo', coo), ('chirp', chirp), ('pop', pop)]: save(name, fn())

# ---------- score: low male drone + gusli ostinato + frame drums (A minor / phrygian) ----------
t = T(DUR); mus = np.zeros_like(t)
def ks(f, d=1.6):   # Karplus-Strong plucked string (gusli)
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)): out[i] = buf[i % n]; buf[i % n] = 0.996 * 0.5 * (buf[i % n] + buf[(i + 1) % n])
    return out
notes = {'A2': 110, 'C3': 130.8, 'D3': 146.8, 'E3': 164.8, 'F3': 174.6, 'G3': 196, 'A3': 220, 'Bb3': 233.1, 'C4': 261.6, 'D4': 293.7, 'E4': 329.6}
cache = {k: ks(v) for k, v in notes.items()}
motif = ['A3', 'C4', 'E4', 'D4', 'C4', 'Bb3', 'A3', 'E3']
step = 60 / 92 / 2
for k in range(int(DUR / step)):
    tk = k * step; i = int(tk * SR); nm = motif[k % 8] if (k // 16) % 2 == 0 else ['F3', 'A3', 'C4', 'Bb3', 'A3', 'G3', 'F3', 'E3'][k % 8]
    s = cache[nm]; g = 0.5 if k % 2 == 0 else 0.32
    if i + len(s) < len(mus): mus[i:i + len(s)] += s * g
drone = sum(voice(f, 'o', t) for f in [55, 82.4, 110]) * 0.35 * (0.8 + 0.2 * np.sin(2 * np.pi * 0.05 * t))
mus += lp(drone, 2000)
d = drum(1.2, 62); beat = 60 / 92
intens = np.clip((t - 6) / 10, 0.2, 1) * np.clip((DUR - 4 - t) / 3, 0.2, 1)
for k in range(int(DUR / beat)):
    tk = k * beat; i = int(tk * SR); g = intens[i] * (1.0 if k % 4 == 0 else 0.45 if k % 2 == 0 else 0.25)
    if i + len(d) < len(mus): mus[i:i + len(d)] += d * g * 0.8
mus = verb(mus, 2.6, 0.28)[:len(t)]
mus *= np.minimum(1, t / 1.5) * np.minimum(1, (DUR - t) / 2.5)
save('score', mus, 0.8)
print('ok', sorted(os.listdir(OUT)))
