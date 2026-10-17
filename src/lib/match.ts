/* Matches a typed question to one of the approved answers, in the browser,
   with no service behind it. Whole words only; a keyword of several words
   scores by its length; a tie at the top asks the visitor to choose. */

import { ANSWERS, type Answer } from "./answers.ts";

export type Reply =
  | { kind: "answer"; answer: Answer }
  | { kind: "choose"; options: Answer[] }
  | { kind: "greeting" }
  | { kind: "unknown" };

const GREETING = /^(hi|hello|hey|salam|salaam|marhaba|good (morning|afternoon|evening)|thanks?|thank you)\b/;

function normalise(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s']/gu, " ").replace(/\s+/g, " ").trim();
}

function hasWord(text: string, word: string) {
  return ` ${text} `.includes(` ${word} `) || ` ${text} `.includes(` ${word}s `);
}

function score(text: string, answer: Answer) {
  return answer.keywords.reduce((total, word) => (hasWord(text, word) ? total + word.split(" ").length : total), 0);
}

export function match(input: string): Reply {
  const text = normalise(input);
  if (!text) return { kind: "unknown" };

  const ranked = ANSWERS.map((answer) => ({ answer, points: score(text, answer) }))
    .filter((entry) => entry.points > 0)
    .sort((a, b) => b.points - a.points);

  if (ranked.length === 0) return GREETING.test(text) ? { kind: "greeting" } : { kind: "unknown" };
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
