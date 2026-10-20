"use client";

/* The guide herself: green-screen clips keyed onto one canvas. She is asleep
   as the page opens, wakes on a tap into the opener (a clip that carries its
   own sound), then rests in the idle loop. A spoken line is a clip of that
   same loop with her lips on the line, voice included: it starts at its
   first word, crossing over from wherever the loop was, and hands the phase
   back when it ends. Every other change of clip is a short cross-fade. With
   reduced motion, or without a canvas that can key, she is one still picture
   and the page plays the recordings instead. */

import Image from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { painter, type Layer } from "@/lib/chroma";
import { BASE_LOOP, OPENER_VIDEO, type Mood } from "@/lib/pitch";
import { pool, type Pool } from "@/lib/pool";

export type Mode = "sleep" | "idle" | "talk" | "opener";
export type LineOutcome = "ended" | "failed";
/* `opener()` resolves true once the clip is playing, false if it cannot;
   `exit()` is where the bulb she tossed is at `THROW_AT` (read off the keyed
   canvas), in page pixels, with her frame's width so the page's bulb can match
   the clip's in size; `prime()` starts loading a line's clip ahead of time,
   its header, or the whole clip once the one playing has arrived; `unlock()`,
   called inside a tap, readies elements her later lines may play from. */
export type GuideHandle = {
  opener(): Promise<boolean>;
  exit(): { x: number; y: number; width: number } | null;
  prime(src: string, full?: boolean): void;
  unlock(): void;
};
type Clip = Mode;
type Props = {
  mode: Mode;
  run: number;
  /* The clip of the line she is speaking, or null to use the plain talk loop. */
  lineSrc: string | null;
  mood: Mood | null;
  pokeable: boolean;
  onOpenerTime: (seconds: number) => void;
  onOpenerEnd: () => void;
  onLineEnd: (outcome: LineOutcome) => void;
  onPoke: (at: number) => void;
};

const STILL = "/guide/still.webp";
/* The most the canvas her clips are drawn into may be: the bodies are 1172 px
   wide, so nothing below that is thrown away before the screen. On screen it
   is sized to the figure's own pixels, which on a phone is a tenth of this:
   keying 1080 by 1920 for a 170 px figure was the page's one slow task. */
const WIDTH = 1080;
const HEIGHT = 1920;
const FADE_MS = 200;
/* The fade back to the loop after a line on its own body: the gesture may
   be mid-air when the line ends or is stopped, so the rest is a slower cross. */
const REST_MS = 450;
/* Which lines stand on their own body, written by scripts/lipsync.py. */
const BODIES = "/guide/lines/bodies.json";
/* How many line clips stay loaded at once; the rest are released. */
const KEEP = 8;
/* The greeting gets the connection to itself until all of it has arrived, or
   this long at most (Chrome calls a clip "can play through" the moment it
   starts, so that event is no gate). Then the rest arrives one piece at a
   time, this far apart: nine media elements made in one idle period froze
   her canvas for most of a second. */
const GREETING_FIRST_MS = 6000;
const SPACING_MS = 400;
/* A line whose header has not come by now is given up on; the page then
   plays its recording, rather than hold her silent with Stop showing. */
const HEADER_MS = 6000;

/* Work for a quiet moment: the next idle callback, or a short timer where there is none (Safari). */
const later = (fn: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(() => fn(), { timeout: 600 }) : setTimeout(fn, 150));

/* `fn` once the whole clip has arrived, or fails, or after `most` ms. */
const arrived = (video: HTMLVideoElement, fn: () => void, most: number) => {
  let done = false;
  const check = () => {
    const b = video.buffered;
    if (video.error || (video.duration > 0 && b.length > 0 && b.end(b.length - 1) >= video.duration - 0.25)) finish();
  };
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    video.removeEventListener("progress", check);
    video.removeEventListener("error", finish);
    fn();
  };
  const timer = setTimeout(finish, most);
  video.addEventListener("progress", check);
  video.addEventListener("error", finish);
  check();
};

/* Frames each clip has actually put on screen, counted by the browser, so a
   frame is keyed and uploaded once, not on every repaint between frames. */
const presented = new WeakMap<HTMLVideoElement, number>();
const countFrames = (video: HTMLVideoElement) => {
  if (!("requestVideoFrameCallback" in video)) return;
  const tick = () => {
    presented.set(video, (presented.get(video) ?? 0) + 1);
    video.requestVideoFrameCallback(tick);
  };
  video.requestVideoFrameCallback(tick);
};

