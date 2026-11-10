// Run with `npm test`. No spoken line may say words its recording does not (2026-11-10, web-studio's WEB-A). Every line,
// read the way extract.mjs reads it (lab/particle-guide/voice/lines.mjs), is held to lab/particle-guide/voice/recorded.json:
// for each line the SHA-256 of its page text, of its words and of its mp3, written only by verify.py --lock after Whisper
// heard the take say that text. Changed words need a new recording (verify.py will not lock new words on an old one); a
// changed mp3 needs verifying; punctuation alone needs only verify.py --lock. Limit: cues.json is checked for presence only.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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
const fails = [];

for (const c of clashes) fails.push(`${c.id}: one recording, two texts (${c.first} and ${c.second})`);
for (const [id, l] of Object.entries(lines)) {
  const at = `${id} (${l.from})`;
  const e = locked[id];
  if (id in extras) fails.push(`${id}: named in _extras, but a line speaks it`);
  if (!disk.includes(id)) { fails.push(`${at}: a spoken line with no recording`); continue; }
  if (!e || typeof e !== "object") { fails.push(`${at}: never verified against its recording (verify.py --lock)`); continue; }
  if (e.audio !== audio(id)) fails.push(`${at}: its recording changed since it was verified (verify.py --lock checks the new take)`);
  if (e.words !== sha(words(l.text)))
    fails.push(`${at}: its words changed since its recording was verified. Re-record it: verify.py will not lock new words on the old recording`);
  else if (e.text !== sha(l.text)) fails.push(`${at}: punctuation or case changed, the words did not (verify.py --lock)`);
}
for (const id of Object.keys(locked)) if (!lines[id]) fails.push(`${id}: verified once, no longer a spoken line (verify.py --lock removes it)`);
for (const id of disk) {
  if (!lines[id] && !(id in extras)) fails.push(`${id}.mp3: no line speaks it. Name it in _extras with its reason, or remove it`);
  if (!cues[id]) fails.push(`${id}.mp3: no cues in public/guide/cues.json (words.py, then cues.py)`);
}
for (const id of Object.keys(extras)) if (!disk.includes(id)) fails.push(`_extras names ${id}.mp3, which is not on disk`);
for (const id of referenced(site)) {
  if (id in extras) fails.push(`src/ plays /voice/${id}.mp3, which _extras says no page plays`);
  else if (!lines[id]) fails.push(`src/ plays /voice/${id}.mp3, which no checked line speaks: the walk in lines.mjs misses it`);
}

if (fails.length) {
  for (const f of fails) console.error(`FAILED: ${f}`);
  process.exit(1);
}
console.log(`voice-lines: ${Object.keys(lines).length} spoken lines match their verified recordings in text, words and audio; ` +
  `${disk.length} files, ${Object.keys(extras).length} named extras`);
