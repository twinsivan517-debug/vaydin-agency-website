"""Re-key a generated clip whose flat background drifted off key green.

The generator keeps the backdrop flat but lets its colour wander from green to
studio grey over a long clip. Each frame's backdrop is estimated at every pixel:
first from the frame's border, then, once her rough outline is known, painted
in under her from the backdrop around her, so a gradient keys as well as a
flat colour. Every pixel near its own backdrop estimate is painted pure key
green with a soft edge, and pixels already key green stay
so. Of what remains only the largest connected shape, her, is kept, with
its holes filled: her cream top sits near the drifted backdrop's colour and
would otherwise be keyed through. The soft shadow the generator paints
round her on the backdrop is keyed too: darker than the backdrop, colourless. Objects or gradients cannot be rescued this way, only a flat drift; the
green gate judges the result. Runs in the lip-sync lab's Python (OpenCV).

    L:/lipsync/venv/Scripts/python.exe scripts/rekey.py in.mp4 out.mp4
"""
import subprocess
import sys

import cv2
import numpy as np

NEAR, FAR = 22.0, 48.0  # colour distance: at NEAR fully backdrop, at FAR fully her
SHADOW = 80.0  # a colourless pixel darker than the backdrop within this distance is its shadow


def outline(alpha: np.ndarray) -> np.ndarray:
    """Her outline: the largest connected shape of alpha, holes filled, as 0/1."""
    count, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 0.5).astype(np.uint8), connectivity=8)
    if count < 2:
        return np.zeros(alpha.shape, np.uint8)
    her = (labels == (1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])))).astype(np.uint8)
    # A thin gap at the neckline would let the fill leak out of her top: seal it.
    her = cv2.morphologyEx(her, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    outside = 1 - her
    hh, ww = her.shape
    flood = np.zeros((hh + 2, ww + 2), np.uint8)
    for seed in ((0, 0), (ww - 1, 0), (0, hh - 1), (ww - 1, hh - 1)):
        if outside[seed[1], seed[0]] == 1:
            cv2.floodFill(outside, flood, seed, 2)
    return (outside != 2).astype(np.uint8)


def main(src: str, dst: str) -> int:
    cap = cv2.VideoCapture(src)
    w, h, fps = int(cap.get(3)), int(cap.get(4)), cap.get(5)
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", f"{fps:.3f}", "-i", "-",
         "-c:v", "libx264", "-crf", "12", "-g", "12", "-pix_fmt", "yuv420p", dst],
        stdin=subprocess.PIPE,
    )
    m = max(2, int(min(w, h) * 0.02))
    green = np.array([0, 255, 0], dtype=np.float32)
    n = 0
    while True:
        ok, im = cap.read()
        if not ok:
            break
        f = im.astype(np.float32)
        border = np.concatenate([f[:m].reshape(-1, 3), f[-m:].reshape(-1, 3), f[:, :m].reshape(-1, 3), f[:, -m:].reshape(-1, 3)])
        bg = np.median(border, axis=0)
        dist = np.linalg.norm(f - bg, axis=2)
        alpha = np.clip((dist - NEAR) / (FAR - NEAR), 0.0, 1.0)
        # The drift is a gradient, lighter between her legs than at the edge:
        # a first outline from the edge colour, then the backdrop is painted in
        # under her at an eighth of the size, and every pixel is keyed against
        # the backdrop estimated at its own place.
        rough = outline(alpha)
        small = cv2.resize(im, (w // 8, h // 8), interpolation=cv2.INTER_AREA)
        hole = cv2.resize(cv2.dilate(rough, np.ones((25, 25), np.uint8)), (w // 8, h // 8), interpolation=cv2.INTER_NEAREST)
        local = cv2.resize(cv2.inpaint(small, hole, 5, cv2.INPAINT_TELEA), (w, h), interpolation=cv2.INTER_LINEAR).astype(np.float32)
        dist = np.linalg.norm(f - local, axis=2)
        alpha = np.clip((dist - NEAR) / (FAR - NEAR), 0.0, 1.0)
        keyed = (f[:, :, 1] - np.maximum(f[:, :, 0], f[:, :, 2])) > 60
        alpha[keyed] = 0.0
        # The soft shadow the generator paints round her is darker than the
        # backdrop and colourless; her skin is warm. Shadow is backdrop.
        shadow = (f.sum(axis=2) < bg.sum()) & (np.abs(f[:, :, 2] - f[:, :, 0]) < 15) & (dist < SHADOW)
        alpha[shadow] = 0.0
        # She is one connected shape with holes where her cream top sits near
        # the backdrop's colour: keep the largest shape, fill its holes, and
        # drop everything outside it.
        filled = outline(alpha)
        alpha[(filled == 1) & (alpha <= 0.5)] = 1.0
        alpha[cv2.dilate(filled, np.ones((7, 7), np.uint8)) == 0] = 0.0
        out = f * alpha[:, :, None] + green * (1.0 - alpha[:, :, None])
        enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
        n += 1
    enc.stdin.close()
    enc.wait()
    print(f"{dst}: {n} frames re-keyed")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