export const Guide = forwardRef<GuideHandle, Props>(function Guide(props, ref) {
  const { mode, run, lineSrc, mood, pokeable, onPoke } = props;
  const latest = useRef(props);
  latest.current = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const layers = useRef<Partial<Record<Clip, Layer>>>({});
  const lines = useRef<Record<string, Layer>>({});
  const current = useRef<Layer | null>(null);
  const previous = useRef<Layer | null>(null);
  const fadeAt = useRef(0);
  const fadeMs = useRef(FADE_MS);
  const bodies = useRef<Set<string>>(new Set());
  const resized = useRef(false);
  const asked = useRef(0);
  const stillRef = useRef(false);
  const openerRun = useRef(0);
  const spare = useRef<Pool | null>(null);
  /* Loading work waits its turn here: the greeting first, then one piece per SPACING_MS. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [still, setStill] = useState(false);

  const enqueue = useCallback((fn: () => void) => {
    queue.current = queue.current.then(
      () =>
        new Promise<void>((done) =>
          later(() => {
            fn();
            setTimeout(done, SPACING_MS);
          }),
        ),
    );
  }, []);
  const [shown, setShown] = useState(false);

  const make = useCallback((name: Clip) => {
    const video = document.createElement("video");
    video.src = name === "opener" ? OPENER_VIDEO : `/guide/${name}.mp4`;
    video.muted = name !== "opener";
    video.loop = name !== "opener";
    video.playsInline = true;
    video.preload = "auto";
    if (name === "opener") {
      video.ontimeupdate = () => latest.current.onOpenerTime(video.currentTime);
      video.onended = () => latest.current.onOpenerEnd();
    }
    const layer: Layer = { video };
    layers.current[name] = layer;
    countFrames(video);
    return layer;
  }, []);

  /* A line's clip, on an element from the pool. `full` loads the whole clip;
     otherwise only its header, enough to start without a wait. */
  const makeLine = useCallback((src: string, full = true) => {
    const have = lines.current[src];
    if (have) {
      if (full) have.video.preload = "auto";
      return have;
    }
    const elements = (spare.current ??= pool(KEEP + 2));
    const video = elements.take();
    video.src = src;
    video.preload = full ? "auto" : "metadata";
    countFrames(video);
    const layer: Layer = { video };
    lines.current[src] = layer;
    /* Phones allow only so many media pipelines at once: the oldest clips
       not on screen are released, and come back from the cache when asked. */
    const keys = Object.keys(lines.current);
    for (const k of keys) {
      if (keys.length - (keys.indexOf(k) + 1) < KEEP) break;
      const l = lines.current[k];
      if (l === current.current || l === previous.current) continue;
      elements.give(l.video);
      delete lines.current[k];
    }
    return layer;
  }, []);

  const isLine = useCallback((layer: Layer | null) => !!layer && Object.values(lines.current).includes(layer), []);
  /* A line on its own gesture body, rather than on the shared loop. */
  const ownBody = useCallback((layer: Layer) => {
    const src = Object.keys(lines.current).find((k) => lines.current[k] === layer);
    return !!src && bodies.current.has(src.replace(/^.*\//, "").replace(/\.mp4$/, ""));
  }, []);
  /* Bring a layer to the front. A layer with a voice stops the moment it is
     replaced, not when the fade has painted it out (a hidden tab never
     paints); the fade still shows its last frame. */
  const show = useCallback((layer: Layer) => {
    if (layer === current.current) return;
    const old = current.current;
    if (layer === layers.current.idle && old && (old === layers.current.idle || isLine(old))) {
      /* A line on the shared loop hands its phase back exactly. A line on its
         own body begins and ends on her still, which is the loop's first
         frame; but stopped or cut mid-gesture it is not there, so the rest
         is a slower cross. */
      const own = isLine(old) && ownBody(old);
      layer.video.currentTime = own ? 0 : old.video.currentTime % BASE_LOOP;
      fadeMs.current = own ? REST_MS : FADE_MS;
    } else fadeMs.current = FADE_MS;
    if (!stillRef.current) layer.video.play().catch(() => {});
    if (old && (old === layers.current.opener || isLine(old))) old.video.pause();
    previous.current = old;
    current.current = layer;
    fadeAt.current = performance.now();
  }, [isLine, ownBody]);

  /* Only the sleep loop loads with the page; the others arrive when she wakes. */
  const swap = useCallback(
    (name: Clip) => {
      if (!current.current && name !== "sleep") return;
      asked.current++;
      const layer = layers.current[name] ?? make(name);
      if (name === "talk") layer.video.currentTime = 0;
      show(layer);
    },
    [make, show],
  );

  /* A line's clip, from its first frame: the voice starts there, so a clip
     entered at the loop's phase lost its opening words (up to 4.5 s). */
  const speak = useCallback(
    (src: string) => {
      if (stillRef.current) return latest.current.onLineEnd("failed");
      /* Before she has begun (window load plus a moment) the line is not
         refused: begin() replays whatever the page then wants. */
      if (!current.current) return;
      /* The line playing until now must not report its end as this one's. */
      const old = current.current;
      if (isLine(old)) old.video.onended = null;
      const layer = lines.current[src] ?? makeLine(src);
      const video = layer.video;
      /* A clip that failed while it loaded ahead fires no event again: it is
         dropped at once (a later ask makes it afresh), and the page plays
         the recording. Only its error says so: an element given its source
         this moment reads "no source" until the browser starts the load. */
      if (video.error) {
        delete lines.current[src];
        spare.current?.give(video);
        return latest.current.onLineEnd("failed");
      }
      /* Each request owns a number: a Stop or another line while this one's
         header still loads leaves it unplayed, rather than played with no
         Stop sign and nothing to end it. */
      const mine = ++asked.current;
      const start = () => {
        if (mine !== asked.current) return;
        video.onended = () => latest.current.onLineEnd("ended");
        video.onerror = () => latest.current.onLineEnd("failed");
        video.currentTime = 0;
        video.muted = false;
        video.play().then(
          () => (mine === asked.current ? show(layer) : video.pause()),
          () => mine === asked.current && latest.current.onLineEnd("failed"),
        );
      };
      if (video.readyState >= 1) start();
      else {
        video.onloadedmetadata = start;
        video.onerror = () => mine === asked.current && latest.current.onLineEnd("failed");
        setTimeout(() => {
          if (mine !== asked.current || video.readyState >= 1) return;
          video.onloadedmetadata = null;
          latest.current.onLineEnd("failed");
        }, HEADER_MS);
      }
    },
    [isLine, makeLine, show],
  );

  useImperativeHandle(
    ref,
    () => ({
      opener() {
        const layer = layers.current.opener ?? make("opener");
        const video = layer.video;
        video.muted = false;
        video.currentTime = 0;
        /* Nothing else loads until the greeting has arrived: on a slow line,
           the clips fetched beside it made it stall four times. The talk
           loop is made only if a clip is ever refused. */
        queue.current = new Promise<void>((resolve) => arrived(video, resolve, GREETING_FIRST_MS));
        enqueue(() => layers.current.idle ?? make("idle"));
        const mine = ++openerRun.current;
        const started = video.play().then(
          () => {
            /* The clip's time once per shown frame, where the browser has it;
               `timeupdate` alone ticks every quarter second, too coarse for
               the bulb to leave her frame on the frame it does. A callback
               left pending at the clip's end would wake on the next play, so
               each play owns its chain by number. */
            const tick = (_now: number, frame: { mediaTime: number }) => {
              if (mine !== openerRun.current || video.paused || video.ended) return;
              latest.current.onOpenerTime(frame.mediaTime);
              video.requestVideoFrameCallback(tick);
            };
            if ("requestVideoFrameCallback" in video) video.requestVideoFrameCallback(tick);
            return true;
          },
          () => false,
        );
        if (!stillRef.current && current.current) swap("opener");
        return started.then((ok) => {
          if (!ok && !stillRef.current) swap("talk");
          return ok;
        });
      },
      exit() {
        const box = figure.current?.getBoundingClientRect();
        return box ? { x: box.left + box.width * 0.18, y: box.top + box.height * 0.07, width: box.width } : null;
      },
      prime(src, full = true) {
        if (stillRef.current) return;
        enqueue(() => {
          const layer = makeLine(src, false);
          if (!full) return;
          /* The whole clip once the line she is speaking (not the loop under
             it, long since loaded) has arrived, so the two never share the
             connection. */
          const speaking = latest.current.lineSrc;
          const now = (speaking && lines.current[speaking]?.video) || current.current?.video;
          const all = () => (layer.video.preload = "auto");
          if (!now || now === layer.video) all();
          else arrived(now, all, GREETING_FIRST_MS);
        });
      },
      unlock() {
        (spare.current ??= pool(KEEP + 2)).unlock();
      },
    }),
    [enqueue, make, makeLine, swap],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* The canvas takes the figure's size in device pixels, never more than the clips'. */
    const fit = () => {
      const c = canvas.current;
      const f = figure.current;
      if (!c || !f) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.min(WIDTH, Math.max(2, Math.round(f.clientWidth * dpr)));
      const h = Math.min(HEIGHT, Math.max(2, Math.round(f.clientHeight * dpr)));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        resized.current = true;
      }
    };
    fit();
    const watch = figure.current && "ResizeObserver" in window ? new ResizeObserver(fit) : null;
    if (figure.current) watch?.observe(figure.current);
    if (reduce) {
      stillRef.current = true;
      setStill(true);
    }
    let frame = 0;
    let wait = 0;
    const list = layers.current;
    const spoken = lines.current;

    const begin = () => {
      setShown(true);
      if (reduce) return;
      /* The keyer is made here, not at mount: setting up WebGL was the
         page's one long task, and nothing is drawn before this moment. */
      const paint = canvas.current ? painter(canvas.current) : null;
      if (!paint) {
        stillRef.current = true;
        setStill(true);
        return;
      }
      fetch(BODIES)
        .then((r) => (r.ok ? r.json() : []))
        .then((ids: string[]) => {
          bodies.current = new Set(ids);
        })
        .catch(() => {});
      let lastFrame = -1;
      let lastLayer: Layer | null = null;
      let drawnAt = 0;
      const draw = () => {
        frame = requestAnimationFrame(draw);
        const c = current.current;
        if (!c) return;
        const p = previous.current;
        if (c.video.readyState < 2) {
          if (p && p.video.readyState >= 2) paint(p, null, 0);
          fadeAt.current = performance.now();
          return;
        }
        /* A new frame only when the clip shows one; where the browser cannot
           say, by its clock, and never more than a quarter second without one. */
        const at = presented.get(c.video) ?? c.video.currentTime;
        const now = performance.now();
        if (!p && !resized.current && at === lastFrame && c === lastLayer && now - drawnAt < 250) return;
        resized.current = false;
        lastFrame = at;
        lastLayer = c;
        drawnAt = now;
        if (p && p.video.readyState >= 2) {
          const mix = Math.min(1, (performance.now() - fadeAt.current) / fadeMs.current);
          paint(p, c, mix);
          if (mix < 1) return;
        } else paint(c, null, 0);
        if (p) {
          if (p.video !== c.video) p.video.pause();
          previous.current = null;
        }
      };
      frame = requestAnimationFrame(draw);
      swap("sleep");
      /* A tap may have come before this moment (the chips show before she
         does): the page's present wish is replayed, not lost. */
      const { mode: now, lineSrc: src } = latest.current;
      if (now === "opener") swap("opener");
      else if (now === "talk" && src) speak(src);
      else if (now !== "sleep") swap(now);
    };

    const kick = () => {
      wait = window.setTimeout(begin, 1200);
    };
    if (document.readyState === "complete") kick();
    else window.addEventListener("load", kick, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wait);
      window.removeEventListener("load", kick);
      watch?.disconnect();
      for (const layer of [...Object.values(list), ...Object.values(spoken)]) {
        layer?.video.pause();
        layer?.video.removeAttribute("src");
      }
    };
  }, [make, speak, swap]);

  useEffect(() => {
    if (mode === "opener") return;
    if (mode === "talk" && lineSrc) speak(lineSrc);
    else swap(mode);
  }, [mode, run, lineSrc, swap, speak]);

  /* The class is taken off and put back so the same mood replays. */
  useEffect(() => {
    const el = figure.current;
    if (!el || !mood) return;
    const name = `guide-${mood}`;
    el.classList.remove("guide-hop", "guide-shake");
    void el.offsetWidth;
    el.classList.add(name);
    return () => el.classList.remove(name);
  }, [mood, run]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={figure}
        aria-hidden="true"
        className="guide-figure absolute bottom-0 left-1/2 z-10 aspect-[9/16] h-full -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: shown ? 1 : 0 }}
      >
        {still ? (
          <Image src={STILL} alt="" width={WIDTH} height={HEIGHT} className="h-full w-full" priority={false} />
        ) : (
          <canvas ref={canvas} width={WIDTH} height={HEIGHT} className="h-full w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]" />
        )}
        {mode === "sleep" && (
          <span className="guide-zzz absolute left-[30%] top-[60%] font-display text-2xl text-gold-bright">
            <i className="not-italic">z</i>
            <i className="not-italic">z</i>
            <i className="not-italic">Z</i>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={(event) => onPoke(event.timeStamp)}
        disabled={!pokeable || !shown}
        aria-label={mode === "sleep" ? "Wake her up" : "Poke her"}
        className="absolute bottom-0 left-1/2 z-20 aspect-[9/16] h-full -translate-x-1/2 cursor-pointer rounded-full disabled:cursor-default"
      />
    </div>
  );
});
