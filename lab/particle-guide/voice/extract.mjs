// Every spoken line of the site with its file name, read from the site's own sources. node extract.mjs SITE_DIR OUT_JSON
import { readdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const [site, out] = process.argv.slice(2);
const lib = (f) => import(pathToFileURL(join(site, "src", "lib", f)).href);
const lines = {};
const add = (audio, text, from) => {
  if (!audio) return;
  const id = audio.replace(/^.*\//, "").replace(/\.mp3$/, "");
  if (lines[id] && lines[id].text !== text) console.error(`two texts for ${id} (${from})`);
  lines[id] = { text, from };
};
const walk = (v, from) => {
  if (Array.isArray(v)) v.forEach((x) => walk(x, from));
  else if (v && typeof v === "object") {
    if (typeof v.text === "string" && typeof v.audio === "string") add(v.audio, v.text, from);
    Object.values(v).forEach((x) => walk(x, from));
  }
};
for (const f of ["pitch.ts", "talk.ts", "pages.ts"]) walk(await lib(f), f);
const answers = await lib("answers.ts");
walk(answers, "answers.ts");
const { ANSWERS } = answers;
for (const a of ANSWERS) add(a.voice || `/voice/a-${a.id}.mp3`, a.answer, "answers.ts");
const disk = readdirSync(join(site, "public", "voice")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4));
console.log("lines found", Object.keys(lines).length, "files on disk", disk.length);
console.log("on disk, no text:", disk.filter((d) => !lines[d]).join(" ") || "none");
console.log("text, no file:", Object.keys(lines).filter((l) => !disk.includes(l)).join(" ") || "none");
writeFileSync(out, JSON.stringify(lines, null, 1));
