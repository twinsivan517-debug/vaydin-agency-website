/* Run with `npm test`. Each case is a sequence of events and the state it must end in. */

import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { ANSWERS, CHOOSE, GROUPS, HELLO, UNKNOWN, UNLISTED, answerLine } from "./answers.ts";
import { match } from "./match.ts";
import { CHAPTERS, POKES, SLEEPING, lineClip } from "./pitch.ts";
import { START, mode, pokeable, reduce, speaking, type Event, type State } from "./pitchMachine.ts";

const run = (events: Event[], from: State = START) => events.reduce(reduce, from);
/* The greeting: the clip (two timed lines), then its spoken third line, then rest. */
const awake = run([{ type: "wake" }, { type: "line_ended" }, { type: "line_ended" }]);

let cases = 0;
const check = (name: string, test: () => void) => {
  test();
  cases++;
  console.log(`ok  ${name}`);
};

check("she sleeps as the page opens, and a tap on her wakes her into the greeting", () => {
  assert.equal(START.phase, "asleep");
  assert.equal(START.cloud, SLEEPING);
  assert.equal(mode(START), "sleep");
  assert.equal(pokeable(START), true);
  const woken = run([{ type: "wake" }]);
  assert.equal(woken.phase, "opener");
  assert.equal(mode(woken), "opener");
  assert.equal(woken.cloud.id, "00b");
  assert.deepEqual(woken.shown, { kind: "chapter", id: "meet" });
  assert.equal(run([{ type: "poke", index: 0 }]).phase, "opener");
  assert.equal(run([{ type: "wake" }], awake), awake);
});

check("a chapter chip or a question also wakes her, straight into the answer", () => {
  const see = run([{ type: "tap", chapter: "how" }]);
  assert.equal(see.phase, "talking");
  assert.equal(see.cloud.id, "07");
  const price = run([{ type: "ask", reply: match("price") }]);
  assert.equal(price.phase, "talking");
  assert.equal(price.cloud.id, "a-price");
});

check("the clip's end hands over to the greeting's spoken line; its end means she is met", () => {
  const clipDone = run([{ type: "wake" }, { type: "line_ended" }]);
  assert.equal(clipDone.phase, "talking");
  assert.equal(clipDone.cloud.id, "02");
  assert.equal(clipDone.met, true);
  assert.equal(awake.phase, "done");
  assert.equal(awake.met, true);
  const again = run([{ type: "tap", chapter: "meet" }], awake);
  assert.equal(again.phase, "opener");
  assert.equal(again.run, awake.run + 1);
});

check("the opener's clock moves the cloud through its three lines, never back", () => {
  const woken = run([{ type: "wake" }]);
  assert.equal(run([{ type: "cloud_at", seconds: 1 }], woken).cloud.id, "00b");
  const second = run([{ type: "cloud_at", seconds: 9 }], woken);
  assert.equal(second.cloud.id, "01");
  assert.equal(run([{ type: "cloud_at", seconds: 9.1 }], second), second);
  assert.equal(run([{ type: "cloud_at", seconds: 40 }], second).cloud.id, "01");
});

check("a chapter plays its lines in order, shows its card, then rests", () => {
  const see = run([{ type: "tap", chapter: "how" }], awake);
  assert.equal(see.phase, "talking");
  assert.equal(mode(see), "talk");
  assert.deepEqual(see.shown, { kind: "chapter", id: "how" });
  const second = run([{ type: "line_ended" }], see);
  assert.equal(second.cloud.id, "08");
  assert.equal(second.run, see.run);
  const rest = run([{ type: "line_ended" }], second);
  assert.equal(rest.phase, "done");
  assert.equal(rest.chapter, "how");
  assert.equal(rest.lit, false);
});

check("tapping another chip mid-line restarts with a new run; the same chip replays", () => {
  const see = run([{ type: "tap", chapter: "how" }, { type: "line_ended" }], awake);
  const fix = run([{ type: "tap", chapter: "gain" }], see);
  assert.equal(fix.chapter, "gain");
  assert.equal(fix.line, 0);
  assert.equal(fix.run, see.run + 1);
  const again = run([{ type: "tap", chapter: "gain" }], fix);
  assert.equal(again.run, fix.run + 1);
  assert.equal(again.cloud.id, "g1");
});

