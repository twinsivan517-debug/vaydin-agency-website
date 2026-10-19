"""Her first words, lying down: lips for the waking clip's head.

Wav2Lip paints the mouth at the bottom of the face box, so on her lying face
(3.5 to 5.0 s, head on her arm) it lands on her cheek. Here each band of the
head is turned upright first: frames 84-120 by -60 degrees, frames 120-180
(rising, sitting) by 0, run through the model against the greeting's sound
for that band, turned back, and only the mouth region of the face box is
blended into the untouched frame. The result is a new 361-frame source clip
with the head's lips in place and the standing tail as generated; the tail's
lips are then made as before by scripts/opener_lipsync.py --src on it.

    python scripts/opener_lying.py                 # writes media/clips/guide-opener4-src.mp4
    python scripts/opener_lying.py --quick         # three frames of the first band only: proves the chain
    python scripts/opener_lying.py --out L:/lipsync/out/try.mp4
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np

from lipsync import FPS, PYTHON, WAV2LIP, WEIGHTS, hold_lock, release_lock

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "media" / "clips" / "guide-opener3-src.mp4"
OUT = ROOT / "media" / "clips" / "guide-opener4-src.mp4"
AUDIO = ROOT / "public" / "guide" / "opener.mp4"
FRAMES = 361
# (first frame, last frame exclusive, degrees counter-clockwise to stand her face up)
BANDS = [(84, 120, -60), (120, 180, 0)]
GREEN = (0, 254, 0)


def ff(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def read_frames(path: Path, first: int, last: int) -> list[np.ndarray]:
    cap = cv2.VideoCapture(str(path))
    cap.set(cv2.CAP_PROP_POS_FRAMES, first)
    out = []
    for _ in range(last - first):
        ok, f = cap.read()
        if not ok:
            break
        out.append(f)
    cap.release()
    return out


def turn(frame: np.ndarray, angle: float, size: int) -> np.ndarray:
    """The frame on a square canvas of `size`, turned by `angle`."""
    h, w = frame.shape[:2]
    canvas = np.full((size, size, 3), GREEN, np.uint8)
    y0, x0 = (size - h) // 2, (size - w) // 2
    canvas[y0 : y0 + h, x0 : x0 + w] = frame
    m = cv2.getRotationMatrix2D((size / 2, size / 2), angle, 1.0)
    return cv2.warpAffine(canvas, m, (size, size), flags=cv2.INTER_CUBIC, borderValue=GREEN)


def turn_back(img: np.ndarray, angle: float, h: int, w: int) -> np.ndarray:
    size = img.shape[0]
    m = cv2.getRotationMatrix2D((size / 2, size / 2), -angle, 1.0)
    back = cv2.warpAffine(img, m, (size, size), flags=cv2.INTER_CUBIC, borderValue=GREEN)
    y0, x0 = (size - h) // 2, (size - w) // 2
    return back[y0 : y0 + h, x0 : x0 + w]


def write_clip(frames: list[np.ndarray], path: Path) -> None:
    h, w = frames[0].shape[:2]
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", str(path)], stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    if p.wait():
        raise RuntimeError(f"ffmpeg failed writing {path}")


def mouth_mask(turned: np.ndarray, box: tuple[int, int, int, int]) -> np.ndarray:
    """1 over the lower part of the face box, feathered to 0 outside."""
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    m = np.zeros(turned.shape[:2], np.float32)
    cv2.rectangle(m, (int(x1 - 0.15 * w), int(y1 + 0.45 * h)), (int(x2 + 0.15 * w), int(y2 + 0.2 * h)), 1.0, -1)
    return cv2.GaussianBlur(m, (0, 0), 0.12 * w)[..., None]


def face_boxes(turned: list[np.ndarray], work: Path) -> list[tuple[int, int, int, int]]:
    """The model's own detector on every frame, in the turned space: she moves
    while she rises, so the mouth mask must follow her. A frame without a
    face takes its neighbour's box."""
    folder = work / "det"
    folder.mkdir(exist_ok=True)
    for i, f in enumerate(turned):
        cv2.imwrite(str(folder / f"{i:04d}.png"), f)
    code = ("import sys,cv2,numpy as np,pathlib;sys.path.insert(0,sys.argv[1]);import face_detection as fd;"
            "d=fd.FaceAlignment(fd.LandmarksType._2D,flip_input=False,device='cpu');"
            "fs=sorted(pathlib.Path(sys.argv[2]).glob('*.png'))\n"
            "for i in range(0,len(fs),4):\n"
            "  for b in d.get_detections_for_batch(np.array([cv2.imread(str(p)) for p in fs[i:i+4]])):\n"
            "    print('none' if b is None else ' '.join(str(int(v)) for v in b),flush=True)")
    r = subprocess.run([str(PYTHON), "-c", code, str(WAV2LIP), str(folder)], cwd=WAV2LIP, capture_output=True, text=True, check=True)
    raw = [None if line.strip() == "none" else tuple(int(v) for v in line.split()) for line in r.stdout.strip().splitlines()]
    if len(raw) != len(turned):
        raise RuntimeError(f"detector answered for {len(raw)} of {len(turned)} frames")
    boxes: list = list(raw)
    for i in range(len(boxes)):
        if boxes[i] is None:
            boxes[i] = next((b for b in boxes[i + 1 :] if b), None) or next((b for b in reversed(boxes[:i]) if b), None)
    if any(b is None for b in boxes):
        raise RuntimeError("no face in the whole band")
    return boxes


