"""One body, many mouths: every voice line becomes a clip of the base loop with
her lips on that line.

For each public/voice/<id>.mp3 (the opener excepted: it has its own clip) run
Wav2Lip over media/guide/base-loop.mp4 and write public/guide/lines/<id>.mp4,
24 fps, a keyframe every 12 frames so the page can seek cheaply, the voice
muxed in. A manifest remembers the sha of each line's audio and of the base;
a line is redone only when one of them changed. The model and its weights live
outside the repo, in the lab named by LIPSYNC_LAB (default L:/lipsync): a venv,
the Wav2Lip checkout, models/wav2lip_gan.pth. Setup is in scripts/LIPSYNC.md.

    python scripts/lipsync.py            # everything stale, chapters first
    python scripts/lipsync.py w1 poke-1  # only these ids
    python scripts/lipsync.py --check    # list stale ids, run nothing
    python scripts/lipsync.py --rest     # end every made gesture clip on her still
    python scripts/lipsync.py --base talk --out L:/lipsync/out w1   # her talk loop
                                         # (hands moving) as the body, written
                                         # elsewhere: a try, not the page's clip
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / "public" / "voice"
BASES = {"idle": ROOT / "media" / "guide" / "base-loop.mp4", "talk": ROOT / "media" / "guide" / "talk-loop.mp4"}
BASE = BASES["idle"]
# A line with a body of its own (a generated gesture clip, padded to 9:16 by
# scripts/body.py) is made over that body instead of the shared loop.
BODIES = ROOT / "media" / "guide" / "bodies"
OUT = ROOT / "public" / "guide" / "lines"
MANIFEST = OUT / "manifest.json"
LAB = Path(os.environ.get("LIPSYNC_LAB") or ("L:/lipsync" if Path("L:/lipsync").exists() else Path.home() / "lab" / "lipsync"))
FPS = 24
PYTHON = LAB / "venv" / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
WAV2LIP = LAB / "Wav2Lip"
WEIGHTS = LAB / "models" / "wav2lip_gan.pth"
MODEL = "wav2lip_gan"
SKIP = {"opener"}
# The chapter lines first: they are what a visitor hears first.
FIRST = ["w1", "02", "07", "08", "g1", "10", "a-need", "a-time", "a-price", "a-cancel"]


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}


def ordered_ids() -> list[str]:
    ids = sorted(p.stem for p in VOICE.glob("*.mp3") if p.stem not in SKIP)
    return [i for i in FIRST if i in ids] + [i for i in ids if i not in FIRST]


def body_of(i: str) -> Path:
    own = BODIES / f"{i}.mp4"
    return own if own.exists() else BASE


def stale(ids: list[str], manifest: dict, base_sha: str) -> list[str]:
    out = []
    for i in ids:
        want = {"audio": sha(VOICE / f"{i}.mp3"), "base": base_sha if body_of(i) == BASE else sha(body_of(i)), "model": MODEL}
        have = manifest.get(i)
        if have != want or not (OUT / f"{i}.mp4").exists():
            out.append(i)
    return out


LOCK = LAB / "running.lock"


def release_lock() -> None:
    LOCK.unlink(missing_ok=True)


def hold_lock() -> None:
    """One run at a time: Wav2Lip writes one shared temp/result.avi in its checkout."""
    while True:
        try:
            fd = os.open(LOCK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            return
        except FileExistsError:
            print(f"waiting: another run holds {LOCK}", flush=True)
            time.sleep(20)


def front_frames(i: str) -> int:
    """A body that turns away: bodies/<id>.front holds how many frames show her
    face. Her lips are synced over those; the rest of the body follows untouched
    and the clip runs the body's full length, the sound ending when it ends."""
    f = BODIES / f"{i}.front"
    return int(f.read_text().strip()) if f.exists() else 0


def frames(path: Path) -> int:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets", "-show_entries",
                          "stream=nb_read_packets", "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return int(out.stdout.strip())


# The longest she takes to reach her still after her voice ends; a longer way is played faster, at most half again.
REST_MAX = 2.0
# Her still: a body frame within this mean grey difference of its first (measured 2026-10-20: the bodies
# rest for frames 0 to about 15 and from about 145 to their end, their last frame about 0.8 off).
STILL_GAP = 2.0


def still_frames(body: Path) -> set[int]:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(body), "-vf", "scale=72:128,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True, check=True).stdout
    f = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 128, 72).astype(np.float32)
    gap = np.abs(f - f[0]).mean(axis=(1, 2))
    return {int(k) for k in np.nonzero(gap <= max(STILL_GAP, 1.5 * gap[-1]))[0]}


def rest_way(n: int, body: Path):
    """How a clip of n frames over this body gets back to her still: None when its
    last frame already is one, else (first, last, backward), the body frames to
    append. Wav2Lip loops the body, so the clip's frame k is the body's k mod its
    length. Forward finishes the gesture, backward undoes it to where it began;
    the shorter wins."""
    still, cycle = still_frames(body), frames(body)
    shown = (n - 1) % cycle
    if shown in still:
        return None
    ahead = min((k for k in still if k > shown), default=cycle - 1)
    behind = max((k for k in still if k < shown), default=0)
    return (shown + 1, ahead, False) if ahead - shown <= shown - behind else (behind, shown - 1, True)


