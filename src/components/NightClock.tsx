"use client";

import { useRef } from "react";
import { useSceneProgress } from "./Scene";

const REDUCE = "(prefers-reduced-motion: reduce)";

function label(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} PM`;
}

export function NightClock({
  start,
  end,
  from,
  to,
}: {
  start: number;
  end: number;
  from: number;
  to: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useSceneProgress((p) => {
    if (!ref.current || matchMedia(REDUCE).matches) return;
    const local = Math.min(1, Math.max(0, (p - from) / (to - from)));
    ref.current.textContent = label(start + (end - start) * local);
  });
  return (
    <span ref={ref} aria-hidden="true" className="font-display text-5xl tabular-nums sm:text-7xl">
      {label(start)}
    </span>
  );
}