def band(src_frames: list[np.ndarray], first: int, angle: float, work: Path, audio_wav: Path) -> list[np.ndarray]:
    h, w = src_frames[0].shape[:2]
    size = max(h, w)
    turned = [turn(f, angle, size) for f in src_frames]
    face, wav, raw = work / f"b{first}.mp4", work / f"b{first}.wav", work / f"b{first}.raw.mp4"
    write_clip(turned, face)
    n = len(turned)
    ff("-i", str(audio_wav), "-af", f"atrim=start={first / FPS:.6f},asetpts=PTS-STARTPTS,apad=pad_dur=2,atrim=end={n / FPS + 0.3:.6f}", str(wav))
    subprocess.run([str(PYTHON), "inference.py", "--checkpoint_path", str(WEIGHTS), "--face", str(face), "--audio", str(wav),
                    "--outfile", str(raw), "--face_det_batch_size", "4", "--wav2lip_batch_size", "32"],
                   cwd=WAV2LIP, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    made = read_frames(raw, 0, n)
    if len(made) != n:
        raise RuntimeError(f"band {first}: model gave {len(made)} frames, wanted {n}")
    boxes = face_boxes(turned, work)
    out = []
    for orig, m, t, box in zip(src_frames, made, turned, boxes):
        back = turn_back(m, angle, h, w)
        mask = mouth_mask(t, box)
        mk = turn_back((mask * 255).astype(np.uint8), angle, h, w).astype(np.float32)[..., None] / 255
        out.append((orig * (1 - mk) + back * mk).astype(np.uint8))
    return out


def main(argv: list[str]) -> int:
    quick = "--quick" in argv
    out = Path(argv[argv.index("--out") + 1]) if "--out" in argv else OUT
    for p in (PYTHON, WAV2LIP / "inference.py", WEIGHTS, SRC, AUDIO):
        if not p.exists():
            print(f"missing: {p}", file=sys.stderr)
            return 2
    frames = read_frames(SRC, 0, FRAMES)
    if len(frames) != FRAMES:
        print(f"{SRC}: {len(frames)} frames, want {FRAMES}", file=sys.stderr)
        return 2
    bands = [(BANDS[0][0], BANDS[0][0] + 3, BANDS[0][2])] if quick else BANDS
    hold_lock()
    try:
        with tempfile.TemporaryDirectory() as tmp:
            work = Path(tmp)
            wav = work / "full.wav"
            ff("-i", str(AUDIO), "-vn", "-ar", "16000", "-ac", "1", str(wav))
            for first, last, angle in bands:
                frames[first:last] = band(frames[first:last], first, angle, work, wav)
                print(f"band {first}-{last} at {angle:+d}: done", flush=True)
            write_clip(frames, out)
    finally:
        release_lock()
    n = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries", "stream=nb_read_frames",
                        "-of", "csv=p=0", str(out)], capture_output=True, text=True, check=True).stdout.strip()
    print(f"{out}: {n} frames (want {FRAMES}), {out.stat().st_size // 1024} KB")
    return 0 if n == str(FRAMES) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