def with_rest(video: Path, body: Path, audio: Path, final: Path, encode: list[str]) -> None:
    """A line on its own body stops where its voice stops, often mid-gesture, and
    the page then crossed to her still with two pairs of arms showing. The way
    back to her still (rest_way), silent, lips closed as the body was made, is
    appended, so the clip ends on it."""
    n = frames(video)
    way = rest_way(n, body)
    count = 0 if way is None else way[1] - way[0] + 1
    speed = min(1.5, max(1.0, count / FPS / REST_MAX))
    total = n / FPS + count / FPS / speed
    if way:
        turn = ",reverse" if way[2] else ""
        tail = (f"[0:v]setpts=PTS-STARTPTS[h];[1:v]trim=start_frame={way[0]}:end_frame={way[1] + 1}{turn},"
                f"setpts=(PTS-STARTPTS)/{speed:.4f}[t];[h][t]concat=n=2:v=1:a=0,fps={FPS}[v]")
    else:
        tail = "[0:v]setpts=PTS-STARTPTS[v]"
    graph = f"{tail};[2:a]apad=whole_dur={total:.4f}[a]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(body), "-i", str(audio),
                    "-filter_complex", graph, "-map", "[v]", "-map", "[a]", *encode, "-t", f"{total:.4f}", str(final)], check=True)


def seconds(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def rest_all() -> int:
    """Ends every gesture clip already made on her still. A clip that runs past
    its voice has its rest already and is left alone; so is one that ends on
    her still. Encoded as the clips are (crf 23): at crf 20 they grew by half."""
    encode = ["-c:v", "libx264", "-crf", "23", "-preset", "medium", "-g", "12", "-pix_fmt", "yuv420p", "-r", str(FPS),
              "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart"]
    with tempfile.TemporaryDirectory() as tmp:
        for i in ordered_ids():
            clip, body = OUT / f"{i}.mp4", body_of(i)
            if body == BASE or front_frames(i) or not clip.exists():
                continue
            if frames(clip) / FPS > seconds(VOICE / f"{i}.mp3") + 0.1 or rest_way(frames(clip), body) is None:
                continue
            before = frames(clip)
            out = Path(tmp) / f"{i}.mp4"
            with_rest(clip, body, VOICE / f"{i}.mp3", out, encode)
            out.replace(clip)
            print(f"{i}: {before} -> {frames(clip)} frames, body {frames(body)}", flush=True)
    return 0


def run_one(i: str, work: Path) -> float:
    wav = work / f"{i}.wav"
    raw = work / f"{i}.raw.mp4"
    final = OUT / f"{i}.mp4"
    body = body_of(i)
    front = front_frames(i)
    t0 = time.time()
    if front:
        face = work / f"{i}.front.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(body), "-vf", f"select=lt(n\,{front}),setpts=N/{FPS}/TB", "-r", str(FPS),
                        "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", str(face)], check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VOICE / f"{i}.mp3"), "-ar", "16000", "-ac", "1",
                        "-af", f"apad=pad_dur=2,atrim=end={front / FPS + 0.3:.6f}", str(wav)], check=True)
    else:
        face = body
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VOICE / f"{i}.mp3"), "-ar", "16000", "-ac", "1", str(wav)], check=True)
    subprocess.run(
        [str(PYTHON), "inference.py", "--checkpoint_path", str(WEIGHTS), "--face", str(face), "--audio", str(wav),
         "--outfile", str(raw), "--face_det_batch_size", "4", "--wav2lip_batch_size", "32"],
        cwd=WAV2LIP, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    encode = ["-c:v", "libx264", "-crf", "23", "-preset", "medium", "-g", "12", "-pix_fmt", "yuv420p", "-r", str(FPS),
              "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart"]
    if front:
        graph = (f"[0:v]select=lt(n\,{front}),setpts=N/{FPS}/TB[h];[1:v]select=gte(n\,{front}),setpts=N/{FPS}/TB[t];"
                 f"[h][t]concat=n=2:v=1:a=0,fps={FPS}[v]")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(body), "-i", str(VOICE / f"{i}.mp3"),
                        "-filter_complex", graph, "-map", "[v]", "-map", "2:a:0", *encode, str(final)], check=True)
    elif body != BASE:
        with_rest(raw, body, VOICE / f"{i}.mp3", final, encode)
    else:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(VOICE / f"{i}.mp3"), "-map", "0:v:0", "-map", "1:a:0",
                        *encode, "-shortest", str(final)], check=True)
    return time.time() - t0


def main(argv: list[str]) -> int:
    global BASE, OUT, MANIFEST
    check = "--check" in argv
    if "--rest" in argv:
        return rest_all()
    if "--base" in argv:
        BASE = BASES[argv[argv.index("--base") + 1]]
    if "--out" in argv:
        OUT = Path(argv[argv.index("--out") + 1])
        MANIFEST = OUT / "manifest.json"
    flags = {"--base", "--out"}
    wanted = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or argv[i - 1] not in flags)]
    for p in (PYTHON, WAV2LIP / "inference.py", WEIGHTS, BASE):
        if not p.exists():
            print(f"missing: {p}", file=sys.stderr)
            return 2
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    base_sha = sha(BASE)
    # The page starts a line on its own body at its first frame and rests on
    # the loop's; it learns which lines those are from this list.
    (OUT / "bodies.json").write_text(json.dumps([i for i in ordered_ids() if body_of(i) != BASE]) + "\n")
    ids = wanted or stale(ordered_ids(), manifest, base_sha)
    if check:
        print("\n".join(ids) if ids else "nothing stale")
        return 0
    print(f"{len(ids)} line(s) to make", flush=True)
    hold_lock()
    try:
        with tempfile.TemporaryDirectory() as tmp:
            for n, i in enumerate(ids, 1):
                took = run_one(i, Path(tmp))
                manifest[i] = {"audio": sha(VOICE / f"{i}.mp3"), "base": base_sha if body_of(i) == BASE else sha(body_of(i)), "model": MODEL}
                MANIFEST.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
                size = (OUT / f"{i}.mp4").stat().st_size // 1024
                print(f"[{n}/{len(ids)}] {i}: {took:.0f} s, {size} KB", flush=True)
    finally:
        release_lock()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
