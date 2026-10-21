import type { Metadata } from "next";
import { Doors } from "@/components/Doors";
import { Header } from "@/components/Header";
import { Stage } from "@/components/Stage";
import { CHAPTERS } from "@/lib/pitch";
import { SITE, WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/* The home page is the guide. Under her, the five pages in their own words,
   then the title and a transcript, so the page reads, and is found, before
   any script or clip arrives, and a visitor who scrolls finds the site. */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 pt-20 sm:px-12 md:pt-24">
          <Stage />
        </div>
        <Doors />
        <section className="wakes mx-auto w-full max-w-6xl px-5 py-12 sm:px-12">
          <p className="label text-gold-bright">Vaydin · Dubai</p>
          <h1 className="mt-2 max-w-3xl font-display text-2xl leading-tight sm:text-3xl">We find the patients your clinic never saw.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            Vaydin is a Dubai company for aesthetic and wellness clinics in the UAE and the GCC. We measure how your
            clinic looks to a new patient, then run its front door for you: WhatsApp, Google, reviews, Instagram and
            the website, answered and kept current, with your reception approving by a tap.
          </p>
          <details className="mt-6 text-muted">
            <summary className="label cursor-pointer text-gold-bright">Read what she says</summary>
            <ol className="mt-3 space-y-2 text-base leading-7">
              {CHAPTERS.flatMap((c) => c.lines).map((line) => (
                <li key={line.id}>{line.text}</li>
              ))}
            </ol>
          </details>
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
          <p className="mt-1">VAYDIN PARTNERS INVESTMENTS - FZCO · DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, UAE · Licensed under IFZA</p>
        </footer>
      </main>
    </>
  );
}
