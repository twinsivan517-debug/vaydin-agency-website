"use client";

/* The hero: her, large, with a navy cloud by her head; beside her the five
   questions, the folder she pulls out for each, and a box to ask her
   anything. She sleeps until a tap wakes her, and the page sleeps with her:
   it lights up the moment she stands. That first tap unlocks sound for every
   line after it. */

import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { Guide, type GuideHandle, type LineOutcome } from "@/components/Guide";
import { type Answer } from "@/lib/answers";
import { match } from "@/lib/match";
import { BULB_FLIGHT, OPENER_AUDIO, POKES, QUESTIONS, THROW_AT, chapter, lineClip, talkTime, type ChapterId } from "@/lib/pitch";
import { START, mode, pokeable, reduce, speaking } from "@/lib/pitchMachine";
import { speaker, type Speaker } from "@/lib/speaker";
import { WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

/* A small sign on each question's chip. */
const ICONS: Record<string, string> = { what: "?", how: "\u2699", gain: "\u25B2", start: "\u25B6", price: "$" };

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
  /* The bulb in flight, in page pixels: where it starts, where the clip's bulb
     would be once it has left her frame (the page's bulb rides with it that
     far, covering it as it crosses the edge), where it lands, and its width. */
  const [bulb, setBulb] = useState<{ x0: number; y0: number; xm: number; ym: number; x1: number; y1: number; w: number } | null>(null);
  const thrown = useRef(false);
  const guide = useRef<GuideHandle>(null);
  const voice = useRef<Speaker | null>(null);
  const pokes = useRef({ count: 0, at: 0 });
  const busy = speaking(state);
  /* Line clips that would not play here: those lines fall back to the recording. */
  const [noClip, setNoClip] = useState<string[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.body.classList.add("site-asleep");
    return () => document.body.classList.remove("site-asleep", "site-awake");
  }, []);

  /* She lay back down after the last poke: the page dims with her, and the pokes start over. */
  useEffect(() => {
    if (state.phase !== "asleep" || !state.met) return;
    pokes.current = { count: 0, at: 0 };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.body.classList.remove("site-awake");
    document.body.classList.add("site-asleep");
  }, [state.phase, state.met]);

  /* A line is spoken by her clip when it has one; otherwise its recording
     plays, and when that cannot play either, the words stay up for reading time. */
  const { phase, run, cloud, lines, line: lineAt } = state;
  const talking = phase === "talking" || phase === "quip";
  const clip = talking ? lineClip(cloud) : null;
  const clipSrc = clip && !noClip.includes(clip) ? clip : null;
  useEffect(() => {
    if (!talking) return;
    const line = cloud;
    const next = phase === "talking" ? lines[lineAt + 1] : undefined;
    const sound = voice.current;
    const nextClip = next && lineClip(next);
    if (nextClip && !noClip.includes(nextClip)) guide.current?.prime(nextClip);
    else if (next?.audio) sound?.prefetch(next.audio);
    if (clipSrc) return;
    let live = true;
    let timer = 0;
    const read = () => {
      timer = window.setTimeout(() => live && dispatch({ type: "line_ended" }), talkTime(line.text));
    };
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
  }, [talking, phase, run, lineAt, cloud, lines, clipSrc, noClip]);

  function lineEnded(outcome: LineOutcome) {
    if (outcome === "ended") dispatch({ type: "line_ended" });
    else if (clipSrc) setNoClip((list) => (list.includes(clipSrc) ? list : [...list, clipSrc]));
  }

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
    thrown.current = false;
    dispatch({ type: "tap", chapter: "meet" });
    guide.current?.opener().then((ok) => setSpoken(!ok));
    /* The headers of the five questions' first clips, so a tap starts on the right frame. */
    for (const q of QUESTIONS) {
      const first = lineClip(q.lines[0]);
      if (first) guide.current?.prime(first, false);
    }
    /* The whole of the first line she speaks after the greeting: it follows
       with no tap, and nothing else loads it while the greeting plays. */
    const after = chapter("meet").lines.find((l) => l.audio);
    const afterClip = after && lineClip(after);
    if (afterClip) guide.current?.prime(afterClip, true);
  }

  /* The bulb she tossed leaves her frame and flies on to the mark; when it lands, the page lights. */
  function throwBulb() {
    if (thrown.current) return;
    thrown.current = true;
    const from = guide.current?.exit();
    const mark = document.querySelector(".mark img")?.getBoundingClientRect();
    if (from && mark && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      /* The clip's bulb drifts 0.03 widths left and 0.085 heights up in the 0.4 s it takes to leave the frame. */
      const h = (from.width * 16) / 9;
      setBulb({
        x0: from.x,
        y0: from.y,
        xm: from.x - from.width * 0.03,
        ym: from.y - h * 0.085,
        x1: mark.left + mark.width / 2,
        y1: mark.top + mark.height / 2,
        w: from.width * 0.13,
      });
      window.setTimeout(() => setBulb(null), BULB_FLIGHT * 1000 + 600);
      window.setTimeout(lightUp, BULB_FLIGHT * 1000);
    } else lightUp();
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

  /* The greeting as sound alone, when its clip is missing or refused. */
  useEffect(() => {
    if (state.phase !== "opener" || !spoken) return;
    const sound = voice.current;
    if (!sound) return;
    let live = true;
    sound
      .say(OPENER_AUDIO, (seconds) => {
        if (!live) return;
        /* No clip, so no bulb to take over from: the page simply lights at the same second. */
        if (seconds >= THROW_AT && !thrown.current) {
          thrown.current = true;
          lightUp();
        }
        dispatch({ type: "cloud_at", seconds });
      })
      .then((outcome) => live && outcome !== "stopped" && dispatch({ type: "line_ended" }));
    return () => {
      live = false;
      sound.stop();
    };
  }, [state.phase, state.run, spoken]);

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
        <div className="guide-floor relative aspect-[9/16] w-full md:aspect-auto md:h-[min(76vh,620px)]">
          {busy && (
            <button type="button" onClick={() => dispatch({ type: "stop" })} className="guide-stop" aria-label="Stop her">
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
                <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
            </button>
          )}
          <Guide
            ref={guide}
            mode={mode(state)}
            run={state.run}
            lineSrc={clipSrc}
            mood={state.phase === "quip" && !clipSrc ? (state.cloud.mood ?? null) : null}
            pokeable={pokeable(state)}
            onOpenerTime={(seconds) => {
              if (seconds >= THROW_AT) throwBulb();
              dispatch({ type: "cloud_at", seconds });
            }}
            onOpenerEnd={() => dispatch({ type: "line_ended" })}
            onLineEnd={lineEnded}
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

      <ul className="hero-chips wakes" aria-label="Questions">
        {QUESTIONS.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => tap(c.id)} aria-pressed={c.id === state.chapter} className="chip">
              <i aria-hidden="true">{ICONS[c.id] ?? "?"}</i>
              {c.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="hero-card wakes min-w-0">
        {/* The key remounts the card, so each answer's folder is pulled out afresh. */}
        <Card key={state.run} shown={state.shown} onPick={pick} />
      </div>

      <div className="hero-ask wakes min-w-0">
        <div>
          <form onSubmit={submit} className="flex gap-2">
            <label htmlFor="ask" className="sr-only">
              Your question
            </label>
            <input
              id="ask"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask her…"
              autoComplete="off"
              enterKeyHint="send"
              maxLength={200}
              className="min-w-0 flex-1 rounded-full border border-gold/40 bg-white/[0.04] px-4 py-3 text-base text-foreground placeholder:text-muted"
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

      {bulb && (
        <svg
          aria-hidden="true"
          className="bulb"
          viewBox="0 0 24 34"
          style={
            {
              "--x0": `${bulb.x0}px`,
              "--y0": `${bulb.y0}px`,
              "--xm": `${bulb.xm}px`,
              "--ym": `${bulb.ym}px`,
              "--x1": `${bulb.x1}px`,
              "--y1": `${bulb.y1}px`,
              "--w": `${bulb.w}px`,
            } as React.CSSProperties
          }
        >
          <path d="M12 2a9 9 0 0 0-5 16.5V23h10v-4.5A9 9 0 0 0 12 2Z" fill="#f5d978" />
          <rect x="8" y="24" width="8" height="3" rx="1" fill="#c9a44a" />
          <rect x="9" y="28" width="6" height="3" rx="1" fill="#c9a44a" />
        </svg>
      )}

      {/* On a phone the bar is one slim row, WhatsApp as an icon, so it covers little of her. */}
      <div className={`hero-bar wakes sticky bottom-0 -mx-5 mt-6 flex items-center gap-3 border-t border-gold/15 bg-background/95 px-5 py-2 backdrop-blur sm:-mx-12 sm:px-12 md:py-3 ${state.lit ? "cta-lit" : ""}`}>
        <a href={WHATSAPP} aria-label={`WhatsApp ${WHATSAPP_SHOWN}`} className="flex items-center gap-2 rounded-full bg-gold-bright p-2.5 text-base font-medium text-background md:px-6 md:py-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.1.6 2.8.5a2.4 2.4 0 0 0 1.6-1.1c.2-.6.2-1 .1-1.1l-.5-.3Z" />
          </svg>
          <span className="hidden md:inline">WhatsApp · {WHATSAPP_SHOWN}</span>
        </a>
        <a href="/pricing.html" className="rounded-full border border-gold px-4 py-2 text-sm text-gold-bright md:px-6 md:py-3 md:text-base">
          See the plans
        </a>
      </div>
    </section>
  );
}
