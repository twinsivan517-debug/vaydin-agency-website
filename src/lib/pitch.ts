/* What the guide says and shows: draft 3 words of 2026-10-17, corrected on
   the clinic-growth-bot house's product truth and approved by the owner for
   recording, arranged as the five questions a clinic owner asks first (the
   owner's layout of the same day). Every spoken line is one mp3 under
   /voice. The greeting is one recording of three lines (OPENER_AUDIO), so
   those lines have no mp3 of their own: `at` is the second at which each
   starts in it, measured on the recording. No statistic anywhere. */

export type Mood = "hop" | "shake";
export type Line = { id: string; text: string; audio?: string; at?: number; mood?: Mood };
export type ChapterId = "meet" | "what" | "how" | "gain" | "start" | "price";
export type Card = { title: string; body: string; facts: string[]; links: { href: string; label: string }[] };
export type Chapter = { id: ChapterId; label: string; clip: "opener" | "talk"; lines: Line[]; card: Card };

/* The greeting, his three opening lines in one recording. */
export const OPENER_AUDIO = "/voice/opener.mp3";
/* The second of the greeting by which the page is lit, if his light has not lit it already. */
export const THROW_AT = 2.58;

/* In the cloud while he is still dust, before he gathers. Not spoken: no sound may start before a tap. */
export const SLEEPING: Line = { id: "00", text: "Zzz… Tap anywhere to wake me up." };
/* In the cloud once he has woken by himself on a first visit: a phone lets him speak only after a touch. */
export const WAITING: Line = { id: "00w", text: "Hello. Tap anywhere and I'll talk you through it." };

export const CHAPTERS: Chapter[] = [
  {
    id: "meet",
    label: "Hello",
    clip: "opener",
    lines: [
      { id: "00b", text: "Mmm… oh, hello there.", at: 0 },
      { id: "01", text: "I'm Vaydin's guide.", at: 2.58 },
      { id: "tag", text: "Dubai never sleeps. Neither do your patients. With Vaydin, your clinic never misses them.", at: 4.39 },
      {
        id: "02",
        text: "Pick a question or ask me anything, and I'll show you how patients find a clinic, and how a clinic loses them without ever knowing.",
        audio: "/voice/02.mp3",
      },
    ],
    card: {
      title: "Vaydin · Dubai",
      body: "An operations partner for aesthetic and wellness clinics in Dubai and the GCC. We find the patients your clinic never saw, then run the front door that keeps them.",
      facts: ["Three steps: Intelligence, the Engine, Grow", "A Dubai free-zone company, licensed under IFZA", "Measured, not promised"],
      links: [{ href: "/diagnose.html", label: "Start with the diagnostic" }],
    },
  },
  {
    id: "what",
    label: "What is Vaydin?",
    clip: "talk",
    lines: [
      {
        id: "w1",
        text: "Vaydin is a Dubai company for aesthetic and wellness clinics. We measure how your clinic looks to a new patient, then run its front door for you: WhatsApp, Google, reviews, Instagram and the website.",
        audio: "/voice/w1.mp3",
      },
    ],
    card: {
      title: "What is Vaydin?",
      body: "An operations partner for aesthetic and wellness clinics in Dubai and the GCC.",
      facts: ["We measure how your clinic looks to a new patient", "Then we run its front door: WhatsApp, Google, reviews, Instagram, the website", "A Dubai free-zone company, licensed under IFZA"],
      links: [{ href: "/diagnose.html", label: "Start with the diagnostic" }],
    },
  },
  {
    id: "how",
    label: "How do you work?",
    clip: "talk",
    lines: [
      {
        id: "07",
        text: "Layer one, Intelligence: every thirty to sixty days a real person messages your clinic on WhatsApp like a new patient. Between shops we read your Google profile and your rivals every week, your Instagram and website every month. Six rooms, one score, and what to fix first.",
        audio: "/voice/07.mp3",
      },
      {
        id: "08",
        text: "Layer two, the Revenue Engine: we answer, book, remind and revive every inquiry on your own WhatsApp number, and run your Google profile, your reviews, your Instagram messages and your website. Your reception approves with a tap, and the Intelligence keeps scoring us.",
        audio: "/voice/08.mp3",
      },
    ],
    card: {
      title: "How we work",
      body: "Intelligence sees it. The Revenue Engine fixes it, and runs it.",
      facts: [
        "A real person shops your clinic every thirty to sixty days",
        "Google and rivals read weekly; Instagram and website monthly",
        "Answer, book, remind, revive: on your own number, your reception approving by a tap",
      ],
      links: [
        { href: "/diagnose.html", label: "Intelligence" },
        { href: "/fix.html", label: "The Engine" },
      ],
    },
  },
  {
    id: "gain",
    label: "What do I gain?",
    clip: "talk",
    lines: [
      {
        id: "g1",
        text: "You gain the patients you are losing in public: every inquiry answered and booked, every review answered within a day, the quiet ones revived, and the proof of all of it on one dashboard.",
        audio: "/voice/g1.mp3",
      },
      {
        id: "10",
        text: "Everything we measure is evidence a patient could find themselves, scored and explained, counted on one dashboard. And the next unannounced shop scores us too. Measured, not promised.",
        audio: "/voice/10.mp3",
      },
    ],
    card: {
      title: "What you gain",
      body: "The patients you are losing in public, and the proof.",
      facts: ["Every inquiry answered and booked", "Every review answered within a day; the quiet ones revived", "Evidence a patient could find themselves, scored on one dashboard"],
      links: [{ href: "/engine.html", label: "Inside the engine" }],
    },
  },
  {
    id: "start",
    label: "How does it start?",
    clip: "talk",
    lines: [
      {
        id: "a-need",
        text: "For the diagnostic, nothing: it is unannounced. For the Engine, access to your Google profile, Instagram, website and WhatsApp number, which stays yours, and one kickoff call on day one.",
        audio: "/voice/a-need.mp3",
      },
      {
        id: "a-time",
        text: "Your first report comes after the first shop, then monthly. The Engine runs on a three-month minimum, hands-on for the first thirty days.",
        audio: "/voice/a-time.mp3",
      },
    ],
    card: {
      title: "How it starts",
      body: "The diagnostic first, unannounced. The Engine when you want it fixed and run.",
      facts: ["For the diagnostic: nothing from you", "For the Engine: access to Google, Instagram, the website and your WhatsApp number, which stays yours", "One kickoff call on day one; three months minimum"],
      links: [{ href: "/fix.html", label: "The first thirty days" }],
    },
  },
  {
    id: "price",
    label: "How much?",
    clip: "talk",
    lines: [
      {
        id: "a-price",
        text: "Every clinic gets its own plan, and every plan starts with the measurement. Message us on WhatsApp and a person sends yours.",
        audio: "/voice/a-price.mp3",
      },
      { id: "a-cancel", text: "Intelligence is month to month with thirty days' notice. The Engine has a three-month minimum.", audio: "/voice/a-cancel.mp3" },
    ],
    card: {
      title: "Your plan",
      body: "Every plan is built for your clinic. Add the Engine when you want it fixed and run for you.",
      facts: ["Every plan starts with the measurement", "A person sends yours on WhatsApp, no forms", "Intelligence month to month; the Engine three months minimum"],
      links: [{ href: "/pricing.html", label: "Ask for your plan" }],
    },
  },
];

