// Every spoken line of the site, read from its own sources: the one walk extract.mjs and scripts/voice-lines.test.mjs share.
// A line is any object with `text` and `audio`, plus every answer, plus the opener: the lines of an "opener" chapter that
// carry no audio of their own are spoken from OPENER_AUDIO, so their joined text is that file's line (record.py skips it).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

/* A line's words, as a voice would say them: stage directions, case and punctuation aside; every letter and digit of any
   script kept, and a typographic apostrophe read as a plain one. verify.py's words() is the same rule and writes these
   words into the lock, so the test turns red the moment the two rules disagree. A number written as digits instead of
   words counts as changed words. */
export const words = (t) =>
  t.replace(/\[[^\]]*\]/g, " ").replace(/’/g, "'").toLowerCase().replace(/[^\p{L}\p{N}']+/gu, " ").trim()
    .split(" ").filter(Boolean).join(" ");

/* Every /voice/<id>.mp3 named literally anywhere under src/, so a recording played outside the walk is still seen.
   Limits: a path built from a template is not resolved, and a second text for an id the walk already knows is not seen. */
export function referenced(site) {
  const ids = new Set();
  const visit = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) visit(p);
      else if (/\.(ts|tsx|js|mjs)$/.test(e.name))
        for (const m of readFileSync(p, "utf8").matchAll(/\/voice\/([A-Za-z0-9_-]+)\.mp3/g)) ids.add(m[1]);
    }
  };
  visit(join(site, "src"));
  return [...ids];
}

export async function collect(site) {
  const lib = (f) => import(pathToFileURL(join(site, "src", "lib", f)).href);
  const lines = {};
  const clashes = [];
  const add = (audio, text, from) => {
    if (!audio) return;
    const id = audio.replace(/^.*\//, "").replace(/\.mp3$/, "");
    if (lines[id] && lines[id].text !== text) clashes.push({ id, first: lines[id].from, second: from });
    lines[id] = { text, from };
  };
  const walk = (v, from) => {
    if (Array.isArray(v)) v.forEach((x) => walk(x, from));
    else if (v && typeof v === "object") {
      if (typeof v.text === "string" && typeof v.audio === "string") add(v.audio, v.text, from);
      Object.values(v).forEach((x) => walk(x, from));
    }
  };
  const pitch = await lib("pitch.ts");
  walk(pitch, "pitch.ts");
  for (const f of ["talk.ts", "pages.ts"]) walk(await lib(f), f);
  const answers = await lib("answers.ts");
  walk(answers, "answers.ts");
  for (const a of answers.ANSWERS) add(a.voice || `/voice/a-${a.id}.mp3`, a.answer, "answers.ts");
  for (const c of pitch.CHAPTERS.filter((c) => c.clip === "opener")) {
    const spoken = c.lines.filter((l) => !l.audio).map((l) => l.text);
    if (spoken.length) add(pitch.OPENER_AUDIO, spoken.join(" "), "pitch.ts");
  }
  const disk = readdirSync(join(site, "public", "voice")).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4));
  return { lines, clashes, disk };
}
