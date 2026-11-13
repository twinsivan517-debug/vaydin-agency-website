// The site's sentence ledger (WEB-G's proof): every sentence a visitor can read or hear, each with the thing that
// backs it. Check (CI, after the build; pages.yml): red on an untagged sentence, a tagged one that is gone, a bad
// tag, or a claim with no truth read. --write refreshes lab/ledger/ledger.json: keeps every tag and read, adds new
// sentences untagged, drops gone ones and prints them. --no-reads skips the read check (before the reads arrive;
// never in CI). Run with --experimental-strip-types: the guide's sources are TypeScript.
//
// The owner's rulings of 2026-11-10 (web-studio's window): (a) a hold names its house, one of four reasons and where
// ("core: capability system/intake/google_reviews.py:60-63"); a hold that names none is red as such, never silently
// OK. A row NOT BUILT ({by, what, cond}) ships only with its condition in its own words or a neighbour's, and with a
// main-house read classed "ruled not built". (b) a lock tag quotes a few words of its line, or, when the site does not
// itself say them, keeps them in lab/ledger/locks.private.json (gitignored); where the file is on this machine (LOCK_ROOT,
// default the folder three up, which holds the houses here) the words must stand on that line. CI holds only the
// site, so there the words' form is checked and their place is not.
// The repo is public: a read here is a pointer (house, date, a neutral class, row ids). The houses' verbatim reads stay
// on this laptop in lab/ledger/*.private.json, gitignored.
//
// Where it looks: (a) every built page in out/: its text, title, meta descriptions, alt and aria labels, JSON-LD,
// and out/llms.txt line by line;
// (b) the inline scripts of the static pages (public/*.html, shipped as they are), string by string; (c) the
// guide's exports (pitch, answers, doors, pages, talk) and every spoken line; (d) strings and JSX text in
// src/components and src/app, because a card fact or a typed-box hint may live only in the JS bundle.
// HONEST LIMIT: what is "a capability" is the tagger's judgement; this checks coverage, never truth. A string a
// component builds from pieces at run time is not seen.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { collect } from "../lab/particle-guide/voice/lines.mjs";
import { filmLabelElements } from "./film-labels.mjs";

const LEDGER = "lab/ledger/ledger.json";
const TAG = /^(task:[A-Z0-9-]+|job:(1[0-3]|[1-9])|lock:[\w.\/-]+:\d+(-\d+)?( "[^"+]{3,80}")?|none)$/;
const LOCK = /^lock:([\w.\/-]+):(\d+)(?:-(\d+))?(?: "([^"+]+)")?$/;
const LOCKS_PRIVATE = "lab/ledger/locks.private.json";
const HOLD = /^(core|Layer 2|main house): (capability|term|law|lock) \S/;
const HOUSES = ["core", "Layer 2", "main house"];
/* Who must read a claim: core for Layer 1's tasks, Layer 2 for the jobs and its tasks, the main house for the rest. */
const READER = (t) => (t.startsWith("task:CORE") ? "core" : t.startsWith("job:") || t.startsWith("task:L2") ? "Layer 2" : "main house");
const SKIP_KEYS = new Set(["keywords", "id", "audio", "voice", "href", "accent", "clip", "mood", "at", "ids", "kind"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", larr: "←", middot: "·", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…", times: "×" };

const words = (s) => (s.match(/[\p{L}\p{N}]+/gu) || []).length;
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) =>
  e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m);
const clean = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
/* A string that is code, a class list, a selector, a path or a number list, never prose. Checked against the
   sample of 2026-11-10: "(prefers-reduced-motion: reduce)", "header a.mark", an SVG path, "167,139,250". */
