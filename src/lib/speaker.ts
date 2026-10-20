/* One audio element for the whole page. Phones allow sound only from an
   element that first played inside a tap, so `arm()` is called in the tap
   handler with a silent clip; every later line may then start on its own.
   `say()` settles when the line ends, fails to load, or is stopped, and
   reports the playhead while it runs for lines that carry several clouds. */

export type Outcome = "ended" | "failed" | "stopped";
export type Speaker = {
  arm(): void;
  say(src: string, onTime?: (seconds: number) => void): Promise<Outcome>;
  prefetch(src: string): void;
  stop(): void;
};

/* A valid, silent WAV of 16 frames: enough to unlock the element. */
export const SILENCE =
  "data:audio/wav;base64,UklGRkQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export function speaker(): Speaker {
  const el = new Audio();
  el.preload = "auto";
  el.hidden = true;
  document.body.append(el);
  let armed = false;
  let settle: ((outcome: Outcome) => void) | null = null;

  const finish = (outcome: Outcome) => {
    const done = settle;
    settle = null;
    el.onended = null;
    el.onerror = null;
    el.ontimeupdate = null;
    done?.(outcome);
  };

  return {
    arm() {
      if (armed) return;
      armed = true;
      el.src = SILENCE;
      el.play().catch(() => {});
    },
    say(src, onTime) {
      finish("stopped");
      el.src = src;
      return new Promise<Outcome>((resolve) => {
        settle = resolve;
        el.onended = () => finish("ended");
        el.onerror = () => finish("failed");
        if (onTime) el.ontimeupdate = () => onTime(el.currentTime);
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
