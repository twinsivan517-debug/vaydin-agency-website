"""Shortlist library voices for the guide: clear international English, a teacher's tone, then measured pitch and pace on each sample.

    python -I shortlist.py LIBRARY_DIR
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from measure import pcm, pitch  # noqa: E402

TONES = {"calm", "confident", "professional", "deep", "mature", "wise", "pleasant", "gentle", "serious", "modulated", "relaxed"}
ACCENTS = {"british", "american", "standard", ""}

d = sys.argv[1]
voices = json.load(open(os.path.join(d, "voices.json"), encoding="utf-8"))
rows = []
for v in voices:
    if v.get("accent") not in ACCENTS or v.get("descriptive") not in TONES or v.get("age") != "middle_aged":
        continue
    p = os.path.join(d, v["voice_id"] + ".mp3")
    if not os.path.exists(p):
        continue
    x = pcm(p)
    f0 = pitch(x)
    if len(f0) < 20:
        continue
    v["f0"] = float(np.median(f0)); v["spread"] = float(np.std(np.log2(f0)) * 12); v["secs"] = len(x) / 16000
    rows.append(v)
rows.sort(key=lambda v: v["f0"])
json.dump(rows, open(os.path.join(d, "shortlist.json"), "w", encoding="utf-8"), indent=1)
print(len(rows), "pass the tone and accent filter")
for v in rows:
    print(f"{v['f0']:5.0f} Hz {v['spread']:4.1f} st {v['cloned_by_count'] or 0:>8} uses  {v['accent']:<8} {v['descriptive']:<12} {v['use_case']:<24} {v['name'][:44]}")
