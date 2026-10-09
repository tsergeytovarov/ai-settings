"""Generates the synthesized clips of the sounds and fuse plugins: the drop
of a finished answer and the fuse's siren. The quack (ask.wav) is a recording,
cut as the README says.

Run from the plugins folder: python3 sounds/scripts/make_sounds.py
"""
import math
import struct
import wave
from pathlib import Path

RATE = 44_100
PLUGINS = Path(__file__).resolve().parents[2]


def drop(length: float = 0.18) -> list[float]:
    """A ringing water drop: a bubble whose pitch shoots from 600 Hz up to 1.8 kHz
    within ~10 ms, fading over ~45 ms."""
    samples, phase = [], 0.0
    for i in range(int(RATE * length)):
        t = i / RATE
        freq = 1800 - 1200 * math.exp(-t / 0.008)
        phase += 2 * math.pi * freq / RATE
        envelope = min(1.0, t / 0.001) * math.exp(-t / 0.045)
        samples.append(envelope * math.sin(phase))
    return samples


def siren(length: float = 0.7) -> list[float]:
    """One short siren wail: 700 Hz up to 1200 Hz and back down."""
    samples, phase = [], 0.0
    n = int(RATE * length)
    for i in range(n):
        t = i / RATE
        freq = 700 + 500 * math.sin(math.pi * i / n) ** 2
        phase += 2 * math.pi * freq / RATE
        envelope = min(1.0, t / 0.01, (length - t) / 0.03)
        samples.append(envelope * (math.sin(phase) + 0.3 * math.sin(3 * phase)))
    return samples


def save(path: Path, samples: list[float], gain: float) -> None:
    """Writes 16-bit mono, the loudest sample scaled to `gain`."""
    peak = max(abs(s) for s in samples)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(RATE)
        out.writeframes(b"".join(struct.pack("<h", int(s / peak * gain * 32_767)) for s in samples))


save(PLUGINS / "sounds" / "sounds" / "done.wav", drop(), gain=0.95)
save(PLUGINS / "fuse" / "sounds" / "alarm.wav", siren(), gain=0.55)
print("ok")
