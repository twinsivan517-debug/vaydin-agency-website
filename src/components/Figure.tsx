"use client";

/* The guide as gold dots, in her place: the same handle as her video figure,
   so the page's flow is unchanged. He speaks only through the page's audio,
   so the greeting is always the recording, never a clip. His canvas is made
   on the body and spans the window above the page, letting his light reach
   the doors beside him and the logo; it never takes a tap. A press on him
   dents him and counts as a poke. */

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { GuideHandle } from "@/components/Guide";
import { runFigure, type Cues, type FigureInput } from "@/lib/figure/engine";

type Props = {
  mode: FigureInput["mode"];
  audio: () => HTMLAudioElement | null;
  pokeable: boolean;
  onPoke: (at: number, point?: { x: number; y: number }) => void;
  /* His light has reached the logo: the page may light. */
  onLit?: () => void;
  /* He was spun around (or shaken by scrolling, on a phone) while he spoke, and stayed steady. */
  onSpun?: (how: "spin" | "shake") => void;
  small?: boolean;
};

export const Figure = forwardRef<GuideHandle, Props>(function Figure(props, ref) {
  const stage = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const engine = useRef<ReturnType<typeof runFigure>>(null);
  /* A press that landed on him, answered on the click that follows: a phone counts a click, not a press, as the touch that may start sound. */
  const pressed = useRef(false);

  useEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "figure-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = runFigure(
      canvas,
      () => ({
        mode: latest.current.mode,
        audio: latest.current.audio(),
        stage: stage.current,
        doors: Array.from(document.querySelectorAll<HTMLElement>("[data-figure-door]")),
        chips: Array.from(document.querySelectorAll<HTMLElement>("[data-figure-chip]")),
        logo: document.querySelector<HTMLElement>(".mark"),
      }),
      reduce,
      !!latest.current.small,
      () => latest.current.onLit?.(),
      (how) => latest.current.onSpun?.(how),
    );
    engine.current = run;
    /* No WebGL here: no figure, but the page must not stay dark waiting for his
       light. A turn later, so the page has dimmed itself first. */
    const unlit = run ? 0 : window.setTimeout(() => latest.current.onLit?.(), 0);
    if (!run) canvas.remove();
    let live = true;
    fetch("/guide/cues.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then((c: Cues) => {
        if (live) run?.setCues(c);
      })
      .catch(() => {});
    return () => {
      live = false;
      window.clearTimeout(unlit);
      run?.stop();
      canvas.remove();
      engine.current = null;
    };
  }, []);

  /* Her handle, kept so the page needs no change: there is no clip to open, prime or warm. */
  useImperativeHandle(ref, () => ({
    opener: () => Promise.resolve(false),
    exit: () => null,
    prime: () => {},
    unlock: () => {},
    warm: () => {},
  }), []);

  return (
    <div
      ref={stage}
      className="figure-stage absolute inset-0"
      onPointerDown={(event) => {
        /* A press always dents him; he answers it only when he is free to. */
        pressed.current = !!engine.current?.poke(event.clientX, event.clientY);
      }}
      onClick={(event) => {
        if (pressed.current && latest.current.pokeable) latest.current.onPoke(event.timeStamp, { x: event.clientX, y: event.clientY });
        pressed.current = false;
      }}
    />
  );
});
