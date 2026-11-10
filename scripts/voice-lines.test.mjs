// Run with `npm test`. No spoken line may say words its recording does not (2026-11-10, web-studio's WEB-A; its lessons
// 15 and 16). Every line, read the way extract.mjs reads it (lab/particle-guide/voice/lines.mjs), is held to
// lab/particle-guide/voice/recorded.json, which only verify.py --lock writes, after Whisper heard the take say that text.
// A changed line stays red until it is re-recorded and verified, or re-verified when its spoken words did not change.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { collect } from "../lab/particle-guide/voice/lines.mjs";

const site = fileURLToPath(new URL("..", import.meta.url));
const read = (p) => JSON.parse(readFileSync(join(site, p), "utf8"));
const lock = read("lab/particle-guide/voice/recorded.json");
const cues = read("public/guide/cues.json");
const extras = lock._extras || {};
const locked = lock.lines || {};
const { lines, clashes, disk } = await collect(site);
const sha = (t) => createHash("sha256").update(t, "utf8").digest("hex");
const fails = [];

for (const c of clashes) fails.push(`${c.id}: one recording, two texts (${c.first} and ${c.second})`);
for (const [id, l] of Object.entries(lines)) {
  if (!disk.includes(id)) fails.push(`${id} (${l.from}): a spoken line with no recording`);
  if (id in extras) fails.push(`${id}: named in _extras, but a line speaks it`);
  if (!locked[id]) fails.push(`${id} (${l.from}): never verified against its recording (verify.py --lock)`);
  else if (locked[id] !== sha(l.text))
    fails.push(`${id} (${l.from}): its text changed since its recording was verified. Re-record it, or re-run verify.py --lock if the spoken words did not change`);
}
for (const id of Object.keys(locked)) if (!lines[id]) fails.push(`${id}: verified once, no longer a spoken line (verify.py --lock removes it)`);
for (const id of disk) {
  if (!lines[id] && !(id in extras)) fails.push(`${id}.mp3: no line speaks it. Name it in _extras with its reason, or remove it`);
  if (!cues[id]) fails.push(`${id}.mp3: no cues in public/guide/cues.json (words.py, then cues.py)`);
}
for (const id of Object.keys(extras)) if (!disk.includes(id)) fails.push(`_extras names ${id}.mp3, which is not on disk`);

if (fails.length) {
  for (const f of fails) console.error(`FAILED: ${f}`);
  process.exit(1);
}
console.log(`voice-lines: ${Object.keys(lines).length} spoken lines match the text their recordings were verified against; ` +
  `${disk.length} files, ${Object.keys(extras).length} named extras`);
