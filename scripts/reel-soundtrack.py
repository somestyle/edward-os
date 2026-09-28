"""Synthesises the 15 s reel soundtrack, cue for cue with public/reel/index.html.

120 BPM, so every scene cut lands on a beat. Writes public/reel/assets/soundtrack.wav; encode it to soundtrack.mp3 before rendering.
"""
import numpy as np, wave, os

SR = 48000
DUR = 15.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'reel', 'assets')


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def tone(f, dur, a=0.002, d=0.2, kind='sine'):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f, n)) / SR if np.ndim(f) else 2 * np.pi * f * t
    if kind == 'sine': s = np.sin(ph)
    elif kind == 'tri': s = 2 / np.pi * np.arcsin(np.sin(ph))
    elif kind == 'saw': s = 2 * ((ph / (2 * np.pi)) % 1) - 1
    return s * env(n, a, d)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def onepole_lp(x, fc):  # vectorised-ish via scipy-free IIR, fine for short buffers
    return lowpass(x, fc)


def kick(dur=0.45, f0=150, f1=42, gain=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = rng.standard_normal(n) * np.exp(-t * 400) * 0.25
    return np.tanh((s + click) * 1.6) * gain


def noise(dur, d=0.05, a=0.001):
    n = int(dur * SR)
    return rng.standard_normal(n) * env(n, a, d)


def hat(dur=0.06):
    x = noise(dur, 0.018)
    return x - np.concatenate([[0], x[:-1]])  # crude highpass


def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    e = sum(np.exp(-np.maximum(t - o, 0) * 60) * (t >= o) for o in (0, 0.011, 0.022)) + np.exp(-t * 14) * 0.5
    x = x * e
    return (x - np.concatenate([[0], x[:-1]])) * 0.6


def whoosh(dur, rev=False):
    n = int(dur * SR); t = np.linspace(0, 1, n)
    x = rng.standard_normal(n)
    cut = 300 + 6000 * (t ** 2)
    y = np.zeros(n); acc = 0.0
    for i in range(n):
        a = np.exp(-2 * np.pi * cut[i] / SR); acc = (1 - a) * x[i] + a * acc; y[i] = acc
    shape = (t ** 2.2) * (1 - np.exp(-(1 - t) * 40))
    y = y * shape
    return (y[::-1] if rev else y) * 3.0


def pluck(f, dur=0.35, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(4 * np.pi * f * t) * np.exp(-t * 20) + 0.15 * bright * np.sin(6 * np.pi * f * t) * np.exp(-t * 35))
    return s * env(n, 0.001, 0.12)


def bell(f, dur=1.8):
    n = int(dur * SR); t = np.arange(n) / SR
    parts = [(1, 1, 1.2), (2.76, 0.4, 0.7), (5.4, 0.2, 0.35), (8.93, 0.1, 0.2)]
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / d) for m, a, d in parts) * np.minimum(1, t / 0.002)


def click(f=3200):
    return tone(f, 0.03, 0.0005, 0.006) + noise(0.03, 0.004) * 0.3


def thock():
    x = tone(180, 0.12, 0.0008, 0.03) * 0.8
    x[:int(0.08 * SR)] += lowpass(noise(0.08, 0.02), 1800) * 1.2
    return x


midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- music bed ----------------
BPM = 120; BEAT = 60 / BPM
CHORDS = [(57, [69, 72, 76]), (53, [65, 69, 72]), (48, [67, 72, 76]), (55, [67, 71, 74])]  # Am F C G

# pad from 0 (quiet) to end
for bar in range(8):
    t0 = bar * 2.0 - 0.5
    root, notes = CHORDS[bar % 4]
    for m in notes:
        n = int(2.3 * SR); t = np.arange(n) / SR
        f = midi(m - 12)
        s = sum(tone(f * d, 2.3, 0.4, 5.0, 'saw') for d in (0.997, 1.003)) * 0.5
        s = lowpass(s, 900) * np.minimum(1, t / 0.5) * np.minimum(1, (2.3 - t) / 0.5)
        add(s, max(0, t0), 0.05 if bar > 0 else 0.03, pan=(m % 3 - 1) * 0.4)

