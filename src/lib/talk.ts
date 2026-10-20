/* Small talk: a visitor talking to her rather than asking about Vaydin. Each
   kind has one line, the owner's words of 2026-10-20, and every line steers
   back to Vaydin. Rude is looked for first and wins over any question in the
   same message; the rest only when nothing about Vaydin was asked. */

import type { Line } from "./pitch.ts";

export type TalkKind = "rude" | "howareyou" | "thanks" | "bye" | "kind" | "personal";

const line = (id: string, text: string): Line => ({ id, text, audio: `/voice/${id}.mp3` });

export const TALK: Record<TalkKind, Line> = {
  rude: line("x-rude", "That's not appropriate, but I'm happy to help you with Vaydin. Ask me anything about your clinic."),
  howareyou: line("x-howareyou", "I'm very well, thank you for asking. What would you like to know about Vaydin?"),
  thanks: line("x-thanks", "You're welcome. Is there anything else I can help with?"),
  bye: line("x-bye", "Thank you for stopping by. We're on WhatsApp whenever you need us."),
  kind: line("x-kind", "That's kind of you, thank you. Now, how can I help with your clinic?"),
  personal: line("x-personal", "I'm Vaydin's voice, so I only talk about Vaydin. Ask me anything about your clinic."),
};

/* "You", the way it is typed. */
const YOU = "(?:you|u|ya|ur|you're|youre|you are|u are|u r|ur so)";
const VERY = "(?:so |very |really |too |soo+ |damn |such an? )?";

const RUDE = new RegExp(
  [
    "\\b(?:fuck\\w*|fck\\w*|shit\\w*|bitch\\w*|bastard|asshole|dick|pussy|cunt|slut|whore|wtf|stfu|motherfucker)\\b",
    "\\b(?:sexy|sex|nudes?|naked|boobs?|tits|horny|kiss me|date me|marry me|go out with me|be my girlfriend|be my wife|send pics?|send photos?|what are you wearing|hot girl|babe)\\b",
    `\\b${YOU} ${VERY}(?:hot|stupid|dumb|idiot|useless|ugly|trash|garbage|retarded|crap|suck|sucks|worthless|pathetic|annoying)\\b`,
    "\\b(?:stupid|dumb|useless|shit|crap) (?:bot|ai|site|website|girl|avatar)\\b",
    "\\bshut up\\b",
    "\\bare (?:you|u) (?:single|hot|sexy|available)\\b",
  ].join("|"),
);

const KIND = new RegExp(
  [
    `\\b${YOU} ${VERY}(?:beautiful|pretty|cute|lovely|gorgeous|smart|clever|amazing|awesome|great|nice|sweet|helpful|cool|brilliant|stunning|perfect|charming|elegant)\\b`,
    "\\b(?:nice|lovely|beautiful|great|good|sweet|amazing) (?:voice|site|website|page|design|work|job|avatar)\\b",
    "\\b(?:love|like) (?:your|the|this) (?:voice|site|website|page|design|avatar|look)\\b",
    `\\b(?:site|website|page|voice|avatar|design) is ${VERY}(?:nice|beautiful|great|amazing|cool|lovely|good)\\b`,
    "\\b(?:i love you|love you|i like you|well done|good job|great job|nice one|you rock)\\b",
  ].join("|"),
);

const HOW = /\b(?:how are (?:you|u)|how r (?:you|u)|how ?(?:'s|s| is) (?:it going|your day|everything|life)|how you doing|how are you doing|what'?s up|wassup|sup|how do (?:you|u) do$|are (?:you|u) (?:ok|okay|good|well|fine)|kaifak|kaifik|kif halak|keef halak)\b/;
const THANKS = /\b(?:thanks?|thank (?:you|u)|thx|thnx|tnx|ty|tysm|shukran|appreciate (?:it|that)|much appreciated|cheers)\b/;
const BYE = /\b(?:bye|byee+|goodbye|good bye|see (?:you|u|ya)|cya|good night|take care|ma ?'?a ?salama|that'?s all|that is all|gotta go)\b/;
const PERSONAL = new RegExp(
  [
    "\\b(?:how old|your age|are (?:you|u) married|(?:you|u) married|where do (?:you|u) live|where were (?:you|u) born|where are (?:you|u) from)\\b",
    "\\bdo (?:you|u) have (?:a |an |any )?(?:boyfriend|husband|wife|family|kids|children|friends|pets?)\\b",
    "\\byour (?:boyfriend|husband|wife|family|kids|age|birthday)\\b",
    "\\b(?:a joke|joke|favou?rite|zodiac|horoscope|your hobby|your hobbies|sing for me|sing a song|dance for me)\\b",
    "\\b(?:can|do|will) (?:you|u) (?:sing|dance)\\b",
    "\\bdo (?:you|u) (?:eat|sleep|dream|drink|like|love|feel|cook)\\b",
    "\\bwhat (?:time|day) is it\\b",
    "\\b(?:the weather|weather today)\\b",
  ].join("|"),
);

export const rude = (text: string) => RUDE.test(text);

/* Small talk in a message that asked nothing about Vaydin. */
export function talk(text: string): TalkKind | null {
  if (KIND.test(text)) return "kind";
  if (HOW.test(text)) return "howareyou";
  if (PERSONAL.test(text)) return "personal";
  if (BYE.test(text)) return "bye";
  if (THANKS.test(text)) return "thanks";
  return null;
}
