/* Safari plays a clip with sound only from an element that first played
   inside a tap, and many of her lines start on their own, seconds after one
   ("Pick a question", a chapter's second line). So on Safari the page keeps
   a few video elements, plays each one on a silent sound inside a tap, and
   hands them to her lines; a released line gives its element back. Other
   browsers remember the tap for the whole page, so there the pool simply
   makes elements as they are asked for. */

import { SILENCE } from "./speaker.ts";

export type Pool = { unlock(): void; take(): HTMLVideoElement; give(video: HTMLVideoElement): void };

export function pool(size: number): Pool {
  const free: HTMLVideoElement[] = [];
  const armed = new WeakSet<HTMLVideoElement>();
  /* GestureEvent exists only in WebKit, Safari's engine, on every iPhone browser. */
  const safari = typeof window !== "undefined" && "GestureEvent" in window;
  const fresh = () => {
    const video = document.createElement("video");
    video.playsInline = true;
    return video;
  };
  return {
    unlock() {
      if (!safari) return;
      while (free.length < size) free.push(fresh());
      for (const video of free) {
        if (armed.has(video)) continue;
        armed.add(video);
        video.muted = false;
        video.src = SILENCE;
        video.play().catch(() => {});
      }
    },
    take() {
      const i = free.findIndex((v) => armed.has(v));
      return i >= 0 ? free.splice(i, 1)[0] : (free.shift() ?? fresh());
    },
    give(video) {
      video.pause();
      video.onended = video.onerror = video.onloadedmetadata = null;
      video.removeAttribute("src");
      video.load();
      free.push(video);
    },
  };
}
