"""The flat-green gate for a generated clip: can every frame be keyed?

A frame is keyable when the pixels that are not her are pure key green. For
each frame the script counts the pixels that are key green (green well above
red and blue) and the pixels that are neither green nor plausibly her figure
(bright, low-saturation wash: the generator lighting the room, or a drawn
object), leaving out her outline: the largest connected shape of her dark
parts with its holes filled, since her cream top is bright and grey-ish too. It fails the clip when any frame's wash exceeds 2 % of the frame,
and prints the worst frame. Runs in the lip-sync lab's Python (OpenCV).

    L:/lipsync/venv/Scripts/python.exe scripts/green_gate.py media/clips/guide-w1-src.mp4
"""
import sys

import cv2
import numpy as np

WASH = 0.02


def main(path: str) -> int:
    cap = cv2.VideoCapture(path)
    worst = (0.0, -1)
    n = 0
    while True:
        ok, im = cap.read()
        if not ok:
            break
        b, g, r = (im[:, :, i].astype(int) for i in range(3))
        green = (g - np.maximum(r, b)) > 60
        bright = (np.minimum(np.minimum(r, g), b) > 170) & ((np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)) < 60)
        # Her cream top is bright and grey-ish too: whatever is joined to her
        # largest connected shape is her, not wash.
        # Her seed is what is neither green nor wash-like (suit, hair, skin);
        # its largest connected shape with the holes filled is her outline.
        count, labels, stats, _ = cv2.connectedComponentsWithStats((~green & ~bright).astype(np.uint8), connectivity=8)
        her = np.zeros(green.shape, np.uint8)
        if count > 1:
            her = (labels == (1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA])))).astype(np.uint8)
            outside = (1 - her).copy()
            hh, ww = her.shape
            flood = np.zeros((hh + 2, ww + 2), np.uint8)
            for seed in ((0, 0), (ww - 1, 0), (0, hh - 1), (ww - 1, hh - 1)):
                if outside[seed[1], seed[0]]:
                    cv2.floodFill(outside, flood, seed, 2)
            her = (outside != 2).astype(np.uint8)
        wash = float((bright & ~green & (her == 0)).mean())
        if wash > worst[0]:
            worst = (wash, n)
        n += 1
    status = "PASS" if worst[0] <= WASH else "FAIL"
    print(f"{status} {path}: {n} frames, worst wash {worst[0] * 100:.1f} % at frame {worst[1]} (limit {WASH * 100:.0f} %)")
    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
