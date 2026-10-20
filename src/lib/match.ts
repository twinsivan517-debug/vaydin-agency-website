/* Matches a typed question to one of the approved answers, in the browser,
   with no service behind it. Whole words only; a keyword of several words
   scores by its length; a tie at the top asks the visitor to choose. When no
   word matches, a misspelt or differently ended word is looked for, and what
   it finds is only offered, never answered. */

import { ANSWERS, type Answer } from "./answers.ts";

export type Reply =
  | { kind: "answer"; answer: Answer }
  | { kind: "choose"; options: Answer[] }
  | { kind: "greeting" }
  | { kind: "unknown" };

const GREETING = /^(hi|hello|hey|salam|salaam|marhaba|good (morning|afternoon|evening)|thanks?|thank you)\b/;

/* Words too common to be a misspelling of a keyword. */
const COMMON = new Set(
  "about also anything been best could does doing done from give good have hello help here into just know like make many more much need please really should some something tell than thank thanks that their them then there they this very want were what when where which will with work works would your".split(
    " ",
  ),
);

function normalise(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
}

function hasWord(text: string, word: string) {
  return ` ${text} `.includes(` ${word} `) || ` ${text} `.includes(` ${word}s `);
}

function score(text: string, answer: Answer) {
  return answer.keywords.reduce((total, word) => (hasWord(text, word) ? total + word.split(" ").length : total), 0);
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

/* A typed word close enough to a keyword's word: the same first letter and one
   slip (two in a word of eight letters or more), or the same stem with
   another ending. Short and common words must match exactly. */
function near(typed: string, word: string) {
  if (typed === word || typed === `${word}s`) return true;
  if (typed.length < 4 || word.length < 4 || COMMON.has(typed) || typed[0] !== word[0]) return false;
  const allowed = word.length >= 8 ? 2 : 1;
  if (Math.abs(typed.length - word.length) <= allowed && slips(typed, word) <= allowed) return true;
  const shorter = Math.min(typed.length, word.length);
  let same = 0;
  while (same < shorter && typed[same] === word[same]) same++;
  return shorter >= 5 && same >= Math.min(6, shorter);
}

function nearScore(words: string[], answer: Answer) {
  return answer.keywords.reduce((total, keyword) => {
    const parts = keyword.split(" ");
    const found = words.some((_, at) => at + parts.length <= words.length && parts.every((part, k) => near(words[at + k], part)));
    return found ? total + parts.length : total;
  }, 0);
}

/* Up to three answers a misspelt question most likely meant. */
function closest(text: string): Answer[] {
  const words = text.split(" ");
  return ANSWERS.map((answer) => ({ answer, points: nearScore(words, answer) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((entry) => entry.answer);
}

export function match(input: string): Reply {
  const text = normalise(input);
  if (!text) return { kind: "unknown" };

  const ranked = ANSWERS.map((answer) => ({ answer, points: score(text, answer) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points);

  if (ranked.length === 0) {
    const options = closest(text);
    if (options.length > 0) return { kind: "choose", options };
    return GREETING.test(text) ? { kind: "greeting" } : { kind: "unknown" };
  }
  if (ranked.length > 1 && ranked[1].points === ranked[0].points) {
    return {
      kind: "choose",
      options: ranked
        .filter((entry) => entry.points === ranked[0].points)
        .slice(0, 3)
        .map((entry) => entry.answer),
    };
  }
  return { kind: "answer", answer: ranked[0].answer };
}
