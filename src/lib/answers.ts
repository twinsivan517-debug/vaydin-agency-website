/* The questions she answers when asked, each from Vaydin's own pages and
   nowhere else. Draft 1 of 2026-10-17, awaiting the owner's approval word by
   word. A question that matches none of these is handed to WhatsApp. */

import type { Line } from "./pitch.ts";

export type Answer = {
  id: string;
  short: string;
  question: string;
  answer: string;
  keywords: string[];
  source: string;
  link: { href: string; label: string };
};

export const ANSWERS: Answer[] = [
  {
    id: "price",
    short: "Price",
    question: "How much does it cost?",
    answer:
      "The price builds itself from what you choose: how many locations, then the diagnostic, the engine on top, and growth on top of that. Every plan starts with the diagnostic, and your plan arrives on WhatsApp. No forms.",
    keywords: ["price", "prices", "cost", "costs", "how much", "fee", "fees", "charge", "charges", "pricing", "plan", "plans", "expensive", "cheap", "budget", "aed", "dirham", "dirhams", "dollar", "dollars", "pay", "payment", "monthly", "retainer"],
    source: "/pricing.html",
    link: { href: "/pricing.html", label: "Build your plan" },
  },
  {
    id: "diagnostic",
    short: "The diagnostic",
    question: "What is the diagnostic?",
    answer:
      "An unannounced mystery shop of your own clinic. We approach it the way a patient does, on WhatsApp, Google, Instagram, your website and your booking link, and score what we meet across six dimensions. The truth, scored and delivered.",
    keywords: ["diagnostic", "diagnose", "mystery", "shop", "shopping", "audit", "measure", "measured", "measurement", "score", "scored", "scores", "test", "assessment", "first step", "step one"],
    source: "/diagnose.html",
    link: { href: "/diagnose.html", label: "How the diagnostic works" },
  },
  {
    id: "engine",
    short: "The engine",
    question: "What is the engine?",
    answer:
      "Your digital front door, installed and operated by Vaydin: every inquiry answered, booked, reminded and revived, on your own WhatsApp number and in your clinic's voice. Your reception just taps a tick.",
    keywords: ["engine", "fix", "run", "operate", "operated", "answer", "answered", "answers", "reply", "replies", "respond", "whatsapp", "booking", "bookings", "book", "reminder", "reminders", "reception", "front door", "no show", "no shows", "revive", "follow up"],
    source: "/fix.html",
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "bot",
    short: "Is it a bot?",
    question: "Is it a bot?",
    answer:
      "The engine answers from your clinic's own approved answers, in your clinic's voice, and anything clinical goes straight to your team. Nothing is promised that your clinic did not approve.",
    keywords: ["ai", "bot", "bots", "robot", "chatbot", "automated", "automatic", "automation", "human", "real person", "people", "machine", "software"],
    source: "/fix.html",
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "time",
    short: "How long",
    question: "How long does it take?",
    answer: "The diagnostic comes first. The engine is thirteen things, installed in thirty days and operated every day after.",
    keywords: ["how long", "time", "days", "weeks", "months", "fast", "quick", "soon", "duration", "when", "install", "installed", "setup", "set up", "onboarding", "timeline"],
    source: "/fix.html",
    link: { href: "/fix.html", label: "Thirteen things in thirty days" },
  },
  {
    id: "where",
    short: "Where",
    question: "Where are you?",
    answer:
      "Dubai. Vaydin Partners Investments FZCO, Dubai Silicon Oasis, licensed under IFZA. We work with aesthetic clinics in Dubai and across the region.",
    keywords: ["where", "location", "located", "based", "dubai", "office", "uae", "emirates", "mena", "address", "country", "city", "abu dhabi", "riyadh", "saudi", "qatar"],
    source: "/privacy/",
    link: { href: "mailto:hello@vaydin.agency", label: "hello@vaydin.agency" },
  },
  {
    id: "who",
    short: "Who it's for",
    question: "Who is this for?",
    answer: "Aesthetic clinics: owners and managers who want to know where patients are lost, and have it fixed and run for them.",
    keywords: ["who", "for", "clinic", "clinics", "owner", "owners", "manager", "dental", "dentist", "dermatology", "dermatologist", "aesthetic", "aesthetics", "plastic", "surgery", "spa", "salon", "doctor", "doctors", "hospital", "medspa"],
    source: "/",
    link: { href: "/diagnose.html", label: "Start with the diagnostic" },
  },
  {
    id: "ads",
    short: "Ads & Instagram",
    question: "Do you run ads?",
    answer:
      "Yes, as step three: paid patient demand and Instagram, only once the engine runs your clinic, so every inquiry lands somewhere built to convert it.",
    keywords: ["ads", "ad", "advertising", "campaign", "campaigns", "instagram", "social", "social media", "marketing", "google ads", "meta", "paid", "reels", "followers", "grow", "growth", "leads", "lead"],
    source: "/grow.html",
    link: { href: "/grow.html", label: "Growth once the engine runs" },
  },
  {
    id: "proof",
    short: "Proof",
    question: "How do I know it works?",
    answer:
      "You see inquiries, bookings and visits on your dashboard as they happen, and the next unannounced shop scores the engine too. Measured, not promised.",
    keywords: ["proof", "prove", "results", "result", "guarantee", "guaranteed", "roi", "work", "works", "working", "report", "reports", "dashboard", "numbers", "track", "tracking", "kpi", "evidence"],
    source: "/engine.html",
    link: { href: "/engine.html", label: "Inside the engine" },
  },
  {
    id: "need",
    short: "What you need",
    question: "What do you need from us?",
    answer:
      "For the diagnostic, nothing: it is unannounced, from the outside. For the engine, your approved answers, your calendar, and your own WhatsApp number, which stays yours.",
    keywords: ["need", "needs", "require", "required", "access", "password", "passwords", "calendar", "data", "give", "provide", "from us", "from me", "integration", "integrate", "crm", "system"],
    source: "/fix.html",
    link: { href: "/fix.html", label: "What the engine runs" },
  },
  {
    id: "branches",
    short: "Many branches",
    question: "One branch or many?",
    answer: "Both. The plan builds per location: one branch or several, each measured and run the same way.",
    keywords: ["branch", "branches", "location", "locations", "multiple", "chain", "several", "two", "three", "group", "sites"],
    source: "/pricing.html",
    link: { href: "/pricing.html", label: "Build your plan" },
  },
  {
    id: "contact",
    short: "Start",
    question: "How do I start?",
    answer: "Message us on WhatsApp, or email hello@vaydin.agency. Start with the diagnostic.",
    keywords: ["start", "begin", "contact", "talk", "call", "phone", "email", "reach", "number", "meeting", "demo", "sign up", "signup", "apply", "join", "get started"],
    source: "/",
    link: { href: "/pricing.html", label: "See the plans" },
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
