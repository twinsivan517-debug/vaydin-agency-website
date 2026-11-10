"""Check every recorded line against what it was meant to say: words heard vs words written, stage directions spoken aloud, length.

    python -I verify.py LINES_JSON WEB_DIR [--only ID,ID] [--lock LOCK_JSON] [--accept ID,ID]

LINES_JSON is extract.mjs's output ({id: {text, from}}): the script it was recorded from is rebuilt here with record.py's
own script(), and opener.mp3 is checked against the opener's lines joined. An old {id: text} script still reads, without
--lock. --only checks just those ids, and the lock then moves only theirs.

--lock records, for each page line whose take is ok (or named in --accept after a second check: listened to, or read in
words.json's small.en transcript), three SHA-256s: the page text, its words (stage directions, case and punctuation
aside) and the mp3. scripts/voice-lines.test.mjs fails npm test when any of them no longer matches. Two things are never
locked: a line whose recorded script says other words than its page (record.py's NEW replaces a whole line), and new words
on the recording that was verified for the old ones -- Whisper's tolerance cannot tell one changed word from none, so
changed words need a new recording. Every id whose entry moves or is refused is printed; a refused or flagged line keeps
the entry it had; entries for lines that are gone are removed; _extras is never touched.
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
words = lambda t: " ".join(re.sub(r"[^a-z0-9']+", " ", re.sub(r"\[[^\]]*\]", " ", t).lower()).split())
sha = lambda b: hashlib.sha256(b).hexdigest()
ids = lambda s: {x for x in s.split(",") if x}
ap = argparse.ArgumentParser()
ap.add_argument("lines_json")
ap.add_argument("web")
ap.add_argument("--only", default="")
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
only, accept = ids(args.only), ids(args.accept)
for name, named in (("--only", only), ("--accept", accept)):
    if named - set(script):
        sys.exit(f"{name} names no line: {' '.join(sorted(named - set(script)))}")
if only:
    script = {i: t for i, t in script.items() if i in only}
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
    old, new, moved, refused = lock.get("lines", {}), {}, [], []
    for i, text in page.items():
        prev = old.get(i)
        if prev is not None:
            new[i] = prev
        if i not in script or (i not in passed and i not in accept):
            continue
        if words(script[i]) != words(text):
            refused.append(f"{i}: record.py's script says other words than the page; fix record.py, then re-record"); continue
        entry = {"text": sha(text.encode("utf-8")), "words": sha(words(text).encode("utf-8")),
                 "audio": sha(open(os.path.join(args.web, i + ".mp3"), "rb").read())}
        if i not in passed:
            entry["accepted"] = True
        if isinstance(prev, str) and prev != entry["text"]:
            refused.append(f"{i}: an old entry for other text; re-record it"); continue
        if isinstance(prev, dict) and prev.get("audio") == entry["audio"] and prev.get("words") != entry["words"]:
            refused.append(f"{i}: its words changed and its recording did not; re-record it"); continue
        if entry != prev:
            new[i] = entry; moved.append(i)
    lock["lines"] = dict(sorted(new.items()))
    with open(args.lock, "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(lock, indent=1, ensure_ascii=False) + "\n")
    print(f"lock: {len(moved)} moved, {len(refused)} refused, {len(set(old) - set(page))} removed")
    print("  moved:", " ".join(sorted(moved)) or "none")
    for r in refused:
        print("  REFUSED", r)
    print("  accepted after a second check:", " ".join(sorted(accept & set(moved))) or "none")
