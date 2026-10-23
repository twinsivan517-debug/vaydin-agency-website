/* The guide's state, as a pure reducer so it can be tested without a browser.
   Phases: asleep (as the page opens), idle, opener (the lip-synced waking
   greeting), talking (lines, one after another), quip (a poke reply), done
   (a run finished; the card stays). `run` changes whenever a new sound must
   start, so tapping the active chip again replays it. The last poke's quip
   ends with him in hibernation: awake and lit, but deaf to pokes until he is
   asked something (`rest`). More opens the list of questions on the card,
   and she says so, unless she is still giving the greeting. Small talk is
   answered with its line, and the list is offered unless it was thanks or
   goodbye. Say speaks lines of the page's own, leaving the card as it is. A
   question picked from the list is answered with the list kept open; less
   closes it onto the answer she gave, or her first chapter. */

import { ANSWERS, CHOOSE, HELLO, MORE, UNKNOWN, answerLine } from "./answers.ts";
import type { Reply } from "./match.ts";
import { CHAPTERS, POKES, RESTING, SLEEPING, chapter, type ChapterId, type Line } from "./pitch.ts";
import { TALK } from "./talk.ts";

export type Phase = "asleep" | "idle" | "opener" | "talking" | "quip" | "done";
export type Shown =
  | { kind: "chapter"; id: ChapterId }
  | { kind: "answer"; id: string }
  | { kind: "choose"; ids: string[] }
  | { kind: "unknown" }
  | { kind: "more" };
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
  rest: boolean;
};
export type Event =
  | { type: "wake" }
  | { type: "tap"; chapter: ChapterId }
  | { type: "ask"; reply: Reply; keep?: boolean }
  | { type: "line_ended" }
  | { type: "cloud_at"; seconds: number }
  | { type: "poke"; index: number }
  | { type: "more" }
  | { type: "less" }
  | { type: "say"; lines: Line[] }
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
  rest: false,
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
  rest: false,
});

/* What she says to a typed question; the page also readies it while it is typed. */
export const replyLines = (r: Reply): Line[] =>
  r.kind === "answer"
    ? [answerLine(r.answer)]
    : r.kind === "choose"
      ? [CHOOSE]
      : r.kind === "talk"
        ? [TALK[r.talk]]
        : r.kind === "greeting"
          ? [HELLO]
          : [UNKNOWN];

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
      if (r.kind === "answer") return speak(s, said, e.keep ? s.shown : { kind: "answer", id: r.answer.id }, null);
      if (r.kind === "choose") return speak(s, said, { kind: "choose", ids: r.options.map((a) => a.id) }, null);
      if (r.kind === "greeting") return speak(s, said, s.shown, null);
      if (r.kind === "talk") return speak(s, said, r.talk === "thanks" || r.talk === "bye" ? s.shown : { kind: "more" }, null);
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
        /* The last quip is his hibernation: the page stays lit, and only a question brings him back. */
        if (s.cloud.id === POKES[POKES.length - 1].id) return { ...s, phase: s.met ? "done" : "idle", cloud: RESTING, rest: true };
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
      if ((s.phase !== "idle" && s.phase !== "done") || s.rest) return s;
      const quip = POKES[Math.min(e.index, POKES.length - 1)];
      return { ...s, phase: "quip", cloud: quip, run: s.run + 1 };
    }
    case "more":
      if (s.phase === "asleep" || s.phase === "opener") return { ...s, shown: { kind: "more" } };
      return speak(s, [MORE], { kind: "more" }, null);
    case "less": {
      if (s.shown.kind !== "more") return s;
      const id = s.cloud.id.replace(/^a-/, "");
      const said = s.cloud.id.startsWith("a-") && ANSWERS.some((a) => a.id === id);
      return { ...s, shown: said ? { kind: "answer", id } : { kind: "chapter", id: s.chapter ?? CHAPTERS[0].id } };
    }
    case "say":
      return speak(s, e.lines, s.shown, null);
    case "stop": {
      if (s.phase === "opener") return { ...s, phase: "done", met: true };
      /* Cut short, the last quip still leaves him in hibernation: he has already said so. */
      if (s.phase === "quip" && s.cloud.id === POKES[POKES.length - 1].id) return { ...s, phase: s.met ? "done" : "idle", cloud: RESTING, rest: true };
      if (s.phase === "talking" || s.phase === "quip") return { ...s, phase: s.met ? "done" : "idle" };
      return s;
    }
  }
}

/* How the guide shows a state. */
export const mode = (s: State): "sleep" | "idle" | "talk" | "opener" | "rest" =>
  s.phase === "asleep" ? "sleep" : s.phase === "opener" ? "opener" : s.phase === "talking" || s.phase === "quip" ? "talk" : s.rest ? "rest" : "idle";

export const speaking = (s: State) => s.phase === "opener" || s.phase === "talking" || s.phase === "quip";
export const pokeable = (s: State) => !s.rest && (s.phase === "asleep" || s.phase === "idle" || s.phase === "done");
