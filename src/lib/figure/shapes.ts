/* The shapes his body becomes, drawn once on a small canvas and sampled into
   dots: outlines dense, fills sparse. Each carries a colour from the site's
   own palette, so a shape reads as its subject. */

import { rng } from "./body";

type Draw = (g: CanvasRenderingContext2D) => void;
export type Shape = { pts: Float32Array; color: [number, number, number] };

const hex = (h: string): [number, number, number] => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255) as [number, number, number];
export const ACCENT = ["#f87171", "#f5d978", "#4ade80", "#a78bfa", "#34e3f0"].map(hex);

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};
const dot = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  g.beginPath();
  g.arc(x, y, r, 0, 7);
  g.fill();
};
const line = (g: CanvasRenderingContext2D, ...pts: number[]) => {
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let k = 2; k < pts.length; k += 2) g.lineTo(pts[k], pts[k + 1]);
  g.stroke();
};

const DRAW: Record<string, [string, Draw]> = {
  skyline: ["#f5d978", (g) => {
    /* A city at night: towers of different heights, the tallest stepping up to a needle. */
    const towers = [[8, 150, 20, 60], [32, 122, 18, 88], [54, 140, 22, 70], [80, 112, 16, 98], [134, 118, 18, 92], [156, 138, 16, 72], [176, 100, 18, 110], [198, 148, 16, 62],
      [94, 150, 32, 60], [97, 112, 26, 40], [100, 80, 20, 34], [103, 54, 14, 28], [106, 34, 8, 22], [108.5, 6, 3, 30]];
    g.lineWidth = 3; g.globalAlpha = 0.28;
    for (const [x, y, w, h] of towers) g.fillRect(x, y, w, h);
    g.globalAlpha = 1;
    for (const [x, y, w, h] of towers) g.strokeRect(x, y, w, h);
    g.lineWidth = 4; line(g, 0, 210, 220, 210);
  }],
  clinic: ["#ffe7b0", (g) => {
    g.lineWidth = 9; rr(g, 34, 66, 152, 138, 10); g.stroke(); line(g, 24, 66, 196, 66);
    g.beginPath(); g.moveTo(92, 204); g.lineTo(92, 160); g.arc(110, 160, 18, Math.PI, 0); g.lineTo(128, 204); g.stroke();
    rr(g, 52, 96, 30, 30, 5); g.stroke(); rr(g, 138, 96, 30, 30, 5); g.stroke();
    g.beginPath(); g.moveTo(110, 42); g.bezierCurveTo(98, 26, 78, 40, 110, 58); g.bezierCurveTo(142, 40, 122, 26, 110, 42); g.fill();
  }],
  person: ["#ffe7b0", (g) => { g.beginPath(); g.arc(110, 72, 38, 0, 7); g.stroke(); g.beginPath(); g.arc(110, 196, 74, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }],
  chat: ["#4ade80", (g) => { rr(g, 30, 40, 160, 110, 34); g.stroke(); line(g, 66, 150, 52, 186, 100, 150); [78, 110, 142].forEach((x) => dot(g, x, 95, 9)); }],
  search: ["#34e3f0", (g) => { g.beginPath(); g.arc(92, 92, 56, 0, 7); g.stroke(); g.lineWidth = 16; line(g, 134, 134, 186, 186); }],
  star: ["#f5d978", (g) => {
    g.beginPath();
    for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 40 : 92; g.lineTo(110 + Math.cos(a) * r, 116 + Math.sin(a) * r); }
    g.closePath(); g.stroke();
  }],
  camera: ["#a78bfa", (g) => { rr(g, 32, 32, 156, 156, 44); g.stroke(); g.beginPath(); g.arc(110, 110, 38, 0, 7); g.stroke(); dot(g, 152, 68, 8); }],
  web: ["#34e3f0", (g) => {
    rr(g, 24, 38, 172, 144, 18); g.stroke(); line(g, 24, 78, 196, 78); [46, 68, 90].forEach((x) => dot(g, x, 58, 6));
    g.lineWidth = 8; line(g, 48, 110, 172, 110); line(g, 48, 136, 150, 136); line(g, 48, 160, 120, 160);
  }],
  calendar: ["#34e3f0", (g) => {
    rr(g, 30, 44, 160, 150, 16); g.stroke(); line(g, 30, 86, 190, 86); line(g, 70, 26, 70, 60); line(g, 150, 26, 150, 60);
    g.lineWidth = 12; line(g, 78, 140, 102, 164, 148, 112);
  }],
  bell: ["#f5d978", (g) => {
    g.beginPath(); g.moveTo(54, 160); g.quadraticCurveTo(66, 140, 66, 100); g.bezierCurveTo(66, 48, 154, 48, 154, 100); g.quadraticCurveTo(154, 140, 166, 160); g.closePath(); g.stroke();
    dot(g, 110, 182, 12); line(g, 110, 34, 110, 50);
  }],
  heart: ["#f87171", (g) => {
    g.beginPath(); g.moveTo(110, 190); g.bezierCurveTo(20, 130, 30, 40, 110, 76); g.bezierCurveTo(190, 40, 200, 130, 110, 190); g.stroke();
    g.lineWidth = 7; line(g, 50, 116, 84, 116, 96, 92, 112, 140, 126, 104, 136, 116, 170, 116);
  }],
  chart: ["#4ade80", (g) => {
    line(g, 30, 30, 30, 190, 196, 190);
    g.globalAlpha = 0.35; [[52, 140, 28, 46], [96, 104, 28, 82], [140, 64, 28, 122]].forEach(([x, y, w, h]) => g.fillRect(x, y, w, h)); g.globalAlpha = 1;
    [[52, 140, 28, 46], [96, 104, 28, 82], [140, 64, 28, 122]].forEach(([x, y, w, h]) => g.strokeRect(x, y, w, h));
  }],
  report: ["#f3ead9", (g) => { rr(g, 46, 24, 128, 172, 12); g.stroke(); g.lineWidth = 8; [62, 90, 118, 146].forEach((y, k) => line(g, 70, y, k % 2 ? 130 : 150, y)); }],
  mail: ["#f3ead9", (g) => { rr(g, 26, 54, 168, 116, 14); g.stroke(); line(g, 30, 60, 110, 120, 190, 60); }],
  moon: ["#9fb8ff", (g) => {
    g.beginPath(); g.arc(104, 112, 70, Math.PI * 0.32, Math.PI * 1.68); g.arc(140, 92, 56, Math.PI * 1.55, Math.PI * 0.45, true); g.closePath(); g.stroke();
    [[176, 48], [190, 120], [160, 170]].forEach(([x, y]) => dot(g, x, y, 6));
  }],
  coin: ["#f5d978", (g) => { g.beginPath(); g.arc(110, 110, 82, 0, 7); g.stroke(); g.beginPath(); g.arc(110, 110, 60, 0, 7); g.stroke(); g.lineWidth = 9; line(g, 110, 72, 110, 148); }],
  shield: ["#4ade80", (g) => {
    g.beginPath(); g.moveTo(110, 24); g.lineTo(184, 52); g.quadraticCurveTo(184, 160, 110, 198); g.quadraticCurveTo(36, 160, 36, 52); g.closePath(); g.stroke();
    g.lineWidth = 12; line(g, 78, 112, 102, 136, 146, 88);
  }],
  key: ["#f5d978", (g) => { g.beginPath(); g.arc(70, 110, 40, 0, 7); g.stroke(); line(g, 110, 110, 196, 110); line(g, 170, 110, 170, 140); line(g, 190, 110, 190, 132); }],
  pin: ["#f87171", (g) => {
    g.beginPath(); g.moveTo(110, 200); g.bezierCurveTo(60, 140, 50, 110, 50, 86); g.arc(110, 86, 60, Math.PI, 0); g.bezierCurveTo(170, 110, 160, 140, 110, 200); g.stroke();
    g.beginPath(); g.arc(110, 86, 22, 0, 7); g.stroke();
  }],
  clock: ["#a78bfa", (g) => { g.beginPath(); g.arc(110, 110, 84, 0, 7); g.stroke(); line(g, 110, 110, 110, 60); line(g, 110, 110, 146, 128); }],
};

