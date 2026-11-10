/* What the guide says and shows: draft 3 words of 2026-10-17, corrected on
   the clinic-growth-bot house's product truth and approved by the owner for
   recording, arranged as the five questions a clinic owner asks first (the
   owner's layout of the same day). Every spoken line is one mp3 under
   /voice. The greeting is one recording of three lines (OPENER_AUDIO), so
   those lines have no mp3 of their own: `at` is the second at which each
   starts in it, measured on the recording. No statistic anywhere. */

export type Mood = "hop" | "shake";
export type Line = { id: string; text: string; audio?: string; at?: number; mood?: Mood };
export type ChapterId = "meet" | "what" | "how" | "gain" | "see" | "start" | "price";
/* The card beside him while he tells a chapter: its title, three facts, the pages to open. What he says is in his cloud. */
export type Card = { title: string; facts: string[]; links: { href: string; label: string }[] };
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
        text: "Vaydin is a Dubai company for aesthetic and wellness clinics. We measure how your clinic looks to a new patient, then run its front door for you: WhatsApp answered and booked, your Google profile checked daily and a reply ready for every new review, with Instagram, email and your website built around your clinic.",
        audio: "/voice/w1.mp3",
      },
    ],
    card: {
      title: "What is Vaydin?",
      facts: ["We measure how your clinic looks to a new patient", "WhatsApp, Google and reviews in one engine; Instagram, email and website built around you", "A Dubai free-zone company, licensed under IFZA"],
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
        text: "Layer one, Intelligence: every thirty to sixty days a real person messages your clinic on WhatsApp like a new patient. Between shops we read your Google profile and your rivals every week, your Instagram and website every month. Six areas, one score, and what to fix first.",
        audio: "/voice/07.mp3",
      },
      {
        id: "08",
        text: "Layer two, the Revenue Engine: on your own WhatsApp number a patient gets your menu at once and books inside the chat. Visits booked in the chat are reminded, your quiet list is invited back, and every new review gets a reply ready for your reception to post with one tap. Four more are built around your clinic, and the Intelligence keeps reading your clinic from outside.",
        audio: "/voice/08.mp3",
      },
    ],
    card: {
      title: "How we work",
      facts: [
        "A real person shops your clinic every thirty to sixty days",
        "Google and rivals read weekly; Instagram and website monthly",
        "Your menu at once, booked in the chat, reminded, invited back: on your own number",
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
        text: "You gain the patients you are losing in public: a WhatsApp inquiry answered at once and booked inside the chat, a reply ready for every new review, the quiet ones you marked invited back, and each step counted on one page.",
        audio: "/voice/g1.mp3",
      },
      {
        id: "10",
        text: "Everything we measure is evidence a patient could find themselves, explained on one page. And what the engine does is counted there too. Measured, not promised.",
        audio: "/voice/10.mp3",
      },
    ],
    card: {
      title: "What you gain",
      facts: ["A WhatsApp inquiry answered at once and booked", "A reply ready for every new review; the quiet patients on your list invited back", "Evidence a patient could find themselves, scored on one dashboard"],
      links: [{ href: "/engine.html", label: "Inside the engine" }],
    },
  },
  {
    id: "see",
    label: "What will I see?",
    clip: "talk",
    lines: [{ id: "o1", text: "Everything in one place, on one link. How patients see your clinic, read every week and every month: one score, and what to fix first. And once the Engine runs, what it did for you, counted: how many wrote in, how many booked, how many came.", audio: "/voice/o1.mp3" }],
    card: {
      title: "Everything in one place",
      facts: ["One link, on your phone", "Your clinic as patients meet it, kept up to date", "Once the Engine runs, what it did, counted"],
      links: [{ href: "/app.html", label: "See it in one place" }],
    },
  },
  {
    id: "start",
    label: "How does it start?",
    clip: "talk",
    lines: [
      {
        id: "a-need",
        text: "For the diagnostic, nothing: it is unannounced. For the Engine, your WhatsApp number, which stays yours, manager access to your Google profile, and a set-up call a week before day one.",
        audio: "/voice/a-need.mp3",
      },
      {
        id: "a-time",
        text: "Your page opens after the first shop, then keeps updating: Google every week, the rest every month, a fresh shop every thirty to sixty days. The Engine runs on a three-month minimum, hands-on for the first thirty days.",
        audio: "/voice/a-time.mp3",
      },
    ],
    card: {
      title: "How it starts",
      facts: ["For the diagnostic: nothing from you", "For the Engine: manager access to your Google profile, and your WhatsApp number, which stays yours", "A set-up call a week before day one; three months minimum"],
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
