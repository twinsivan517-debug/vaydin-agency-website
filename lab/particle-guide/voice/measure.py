"""Measure voice samples: median pitch (how deep), pitch spread (how lively), speaking pace and language. Prints one row per file, deepest first.

    python -I measure.py DIR_OF_MP3S
"""
import os
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel


def pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def pitch(x, sr=16000):
    # Frame by frame autocorrelation over 40 ms, voiced frames only, 60-300 Hz.
    f, hop, out = 640, 160, []
    lo, hi = sr // 300, sr // 60
    for i in range(0, len(x) - f, hop):
        w = x[i:i + f] * np.hanning(f)
        if np.sqrt((w * w).mean()) < 0.02:
            continue
        ac = np.correlate(w, w, "full")[f - 1:]
        lag = lo + int(np.argmax(ac[lo:hi]))
        if ac[lag] > 0.45 * ac[0]:
            out.append(sr / lag)
    return np.array(out)


def main():
    d = sys.argv[1]
    model = WhisperModel("base", device="cpu", compute_type="int8")
    rows = []
    for name in sorted(os.listdir(d)):
        if not name.endswith(".mp3"):
            continue
        p = os.path.join(d, name)
        x = pcm(p)
        f0 = pitch(x)
        segs, info = model.transcribe(p, language=None)
        words = sum(len(s.text.split()) for s in segs)
        dur = len(x) / 16000
        rows.append((float(np.median(f0)) if len(f0) else 0, float(np.std(np.log2(f0 + 1e-6)) * 12) if len(f0) else 0, words / dur * 60 if dur else 0, info.language, dur, name))
    rows.sort()
    print(f"{'pitch Hz':>8} {'spread st':>9} {'words/min':>9} lang {'secs':>5}  file")
    for r in rows:
        print(f"{r[0]:8.0f} {r[1]:9.1f} {r[2]:9.0f} {r[3]:>4} {r[4]:5.1f}  {r[5]}")


if __name__ == "__main__":
    main()
