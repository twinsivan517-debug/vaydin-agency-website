/* The guide's state, as a pure reducer so it can be tested without a browser.
   Phases: away (not yet walked in), idle, opener (the lip-synced clip),
   talking (a chapter, line by line), quip (a poke reply), done (a chapter
   finished; chips stay). `run` changes whenever a new sound must start, so
   tapping the active chip again replays it. */

import { CHAPTERS, POKES, chapter, type ChapterId, type Line } from "./pitch.ts";

export type Phase = "away" | "idle" | "opener" | "talking" | "quip" | "done";
export type State = {
  phase: Phase;
  chapter: ChapterId | null;
  line: number;
  met: boolean;
  lit: boolean;
  cloud: Line;
  run: number;
};
export type Event =
  | { type: "arrived" }
  | { type: "tap"; chapter: ChapterId }
  | { type: "line_ended" }
  | { type: "cloud_at"; seconds: number }
  | { type: "poke"; index: number }
  | { type: "stop" };

export const START: State = {
  phase: "away",
  chapter: null,
  line: 0,
  met: false,
  lit: false,
  cloud: CHAPTERS[0].lines[0],
  run: 0,
};

export function reduce(s: State, e: Event): State {
  switch (e.type) {
    case "arrived":
      return s.phase === "away" ? { ...s, phase: "idle" } : s;
    case "tap": {
      if (s.phase === "away") return s;
      const c = chapter(e.chapter);
      return {
        ...s,
        phase: c.clip === "opener" ? "opener" : "talking",
        chapter: c.id,
        line: 0,
        cloud: c.lines[0],
        lit: false,
        run: s.run + 1,
      };
    }
    case "line_ended": {
      if (s.phase === "opener") return { ...s, phase: "done", met: true };
      if (s.phase === "quip") return { ...s, phase: s.met ? "done" : "idle" };
      if (s.phase !== "talking" || !s.chapter) return s;
      const lines = chapter(s.chapter).lines;
      const next = s.line + 1;
      if (next < lines.length) return { ...s, line: next, cloud: lines[next] };
      return { ...s, phase: "done", lit: s.chapter === "start" };
    }
    case "cloud_at": {
      if (s.phase !== "opener" || !s.chapter) return s;
      const lines = chapter(s.chapter).lines;
      let i = 0;
      for (let k = 0; k < lines.length; k++) if ((lines[k].at ?? 0) <= e.seconds) i = k;
      return i === s.line ? s : { ...s, line: i, cloud: lines[i] };
    }
    case "poke": {
      if (s.phase !== "idle" && s.phase !== "done") return s;
      const quip = POKES[Math.min(e.index, POKES.length - 1)];
      return { ...s, phase: "quip", cloud: quip, run: s.run + 1 };
    }
    case "stop": {
      if (s.phase === "opener") return { ...s, phase: "done", met: true };
      if (s.phase === "talking" || s.phase === "quip") return { ...s, phase: s.met ? "done" : "idle" };
      return s;
    }
  }
}

/* Which clip the guide shows for a state. */
export const mode = (s: State): "idle" | "talk" | "opener" =>
  s.phase === "opener" ? "opener" : s.phase === "talking" || s.phase === "quip" ? "talk" : "idle";

export const speaking = (s: State) => s.phase === "opener" || s.phase === "talking" || s.phase === "quip";
export const pokeable = (s: State) => s.phase === "idle" || s.phase === "done";
