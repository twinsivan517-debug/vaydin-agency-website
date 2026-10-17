/* The card beside the guide: the chapter she is telling, the answer to a
   question, a choice when a question could mean two things, or a hand-off
   when she has no answer. */

import { ANSWERS, answer, type Answer } from "@/lib/answers";
import { chapter } from "@/lib/pitch";
import type { Shown } from "@/lib/pitchMachine";
import { WHATSAPP } from "@/lib/site";

const CARD = "rounded-3xl border border-gold/20 bg-[#161009] p-5";
const LINK = "label inline-block border-b border-transparent text-gold-bright transition-colors hover:border-gold-bright";

function Chips({ answers, onPick }: { answers: Answer[]; onPick: (a: Answer) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {answers.map((a) => (
        <button key={a.id} type="button" onClick={() => onPick(a)} className="rounded-full border border-gold/40 px-3 py-1.5 text-sm text-gold-bright">
          {a.short}
        </button>
      ))}
    </div>
  );
}

export function Card({ shown, onPick }: { shown: Shown; onPick: (a: Answer) => void }) {
  if (shown.kind === "unknown") {
    return (
      <div className={CARD}>
        <p className="font-display text-xl">Not one I know yet</p>
        <p className="mt-2 leading-7 text-muted">A person answers on WhatsApp. Or try one of these.</p>
        <a href={WHATSAPP} className={`${LINK} mt-3`}>
          Ask on WhatsApp
        </a>
        <Chips answers={ANSWERS.slice(0, 4)} onPick={onPick} />
      </div>
    );
  }
  if (shown.kind === "choose") {
    return (
      <div className={CARD}>
        <p className="font-display text-xl">Did you mean</p>
        <Chips answers={shown.ids.map(answer)} onPick={onPick} />
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
        <p className="mt-4 text-xs text-muted">From vaydin.agency{a.source}</p>
      </div>
    );
  }
  const card = chapter(shown.id).card;
  return (
    <div className={CARD}>
      <p className="font-display text-xl text-gold-bright">{card.title}</p>
      <p className="mt-2 leading-7">{card.body}</p>
      <ul className="mt-4 space-y-2 text-muted">
        {card.facts.map((fact) => (
          <li key={fact} className="flex gap-3">
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
