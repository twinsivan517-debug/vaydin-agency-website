/* The guide's dots, frame by frame: where each wants to be, eased there, lit.
   He reads the page's one audio element: which recording plays and where it
   is, and the cues for that recording say what his body shows and how his
   eyes look. His head never leaves; his body becomes the shape, rings the
   door, or turns to dust while he sleeps. Pressed, he dents; spun around, he
   gets dizzy. Under reduced motion every dot takes its place at once. */

import { ACCENT, makeShapes, type Shape } from "./shapes";
import { HEAD, VIS, eyeAt, headZ, makeBody, type Eyes } from "./body";

export type Cue = { t0: number; t1: number; shape?: string; door?: number; eyes?: Eyes | "blink" };
export type Cues = Record<string, { dur: number; cues: Cue[]; beats: number[] }>;
export type FigureInput = {
  mode: "sleep" | "opener" | "talk" | "idle";
  audio: HTMLAudioElement | null;
  stage: HTMLElement | null;
  doors: HTMLElement[];
  logo: HTMLElement | null;
};

const EYE_REST: [number, number, number] = [1, 0.906, 0.69];
const EYE_SAD: [number, number, number] = [0.62, 0.72, 1];
/* What his eyes do while each poke line plays: friendly, then less so. */
const POKED: Record<string, Eyes> = { "poke-1": "happy", "poke-2": "wide", "poke-3": "cross", "poke-4": "sad", "poke-5": "cross", "poke-6": "line" };

const VS = `attribute vec3 aPos; attribute vec2 aInfo; uniform mat4 uProj; uniform float uCamZ, uSize; varying float vB, vT;
  void main(){ vec4 p = vec4(aPos.xy, aPos.z - uCamZ, 1.0); gl_Position = uProj * p;
    gl_PointSize = uSize * (uCamZ / -p.z) * (0.62 + 0.55 * clamp(aInfo.x, 0.0, 1.4)); vB = aInfo.x; vT = aInfo.y; }`;
/* vT above 0 mixes in his eye colour, below 0 the colour of the shape he shows. */
const FS = `precision mediump float; varying float vB, vT; uniform vec3 uTint, uShape; uniform float uGain;
  void main(){ vec2 c = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.05, length(c)); a *= a;
    vec3 gold = mix(vec3(0.79, 0.62, 0.27), vec3(1.0, 0.88, 0.55), clamp(vB - 0.35, 0.0, 1.0));
    vec3 col = mix(mix(gold, uTint, clamp(vT, 0.0, 1.0)), uShape, clamp(-vT, 0.0, 1.0));
    float k = clamp(a * vB * uGain, 0.0, 1.0); gl_FragColor = vec4(col * k, k); }`;

