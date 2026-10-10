"use client";

import { useRef } from "react";
import { useSceneProgress } from "./Scene";

const PHONE = "(max-width: 820px)";
const REDUCE = "(prefers-reduced-motion: reduce)";

/* A short silent clip that plays round and round while the scene is between
   `from` and `to`, so a held picture keeps living while the visitor reads.
   It is fetched the first time it is needed, and never with reduced motion. */
export function LoopClip({ name, from, to }: { name: string; from: number; to: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const playing = useRef(false);

  useSceneProgress((p) => {
    const video = ref.current;
    if (!video) return;
    const want = p >= from && p <= to && !matchMedia(REDUCE).matches;
    if (want === playing.current) return;
    playing.current = want;
    if (!want) {
      video.pause();
      return;
    }
    if (!video.src) video.src = `/loops/${name}-${matchMedia(PHONE).matches ? "m" : "d"}.mp4`;
    video.play().catch(() => {});
  });

  return (
    <video
      ref={ref}
      className="scrub"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={(event) => {
        event.currentTarget.dataset.ready = "1";
      }}
    />
  );
}
