"""For each take: did the model act the emotion tags or read them aloud? Plus depth (median pitch), liveliness (pitch spread) and pace.

    python -I tagcheck.py DIR
"""
import os
import re
import sys

import numpy as np
from faster_whisper import WhisperModel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from measure import pcm, pitch  # noqa: E402

TAGS = ("warm", "curious", "skeptical", "sceptical", "laugh", "serious")
d = sys.argv[1]
m = WhisperModel("base.en", device="cpu", compute_type="int8")
print(f"{'take':<26} {'Hz':>4} {'spread':>6} {'wpm':>4} {'secs':>5}  tags read aloud | transcript start")
for f in sorted(os.listdir(d)):
    if not f.endswith(".mp3"):
        continue
    p = os.path.join(d, f); x = pcm(p); f0 = pitch(x)
    segs, _ = m.transcribe(p, language="en")
    text = " ".join(s.text.strip() for s in segs)
    words = len(text.split()); secs = len(x) / 16000
    spoken = [t for t in TAGS if re.search(r"\b" + t, text.lower())]
    print(f"{f[:-4]:<26} {np.median(f0):4.0f} {np.std(np.log2(f0)) * 12:6.1f} {words / secs * 60:4.0f} {secs:5.1f}  {','.join(spoken) or 'none':<14} | {text[:70]}")
