"use client";

/* The hero: him, in gold dots, with his cloud and the card he shows on one
   side and the five doors on the other; under him a box to ask him anything
   and the questions. On a first visit he wakes by himself in the dark room:
   his dots gather, part of his light flies to the logo, and as it lands a
   shimmer crosses the page and lights it. He stays silent until the first
   touch, which unlocks sound for every line after it; a tap on plain page or
   on him starts his greeting, a question starts its answer. */

import { useEffect, useEffectEvent, useReducer, useRef, useState, type FormEvent } from "react";
import { Card } from "@/components/Card";
import { Figure } from "@/components/Figure";
import { DOORS } from "@/lib/doors";
import type { GuideHandle } from "@/components/Guide";
import { MORE, UNKNOWN, answer, answerLine, type Answer } from "@/lib/answers";
import { afterTalk, followUp, match, type Reply } from "@/lib/match";
import { OPENER_AUDIO, POKES, QUESTIONS, THROW_AT, WAITING, chapter, talkTime, type ChapterId, type Line } from "@/lib/pitch";
import { START, mode, pokeable, reduce, replyLines, speaking } from "@/lib/pitchMachine";
import { speaker, type Speaker } from "@/lib/speaker";
import { WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

type Point = { x: number; y: number };

/* A small sign on each question's chip. */
const ICONS: Record<string, string> = { what: "?", how: "\u2699", gain: "\u25B2", start: "\u25B6", price: "$" };

/* How long a line is, for the phone's cloud: it keeps one height, so a long
   line takes a smaller size rather than more room. */
const long = (text: string) => (text.length > 250 ? "3" : text.length > 170 ? "2" : text.length > 110 ? "1" : undefined);

/* He has no clips: every line he says is its recording. */
const lineClip = (line?: Line): string | null => (line ? null : null);

const glide = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

/* The page dims while he sleeps and lights up when his light reaches the logo. */
function lightUp() {
  document.body.classList.remove("site-asleep");
  document.body.classList.add("site-awake");
}

/* The shimmer that crosses the page as it lights, once per waking. */
function shimmer() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.body.classList.add("site-shimmer");
  window.setTimeout(() => document.body.classList.remove("site-shimmer"), 1800);
}

