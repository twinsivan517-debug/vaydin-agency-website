/* The questions she answers when asked: draft 3 of 2026-10-17, the figures
   verified by the clinic-growth-bot house that day and the owner's word to
   speak them aloud. A question that matches none of these is handed to
   WhatsApp. No em dashes: the house's style lock for anything a client reads. */

import type { Line } from "./pitch.ts";

export type Answer = {
  id: string;
  short: string;
  question: string;
  answer: string;
  keywords: string[];
  link: { href: string; label: string };
};

export const ANSWERS: Answer[] = [
  {
    id: "price",
    short: "Price",
    question: "How much does it cost?",
    answer:
      "Intelligence is two thousand five hundred dirhams a month per location. The Engine is twenty thousand a month with a five thousand install, Intelligence included, three months minimum; on an annual plan, eighteen thousand and no install. Growth: demand at fifteen percent of ad spend, presence kits from three thousand. Your plan arrives on WhatsApp.",
    keywords: ["price", "prices", "cost", "costs", "how much", "fee", "fees", "charge", "charges", "pricing", "plan", "plans", "expensive", "cheap", "budget", "aed", "dirham", "dirhams", "dollar", "dollars", "pay", "payment", "monthly", "retainer", "install"],
    link: { href: "/pricing.html", label: "Build your plan" },
  },
  {
    id: "diagnostic",
    short: "The diagnostic",
    question: "What is the diagnostic?",
    answer:
      "Every thirty to sixty days a real person messages your clinic on WhatsApp like a new patient. Between shops we read your Google profile and rivals weekly, your Instagram and website monthly. Six rooms, one score, a report every month, and what to fix first.",
    keywords: ["diagnostic", "diagnose", "intelligence", "mystery", "shop", "shopper", "shopping", "audit", "measure", "measured", "measurement", "score", "scored", "scores", "test", "assessment", "report", "first step", "step one", "layer one", "layer 1"],
    link: { href: "/diagnose.html", label: "How the diagnostic works" },
  },
  {
    id: "engine",
    short: "The engine",
    question: "What is the engine?",
    answer:
      "Seven parts: intake, booking, consult conversion, show-up, dormant recovery, cross-sell and a dashboard, plus your estate: Google profile managed, every review answered within a day, Instagram and email on the same intake, website changes within two days. On your own number, your reception approving with a tap.",
    keywords: ["engine", "fix", "run", "operate", "operated", "answer", "answered", "answers", "reply", "replies", "respond", "whatsapp", "booking", "bookings", "book", "reminder", "reminders", "reception", "front door", "no show", "no shows", "revive", "follow up", "estate", "layer two", "layer 2", "dashboard"],
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "bot",
    short: "Is it a bot?",
    question: "Is it a bot?",
    answer: "The shopper is a person, never a bot. In the engine, AI drafts and a person approves; your reception confirms every booking with a tap.",
    keywords: ["ai", "bot", "bots", "robot", "chatbot", "automated", "automatic", "automation", "human", "real person", "people", "machine", "software"],
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "time",
    short: "How long",
    question: "How long does it take?",
    answer: "Your first report comes after the first shop, then monthly. The Engine runs on a three-month minimum, hands-on for the first thirty days.",
    keywords: ["how long", "time", "days", "weeks", "months", "fast", "quick", "soon", "duration", "when", "setup", "set up", "onboarding", "timeline", "first report"],
    link: { href: "/fix.html", label: "The first thirty days" },
  },
  {
    id: "where",
    short: "Where",
    question: "Where are you?",
    answer: "Dubai. A Dubai free-zone company licensed under IFZA, working with clinics in Dubai and the GCC.",
    keywords: ["where", "location", "located", "based", "dubai", "office", "uae", "emirates", "gcc", "mena", "address", "country", "city", "abu dhabi", "riyadh", "saudi", "qatar", "kuwait", "bahrain", "oman"],
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "who",
    short: "Who it's for",
    question: "Who is this for?",
    answer: "Owner-led aesthetic and wellness clinics, one branch or many.",
    keywords: ["who", "for", "clinic", "clinics", "owner", "owners", "manager", "dental", "dentist", "dermatology", "dermatologist", "aesthetic", "aesthetics", "wellness", "plastic", "surgery", "spa", "salon", "doctor", "doctors", "hospital", "medspa"],
    link: { href: "/diagnose.html", label: "Start with the diagnostic" },
  },
  {
    id: "ads",
    short: "Ads & Instagram",
    question: "Do you run ads?",
    answer:
      "Growth runs only on a running Engine, never on its own. Paid demand, and reels, statics and stories to a brief. No AI patients and no before-and-afters, ever.",
    keywords: ["ads", "ad", "advertising", "campaign", "campaigns", "instagram", "social", "social media", "marketing", "google ads", "meta", "paid", "reels", "followers", "grow", "growth", "leads", "lead", "content"],
    link: { href: "/grow.html", label: "Growth once the engine runs" },
  },
  {
    id: "proof",
    short: "Proof",
    question: "How do I know it works?",
    answer:
      "Evidence a patient could find themselves: Google, reviews, Instagram, the website, how you answered. Scored and explained, every month. The next shop scores us too.",
    keywords: ["proof", "prove", "results", "result", "guarantee", "guaranteed", "roi", "work", "works", "working", "evidence", "numbers", "track", "tracking", "kpi", "measure"],
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "need",
    short: "What you need",
    question: "What do you need from us?",
    answer:
      "For the diagnostic, nothing: it is unannounced. For the Engine, access to your Google profile, Instagram, website and WhatsApp number, which stays yours, and one kickoff call on day one.",
    keywords: ["need", "needs", "require", "required", "access", "password", "passwords", "calendar", "data", "give", "provide", "from us", "from me", "integration", "integrate", "integrations", "crm", "system", "fresha", "zenoti", "kickoff"],
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "branches",
    short: "Many branches",
    question: "One branch or many?",
    answer: "Both. Intelligence is per location. The Engine adds five thousand a month per extra branch; the install is waived on an annual plan.",
    keywords: ["branch", "branches", "location", "locations", "multiple", "chain", "several", "two", "three", "group", "sites", "extra"],
    link: { href: "/pricing.html", label: "Build your plan" },
  },
  {
    id: "contact",
    short: "Start",
    question: "How do I start?",
    answer: "WhatsApp us, or write to hello at vaydin dot agency. Your plan arrives on WhatsApp, no forms.",
    keywords: ["start", "begin", "contact", "talk", "call", "phone", "email", "reach", "number", "meeting", "demo", "sign up", "signup", "apply", "join", "get started"],
    link: { href: "/pricing.html", label: "See the plans" },
  },
  {
    id: "cancel",
    short: "Cancelling",
    question: "Can I cancel?",
    answer: "Intelligence is month to month with thirty days' notice. The Engine has a three-month minimum.",
    keywords: ["cancel", "cancellation", "stop", "quit", "leave", "notice", "contract", "commitment", "minimum", "lock in", "locked", "term", "terms"],
    link: { href: "/pricing.html", label: "See the plans" },
  },
  {
    id: "clients",
    short: "Your clients",
    question: "Who are your clients?",
    answer: "The first cohort is forming now. We name nobody, and we invent nothing.",
    keywords: ["client", "clients", "customers", "customer", "references", "reference", "case study", "case studies", "testimonial", "testimonials", "who else", "portfolio", "worked with", "examples"],
    link: { href: "/engine.html", label: "How we are measured" },
  },
  {
    id: "chatgpt",
    short: "Why not ChatGPT",
    question: "Why not just use ChatGPT?",
    answer: "It only sees inside your clinic. We measure how you look from outside, every month, and we are accountable for it.",
    keywords: ["chatgpt", "gpt", "openai", "ai tools", "myself", "do it myself", "ourselves", "in house", "cheaper", "why not", "twenty dollars", "subscription", "difference"],
    link: { href: "/diagnose.html", label: "What we measure" },
  },
];

export const answer = (id: string) => ANSWERS.find((a) => a.id === id)!;

/* An answer as a spoken line. */
export const answerLine = (a: Answer): Line => ({ id: `a-${a.id}`, text: a.answer, audio: `/voice/a-${a.id}.mp3` });

export const CHOOSE: Line = { id: "x-choose", text: "Did you mean one of these?", audio: "/voice/x-choose.mp3" };
export const UNKNOWN: Line = {
  id: "x-unknown",
  text: "I don't have that one yet. Try a chapter, or ask us on WhatsApp; a person answers.",
  audio: "/voice/x-unknown.mp3",
};
export const HELLO: Line = { id: "x-hello", text: "Hi. Tap a chapter, or ask me anything about Vaydin.", audio: "/voice/x-hello.mp3" };
