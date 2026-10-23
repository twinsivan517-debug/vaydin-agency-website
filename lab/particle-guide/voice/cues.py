"""What the guide shows while each voice file plays: shapes his body becomes, doors it rings, how his eyes look, and the word beats his eyes pulse on.
Built from Jon's word timings and the acting directions in the script; keyed by the audio file the page plays.

    python -I cues.py SCRIPT_JSON WORDS_JSON OUT_JSON
"""
import difflib
import json
import re
import sys

# A word (its start) -> what his body shows. First match wins; a door is one of the five pages under him.
SHAPES = [
    (r"^dubai", "skyline"), (r"^whatsapp", "chat"), (r"^google", "search"), (r"^review", "star"), (r"^instagram", "camera"),
    (r"^website", "web"), (r"^(book|booked|booking|bookings|appointment)$", "calendar"), (r"^remind", "bell"),
    (r"^(revive|revived|dormant|quiet)$", "heart"), (r"^(dashboard|counted|score|scored|scores|scoring)$", "chart"),
    (r"^report", "report"), (r"^email$", "mail"), (r"^(evening|weekend|midnight|night)$", "moon"),
    (r"^(price|fee|spend|dirham|dirhams|billing|marked)$", "coin"), (r"^(records|privacy|confidential|private)$", "shield"),
    (r"^(access|keys)$", "key"), (r"^(map|rivals)$", "pin"), (r"^(patient|patients)$", "person"), (r"^(clinic|clinics)$", "clinic"),
    (r"^(minimum|monthly|month|weekly)$", "clock"),
]
DOORS = [(r"^(diagnostic|unannounced|shopper|shop|shops|intelligence|measure)$", 0), (r"^(fix|immaculate)$", 1),
         (r"^(grow|growth|fuel|demand)$", 2), (r"^(engine)$", 3), (r"^(plan|plans)$", 4)]
# An acting direction -> how his eyes look for the words it covers.
EYES = {"warm": "happy", "curious": "wide", "skeptical": "think", "laughs": "wink", "serious": "line", "sighs": "sad",
        "confident": "sparkle", "softly": "blink"}
OPENER = [("00b", 0.0), ("01", 2.58), ("tag-b", 4.39)]
# The lines that close the greeting, a chapter or a page's summary: he signs off with the Vaydin mark once they end.
SIGN_OFF = {"02", "w1", "08", "10", "a-time", "a-cancel", "p-diagnose", "p-fix", "p-grow", "p-engine", "p-pricing"}


def number(w, prev, nxt, nxt2, prev2):
    # A number he says -> its digits. "One" and "two" only where they count something (layer one, two days).
    if w == "thirty" and nxt == "to" and nxt2 == "sixty":
        return "n30-60"
    if w == "sixty" and prev == "to" and prev2 == "thirty":
        return None
    for pat, shape in ((r"^thirty$", "n30"), (r"^sixty$", "n60"), (r"^thirteen$", "n13"), (r"^six$", "n6"), (r"^three", "n3"), (r"^seven$", "n7")):
        if re.match(pat, w):
            return shape
    if w == "one" and prev == "layer":
        return "n1"
    if w == "two" and (prev == "layer" or nxt == "days"):
        return "n2"
    return None


