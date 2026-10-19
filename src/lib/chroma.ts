/* Keys green-screen video onto a transparent canvas, two layers at a time so
   one clip can fade into the next: out = a * (1 - mix) + b * mix. Each layer
   is keyed before the mix, so the fade never shows green at the edges. A
   layer can be mirrored (the walk clip faces one way; the others face front).
   WebGL first; a 2D-canvas fallback keys one layer and cuts instead of fading. */

export type Layer = { video: HTMLVideoElement; flip?: boolean };
export type Painter = (a: Layer, b: Layer | null, mix: number) => void;

const VERTEX = `
attribute vec2 at;
varying vec2 uv;
void main() {
  uv = vec2((at.x + 1.0) / 2.0, (1.0 - at.y) / 2.0);
  gl_Position = vec4(at, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
uniform sampler2D frameA;
uniform sampler2D frameB;
uniform float mix_;
uniform float flipA;
uniform float flipB;
varying vec2 uv;
vec4 key(sampler2D frame, float flip) {
  vec4 c = texture2D(frame, vec2(mix(uv.x, 1.0 - uv.x, flip), uv.y));
  float most = max(c.r, c.b);
  float green = c.g - most;
  float alpha = 1.0 - smoothstep(30.0 / 255.0, 100.0 / 255.0, green);
  vec3 rgb = vec3(c.r, green > 0.0 ? most : c.g, c.b);
  return vec4(rgb * alpha, alpha);
}
void main() {
  gl_FragColor = mix(key(frameA, flipA), key(frameB, flipB), mix_);
}`;

function gpu(canvas: HTMLCanvasElement): Painter | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, "at");
  gl.enableVertexAttribArray(at);
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);

  const textures = [0, 1].map((unit) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 255, 0, 255]));
    return texture;
  });
  gl.uniform1i(gl.getUniformLocation(program, "frameA"), 0);
  gl.uniform1i(gl.getUniformLocation(program, "frameB"), 1);
  const mixAt = gl.getUniformLocation(program, "mix_");
  const flipA = gl.getUniformLocation(program, "flipA");
  const flipB = gl.getUniformLocation(program, "flipB");
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);

  const upload = (unit: number, layer: Layer) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, textures[unit]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer.video);
  };

  let w = canvas.width;
  let h = canvas.height;
  return (a, b, mix) => {
    /* The canvas is sized to the figure on screen; a resize moves the viewport with it. */
    if (canvas.width !== w || canvas.height !== h) {
      w = canvas.width;
      h = canvas.height;
      gl.viewport(0, 0, w, h);
    }
    upload(0, a);
    if (b && mix > 0) upload(1, b);
    gl.uniform1f(mixAt, b ? mix : 0);
    gl.uniform1f(flipA, a.flip ? 1 : 0);
    gl.uniform1f(flipB, b?.flip ? 1 : 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

function cpu(canvas: HTMLCanvasElement): Painter | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  return (a, b, mix) => {
    const layer = b && mix >= 0.5 ? b : a;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    if (layer.flip) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(layer.video, 0, 0, width, height);
    ctx.restore();
    const image = ctx.getImageData(0, 0, width, height);
    const px = image.data;
    for (let i = 0; i < px.length; i += 4) {
      const most = px[i] > px[i + 2] ? px[i] : px[i + 2];
      const green = px[i + 1] - most;
      if (green > 0) {
        px[i + 1] = most;
        px[i + 3] = green >= 100 ? 0 : green <= 30 ? 255 : Math.round(255 * (1 - (green - 30) / 70));
      }
    }
    ctx.putImageData(image, 0, 0);
  };
}

export function painter(canvas: HTMLCanvasElement): Painter | null {
  return gpu(canvas) ?? cpu(canvas);
}
