"""Check every recorded line against what it was meant to say: words heard vs words written, stage directions spoken aloud, length.

    python -I verify.py LINES_JSON WEB_DIR [--lock LOCK_JSON] [--accept ID,ID]

LINES_JSON is extract.mjs's output ({id: {text, from}}): the script it was recorded from is rebuilt here with record.py's
own script(), and opener.mp3 is checked against the opener's lines joined. An old {id: text} script still reads, without
--lock. --lock writes, for each page line whose take is ok (or named in --accept after a second check: listened to, or
read in words.json's small.en transcript), the
SHA-256 of the page text it was checked against; scripts/voice-lines.test.mjs fails npm test when a line's text no longer
matches. A flagged line keeps the entry it had; entries for lines that are gone are removed; _extras is never touched.
"""
import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys

from faster_whisper import WhisperModel

TAGS = ("softly", "curious", "warm", "confident", "serious", "skeptical", "sceptical", "laugh", "sigh")
ap = argparse.ArgumentParser()
ap.add_argument("lines_json")
ap.add_argument("web")
ap.add_argument("--lock")
ap.add_argument("--accept", default="")
args = ap.parse_args()
src = json.load(open(args.lines_json, encoding="utf-8"))
page = {i: v["text"] for i, v in src.items() if isinstance(v, dict)}
if page:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from record import script as recorded  # noqa: E402
    script = recorded(src)
    if "opener" in page:
        script["opener"] = page["opener"]
else:
    script = src
if args.lock and not page:
    sys.exit("--lock needs extract.mjs's output (the page text), not a script")
accept = {x for x in args.accept.split(",") if x}
if accept - set(page):
    sys.exit(f"--accept names no page line: {' '.join(sorted(accept - set(page)))}")
m = WhisperModel("base.en", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z' ]", " ", s.lower().replace("vaydin", "vaydin")).split()
flagged = 0
passed = set()
for i, text in sorted(script.items()):
    p = os.path.join(args.web, i + ".mp3")
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
    if not bad:
        passed.add(i)
    print(f"{i:<14} {dur:5.1f}s {ratio:4.2f} {'TAG:' + ','.join(spoken) if spoken else '':<14} {'CHECK' if bad else 'ok'}" + (f"  heard: {heard.strip()[:100]}" if bad else ""))
print("flagged", flagged, "of", len(script))
if args.lock:
    lock = json.load(open(args.lock, encoding="utf-8")) if os.path.exists(args.lock) else {"_extras": {}, "lines": {}}
    old, new, fresh = lock.get("lines", {}), {}, 0
    for i, text in page.items():
        if i in passed or i in accept:
            new[i] = hashlib.sha256(text.encode("utf-8")).hexdigest(); fresh += 1
        elif i in old:
            new[i] = old[i]
    lock["lines"] = dict(sorted(new.items()))
    with open(args.lock, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(lock, indent=1, ensure_ascii=False) + "\n")
    print(f"lock: {fresh} written from this run, {len(new) - fresh} kept, {len(set(old) - set(new))} removed;",
          f"accepted after a second check: {' '.join(sorted(accept)) or 'none'}")
