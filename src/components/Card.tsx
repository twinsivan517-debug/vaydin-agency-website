/* The card beside the guide: the chapter he is telling, the answer to a
   question, a choice when a question could mean two things or was misspelt,
   a hand-off when he has no answer, or every question he can answer. */

import { GROUPS, answer, type Answer } from "@/lib/answers";
import { TOUR, chapter, type ChapterId } from "@/lib/pitch";
import type { Shown } from "@/lib/pitchMachine";
import { WHATSAPP } from "@/lib/site";

/* Each card is a folder he pulls out: it swings in from his side, and its
   lines drop out one after another while he speaks. Small and plain: what he
   says is in his cloud, so a card carries only what the cloud does not. */
const CARD = "folder relative rounded-2xl border border-accent/25 bg-white/[0.03] p-4 backdrop-blur-sm";
const PAGE = "rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5 text-sm text-accent-bright transition-colors hover:bg-accent/20";
const LINK = "label inline-block border-b border-transparent text-accent-bright transition-colors hover:border-accent-bright";

/* A finger landing on a question starts his answer loading before it lifts. */
type Pick = { onPick: (a: Answer) => void; onSoon: (a: Answer) => void };

function Chips({ answers, onPick, onSoon, full, current }: Pick & { answers: Answer[]; full?: boolean; current?: string }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {answers.map((a) => (
        <button
          key={a.id}
          type="button"
          onPointerDown={() => onSoon(a)}
          onClick={() => onPick(a)}
          aria-pressed={a.id === current}
          className="rounded-2xl border border-accent/40 px-3 py-1.5 text-left text-sm text-accent-bright aria-pressed:bg-accent/20"
        >
          {full ? a.question : a.short}
        </button>
      ))}
    </div>
  );
}

/* `current` is the answer he is giving, marked in the list. */
/* `onTour` opens a chapter from the More list; the corner, which has no chapters, leaves it out. */
type Props = Pick & { shown: Shown; onMore: () => void; onLess?: () => void; onTour?: (id: ChapterId) => void; onTourSoon?: (id: ChapterId) => void; current?: string };

export function Card({ shown, onPick, onSoon, onMore, onLess, onTour, onTourSoon, current }: Props) {
  if (shown.kind === "unknown") {
    return (
      <div className={CARD}>
        <p className="font-display text-xl">Not one I know yet</p>
        <p className="mt-2 leading-7 text-muted">A person answers on WhatsApp. Or see every question I can answer.</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          <a href={WHATSAPP} className={LINK}>
            Ask on WhatsApp
          </a>
          <button type="button" onClick={onMore} className={LINK}>
            See all questions
          </button>
        </div>
      </div>
    );
  }
  if (shown.kind === "choose") {
    return (
      <div className={CARD}>
        <p className="font-display text-xl">Did you mean</p>
        <Chips answers={shown.ids.map(answer)} onPick={onPick} onSoon={onSoon} />
        <a href={WHATSAPP} className={`${LINK} mt-4`}>
          None of these? Ask on WhatsApp
        </a>
      </div>
    );
  }
  if (shown.kind === "more") {
    return (
      <div className={CARD}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-xl text-gold-bright">More questions</p>
          {onLess && (
            <button type="button" onClick={onLess} className="label shrink-0 pt-1.5 text-muted">
              Close {"\u00D7"}
            </button>
          )}
        </div>
        <p className="mt-2 leading-7 text-muted">Pick a subject, then a question, or type your own.</p>
        {/* The two chapters the chips no longer show come first, open. */}
        {onTour && (
          <div className="mt-3 border-t border-accent/15 pt-3">
            <p className="label text-accent-bright">He tells it ({TOUR.length})</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOUR.map((c) => (
                <button key={c.id} type="button" onPointerDown={() => onTourSoon?.(c.id)} onClick={() => onTour(c.id)} className="rounded-2xl border border-accent/40 px-3 py-1.5 text-left text-sm text-accent-bright">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* All shut at first, so the visitor picks the subject; one open at a time. */}
        {GROUPS.map((group) => (
          <details key={group.title} name="more" className="mt-3 border-t border-accent/15 pt-3">
            <summary className="label cursor-pointer text-accent-bright">
              {group.title} ({group.ids.length})
            </summary>
            <Chips answers={group.ids.map(answer)} onPick={onPick} onSoon={onSoon} full current={current} />
          </details>
        ))}
        <a href={WHATSAPP} className={`${LINK} mt-4`}>
          Not on the list? Ask on WhatsApp
        </a>
      </div>
    );
  }
  if (shown.kind === "answer") {
    const a = answer(shown.id);
    return (
      <div className={CARD}>
        <p className="label text-accent-bright">{a.question}</p>
        <p className="mt-2 text-sm leading-6">{a.answer}</p>
        <a href={a.link.href} className={`${PAGE} mt-3 inline-block`}>
          {a.link.label}
        </a>
      </div>
    );
  }
  const card = chapter(shown.id).card;
  return (
    <div className={CARD}>
      <p className="label text-gold-bright">{card.title}</p>
      <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted">
        {card.facts.map((fact, index) => (
          <li key={fact} className="folder-line flex gap-2.5" style={{ animationDelay: `${0.9 + index * 0.7}s` }}>
            <span aria-hidden="true" className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-accent" />
            {fact}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {card.links.map((link) => (
          <a key={link.href} href={link.href} className={PAGE}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