/* `onLit` is called once per waking, when his light reaches the logo (at once under reduced motion). */
export function runFigure(cv: HTMLCanvasElement, read: () => FigureInput, reduce: boolean, small: boolean, onLit?: () => void) {
  const gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
  if (!gl) return null;
  const N = small ? 3000 : Math.min(screen.width, screen.height) < 700 ? 8000 : 14000;
  const B = makeBody(N);
  const SH = makeShapes(B.nb);
  let cues: Cues = {};

  const sh = (type: number, src: string) => {
    const o = gl.createShader(type)!;
    gl.shaderSource(o, src);
    gl.compileShader(o);
    return o;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const P = new Float32Array(N * 3), INFO = new Float32Array(N * 2);
  const bufP = gl.createBuffer(), bufI = gl.createBuffer();
  const attr = (name: string, buf: WebGLBuffer | null, size: number, data: Float32Array) => {
    const loc = gl.getAttribLocation(prog, name);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  attr("aPos", bufP, 3, P);
  attr("aInfo", bufI, 2, INFO);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uProj = U("uProj"), uCamZ = U("uCamZ"), uSize = U("uSize"), uTint = U("uTint"), uShape = U("uShape"), uGain = U("uGain");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  const CAMZ = 6, FOV = (30 * Math.PI) / 180, HALF = CAMZ * Math.tan(FOV / 2);
  let W = 0, H = 0, halfW = 1;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth || innerWidth; H = cv.clientHeight || innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    gl!.viewport(0, 0, cv.width, cv.height);
    const asp = W / H, f = 1 / Math.tan(FOV / 2), n = 0.1, fa = 50;
    halfW = HALF * asp;
    gl!.uniformMatrix4fv(uProj, false, new Float32Array([f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + n) / (n - fa), -1, 0, 0, (2 * fa * n) / (n - fa), 0]));
    gl!.uniform1f(uCamZ, CAMZ);
    gl!.uniform1f(uSize, (small ? 2.3 : N < 10000 ? 2.5 : 2.1) * dpr);
    gl!.uniform1f(uGain, N < 10000 ? 0.85 : 0.72);
  }
  resize();
  const toWorld = (sx: number, sy: number): [number, number] => [((sx / W) * 2 - 1) * halfW, (1 - (sy / H) * 2) * HALF];
  const toScreen = (x: number, y: number): [number, number] => [((x / halfW + 1) / 2) * W, ((1 - y / HALF) / 2) * H];

  let cx = 0, cy = 0, S = 1, seen = true, drawn = false;
  const layout = (stage: HTMLElement | null) => {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    seen = r.bottom > 0 && r.top < H && r.width > 0;
    [cx, cy] = toWorld(r.left + r.width / 2, r.top + r.height * 0.52);
    S = Math.min((r.height / H) * HALF, (r.width / W) * 2 * halfW * 0.6);
  };
  layout(read().stage);
  for (let i = 0; i < N; i++) P.set([cx + S * B.dust[i * 3], cy + S * B.dust[i * 3 + 1], S * B.dust[i * 3 + 2]], i * 3);

  /* A door's own rounded outline, walked by length: most of his body rings it, the rest glows around it. */
  const doorTgt = new Float32Array(B.nb * 3), doorHalo = new Uint8Array(B.nb);
  let doorShown = -1;
  function aimDoor(el: HTMLElement, d: number) {
    const r = el.getBoundingClientRect(), K = B.nb;
    const [x0, y1] = toWorld(r.left + 2, r.top + 2), [x1, y0] = toWorld(r.right - 2, r.bottom - 2);
    const w = x1 - x0, h = y1 - y0, px1 = (2 * HALF) / H;
    const ra = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) * px1 || 0, w / 2, h / 2);
    const segs = [[x0 + ra, y1, x1 - ra, y1], [x1 - ra, y1 - ra, Math.PI / 2, 0], [x1, y1 - ra, x1, y0 + ra], [x1 - ra, y0 + ra, 0, -Math.PI / 2],
      [x1 - ra, y0, x0 + ra, y0], [x0 + ra, y0 + ra, -Math.PI / 2, -Math.PI], [x0, y0 + ra, x0, y1 - ra], [x0 + ra, y1 - ra, Math.PI, Math.PI / 2]];
    const len = segs.map((s, k) => (k % 2 ? (ra * Math.PI) / 2 : Math.hypot(s[2] - s[0], s[3] - s[1])));
    const per = len.reduce((a, b) => a + b, 0) || 1;
    for (let j = 0; j < K; j++) {
      let t = ((j + 0.5) / K) * per, k = 0;
      while (k < 7 && t > len[k]) t -= len[k++];
      const s = segs[k], f = len[k] ? t / len[k] : 0, inset = (j % 7) * 0.0015;
      let x: number, y: number;
      if (k % 2) { const a = s[2] + (s[3] - s[2]) * f; x = s[0] + Math.cos(a) * (ra - inset); y = s[1] + Math.sin(a) * (ra - inset); }
      else { x = s[0] + (s[2] - s[0]) * f; y = s[1] + (s[3] - s[1]) * f; }
      doorHalo[j] = j % 5 < 2 ? 1 : 0;
      if (doorHalo[j]) {
        const a = k % 2 ? s[2] + (s[3] - s[2]) * f : [Math.PI / 2, 0, 0, 0, -Math.PI / 2, 0, Math.PI, 0][k], o = ((j * 7919) % 100) / 100;
        x += Math.cos(a) * o * o * 26 * px1; y += Math.sin(a) * o * o * 26 * px1;
      }
      doorTgt.set([x, y, ((j % 11) - 5) * 0.002], j * 3);
    }
    doorShown = d;
  }

  /* Where he was pressed: a dent that heals within a breath. Spinning the pointer around his head makes him dizzy. */
  const holes: { x: number; y: number; t: number }[] = [];
  let spin = 0, lastAng: number | null = null, dizzyUntil = 0, flinch = 0;
  function poke(sx: number, sy: number) {
    const [x, y] = toWorld(sx, sy);
    const hit = Math.abs(x - cx) < S * 0.6 && y < cy + S * 1.0 && y > cy - S * 1.0;
    if (hit) { holes.push({ x, y, t: performance.now() / 1000 }); flinch = 1; }
    return hit;
  }
  let tYaw = 0, tPitch = 0;
  const onMove = (e: PointerEvent) => {
    const [hx, hy] = toScreen(cx, cy + S * HEAD.cy);
    const dx = e.clientX - hx, dy = e.clientY - hy, d = Math.hypot(dx, dy), px = (S / HALF) * H * 0.5;
    if (d > px * 2.6 || d < px * 0.2) { lastAng = null; return; }
    const a = Math.atan2(dy, dx);
    if (lastAng !== null) { let da = a - lastAng; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; spin += da; }
    lastAng = a;
    tYaw = ((e.clientX / W) * 2 - 1) * 0.28; tPitch = ((e.clientY / H) * 2 - 1) * 0.1;
  };
  addEventListener("pointermove", onMove);
  addEventListener("resize", resize);

  let phaseWas = read().mode, wakeT = phaseWas === "sleep" ? -1 : -99, last = performance.now(), raf = 0, nextBlink = 3, blinkUntil = 0;
  let yaw = 0, pitch = 0, roll = 0, lookX = 0, lookY = 0, logoUntil = 0, litFired = false;
  const eyeCol: [number, number, number] = [...EYE_REST], shapeCol: [number, number, number] = [1, 0.85, 0.5];
  const LX = -0.42, LY = 0.5, LZ = 0.76;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000;
    last = now;
    if (cv.clientWidth !== W || cv.clientHeight !== H) resize();
    const inp = read();
    layout(inp.stage);
    if (inp.mode !== "sleep" && phaseWas === "sleep") { wakeT = t; logoUntil = t + 3.6; litFired = false; }
    phaseWas = inp.mode;
    const asleep = inp.mode === "sleep", sinceWake = t - wakeT;
    /* His light lands on the logo about half a second after it leaves him. */
    if (!asleep && !litFired && (reduce || !inp.logo || sinceWake > 1.9)) { litFired = true; onLit?.(); }

    /* What plays, and where in it: the cues of that recording, now. */
    const a = inp.audio, src = a && !a.paused && a.src ? a.src.replace(/^.*\//, "").replace(/\.mp3.*$/, "") : "", lt = a ? a.currentTime : 0;
    const rec = src ? cues[src] : undefined;
    let shape: Shape | null = null, door = -1, cueEyes: Eyes | null = null, beat = 0;
    if (rec) {
      for (const c of rec.cues) if (lt >= c.t0 && lt < c.t1) {
        if (c.shape && SH[c.shape]) shape = SH[c.shape];
        if (c.door !== undefined && inp.doors[c.door]) door = c.door;
        if (c.eyes) cueEyes = c.eyes as Eyes;
      }
      for (const b of rec.beats) if (lt >= b && lt < b + 0.28) beat = 1;
    }
    if (src.startsWith("poke-")) cueEyes = POKED[src] ?? cueEyes;
    if (door >= 0 && door !== doorShown) aimDoor(inp.doors[door], door);
    if (door < 0) doorShown = -1;
    inp.doors.forEach((d, k) => d.classList.toggle("lit", k === door));

    /* The logo moment: right after he wakes, part of his body lights the logo and comes back. */
    const logoOn = !reduce && inp.logo && t < logoUntil && sinceWake > 1.4;
    if (inp.logo) inp.logo.classList.toggle("figure-lit", !!logoOn);

    /* Scrolled away, he is not drawn: a phone does no work for dots nobody sees. */
    if (!seen && !logoOn) {
      if (drawn) { gl!.clear(gl!.COLOR_BUFFER_BIT); drawn = false; }
      raf = requestAnimationFrame(frame);
      return;
    }
    drawn = true;

    spin *= Math.exp(-dt / 1.3);
    if (Math.abs(spin) > 4 * Math.PI && !reduce) { dizzyUntil = t + 3.6; spin = 0; }
    const dizzy = t < dizzyUntil;

    let expr: Eyes = "open";
    if (asleep) expr = "line";
    else if (sinceWake < 1.3) expr = "line";
    else if (sinceWake < 1.45) expr = "blink";
    else if (dizzy) expr = "spiral";
    else if (cueEyes) expr = cueEyes;
    if (!reduce && (expr === "open" || expr === "wide") && !asleep) {
      if (t > nextBlink) { blinkUntil = t + 0.13; nextBlink = t + 2.8 + ((t * 7919) % 3); }
      if (t < blinkUntil || flinch > 0.6) expr = "blink";
    }
    let lx = (tYaw / 0.28) * 0.05, ly = -(tPitch / 0.1) * 0.03;
    if (door >= 0) { const r = inp.doors[door].getBoundingClientRect(); lx = Math.max(-0.07, Math.min(0.07, (toWorld(r.left + r.width / 2, 0)[0] - cx) * 0.06)); ly = -0.05; }
    else if (shape) { lx = 0; ly = -0.045; }
    if (expr === "scan") lx = 0.07 * Math.sin(t * 6);
    if (expr === "think") { lx = 0.05; ly = 0.05; }
    lookX += (lx - lookX) * 0.12; lookY += (ly - lookY) * 0.12;
    const eyeTgt = door >= 0 ? ACCENT[door] : expr === "sad" ? EYE_SAD : expr === "cross" ? ACCENT[0] : shape ? shape.color : EYE_REST;
    for (let k = 0; k < 3; k++) {
      eyeCol[k] += (eyeTgt[k] - eyeCol[k]) * Math.min(1, dt * 4);
      shapeCol[k] += ((door >= 0 ? ACCENT[door][k] : shape ? shape.color[k] : shapeCol[k]) - shapeCol[k]) * Math.min(1, dt * 6);
    }
    gl!.uniform3fv(uTint, eyeCol);
    gl!.uniform3fv(uShape, shapeCol);

    /* His pose: floating, turning toward the visitor, a tilt when he wonders, a wobble when dizzy, a flinch when pressed. */
    const still = reduce ? 0 : 1;
    flinch = Math.max(0, flinch - dt * 3);
    yaw += ((tYaw + 0.1 * Math.sin(t * 0.33) + (dizzy ? 0.35 * Math.sin(t * 5) : 0)) * still - yaw) * 0.05;
    pitch += ((tPitch + 0.04 * Math.sin(t * 0.27) + beat * 0.02 - flinch * 0.25) * still - pitch) * 0.08;
    roll += (((expr === "wide" || expr === "think" ? 0.14 : expr === "happy" || expr === "wink" ? -0.06 : expr === "sad" ? 0.08 : 0) +
      (dizzy ? 0.3 * Math.sin(t * 6) : 0) + 0.03 * Math.sin(t * 0.5)) * still - roll) * 0.06;
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    const bob = 0.035 * Math.sin(t * 1.25) * still, headBob = bob + 0.012 * Math.sin(t * 1.25 + 0.9) * still, armSw = 0.06 * Math.sin(t * 1.1) * still;
    const waving = !reduce && sinceWake > 2.2 && sinceWake < 3.6;
    const wave = waving ? 1 : 0, wa = wave * (2.2 + 0.35 * Math.sin(t * 11)), cwv = Math.cos(wa), swv = Math.sin(wa);
    const eyeH = 1 + beat * 0.18, eyeB = 1.15 + beat * 0.45;
    const isz = S * (shape === SH.skyline ? 0.56 : 0.5), icy = cy + S * (shape === SH.skyline ? -0.45 : -0.4);
    const logoR = inp.logo ? inp.logo.getBoundingClientRect() : null;
    const holeR = S * 0.22;
    while (holes.length && t - holes[0].t > 0.7) holes.shift();

    for (let i = 0; i < N; i++) {
      const i3 = i * 3, p = B.part[i], body = p >= 4, j = B.rb[i];
      let tx: number, ty: number, tz: number, b: number, tint = 0, sp2 = 1;
      const formed = !asleep && (reduce || sinceWake > B.delay[i]);
      if (formed && body && logoOn && logoR && j % 3 === 0) {
        /* Around the logo: a ring of light along its box. */
        const k = j / B.nb, ang = k * Math.PI * 2 * 3 + t * 1.5;
        const [lx2, ly2] = toWorld(logoR.left + logoR.width / 2 + Math.cos(ang) * logoR.width * 0.62, logoR.top + logoR.height / 2 + Math.sin(ang) * logoR.height * 0.9);
        tx = lx2; ty = ly2; tz = 0; b = 0.9; sp2 = 2.2;
      } else if (formed && body && shape) {
        const q = j * 3;
        tx = cx + shape.pts[q] * isz; ty = icy + shape.pts[q + 1] * isz; tz = shape.pts[q + 2] * isz;
        b = 0.8 + 0.1 * Math.sin(t * 4 + B.seed[i] * 40); sp2 = 4.5; tint = -0.75;
      } else if (formed && body && door >= 0 && doorShown >= 0) {
        const q = j * 3;
        tx = doorTgt[q]; ty = doorTgt[q + 1]; tz = doorTgt[q + 2]; b = (doorHalo[j] ? 0.3 : 0.9) + 0.12 * Math.sin(t * 5 + B.seed[i] * 30); sp2 = 1.5;
        tint = -Math.max(0, 1 - Math.hypot(tx - P[i3], ty - P[i3 + 1]) * 2.2);
      } else if (formed) {
        let ox: number, oy: number, oz: number, nx = B.nrm[i3], ny = B.nrm[i3 + 1], nz = B.nrm[i3 + 2];
        const head = p <= 3;
        if (p === 2 || p === 3) {
          const side = p === 2 ? -1 : 1, [u0, v0] = eyeAt(expr, B.eye[i * 2], B.eye[i * 2 + 1], side, t), tilt = side * -0.12;
          ox = (expr === "line" ? side * 0.085 : side * 0.14) + lookX + u0 * Math.cos(tilt) - v0 * eyeH * Math.sin(tilt);
          oy = VIS.cy + 0.005 + lookY + u0 * Math.sin(tilt) + v0 * eyeH * Math.cos(tilt);
          if (expr === "dots") { const k = Math.min(2, Math.floor((B.eye[i * 2] / 6.283185) * 3)), r = B.eye[i * 2 + 1] * 0.03; ox = (k - 1) * 0.11 + Math.cos(B.eye[i * 2] * 7) * r; oy = VIS.cy + Math.sin(B.eye[i * 2] * 7) * r; }
          oz = headZ(ox, oy) + 0.014; nx = 0; ny = 0; nz = 1; sp2 = 6;
        } else { ox = B.pos[i3]; oy = B.pos[i3 + 1]; oz = B.pos[i3 + 2]; }
        if (p === 5) { ox -= armSw * (oy + 0.5) * 0.3; oy += armSw * 0.2; }
        if (p === 6) { const vx = ox - 0.46, vy = oy - 0.08; ox = 0.46 + vx * cwv - vy * swv + armSw * (oy + 0.5) * 0.3 * (1 - wave); oy = 0.08 + vx * swv + vy * cwv; }
        const cY = head ? cyw : Math.cos(yaw * 0.55), sY = head ? syw : Math.sin(yaw * 0.55);
        let hx = ox, hy = oy - (head ? HEAD.cy : 0), hz = oz;
        if (head) { const rx = hx * cr - hy * sr; hy = hx * sr + hy * cr; hx = rx; const py2 = hy * cp - hz * sp; hz = hy * sp + hz * cp; hy = py2; }
        tx = cx + S * (hx * cY + hz * sY); ty = cy + S * (hy + (head ? HEAD.cy + headBob : bob)); tz = S * (-hx * sY + hz * cY);
        if (p === 2 || p === 3) {
          b = eyeB * (0.92 + 0.08 * Math.sin(t * 7 + B.seed[i] * 30)); tint = 1;
          if (expr === "dots") b *= 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - Math.min(2, Math.floor((B.eye[i * 2] / 6.283185) * 3)) * 1.3));
        } else {
          const rnx = nx * cY + nz * sY, rnz = -nx * sY + nz * cY;
          const lam = Math.max(0, rnx * LX + ny * LY + rnz * LZ), rim = Math.pow(1 - Math.min(1, Math.abs(rnz)), 3);
          b = 0.3 + 0.62 * lam + 0.36 * rim + 0.25 * Math.max(0, rnz) ** 2;
          if (rnz < -0.15) b *= 0.5;
          if (p === 1) b = 0.7 + 0.25 * lam + beat * 0.25;
          if (p === 4) b *= 0.4 + 0.6 * Math.min(1, Math.max(0, (oy + 0.95) / 0.45));
          b *= 0.94 + 0.06 * Math.sin(t * 2.6 + B.seed[i] * 60);
        }
        /* Seeing stars: a few body dots circle his head while he is dizzy. */
        if (dizzy && body && j % 60 === 0) {
          const ang = (j / B.nb) * 6.283185 * 4 + t * 3;
          tx = cx + S * Math.cos(ang) * 0.62; ty = cy + S * (HEAD.cy + 0.42 + Math.sin(ang) * 0.08); tz = S * Math.sin(ang) * 0.3; b = 1.3; sp2 = 3;
        }
      } else {
        const ph = B.seed[i] * 6.283;
        tx = cx + S * (B.dust[i3] + 0.07 * Math.sin(t * 0.21 + ph)); ty = cy + S * (B.dust[i3 + 1] + 0.06 * Math.cos(t * 0.17 + ph * 1.3)); tz = S * B.dust[i3 + 2];
        b = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.9 + ph * 3)); sp2 = 0.35;
      }
      /* A dent where he was pressed pushes his dots out of it; it closes as the dent heals. */
      for (const h of holes) {
        const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy), r = holeR * (1 - (t - h.t) / 0.7);
        if (d < r && d > 1e-4) { tx = h.x + (dx / d) * r; ty = h.y + (dy / d) * r; sp2 = Math.max(sp2, 8); }
      }
      let px = P[i3], py = P[i3 + 1], pz = P[i3 + 2];
      const dx = tx - px, dy = ty - py, dz = tz - pz, dist = Math.hypot(dx, dy, dz), k = reduce ? 1 : 1 - Math.exp(-dt * B.rate[i] * sp2);
      px += dx * k; py += dy * k; pz += dz * k;
      if (!reduce && dist > 0.06) { const sw = Math.min(1, dist * 1.4) * dt * 1.1; px += -dy * sw; py += dx * sw; b = b * (1 - Math.min(0.5, dist)) + 0.55 * Math.min(0.5, dist); }
      P[i3] = px; P[i3 + 1] = py; P[i3 + 2] = pz;
      INFO[i * 2] = b; INFO[i * 2 + 1] = tint;
    }
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, bufP); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, P);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, bufI); gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, INFO);
    gl!.drawArrays(gl!.POINTS, 0, N);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return {
    setCues(c: Cues) { cues = c; },
    poke,
    stop() { cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); removeEventListener("resize", resize); },
  };
}
