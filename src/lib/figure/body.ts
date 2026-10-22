/* His body as dots, drawn from simple shapes: a floating head with a dark
   visor, two eyes of light, an egg of a body, two arms that hover beside it.
   Parts: 0 head, 1 visor rim, 2 left eye, 3 right eye, 4 body, 5 left arm,
   6 right arm. The head (0-3) never leaves; the body (4-6) is what he shows with. */

export const HEAD = { cy: 0.55, rx: 0.46, ry: 0.37, rz: 0.43 };
export const VIS = { cy: 0.54, rx: 0.37, ry: 0.235 };
const BODY_TOP = 0.14;
const BODY_LEN = 1.08;

export type Body = {
  n: number;
  /* Dots in the body (parts 4-6), and each one's index among them. */
  nb: number;
  rb: Int32Array;
  part: Uint8Array;
  pos: Float32Array;
  nrm: Float32Array;
  /* An eye dot's fixed place inside its eye: angle and radius. */
  eye: Float32Array;
  rate: Float32Array;
  delay: Float32Array;
  seed: Float32Array;
  dust: Float32Array;
};

export const headZ = (x: number, y: number) => {
  const q = 1 - (x / HEAD.rx) ** 2 - ((y - HEAD.cy) / HEAD.ry) ** 2;
  return q > 0 ? HEAD.rz * Math.sqrt(q) : 0;
};

const bodyR = (t: number) =>
  t < 0.18 ? 0.35 * Math.sqrt(Math.max(0, 1 - ((0.18 - t) / 0.18) ** 2)) : 0.35 * Math.max(0.02, 1 - ((t - 0.18) / 0.82) ** 1.7);

export function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function makeBody(n: number): Body {
  const rnd = rng(2718);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.283185 * rnd());
  const inVisor = (x: number, y: number, z: number) => z > 0 && (x / VIS.rx) ** 2 + ((y - VIS.cy) / VIS.ry) ** 2 < 1;
  const b: Body = {
    n, nb: 0, rb: new Int32Array(n), part: new Uint8Array(n), pos: new Float32Array(n * 3), nrm: new Float32Array(n * 3),
    eye: new Float32Array(n * 2), rate: new Float32Array(n), delay: new Float32Array(n), seed: new Float32Array(n), dust: new Float32Array(n * 3),
  };
  for (let i = 0; i < n; i++) {
    const m = i % 100;
    const p = m < 5 ? 2 : m < 10 ? 3 : m < 16 ? 1 : m < 46 ? 0 : m < 86 ? 4 : m < 93 ? 5 : 6;
    let x = 0, y = 0, z = 0, nx = 0, ny = 0, nz = 1;
    b.part[i] = p;
    b.rb[i] = p >= 4 ? b.nb++ : -1;
    if (p === 0) {
      do {
        const a = gauss(), c = gauss(), d = gauss(), l = Math.hypot(a, c, d);
        x = (a / l) * HEAD.rx; y = HEAD.cy + (c / l) * HEAD.ry; z = (d / l) * HEAD.rz;
      } while (inVisor(x, y, z));
      nx = x / HEAD.rx ** 2; ny = (y - HEAD.cy) / HEAD.ry ** 2; nz = z / HEAD.rz ** 2;
    } else if (p === 1) {
      const th = rnd() * 6.283185;
      x = VIS.rx * Math.cos(th) * (1 + 0.025 * rnd()); y = VIS.cy + VIS.ry * Math.sin(th) * (1 + 0.025 * rnd()); z = headZ(x, y) + 0.004;
      nx = x / HEAD.rx ** 2; ny = (y - HEAD.cy) / HEAD.ry ** 2; nz = z / HEAD.rz ** 2;
    } else if (p === 2 || p === 3) {
      b.eye[i * 2] = rnd() * 6.283185; b.eye[i * 2 + 1] = Math.sqrt(rnd());
    } else if (p === 4) {
      let t = rnd();
      while (rnd() * 0.35 > bodyR(t)) t = rnd();
      const r = bodyR(t), ph = rnd() * 6.283185, dr = (bodyR(Math.min(1, t + 0.01)) - bodyR(Math.max(0, t - 0.01))) / 0.02;
      x = r * Math.cos(ph); z = r * Math.sin(ph) * 0.92; y = BODY_TOP - t * BODY_LEN;
      nx = Math.cos(ph); ny = dr / BODY_LEN; nz = Math.sin(ph);
    } else {
      const s = p === 5 ? -1 : 1, a = gauss(), c = gauss(), d = gauss(), l = Math.hypot(a, c, d);
      const lx = (a / l) * 0.07, ly = (c / l) * 0.3, lz = (d / l) * 0.08, ang = -s * 0.13;
      x = s * 0.47 + lx * Math.cos(ang) - ly * Math.sin(ang); y = -0.2 + lx * Math.sin(ang) + ly * Math.cos(ang); z = 0.02 + lz;
      nx = a / l / 0.07; ny = c / l / 0.3; nz = d / l / 0.08;
    }
    const nl = Math.hypot(nx, ny, nz) || 1;
    b.pos.set([x, y, z], i * 3);
    b.nrm.set([nx / nl, ny / nl, nz / nl], i * 3);
    b.rate[i] = 2 + rnd() * 2.6;
    b.seed[i] = rnd();
    /* He wakes eyes first, then the visor, the head, the arms and the body. */
    b.delay[i] = p === 2 || p === 3 ? 0.05 + rnd() * 0.3 : p === 1 ? 0.35 + rnd() * 0.3 : p === 0 ? 0.5 + rnd() * 0.6 : 0.8 + rnd() * 0.9;
    const u = rnd() * 2 - 1, th = rnd() * 6.283185, r = 0.7 + Math.pow(rnd(), 0.7) * 1.6, q = Math.sqrt(1 - u * u);
    b.dust.set([q * Math.cos(th) * r * 1.25, u * r * 0.85, q * Math.sin(th) * r * 0.6], i * 3);
  }
  return b;
}

