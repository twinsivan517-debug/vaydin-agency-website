"""Her mouth sealed in a silent loop: the generator mouths words on its own.

The idle and talk loops came back from the generator with her lips moving as
if talking, though no sound plays under them. A closed-mouth patch is taken
from a reference frame (the wake-up clip's last frame, her standing still) and
pasted over her mouth in every frame, placed per frame by matching a ring of
nose, cheeks and chin around the mouth, feathered at its edge. Frames leave
through ffmpeg at crf 12. The lip-sync then draws a closed mouth on silence
for every line made over the sealed base.

    L:/lipsync/venv/Scripts/python.exe scripts/seal.py media/guide/base-loop.mp4 \
        media/clips/guide-opener3-src.mp4 240 L:/lipsync/out/base-sealed.mp4
"""
import subprocess
import sys

import cv2
import numpy as np

# Boxes in the 1172x2084 frame where the loops have her: the mouth patch and
# the ring that places it (the mouth is cut out of the ring).
MX, MY, MW, MH = 500, 365, 180, 100
RX, RY, RW, RH = 400, 250, 380, 300
SEARCH = 40


def main(src: str, ref_path: str, ref_n: int, out: str) -> int:
    c = cv2.VideoCapture(ref_path)
    c.set(cv2.CAP_PROP_POS_FRAMES, ref_n)
    ok, ref = c.read()
    c.release()
    tmpl = cv2.cvtColor(ref[RY:RY + RH, RX:RX + RW], cv2.COLOR_BGR2GRAY)
    ring = np.ones((RH, RW), np.uint8)
    ring[MY - RY:MY - RY + MH, MX - RX:MX - RX + MW] = 0
    patch = ref[MY:MY + MH, MX:MX + MW].astype(np.float32)
    mask = np.zeros((MH, MW), np.float32)
    cv2.ellipse(mask, (MW // 2, MH // 2), (MW // 2 - 8, MH // 2 - 6), 0, 0, 360, 1, -1)
    mask = cv2.GaussianBlur(mask, (31, 31), 0)[..., None]
    cap = cv2.VideoCapture(src)
    fps, w, h = cap.get(cv2.CAP_PROP_FPS), int(cap.get(3)), int(cap.get(4))
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", f"{fps:g}",
                           "-i", "-", "-c:v", "libx264", "-crf", "12", "-g", "12", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    offs = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        sx, sy = RX - SEARCH, RY - SEARCH
        r = cv2.matchTemplate(g[sy:RY + RH + SEARCH, sx:RX + RW + SEARCH], tmpl, cv2.TM_CCORR_NORMED, mask=ring)
        _, _, _, (px, py) = cv2.minMaxLoc(r)
        dx, dy = sx + px - RX, sy + py - RY
        offs.append((dx, dy))
        x, y = MX + dx, MY + dy
        f[y:y + MH, x:x + MW] = (patch * mask + f[y:y + MH, x:x + MW].astype(np.float32) * (1 - mask)).astype(np.uint8)
        ff.stdin.write(f.tobytes())
    ff.stdin.close()
    ff.wait()
    o = np.array(offs)
    print(f"{out}: {len(offs)} frames, mouth moved x {o[:, 0].min()}..{o[:, 0].max()} y {o[:, 1].min()}..{o[:, 1].max()}")
    return 0 if ff.returncode == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]))
