import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Stage } from "@/components/Stage";
import { answer } from "@/lib/answers";
import { SITE, WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/* The short FAQ: eight of his own answers, who Vaydin is, as plain text for
   visitors who read rather than tap and for search engines and AI assistants,
   and the same words in the page's FAQ record. His spoken address is written. */
const FAQ = ["what", "who", "where", "legit", "diagnostic", "engine", "bot", "price"].map((id) => {
  const a = answer(id);
  return { question: a.question, answer: a.answer.replaceAll("hello at vaydin dot agency", SITE.email) };
});

const FAQ_RECORD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

/* The problems a clinic lives with and what Vaydin does about each, under
   him, in the site's own claims (the diagnostic's and the engine's pages,
   and what he says); the one explanation a visitor who scrolls reads
   (2026-10-27, the owner's word, in place of the title repeated, a
   paragraph and his transcript). */
const PROBLEMS = [
  {
    title: "The message that waited",
    problem: "A new patient writes on WhatsApp or Instagram at nine in the evening. The reply comes in the morning, or never. The clinic that answered in a minute has her booking.",
    vaydin: "Every inquiry answered and booked on your own number, day and night, your reception approving with a tap.",
  },
  {
    title: "The booking that never showed",
    problem: "Consults slip without a reminder. Patients who had one treatment never hear from the clinic again. Nobody counts what that costs in a month.",
    vaydin: "Every patient reminded before, revived after, and every conversation carried to the finish, counted on one dashboard.",
  },
  {
    title: "The front door nobody checks",
    problem: "Your Google profile, reviews, Instagram and website are judged by patients every day and seen by nobody inside the clinic.",
    vaydin: "A real person shops your clinic unannounced every thirty to sixty days. Six rooms, one score, what to fix first. Then we run it: every review answered within a day.",
  },
];

/* The home page is the guide, his headline over him, the five pages beside
   him. Under him the problems and the answers, then the FAQ, so the page
   reads, and is found, before any script or clip arrives. (The five pages as
   tiles under him went on 2026-10-27, the owner's word: the tiles beside him
   and the menu already name them.) */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 pt-15 sm:px-12 sm:pt-20 md:pt-24">
          <Stage />
        </div>
        <section aria-labelledby="why-title" className="wakes mx-auto w-full max-w-6xl px-5 pt-20 pb-14 sm:px-12 md:pt-24">
          <p className="label text-gold-bright">Why clinics call Vaydin</p>
          <h2 id="why-title" className="mt-2 max-w-3xl font-display text-2xl leading-tight sm:text-3xl">
            A clinic loses patients in the places nobody inside is watching.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
            A patient looking for a treatment in Dubai tonight opens three doors before she ever walks in: your Google
            profile, your Instagram, your WhatsApp. She forms a verdict in minutes and books with whoever answers first
            and best. The clinic never finds out she existed.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((item, index) => (
              <li key={item.title} className="rounded-2xl border border-accent/20 bg-white/[0.03] p-5">
                <p className="label text-accent-bright">0{index + 1}</p>
                <h3 className="mt-2 font-display text-xl leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.problem}</p>
                <p className="mt-4 flex gap-2.5 text-sm leading-6">
                  <span aria-hidden="true" className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <span className="text-accent-bright">Vaydin: </span>
                    {item.vaydin}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
            Measured, not promised: the next unannounced shop scores us too. Vaydin Agency is a Dubai free-zone company,
            licensed under IFZA, for aesthetic and wellness clinics in the UAE and the GCC.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/diagnose.html" className="rounded-full bg-accent px-5 py-2.5 text-base font-medium text-background">
              Start with the diagnostic
            </a>
            <a href={WHATSAPP} className="rounded-full border border-accent px-5 py-2.5 text-base text-accent-bright">
              Ask on WhatsApp
            </a>
          </div>
        </section>
        <section aria-labelledby="faq-title" className="wakes mx-auto w-full max-w-6xl px-5 pb-12 sm:px-12">
          <h2 id="faq-title" className="label text-gold-bright">
            Questions clinics ask
          </h2>
          <div className="mt-4 grid max-w-4xl gap-x-10 gap-y-6 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.question}>
                <h3 className="font-display text-lg leading-snug">{f.question}</h3>
                <p className="mt-1 text-base leading-7 text-muted">{f.answer}</p>
              </div>
            ))}
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_RECORD) }} />
        </section>
        <footer className="wakes mx-auto w-full max-w-6xl border-t border-accent/15 px-5 py-6 text-sm leading-6 text-muted sm:px-12">
          <p>
            <a href={WHATSAPP} className="text-accent-bright">
              WhatsApp · {WHATSAPP_SHOWN}
            </a>
            {" · "}
            <a href={`mailto:${SITE.email}`} className="text-accent-bright">
              {SITE.email}
            </a>
            {" · "}
            <a href="/privacy/">Privacy</a>
            {" · "}
            <a href="/terms/">Terms</a>
            {" · "}
            <a href="/data-deletion/">Data deletion</a>
          </p>
          <p className="mt-1">Vaydin Agency · VAYDIN PARTNERS INVESTMENTS - FZCO · DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, UAE · Licensed under IFZA</p>
        </footer>
      </main>
    </>
  );
}
