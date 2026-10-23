import type { Metadata } from "next";
import { Doors } from "@/components/Doors";
import { Header } from "@/components/Header";
import { Stage } from "@/components/Stage";
import { answer } from "@/lib/answers";
import { CHAPTERS } from "@/lib/pitch";
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

/* The home page is the guide, his headline over him. Under him, the five
   pages in their own words, then the title and a transcript, then the FAQ,
   so the page reads, and is found, before any script or clip arrives, and a
   visitor who scrolls finds the site. */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 pt-15 sm:px-12 sm:pt-20 md:pt-24">
          <Stage />
        </div>
        <Doors />
        <section className="wakes mx-auto w-full max-w-6xl px-5 py-12 sm:px-12">
          <p className="label text-gold-bright">Vaydin Agency · Dubai</p>
          <h2 className="mt-2 max-w-3xl font-display text-2xl leading-tight sm:text-3xl">We find the patients your clinic never saw.</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Vaydin Agency is a Dubai free-zone company, licensed under IFZA, and an operations partner for aesthetic and
            wellness clinics in the UAE and the GCC. Unannounced, a real person contacts your clinic like a new patient
            while we read its Google profile, Instagram and website: six rooms, one score. Then the Revenue Engine
            answers, books, reminds and revives patients on your own WhatsApp number and runs your Google profile,
            reviews, Instagram and website, with your reception approving by a tap.
          </p>
          <details className="mt-6 text-muted">
            <summary className="label cursor-pointer text-gold-bright">Read what he says</summary>
            <ol className="mt-3 space-y-2 text-base leading-7">
              {CHAPTERS.flatMap((c) => c.lines).map((line) => (
                <li key={line.id}>{line.text}</li>
              ))}
            </ol>
          </details>
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
        <footer className="wakes mx-auto w-full max-w-6xl border-t border-gold/15 px-5 py-6 text-sm leading-6 text-muted sm:px-12">
          <p>
            <a href={WHATSAPP} className="text-gold-bright">
              WhatsApp · {WHATSAPP_SHOWN}
            </a>
            {" · "}
            <a href={`mailto:${SITE.email}`} className="text-gold-bright">
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
