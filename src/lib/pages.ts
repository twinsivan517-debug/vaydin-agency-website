/* What he says in the corner of the other pages: one welcome for all, and
   each page's summary when the visitor says yes. The owner's words of
   2026-10-20; every fact is the page's own. Keyed by the page's file name. */

import type { Reply } from "./match.ts";
import type { Line } from "./pitch.ts";

const line = (id: string, text: string): Line => ({ id, text, audio: `/voice/${id}.mp3` });

export const WELCOME = line("x-welcome", "Hi, welcome to this page. Would you like a short summary of it?");

export const SUMMARIES: Record<string, Line> = {
  app: line(
    "p-app",
    "This page shows what you see once Vaydin works for your clinic: one link on your phone, how patients find you read for you every week and every month, one score with what to fix first, and, once the Engine runs, what it did, counted.",
  ),
  diagnose: line(
    "p-diagnose",
    "This is the diagnostic. Unannounced, a real person messages your clinic on WhatsApp like a patient, and we read your Google and Instagram. One score across six areas, with the evidence behind it, on a page that keeps updating.",
  ),
  fix: line(
    "p-fix",
    "This is the Engine. We stop reporting the leaks and run the machine: WhatsApp inquiries answered and booked, visits reminded, quiet patients invited back, your Google profile checked and a reply ready for every new review, with four more built around your clinic. You grant access; you keep the keys.",
  ),
  grow: line(
    "p-grow",
    "This is Grow, the third step. It opens only once the Engine runs your clinic and its bookings are proven. Then we add fuel: paid patient demand and Instagram content, landing in the engine that already books.",
  ),
  engine: line(
    "p-engine",
    "This page shows the engine on one screen. Your WhatsApp and your Google profile flow into one system that answers, books, reminds, invites back and counts. Nine jobs in the engine, and four more built around your clinic.",
  ),
  pricing: line(
    "p-pricing",
    "Every plan is built for your clinic. Start with the diagnostic, and add the Engine when the numbers convince you. Message us on WhatsApp and a person sends yours.",
  ),
};

/* A room's lines (the owner's round of 2026-11-11: the long text and the photos leave, the particles explain). They
   stand beside the room's drawing as written (public/<room>.html, the list marked data-room), and the page speaks
   none of them: he talks only from the corner. Recorded in Jon's voice and parked: no page plays them yet (his "ok",
   2026-11-11). Diagnose's ten were read by core (no holds; 5 reworded) and Layer 2 (9), approved by the owner. */
export const ROOMS: Record<string, Line[]> = {
  diagnose: [
    line("dg-01", "Every thirty to sixty days, unannounced, a real person messages your clinic on WhatsApp, like any new patient."),
    line("dg-02", "We ask what patients ask: the treatment, the price, when they can come. And we record what your clinic said, and when."),
    line("dg-03", "A patient messaging tonight books whoever answers first, and best."),
    line("dg-04", "Before that message, they have seen your Google rating, your reviews and your Instagram. We read those too."),
    line("dg-05", "And we read the clinics around you: how you compare, and when a rival's rating moves."),
    line("dg-06", "It all becomes one score from six areas. Every finding shows its evidence, and every leak comes with what to change."),
    line("dg-07", "And we check AI search: can ChatGPT, Claude and Perplexity read your site, and see that it's a clinic?"),
    line("dg-08", "It lives on one private link on your phone, and it keeps watching."),
    line("dg-09", "Every leak maps to one of our thirteen jobs. Fix it yourself, or we run it for you. That's Step two."),
    line("dg-10", "Month to month. The findings earn the next step, or they don't."),
  ],
};

/* In the corner there are no chapter chips to point at: a greeting is met
   with the welcome, and a question he cannot answer with the list. */
export const inCorner = (r: Reply): Reply | "welcome" | "more" => (r.kind === "greeting" ? "welcome" : r.kind === "unknown" ? "more" : r);
