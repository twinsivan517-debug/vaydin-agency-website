/* One audio element for the whole page. Phones allow sound only from an
   element that first played inside a tap, so `arm()` is called in the tap
   handler with a silent clip; every later line may then start on its own.
   `say()` settles when the line ends, fails to load, or is stopped. */

export type Outcome = "ended" | "failed" | "stopped";
export type Speaker = {
  arm(): void;
  say(src: string): Promise<Outcome>;
  prefetch(src: string): void;
  stop(): void;
};

/* A valid, silent WAV of 16 frames: enough to unlock the element. */
const SILENCE =
  "data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export function speaker(): Speaker {
  const el = new Audio();
  el.preload = "auto";
  let armed = false;
  let settle: ((outcome: Outcome) => void) | null = null;

  const finish = (outcome: Outcome) => {
    const done = settle;
    settle = null;
    el.onended = null;
    el.onerror = null;
    done?.(outcome);
  };

  return {
    arm() {
      if (armed) return;
      armed = true;
      el.src = SILENCE;
      el.play().catch(() => {});
    },
    say(src) {
      finish("stopped");
      el.src = src;
      el.currentTime = 0;
      return new Promise<Outcome>((resolve) => {
        settle = resolve;
        el.onended = () => finish("ended");
        el.onerror = () => finish("failed");
        el.play().catch(() => finish("failed"));
      });
    },
    prefetch(src) {
      fetch(src, { priority: "low" } as RequestInit).catch(() => {});
    },
    stop() {
      el.pause();
      finish("stopped");
    },
  };
}
