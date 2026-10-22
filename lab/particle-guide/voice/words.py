"""Time every word of every web voice file, as heard. Writes {id: {dur, words: [[word, start], ...]}}.

    python -I words.py VOICE_DIR OUT_JSON [ids...]
"""
import json
import os
import re
import subprocess
import sys

from faster_whisper import WhisperModel

d, out = sys.argv[1], sys.argv[2]
only = set(sys.argv[3:])
m = WhisperModel("small.en", device="cpu", compute_type="int8")
res = json.load(open(out, encoding="utf-8")) if os.path.exists(out) else {}
for f in sorted(os.listdir(d)):
    i = f[:-4]
    if not f.endswith(".mp3") or (only and i not in only):
        continue
    p = os.path.join(d, f)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    segs, _ = m.transcribe(p, language="en", word_timestamps=True)
    words = [[re.sub(r"[^a-z0-9']", "", w.word.lower()), round(float(w.start), 2)] for s in segs for w in s.words]
    res[i] = {"dur": round(dur, 2), "words": [w for w in words if w[0]]}
    print(i, len(res[i]["words"]), "words", res[i]["dur"], "s")
json.dump(res, open(out, "w", encoding="utf-8"), separators=(",", ":"))
