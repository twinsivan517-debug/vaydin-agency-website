"""Turn concept pictures into N dots each: where the metal is lit, dots gather; the white visor light is marked as core. Writes concepts.js."""
import base64, sys
import numpy as np
from PIL import Image, ImageFilter

out, N, paths = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
rng = np.random.default_rng(11)
items = []
for p in paths:
    im = Image.open(p).convert('RGB')
    im.thumbnail((600, 800))
    a = np.asarray(im).astype(np.float32) / 255
    h, w, _ = a.shape
    mx, mn = a.max(2), a.min(2)
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    # The background is a plain dark charcoal: take its level from the corners and keep only what stands above it.
    corners = np.concatenate([lum[:20, :20].ravel(), lum[:20, -20:].ravel()])
    floor = np.percentile(corners, 95) + 0.06
    weight = np.clip((lum - floor) / (1 - floor), 0, 1) ** 1.3
    weight[int(h * 0.97):] = 0
    core = (sat < 0.22) & (lum > 0.82)
    # Light stays only in the visor (a wide row) and a round core in the chest: no vertical seam, so no cross.
    rows = core.sum(1)
    visor = np.zeros_like(core); visor[rows > w * 0.06] = True
    low = core.copy(); low[: int(h * 0.62)] = False
    keep = visor.copy()
    if low.sum() > 50:
        ys, xs = np.nonzero(low)
        cy0, cx0 = np.median(ys), np.median(xs)
        yy, xx = np.mgrid[0:h, 0:w]
        keep |= (yy - cy0) ** 2 + (xx - cx0) ** 2 < (w * 0.045) ** 2
    seam = core & ~keep
    core &= keep
    if seam.sum() > 50:
        # The seam's bright metal would still draw a cross in gold: thin the dots along it.
        ys, xs = np.nonzero(seam)
        band = np.zeros_like(seam); band[ys.min():ys.max() + 1, int(np.median(xs) - w * 0.018):int(np.median(xs) + w * 0.018) + 1] = True
        weight[band & ~visor & ~keep] *= 0.1
    weight[core] *= 3
    prob = weight.ravel() / weight.sum()
    pick = rng.choice(h * w, N, p=prob)
    py, px = np.divmod(pick, w)
    relief = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))).astype(np.float32) / 255
    s = max(w, h) / 2
    x = (px + rng.random(N) - w / 2) / s
    y = -(py + rng.random(N) - h / 2) / s
    z = relief[py, px] * 0.32 - 0.1
    c = core[py, px].astype(np.uint8)
    q = np.round(np.stack([x, y, z], 1) * 32767).clip(-32767, 32767).astype('<i2')
    items.append('{pos:"%s",core:"%s"}' % (base64.b64encode(q.tobytes()).decode(), base64.b64encode(c.tobytes()).decode()))
    print(p, 'core dots', int(c.sum()), 'floor', round(float(floor), 3))
open(out, 'w').write('window.CONCEPTS={n:%d,items:[%s]};\n' % (N, ','.join(items)))