/* The three the chips show, the first three a clinic owner asks (2026-10-27,
   the owner's word: three, the page neater); the greeting is never a chip. */
const SHOWN: ChapterId[] = ["what", "how", "price"];
export const QUESTIONS = CHAPTERS.filter((c) => SHOWN.includes(c.id));
/* The chapters the chips no longer show, at the top of the More list. */
export const TOUR = CHAPTERS.filter((c) => c.id !== "meet" && !SHOWN.includes(c.id));

/* What he says when touched, in order. The last never sends him to sleep
   (Dubai never sleeps): it puts him in hibernation until he is asked
   something. `mood` moved the earlier guide's picture; he does not use it. */
export const POKES: Line[] = [
  { id: "p1", text: "Hi there. Tap a question and I'll explain.", audio: "/voice/poke-1.mp3", mood: "hop" },
  { id: "p2", text: "Yes? I'm listening.", audio: "/voice/poke-2.mp3", mood: "hop" },
  { id: "p3", text: "Careful, I'm working.", audio: "/voice/poke-3.mp3", mood: "hop" },
  { id: "p4", text: "Okay, okay. What would you like to know?", audio: "/voice/poke-4.mp3", mood: "hop" },
  { id: "p5", text: "I'm a guide, not a button.", audio: "/voice/poke-5.mp3", mood: "shake" },
  { id: "p6", text: "Sleep? In Dubai? Never. Hibernation mode, though. Until you get serious.", audio: "/voice/poke-6.mp3", mood: "shake" },
];

/* In the cloud while he hibernates after the last poke. Not spoken. */
export const RESTING: Line = { id: "00r", text: "Hibernation mode. Ask me something serious." };

export const chapter = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;

/* How long a line stays up when its sound cannot play: reading speed. */
export const talkTime = (text: string) => Math.min(8000, Math.max(1800, text.length * 50));
