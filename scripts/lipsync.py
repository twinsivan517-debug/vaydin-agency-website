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
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = ROOT / "public" / "voice"
BASE = ROOT / "media" / "guide" / "base-loop.mp4"
OUT = ROOT / "public" / "guide" / "lines"
MANIFEST = OUT / "manifest.json"
LAB = Path(os.environ.get("LIPSYNC_LAB") or ("L:/lipsync" if Path("L:/lipsync").exists() else Path.home() / "lab" / "lipsync"))
FPS = 24
PYTHON = LAB / "venv" / "Scripts" / "python.exe"
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


def stale(ids: list[str], manifest: dict, base_sha: str) -> list[str]:
    out = []
    for i in ids:
        want = {"audio": sha(VOICE / f"{i}.mp3"), "base": base_sha, "model": MODEL}
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


def run_one(i: str, work: Path) -> float:
    wav = work / f"{i}.wav"
    raw = work / f"{i}.raw.mp4"
    final = OUT / f"{i}.mp4"
    t0 = time.time()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(VOICE / f"{i}.mp3"), "-ar", "16000", "-ac", "1", str(wav)], check=True)
    subprocess.run(
        [str(PYTHON), "inference.py", "--checkpoint_path", str(WEIGHTS), "--face", str(BASE), "--audio", str(wav),
         "--outfile", str(raw), "--face_det_batch_size", "4", "--wav2lip_batch_size", "32"],
        cwd=WAV2LIP, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-i", str(VOICE / f"{i}.mp3"), "-map", "0:v:0", "-map", "1:a:0",
         "-c:v", "libx264", "-crf", "23", "-preset", "medium", "-g", "12", "-pix_fmt", "yuv420p", "-r", "24",
         "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", "-shortest", str(final)],
        check=True,
    )
    return time.time() - t0


def main(argv: list[str]) -> int:
    check = "--check" in argv
    wanted = [a for a in argv if not a.startswith("--")]
    for p in (PYTHON, WAV2LIP / "inference.py", WEIGHTS, BASE):
        if not p.exists():
            print(f"missing: {p}", file=sys.stderr)
            return 2
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    base_sha = sha(BASE)
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
                manifest[i] = {"audio": sha(VOICE / f"{i}.mp3"), "base": base_sha, "model": MODEL}
                MANIFEST.write_text(json.dumps(manifest, indent=1, sort_keys=True) + "\n")
                size = (OUT / f"{i}.mp4").stat().st_size // 1024
                print(f"[{n}/{len(ids)}] {i}: {took:.0f} s, {size} KB", flush=True)
    finally:
        release_lock()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
