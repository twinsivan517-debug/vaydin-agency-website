"use client";

/* The floor under him: the five pages as doors, each in its page's own
   colour with a sign, one line and three facts, the whole tile the link, so
   a visitor who scrolls instead of tapping finds the site and a curious one
   taps through. The room is dark until he has gathered; a visitor who scrolls
   down to these lifts the dimming, softly, without the mark's glow: his
   light, and that glow, are for the one who taps. */

import { useEffect, useRef, type CSSProperties } from "react";
import { DOORS, type Icon } from "@/lib/doors";

/* One stroke drawing per page, on a 24-unit grid. */
const SIGNS: Record<Icon, string> = {
  scan: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm4.6 11.1L20 20M7.5 10.5h6",
  wrench: "M14.5 6.5a4 4 0 0 0-5.3 5.2L4 17l3 3 5.3-5.2a4 4 0 0 0 5.2-5.3l-2.3 2.3-2.2-.6-.6-2.2 2.1-2.5Z",
  grow: "M3 17l6-6 4 4 8-8M14 7h7v7",
  engine: "M7 7h10v10H7ZM10 10h4v4h-4ZM12 2v5M12 17v5M2 12h5M17 12h5M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2",
  plan: "M6 3h8l5 5v13H6ZM14 3v5h5M9 14l2 2 4-4",
};

function Sign({ name }: { name: Icon }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={SIGNS[name]} />
    </svg>
  );
}

export function Doors() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const light = () => document.body.classList.remove("site-asleep");
    /* Only on a scroll: a screen tall enough to show the doors at once still
       opens dark, and lights on the first scroll instead (the observer would
       not speak again, the doors being in view already). */
    const onScroll = () => {
      light();
      watch.disconnect();
    };
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        if (window.scrollY > 40) onScroll();
        else window.addEventListener("scroll", onScroll, { once: true, passive: true });
      },
      { threshold: 0.25 },
    );
    watch.observe(el);
    return () => {
      watch.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section ref={section} id="pages" aria-labelledby="pages-title" className="doors wakes mx-auto w-full max-w-6xl px-5 pt-24 sm:px-12 md:pt-28">
      <p className="label text-gold-bright">The site behind him</p>
      <h2 id="pages-title" className="mt-2 max-w-3xl font-display text-2xl leading-tight sm:text-3xl">
        He tells it in a minute. These five pages tell it in full.
      </h2>
      <ul className="doors-grid mt-8" aria-label="The five pages">
        {DOORS.map((d) => (
          <li key={d.href} className={d.step ? "door-step" : "door-side"}>
            <a href={d.href} className="door" style={{ "--accent": d.accent } as CSSProperties}>
              <div className="flex items-center justify-between gap-3">
                <span className="door-sign">
                  <Sign name={d.icon} />
                </span>
                <span className="label text-muted">{d.step ?? d.word}</span>
              </div>
              <p className="mt-4 font-display text-xl leading-snug">{d.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{d.line}</p>
              <ul className="mt-4 space-y-1.5 text-sm leading-6">
                {d.facts.map((fact) => (
                  <li key={fact} className="flex gap-2.5">
                    <span aria-hidden="true" className="door-dot" />
                    {fact}
                  </li>
                ))}
              </ul>
              <span className="door-open label mt-5 inline-flex items-center gap-1.5">
                Open {d.word.toLowerCase()}
                <svg aria-hidden="true" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
