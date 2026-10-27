/* The five pages behind the home page, as the tiles beside him show them:
   each with its page's own headline (as of 2026-10-21), in that page's own
   colour, so the two never disagree. Order and addresses as in PAGES. */

export type Door = { word: string; step?: string; tag?: string; href: string; accent: string; title: string };

export const DOORS: Door[] = [
  {
    word: "Diagnose",
    step: "Step 01",
    href: "/diagnose.html",
    accent: "#f87171",
    title: "We measure your clinic the way a patient meets it.",
  },
  {
    word: "Fix",
    step: "Step 02",
    href: "/fix.html",
    accent: "#f5d978",
    title: "We stop reporting the leaks. We start running the machine.",
  },
  {
    word: "Grow",
    step: "Step 03",
    href: "/grow.html",
    accent: "#4ade80",
    title: "Everything fixed? Time to spread.",
  },
  {
    word: "Engine",
    tag: "System",
    href: "/engine.html",
    accent: "#a78bfa",
    title: "One engine. Thirteen jobs. Working while you sleep.",
  },
  {
    word: "Your plan",
    tag: "Plans",
    href: "/pricing.html",
    accent: "#34e3f0",
    title: "Every plan is built for your clinic.",
  },
];