export function Stage() {
  const [state, dispatch] = useReducer(reduce, START);
  const [draft, setDraft] = useState("");
  /* True when the greeting clip could not play and his recording speaks instead (always, for him). */
  const [spoken, setSpoken] = useState(false);
  const thrown = useRef(false);
  /* He has woken by himself: set a moment after the page first paints, so the gathering is seen. */
  const [up, setUp] = useState(false);
  /* The visitor has touched the page: sound is unlocked, and the visit is no longer a first look. */
  const [touched, setTouched] = useState(false);
  /* Before any touch: he is up, silent, and his cloud says how to hear him. */
  const first = state.phase === "asleep" && !touched;
  const guide = useRef<GuideHandle>(null);
  const voice = useRef<Speaker | null>(null);
  /* Never poked yet: a first poke in the page's first eight seconds is still the first. */
  const pokes = useRef({ count: 0, at: -Infinity });
  const hero = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const busy = speaking(state);
  /* The questions light one by one once the greeting has handed over to them. */
  const offered = state.met || (state.phase !== "asleep" && state.phase !== "opener");
  /* Line clips that would not play here: those lines fall back to the recording. */
  const [noClip] = useState<string[]>([]);
  /* From the tap that wakes him until his greeting plays; over with the greeting, however it ends. */
  const [stirring, setWaking] = useState(false);
  const waking = stirring && state.phase === "opener";
  const [ripple, setRipple] = useState<(Point & { key: number }) | null>(null);
  const ripples = useRef(0);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!still) document.body.classList.add("site-asleep");
    const timer = window.setTimeout(() => setUp(true), still ? 0 : 450);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("site-asleep", "site-awake", "site-shimmer");
    };
  }, []);

  /* Once he has been met and is up, the page is lit, even after a greeting
     stopped early (Stop, a tab switch). He never sleeps again: the last poke
     only puts him in hibernation, and the page stays lit. */
  useEffect(() => {
    if (state.met && state.phase !== "asleep" && state.phase !== "opener") lightUp();
  }, [state.phase, state.met]);

  /* Out of hibernation, the pokes start over. */
  useEffect(() => {
    if (!state.rest) pokes.current = { count: 0, at: -Infinity };
  }, [state.rest]);

  /* On a phone the card sits below the fold: the list is brought up to
     where it can be seen. */
  useEffect(() => {
    const list = card.current;
    if (state.shown.kind === "more" && list && list.getBoundingClientRect().top > window.innerHeight * 0.6) {
      list.scrollIntoView({ behavior: glide(), block: "start" });
    }
  }, [state.shown.kind]);

  /* While she asks "Did you mean", a yes is the likeliest reply: her first offer loads. */
  const firstOffer = state.shown.kind === "choose" ? state.shown.ids[0] : null;
  const readyOffer = useEffectEvent((id: string) => ready(answerLine(answer(id))));
  useEffect(() => {
    if (firstOffer) readyOffer(firstOffer);
  }, [firstOffer]);

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
    setTouched(true);
    (voice.current ??= speaker()).arm();
    guide.current?.unlock();
  }

  /* A line's clip, loaded ahead: its header, or all of it. */
  function ready(line: Line | undefined, full = false) {
    const clip = line && lineClip(line);
    if (clip && !noClip.includes(clip)) guide.current?.prime(clip, full);
  }

  function wake(point?: Point) {
    unlock();
    thrown.current = false;
    dispatch({ type: "tap", chapter: "meet" });
    /* Under reduced motion her first line shows at once, as before. */
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setWaking(true);
      signal(point);
    }
    /* Only the clip playing ends the waking: the seek before play fires a time event at zero. */
    guide.current?.opener().then((ok) => {
      setSpoken(!ok);
      setWaking(false);
    });
    /* After the greeting, in the order she may need them: the whole of the
       line that follows it with no tap, the headers of the five questions'
       first lines, her first poke reply, and her answer to a question she
       does not know. */
    ready(
      chapter("meet").lines.find((l) => l.audio),
      true,
    );
    for (const q of QUESTIONS) ready(q.lines[0]);
    ready(POKES[0]);
    ready(UNKNOWN);
  }

  /* What the tap shows at once: a ring at the finger. A wake with no pointer (a key) has none. */
  function signal(point?: Point) {
    if (point) setRipple({ ...point, key: ++ripples.current });
  }

  /* The ring is gone once it has spread. */
  useEffect(() => {
    if (!ripple) return;
    const timer = window.setTimeout(() => setRipple(null), 1200);
    return () => window.clearTimeout(timer);
  }, [ripple]);

  /* While she sleeps, a tap anywhere on the page wakes her; a control keeps
     its own job, and her own button already wakes her. */
  const wakeFrom = useEffectEvent((event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, summary, label, .figure-stage")) return;
    wake(event.detail ? { x: event.clientX, y: event.clientY } : undefined);
  });
  useEffect(() => {
    if (state.phase !== "asleep") return;
    const anywhere = (event: MouseEvent) => wakeFrom(event);
    document.addEventListener("click", anywhere);
    /* iPhones send a tap on plain page as a click only where it looks tappable. */
    document.body.style.cursor = "pointer";
    return () => {
      document.removeEventListener("click", anywhere);
      document.body.style.cursor = "";
    };
  }, [state.phase]);

  function tap(id: ChapterId) {
    if (chapter(id).clip === "opener") return wake();
    unlock();
    lightUp();
    dispatch({ type: "tap", chapter: id });
  }

  /* What a typed line means here: a reply to her last question, to "Did you mean", or a question. */
  function heard(text: string): Reply | "more" {
    return (
      afterTalk(text, state.cloud.id) ?? followUp(text, state.shown.kind === "choose" ? state.shown.ids.map(answer) : []) ?? match(text)
    );
  }

  function ask(text: string) {
    const reply = heard(text);
    if (reply === "more") return more();
    unlock();
    lightUp();
    dispatch({ type: "ask", reply });
  }

  /* The list opens on the card, and the same chip closes it; asleep, she wakes as for any other chip. */
  function more() {
    if (state.phase === "asleep") wake();
    else unlock();
    dispatch({ type: state.shown.kind === "more" && state.phase !== "asleep" ? "less" : "more" });
  }

  function pick(a: Answer) {
    unlock();
    lightUp();
    /* Picked from a list scrolled up past her: back to her, to see her answer. */
    if ((hero.current?.getBoundingClientRect().top ?? 0) < 0) window.scrollTo({ top: 0, behavior: glide() });
    /* From the list, the list stays open for the next question. */
    dispatch({ type: "ask", reply: { kind: "answer", answer: a }, keep: state.shown.kind === "more" });
  }

  /* `at` is the tap's own timestamp: pokes within eight seconds escalate. */
  function poke(at: number, point?: Point) {
    if (state.phase === "asleep") return wake(point);
    const count = at - pokes.current.at > 8000 ? 0 : Math.min(pokes.current.count + 1, POKES.length - 1);
    pokes.current = { count, at };
    unlock();
    dispatch({ type: "poke", index: count });
    ready(POKES[Math.min(count + 1, POKES.length - 1)]);
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
        /* The page lights at this second if his light has not lit it already. */
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
    <section
      ref={hero}
      aria-label="The guide"
      className={`hero relative ${offered ? "offered" : ""}`}
      /* A pointer that can hover is a tap coming: her greeting loads while it is over her. */
      onPointerEnter={(event) => event.pointerType === "mouse" && state.phase === "asleep" && guide.current?.warm()}
    >
      {/* The page's first words and its headline: who this is, before her cloud. */}
      <h1 className="hero-name wakes font-display text-base leading-snug text-muted md:text-lg">
        <span className="label mr-3 text-gold-bright">Vaydin Agency · Dubai</span>
        We find the patients your clinic never saw.
      </h1>

      <div aria-live="polite" className="hero-cloud">
        <div key={state.cloud.id} className="cloud">
          <p data-long={waking || first ? undefined : long(state.cloud.text)} className="text-[1.05rem] leading-snug md:text-lg">
            {waking ? (
              <>
                Mmm
                <span className="dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </>
            ) : (
              (first ? WAITING : state.cloud).text
            )}
          </p>
          <span aria-hidden="true" className="cloud-tail">
            <i />
            <i />
          </span>
        </div>
      </div>

      <div ref={card} className="hero-card wakes min-w-0">
        {/* The key remounts the card, so each answer's folder is pulled out afresh. */}
        <Card
          key={state.shown.kind === "more" ? "more" : `${state.run}-${state.shown.kind}`}
          shown={state.shown}
          onPick={pick}
          onSoon={(a) => ready(answerLine(a))}
          onMore={more}
          onLess={() => dispatch({ type: "less" })}
          current={busy ? state.cloud.id.replace(/^a-/, "") : undefined}
        />
      </div>

      <div className="hero-guide">
        <div className="guide-floor relative">
          {busy && (
            <button type="button" onClick={() => dispatch({ type: "stop" })} className="guide-stop" aria-label="Stop him">
              <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
                <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
              </svg>
            </button>
          )}
          <Figure
            ref={guide}
            mode={first ? (up ? "idle" : "sleep") : mode(state)}
            audio={() => voice.current?.audio ?? null}
            pokeable={pokeable(state)}
            onPoke={poke}
            onLit={() => {
              lightUp();
              shimmer();
            }}
          />
        </div>
      </div>

      {/* The five pages beside him, the doors his light rings when he names one. */}
      <nav className="hero-doors wakes" aria-label="The five pages">
        {DOORS.map((d) => (
          <a key={d.href} href={d.href} data-figure-door="" className="hero-door" style={{ "--accent": d.accent } as React.CSSProperties}>
            <small>{d.step ?? d.tag}</small>
            <b>{d.word}</b>
            <span>{d.title}</span>
          </a>
        ))}
      </nav>

      <div className="hero-ask min-w-0" style={{ "--i": QUESTIONS.length + 1 } as React.CSSProperties}>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="ask" className="sr-only">
            Your question
          </label>
          <input
            id="ask"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              /* His reply to what is typed so far loads while the visitor types. */
              const reply = event.target.value.trim().length > 2 ? heard(event.target.value) : null;
              if (reply && reply !== "more") ready(replyLines(reply)[0]);
            }}
            placeholder="Ask me about your clinic…"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={200}
            className="min-w-0 flex-1 rounded-full border border-gold/40 bg-white/[0.04] px-4 py-3 text-base text-foreground placeholder:text-muted"
          />
          <button type="submit" className="rounded-full bg-gold-bright px-5 py-3 text-base font-medium text-background">
            Ask
          </button>
        </form>
      </div>

      <ul className="hero-chips" aria-label="Questions">
        {QUESTIONS.map((c, i) => (
          <li key={c.id} style={{ "--i": i } as React.CSSProperties}>
            <button type="button" onClick={() => tap(c.id)} aria-pressed={c.id === state.chapter && state.shown.kind === "chapter"} className="chip">
              <i aria-hidden="true">{ICONS[c.id] ?? "?"}</i>
              {c.label}
            </button>
          </li>
        ))}
        <li style={{ "--i": QUESTIONS.length } as React.CSSProperties}>
          <button type="button" onPointerDown={() => ready(MORE)} onClick={more} aria-pressed={state.shown.kind === "more"} className="chip">
            <i aria-hidden="true">{"…"}</i>
            More questions
          </button>
        </li>
      </ul>

      <p className="hero-note text-center text-xs leading-relaxed text-muted">He answers only from Vaydin&apos;s own pages. Nothing you type is saved or sent.</p>

      {ripple && <span key={ripple.key} aria-hidden="true" className="ripple" style={{ left: ripple.x, top: ripple.y }} />}

      {/* On a phone the bar is one slim row, WhatsApp as an icon, so it covers
          little of her; at its right, the way down to the five pages. */}
      <div className={`hero-bar wakes sticky bottom-0 -mx-5 mt-6 flex items-center gap-3 border-t border-gold/15 bg-background/95 px-5 py-2 backdrop-blur sm:-mx-12 sm:px-12 md:py-3 ${state.lit ? "cta-lit" : ""}`}>
        <a href={WHATSAPP} aria-label={`WhatsApp ${WHATSAPP_SHOWN}`} className="flex items-center gap-2 rounded-full bg-gold-bright p-2.5 text-base font-medium text-background md:px-6 md:py-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.1.6 2.8.5a2.4 2.4 0 0 0 1.6-1.1c.2-.6.2-1 .1-1.1l-.5-.3Z" />
          </svg>
          <span className="hidden md:inline">WhatsApp · {WHATSAPP_SHOWN}</span>
        </a>
        <a href="/pricing.html" className="rounded-full border border-gold px-4 py-2 text-sm text-gold-bright md:px-6 md:py-3 md:text-base">
          Ask for your plan
        </a>
        <a href="#pages" className="label ml-auto flex items-center gap-1.5 whitespace-nowrap text-gold-bright">
          <span className="hidden sm:inline">The five pages</span>
          <span className="sm:hidden">Pages</span>
          <svg aria-hidden="true" viewBox="0 0 12 12" width="12" height="12">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </a>
      </div>
    </section>
  );
}
