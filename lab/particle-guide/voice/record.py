"""Record every guide line in Jon (Eleven v3, his emotion tags), add the light AI layer, and write the web file the way the site always has.

    python -I record.py ENV_FILE LINES_JSON VOICE_ID RAW_DIR WEB_DIR [ids...]

Raw takes (as they came) go to RAW_DIR; web files (AI layer, trimmed, 150 ms tail, -16 LUFS, mono 32 kHz 40 kbps) to WEB_DIR.
A take already in RAW_DIR is not recorded again.
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from eleven import key  # noqa: E402

# His own lines, new for him (approved 2026-10-22; 01 and poke-6 rewritten on his word 2026-10-23), and the two lines that named her.
NEW = {
    "00b": "[softly] Mmm… [curious] oh, hello there.",
    "01": "[warm] I'm Vaydin's guide.",
    "tag-a": "[confident] Dubai never sleeps. Neither do your patients. [warm] With Vaydin, neither does your clinic.",
    "tag-b": "[confident] Dubai never sleeps. Neither do your patients. [warm] With Vaydin, your clinic never misses them.",
    "poke-6": "[skeptical] Sleep? In Dubai? Never. [laughs] Hibernation mode, though. Until you get serious.",
    "x-personal": "[laughs] I'm Vaydin's guide, so I only talk about Vaydin. Ask me anything about your clinic.",
}
# Emotion where it helps; the plain explanations stay calm and untagged.
LEAD = {
    "w1": "[warm]", "10": "", "g1": "[confident]", "a-legit": "[laughs]", "a-chatgpt": "[confident]", "a-clients": "[confident]",
    "a-compliance": "[serious]", "a-medical": "[serious]", "a-legal": "[serious]", "a-patient": "[warm]", "a-jobs": "[warm]",
    "a-you": "[warm]", "a-unannounced": "[confident]", "p-pricing": "[warm]", "poke-1": "[warm]", "poke-2": "[curious]",
    "poke-3": "[laughs]", "poke-4": "[sighs]", "poke-5": "[skeptical]", "x-bye": "[warm]", "x-hello": "[warm]",
    "x-howareyou": "[warm]", "x-kind": "[warm]", "x-thanks": "[warm]", "x-welcome": "[warm]", "x-choose": "[curious]",
    "x-unknown": "[curious]",
}
INSIDE = {
    "02": ("and how a clinic loses", "[serious] and how a clinic loses"),
    "10": ("Measured, not promised.", "[confident] Measured, not promised."),
    "a-ads": ("No AI patients", "[serious] No AI patients"),
    "x-rude": ("but I'm happy", "[warm] but I'm happy"),
}
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05"
WEB = (f"[0:a]asplit[a][b];[b]afftfilt=real='hypot(re,im)':imag='0':win_size=512:overlap=0.75,highpass=f=120[r];"
       f"[a][r]amix=inputs=2:weights='0.76 0.24':normalize=0,alimiter=limit=0.95,{TRIM},areverse,{TRIM},areverse,"
       f"apad=pad_dur=0.15,loudnorm=I=-16:TP=-1.5:LRA=11")


def script(lines):
    out = {}
    for i, v in lines.items():
        if i == "opener":
            continue
        t = NEW.get(i, v["text"])
        if i in INSIDE and INSIDE[i][0] in t:
            t = t.replace(*INSIDE[i])
        if i in LEAD and LEAD[i] and i not in NEW:
            t = LEAD[i] + " " + t
        out[i] = t
    for i, t in NEW.items():
        out.setdefault(i, t)
    return out


def tts(k, voice, text):
    body = json.dumps({"text": text, "model_id": "eleven_v3"}).encode()
    for attempt in range(5):
        req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128", method="POST",
                                     headers={"xi-api-key": k, "Content-Type": "application/json"}, data=body)
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503):
                time.sleep(4 * (attempt + 1)); continue
            sys.exit(f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}")
    sys.exit("gave up after retries")


def main():
    env, lines_json, voice, raw, web = sys.argv[1:6]
    only = set(sys.argv[6:])
    os.makedirs(raw, exist_ok=True); os.makedirs(web, exist_ok=True)
    k = key(env)
    todo = script(json.load(open(lines_json, encoding="utf-8")))
    json.dump(todo, open(os.path.join(raw, "script.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    for i, text in sorted(todo.items()):
        if only and i not in only:
            continue
        src = os.path.join(raw, i + ".mp3")
        if not os.path.exists(src) or only:
            open(src, "wb").write(tts(k, voice, text))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", WEB, "-ac", "1", "-ar", "32000", "-b:a", "40k",
                        os.path.join(web, i + ".mp3")], check=True)
        print(i, os.path.getsize(os.path.join(web, i + ".mp3")) // 1024, "KB")


if __name__ == "__main__":
    main()
