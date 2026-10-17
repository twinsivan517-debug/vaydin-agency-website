import type { CSSProperties } from "react";
import { SITE, WHATSAPP, WHATSAPP_SHOWN } from "@/lib/site";

const vars = (v: Record<string, string>) => v as CSSProperties;

/* The closing frame under the stage: the three steps, the ways to reach us,
   and the company line. Word for word the close of the story it replaced. */
export function Closing() {
  return (
    <section id="contact" className="closing">
      <div className="closing-frame">
        <p className="label text-gold-bright">Vaydin · Dubai</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight sm:text-5xl">
          Somewhere in Dubai tonight, a patient is choosing a clinic. Vaydin makes sure you don&apos;t lose them.
        </h2>
        <div className="closing-steps">
          <div style={vars({ "--c": "var(--leak)" })}>
            <a href="/diagnose.html" className="label text-leak">
              01 · Diagnose
            </a>
            <p className="mt-3 leading-7 text-muted">
              An unannounced mystery shop of your own clinic, plus a monthly sweep of everything a patient can find.
            </p>
          </div>
          <div style={vars({ "--c": "var(--gold-bright)" })}>
            <a href="/fix.html" className="label text-gold-bright">
              02 · Fix &amp; run
            </a>
            <p className="mt-3 leading-7 text-muted">
              The Vaydin engine takes over your digital front door: one vendor, your clinic&apos;s own voice and number.
            </p>
            <a href="/engine.html" className="label mt-3 inline-block text-gold-bright">
              Inside the engine
            </a>
          </div>
          <div style={vars({ "--c": "var(--proof)" })}>
            <a href="/grow.html" className="label text-proof">
              03 · Grow
            </a>
            <p className="mt-3 leading-7 text-muted">
              Once the engine runs your clinic, paid patient demand lands in a machine built to convert it.
            </p>
          </div>
        </div>
        <div className="closing-reach">
          <div>
            <p className="label text-muted">Talk to us</p>
            <p className="mt-2 font-display text-2xl">Start with the diagnostic.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={WHATSAPP} className="rounded-full bg-gold-bright px-7 py-3 text-base font-medium text-background">
              WhatsApp · {WHATSAPP_SHOWN}
            </a>
            <a href={`mailto:${SITE.email}`} className="rounded-full border border-gold px-7 py-3 text-base text-gold-bright">
              {SITE.email}
            </a>
            <a href="/pricing.html" className="rounded-full border border-gold px-7 py-3 text-base text-gold-bright">
              See the plans
            </a>
          </div>
        </div>
        <footer className="closing-foot">
          <p>The diagnostic sells the engine. The engine earns the fuel.</p>
          <p className="mt-1">
            VAYDIN PARTNERS INVESTMENTS - FZCO · DSO-IFZA, IFZA Properties, Dubai Silicon Oasis, Dubai, UAE · Licensed under IFZA
          </p>
        </footer>
      </div>
    </section>
  );
}
