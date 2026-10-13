"use client";

import { useEffect, useRef } from "react";
import { useSceneProgress } from "./Scene";

const PHONE = "(max-width: 820px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const MAX_DPR = 1.5;
/* A phone frame is 1080 wide and its 3:4 stage about 630 CSS px, so 2x
   already shows every pixel the frame has; a desktop frame is 1920 wide, so
   1.5x is all it can show there. */
const PHONE_DPR = 2;
const FIRST_PASS = 3;
/* A sequence holds its frames only while the scene is within LEAD of the
   part it plays in, so one long scene never keeps every clip decoded. */
const LEAD = 0.1;
/* Decoded pictures are kept only for the frames around the one wanted. A
   decoded frame is 6 MB and more; left to the browser, those decodes are
   thrown away under memory pressure and made again on the main thread at
   every draw, which is what stuttered on phones. The ring is decoded off the
   main thread; the GPU scales it to the canvas at draw time. Resizing in
   createImageBitmap would run on the main thread and cost more than the
   decode it replaced. */
const RING = 4;

/* Until the visitor scrolls, a sequence loads only a few frames: the page's
   first load stays light, and nothing is scrubbed before a scroll anyway. */
let scrolled: Promise<void> | undefined;
export function firstScroll() {
  scrolled ??= new Promise((resolve) => {
    if (scrollY > 0) resolve();
    else addEventListener("scroll", () => resolve(), { once: true, passive: true });
  });
  return scrolled;
}

/* Every mounted sequence, so the one on stage can start the download of
   the next one in page order: one clip ahead, never more, so the first pass
   through the story meets its pictures already there without pulling the
   whole story onto a phone that may leave after one screen. */
