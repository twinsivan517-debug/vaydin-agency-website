/* The guide's state, as a pure reducer so it can be tested without a browser.
   Phases: asleep (as the page opens), idle, opener (the lip-synced waking
   greeting), talking (lines, one after another), quip (a poke reply), done
   (a run finished; the card stays). `run` changes whenever a new sound must
   start, so tapping the active chip again replays it. The last poke's quip
   ends with her asleep again. */

import { CHOOSE, HELLO, UNKNOWN, answerLine } from "./answers.ts";
import type { Reply } from "./match.ts";
import { CHAPTERS, POKES, SLEEPING, chapter, type ChapterId, type Line } from "./pitch.ts";

export type Phase = "asleep" | "idle" | "opener" | "talking" | "quip" | "done";
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
  | { type: "wake" }
  | { type: "tap"; chapter: ChapterId }
  | { type: "ask"; reply: Reply }
  | { type: "line_ended" }
  | { type: "cloud_at"; seconds: number }
  | { type: "poke"; index: number }
  | { type: "stop" };

export const START: State = {
  phase: "asleep",
  lines: [],
  line: 0,
  shown: { kind: "chapter", id: CHAPTERS[0].id },
  chapter: null,
  cloud: SLEEPING,
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

/* What she says to a typed question; the page also readies it while it is typed. */
export const replyLines = (r: Reply): Line[] =>
  r.kind === "answer" ? [answerLine(r.answer)] : r.kind === "choose" ? [CHOOSE] : r.kind === "greeting" ? [HELLO] : [UNKNOWN];

const opener = (s: State) => {
  const c = CHAPTERS[0];
  return speak(s, c.lines, { kind: "chapter", id: c.id }, c.id, "opener");
};

export function reduce(s: State, e: Event): State {
  switch (e.type) {
    case "wake":
      return s.phase === "asleep" ? opener(s) : s;
    case "tap": {
      const c = chapter(e.chapter);
      if (c.clip === "opener") return opener(s);
      return speak(s, c.lines, { kind: "chapter", id: c.id }, c.id);
    }
    case "ask": {
      const r = e.reply;
      const said = replyLines(r);
      if (r.kind === "answer") return speak(s, said, { kind: "answer", id: r.answer.id }, null);
      if (r.kind === "choose") return speak(s, said, { kind: "choose", ids: r.options.map((a) => a.id) }, null);
      if (r.kind === "greeting") return speak(s, said, s.shown, null);
      return speak(s, said, { kind: "unknown" }, null);
    }
    case "line_ended": {
      if (s.phase === "opener") {
        /* The clip carries the lines with a time; any line with a sound of its own follows it. */
        const next = s.lines.findIndex((l) => l.audio);
        if (next >= 0) return { ...s, phase: "talking", line: next, cloud: s.lines[next], met: true };
        return { ...s, phase: "done", met: true };
      }
      if (s.phase === "quip") {
        /* The last quip is her lying back down: the page sleeps with her, and the next tap wakes her again. */
        if (s.cloud.id === POKES[POKES.length - 1].id) return { ...s, phase: "asleep", cloud: SLEEPING, lit: false };
        return { ...s, phase: s.met ? "done" : "idle" };
      }
      if (s.phase !== "talking") return s;
      const next = s.line + 1;
      if (next < s.lines.length) return { ...s, line: next, cloud: s.lines[next] };
      return { ...s, phase: "done", met: true, lit: s.chapter === "price" };
    }
    case "cloud_at": {
      if (s.phase !== "opener") return s;
      let i = 0;
      for (let k = 0; k < s.lines.length; k++) if (s.lines[k].at !== undefined && s.lines[k].at! <= e.seconds) i = k;
      return i === s.line ? s : { ...s, line: i, cloud: s.lines[i] };
    }
    case "poke": {
      if (s.phase === "asleep") return opener(s);
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
export const mode = (s: State): "sleep" | "idle" | "talk" | "opener" =>
  s.phase === "asleep" ? "sleep" : s.phase === "opener" ? "opener" : s.phase === "talking" || s.phase === "quip" ? "talk" : "idle";

export const speaking = (s: State) => s.phase === "opener" || s.phase === "talking" || s.phase === "quip";
export const pokeable = (s: State) => s.phase === "asleep" || s.phase === "idle" || s.phase === "done";
