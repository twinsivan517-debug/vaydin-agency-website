/* The six pages behind the home page, as the tiles beside him show them:
   each with its page's own headline (as of 2026-10-21), in that page's own
   colour, so the two never disagree. The order is the owner's of 2026-11-11:
   the diagnostic, the engine (Step 02, as engine.html says), the fixing it does
   in its first thirty days (fix.html, still Step 02's work), Grow, One place,
   the plan. Addresses as in PAGES. `page` keys the line he says when a tile is
   pressed (SUMMARIES in pages.ts). */

export type Door = { word: string; step?: string; tag?: string; href: string; page: string; accent: string; title: string };

export const DOORS: Door[] = [
  {
    word: "Diagnose",
    step: "Step 01",
    href: "/diagnose.html",
    page: "diagnose",
    accent: "#f87171",
    title: "We measure your clinic the way a patient meets it.",
  },
  {
    word: "Engine",
    step: "Step 02",
    href: "/engine.html",
    page: "engine",
    accent: "#a78bfa",
    title: "Thirteen jobs. Nine in the engine, four built around you.",
  },
  {
    word: "Fix",
    tag: "First 30 days",
    href: "/fix.html",
    page: "fix",
    accent: "#f5d978",
    title: "We stop reporting the leaks. We start running the machine.",
  },
  {
    word: "Grow",
    step: "Step 03",
    href: "/grow.html",
    page: "grow",
    accent: "#4ade80",
    title: "Everything fixed? Time to spread.",
  },
  {
    word: "One place",
    tag: "One link",
    href: "/app.html",
    page: "app",
    accent: "#c9a44a",
    title: "Your clinic, in one place.",
  },
  {
    word: "Your plan",
    tag: "Plans",
    href: "/pricing.html",
    page: "pricing",
    accent: "#34e3f0",
    title: "Every plan is built for your clinic.",
  },
];
