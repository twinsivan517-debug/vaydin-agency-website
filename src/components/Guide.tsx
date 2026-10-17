"use client";

/* The guide herself: green-screen clips keyed onto one canvas. She walks in
   once after the page has loaded, idles, talks while a line plays, and plays
   the opener (the one clip that carries its own sound) when told to from a
   tap. Every change of clip is a short cross-fade. With reduced motion, or
   without a canvas that can key, she is one still picture and only her
   sound moves. */

import Image from "next/image";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { painter, type Layer } from "@/lib/chroma";
import { OPENER_VIDEO, type Mood } from "@/lib/pitch";

export type Mode = "idle" | "talk" | "opener";
export type GuideHandle = { opener(): void };
type Clip = "walk" | "idle" | "talk" | "opener";
type Props = {
  mode: Mode;
  run: number;
  mood: Mood | null;
  pokeable: boolean;
  onArrive: () => void;
  onOpenerTime: (seconds: number) => void;
  onOpenerEnd: () => void;
  onPoke: () => void;
};

const LOOPS: Clip[] = ["walk", "idle", "talk"];
const STILL = "/guide/still.webp";
const WALK_MS = 2200;
const FADE_MS = 200;
/* The walk clip faces right; mirrored, she walks in from the right edge. */
const WALK_FLIP = true;

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
  const [still, setStill] = useState(false);
  const [stage, setStage] = useState<"away" | "walking" | "here">("away");

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
    const layer: Layer = { video, flip: name === "walk" && WALK_FLIP };
    layers.current[name] = layer;
    return layer;
  }, []);

  const swap = useCallback((name: Clip) => {
    const layer = layers.current[name];
    if (!layer) return;
    if (name === "talk") layer.video.currentTime = 0;
    if (layer === current.current) return;
    if (!stillRef.current) layer.video.play().catch(() => {});
    previous.current = current.current;
    current.current = layer;
    fadeAt.current = performance.now();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      opener() {
        const layer = layers.current.opener ?? make("opener");
        const video = layer.video;
        video.muted = false;
        video.currentTime = 0;
        video.play().catch(() => latest.current.onOpenerEnd());
        if (!stillRef.current && current.current) swap("opener");
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
      if (!paint) {
        setStage("here");
        latest.current.onArrive();
        return;
      }
      for (const name of LOOPS) make(name);
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
      swap("walk");
      setStage("walking");
      wait = window.setTimeout(() => {
        swap("idle");
        setStage("here");
        latest.current.onArrive();
      }, WALK_MS);
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
    if (mode === "talk") swap("talk");
    else if (mode === "idle") swap("idle");
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
        className="guide-figure absolute bottom-0 left-1/2 z-10 aspect-[258/480] h-full"
        style={{
          opacity: stage === "away" ? 0 : 1,
          transform: stage === "away" ? "translateX(calc(100vw - 50%))" : "translateX(-50%)",
          transition: stage === "walking" ? `transform ${WALK_MS}ms linear, opacity 300ms` : "opacity 300ms",
        }}
      >
        {still ? (
          <Image src={STILL} alt="" width={258} height={480} className="h-full w-full" priority={false} />
        ) : (
          <canvas ref={canvas} width={258} height={480} className="h-full w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]" />
        )}
      </div>
      <button
        type="button"
        onClick={onPoke}
        disabled={!pokeable || stage !== "here"}
        aria-label="Poke her"
        className="absolute bottom-0 left-1/2 z-20 aspect-[258/480] h-full -translate-x-1/2 cursor-pointer rounded-full disabled:cursor-default"
      />
    </div>
  );
});
