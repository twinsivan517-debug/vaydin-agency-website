"use client";

import { useEffect, useRef } from "react";
import { useSceneProgress } from "./Scene";

const PHONE = "(max-width: 820px)";
const REDUCE = "(prefers-reduced-motion: reduce)";
const MAX_DPR = 1.5;
const FIRST_PASS = 3;
/* A sequence holds its frames only while the scene is within LEAD of the
   part it plays in, so one long scene never keeps every clip decoded. */
const LEAD = 0.1;

/* Until the visitor scrolls, a sequence loads only a few frames: the page's
   first load stays light, and nothing is scrubbed before a scroll anyway. */
let scrolled: Promise<void> | undefined;
function firstScroll() {
  scrolled ??= new Promise((resolve) => {
    if (scrollY > 0) resolve();
    else addEventListener("scroll", () => resolve(), { once: true, passive: true });
  });
  return scrolled;
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
  phoneStep = 2,
  from = 0,
  to = 1,
  reverse = false,
}: {
  name: string;
  count: number;
  phoneStep?: number;
  from?: number;
  to?: number;
  reverse?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    frames: [] as (HTMLImageElement | undefined)[],
    total: 0,
    want: 0,
    drawn: -1,
    seen: false,
    near: false,
    sync: () => {},
  });

  const draw = () => {
    const canvas = canvasRef.current;
    const s = state.current;
    if (!canvas || !s.total) return;
    let best = -1;
    for (let d = 0; d < s.total && best < 0; d++) {
      if (s.frames[s.want - d]) best = s.want - d;
      else if (s.frames[s.want + d]) best = s.want + d;
    }
    if (best < 0 || best === s.drawn) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(s.frames[best]!, 0, 0, canvas.width, canvas.height);
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
    draw();
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia(REDUCE).matches) return;
    const s = state.current;
    const phone = matchMedia(PHONE).matches;
    const step = phone ? phoneStep : 1;
    const indexes: number[] = [];
    for (let i = 0; i < count; i += step) indexes.push(i);
    if (indexes[indexes.length - 1] !== count - 1) indexes.push(count - 1);
    s.total = indexes.length;
    if (reverse) s.want = s.total - 1;

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      s.drawn = -1;
      draw();
    };
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    let run = 0;
    const load = async (mine: number) => {
      let done = 0;
      for (const slot of loadOrder(s.total)) {
        if (done++ === FIRST_PASS) await firstScroll();
        if (mine !== run) return;
        if (s.frames[slot]) continue;
        const img = new Image();
        img.src = `/frames/${name}/${phone ? "m" : "d"}/${String(indexes[slot] + 1).padStart(3, "0")}.webp`;
        try {
          await img.decode();
        } catch {
          continue;
        }
        if (mine !== run) return;
        s.frames[slot] = img;
        draw();
      }
    };
    let held = false;
    s.sync = () => {
      const hold = s.seen && s.near;
      if (hold === held) return;
      held = hold;
      run += 1;
      if (hold) {
        void load(run);
      } else {
        s.frames = [];
        s.drawn = -1;
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
      io.disconnect();
      ro.disconnect();
      s.sync = () => {};
      s.frames = [];
    };
  }, [name, count, phoneStep, reverse]);

  return <canvas ref={canvasRef} className="scrub" aria-hidden="true" />;
}