/* Plain words and numbers with a comma between them read as prose, never a class list: "3 leaks found, worst first". */
const plainWords = (s) => /, /.test(s) && s.split(/\s+/).every((t) => /^[a-z0-9]+[,.]?$/.test(t));
export const codeLike = (s) => /[{}<=]|;\S|^\s*[.#\[@\/]|rgba?\(|\bvar\(|\d+px\b/.test(s) ||
  (s.match(/\d/g) || []).length > s.length * 0.25 ||
  (!/[A-Z]/.test(s) && !plainWords(s) && s.split(/\s+/).every((t) => /^[a-z0-9:_\/\[\].%#!,()+-]+$/.test(t)) && /[-:\d\/_+]|\w\.\w/.test(s));
const sentences = (block) => clean(block).split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(‘'✓✗])/).map((x) => x.trim()).filter((x) => words(x) >= 3);

function walkFiles(dir, test, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "_next") walkFiles(p, test, out); } else if (test(e)) out.push(p);
  }
  return out;
}

/* A film's labels name its drawings in a word or two, under the three words a sentence needs here, and some are claims
   ("Paid direct"): each one is held whole, so no label's words can change unread. Which elements are labels is
   film-labels.mjs's one definition, the same one the page test judges, whatever element or classes carry them. */
export const filmLabels = (h) => filmLabelElements(h).map((e) => clean(e.inner.replace(/<br\s*\/?>/gi, " "))).filter(Boolean);

export async function gather(site = ".") {
  const found = new Map();
  const add = (s, where) => { if (!found.has(s)) found.set(s, new Set()); found.get(s).add(where); };
  const addBlock = (b, where) => { if (!codeLike(clean(b))) for (const s of sentences(b)) add(s, where); };

  for (const file of walkFiles(join(site, "out"), (n) => n.endsWith(".html"))) {
    const page = relative(join(site, "out"), file).replace(/\\/g, "/");
    let h = readFileSync(file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    const isStatic = existsSync(join(site, "public", page));
    for (const [, attrs, body] of h.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/ld\+json/.test(attrs)) {
        const vals = (v) => typeof v === "string" ? addBlock(v, `${page} (JSON-LD)`) : v && typeof v === "object" && Object.values(v).forEach(vals);
        try { vals(JSON.parse(body)); } catch { /* not JSON: nothing a reader sees */ }
      } else if (isStatic) {
        for (const m of body.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g))
          addBlock((m[1] ?? m[2]).replace(/\\(.)/g, "$1"), `${page} (script)`);
      }
    }
    for (const m of h.matchAll(/<(?:meta|img)\b[^>]*>/g)) {
      const c = m[0].match(/\b(?:content|alt)="([^"]*)"/);
      if (c && /name="(description|twitter:description|twitter:title)"|property="og:(description|title)"|<img/.test(m[0])) addBlock(c[1], `${page} (meta)`);
    }
    for (const m of h.matchAll(/aria-label="([^"]*)"/g)) addBlock(m[1], `${page} (label)`);
    const t = h.match(/<title>([\s\S]*?)<\/title>/);
    if (t) addBlock(t[1], `${page} (title)`);
    for (const s of filmLabels(h)) add(s, `${page} (film label)`);
    /* Inline tags become a space (a tile's spans would glue "machine.Step 03Grow"), blocks a line. */
    const body = h.replace(/<(script|style|head)\b[\s\S]*?<\/\1>/g, " ")
      .replace(/<\/?(b|i|em|strong|a|span|small|sup|sub|code|mark|u|abbr|br)\b[^>]*>/gi, " ").replace(/<[^>]+>/g, "\n");
    for (const block of body.split("\n")) addBlock(block, page);
  }
  /* The file AI search reads: its lines are claims like the pages'. */
  const llms = join(site, "out", "llms.txt");
  if (existsSync(llms)) for (const line of readFileSync(llms, "utf8").split(/\r?\n/)) addBlock(line, "llms.txt");

  const lib = (f) => import(pathToFileURL(join(site, "src", "lib", f)).href);
  for (const f of ["pitch.ts", "answers.ts", "doors.ts", "pages.ts", "talk.ts"]) {
    const visit = (v) => {
      if (typeof v === "string") addBlock(v, f);
      else if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP_KEYS.has(k)) visit(x);
    };
    visit(await lib(f));
  }
  for (const [id, { text }] of Object.entries((await collect(site)).lines)) for (const s of sentences(text)) add(s, `voice:${id}`);

  for (const file of [...walkFiles(join(site, "src", "components"), (n) => n.endsWith(".tsx")), ...walkFiles(join(site, "src", "app"), (n) => n.endsWith(".tsx"))]) {
    const src = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|^\s*\/\/.*$/gm, "");
    const where = relative(site, file).replace(/\\/g, "/");
    for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"|>([^<>{}]+)</g)) addBlock(m[1] ?? m[2], where);
  }
  return found;
}

const load = () => (existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : []);
const norm = (s) => s.replace(/\*/g, "").replace(/\s+/g, " ").trim();

