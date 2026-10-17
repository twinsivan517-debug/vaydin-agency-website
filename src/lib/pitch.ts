/* What the guide says, chapter by chapter. Words are script draft 1 of
   2026-10-17, awaiting the owner's approval word by word; every line is
   recorded as one mp3 under /voice. The opener is one lip-synced clip
   carrying its own sound, so its lines have no mp3: `at` is the second at
   which each line starts in that clip, measured on the recording. */

export type Mood = "hop" | "shake";
export type Line = { id: string; text: string; audio?: string; at?: number; mood?: Mood };
export type ChapterId = "meet" | "see" | "fix" | "grow" | "proof" | "start";
export type Chapter = { id: ChapterId; label: string; clip: "opener" | "talk"; lines: Line[] };

export const OPENER_VIDEO = "/guide/opener.mp4";

export const CHAPTERS: Chapter[] = [
  {
    id: "meet",
    label: "Meet her",
    clip: "opener",
    lines: [
      { id: "01", text: "Hi. I'm Vaydin's voice. Give me ninety seconds.", at: 0 },
      { id: "02", text: "Somewhere in Dubai tonight, a patient is choosing a clinic. Your name is on the list.", at: 4.6 },
    ],
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
  },
  {
    id: "start",
    label: "Start",
    clip: "talk",
    lines: [{ id: "10", text: "Start with the diagnostic. Your plan arrives on WhatsApp. No forms.", audio: "/voice/10.mp3" }],
  },
];

/* What she says when poked, in order; the last one repeats. */
export const POKES: Line[] = [
  { id: "p1", text: "Careful, I'm working.", audio: "/voice/poke-1.mp3", mood: "hop" },
  { id: "p2", text: "Yes? Pick a chapter.", audio: "/voice/poke-2.mp3", mood: "hop" },
  { id: "p3", text: "Fine. Tap the gold button instead.", audio: "/voice/poke-3.mp3", mood: "shake" },
];

export const chapter = (id: ChapterId) => CHAPTERS.find((c) => c.id === id)!;

/* How long a line stays up when its sound cannot play: reading speed. */
export const talkTime = (text: string) => Math.min(8000, Math.max(1800, text.length * 50));
