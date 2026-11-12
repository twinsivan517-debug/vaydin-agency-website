// Run with `npm test`. The added-lines check bites on each shape it refuses, in the spellings an evader would use
// (case, punctuation, ordinals, no semicolon, JSX, Python), and stays quiet on the comments and names good code is
// made of, including prose that only looks like a shape. Plants are built from pieces, so this file passes its own check.
import assert from "node:assert/strict";
import { scan } from "./added-lines.mjs";

const SL = "/" + "/", OPEN = "/" + "*", CLOSE = "*" + "/", HTML_OPEN = "<" + "!--", HTML_CLOSE = "--" + ">", H = "#";
const diff = (file, lines, isNew = false) =>
  `--- ${isNew ? "/dev/null" : `a/${file}`}\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n${lines.map((l) => `+${l}`).join("\n")}\n`;
let cases = 0;
const red = (name, d, why) => { const f = scan(d); assert.ok(f.some((x) => x.includes(why)), `${name}: wanted "${why}", got ${JSON.stringify(f)}`); cases++; };
const green = (name, d) => { assert.deepEqual(scan(d), [], name); cases++; };
const CODE = "code commented out", DATE = "a date in a new comment", COPY = "named as a second copy";
const dated = (name, when) => red(name, diff("scripts/x.mjs", [`run(); ${SL} changed ${when}`]), DATE);

red("a statement commented out", diff("scripts/x.mjs", [`${SL} const total = price * qty;`]), CODE);
red("a tag commented out", diff("public/x.html", [`${HTML_OPEN} <div class="card"> ${HTML_CLOSE}`]), CODE);
red("a call left inside a block comment", diff("scripts/x.mjs", [`${OPEN} kept for later`, "   runFilm(html, opts);", CLOSE]), CODE);
red("an assignment with no semicolon", diff("scripts/x.mjs", [`${SL} el.style.color = 'red'`]), CODE);
red("a compound assignment", diff("scripts/x.mjs", [`${SL} total += 1;`]), CODE);
red("a call with no semicolon", diff("scripts/x.mjs", [`${SL} render(page)`]), CODE);
red("a return with no semicolon", diff("scripts/x.mjs", [`${SL} return words`]), CODE);
red("a component commented out in JSX", diff("src/app/x.tsx", [`{${OPEN} <Corner page={p} /> ${CLOSE}}`]), CODE);
red("a tag in capitals", diff("public/x.html", [`${HTML_OPEN} <BR> ${HTML_CLOSE}`]), CODE);
red("a tag inside a comment over three lines", diff("public/x.html", [HTML_OPEN, '<div class="hero">', HTML_CLOSE]), CODE);
red("a real comment after a string that holds an opener", diff("src/x.ts", [`const u = "a${OPEN}b"; ${SL} render(page)`]), CODE);
red("a Python assignment", diff("lab/x.py", [`${H} x = load()`]), CODE);
red("a Python def", diff("lab/x.py", [`${H} def speak(line):`]), CODE);
red("a Python import", diff("lab/x.py", [`${H} import json`]), CODE);
red("a Python loop", diff("lab/x.py", [`${H} for v in rows:`]), CODE);
red("a Python with", diff("lab/x.py", [`${H} with open(p) as f:`]), CODE);
red("a count stepped up", diff("scripts/x.mjs", [`${SL} count++`]), CODE);
red("an if on one line", diff("scripts/x.mjs", [`${SL} if (x) return y;`]), CODE);
red("a default export", diff("scripts/x.mjs", [`${SL} export default Foo;`]), CODE);

red("a date in a new comment", diff("scripts/x.mjs", [`${SL} fixed on 2026-11-12 after the read`]), DATE);
red("a written date in a new comment", diff("public/x.html", [`${OPEN} his pick, 11 Nov ${CLOSE}`]), DATE);
red("a date in a Python comment", diff("lab/x.py", [`x = 1  ${H} moved here March 2026`]), DATE);
dated("an ordinal after the month", "November 12th");
dated("an ordinal before the month", "12th Nov");
dated("a month with a full stop", "Nov. 12");
dated("a month in capitals", "NOV 12");
dated("day, month and year with slashes", "12/11/2026");
dated("day, month and year with dots", "12.11.2026");
dated("a month and year with a comma", "November, 2026");
dated("a date joined by a non-breaking hyphen", "2026‑11‑12");
dated("a date joined by an en dash", "2026–11–12");
dated("a date with no separators", "20261112");

