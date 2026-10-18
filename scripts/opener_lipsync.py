"""The greeting's lips: the standing part of the waking clip, lip-synced.

The generator's waking clip (media/clips/guide-opener2-src.mp4, 361 frames at
24 fps) barely moves her mouth once she stands. From the join frame on, the
clip goes through Wav2Lip against the greeting's own sound; the head stays as
generated. The two meet in a short blend so the mouth closes instead of
snapping. Frame count and length are unchanged, so the bulb's second and the
page's timings hold. The sound is copied from the current public/guide/
opener.mp4 when it exists (the greeting as the clip hears it), else encoded
from media/voice/opener2.mp3. The lab is the one scripts/lipsync.py uses.

    python scripts/opener_lipsync.py                       # join 7.5 s, blend 6 frames
    python scripts/opener_lipsync.py --join 8.0 --blend 0  # the 2026-10-17 cut
    python scripts/opener_lipsync.py --out L:/lipsync/out/try.mp4
    python scripts/opener_lipsync.py --src media/clips/guide-opener3-src.mp4  # another
                                                        # waking clip of 361 frames
    python scripts/opener_lipsync.py --end 11.6   # frames after the last word come
                                                  # from the clip, not the model
    python scripts/opener_lipsync.py --hum 7.54 8.08   # her own "Mmm" (2.62-3.22 s)
                                                        # under that silent window, so
                                                        # the model draws closed lips
                                                        # there; the sound is unchanged

On silence the model redraws the mouth it was given, so a silent window keeps
the generator's mouth whatever the join; --hum is the lever for that.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from lipsync import FPS, PYTHON, WAV2LIP, WEIGHTS, hold_lock, release_lock

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "media" / "clips" / "guide-opener2-src.mp4"
MP3 = ROOT / "media" / "voice" / "opener2.mp3"
WEB = ROOT / "public" / "guide" / "opener.mp4"
FRAMES = 361


def arg(argv: list[str], name: str, default: str) -> str:
    return argv[argv.index(name) + 1] if name in argv else default


def ff(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def main(argv: list[str]) -> int:
    src = Path(arg(argv, "--src", str(SRC)))
    join = round(float(arg(argv, "--join", "7.5")) * FPS)
    blend = int(arg(argv, "--blend", "6"))
    end = round(float(arg(argv, "--end", "0")) * FPS)  # 0: the model to the last frame
    out = Path(arg(argv, "--out", str(WEB)))
    audio_from = WEB if WEB.exists() else MP3
    for p in (PYTHON, WAV2LIP / "inference.py", WEIGHTS, src, audio_from):
        if not p.exists():
            print(f"missing: {p}", file=sys.stderr)
            return 2
    tail = FRAMES - join
    hold_lock()
    try:
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp)
            seg, wav, raw = work / "seg.mp4", work / "seg.wav", work / "seg.raw.mp4"
            # The standing part, lossless enough; its sound padded to its own length.
            ff("-i", str(src), "-vf", f"select=gte(n\,{join}),setpts=N/{FPS}/TB", "-r", str(FPS), "-an",
               "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", str(seg))
            # A seek with -ss lands short by a few ms; the trim chain is exact.
            ff("-i", str(audio_from), "-vn", "-ar", "16000", "-ac", "1", str(work / "full.wav"))
            # The model stops a 0.2 s window short of the sound's end: pad past the
            # tail, and the graph below cuts the frames back to the tail's count.
            tail_af = f"atrim=start={join / FPS:.6f},asetpts=PTS-STARTPTS,apad=pad_dur=2,atrim=end={tail / FPS + 0.3:.6f}"
            if "--hum" in argv:
                h0, h1 = (float(x) for x in argv[argv.index("--hum") + 1:argv.index("--hum") + 3])
                ff("-i", str(work / "full.wav"), "-filter_complex",
                   f"[0:a]{tail_af}[t];[0:a]atrim=start=2.62:end={2.62 + h1 - h0:.3f},asetpts=PTS-STARTPTS,"
                   f"adelay={int((h0 - join / FPS) * 1000)}:all=1[h];[t][h]amix=inputs=2:normalize=0:duration=first[a]",
                   "-map", "[a]", str(wav))
            else:
                ff("-i", str(work / "full.wav"), "-af", tail_af, str(wav))
            subprocess.run(
                [str(PYTHON), "inference.py", "--checkpoint_path", str(WEIGHTS), "--face", str(seg), "--audio", str(wav),
                 "--outfile", str(raw), "--face_det_batch_size", "4", "--wav2lip_batch_size", "32"],
                cwd=WAV2LIP, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            # Head (the generator's frames up to the join plus the blend) meets the tail.
            graph = (
                f"[0:v]select=lt(n\,{join + blend}),setpts=N/{FPS}/TB[h];"
                f"[1:v]select=lt(n\,{tail}),setpts=N/{FPS}/TB[t];"
                f"[h][t]xfade=transition=fade:duration={blend / FPS:.6f}:offset={join / FPS:.6f},fps={FPS}[v]"
                if blend else
                f"[0:v]select=lt(n\,{join}),setpts=N/{FPS}/TB[h];[1:v]select=lt(n\,{tail}),setpts=N/{FPS}/TB[t];[h][t]concat=n=2:v=1:a=0[v]"
            )
            if end:
                # The clip is split: one copy feeds the head, the other resumes after the last word.
                graph = "[0:v]split=2[s0][s1];" + graph.replace("[0:v]", "[s0]") + (
                    f";[v]select=lt(n\,{end}),setpts=N/{FPS}/TB[vh];[s1]select=gte(n\,{end}),setpts=N/{FPS}/TB[vt];"
                    f"[vh][vt]concat=n=2:v=1:a=0[v2]")
            ff("-i", str(src), "-i", str(raw), "-i", str(audio_from), "-filter_complex", graph,
               "-map", "[v2]" if end else "[v]", "-map", "2:a:0", "-c:v", "libx264", "-crf", "25", "-preset", "medium", "-g", "12",
               "-pix_fmt", "yuv420p", "-r", str(FPS), *(["-c:a", "copy"] if audio_from == WEB else ["-c:a", "aac", "-ac", "1", "-b:a", "48k"]),
               "-metadata", f"comment=opener_lipsync join={join} blend={blend} end={end} hum={arg(argv, '--hum', 'none')}", "-movflags", "+faststart", str(out))
    finally:
        release_lock()
    n = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames",
                        "-of", "csv=p=0", str(out)], capture_output=True, text=True, check=True).stdout.strip()
    print(f"{out}: {n} frames (want {FRAMES}), join {join} ({join / FPS:.2f} s), blend {blend}, end {end}, {out.stat().st_size // 1024} KB")
    return 0 if n == str(FRAMES) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
