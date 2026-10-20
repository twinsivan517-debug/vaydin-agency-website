/* Matches a typed question to one of the approved answers, in the browser,
   with no service behind it. A rude message is met first, whatever else it
   asks. Then every answer is scored by the words it shares with the
   question: its keywords count most, then its question and answer text, and
   a word found in few answers counts for more than one found in many; a
   misspelt word still counts, a real word is never corrected into another.
   She answers only a clear winner; close answers are offered to choose
   from; small talk is met when no answer is sure; and a question that
   reaches nothing is tried once more for misspelt keywords alone.

   The weights were tuned on 2026-10-20 against half of 344 visitor
   phrasings written blind to the keywords, and checked on the other half:
   right or offered 119 of 172, wrong 16, where keyword counting alone was
   right or offered 79 and wrong 61. */

import { ANSWERS, type Answer } from "./answers.ts";
import { rude, talk, type TalkKind } from "./talk.ts";

export type Reply =
  | { kind: "answer"; answer: Answer }
  | { kind: "choose"; options: Answer[] }
  | { kind: "talk"; talk: TalkKind }
  | { kind: "greeting" }
  | { kind: "unknown" };

const GREETING = /^(hi|hello|hey|salam|salaam|marhaba|good (morning|afternoon|evening))\b/;

/* A keyword word counts this many times an answer-text word. */
const KEYWORD = 1.5;
/* Each word of a keyword phrase found whole. */
const PHRASE = 3;
/* Each word of any keyword found exactly, as the matcher first counted. */
const EXACT = 1;
/* She answers when the best scores at least this, and this many times the next. */
const SURE = 1.5;
const MARGIN = 1.8;
/* Below this nothing is offered; offered are those within this share of the best. */
const OFFER = 3.5;
const KEEP = 0.5;

/* Words that say nothing about which answer is meant; her email's words too. */
const FILLER = new Set(
  "hello dot vaydin a an and any are as at be been being but by can could did do does doing done for from get got had has have having he her here hey hi him his how i i'm if in into is it it's its just let me my no not now of off on once only or our ours out over own please pls so some such than that that's the their them then there these they this those to too u ur us very was we we're were what what's whats when where which while who whom why will with would yes you you're your yours also about again all am because before both each few more most other same should until up down".split(
    " ",
  ),
);

/* Words too common to be a misspelling of a keyword. */
const COMMON = new Set(
  "about also anything been best could does doing done from give good have hello help here into just know like make many more much need please really should some something tell than thank thanks that their them then there they this very want were what when where which will with work works would your".split(
    " ",
  ),
);

function normalise(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
}

const content = (text: string) => normalise(text).split(" ").filter((w) => w && !FILLER.has(w));

function hasWord(text: string, word: string) {
  return ` ${text} `.includes(` ${word} `) || ` ${text} `.includes(` ${word}s `);
}

