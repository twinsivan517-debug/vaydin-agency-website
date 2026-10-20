"use client";

/* Her, small, in the corner of the site's other pages, inside a frame the
   page adds once it has loaded (public/guide/corner.js). A tap opens a
   panel: she welcomes the visitor and offers the page's summary; a yes plays
   it, a no opens the list. Questions, the list and small talk work as on the
   home page. The frame is told when the panel opens and closes, and sizes
   itself; a link opens in the page, not in the frame. */

import { useEffect, useReducer, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Card } from "@/components/Card";
import { Guide, type GuideHandle, type LineOutcome } from "@/components/Guide";
import { answer, answerLine, type Answer } from "@/lib/answers";
import { followUp, match, yesNo, type Reply } from "@/lib/match";
import { SUMMARIES, WELCOME } from "@/lib/pages";
import { lineClip, talkTime, type Line } from "@/lib/pitch";
import { START, mode, reduce, replyLines, speaking, type State } from "@/lib/pitchMachine";
import { speaker, type Speaker } from "@/lib/speaker";

const AWAKE: State = { ...START, phase: "done", met: true, cloud: WELCOME };

/* The page around the frame opens it to the panel's size, or back to hers. */
const tell = (open: boolean) => window.parent.postMessage({ vaydinCorner: open ? "open" : "closed" }, location.origin);

/* Which page she sits on, from the frame's address. */
const pageSummary = () => SUMMARIES[new URLSearchParams(location.search).get("p") ?? ""];

const BUTTON = "rounded-2xl border border-gold/40 px-3 py-1.5 text-sm text-gold-bright";