red("a new file named as an old copy", diff("scripts/gate-judge_old.mjs", ["export const x = 1;"], true), COPY);
red("a new file with a backup word before its type", diff("src/x.bak.js", ["export const a = 1;"], true), COPY);
red("a new page named as an old copy", diff("public/engine.old.html", ["<p>hi</p>"], true), COPY);
red("a new backup file of any type", diff("src/x.js.bak", ["export const a = 1;"], true), COPY);
red("a file renamed to a copy's name", "diff --git a/scripts/gate.mjs b/scripts/gate_old.mjs\nrename from scripts/gate.mjs\nrename to scripts/gate_old.mjs\n", "renamed or copied");
red("a function named as a second version", diff("scripts/x.mjs", ["function judge" + "V2(rows) {"]), COPY);
red("a legacy constant", diff("src/lib/x.ts", ["export const leg" + "acyDoors = [];"]), COPY);
red("a variable named as the new one", diff("src/x.ts", ["const render_" + "new = () => 1;"]), COPY);
red("a function named as the new one", diff("src/x.ts", ["function render" + "New() {}"]), COPY);
red("a variable named as the original", diff("src/x.ts", ["const config_" + "orig = {};"]), COPY);
red("a variable named as a temporary copy", diff("src/x.ts", ["const page_" + "tmp = 1;"]), COPY);
red("a variable named as the final one", diff("src/x.ts", ["const page_" + "final = 1;"]), COPY);
red("a variable named as the fixed one", diff("src/x.ts", ["const render_" + "fixed = 1;"]), COPY);
red("a variable named as work in progress", diff("src/x.ts", ["const page_" + "wip = 1;"]), COPY);
red("a new file named as a copy of another", diff("scripts/Copy of gate.mjs", ["export const x = 1;"], true), COPY);
red("a new file with a duplicate's number", diff("scripts/gate (1).mjs", ["export const x = 1;"], true), COPY);
red("a class named as an old copy", diff("src/x.css", [".hero-" + "old { color: red; }"]), COPY);
red("an id named as a backup", diff("public/x.html", ['<div id="grow-' + 'backup"></div>']), COPY);

green("a comment that says why", diff("scripts/x.mjs", [`${SL} the median of the per-round differences, not the difference of two medians`]));
green("a web address in a string", diff("scripts/x.mjs", [`const url = "https:${SL}vaydin.agency/";`]));
green("names that only end in letters a copy name has", diff("scripts/x.mjs", ["const threshold = 0.2;", "let old = rows[0];", "const golden = 1;", "const oldest = rows[0];", "const renew = 1;"]));
green("a flag about a new thing", diff("src/x.ts", ["let isNew = false;"]));
green("a film's comment", diff("public/x.html", [`  ${OPEN} a message on its way: a bright head and a trail over an arc ${CLOSE}`]));
green("a date in a data file", diff("lab/ledger/ledger.json", ['  "read": "core 2026-11-12: OK"']));
green("prose that starts like code", diff("scripts/x.mjs", [`${SL} return early when the list is empty`, `${SL} if the anchor moves, the owner says so`]));
green("prose with an equals sign", diff("scripts/x.mjs", [`${SL} width = height * 2 keeps the ratio`, `${SL} import the voices first, then the cues`]));
green("prose words that begin like a month", diff("scripts/x.mjs", [`run(); ${SL} Maybe 2 lines wrap on a phone`, `run(); ${SL} Mark 2 of the film is the dock`, `run(); ${SL} Decide 3 things before the dock`]));
green("a glob inside a line comment, then real code", diff("scripts/x.mjs", [`${SL} a gate/*${"*"} branch only reports.`, "  return { fails, log };"]));
green("a block opener inside a Python string", diff("lab/x.py", ['h = {"Accept": "*' + '/*"}', "data = r.read()"]));
green("a block opener inside a JS string", diff("scripts/x.mjs", ['const h = { Accept: "*' + '/*" };', "const data = r.read();"]));
green("a class that names the page's text", diff("public/x.html", ['<p class="order-' + 'copy reveal">']));
green("an id that names a version shown", diff("lab/x.html", ['<div id="paul-' + 'v4">']));
green("a legacy name kept in a file that already had it", diff("scripts/legacy-gate.mjs", ["const a = 1;"]));

console.log(`${cases} added-lines cases passed`);
