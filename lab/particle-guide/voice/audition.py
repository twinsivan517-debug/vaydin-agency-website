"""Record the emotion test line in every candidate voice with Eleven v3, plus one v4 take to see whether v4 obeys the tags. Key read at run time, never printed.

    python -I audition.py ENV_FILE LIBRARY_DIR ROBOT_DIR OUT_DIR
"""
import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eleven import call, key  # noqa: E402

TEST = ("[warm] Hi, I'm Vaydin's guide. [curious] So, you believe every patient who messages your clinic gets an answer? "
        "[skeptical] Hmm. Even the ones who write at midnight? [laughs] Don't worry. Nobody checks that. "
        "[serious] Except us. We measure your clinic the way a patient meets it.")

WANT = {  # name as listed in the library -> short label
    "Paul - Gentle, Patient and Clear": "paul",
    "Russ": "russ",
    "Clyde - Full, Diplomatic and Inviting": "clyde",
    "Adam - Articulate Engineering Professor": "professor",
    "Jon - Natural Authority (Agent / Assistant)": "jon-assistant",
    "Marcus - Robotic, Deep and Smooth": "marcus-robotic",
    "Sigma Centauri - AI Robot": "sigma-ai",
    "Benjamin -Confident and Slight Robotic": "benjamin-slight-robotic",
}


def load(dirs):
    rows = []
    for d in dirs:
        for root, _, files in os.walk(d):
            if "voices.json" in files:
                rows += json.load(open(os.path.join(root, "voices.json"), encoding="utf-8"))
    return rows


def tts(k, voice, text, model):
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128", method="POST",
                                 headers={"xi-api-key": k, "Content-Type": "application/json"}, data=json.dumps({"text": text, "model_id": model}).encode())
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.read(), None
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}"


def main():
    k = key(sys.argv[1]); out = sys.argv[4]; os.makedirs(out, exist_ok=True)
    rows = load(sys.argv[2:4]); picked = {}
    for v in rows:
        for name, label in WANT.items():
            if label not in picked and (v["name"] == name or (label == "russ" and v["name"].startswith("Russ"))):
                picked[label] = v
    print("found", sorted(picked), "missing", sorted(set(WANT.values()) - set(picked)))
    log = []
    for label, v in picked.items():
        audio, err = tts(k, v["voice_id"], TEST, "eleven_v3")
        if err and "voice" in err.lower():
            # A library voice may have to be added to the account before it can speak.
            call(k, "POST", f"/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", {"new_name": "Vaydin test " + label})
            audio, err = tts(k, v["voice_id"], TEST, "eleven_v3")
        if audio:
            open(os.path.join(out, label + ".mp3"), "wb").write(audio)
        print(label, "OK" if audio else err)
        log.append({"label": label, "voice_id": v["voice_id"], "name": v["name"], "ok": bool(audio), "err": err})
    if "paul" in picked:
        audio, err = tts(k, picked["paul"]["voice_id"], TEST, "eleven_v4")
        if audio:
            open(os.path.join(out, "paul-v4.mp3"), "wb").write(audio)
        print("paul v4", "OK" if audio else err)
    json.dump(log, open(os.path.join(out, "audition.json"), "w", encoding="utf-8"), indent=1)


if __name__ == "__main__":
    main()
