"use client";

/* The floor under her: the five pages, each in its own words, so a visitor
   who scrolls instead of tapping finds the site. The room is dark while she
   sleeps; a visitor who scrolls down to these lights it, softly, without
   waking her: her bulb is for the one who taps. */

import { useEffect, useRef } from "react";
import { DOORS } from "@/lib/doors";

export function Doors() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const light = () => {
      if (!document.body.classList.contains("site-asleep")) return;
      document.body.classList.remove("site-asleep");
      document.body.classList.add("site-awake");
    };
    /* Only on a scroll: a screen tall enough to show the doors at once still opens dark. */
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && window.scrollY > 40) {
          light();
          watch.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  return (
    <section ref={section} id="pages" aria-labelledby="pages-title" className="doors wakes mx-auto w-full max-w-6xl px-5 pt-24 sm:px-12 md:pt-28">
      <p className="label text-gold-bright">The site behind her</p>
      <h2 id="pages-title" className="mt-2 max-w-3xl font-display text-2xl leading-tight sm:text-3xl">
        She tells it in a minute. These five pages tell it in full.
      </h2>
      <ul className="doors-grid mt-8" aria-label="The five pages">
        {DOORS.map((d) => (
          <li key={d.href} className={d.step ? "door-step" : "door-side"}>
            <a href={d.href} className="door">
              <p className="label flex items-baseline justify-between gap-3 text-gold-bright">
                <span>{d.word}</span>
                {d.step && <span className="text-muted">{d.step}</span>}
              </p>
              <p className="mt-3 font-display text-xl leading-snug">{d.title}</p>
              <p className="mt-3 leading-7 text-muted">{d.body}</p>
              <span className="door-open label mt-4 inline-block text-gold-bright">Open {d.word.toLowerCase()}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
