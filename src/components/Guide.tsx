"use client";

/* The guide herself: green-screen clips keyed onto one canvas. She is asleep
   as the page opens, wakes on a tap into the opener (a clip that carries its
   own sound), then rests in the idle loop. A spoken line is a clip of that
   same loop with her lips on the line, voice included: it starts at the
   loop's current phase and hands the phase back when it ends, so only her
   mouth changes. Every other change of clip is a short cross-fade. With
   reduced motion, or without a canvas that can key, she is one still picture
   and the page plays the recordings instead. */

import Image from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { painter, type Layer } from "@/lib/chroma";
import { BASE_LOOP, OPENER_VIDEO, type Mood } from "@/lib/pitch";

export type Mode = "sleep" | "idle" | "talk" | "opener";
export type LineOutcome = "ended" | "failed";
/* `opener()` resolves true once the clip is playing, false if it cannot;
   `exit()` is where the bulb she tossed is at `THROW_AT` (read off the keyed
   canvas), in page pixels, with her frame's width so the page's bulb can match
   the clip's in size; `prime()` starts loading a line's clip ahead of time,
   the whole clip or only its header. */
export type GuideHandle = { opener(): Promise<boolean>; exit(): { x: number; y: number; width: number } | null; prime(src: string, full?: boolean): void };
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
const WIDTH = 720;
const HEIGHT = 1280;
const FADE_MS = 200;

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

  /* A line's clip. `full` loads the whole clip ahead (the next line); otherwise
     only its header, enough to start on the right frame without a wait. */
  const makeLine = useCallback((src: string, full = true) => {
    const have = lines.current[src];
    if (have) {
      if (full) have.video.preload = "auto";
      return have;
    }
    const video = document.createElement("video");
    video.src = src;
    video.playsInline = true;
    video.preload = full ? "auto" : "metadata";
    const layer: Layer = { video };
    lines.current[src] = layer;
    return layer;
  }, []);

  const isLine = useCallback((layer: Layer | null) => !!layer && Object.values(lines.current).includes(layer), []);
  /* Where the body is in its loop: known for the loop and for a line's clip. */
  const phase = useCallback(() => {
    const c = current.current;
    return c && (c === layers.current.idle || isLine(c)) ? c.video.currentTime % BASE_LOOP : 0;
  }, [isLine]);

  /* Bring a layer to the front. A layer with a voice stops the moment it is
     replaced, not when the fade has painted it out (a hidden tab never
     paints); the fade still shows its last frame. */
  const show = useCallback((layer: Layer) => {
    if (layer === current.current) return;
    const old = current.current;
    if (layer === layers.current.idle && old && (old === layers.current.idle || isLine(old))) layer.video.currentTime = old.video.currentTime % BASE_LOOP;
    if (!stillRef.current) layer.video.play().catch(() => {});
    if (old && (old === layers.current.opener || isLine(old))) old.video.pause();
    previous.current = old;
    current.current = layer;
    fadeAt.current = performance.now();
  }, [isLine]);

  /* Only the sleep loop loads with the page; the others arrive when she wakes. */
  const swap = useCallback(
    (name: Clip) => {
      if (!current.current && name !== "sleep") return;
      const layer = layers.current[name] ?? make(name);
      if (name === "talk") layer.video.currentTime = 0;
      show(layer);
    },
    [make, show],
  );

  /* A line's clip, started at the body's phase so nothing but the mouth moves. */
  const speak = useCallback(
    (src: string) => {
      if (stillRef.current || !current.current) return latest.current.onLineEnd("failed");
      const layer = lines.current[src] ?? makeLine(src);
      const video = layer.video;
      const start = () => {
        /* The phase is read here, not when the line was asked for: the body
           kept moving while the clip's header loaded. */
        const at = phase();
        video.onended = () => latest.current.onLineEnd("ended");
        video.onerror = () => latest.current.onLineEnd("failed");
        video.currentTime = video.duration > at + 0.25 ? at : 0;
        video.muted = false;
        video.play().then(
          () => show(layer),
          () => latest.current.onLineEnd("failed"),
        );
      };
      if (video.readyState >= 1) start();
      else {
        video.onloadedmetadata = start;
        video.onerror = () => latest.current.onLineEnd("failed");
      }
    },
    [makeLine, phase, show],
  );

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
      prime(src, full = true) {
        if (!stillRef.current) makeLine(src, full);
      },
    }),
    [make, makeLine, swap],
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
    const spoken = lines.current;

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
      for (const layer of [...Object.values(list), ...Object.values(spoken)]) {
        layer?.video.pause();
        layer?.video.removeAttribute("src");
      }
    };
  }, [make, swap]);

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
