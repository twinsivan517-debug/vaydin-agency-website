"""A line's own body: a generated gesture clip made ready for the lip-sync.

The generator follows the still's 2:3 frame, so the clip is padded with the
key green to 9:16, the page's frame, at its own pixels, placed so she stands
where the idle loop has her (feet at 0.910 of the frame, measured on both;
her feet are at 0.979 of the generator's frame, which follows the still), and written to
media/guide/bodies/<id>.mp4 (crf 16, 24 fps, a keyframe every 12 frames),
with a contact sheet beside the source. scripts/lipsync.py then makes the
line over this body instead of the shared loop.

    python scripts/body.py w1 media/clips/guide-w1-src.mp4
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BODIES = ROOT / "media" / "guide" / "bodies"
GREEN = "0x00FF00"


def main(argv: list[str]) -> int:
    i, src = argv[0], Path(argv[1])
    BODIES.mkdir(parents=True, exist_ok=True)
    out = BODIES / f"{i}.mp4"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-an",
         "-vf", f"pad=iw:ceil(iw*16/9/2)*2:0:0.910*oh-0.979*ih:color={GREEN},fps=24",
         "-c:v", "libx264", "-crf", "16", "-g", "12", "-pix_fmt", "yuv420p", str(out)],
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", "fps=2,scale=180:-1,tile=10x3:padding=2:color=white",
         "-frames:v", "1", str(src.with_name(src.stem.replace("-src", "") + "-sheet.jpg"))],
        check=True,
    )
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,nb_frames",
                            "-of", "csv=p=0", str(out)], capture_output=True, text=True, check=True).stdout.strip()
    print(f"{out}: {probe} (w,h,frames), {out.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
