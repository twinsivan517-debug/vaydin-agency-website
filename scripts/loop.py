"""One of her three loops from a generated 5 s clip: idle, talk or sleep.

The clip is padded and placed like a body (scripts/body.py). idle and talk
are cut to the page's BASE_LOOP of 4.5 s with their last half second faded
over their first, so they loop without a seam and the page's phase maths
holds; idle also becomes media/guide/base-loop.mp4 (crf 18), the lip-sync's
base for every line without a body of its own, and talk media/guide/
talk-loop.mp4. sleep keeps its 5 s. The web files land in public/guide/.

    python scripts/loop.py idle media/clips/guide-idle2-src.mp4
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "media" / "guide"
WEB = ROOT / "public" / "guide"
BASE_LOOP = 4.5
PAD = "pad=iw:ceil(iw*16/9/2)*2:0:0.910*oh-0.979*ih:color=0x00FF00"
SEAM = (f"[0:v]split=2[x][y];[x]trim=start={BASE_LOOP},setpts=PTS-STARTPTS,format=yuva420p,"
        f"fade=t=out:st=0:d=0.5:alpha=1[tail];[y]trim=end={BASE_LOOP},setpts=PTS-STARTPTS[main];"
        f"[main][tail]overlay=eof_action=pass,format=yuv420p")


def ff(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main(name: str, src: str) -> int:
    padded = GUIDE / f"{name}-padded.mp4"
    ff("-i", src, "-an", "-vf", f"{PAD},fps=24", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", str(padded))
    if name in ("idle", "talk"):
        base = GUIDE / ("base-loop.mp4" if name == "idle" else "talk-loop.mp4")
        ff("-i", str(padded), "-filter_complex", SEAM, "-r", "24", "-c:v", "libx264", "-crf", "18", "-g", "12", "-pix_fmt", "yuv420p", "-an", str(base))
        ff("-i", str(base), "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-g", "12", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(WEB / f"{name}.mp4"))
    else:
        ff("-i", str(padded), "-c:v", "libx264", "-crf", "26", "-preset", "slow", "-g", "12", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(WEB / f"{name}.mp4"))
    padded.unlink()
    for p in [WEB / f"{name}.mp4"] + ([GUIDE / "base-loop.mp4"] if name == "idle" else [GUIDE / "talk-loop.mp4"] if name == "talk" else []):
        n = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,nb_frames", "-of", "csv=p=0", str(p)],
                           capture_output=True, text=True, check=True).stdout.strip()
        print(f"{p.relative_to(ROOT)}: {n}, {p.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