export function Corner() {
  const [state, dispatch] = useReducer(reduce, AWAKE);
  const [open, setOpen] = useState(false);
  /* True while she waits for a yes or no to the page's summary. */
  const [offering, setOffering] = useState(false);
  const [draft, setDraft] = useState("");
  const [noClip, setNoClip] = useState<string[]>([]);
  const guide = useRef<GuideHandle>(null);
  const voice = useRef<Speaker | null>(null);
  const busy = speaking(state);
  /* The card under her words, unless she is offering or saying the page's own lines. */
  const pageLine = state.cloud.id === WELCOME.id || Object.values(SUMMARIES).includes(state.cloud);
  const card = !offering && !pageLine && state.shown.kind !== "chapter";
  /* Her words above the card, unless the card already says them. */
  const echoed =
    card &&
    (["x-choose", "x-more", "x-unknown"].includes(state.cloud.id) || (state.shown.kind === "answer" && state.cloud.id === `a-${state.shown.id}`));

  /* As on the home page: her clip when the line has one, else its recording, else reading time. */
  const { phase, run, cloud } = state;
  const talking = phase === "talking";
  const clip = talking ? lineClip(cloud) : null;
  const clipSrc = clip && !noClip.includes(clip) ? clip : null;
  useEffect(() => {
    if (!talking || clipSrc) return;
    const sound = voice.current;
    let live = true;
    let timer = 0;
    const read = () => {
      timer = window.setTimeout(() => live && dispatch({ type: "line_ended" }), talkTime(cloud.text));
    };
    if (!sound || !cloud.audio) read();
    else
      sound.say(cloud.audio).then((outcome) => {
        if (!live) return;
        if (outcome === "ended") dispatch({ type: "line_ended" });
        else if (outcome === "failed") read();
      });
    return () => {
      live = false;
      window.clearTimeout(timer);
      sound?.stop();
    };
  }, [talking, run, cloud, clipSrc]);

  function lineEnded(outcome: LineOutcome) {
    if (outcome === "ended") dispatch({ type: "line_ended" });
    else if (clipSrc) setNoClip((list) => (list.includes(clipSrc) ? list : [...list, clipSrc]));
  }

  useEffect(() => {
    const hide = () => document.hidden && dispatch({ type: "stop" });
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, []);

  function unlock() {
    (voice.current ??= speaker()).arm();
    guide.current?.unlock();
  }

  function ready(line: Line | undefined) {
    const clip = line && lineClip(line);
    if (clip && !noClip.includes(clip)) guide.current?.prime(clip, false);
  }

  function more() {
    unlock();
    setOffering(false);
    dispatch({ type: "more" });
  }

  function summarise() {
    const summary = pageSummary();
    if (!summary) return more();
    unlock();
    setOffering(false);
    dispatch({ type: "say", lines: [summary] });
  }

  function openUp() {
    unlock();
    if (!open) {
      setOpen(true);
      tell(true);
    }
    const summary = pageSummary();
    if (!summary) return more();
    setOffering(true);
    dispatch({ type: "say", lines: [WELCOME] });
    ready(summary);
  }

  function close() {
    dispatch({ type: "stop" });
    setOpen(false);
    setOffering(false);
    tell(false);
  }

  /* A typed line: a yes or no to the summary, a reply to "Did you mean", or a question. */
  function heard(text: string): Reply | "more" | "summary" {
    if (offering) {
      const said = yesNo(text);
      if (said) return said === "yes" ? "summary" : "more";
    }
    return followUp(text, state.shown.kind === "choose" ? state.shown.ids.map(answer) : []) ?? match(text);
  }

  function ask(text: string) {
    const reply = heard(text);
    if (reply === "summary") return summarise();
    if (reply === "more") return more();
    unlock();
    setOffering(false);
    dispatch({ type: "ask", reply });
  }

  function pick(a: Answer) {
    unlock();
    setOffering(false);
    dispatch({ type: "ask", reply: { kind: "answer", answer: a } });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    ask(text);
  }

  /* Links lead the page, not the frame. */
  function lead(event: MouseEvent) {
    const link = event.target instanceof Element ? event.target.closest("a") : null;
    if (!link?.href) return;
    event.preventDefault();
    window.top!.location.href = link.href;
  }

  return (
    <div className="flex h-dvh flex-col items-end justify-end gap-2 overflow-hidden p-1">
      {open && (
        <section
          aria-label="Ask Vaydin"
          onClickCapture={lead}
          onKeyDown={(event) => event.key === "Escape" && close()}
          className="relative flex max-h-full min-h-0 w-full flex-col gap-3 overflow-y-auto rounded-3xl border border-gold/30 bg-[#120c08] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 text-xl leading-none text-muted">
            {"×"}
          </button>
          <p aria-live="polite" className={echoed ? "sr-only" : "pr-6 text-[0.95rem] leading-snug"}>
            {state.cloud.text}
          </p>
          {offering ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={summarise} className={`${BUTTON} bg-gold/15`}>
                Yes, tell me
              </button>
              <button type="button" onClick={more} className={BUTTON}>
                No, thanks
              </button>
            </div>
          ) : (
            card && (
              /* Room above the card for its folder tab. */
              <div className="pt-2">
                <Card key={`${state.run}-${state.shown.kind}`} shown={state.shown} onPick={pick} onSoon={(a) => ready(answerLine(a))} onMore={more} />
              </div>
            )
          )}
          <div className="flex flex-col gap-2">
            {state.shown.kind !== "more" && (
              <button type="button" onClick={more} className={`${BUTTON} self-start`}>
                {"…"} More questions
              </button>
            )}
            <form onSubmit={submit} className="flex gap-2">
              <label htmlFor="corner-ask" className="sr-only">
                Your question
              </label>
              <input
                id="corner-ask"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  const reply = event.target.value.trim().length > 2 ? heard(event.target.value) : null;
                  if (reply && reply !== "more" && reply !== "summary") ready(replyLines(reply)[0]);
                }}
                placeholder="Ask her…"
                className="min-w-0 flex-1 rounded-full border border-gold/30 bg-transparent px-4 py-2 text-sm"
              />
              <button type="submit" className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-[#120c08]">
                Ask
              </button>
            </form>
          </div>
        </section>
      )}
      <div className="relative h-[180px] w-[101px] shrink-0">
        {!open && (
          <span aria-hidden="true" className="absolute -top-6 right-0 whitespace-nowrap rounded-full bg-gold px-2.5 py-0.5 text-xs font-medium text-[#120c08]">
            Ask me
          </span>
        )}
        <Guide
          ref={guide}
          small
          mode={mode(state)}
          run={state.run}
          lineSrc={clipSrc}
          mood={null}
          pokeable={false}
          onOpenerTime={() => {}}
          onOpenerEnd={() => {}}
          onLineEnd={lineEnded}
          onPoke={() => {}}
        />
        <button
          type="button"
          onClick={busy ? () => dispatch({ type: "stop" }) : openUp}
          aria-label={busy ? "Stop her" : "Ask Vaydin about this page"}
          className="absolute inset-0 z-30 cursor-pointer rounded-full"
        />
      </div>
    </div>
  );
}
