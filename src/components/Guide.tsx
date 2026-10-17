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
export type GuideHandle = { opener(): void };
type Clip = Mode;
type Props = {
  mode: Mode;
  run: number;
  mood: Mood | null;
  pokeable: boolean;
  onOpenerTime: (seconds: number) => void;
  onOpenerEnd: () => void;
  onPoke: () => void;
};

const LOOPS: Clip[] = ["sleep", "idle", "talk"];
const STILL = "/guide/still.webp";
const WIDTH = 516;
const HEIGHT = 960;
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
      setShown(true);
      if (!paint) return;
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
        className="guide-figure absolute bottom-0 left-1/2 z-10 aspect-[516/960] h-full -translate-x-1/2 transition-opacity duration-700"
        style={{ opacity: shown ? 1 : 0 }}
      >
        {still ? (
          <Image src={STILL} alt="" width={WIDTH} height={HEIGHT} className="h-full w-full" priority={false} />
        ) : (
          <canvas ref={canvas} width={WIDTH} height={HEIGHT} className="h-full w-full drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]" />
        )}
      </div>
      <button
        type="button"
        onClick={onPoke}
        disabled={!pokeable || !shown}
        aria-label={mode === "sleep" ? "Wake her up" : "Poke her"}
        className="absolute bottom-0 left-1/2 z-20 aspect-[516/960] h-full -translate-x-1/2 cursor-pointer rounded-full disabled:cursor-default"
      />
    </div>
  );
});
