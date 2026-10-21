/* The five pages behind the home page, as the home page shows them under
   her: each in that page's own words (its headline and opening lines, as of
   2026-10-21), so the two never disagree. Order and addresses as in PAGES. */

export type Door = { word: string; step?: string; href: string; title: string; body: string };

export const DOORS: Door[] = [
  {
    word: "Diagnose",
    step: "Step 01",
    href: "/diagnose.html",
    title: "We measure your clinic the way a patient meets it.",
    body: "Unannounced, every thirty to sixty days, a trained shopper approaches your clinic like any new patient. Everything that happens is scored across six rooms, with the evidence behind it.",
  },
  {
    word: "Fix",
    step: "Step 02",
    href: "/fix.html",
    title: "We stop reporting the leaks. We start running the machine.",
    body: "Every patient inquiry answered, booked, reminded and revived, and your Google, reviews, Instagram and website kept immaculate. You grant access; you keep the keys.",
  },
  {
    word: "Grow",
    step: "Step 03",
    href: "/grow.html",
    title: "Everything fixed? Time to spread.",
    body: "Once the engine runs your clinic, we pour in the fuel: paid patient demand, and Instagram run like a channel, every dirham counted on the same dashboard.",
  },
  {
    word: "Engine",
    href: "/engine.html",
    title: "One engine. Thirteen jobs. Working while you sleep.",
    body: "Every channel a patient can reach you on flows into one system that answers, books, reminds, revives and counts. See it live on one screen.",
  },
  {
    word: "Your plan",
    href: "/pricing.html",
    title: "Every plan is built for your clinic.",
    body: "Start with the diagnostic, and add the Engine when the numbers convince you. Message us on WhatsApp and a person sends yours.",
  },
];
