"use client";

/* The stage around the guide: her speech cloud, the gold button that meets
   her, the chapter chips, Stop, the two buttons she lights at the end, and
   the transcript for anyone without script or sound. Sound starts only from
   a tap; one tap unlocks the page for every line after it. */

import { useEffect, useReducer, useRef } from "react";
import { Guide, type GuideHandle } from "@/components/Guide";
import { CHAPTERS, POKES, chapter, talkTime, type ChapterId } from "@/lib/pitch";
import { START, mode, pokeable, reduce, speaking } from "@/lib/pitchMachine";
import { speaker, type Speaker } from "@/lib/speaker";
import { WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

const CHIP =
  "rounded-full border border-gold/50 px-4 py-2 text-base text-gold-bright transition-colors aria-pressed:border-gold-bright aria-pressed:bg-gold-bright aria-pressed:text-background disabled:opacity-50";

export function Stage() {
  const [state, dispatch] = useReducer(reduce, START);
  const guide = useRef<GuideHandle>(null);
  const voice = useRef<Speaker | null>(null);
  const pokes = useRef({ count: 0, at: 0 });
  const chips = useRef<HTMLUListElement>(null);
  const busy = speaking(state);
  const arrived = state.phase !== "away";

  /* A line's sound; when it cannot play, the words stay up for reading time. */
  useEffect(() => {
    if (state.phase !== "talking" && state.phase !== "quip") return;
    const line = state.cloud;
    const next = state.phase === "talking" && state.chapter ? chapter(state.chapter).lines[state.line + 1] : undefined;
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
  }, [state]);

  useEffect(() => {
    const hide = () => document.hidden && dispatch({ type: "stop" });
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", hide);
    };
  }, []);

  useEffect(() => {
    const row = chips.current;
    const chip = row?.querySelector<HTMLElement>("[aria-pressed=true]");
    if (row && chip)
      row.scrollTo({
        left: chip.offsetLeft - row.offsetLeft - 20,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
  }, [state.chapter]);

  function tap(id: ChapterId) {
    if (chapter(id).clip === "opener") guide.current?.opener();
    else (voice.current ??= speaker()).arm();
    dispatch({ type: "tap", chapter: id });
  }

  function poke() {
    const now = Date.now();
    const count = now - pokes.current.at > 8000 ? 0 : Math.min(pokes.current.count + 1, POKES.length - 1);
    pokes.current = { count, at: now };
    (voice.current ??= speaker()).arm();
    dispatch({ type: "poke", index: count });
  }

  return (
    <section aria-label="The guide" className="w-full">
      <div aria-live="polite" className="speech-row">
        <div key={state.cloud.id} className="speech">
          <p className="text-[1.05rem] leading-snug">{state.cloud.text}</p>
          <span aria-hidden="true" className="speech-tail" />
        </div>
      </div>

      <div className="stage mt-5">
        <div className="stage-floor" aria-hidden="true" />
        <Guide
          ref={guide}
          mode={mode(state)}
          run={state.run}
          mood={state.phase === "quip" ? (state.cloud.mood ?? null) : null}
          pokeable={pokeable(state)}
          onArrive={() => dispatch({ type: "arrived" })}
          onOpenerTime={(seconds) => dispatch({ type: "cloud_at", seconds })}
          onOpenerEnd={() => dispatch({ type: "line_ended" })}
          onPoke={poke}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {state.met ? (
          <ul ref={chips} className="-mx-5 flex min-w-0 flex-1 gap-2 overflow-x-auto px-5 py-1" aria-label="Chapters">
            {CHAPTERS.map((c) => (
              <li key={c.id} className="shrink-0">
                <button type="button" onClick={() => tap(c.id)} aria-pressed={c.id === state.chapter} className={CHIP}>
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => tap("meet")}
            disabled={!arrived}
            className="rounded-full bg-gold-bright px-7 py-3 text-base font-medium text-background disabled:opacity-50"
          >
            Meet her
          </button>
        )}
        {busy && (
          <button type="button" onClick={() => dispatch({ type: "stop" })} className="shrink-0 rounded-full border border-gold/50 px-4 py-2 text-base text-muted">
            Stop
          </button>
        )}
      </div>

      <div className={`mt-5 flex flex-wrap gap-3 ${state.lit ? "cta-lit" : ""}`}>
        <a href={WHATSAPP} className="rounded-full bg-gold-bright px-6 py-3 text-base font-medium text-background">
          WhatsApp · {WHATSAPP_SHOWN}
        </a>
        <a href="/pricing.html" className="rounded-full border border-gold px-6 py-3 text-base text-gold-bright">
          See the plans
        </a>
      </div>

      <details className="mt-6 text-muted">
        <summary className="label cursor-pointer text-gold-bright">Read what she says</summary>
        <ol className="mt-3 space-y-2 text-base leading-7">
          {CHAPTERS.flatMap((c) => c.lines).map((line) => (
            <li key={line.id}>{line.text}</li>
          ))}
        </ol>
      </details>
    </section>
  );
}