export function makeShapes(n: number): Record<string, Shape> {
  const out: Record<string, Shape> = {};
  const rnd = rng(31);
  const S = 220;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d", { willReadFrequently: true });
  if (!g) return out;
  for (const [name, [color, draw]] of Object.entries(DRAW)) {
    g.clearRect(0, 0, S, S);
    g.globalAlpha = 1; g.strokeStyle = g.fillStyle = "#fff"; g.lineWidth = 11; g.lineCap = g.lineJoin = "round";
    draw(g);
    const d = g.getImageData(0, 0, S, S).data;
    const px: number[] = [];
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 30) px.push(x, y);
    const pts = new Float32Array(n * 3), m = px.length / 2;
    for (let j = 0; j < n; j++) {
      let p = Math.floor(rnd() * m);
      while (rnd() * 255 > d[(px[p * 2 + 1] * S + px[p * 2]) * 4 + 3]) p = Math.floor(rnd() * m);
      pts[j * 3] = ((px[p * 2] + rnd() - 0.5) / S) * 2 - 1;
      pts[j * 3 + 1] = 1 - ((px[p * 2 + 1] + rnd() - 0.5) / S) * 2;
      pts[j * 3 + 2] = (rnd() - 0.5) * 0.08;
    }
    out[name] = { pts, color: hex(color) };
  }
  return out;
}