/* found: sentence -> where (from gather); rows: the ledger. Returns what is red, and what could not be checked here. */
export function check(found, rows, { reads = true, lockRoot = join("..", "..", ".."), privateLocks = {} } = {}) {
  const fails = [], notes = new Set(), files = new Map(), order = [...found.keys()];
  const by = new Map(rows.map((r) => [r.s, r]));
  const lockFail = (t) => {
    const [, f, a, b, quoted] = t.match(LOCK);
    const p = join(lockRoot, f);
    if (!files.has(p)) files.set(p, existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).map(norm) : null);
    const lines = files.get(p);
    if (!lines) { notes.add(`lock words not checked: ${f} is not on this machine`); return null; }
    /* Words the site does not itself say stay out of this public file, in the private one (the main house, R4). */
    const w = quoted ?? privateLocks[`${f}:${a}${b ? `-${b}` : ""}`];
    if (!w) return `lock tag quotes no words, here or in ${LOCKS_PRIVATE}: ${f}:${a}`;
    if (lines.slice(a - 1, b ?? a).join(" ").includes(norm(w))) return null;
    const at = lines.findIndex((l) => l.includes(norm(w)));
    return `lock words not on ${f}:${a}: "${w}" ${at >= 0 ? `(now on line ${at + 1}: re-tag)` : "(gone from the file: the lock changed, read the sentence again)"}`;
  };
  for (const [s, w] of found) if (!by.get(s)?.tag) fails.push(`untagged: "${s}" (${[...w].join(", ")})`);
  for (const r of rows) {
    if (!found.has(r.s)) { fails.push(`gone: "${r.s}" (re-run --write)`); continue; }
    const tags = r.tag ? r.tag.split(" + ") : [];
    if (!tags.every((t) => TAG.test(t))) { fails.push(`bad tag "${r.tag}": "${r.s}"`); continue; }
    for (const t of tags) { const m = t.startsWith("lock:") && lockFail(t); if (m) fails.push(`${m}: "${r.s}"`); }
    if (!reads) continue;
    const said = (r.read || "").split(" | ");
    /* Each house whose fact a tag names must have read the row. */
    if (r.tag && r.tag !== "none")
      for (const h of new Set(tags.map(READER))) if (!said.some((p) => p.startsWith(h + " "))) fails.push(`no read by ${h}: "${r.s}" [${r.tag}]`);
    for (const h of r.hold || [])
      fails.push(HOLD.test(h) ? `held by ${h}: "${r.s}"` : `hold names no reason (capability, term, law or lock, then where): "${h}" on "${r.s}"`);
    const nb = r.notBuilt;
    if (nb) {
      const i = order.indexOf(r.s), near = [order[i - 1], r.s, order[i + 1]].filter(Boolean).join(" ").toLowerCase();
      if (!HOUSES.includes(nb.by) || !nb.what || !nb.cond) fails.push(`not built, naming no house, what or condition: "${r.s}"`);
      else if (!near.includes(nb.cond.toLowerCase())) fails.push(`not built, and its condition "${nb.cond}" is not in its words: "${r.s}"`);
      if (!said.some((p) => /^main house [^:]*: ruled not built\b/.test(p))) fails.push(`not built, with no main-house ruling on it: "${r.s}"`);
    }
  }
  return { fails, notes: [...notes] };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const found = await gather(".");
  const rows = load();
  const by = new Map(rows.map((r) => [r.s, r]));
  if (process.argv.includes("--write")) {
    const keep = (r) => ({ ...(r?.hold?.length ? { hold: r.hold } : {}), ...(r?.notBuilt ? { notBuilt: r.notBuilt } : {}) });
    const next = [...found].map(([s, w]) => ({ s, tag: by.get(s)?.tag ?? "", read: by.get(s)?.read ?? "", ...keep(by.get(s)), where: [...w].sort() }));
    for (const r of rows) if (!found.has(r.s)) console.log(`gone: ${r.s}  [${r.tag}]`);
    writeFileSync(LEDGER, JSON.stringify(next, null, 1) + "\n");
    console.log(`ledger: ${next.length} sentences, ${next.filter((r) => !r.tag).length} untagged`);
  } else {
    const reads = !process.argv.includes("--no-reads");
    const privateLocks = existsSync(LOCKS_PRIVATE) ? JSON.parse(readFileSync(LOCKS_PRIVATE, "utf8")) : {};
    const { fails, notes } = check(found, rows, { reads, privateLocks, ...(process.env.LOCK_ROOT ? { lockRoot: process.env.LOCK_ROOT } : {}) });
    for (const f of [...fails, ...notes]) console.log(f);
    console.log(`ledger: ${found.size} sentences, ${fails.length} problem${fails.length === 1 ? "" : "s"}${reads ? "" : " (reads not checked)"}`);
    process.exit(fails.length ? 1 : 0);
  }
}
