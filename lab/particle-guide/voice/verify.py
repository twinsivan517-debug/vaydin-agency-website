"""Check every recorded line against what it was meant to say: words heard vs words written, stage directions spoken aloud, length.

    python -I verify.py SCRIPT_JSON WEB_DIR
"""
import difflib
import json
import os
import re
import subprocess
import sys

from faster_whisper import WhisperModel

TAGS = ("softly", "curious", "warm", "confident", "serious", "skeptical", "sceptical", "laugh", "sigh")
script_json, web = sys.argv[1:3]
script = json.load(open(script_json, encoding="utf-8"))
m = WhisperModel("base.en", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z' ]", " ", s.lower().replace("vaydin", "vaydin")).split()
flagged = 0
for i, text in sorted(script.items()):
    p = os.path.join(web, i + ".mp3")
    if not os.path.exists(p):
        print(f"{i:<14} MISSING"); flagged += 1; continue
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    heard = " ".join(s.text for s in m.transcribe(p, language="en")[0])
    want = re.sub(r"\[[^\]]+\]", " ", text)
    a, b = [w for w in norm(want) if not w.startswith("vayd")], [w for w in norm(heard) if not re.match(r"va[iyd]", w)]
    ratio = difflib.SequenceMatcher(None, a, b).ratio()
    spoken = [t for t in TAGS if re.search(r"\b" + t, heard.lower()) and not re.search(r"\b" + t, want.lower())]
    wps = len(a) / dur if dur else 0
    bad = ratio < 0.85 or spoken or wps < 1.4 or wps > 3.6
    flagged += bool(bad)
    print(f"{i:<14} {dur:5.1f}s {ratio:4.2f} {'TAG:' + ','.join(spoken) if spoken else '':<14} {'CHECK' if bad else 'ok'}" + (f"  heard: {heard.strip()[:100]}" if bad else ""))
print("flagged", flagged, "of", len(script))
