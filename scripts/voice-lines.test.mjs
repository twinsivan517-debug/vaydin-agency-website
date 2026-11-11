// Run with `npm test`. No spoken line may say words its recording does not (2026-11-10, web-studio's WEB-A). Every line,
// read the way extract.mjs reads it (lab/particle-guide/voice/lines.mjs), is held to lab/particle-guide/voice/recorded.json:
// for each line the SHA-256 of its page text and of its mp3, its words, and what Whisper HEARD the take say (its words, the
// page words it did not hear, the words it heard beyond the page), written only by verify.py --lock. With no Whisper here,
// the page's words, set against what that very mp3 was heard to say, must leave exactly the lock's not-heard and extra
// words: a changed, added or dropped word turns red however the lock's `said` is edited.
// Changed words need a new take; a changed mp3 needs verifying; punctuation alone needs only verify.py --lock.
// Limits: the lock is trusted -- a hand edit of `heard`, `unheard` or `extra` is caught only by reading its diff, which then
// says in plain words what the recording does not say; the same words in a new order are caught only by `said`; cues.json
// is checked for presence only; src/ is scanned for literal /voice/<id>.mp3 paths only.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { collect, referenced, words } from "../lab/particle-guide/voice/lines.mjs";

const site = fileURLToPath(new URL("..", import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(site, p), "utf8"));
const lock = read("lab/particle-guide/voice/recorded.json");
const cues = read("public/guide/cues.json");
const extras = lock._extras || {};
const locked = lock.lines || {};
const { lines, clashes, disk } = await collect(site);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const audio = (id) => sha(readFileSync(join(site, "public", "voice", `${id}.mp3`)));
const split = (s) => s.split(" ").filter(Boolean);
/* a minus b, counting repeats: the words of a that b does not account for (verify.py's minus()). */
const minus = (a, b) => {
  const left = new Map();
  for (const w of b) left.set(w, (left.get(w) || 0) + 1);
  return a.filter((w) => (left.get(w) ? (left.set(w, left.get(w) - 1), false) : true));
};
const isList = (x) => Array.isArray(x) && x.every((w) => typeof w === "string");
const fails = [];

for (const c of clashes) fails.push(`${c.id}: one recording, two texts (${c.first} and ${c.second})`);
for (const [id, l] of Object.entries(lines)) {
  const at = `${id} (${l.from})`;
  const e = locked[id];
  if (id in extras) fails.push(`${id}: named in _extras, but a line speaks it`);
  if (!disk.includes(id)) { fails.push(`${at}: a spoken line with no recording`); continue; }
  if (!e || typeof e !== "object" || !e.text || typeof e.said !== "string" || !e.audio || typeof e.heard !== "string" ||
      !isList(e.unheard) || !isList(e.extra)) {
    fails.push(`${at}: never verified against its recording (verify.py --lock)`);
    continue;
  }
  if (e.audio !== audio(id)) fails.push(`${at}: its recording changed since it was verified (verify.py --lock checks the new take)`);
  /* heard belongs to this very mp3, so the page's words decide unheard and extra exactly: any change of the words shows. */
  const page = split(words(l.text)), heard = split(e.heard);
  const unheard = minus(page, heard), extra = minus(heard, page);
  const notSaid = minus(unheard, e.unheard), notShown = minus(extra, e.extra);
  const changed = notSaid.length || notShown.length || minus(e.unheard, unheard).length || minus(e.extra, extra).length;
  if (changed)
    fails.push(`${at}: its words no longer match what its recording was heard to say` +
      (notSaid.length ? `; the recording was not heard to say "${notSaid.join(" ")}"` : "") +
      (notShown.length ? `; it was heard to say "${notShown.join(" ")}", which the page does not hold` : "") +
      ". Re-record it: editing the lock does not change what the recording says");
  else if (e.said !== words(l.text))
    fails.push(`${at}: its words changed since its recording was verified (the same words in a new order?). Re-record it`);
  else if (e.text !== sha(l.text)) fails.push(`${at}: punctuation or case changed, the words did not (verify.py --lock)`);
}
for (const id of Object.keys(locked)) if (!lines[id]) fails.push(`${id}: verified once, no longer a spoken line (verify.py --lock removes it)`);
for (const id of disk) {
  if (!lines[id] && !(id in extras)) fails.push(`${id}.mp3: no line speaks it. Name it in _extras with its reason, or remove it`);
  if (!cues[id]) fails.push(`${id}.mp3: no cues in public/guide/cues.json (words.py, then cues.py)`);
}
for (const id of Object.keys(extras)) if (!disk.includes(id)) fails.push(`_extras names ${id}.mp3, which is not on disk`);
/* Every door a cue rings is a tile beside him, and every shape it names is one he draws (2026-11-11: the plan cues
   moved to a sixth door that the engine's colour list did not hold, and he froze on "plan"; an unknown shape fails silently). */
const { DOORS } = await import("../src/lib/doors.ts");
const drawn = new Set([...readFileSync(join(site, "src/lib/figure/shapes.ts"), "utf8").matchAll(/(?:^|[\s,{])"?([\w-]+)"?: \["#[0-9a-f]{6}"/gm)].map((m) => m[1]));
for (const [id, v] of Object.entries(cues)) for (const c of v.cues) {
  if (c.door !== undefined && !(Number.isInteger(c.door) && c.door >= 0 && c.door < DOORS.length))
    fails.push(`${id}: a cue rings door ${c.door}, and the home page has ${DOORS.length} tiles (src/lib/doors.ts)`);
  if (c.shape && !drawn.has(c.shape)) fails.push(`${id}: a cue names the shape "${c.shape}", which src/lib/figure/shapes.ts does not draw`);
}
/* Any index into the colour list that is not a plain number is refused, in every file under src/, whatever the
   variable is called (2026-11-11: the main house planted ACCENT[litDoor] and the four-name pattern passed it).
   Honest limit: an alias (const A = ACCENT; A[door]) still passes. */
const byPlace = /\bACCENT\s*(?:\?\.\s*)?\[\s*(?!\d+\s*\])|\bACCENT\s*\.\s*at\s*\(/;
for (const f of readdirSync(join(site, "src"), { recursive: true }).filter((f) => /\.tsx?$/.test(f)))
  if (byPlace.test(readFileSync(join(site, "src", f), "utf8")))
    fails.push(`src/${f.replaceAll("\\", "/")} picks a colour from ACCENT by a variable, not a plain number: read the tile's own --accent`);
for (const id of referenced(site)) {
  if (id in extras) fails.push(`src/ plays /voice/${id}.mp3, which _extras says no page plays`);
  else if (!lines[id]) fails.push(`src/ plays /voice/${id}.mp3, which no checked line speaks: the walk in lines.mjs misses it`);
}

if (fails.length) {
  for (const f of fails) console.error(`FAILED: ${f}`);
  process.exit(1);
}
console.log(`voice-lines: ${Object.keys(lines).length} spoken lines match what their verified recordings were heard to say; ` +
  `${disk.length} files, ${Object.keys(extras).length} named extras`);
