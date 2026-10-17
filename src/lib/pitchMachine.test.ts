/* Run with `npm test`. Each case is a sequence of events and the state it must end in. */

import assert from "node:assert/strict";
import { CHAPTERS, POKES } from "./pitch.ts";
import { START, mode, pokeable, reduce, speaking, type Event, type State } from "./pitchMachine.ts";

const run = (events: Event[], from: State = START) => events.reduce(reduce, from);
const arrived = run([{ type: "arrived" }]);
const met = run([{ type: "tap", chapter: "meet" }, { type: "line_ended" }], arrived);

let cases = 0;
const check = (name: string, test: () => void) => {
  test();
  cases++;
  console.log(`ok  ${name}`);
};

check("nothing happens before she arrives", () => {
  assert.equal(run([{ type: "tap", chapter: "meet" }]).phase, "away");
  assert.equal(run([{ type: "poke", index: 0 }]).phase, "away");
});

check("the first tap plays the opener; its end means she is met", () => {
  const opener = run([{ type: "tap", chapter: "meet" }], arrived);
  assert.equal(opener.phase, "opener");
  assert.equal(mode(opener), "opener");
  assert.equal(opener.cloud.id, "01");
  assert.equal(met.phase, "done");
  assert.equal(met.met, true);
});

check("the opener's clock moves the cloud to line 2, never back", () => {
  const opener = run([{ type: "tap", chapter: "meet" }], arrived);
  assert.equal(run([{ type: "cloud_at", seconds: 1 }], opener).cloud.id, "01");
  const second = run([{ type: "cloud_at", seconds: 5 }], opener);
  assert.equal(second.cloud.id, "02");
  assert.equal(run([{ type: "cloud_at", seconds: 5.1 }], second), second);
});

check("a chapter plays its lines in order, then rests", () => {
  const see = run([{ type: "tap", chapter: "see" }], met);
  assert.equal(see.phase, "talking");
  assert.equal(mode(see), "talk");
  assert.equal(see.cloud.id, "03");
  const second = run([{ type: "line_ended" }], see);
  assert.equal(second.cloud.id, "04");
  assert.equal(second.run, see.run);
  const rest = run([{ type: "line_ended" }], second);
  assert.equal(rest.phase, "done");
  assert.equal(rest.chapter, "see");
  assert.equal(rest.lit, false);
});

check("tapping another chip mid-line restarts with a new run; the same chip replays", () => {
  const see = run([{ type: "tap", chapter: "see" }, { type: "line_ended" }], met);
  const fix = run([{ type: "tap", chapter: "fix" }], see);
  assert.equal(fix.chapter, "fix");
  assert.equal(fix.line, 0);
  assert.equal(fix.run, see.run + 1);
  const again = run([{ type: "tap", chapter: "fix" }], fix);
  assert.equal(again.run, fix.run + 1);
  assert.equal(again.cloud.id, "05");
});

check("the last chapter lights the buttons; the next tap puts them out", () => {
  const lit = run([{ type: "tap", chapter: "start" }, { type: "line_ended" }], met);
  assert.equal(lit.lit, true);
  assert.equal(run([{ type: "tap", chapter: "see" }], lit).lit, false);
});

check("pokes only while she rests, and they escalate to the last quip", () => {
  assert.equal(pokeable(arrived), true);
  const quip = run([{ type: "poke", index: 0 }], arrived);
  assert.equal(quip.phase, "quip");
  assert.equal(quip.cloud.id, POKES[0].id);
  assert.equal(speaking(quip), true);
  assert.equal(run([{ type: "poke", index: 1 }], quip), quip);
  assert.equal(run([{ type: "line_ended" }], quip).phase, "idle");
  assert.equal(run([{ type: "poke", index: 9 }], met).cloud.id, POKES[POKES.length - 1].id);
  assert.equal(run([{ type: "poke", index: 0 }], run([{ type: "tap", chapter: "see" }], met)).phase, "talking");
});

check("stop returns to rest; stopping the opener still counts as met", () => {
  const see = run([{ type: "tap", chapter: "see" }], met);
  assert.equal(run([{ type: "stop" }], see).phase, "done");
  const opener = run([{ type: "tap", chapter: "meet" }], arrived);
  const stopped = run([{ type: "stop" }], opener);
  assert.equal(stopped.phase, "done");
  assert.equal(stopped.met, true);
  assert.equal(run([{ type: "stop" }], arrived), arrived);
});

check("every recorded line has a sound or a time, and chapters cover all ten", () => {
  const ids = CHAPTERS.flatMap((c) => c.lines.map((l) => l.id));
  assert.deepEqual(ids, ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]);
  for (const c of CHAPTERS) for (const l of c.lines) assert.ok(c.clip === "opener" ? l.at !== undefined : l.audio, l.id);
  for (const p of POKES) assert.ok(p.audio && p.mood, p.id);
});

console.log(`${cases} cases passed`);
