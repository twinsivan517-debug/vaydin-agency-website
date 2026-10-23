/* What he says in the corner of the other pages: one welcome for all, and
   each page's summary when the visitor says yes. The owner's words of
   2026-10-20; every fact is the page's own. Keyed by the page's file name. */

import type { Reply } from "./match.ts";
import type { Line } from "./pitch.ts";

const line = (id: string, text: string): Line => ({ id, text, audio: `/voice/${id}.mp3` });

export const WELCOME = line("x-welcome", "Hi, welcome to this page. Would you like a short summary of it?");

export const SUMMARIES: Record<string, Line> = {
  diagnose: line(
    "p-diagnose",
    "This is the diagnostic. Unannounced, a real person messages your clinic on WhatsApp like a patient, and we read your Google and Instagram. Every month you get one score across six rooms, with the evidence behind it.",
  ),
  fix: line(
    "p-fix",
    "This is the Engine. We stop reporting the leaks and run the machine: every patient inquiry answered, booked, reminded and revived, and your Google, reviews, Instagram and website kept immaculate. You grant access; you keep the keys.",
  ),
  grow: line(
    "p-grow",
    "This is Grow, the third step. Once the Engine runs your clinic, we add fuel: paid patient demand, and Instagram run like a channel, all counted on the same dashboard.",
  ),
  engine: line(
    "p-engine",
    "This page shows the engine live on one screen. Every channel a patient can reach you on flows into one system that answers, books, reminds, revives and counts. Thirteen jobs, working while you sleep.",
  ),
  pricing: line(
    "p-pricing",
    "Every plan is built for your clinic. Start with the diagnostic, and add the Engine when the numbers convince you. Message us on WhatsApp and a person sends yours.",
  ),
};

/* In the corner there are no chapter chips to point at: a greeting is met
   with the welcome, and a question he cannot answer with the list. */
export const inCorner = (r: Reply): Reply | "welcome" | "more" => (r.kind === "greeting" ? "welcome" : r.kind === "unknown" ? "more" : r);
