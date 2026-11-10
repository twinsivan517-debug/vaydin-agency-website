"""Check every recorded line against what it was meant to say: words heard vs words written, stage directions spoken aloud, length.

    python -I verify.py LINES_JSON WEB_DIR [--only ID,ID] [--lock LOCK_JSON] [--accept ID,ID]

LINES_JSON is extract.mjs's output ({id: {text, from}}): the script it was recorded from is rebuilt here with record.py's
own script(); opener.mp3's is its NEW takes joined in cues.py's OPENER order. An old {id: text} script still reads,
without --lock. --only (comma-separated) checks just those ids, and the lock then moves only theirs.

--lock records, for each page line whose take is ok (or named in --accept after a second check: listened to, or read in
words.json's small.en transcript), the SHA-256 of its page text, its words (lines.mjs's rule), the SHA-256 of its mp3, and
what Whisper HEARD: its words, the page words it did not hear and the words it heard beyond the page.
scripts/voice-lines.test.mjs fails npm test when the text or mp3 changed, or when the page holds a word the recording was
not heard to say (or the recording a word the page no longer holds) that the lock does not already name -- with no
Whisper in CI. Whether a line's words changed is decided on what was heard, never on the lock's `said`, which a hand can
edit. Refused, never locked: a line whose recorded script says other words than its page; on the same mp3 bytes, page words
beyond what that take was heard to say; on a new mp3, the same, unless --accept after someone has listened; an entry this
tool did not write. Every id moved or refused is printed; a refused or flagged line keeps the entry it had; entries for
lines that are gone are removed; _extras is never touched.
"""
import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
from collections import Counter

from faster_whisper import WhisperModel

TAGS = ("softly", "curious", "warm", "confident", "serious", "skeptical", "sceptical", "laugh", "sigh")
KEYS = {"text", "said", "audio", "heard", "unheard", "extra"}


def words(t):
    """lines.mjs's rule: tags, case and punctuation aside, every letter and digit kept, a typographic apostrophe plain."""
    t = re.sub(r"\[[^\]]*\]", " ", t).replace("’", "'").lower()
    return " ".join("".join(c if c.isalnum() or c == "'" else " " for c in t).split())


sha = lambda b: hashlib.sha256(b).hexdigest()
ids = lambda s: {x for x in s.split(",") if x}
norm = lambda s: re.sub(r"[^a-z' ]", " ", s.lower()).split()
said = lambda s: [w for w in norm(re.sub(r"\[[^\]]+\]", " ", s)) if not w.startswith("vayd")]
ratio = lambda a, b: difflib.SequenceMatcher(None, a, b).ratio()
minus = lambda a, b: sorted((Counter(a) - Counter(b)).elements())
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
    from cues import OPENER  # noqa: E402
    from record import script as recorded  # noqa: E402
    script = recorded(src)
    if "opener" in page:
        script["opener"] = " ".join(script[part] for part, _ in OPENER)
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
flagged = 0
passed, heard_text = set(), {}
for i, text in sorted(script.items()):
    p = os.path.join(args.web, i + ".mp3")
    if not os.path.exists(p):
        print(f"{i:<14} MISSING"); flagged += 1; continue
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    heard = " ".join(s.text for s in m.transcribe(p, language="en")[0])
    a, b = said(text), [w for w in norm(heard) if not re.match(r"va[iyd]", w)]
    heard_text[i] = words(heard)
    r = ratio(a, b)
    spoken = [t for t in TAGS if re.search(r"\b" + t, heard.lower()) and not re.search(r"\b" + t, re.sub(r"\[[^\]]+\]", " ", text).lower())]
    wps = len(a) / dur if dur else 0
    bad = r < 0.85 or spoken or wps < 1.4 or wps > 3.6
    flagged += bool(bad)
    if not bad:
        passed.add(i)
    print(f"{i:<14} {dur:5.1f}s {r:4.2f} {'TAG:' + ','.join(spoken) if spoken else '':<14} {'CHECK' if bad else 'ok'}" + (f"  heard: {heard.strip()[:100]}" if bad else ""))
print("flagged", flagged, "of", len(script))
if args.lock:
    lock = json.load(open(args.lock, encoding="utf-8")) if os.path.exists(args.lock) else {"_extras": {}, "lines": {}}
    old, new, moved, refused = lock.get("lines", {}), {}, [], []
    for i, text in page.items():
        prev = old.get(i)
        if prev is not None:
            new[i] = prev
        if i not in script or i not in heard_text or (i not in passed and i not in accept):
            continue
        if words(script[i]) != words(text):
            refused.append(f"{i}: its recorded script says other words than the page; change record.py's NEW, then re-record"); continue
        if prev is not None and not (isinstance(prev, dict) and KEYS <= set(prev)):
            refused.append(f"{i}: its entry was not written by verify.py in this form; re-record it"); continue
        page_words, heard = words(text).split(), heard_text[i].split()
        entry = {"text": sha(text.encode("utf-8")), "said": words(text),
                 "audio": sha(open(os.path.join(args.web, i + ".mp3"), "rb").read()), "heard": heard_text[i],
                 "unheard": minus(page_words, heard), "extra": minus(heard, page_words)}
        if i not in passed:
            entry["accepted"] = True
        if prev is not None:
            beyond = minus(entry["unheard"], prev["unheard"]), minus(entry["extra"], prev["extra"])
            what = f"page words not heard: {' '.join(beyond[0]) or '-'}; heard beyond the page: {' '.join(beyond[1]) or '-'}"
            same = Counter(entry["unheard"]) == Counter(prev["unheard"]) and Counter(entry["extra"]) == Counter(prev["extra"])
            if prev["audio"] == entry["audio"] and not same:
                refused.append(f"{i}: its words changed and its recording did not ({what}); re-record it"); continue
            if any(beyond) and i not in accept:
                refused.append(f"{i}: the new take is not heard to say the page ({what}); listen, then --accept"); continue
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