check("the last chapter lights the buttons; the next tap puts them out", () => {
  const lit = run([{ type: "tap", chapter: "price" }, { type: "line_ended" }, { type: "line_ended" }], awake);
  assert.equal(lit.lit, true);
  assert.equal(run([{ type: "tap", chapter: "how" }], lit).lit, false);
});

check("a question is answered aloud and on the card; a tie asks; a miss hands over", () => {
  const price = run([{ type: "ask", reply: match("how much does it cost") }], awake);
  assert.equal(price.cloud.id, "a-price");
  assert.deepEqual(price.shown, { kind: "answer", id: "price" });
  assert.equal(price.chapter, null);
  const miss = run([{ type: "ask", reply: match("zzz qqq") }], awake);
  assert.equal(miss.cloud, UNKNOWN);
  assert.deepEqual(miss.shown, { kind: "unknown" });
  const tie = run([{ type: "ask", reply: { kind: "choose", options: [ANSWERS[0], ANSWERS[1]] } }], awake);
  assert.equal(tie.cloud, CHOOSE);
  assert.deepEqual(tie.shown, { kind: "choose", ids: ["price", "diagnostic"] });
});

check("the matcher finds the obvious ones and keeps a greeting apart", () => {
  const hit = (text: string) => {
    const r = match(text);
    return r.kind === "answer" ? r.answer.id : r.kind;
  };
  assert.equal(hit("What is the diagnostic?"), "diagnostic");
  assert.equal(hit("can I cancel the contract"), "cancel");
  assert.equal(hit("why not just use chatgpt"), "chatgpt");
  assert.equal(hit("do you run instagram ads"), "ads");
  assert.equal(hit("where are you based"), "where");
  assert.equal(hit("is this a chatbot"), "bot");
  assert.equal(hit("hello"), "greeting");
  assert.equal(hit("what is the meaning of life"), "unknown");
});

/* The owner's word of 2026-10-20: visitors misspell and ask the same thing
   in other words. A misspelt question is offered its nearest answers, never
   answered on a guess, and nonsense still reaches a person. */
check("a misspelt question is offered its nearest answers; nonsense still hands over", () => {
  const offered = (text: string) => {
    const r = match(text);
    return r.kind === "choose" ? r.options.map((a) => a.id) : [r.kind];
  };
  const typos: [string, string][] = [
    ["pirce", "price"],
    ["how mutch", "price"],
    ["competiter", "rivals"],
    ["mistery shoper", "diagnostic"],
    ["what is the diagnostik", "diagnostic"],
    ["can i cancle", "cancel"],
    ["privasy", "privacy"],
    ["is it legel", "lawful"],
    ["reveiws", "rooms"],
    ["apointment", "slots"],
    ["chatgtp", "chatgpt"],
    ["staf know", "unannounced"],
  ];
  for (const [text, id] of typos) assert.ok(offered(text).includes(id), `${text} -> ${offered(text)}`);
  for (const text of ["zzz qqq", "what is the meaning of life", "tell me a joke", "how old are you", "football", "make me a sandwich"]) {
    assert.deepEqual(offered(text), ["unknown"], text);
  }
  assert.deepEqual(offered("good morning"), ["greeting"]);
  assert.ok(offered("whats the prise").length <= 3);
});

check("More lists every answer once, except the hand-offs, and leaves her speaking", () => {
  const listed = GROUPS.flatMap((g) => g.ids);
  assert.deepEqual([...listed, ...UNLISTED].sort(), ANSWERS.map((a) => a.id).sort());
  assert.equal(new Set(listed).size, listed.length);
  const see = run([{ type: "tap", chapter: "how" }], awake);
  const list = run([{ type: "more" }], see);
  assert.deepEqual(list.shown, { kind: "more" });
  assert.equal(list.phase, "talking");
  assert.equal(list.cloud, see.cloud);
  assert.equal(list.run, see.run);
});

check("pokes only while she rests awake, and they escalate to the last quip", () => {
  assert.equal(pokeable(awake), true);
  const quip = run([{ type: "poke", index: 0 }], awake);
  assert.equal(quip.phase, "quip");
  assert.equal(quip.cloud.id, POKES[0].id);
  assert.equal(speaking(quip), true);
  assert.equal(run([{ type: "poke", index: 1 }], quip), quip);
  assert.equal(run([{ type: "line_ended" }], quip).phase, "done");
  assert.equal(run([{ type: "poke", index: 9 }], awake).cloud.id, POKES[POKES.length - 1].id);
  assert.equal(run([{ type: "poke", index: 0 }], run([{ type: "tap", chapter: "how" }], awake)).phase, "talking");
});