def norm(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


def plan(text, timed, dur):
    # The script's words and tags, aligned to the words heard, so a tag or a word in the script gets a time.
    tokens = re.findall(r"\[[^\]]+\]|[^\s\[\]]+", text)
    words, tags = [], []
    for tok in tokens:
        if tok.startswith("["):
            tags.append((len(words), tok[1:-1]))
        elif norm(tok):
            words.append(norm(tok))
    heard = [w for w, _ in timed]
    when = [None] * len(words)
    for blk in difflib.SequenceMatcher(None, words, heard, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            when[blk.a + k] = timed[blk.b + k][1]
    # Fill a gap with the nearest known time before it.
    lastt = 0.0
    for i, t in enumerate(when):
        if t is None:
            when[i] = lastt
        lastt = when[i]
    cues = []
    last_body = -9.0
    shown = {}
    for i, w in enumerate(words):
        t = when[i]
        hit = None
        for pat, door in DOORS:
            if re.match(pat, w):
                hit = {"door": door}; break
        nxt = words[i + 1] if i + 1 < len(words) else ""
        if w == "front" and nxt == "door":
            hit = {"door": 1}
        if w == "hello" and nxt == "at":
            hit = {"shape": "mail"}
        # "Pick a question": his light rings every question chip at once.
        if w == "pick" and nxt == "a" and i + 2 < len(words) and words[i + 2] == "question":
            hit = {"chips": 1}
        if not hit:
            n = number(w, words[i - 1] if i else "", nxt, words[i + 2] if i + 2 < len(words) else "", words[i - 2] if i > 1 else "")
            if n:
                hit = {"shape": n}
        if not hit:
            for pat, shape in SHAPES:
                if re.match(pat, w):
                    hit = {"shape": shape}; break
        if not hit:
            continue
        key = json.dumps(hit)
        if t - last_body < 0.55 or t - shown.get(key, -9) < 3.5:
            continue
        cues.append({"t0": round(max(0, t - 0.12), 2), **hit}); last_body = t; shown[key] = t
    # Each body cue lasts until the next starts, at least 1 s, at most 2.4 s (a door 2.2 s).
    for k, c in enumerate(cues):
        nxt = cues[k + 1]["t0"] if k + 1 < len(cues) else dur + 0.3
        cap = 2.2 if "door" in c or "chips" in c else 2.4
        c["t1"] = round(min(nxt, c["t0"] + cap, dur + 0.6) if nxt - c["t0"] >= 0.55 else nxt, 2)
    for idx, tag in tags:
        e = EYES.get(tag)
        if not e:
            continue
        t0 = when[idx] if idx < len(when) else dur
        cues.append({"t0": round(max(0, t0 - 0.05), 2), "t1": round(min(dur, t0 + 1.6), 2), "eyes": e})
    # A question ends with wide, waiting eyes.
    if text.rstrip().endswith("?"):
        cues.append({"t0": round(max(0, dur - 0.9), 2), "t1": round(dur + 0.8, 2), "eyes": "wide"})
    beats = sorted({round(t, 2) for _, t in timed})
    return sorted(cues, key=lambda c: c["t0"]), beats


def main():
    script = json.load(open(sys.argv[1], encoding="utf-8"))
    words = json.load(open(sys.argv[2], encoding="utf-8"))
    out = {}
    for i, text in script.items():
        if i not in words:
            continue
        cues, beats = plan(text, words[i]["words"], words[i]["dur"])
        out[i] = {"dur": words[i]["dur"], "cues": cues, "beats": beats}
        if i in SIGN_OFF:
            out[i]["end"] = "mark"
    # The greeting is one file of three lines: their cues, shifted to where each starts in it.
    oc, ob = [], []
    for i, at in OPENER:
        for c in out[i]["cues"]:
            oc.append({**c, "t0": round(c["t0"] + at, 2), "t1": round(c["t1"] + at, 2)})
        ob += [round(b + at, 2) for b in out[i]["beats"]]
    out["opener"] = {"dur": round(OPENER[-1][1] + out[OPENER[-1][0]]["dur"], 2), "cues": oc, "beats": ob}
    json.dump(out, open(sys.argv[3], "w", encoding="utf-8"), separators=(",", ":"))
    shapes = sum(1 for v in out.values() for c in v["cues"] if "shape" in c)
    doors = sum(1 for v in out.values() for c in v["cues"] if "door" in c or "chips" in c)
    eyes = sum(1 for v in out.values() for c in v["cues"] if "eyes" in c)
    print("files", len(out), "shape cues", shapes, "door cues", doors, "eye cues", eyes)


if __name__ == "__main__":
    main()
