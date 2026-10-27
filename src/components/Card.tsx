/* The card beside the guide: the chapter he is telling, the answer to a
   question, a choice when a question could mean two things or was misspelt,
   a hand-off when he has no answer, or every question he can answer. */

import { GROUPS, answer, type Answer } from "@/lib/answers";
import { TOUR, chapter, type ChapterId } from "@/lib/pitch";
import type { Shown } from "@/lib/pitchMachine";
import { WHATSAPP } from "@/lib/site";

/* Each card is a folder he pulls out: it swings in from his side, and its
   lines drop out one after another while he speaks. */
const CARD = "folder relative rounded-3xl border border-gold/20 bg-[#161009] p-5";
const LINK = "label inline-block border-b border-transparent text-gold-bright transition-colors hover:border-gold-bright";

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
          className="rounded-2xl border border-gold/40 px-3 py-1.5 text-left text-sm text-gold-bright aria-pressed:bg-gold/20"
        >
          {full ? a.question : a.short}
        </button>
      ))}
    </div>
  );
}

/* `current` is the answer he is giving, marked in the list. */
/* `onTour` opens a chapter from the More list; the corner, which has no chapters, leaves it out. */
type Props = Pick & { shown: Shown; onMore: () => void; onLess?: () => void; onTour?: (id: ChapterId) => void; current?: string };

export function Card({ shown, onPick, onSoon, onMore, onLess, onTour, current }: Props) {
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
          <div className="mt-3 border-t border-gold/15 pt-3">
            <p className="label text-gold-bright">He tells it ({TOUR.length})</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TOUR.map((c) => (
                <button key={c.id} type="button" onClick={() => onTour(c.id)} className="rounded-2xl border border-gold/40 px-3 py-1.5 text-left text-sm text-gold-bright">
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* All shut at first, so the visitor picks the subject; one open at a time. */}
        {GROUPS.map((group) => (
          <details key={group.title} name="more" className="mt-3 border-t border-gold/15 pt-3">
            <summary className="label cursor-pointer text-gold-bright">
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
        <p className="label text-gold-bright">{a.question}</p>
        <p className="mt-3 leading-7">{a.answer}</p>
        <a href={a.link.href} className={`${LINK} mt-4`}>
          {a.link.label}
        </a>
      </div>
    );
  }
  const card = chapter(shown.id).card;
  return (
    <div className={CARD}>
      <p className="font-display text-xl text-gold-bright">{card.title}</p>
      <p className="mt-2 leading-7">{card.body}</p>
      <ul className="mt-4 space-y-2 text-muted">
        {card.facts.map((fact, index) => (
          <li key={fact} className="folder-line flex gap-3" style={{ animationDelay: `${0.9 + index * 0.7}s` }}>
            <span aria-hidden="true" className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-gold" />
            {fact}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {card.links.map((link) => (
          <a key={link.href} href={link.href} className={LINK}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
