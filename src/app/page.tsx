import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const POINTS = [
  { title: "First reason", text: "One sentence a visitor can check for themselves." },
  { title: "Second reason", text: "One sentence a visitor can check for themselves." },
  { title: "Third reason", text: "One sentence a visitor can check for themselves." },
];

const WRAP = "mx-auto w-full max-w-5xl px-5 sm:px-8";

export default function Home() {
  return (
    <>
      <header className={`${WRAP} flex items-center justify-between py-5`}>
        <span className="text-base font-semibold">{SITE.name}</span>
        <a href="#contact" className="rounded-lg px-3 py-2 text-base underline underline-offset-4">
          Contact
        </a>
      </header>

      <main className="flex-1">
        <section className={`${WRAP} py-16 sm:py-28`}>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            The one thing this site wants a visitor to understand.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{SITE.description}</p>
          <a
            href="#contact"
            className="mt-10 inline-block rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background"
          >
            Get in touch
          </a>
        </section>

        <section className={`${WRAP} grid gap-10 py-16 sm:grid-cols-3`}>
          {POINTS.map((point) => (
            <Reveal key={point.title}>
              <h2 className="text-xl font-semibold">{point.title}</h2>
              <p className="mt-3 leading-7 text-muted">{point.text}</p>
            </Reveal>
          ))}
        </section>

        <section id="contact" className={`${WRAP} py-16 sm:py-24`}>
          <h2 className="text-3xl font-semibold tracking-tight">Contact</h2>
          <p className="mt-3 text-muted">
            Write here, or email{" "}
            <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
              {SITE.email}
            </a>
            .
          </p>
          <div className="mt-8 max-w-xl">
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className={`${WRAP} py-8 text-sm text-muted`}>
        © {new Date().getFullYear()} {SITE.name}
      </footer>
    </>
  );
}