export type Eyes = "open" | "wide" | "happy" | "blink" | "line" | "sad" | "sparkle" | "star" | "think" | "scan" | "wink" | "dots" | "cross" | "spiral";

/* Where an eye dot sits for each look, around its eye's centre. side: -1 left, 1 right; t in seconds. */
export function eyeAt(expr: Eyes, a: number, r: number, side: number, t: number): [number, number] {
  const c = Math.cos(a), s = Math.sin(a);
  switch (expr) {
    case "wide": return [c * r * 0.1, s * r * 0.13];
    case "happy": { const f = a / 2, R = 0.072 + (r - 0.5) * 0.022; return [Math.cos(f) * R, Math.sin(f) * R - 0.03]; }
    case "blink": return [c * r * 0.095, s * r * 0.01];
    case "line": return [c * r * 0.16, s * r * 0.008];
    case "sad": { const u = c * r * 0.085, v = s * r * 0.095; return [u, Math.min(v, 0.035 - 0.5 * u * side) - 0.01]; }
    /* Annoyed: the inner ends pressed down. */
    case "cross": { const u = c * r * 0.085, v = s * r * 0.095; return [u, Math.min(v, 0.02 + 0.6 * u * side) - 0.005]; }
    case "sparkle": { const R = 0.12 * (0.28 + 0.72 * Math.abs(Math.cos(2 * a)) ** 5); return [c * r * R, s * r * R]; }
    case "star": { const R = 0.105 * (0.42 + 0.58 * Math.abs(Math.cos(2.5 * (a - Math.PI / 2))) ** 2.5); return [c * r * R, s * r * R]; }
    case "think": return [c * r * 0.07, s * r * (side > 0 ? 0.045 : 0.085)];
    case "scan": return [c * r * 0.055, s * r * 0.07];
    case "wink": return side < 0 ? [c * r * 0.095, s * r * 0.01] : eyeAt("happy", a, r, side, t);
    /* Dizzy: each eye a turning spiral. */
    case "spiral": { const k = a / 6.283185, th = k * 3 * 6.283185 + t * 7 * side, R = 0.012 + k * 0.09; return [Math.cos(th) * R, Math.sin(th) * R]; }
    default: return [c * r * 0.085, s * r * 0.105];
  }
}