# drums + bass from the drop (1.5) to the end card (13.5)
t = 1.5
while t < 13.49:
    add(kick(), t, 0.9)
    k = int(round((t - 1.5) / BEAT))
    if k % 2 == 1: add(clap(), t, 0.45, 0.1)
    add(hat(), t + BEAT / 2, 0.22, 0.35)
    add(hat(0.03), t + BEAT / 4, 0.08, -0.35)
    add(hat(0.03), t + 3 * BEAT / 4, 0.08, -0.35)
    bar = int((t - 1.5) // 2)
    root = CHORDS[bar % 4][0] - 24
    b = tone(midi(root), 0.42, 0.005, 0.25, 'saw')
    b = lowpass(b, 260) * 2.2
    add(b, t + 0.02, 0.5)
    t += BEAT

# arp in the Adopt / SamaCare / Caret section
for i in range(int((9.5 - 3.5) / (BEAT / 2))):
    tt = 3.5 + i * BEAT / 2
    bar = int((tt - 1.5) // 2)
    notes = CHORDS[bar % 4][1]
    m = notes[i % 3] + (12 if i % 6 >= 3 else 0)
    add(pluck(midi(m), 0.3, 0.8), tt + BEAT / 4, 0.09, pan=0.5 * ((i % 2) * 2 - 1))

# ---------------- cues ----------------
add(tone(np.linspace(1400, 520, int(0.25 * SR)), 0.25, 0.002, 0.08), 0.05, 0.25)          # dot spawns
add(whoosh(0.5), 0.32, 0.05)                                                                # stretch into pill
for i in range(33): add(click(2600 + (i * 37) % 900), 0.72 + i * (0.4 / 33), 0.07, ((i % 5) - 2) * 0.15)  # typing
add(thock(), 1.25, 0.5); add(click(4200), 1.25, 0.2)                                        # send
add(whoosh(0.9), 0.62, 0.22)                                                                # riser to drop
for tp in (1.55, 1.95, 2.3): add(pluck(midi(84), 0.2), tp, 0.07, 0.3)                     # phase ticks
for i in range(40): add(click(5200), 2.55 + i * (0.67 / 40), 0.025, ((i % 3) - 1) * 0.5)   # steady drain
for tc in (3.5, 5.5, 7.5, 9.5, 11.5): add(whoosh(0.42), tc - 0.42, 0.28)                   # every cut
add(lowpass(noise(0.4, 0.15), 1200), 3.5, 0.4)
for i in range(4): add(pluck(midi(72 + [0, 4, 7, 12][i]), 0.4), 3.95 + i * 0.16, 0.16, -0.3 + i * 0.2)  # nodes pop
for i in range(4): add(click(3800), 4.55 + i * 0.13, 0.14, 0.3)                           # checks
for i in range(6): add(click(2400 + i * 300), 4.6 + i * 0.08, 0.06)                       # 7x counter
for i in range(4): add(pluck(midi(76 + [0, 3, 7, 10][i]), 0.35, 1.2), 6.25 + i * 0.16, 0.15, 0.4)  # fields fill
add(bell(midi(88), 1.0), 7.0, 0.08)                                                         # submitted
add(thock(), 7.72, 0.6, -0.2); add(thock(), 7.82, 0.6, 0.2)                                # ⌘ K
for i in range(10): add(click(3000 + (i * 53) % 700), 8.02 + i * 0.032, 0.08)              # typing
add(thock(), 8.5, 0.4); add(whoosh(0.3, rev=True), 8.55, 0.18, 0.6)                        # enter + peek
for k in range(8): add(pluck(midi([72, 74, 76, 79, 81, 84, 86, 88][k]), 0.3, 1.0), 9.72 + k * 0.205, 0.13, -0.5 + k / 7)  # tour
add(whoosh(0.5), 11.0, 0.35)                                                                # push-in
for i, tc in enumerate((11.5, 12.0, 12.5, 13.0)):                                           # principle hits
    add(kick(0.6, 180, 38), tc, 0.8)
    add(lowpass(noise(0.5, 0.18), 3000), tc, 0.25)
    root, notes = CHORDS[i]
    for m in notes: add(tone(midi(m), 0.5, 0.003, 0.18, 'tri'), tc, 0.07)
for i in range(8): add(tone(midi(79 + [0, 2, 4, 7, 9, 7, 4, 2][i]), 0.08, 0.001, 0.03, 'tri'), 13.05 + i * 0.05, 0.05)  # dock ripple
# end card: impact, silence, then a chime when the beam settles
add(kick(1.2, 120, 28), 13.5, 1.1)
add(lowpass(noise(1.6, 0.6, 0.002), 700), 13.5, 0.5)
add(tone(np.linspace(1400, 520, int(0.25 * SR)), 0.25, 0.002, 0.08), 13.5, 0.2)
for i, m in enumerate((69, 76, 81)): add(bell(midi(m), 2.0), 14.5 + i * 0.03, 0.09, (i - 1) * 0.3)

# ---------------- reverb + master ----------------
ir_n = int(1.4 * SR); ti = np.arange(ir_n) / SR
ir = rng.standard_normal((2, ir_n)) * np.exp(-ti * 4.0); ir[:, :int(0.012 * SR)] = 0
def conv(x, h):
    m = len(x) + len(h) - 1; nfft = 1 << (m - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[:len(x)]
wetL = conv(L, ir[0]); wetR = conv(R, ir[1])
wet_scale = np.max(np.abs(L)) / (np.max(np.abs(wetL)) + 1e-9)
L2 = L + wetL * wet_scale * 0.18; R2 = R + wetR * wet_scale * 0.18
fade = np.ones(N); fn = int(0.35 * SR); fade[-fn:] = np.linspace(1, 0, fn) ** 2
mix = np.stack([L2, R2], 1) * fade[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.6)
mix = mix / np.max(np.abs(mix)) * 0.89
pcm = (mix * 32767).astype('<i2')
out = os.path.join(ROOT, 'soundtrack.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out)