/* Letters to change, add, drop or swap to turn one word into the other. */
function slips(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/* A typed word close enough to a word she knows: the same first letter and
   one slip (two in a word of eight letters or more), or the same stem with
   another ending. Short and common words must match exactly. */
function near(typed: string, word: string) {
  if (typed === word || typed === `${word}s` || word === `${typed}s`) return true;
  if (typed.length < 4 || word.length < 4 || COMMON.has(typed) || typed[0] !== word[0]) return false;
  const allowed = word.length >= 8 ? 2 : 1;
  if (Math.abs(typed.length - word.length) <= allowed && slips(typed, word) <= allowed) return true;
  const shorter = Math.min(typed.length, word.length);
  let same = 0;
  while (same < shorter && typed[same] === word[same]) same++;
  return shorter >= 5 && same >= Math.min(6, shorter);
}

/* Each answer's words: its one-word keywords, and the rest of what it says. */
const STRONG = ANSWERS.map((a) => [...new Set(a.keywords.filter((k) => !k.includes(" ")).flatMap(content))]);
const WEAK = ANSWERS.map((a) => [...new Set(content(`${a.question} ${a.answer} ${a.keywords.filter((k) => k.includes(" ")).join(" ")}`))]);
const KNOWN = new Set([...STRONG, ...WEAK].flat());

function scores(text: string) {
  const points = ANSWERS.map(() => 0);
  const keyed = ANSWERS.map(() => false);
  for (const typed of new Set(content(text))) {
    /* A real word is matched as written; only an unknown one may be a slip. */
    const exact = KNOWN.has(typed) || KNOWN.has(typed.replace(/s$/, ""));
    const like = (w: string) => (exact ? typed === w || typed === `${w}s` || w === `${typed}s` : near(typed, w));
    const strong = STRONG.map((words) => words.some(like));
    const weak = WEAK.map((words) => words.some(like));
    const found = strong.filter((s, i) => s || weak[i]).length;
    if (!found) continue;
    const telling = Math.log((ANSWERS.length + 1) / found);
    ANSWERS.forEach((_, i) => {
      points[i] += strong[i] ? KEYWORD * telling : weak[i] ? telling : 0;
      if (strong[i]) keyed[i] = true;
    });
  }
  ANSWERS.forEach((a, i) => {
    for (const keyword of a.keywords) {
      if (!hasWord(text, keyword)) continue;
      const n = keyword.split(" ").length;
      points[i] += EXACT * n + (n > 1 ? PHRASE * n : 0);
      keyed[i] = true;
    }
  });
  return ANSWERS.map((answer, i) => ({ answer, points: points[i], keyed: keyed[i] })).sort((a, b) => b.points - a.points);
}

/* Up to three answers whose keywords a misspelt question comes nearest. */
function misspelt(text: string): Answer[] {
  const words = text.split(" ");
  return ANSWERS.map((answer) => ({
    answer,
    points: answer.keywords.reduce((total, keyword) => {
      const parts = keyword.split(" ");
      const found = words.some((_, at) => at + parts.length <= words.length && parts.every((part, k) => near(words[at + k], part)));
      return found ? total + parts.length : total;
    }, 0),
  }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((entry) => entry.answer);
}

export function match(input: string): Reply {
  const text = normalise(input);
  if (!text) return { kind: "unknown" };
  if (rude(text)) return { kind: "talk", talk: "rude" };

  const ranked = scores(text);
  const [first, second] = ranked;
  const sure = first.keyed && first.points >= SURE && first.points >= MARGIN * second.points;
  const said = talk(text);
  if (said && !sure) return { kind: "talk", talk: said };
  if (first.points < OFFER || !ranked.slice(0, 3).some((entry) => entry.keyed)) {
    if (GREETING.test(text)) return { kind: "greeting" };
    const options = misspelt(text);
    return options.length > 0 ? { kind: "choose", options } : { kind: "unknown" };
  }
  if (sure) return { kind: "answer", answer: first.answer };
  return {
    kind: "choose",
    options: ranked
      .filter((entry) => entry.points >= first.points * KEEP)
      .slice(0, 3)
      .map((entry) => entry.answer),
  };
}

/* A reply to "Did you mean": yes takes the first offered, an ordinal takes
   that one, no asks for the list. Only when the reply is nothing more than
   that; anything else is a new question. */
const YES = new Set("y yes yeah yea yeh yep yup ya yah ok okay sure correct right exactly true absolutely definitely course aiwa aywa haan".split(" "));
const NO = new Set("n no nope nah neither none wrong".split(" "));
const PLACE: Record<string, number> = { first: 0, "1st": 0, "1": 0, second: 1, "2nd": 1, "2": 1, third: 2, "3rd": 2, "3": 2, last: -1 };
const AND = new Set("please pls that this these those them one it is the i mean meant did do number thanks thank you of thing".split(" "));

/* A reply that is only a yes or only a no, to any question she asked. */
export function yesNo(input: string): "yes" | "no" | null {
  const words = normalise(input).split(" ");
  if (words.length > 6) return null;
  const said = words.filter((w) => !AND.has(w));
  if (said.length > 0 && said.every((w) => YES.has(w))) return "yes";
  if (said.length > 0 && said.every((w) => NO.has(w))) return "no";
  return null;
}

export function followUp(input: string, offered: Answer[]): Reply | "more" | null {
  const words = normalise(input).split(" ");
  if (offered.length === 0 || words.length > 6) return null;
  const said = words.filter((w) => !AND.has(w));
  const place = said.find((w) => w in PLACE);
  if (place !== undefined && said.every((w) => w === place || YES.has(w) || NO.has(w))) {
    const answer = offered.at(PLACE[place]);
    return answer ? { kind: "answer", answer } : null;
  }
  if (said.length > 0 && said.every((w) => YES.has(w))) return { kind: "answer", answer: offered[0] };
  if (said.length > 0 && said.every((w) => NO.has(w))) return "more";
  return null;
}
