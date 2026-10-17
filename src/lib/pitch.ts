/* What the guide says and shows, chapter by chapter: draft 3 of 2026-10-17,
   corrected on the clinic-growth-bot house's product truth and approved by
   the owner for recording. Every spoken line is one mp3 under /voice. The
   opener is one lip-synced clip carrying its own sound, so its lines have
   no mp3: `at` is the second at which each line starts in that clip,
   measured on the recording. No statistic anywhere: none stands behind one. */

export type Mood = "hop" | "shake";
export type Line = { id: string; text: string; audio?: string; at?: number; mood?: Mood };
export type ChapterId = "meet" | "found" | "lost" | "fixed" | "grow" | "proof" | "start";
export type Card = { title: string; body: string; facts: string[]; links: { href: string; label: string }[] };
export type Chapter = { id: ChapterId; label: string; clip: "opener" | "talk"; lines: Line[]; card: Card };

export const OPENER_VIDEO = "/guide/opener.mp4";
/* The same greeting as sound alone, for when the clip cannot play. */
export const OPENER_AUDIO = "/voice/opener.mp3";

/* In the cloud while she sleeps. Not spoken: no sound may start before a tap. */
export const SLEEPING: Line = { id: "00", text: "Zzz… Tap me to wake me up." };

export const CHAPTERS: Chapter[] = [
  {
    id: "meet",
    label: "Hello",
    clip: "opener",
    lines: [
      { id: "01", text: "Thank you for waking me. I'm Vaydin's voice.", at: 0 },
      {
        id: "02",
        text: "Pick a chapter or ask me anything, and I'll show you how patients find a clinic, and how a clinic loses them without ever knowing.",
        at: 3.25,
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
    id: "found",
    label: "Found",
    clip: "talk",
    lines: [
      {
        id: "03",
        text: "Every new patient meets your clinic before anyone greets them: your Google profile, your rating, your latest reviews, your Instagram, your website. Then they write on WhatsApp.",
        audio: "/voice/03.mp3",
      },
      { id: "04", text: "We believe they book with whoever answers first and best. That game is played in public, every day.", audio: "/voice/04.mp3" },
    ],
    card: {
      title: "How patients find you",
      body: "Every new patient meets your clinic before anyone greets them.",
      facts: ["Your Google profile, your rating, your latest reviews", "Your Instagram and your website", "Then WhatsApp: whoever answers first and best"],
      links: [{ href: "/diagnose.html", label: "The six rooms we score" }],
    },
  },
  {
    id: "lost",
    label: "Lost",
    clip: "talk",
    lines: [
      {
        id: "05",
        text: "Picture a clinic. A review sits unanswered for nine days. Instagram shows three posts this month. A WhatsApp inquiry gets no price, no booking, and “please call us”.",
        audio: "/voice/05.mp3",
      },
      {
        id: "06",
        text: "Nobody did anything wrong. The team was busy with the patient in front of them. Meanwhile, the patient on the phone booked somewhere else.",
        audio: "/voice/06.mp3",
      },
    ],
    card: {
      title: "How a clinic loses them",
      body: "Picture a clinic: nobody doing anything wrong, and a patient gone.",
      facts: ["A review unanswered for days", "A WhatsApp inquiry with no price and no booking offered", "Silence after the patient goes quiet"],
      links: [{ href: "/diagnose.html", label: "What the diagnostic finds" }],
    },
  },
  {
    id: "fixed",
    label: "Fixed",
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
      title: "Layer 1 and Layer 2",
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
    id: "grow",
    label: "Grow",
    clip: "talk",
    lines: [{ id: "09", text: "Only then, fuel: paid demand and Instagram, and only on a running engine. Never on its own.", audio: "/voice/09.mp3" }],
    card: {
      title: "Grow",
      body: "Paid demand and Instagram, only on a running engine.",
      facts: ["Campaigns whose every inquiry lands in the engine", "Reels, statics and stories to a brief", "No AI patients, no before-and-afters, ever"],
      links: [{ href: "/grow.html", label: "Growth once the engine runs" }],
    },
  },
  {
    id: "proof",
    label: "Proof",
    clip: "talk",
    lines: [
      {
        id: "10",
        text: "Everything we measure is evidence a patient could find themselves, scored and explained, counted on one dashboard. And the next unannounced shop scores us too. Measured, not promised.",
        audio: "/voice/10.mp3",
      },
    ],
    card: {
      title: "Measured, not promised",
      body: "Evidence a patient could find themselves, scored and explained, on one dashboard.",
      facts: ["Every room scored, every month", "The next unannounced shop scores us too", "No case study invented, ever"],
      links: [{ href: "/engine.html", label: "Inside the engine" }],
    },
  },
  {
    id: "start",
    label: "Start",
    clip: "talk",
    lines: [{ id: "11", text: "Start with the diagnostic. Your plan arrives on WhatsApp. No forms.", audio: "/voice/11.mp3" }],
    card: {
      title: "Your plan",
      body: "Start with the diagnostic. Add the Engine when you want it fixed and run for you.",
      facts: ["Your plan arrives on WhatsApp, no forms", "Intelligence month to month, thirty days' notice", "The Engine, three months minimum"],
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
  { id: "p6", text: "Fine. I'll just lie back down, then.", audio: "/voice/poke-6.mp3", mood: "shake" },
];

export const chapter = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;

/* How long a line stays up when its sound cannot play: reading speed. */
export const talkTime = (text: string) => Math.min(8000, Math.max(1800, text.length * 50));
