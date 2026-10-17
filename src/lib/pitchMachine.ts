/* The guide's state, as a pure reducer so it can be tested without a browser.
   Phases: away (not yet walked in), idle, opener (the lip-synced clip),
   talking (lines, one after another), quip (a poke reply), done (a run
   finished; the card stays). `run` changes whenever a new sound must start,
   so tapping the active chip again replays it. */

import { CHOOSE, HELLO, UNKNOWN, answerLine } from "./answers.ts";
import type { Reply } from "./match.ts";
import { CHAPTERS, GREETING, POKES, chapter, type ChapterId, type Line } from "./pitch.ts";

export type Phase = "away" | "idle" | "opener" | "talking" | "quip" | "done";
export type Shown =
  | { kind: "chapter"; id: ChapterId }
  | { kind: "answer"; id: string }
  | { kind: "choose"; ids: string[] }
  | { kind: "unknown" };
export type State = {
  phase: Phase;
  lines: Line[];
  line: number;
  shown: Shown;
  chapter: ChapterId | null;
  cloud: Line;
  lit: boolean;
  met: boolean;
  run: number;
};
export type Event =
  | { type: "arrived" }
  | { type: "tap"; chapter: ChapterId }
  | { type: "ask"; reply: Reply }
  | { type: "line_ended" }
  | { type: "cloud_at"; seconds: number }
  | { type: "poke"; index: number }
  | { type: "stop" };

export const START: State = {
  phase: "away",
  lines: [],
  line: 0,
  shown: { kind: "chapter", id: CHAPTERS[0].id },
  chapter: null,
  cloud: GREETING,
  lit: false,
  met: false,
  run: 0,
};

const speak = (s: State, lines: Line[], shown: Shown, chapter: ChapterId | null, phase: Phase = "talking"): State => ({
  ...s,
  phase,
  lines,
  line: 0,
  shown,
  chapter,
  cloud: lines[0],
  lit: false,
  run: s.run + 1,
});

export function reduce(s: State, e: Event): State {
  switch (e.type) {
    case "arrived":
      return s.phase === "away" ? { ...s, phase: "idle" } : s;
    case "tap": {
      if (s.phase === "away") return s;
      const c = chapter(e.chapter);
      return speak(s, c.lines, { kind: "chapter", id: c.id }, c.id, c.clip === "opener" ? "opener" : "talking");
    }
    case "ask": {
      if (s.phase === "away") return s;
      const r = e.reply;
      if (r.kind === "answer") return speak(s, [answerLine(r.answer)], { kind: "answer", id: r.answer.id }, null);
      if (r.kind === "choose") return speak(s, [CHOOSE], { kind: "choose", ids: r.options.map((a) => a.id) }, null);
      if (r.kind === "greeting") return speak(s, [HELLO], s.shown, null);
      return speak(s, [UNKNOWN], { kind: "unknown" }, null);
    }
    case "line_ended": {
      if (s.phase === "opener") return { ...s, phase: "done", met: true };
      if (s.phase === "quip") return { ...s, phase: s.met ? "done" : "idle" };
      if (s.phase !== "talking") return s;
      const next = s.line + 1;
      if (next < s.lines.length) return { ...s, line: next, cloud: s.lines[next] };
      return { ...s, phase: "done", met: true, lit: s.chapter === "start" };
    }
    case "cloud_at": {
      if (s.phase !== "opener") return s;
      let i = 0;
      for (let k = 0; k < s.lines.length; k++) if ((s.lines[k].at ?? 0) <= e.seconds) i = k;
      return i === s.line ? s : { ...s, line: i, cloud: s.lines[i] };
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
