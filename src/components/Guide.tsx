"use client";

/* The guide herself: green-screen clips keyed onto one canvas. She is asleep
   as the page opens, wakes on a tap into the opener (the one clip that
   carries its own sound), idles, and talks while a line plays. Every change
   of clip is a short cross-fade. With reduced motion, or without a canvas
   that can key, she is one still picture and only her sound moves. */

import Image from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { painter, type Layer } from "@/lib/chroma";
import { OPENER_VIDEO, type Mood } from "@/lib/pitch";

export type Mode = "sleep" | "idle" | "talk" | "opener";
/* `opener()` resolves true once the clip is playing, false if it cannot;
   `exit()` is where the bulb she tossed is at `THROW_AT` (read off the keyed
   canvas), in page pixels, with her frame's width so the page's bulb can match
   the clip's in size. */
export type GuideHandle = { opener(): Promise<boolean>; exit(): { x: number; y: number; width: number } | null };
type Clip = Mode;
type Props = {
  mode: Mode;
  run: number;
  mood: Mood | null;
  pokeable: boolean;
  onOpenerTime: (seconds: number) => void;
  onOpenerEnd: () => void;
  onPoke: (at: number) => void;
};

const STILL = "/guide/still.webp";
const WIDTH = 720;
const HEIGHT = 1280;
const FADE_MS = 200;

export const Guide = forwardRef<GuideHandle, Props>(function Guide(props, ref) {
  const { mode, run, mood, pokeable, onPoke } = props;
  const latest = useRef(props);
  latest.current = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const layers = useRef<Partial<Record<Clip, Layer>>>({});
  const current = useRef<Layer | null>(null);
  const previous = useRef<Layer | null>(null);
  const fadeAt = useRef(0);
  const stillRef = useRef(false);
  const openerRun = useRef(0);
  const [still, setStill] = useState(false);
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
    return layer;
  }, []);

  /* Only the sleep loop loads with the page; the others arrive when she wakes. */
  const swap = useCallback((name: Clip) => {
    if (!current.current && name !== "sleep") return;
    const layer = layers.current[name] ?? make(name);
    if (name === "talk") layer.video.currentTime = 0;
    if (layer === current.current) return;
    if (!stillRef.current) layer.video.play().catch(() => {});
    /* The opener carries her voice: it stops the moment she is asked for
       something else, not when the fade has painted it out (a hidden tab
       never paints). The fade still shows its last frame. */
    if (current.current === layers.current.opener) current.current.video.pause();
    previous.current = current.current;
    current.current = layer;
    fadeAt.current = performance.now();
  }, [make]);

  useImperativeHandle(
    ref,
    () => ({
      opener() {
        const layer = layers.current.opener ?? make("opener");
        for (const name of ["idle", "talk"] as const) if (!layers.current[name]) make(name);
        const video = layer.video;
        video.muted = false;
        video.currentTime = 0;
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
    }),
    [make, swap],
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paint = !reduce && canvas.current ? painter(canvas.current) : null;
    if (!paint) {
      stillRef.current = true;
      setStill(true);
    }
    let frame = 0;
    let wait = 0;
    const list = layers.current;

    const begin = () => {
      setShown(true);
      if (!paint) return;
      make("sleep");
      let lastTime = -1;
      let lastLayer: Layer | null = null;
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
        if (!p && c.video.currentTime === lastTime && c === lastLayer) return;
        lastTime = c.video.currentTime;
        lastLayer = c;
        if (p && p.video.readyState >= 2) {
          const mix = Math.min(1, (performance.now() - fadeAt.current) / FADE_MS);
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
      for (const layer of Object.values(list)) {
        layer?.video.pause();
        layer?.video.removeAttribute("src");
      }
    };
  }, [make, swap]);

  useEffect(() => {
    if (mode !== "opener") swap(mode);
  }, [mode, run, swap]);

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
