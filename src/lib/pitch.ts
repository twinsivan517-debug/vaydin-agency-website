/* What the guide says and shows, chapter by chapter. Words are draft 1 of
   2026-10-17, awaiting the owner's approval word by word; every spoken line
   is one mp3 under /voice. The opener is one lip-synced clip carrying its
   own sound, so its lines have no mp3: `at` is the second at which each
   line starts in that clip, measured on the recording. */

export type Mood = "hop" | "shake";
export type Line = { id: string; text: string; audio?: string; at?: number; mood?: Mood };
export type ChapterId = "meet" | "see" | "fix" | "grow" | "proof" | "start";
export type Card = { title: string; body: string; facts: string[]; links: { href: string; label: string }[] };
export type Chapter = { id: ChapterId; label: string; clip: "opener" | "talk"; lines: Line[]; card: Card };

export const OPENER_VIDEO = "/guide/opener.mp4";

/* In the cloud as she walks in. Not spoken: no sound may start before a tap. */
export const GREETING: Line = {
  id: "00",
  text: "Hi, I'm Vaydin's voice. Welcome. Tap a chapter, ask me anything about Vaydin, or just tap me.",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "meet",
    label: "Hello",
    clip: "opener",
    lines: [
      { id: "01", text: "Hi. I'm Vaydin's voice. Give me ninety seconds.", at: 0 },
      { id: "02", text: "Somewhere in Dubai tonight, a patient is choosing a clinic. Your name is on the list.", at: 4.6 },
    ],
    card: {
      title: "Vaydin · Dubai",
      body: "An operations partner for aesthetic clinics. We find the patients your clinic never saw, then run the front door that keeps them.",
      facts: ["Three steps: Diagnose, Fix & run, Grow", "Dubai Silicon Oasis, licensed under IFZA", "Measured, not promised"],
      links: [{ href: "/diagnose.html", label: "Start with the diagnostic" }],
    },
  },
  {
    id: "see",
    label: "See",
    clip: "talk",
    lines: [
      {
        id: "03",
        text: "First, we see what your patients see. An unannounced visit to your own clinic, measured from the outside, scored, and delivered to you.",
        audio: "/voice/03.mp3",
      },
      {
        id: "04",
        text: "Nobody there is doing anything wrong. The team is busy with the patient in front of them. Meanwhile, one message waits. Then it leaves.",
        audio: "/voice/04.mp3",
      },
    ],
    card: {
      title: "01 · Diagnose",
      body: "An unannounced mystery shop of your own clinic, the way a patient meets it: scored and delivered.",
      facts: ["WhatsApp, Google, Instagram, the website, the booking link", "Scored across six dimensions", "A recurring sweep of everything a patient can find"],
      links: [{ href: "/diagnose.html", label: "How the diagnostic works" }],
    },
  },
  {
    id: "fix",
    label: "Fix",
    clip: "talk",
    lines: [
      {
        id: "05",
        text: "Then we fix it, and run it. Every inquiry answered in minutes, in your clinic's own voice, from your own WhatsApp number. Your reception just taps a tick.",
        audio: "/voice/05.mp3",
      },
      { id: "06", text: "Booked, reminded, revived. No double booking. No “someone will call you back”.", audio: "/voice/06.mp3" },
    ],
    card: {
      title: "02 · Fix & run",
      body: "The Vaydin engine takes over your digital front door, on your own number and in your own voice.",
      facts: ["Every message answered in minutes, around the clock", "Real slots offered; your reception confirms with one tap", "Reminders, easy reschedules, and the quiet list revived"],
      links: [
        { href: "/fix.html", label: "What the engine runs" },
        { href: "/engine.html", label: "Inside the engine" },
      ],
    },
  },
  {
    id: "grow",
    label: "Grow",
    clip: "talk",
    lines: [
      {
        id: "07",
        text: "Only then, fuel. Paid demand and Instagram, poured into an engine we already run. Fuel into a broken engine is the mistake most clinics pay for first.",
        audio: "/voice/07.mp3",
      },
    ],
    card: {
      title: "03 · Grow",
      body: "Paid patient demand and Instagram, only into an engine we already run.",
      facts: ["Campaigns whose every inquiry lands in the engine", "Reels, statics and stories to a brief", "Step three, never step one"],
      links: [{ href: "/grow.html", label: "Growth once the engine runs" }],
    },
  },
  {
    id: "proof",
    label: "Proof",
    clip: "talk",
    lines: [
      { id: "08", text: "And you see all of it. One app, on the phone already in your hand.", audio: "/voice/08.mp3" },
      {
        id: "09",
        text: "The diagnostic never stops. The next unannounced visit scores us too. You never take our word for it.",
        audio: "/voice/09.mp3",
      },
    ],
    card: {
      title: "Measured, not promised",
      body: "Inquiries, bookings and visits on your dashboard as they happen. The next unannounced shop scores the engine too.",
      facts: ["One app, on the phone already in your hand", "Every shop scores us as well as you", "You never take our word for it"],
      links: [{ href: "/engine.html", label: "Inside the engine" }],
    },
  },
  {
    id: "start",
    label: "Start",
    clip: "talk",
    lines: [{ id: "10", text: "Start with the diagnostic. Your plan arrives on WhatsApp. No forms.", audio: "/voice/10.mp3" }],
    card: {
      title: "Your plan",
      body: "Every plan starts with the measurement. Add the engine when you want it fixed and run for you.",
      facts: ["Your plan arrives on WhatsApp, no forms", "The diagnostic alone tells you the truth", "The engine makes the truth change"],
      links: [{ href: "/pricing.html", label: "See the plans" }],
    },
  },
];

/* What she says when touched, in order; past the last she repeats it. The
   mood moves her picture: a hop, then a shake once she has had enough. */
export const POKES: Line[] = [
  { id: "p1", text: "Hi there. Tap a chapter and I'll explain.", audio: "/voice/poke-1.mp3", mood: "hop" },
  { id: "p2", text: "Yes? I'm listening.", audio: "/voice/poke-2.mp3", mood: "hop" },
  { id: "p3", text: "Careful, I'm working.", audio: "/voice/poke-3.mp3", mood: "hop" },
  { id: "p4", text: "Okay, okay. What would you like to know?", audio: "/voice/poke-4.mp3", mood: "hop" },
  { id: "p5", text: "I'm a guide, not a button.", audio: "/voice/poke-5.mp3", mood: "shake" },
  { id: "p6", text: "Fine. I'll just stand here, then.", audio: "/voice/poke-6.mp3", mood: "shake" },
];

export const chapter = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;

/* How long a line stays up when its sound cannot play: reading speed. */
export const talkTime = (text: string) => Math.min(8000, Math.max(1800, text.length * 50));
