/* What he says in the corner of the other pages: one welcome for all, and
   each page's summary when the visitor says yes. The owner's words of
   2026-10-20; every fact is the page's own. Keyed by the page's file name. */

import type { Answer } from "./answers.ts";
import { reply, yesNo, type Reply } from "./match.ts";
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
  /* Engine: the words its page already carried and the houses already read (its compare heading and its thirteen
     job names, Layer 2's), shown only, never recorded (his pick, style #8, 2026-11-11). */
  engine: [
    "The same clinic. The same patients. A different machine underneath.",
    "Every first message gets your menu", "Booked inside the chat", "Reminders before each booked visit",
    "The quiet list, invited back", "The next treatment, offered after the visit", "Each step counted",
    "Your Google profile, checked daily", "Every new review, a reply ready", "Every attended patient asked for a review",
    "Consultations, prepared", "Instagram DMs, connected", "Email, connected", "Website concierge",
  ].map((text, i) => ({ id: `en-${String(i).padStart(2, "0")}`, text })),
  /* Fix: its ten lines as read by core and Layer 2 and approved by the owner, shown beside the film, never recorded
     (his pick: show only until a page plays the rooms' lines). */
  fix: [
    "The diagnostic shows you the leaks. Step two doesn't stop at the report: it runs the machine, inside the WhatsApp your patients already use.",
    "A patient who writes at 2am gets your clinic's menu at 2am. Anything typed beyond the menu goes straight to your reception.",
    "They tap a treatment, pick a time, and they're booked, in the same chat. Your reception is told, and can move it with one tap.",
    "Before each visit, a reminder a day ahead and two hours ahead, with Confirm and Reschedule.",
    "After a visit your reception marks as attended: one polite request for a Google review, and your own next treatment, offered once.",
    "Patients who came once and drifted get one invitation back, only the ones on your list who agreed to hear from you.",
    "Your Google profile is read every day: a change you didn't make, hours that don't match your bookings, or a listing Google has closed or suspended is flagged to you. Every new review gets one of your approved replies, posted when reception taps.",
    "Once the Engine runs, every step is counted on the page you already have: how many wrote, how many booked, how many came.",
    "If AI search can't read your site, Website concierge opens what your access lets us reach: a person lets AI search crawlers in where your site builder allows it, tells you the one switch if your host blocks them, and sets out your clinic's own address, hours and phone for machines to read. No promise of a place in AI answers.",
    "You grant access; you keep the keys. No passwords, nothing installed, and the engine never touches your medical system or your money.",
  ].map((text, i) => ({ id: `fx-${String(i + 1).padStart(2, "0")}`, text })),
  /* Grow: its ten lines as read by core, Layer 2 and the main house and approved by the owner, shown beside the film,
     never recorded (his pick: show only, as Fix). */
  grow: [
    "Grow is step three. It opens only once your Engine runs and its bookings are proven, because fuel poured into a leaking machine just makes a more expensive leak.",
    "Then we add the fuel: paid patient demand, and an Instagram your patients actually look at.",
    "Paid campaigns put your clinic in front of the right patients, and every message they bring lands in the engine that already answers and books.",
    "Your ad spend is paid direct and never marked up.",
    "Grow reports it as booked patients and what each one cost. Not clicks, not likes.",
    "In this market, a clinic's Instagram is the clinic.",
    "So we make content for yours to a brief, every month: reels, statics and stories.",
    "No AI-made patients, and no AI-made before-and-afters.",
    "Every inquiry it sends to your WhatsApp gets your menu at once, at midnight too, and books in the chat.",
    "Diagnose finds where patients are lost. The Engine answers and books them. Grow sends you more of them.",
  ].map((text, i) => ({ id: `gr-${String(i + 1).padStart(2, "0")}`, text })),
  /* Your plan: its ten lines as read by core, Layer 2 and the main house and approved by the owner, shown beside the
     film, never recorded (as Fix and Grow). Keyed by its page, pricing.html, which the speed gate measures by name. */
  pricing: [
    "Every plan is built for your clinic, and every plan starts with the measurement.",
    "First, the diagnostic: an unannounced shop, the way a patient meets your clinic. It tells you the truth.",
    "Then the engine changes it, on your own number: every WhatsApp inquiry gets your menu at once, bookings are made in the chat, visits reminded, quiet patients invited back.",
    "Growth comes last: paid demand and presence, only once the engine runs and its bookings are proven.",
    "A typical clinic already pays for the fragments: an agency retainer, tools nobody opens, reception hours spent chasing messages.",
    "And still the message at two in the morning goes unanswered, and new reviews wait on a busy reception.",
    "The full plan replaces them with one engine, operated for you, and growth on top once its bookings are proven. Your Google profile checked daily, a reply ready for every new review, each step counted, live, on your own page.",
    "The diagnostic runs month to month, and stops with thirty days' written notice.",
    "Every number is measured, never promised, and your medical records stay in your own system.",
    "Tell us about your clinic on WhatsApp: a person answers and sends your plan. No forms.",
  ].map((text, i) => ({ id: `pl-${String(i + 1).padStart(2, "0")}`, text })),
};

/* In the corner there are no chapter chips to point at: a greeting is met
   with the welcome, and a question he cannot answer with the list. */
export const inCorner = (r: Reply): Reply | "welcome" | "more" => (r.kind === "greeting" ? "welcome" : r.kind === "unknown" ? "more" : r);

/* A typed line in the corner. A yes to his offer is the page's summary; a decline, there or anywhere, is his
   goodbye, never the list and never an answer: a visitor who turns him down is left in peace, with the WhatsApp
   line. Only a plain no to "Did you mean" asks for the list, because there it means "not those". */
export function cornerReply(text: string, offering: boolean, lastLine: string, offered: Answer[]): Reply | "more" | "summary" | "welcome" {
  if (offering && yesNo(text) === "yes") return "summary";
  const said = reply(text, lastLine, offered);
  return said === "more" ? said : inCorner(said);
}
