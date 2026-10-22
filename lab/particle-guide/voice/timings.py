"""Time the words of every audition take, and find the moments the guide reacts to. Writes takes.js for the audition page.

    python -I timings.py DIR OUT_JS
"""
import json
import os
import re
import subprocess
import sys

from faster_whisper import WhisperModel

# The words he reacts to, in the order they come in the test line.
MOMENTS = ["hi", "messages", "hmm", "midnight", "worry", "except", "measure"]

d, out = sys.argv[1], sys.argv[2]
m = WhisperModel("base.en", device="cpu", compute_type="int8")
takes = {}
for f in sorted(os.listdir(d)):
    if not f.endswith(".mp3"):
        continue
    p = os.path.join(d, f)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    segs, _ = m.transcribe(p, language="en", word_timestamps=True)
    words = [(re.sub(r"[^a-z]", "", w.word.lower()), round(w.start, 2)) for s in segs for w in s.words]
    at = {}
    for key in MOMENTS:
        for w, t in words:
            if w.startswith(key) and key not in at and (not at or t >= max(at.values())):
                at[key] = t; break
    takes[f[:-4]] = {"src": f, "dur": round(dur, 2), "at": at, "words": [t for _, t in words]}
    print(f"{f[:-4]:<26} {dur:5.1f}s  found {len(at)}/{len(MOMENTS)} moments  {at}")
open(out, "w", encoding="utf-8").write("window.TAKES = " + json.dumps(takes) + ";\n")
