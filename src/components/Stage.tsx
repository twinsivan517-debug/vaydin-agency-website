"use client";

/* The hero: her, large, with a navy cloud by her head; beside her the five
   questions, the folder she pulls out for each, and a box to ask her
   anything. She sleeps until a tap wakes her, and the page sleeps with her:
   it lights up the moment she stands. That first tap unlocks sound for every
   line after it. */

import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { Guide, type GuideHandle } from "@/components/Guide";
import { type Answer } from "@/lib/answers";
import { match } from "@/lib/match";
import { OPENER_AUDIO, POKES, QUESTIONS, STANDS_AT, chapter, talkTime, type ChapterId } from "@/lib/pitch";
import { START, mode, pokeable, reduce, speaking } from "@/lib/pitchMachine";
import { speaker, type Speaker } from "@/lib/speaker";
import { WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

const CHIP =
  "rounded-full border border-gold/50 px-4 py-2 text-base text-gold-bright transition-colors aria-pressed:border-gold-bright aria-pressed:bg-gold-bright aria-pressed:text-background";

/* The page dims while she sleeps and lights up when she stands. */
function lightUp() {
  document.body.classList.remove("site-asleep");
  document.body.classList.add("site-awake");
}

export function Stage() {
  const [state, dispatch] = useReducer(reduce, START);
  const [draft, setDraft] = useState("");
  /* True when the greeting clip could not play and her recording speaks instead. */
  const [spoken, setSpoken] = useState(false);
  const guide = useRef<GuideHandle>(null);
  const voice = useRef<Speaker | null>(null);
  const pokes = useRef({ count: 0, at: 0 });
  const busy = speaking(state);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.body.classList.add("site-asleep");
    return () => document.body.classList.remove("site-asleep", "site-awake");
  }, []);

  /* The greeting as sound alone, when its clip is missing or refused. */
  useEffect(() => {
    if (state.phase !== "opener" || !spoken) return;
    const sound = voice.current;
    if (!sound) return;
    let live = true;
    lightUp();
    sound
      .say(OPENER_AUDIO, (seconds) => live && dispatch({ type: "cloud_at", seconds }))
      .then((outcome) => live && outcome !== "stopped" && dispatch({ type: "line_ended" }));
    return () => {
      live = false;
      sound.stop();
    };
  }, [state.phase, state.run, spoken]);

  /* A line's sound; when it cannot play, the words stay up for reading time. */
  const { phase, run, cloud, lines, line: lineAt } = state;
  useEffect(() => {
    if (phase !== "talking" && phase !== "quip") return;
    const line = cloud;
    const next = phase === "talking" ? lines[lineAt + 1] : undefined;
    const sound = voice.current;
    let live = true;
    let timer = 0;
    const read = () => {
      timer = window.setTimeout(() => live && dispatch({ type: "line_ended" }), talkTime(line.text));
    };
    if (next?.audio) sound?.prefetch(next.audio);
    if (!sound || !line.audio) read();
    else
      sound.say(line.audio).then((outcome) => {
        if (!live) return;
        if (outcome === "ended") dispatch({ type: "line_ended" });
        else if (outcome === "failed") read();
      });
    return () => {
      live = false;
      window.clearTimeout(timer);
      sound?.stop();
    };
  }, [phase, run, lineAt, cloud, lines]);

  useEffect(() => {
    const hide = () => document.hidden && dispatch({ type: "stop" });
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", hide);
    };
  }, []);

  function unlock() {
    (voice.current ??= speaker()).arm();
  }

  function wake() {
    unlock();
    dispatch({ type: "tap", chapter: "meet" });
    guide.current?.opener().then((ok) => setSpoken(!ok));
  }

  function tap(id: ChapterId) {
    if (chapter(id).clip === "opener") return wake();
    unlock();
    lightUp();
    dispatch({ type: "tap", chapter: id });
  }

  function ask(text: string) {
    unlock();
    lightUp();
    dispatch({ type: "ask", reply: match(text) });
  }

  function pick(a: Answer) {
    unlock();
    lightUp();
    dispatch({ type: "ask", reply: { kind: "answer", answer: a } });
  }

  /* `at` is the tap's own timestamp: pokes within eight seconds escalate. */
  function poke(at: number) {
    if (state.phase === "asleep") return wake();
    const count = at - pokes.current.at > 8000 ? 0 : Math.min(pokes.current.count + 1, POKES.length - 1);
    pokes.current = { count, at };
    unlock();
    dispatch({ type: "poke", index: count });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    ask(text);
  }

  return (
    <section aria-label="The guide" className="hero">
      <div className="hero-guide md:sticky md:top-16">
        <div className="guide-floor relative h-[min(44vh,360px)] md:h-[min(76vh,620px)]">
          <Guide
            ref={guide}
            mode={mode(state)}
            run={state.run}
            mood={state.phase === "quip" ? (state.cloud.mood ?? null) : null}
            pokeable={pokeable(state)}
            onOpenerTime={(seconds) => {
              if (seconds >= STANDS_AT) lightUp();
              dispatch({ type: "cloud_at", seconds });
            }}
            onOpenerEnd={() => dispatch({ type: "line_ended" })}
            onPoke={poke}
          />
        </div>
      </div>

      <div aria-live="polite" className="hero-cloud md:pt-12">
        <div key={state.cloud.id} className="cloud">
          <p className="text-[1.05rem] leading-snug md:text-lg">{state.cloud.text}</p>
          <span aria-hidden="true" className="cloud-tail">
            <i />
            <i />
          </span>
        </div>
      </div>

      <div className="hero-panel min-w-0">
        <div className="wakes flex flex-wrap items-center gap-2">
          <ul className="flex flex-wrap gap-2" aria-label="Questions">
            {QUESTIONS.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => tap(c.id)} aria-pressed={c.id === state.chapter} className={CHIP}>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
          {busy && (
            <button type="button" onClick={() => dispatch({ type: "stop" })} className="rounded-full border border-gold/30 px-4 py-2 text-base text-muted">
              Stop
            </button>
          )}
        </div>

        <div className="wakes mt-4">
          {/* The key remounts the card, so each answer's folder is pulled out afresh. */}
          <Card key={state.run} shown={state.shown} onPick={pick} />

          <form onSubmit={submit} className="mt-4 flex gap-2">
            <label htmlFor="ask" className="sr-only">
              Your question
            </label>
            <input
              id="ask"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask her anything about Vaydin…"
              autoComplete="off"
              enterKeyHint="send"
              maxLength={200}
              className="min-w-0 flex-1 rounded-full border border-gold/40 bg-background px-4 py-3 text-base text-foreground placeholder:text-muted"
            />
            <button type="submit" className="rounded-full bg-gold-bright px-5 py-3 text-base font-medium text-background">
              Ask
            </button>
          </form>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            She answers only from Vaydin&apos;s own pages. Nothing you type is saved or sent.
          </p>
        </div>
      </div>

      <div className={`hero-bar wakes sticky bottom-0 -mx-5 mt-6 flex flex-wrap gap-3 border-t border-gold/15 bg-background/95 px-5 py-3 backdrop-blur sm:-mx-12 sm:px-12 ${state.lit ? "cta-lit" : ""}`}>
        <a href={WHATSAPP} className="rounded-full bg-gold-bright px-6 py-3 text-base font-medium text-background">
          WhatsApp · {WHATSAPP_SHOWN}
        </a>
        <a href="/pricing.html" className="rounded-full border border-gold px-6 py-3 text-base text-gold-bright">
          See the plans
        </a>
      </div>
    </section>
  );
}