check("the last quip puts her back to sleep, and a tap wakes her into the greeting again", () => {
  const last = run([{ type: "poke", index: POKES.length - 1 }], awake);
  assert.equal(last.cloud.id, POKES[POKES.length - 1].id);
  const asleep = run([{ type: "line_ended" }], last);
  assert.equal(asleep.phase, "asleep");
  assert.equal(mode(asleep), "sleep");
  assert.equal(asleep.cloud, SLEEPING);
  assert.equal(asleep.met, true);
  assert.equal(pokeable(asleep), true);
  assert.equal(run([{ type: "poke", index: 0 }], asleep).phase, "opener");
  assert.equal(run([{ type: "line_ended" }], run([{ type: "poke", index: 0 }], awake)).phase, "done");
});

check("stop returns to rest; stopping the greeting still counts as met", () => {
  const see = run([{ type: "tap", chapter: "how" }], awake);
  assert.equal(run([{ type: "stop" }], see).phase, "done");
  const stopped = run([{ type: "wake" }, { type: "stop" }]);
  assert.equal(stopped.phase, "done");
  assert.equal(stopped.phase, "done");
  assert.equal(stopped.met, true);
  assert.equal(run([{ type: "stop" }], awake), awake);
  assert.equal(run([{ type: "stop" }]), START);
});

check("every line has a sound or a time, the five questions cover eleven lines, every card links somewhere", () => {
  const ids = CHAPTERS.flatMap((c) => c.lines.map((l) => l.id));
  assert.deepEqual(ids, ["00b", "01", "02", "w1", "07", "08", "g1", "10", "a-need", "a-time", "a-price", "a-cancel"]);
  for (const c of CHAPTERS) {
    for (const l of c.lines) assert.ok(l.at !== undefined || l.audio, l.id);
    assert.ok(c.card.links.length > 0 && c.card.facts.length > 0, c.id);
  }
  for (const p of POKES) assert.ok(p.audio && p.mood, p.id);
  for (const a of ANSWERS) assert.ok(a.keywords.length > 3 && a.link.href, a.id);
});

/* The owner's word of 2026-10-20: a long dash reads as machine-written, and
   a plan is asked for, never priced on the page. */
check("nothing a visitor reads carries a long dash or a price", () => {
  const root = new URL("../../", import.meta.url);
  const read = (dir: string, ext: RegExp) =>
    readdirSync(new URL(dir, root), { recursive: true, encoding: "utf8" })
      .filter((f) => ext.test(f))
      .map((f) => [`${dir}${f}`, readFileSync(new URL(`${dir}${f}`, root), "utf8")] as const);
  for (const [path, text] of [...read("public/", /\.(html|txt)$/), ...read("src/", /\.(tsx?|css)$/)]) {
    assert.ok(!/[\u2014\u2013]/.test(text), `${path} has a long dash`);
    assert.ok(!/AED\s?\d|\d[\d,]*\s?AED|dirhams? a month/i.test(text), `${path} names a price`);
  }
  const said = [...CHAPTERS.flatMap((c) => [...c.lines.map((l) => l.text), ...c.card.facts]), ...ANSWERS.map((a) => a.answer)];
  for (const text of said) assert.ok(!/thousand|dirham|AED|\d,\d{3}/i.test(text), text);
});

/* 2026-10-20: two clips were deleted while lines still named them, and "How
   much?" hung. Every line she can speak must have its recording and its clip
   in public/ before the site ships. */
check("every line she can speak has its recording and its clip", () => {
  const root = new URL("../../", import.meta.url);
  const lines = [...CHAPTERS.flatMap((c) => c.lines), ...POKES, ...ANSWERS.map(answerLine), CHOOSE, UNKNOWN, HELLO];
  const missing: string[] = [];
  for (const l of lines) {
    if (!l.audio) continue;
    for (const path of [l.audio, lineClip(l)]) if (path && !existsSync(new URL(`public${path}`, root))) missing.push(path);
  }
  assert.deepEqual([...new Set(missing)], []);
});

console.log(`${cases} cases passed`);
