"use client";

/* A room told on its own stage (the owner's round of 2026-11-11): his body acts
   each of the room's lines out (public/guide/cues.json, keyed by the line's file)
   and its words stand under him. He starts in silence, on a playhead that runs
   each line for its recorded length, because a browser refuses even muted sound
   before a tap (a muted play was refused, NotAllowedError, 2026-11-11); one tap
   brings his voice from the line he is on. No motion wanted: he waits for a tap.
   The lines: src/lib/pages.ts ROOMS. The page around this frame carries them as text. */

import { useEffect, useRef, useState } from "react";
import { Figure } from "@/components/Figure";
import type { Playhead } from "@/lib/figure/engine";
import { ROOMS } from "@/lib/pages";
import { speaker, type Speaker } from "@/lib/speaker";

/* The pause between two silent lines, as between two takes. */
const GAP = 0.6;

export function Room({ room }: { room: string }) {
  const lines = ROOMS[room] ?? [];
  const voice = useRef<Speaker | null>(null);
  const head = useRef<Playhead | null>(null);
  const durs = useRef<Record<string, number>>({});
  /* Each start takes a new number; a run that sees a newer one stops. */
  const run = useRef(0);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(false);

  const silent = (from: number) => {
    const me = ++run.current;
    let i = from, t0 = performance.now();
    setAt(i);
    setPlaying(true);
    const tick = () => {
      if (run.current !== me) return;
      const t = (performance.now() - t0) / 1000, dur = durs.current[lines[i].id] ?? 5;
      if (t < dur) head.current = { src: lines[i].audio ?? "", currentTime: t, paused: false, ended: false };
      else if (t < dur + GAP) head.current = null;
      else if (++i < lines.length) {
        t0 = performance.now();
        setAt(i);
      } else {
        head.current = null;
        setPlaying(false);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* Called inside a tap: say() starts the element before the first await, so a phone counts the tap. */
  const play = async (from: number) => {
    const me = ++run.current;
    head.current = null;
    const v = (voice.current ??= speaker());
    setPlaying(true);
    for (let i = from; i < lines.length; i++) {
      setAt(i);
      const src = lines[i].audio, next = lines[i + 1]?.audio;
      if (!src) continue;
      if (next) v.prefetch(next);
      const outcome = await v.say(src);
      if (run.current !== me) return;
      if (outcome !== "ended") break;
    }
    setPlaying(false);
  };

  const pause = () => {
    run.current++;
    head.current = null;
    voice.current?.stop();
    setPlaying(false);
  };

  useEffect(() => {
    let live = true;
    fetch("/guide/cues.json")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((c: Record<string, { dur?: number }>) => {
        if (!live) return;
        durs.current = Object.fromEntries(lines.map((l) => [l.id, c[l.id]?.dur ?? 5]));
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) silent(0);
      });
    return () => {
      live = false;
      run.current++;
      voice.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last = lines.length - 1;
  const from = playing || at < last ? at : 0;
  const main = !sound
    ? { label: "Hear him", icon: "♪", act: () => (setSound(true), play(from)) }
    : playing
      ? { label: "Pause", icon: "❚❚", act: pause }
      : { label: at >= last ? "Again" : "Play", icon: at >= last ? "↺" : "▶", act: () => play(from) };

  return (
    <main className="room flex min-h-screen flex-col items-center px-5 pb-4">
      <div className="relative w-full flex-1" style={{ minHeight: "46vh" }}>
        <Figure mode={playing ? "talk" : "idle"} audio={() => head.current ?? voice.current?.audio ?? null} pokeable={false} onPoke={() => {}} />
      </div>
      <p className="room-line" aria-hidden="true">
        {lines[at]?.text}
      </p>
      <div className="room-controls">
        <div className="room-dots">
          {lines.map((l, i) => (
            <button
              key={l.id}
              type="button"
              aria-label={`Line ${i + 1} of ${lines.length}`}
              aria-current={i === at ? "step" : undefined}
              className={i === at ? "on" : i < at ? "done" : ""}
              onClick={() => (sound ? play(i) : silent(i))}
            />
          ))}
        </div>
        <button type="button" className="room-main" onClick={main.act}>
          <span aria-hidden="true">{main.icon}</span> {main.label}
        </button>
      </div>
    </main>
  );
}
