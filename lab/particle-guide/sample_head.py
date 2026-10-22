"""Sample the head scan into N surface points (Int16 xyz, Int8 normal), shuffled so any prefix is a fair subsample; write head.js."""
import base64, json, struct, sys
import numpy as np

glb, out, N = sys.argv[1], sys.argv[2], int(sys.argv[3])
b = open(glb, 'rb').read()
n = struct.unpack('<I', b[12:16])[0]
j = json.loads(b[20:20 + n])
binstart = 20 + n + 8


def acc(i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    off = binstart + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    dt = {5123: np.uint16, 5125: np.uint32, 5126: np.float32}[a['componentType']]
    k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
    return np.frombuffer(b, dt, a['count'] * k, off).reshape(-1, k).astype(np.float64)


tri = acc(0).reshape(-1, 3).astype(int)
pos, nrm = acc(1), acc(2)
pos = pos / np.abs(pos).max()
A, B, C = pos[tri[:, 0]], pos[tri[:, 1]], pos[tri[:, 2]]
area = 0.5 * np.linalg.norm(np.cross(B - A, C - A), axis=1)
cen = (A + B + C) / 3
fn = nrm[tri].mean(1)
fn /= np.linalg.norm(fn, axis=1, keepdims=True)

# Area keeps the surface even; the per-triangle share leans on the scan's dense mesh, which is where the features are.
w = 0.86 * area / area.sum() + 0.14 / len(tri)
y = cen[:, 1]
w *= np.where(y > -0.08, 1.0, np.where(y > -0.33, 0.7, 0.42))
w *= np.clip((y + 0.93) / 0.45, 0.08, 1.0)
w *= np.where(fn[:, 2] < -0.2, 0.55, 1.0)
w *= np.where((y > -0.05) & (fn[:, 2] > 0.35), 1.5, 1.0)
w /= w.sum()

rng = np.random.default_rng(7)
pick = rng.choice(len(tri), N, p=w)
r1, r2 = rng.random(N), rng.random(N)
s = np.sqrt(r1)
u, v = 1 - s, s * (1 - r2)
P = u[:, None] * A[pick] + v[:, None] * B[pick] + (1 - u - v)[:, None] * C[pick]
Nn = fn[pick]
order = rng.permutation(N)
P, Nn = P[order], Nn[order]
pi = np.round(P * 32767).astype('<i2')
ni = np.round(Nn * 127).astype('i1')
js = 'window.HEAD={n:%d,pos:"%s",nrm:"%s"};\n' % (N, base64.b64encode(pi.tobytes()).decode(), base64.b64encode(ni.tobytes()).decode())
open(out, 'w').write(js)
print('points', N, 'bytes', len(js), 'y range', P[:, 1].min().round(3), P[:, 1].max().round(3), 'z range', P[:, 2].min().round(3), P[:, 2].max().round(3))
