"""A recorded line becomes the page's voice file: media/voice/<id>.mp3 (the
recording as it came, not in git) is written to public/voice/<id>.mp3 the way
every line since 2026-10-17 was: mono, 32 kHz, 40 kbps, silence trimmed at both
ends, a 150 ms tail, loudness -16 LUFS. Run before scripts/lipsync.py, which
reads public/voice.

    python scripts/voice.py a-price a-branches
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "media" / "voice"
WEB = ROOT / "public" / "voice"
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05"
CHAIN = f"{TRIM},areverse,{TRIM},areverse,apad=pad_dur=0.15,loudnorm=I=-16:TP=-1.5:LRA=11"


def main(ids: list[str]) -> int:
    for i in ids:
        src, out = SOURCE / f"{i}.mp3", WEB / f"{i}.mp3"
        if not src.exists():
            print(f"missing: {src}", file=sys.stderr)
            return 2
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", CHAIN, "-ac", "1", "-ar", "32000",
                        "-b:a", "40k", str(out)], check=True)
        print(f"{i}: {out.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
