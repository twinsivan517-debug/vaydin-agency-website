/* The five pages behind the home page, as the home page shows them under
   her: each in that page's own words (its headline, one line and three
   facts, as of 2026-10-21), in that page's own colour, so the two never
   disagree. Order and addresses as in PAGES. */

export type Icon = "scan" | "wrench" | "grow" | "engine" | "plan";
export type Door = { word: string; step?: string; tag?: string; href: string; accent: string; icon: Icon; title: string; line: string; facts: string[] };

export const DOORS: Door[] = [
  {
    word: "Diagnose",
    step: "Step 01",
    href: "/diagnose.html",
    accent: "#f87171",
    icon: "scan",
    title: "We measure your clinic the way a patient meets it.",
    line: "Unannounced, a trained shopper approaches your clinic like any new patient.",
    facts: ["A real person, every thirty to sixty days", "Google and rivals read weekly; Instagram and website monthly", "Six rooms, one score, a report every month"],
  },
  {
    word: "Fix",
    step: "Step 02",
    href: "/fix.html",
    accent: "#f5d978",
    icon: "wrench",
    title: "We stop reporting the leaks. We start running the machine.",
    line: "Every patient conversation carried to the finish, and your front door kept immaculate.",
    facts: ["Every inquiry answered, booked, reminded, revived", "On your own number, your reception approving by a tap", "Every review answered within a day"],
  },
  {
    word: "Grow",
    step: "Step 03",
    href: "/grow.html",
    accent: "#4ade80",
    icon: "grow",
    title: "Everything fixed? Time to spread.",
    line: "Once the engine runs your clinic, we pour in the fuel.",
    facts: ["Paid patient demand, landing in the engine that already books", "Instagram run like a channel", "Every dirham counted on the same dashboard, ad spend never marked up"],
  },
  {
    word: "Engine",
    tag: "System",
    href: "/engine.html",
    accent: "#a78bfa",
    icon: "engine",
    title: "One engine. Thirteen jobs. Working while you sleep.",
    line: "Every channel a patient can reach you on, flowing into one system.",
    facts: ["Answers, books, reminds, revives and counts", "Runs on your clinic's own numbers", "See it live on one screen"],
  },
  {
    word: "Your plan",
    tag: "Plans",
    href: "/pricing.html",
    accent: "#34e3f0",
    icon: "plan",
    title: "Every plan is built for your clinic.",
    line: "Start with the diagnostic. Add the Engine when the numbers convince you.",
    facts: ["No forms: a person sends yours on WhatsApp", "The diagnostic runs month to month", "Your patient records never leave your clinic"],
  },
];
