"""ElevenLabs helper for picking and recording the guide's voice. The key is read at run time from a .env file and never printed, logged or written.

    python -I eleven.py ENV_FILE plan
    python -I eleven.py ENV_FILE library OUT_DIR        # male, English, educational/narrative voices: list + previews
    python -I eleven.py ENV_FILE design OUT_DIR "description" "sample text"
    python -I eleven.py ENV_FILE say VOICE_ID OUT.mp3 "text"
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.elevenlabs.io"


def key(env_file):
    for line in open(env_file, encoding="utf-8"):
        k, _, v = line.strip().partition("=")
        if k.strip() == "ELEVENLABS_API_KEY":
            return v.strip().strip('"').strip("'")
    sys.exit("ELEVENLABS_API_KEY not found in the env file")


def call(k, method, path, body=None, raw=False):
    req = urllib.request.Request(API + path, method=method, headers={"xi-api-key": k, "Content-Type": "application/json", "Accept": "*/*"},
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code} on {method} {path}: {e.read()[:400].decode('utf-8', 'replace')}")
    return data if raw else json.loads(data)


def fetch(url, out):
    with urllib.request.urlopen(url, timeout=60) as r, open(out, "wb") as f:
        f.write(r.read())


def main():
    k, cmd = key(sys.argv[1]), sys.argv[2]
    if cmd == "plan":
        s = call(k, "GET", "/v1/user/subscription")
        print(json.dumps({x: s.get(x) for x in ("tier", "status", "character_count", "character_limit", "next_character_count_reset_unix", "can_use_instant_voice_cloning")}, indent=1))
    elif cmd == "library":
        out = sys.argv[3]; os.makedirs(out, exist_ok=True); found = {}
        for use in ("informative_educational", "narrative_story", "conversational"):
            for age in ("middle_aged", "old"):
                q = urllib.parse.urlencode({"page_size": 40, "gender": "male", "age": age, "language": "en", "use_cases": use, "sort": "usage_character_count_1y"})
                for v in call(k, "GET", "/v1/shared-voices?" + q).get("voices", []):
                    found.setdefault(v["voice_id"], {f: v.get(f) for f in ("voice_id", "public_owner_id", "name", "accent", "age", "use_case", "descriptive", "description", "preview_url", "cloned_by_count")})
        for v in found.values():
            if v["preview_url"]:
                try:
                    fetch(v["preview_url"], os.path.join(out, v["voice_id"] + ".mp3"))
                except Exception as e:  # a dead preview drops that voice, not the run
                    v["preview_url"] = None
        json.dump(list(found.values()), open(os.path.join(out, "voices.json"), "w", encoding="utf-8"), indent=1)
        print("voices", len(found))
    elif cmd == "design":
        out, desc, text = sys.argv[3], sys.argv[4], sys.argv[5]; os.makedirs(out, exist_ok=True)
        r = call(k, "POST", "/v1/text-to-voice/create-previews", {"voice_description": desc, "text": text})
        for i, p in enumerate(r.get("previews", [])):
            open(os.path.join(out, f"design-{i}.mp3"), "wb").write(base64.b64decode(p["audio_base_64"]))
            print(i, p.get("generated_voice_id"))
    elif cmd == "models":
        for m in call(k, "GET", "/v1/models"):
            print(m.get("model_id"), "|", m.get("name"), "| tts:", m.get("can_do_text_to_speech"), "| style:", m.get("can_use_style"), "| cost x", m.get("token_cost_factor"))
    elif cmd == "search":
        term, out = sys.argv[3], sys.argv[4]; os.makedirs(out, exist_ok=True)
        q = urllib.parse.urlencode({"page_size": 30, "gender": "male", "language": "en", "search": term})
        vs = call(k, "GET", "/v1/shared-voices?" + q).get("voices", [])
        keep = []
        for v in vs:
            row = {f: v.get(f) for f in ("voice_id", "public_owner_id", "name", "accent", "age", "use_case", "descriptive", "description", "preview_url", "cloned_by_count")}
            if row["preview_url"]:
                fetch(row["preview_url"], os.path.join(out, row["voice_id"] + ".mp3")); keep.append(row)
                print(row["cloned_by_count"], "|", row["name"], "|", row["accent"], row["age"], row["descriptive"], "|", (row["description"] or "")[:90].replace("\n", " "))
        json.dump(keep, open(os.path.join(out, "voices.json"), "w", encoding="utf-8"), indent=1)
    elif cmd == "say":
        voice, out, text = sys.argv[3], sys.argv[4], sys.argv[5]
        model = sys.argv[6] if len(sys.argv) > 6 else "eleven_multilingual_v2"
        audio = call(k, "POST", f"/v1/text-to-speech/{voice}?output_format=mp3_44100_128", {"text": text, "model_id": model}, raw=True)
        open(out, "wb").write(audio)
        print(out, len(audio), "bytes")


if __name__ == "__main__":
    main()