type Entry = { canvas: HTMLCanvasElement; fetchBytes: () => void };
const mounted = new Set<Entry>();
function following(canvas: HTMLCanvasElement): Entry | undefined {
  let next: Entry | undefined;
  for (const e of mounted) {
    if (e.canvas === canvas || !(canvas.compareDocumentPosition(e.canvas) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    if (!next || e.canvas.compareDocumentPosition(next.canvas) & Node.DOCUMENT_POSITION_FOLLOWING) next = e;
  }
  return next;
}

function loadOrder(count: number): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  for (let step = 16; step >= 1; step = Math.floor(step / 2)) {
    for (let i = 0; i < count; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
    if (!seen.has(count - 1)) {
      seen.add(count - 1);
      order.push(count - 1);
    }
  }
  return order;
}

export function ScrubSequence({
  name,
  count,
  step = 2,
  from = 0,
  to = 1,
  reverse = false,
}: {
  name: string;
  count: number;
  step?: number;
  from?: number;
  to?: number;
  reverse?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    bytes: [] as (Blob | undefined)[],
    ready: new Map<number, ImageBitmap>(),
    making: new Set<number>(),
    total: 0,
    want: 0,
    drawn: -1,
    seen: false,
    near: false,
    sync: () => {},
    fill: () => {},
  });

  const draw = () => {
    const canvas = canvasRef.current;
    const s = state.current;
    if (!canvas || !s.total || !s.ready.size) return;
    let best = -1;
    let dist = Infinity;
    for (const i of s.ready.keys()) {
      const d = Math.abs(i - s.want);
      if (d < dist) {
        dist = d;
        best = i;
      }
    }
    if (best === s.drawn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(s.ready.get(best)!, 0, 0, canvas.width, canvas.height);
    s.drawn = best;
    canvas.dataset.ready = "1";
  };

  useSceneProgress((p) => {
    const s = state.current;
    const near = p >= from - LEAD && p <= to + LEAD;
    if (near !== s.near) {
      s.near = near;
      s.sync();
    }
    if (!s.total) return;
    const local = Math.min(1, Math.max(0, (p - from) / (to - from)));
    s.want = Math.round((reverse ? 1 - local : local) * (s.total - 1));
    s.fill();
    draw();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia(REDUCE).matches) return;
    const s = state.current;
    const phone = matchMedia(PHONE).matches;
    /* Every second frame on every screen: a frame then changes about every
       88 px of scroll, which no wheel or trackpad shows, and the download
       halves. A laptop's first pass through the city clip was 14 MB. */
    const indexes: number[] = [];
    for (let i = 0; i < count; i += step) indexes.push(i);
    if (indexes[indexes.length - 1] !== count - 1) indexes.push(count - 1);
    s.total = indexes.length;
    if (reverse) s.want = s.total - 1;

    let run = 0;
    let held = false;

    const drop = () => {
      for (const b of s.ready.values()) b.close();
      s.ready.clear();
      s.making.clear();
      s.drawn = -1;
    };

    /* A frame outside the ring is wanted only while nothing is ready yet. */
    const wanted = (slot: number) => !s.ready.size || Math.abs(slot - s.want) <= RING;

    const make = async (slot: number, mine: number) => {
      const blob = s.bytes[slot];
      if (!blob || s.ready.has(slot) || s.making.has(slot) || !wanted(slot)) return;
      s.making.add(slot);
      let bmp: ImageBitmap;
      try {
        bmp = await createImageBitmap(blob);
      } catch {
        s.making.delete(slot);
        return;
      }
      s.making.delete(slot);
      if (mine !== run || !held || !wanted(slot)) {
        bmp.close();
        return;
      }
      s.ready.set(slot, bmp);
      draw();
    };

    s.fill = () => {
      if (!held) return;
      for (const [i, b] of s.ready) {
        if (Math.abs(i - s.want) > RING && s.ready.size > 1) {
          b.close();
          s.ready.delete(i);
        }
      }
      for (let d = 0; d <= RING; d++) {
        void make(s.want + d, run);
        if (d) void make(s.want - d, run);
      }
    };

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, phone ? PHONE_DPR : MAX_DPR);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (width === canvas.width && height === canvas.height) return;
      canvas.width = width;
      canvas.height = height;
      s.drawn = -1;
      draw();
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    /* The bytes are fetched once and kept: a clip is a few MB compressed,
       and keeping them is what makes a second pass smooth. Only unmounting
       stops the loop. */
    let alive = true;
    let fetching = false;
    let fetched = false;
    const load = async () => {
      if (fetching || fetched) return;
      fetching = true;
      let done = 0;
      for (const slot of loadOrder(s.total)) {
        if (done++ === FIRST_PASS) await firstScroll();
        if (!alive) return;
        if (s.bytes[slot]) continue;
        try {
          const file = String(indexes[slot] + 1).padStart(3, "0");
          const res = await fetch(`/frames/${name}/${phone ? "m" : "d"}/${file}.webp`);
          if (!res.ok) continue;
          const blob = await res.blob();
          if (!alive) return;
          s.bytes[slot] = blob;
        } catch {
          continue;
        }
        if (held) void make(slot, run);
      }
      fetching = false;
      fetched = true;
      if (held) following(canvas)?.fetchBytes();
    };
    const entry: Entry = { canvas, fetchBytes: () => void load() };
    mounted.add(entry);

    s.sync = () => {
      const hold = s.seen && s.near;
      if (hold === held) return;
      held = hold;
      run += 1;
      if (hold) {
        void load();
        s.fill();
        if (fetched) following(canvas)?.fetchBytes();
      } else {
        drop();
        delete canvas.dataset.ready;
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        s.seen = entry.isIntersecting;
        s.sync();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(canvas);
    s.sync();

    return () => {
      run += 1;
      held = false;
      alive = false;
      mounted.delete(entry);
      io.disconnect();
      ro.disconnect();
      s.sync = () => {};
      s.fill = () => {};
      drop();
      s.bytes = [];
    };
  }, [name, count, step, reverse]);

  return <canvas ref={canvasRef} className="scrub" aria-hidden="true" />;
}
