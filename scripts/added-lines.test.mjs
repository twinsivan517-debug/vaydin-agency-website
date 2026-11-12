// Run with `npm test`. The added-lines check bites on each shape it refuses and stays quiet on the comments and
// names good code is made of. Plants are built from pieces, so this file passes its own check.
import assert from "node:assert/strict";
import { scan } from "./added-lines.mjs";

const SL = "/" + "/", OPEN = "/" + "*", CLOSE = "*" + "/", HTML_OPEN = "<" + "!--", HTML_CLOSE = "--" + ">";
const diff = (file, lines, isNew = false) =>
  `--- ${isNew ? "/dev/null" : `a/${file}`}\n+++ b/${file}\n@@ -0,0 +1,${lines.length} @@\n${lines.map((l) => `+${l}`).join("\n")}\n`;
let cases = 0;
const red = (name, d, why) => { const f = scan(d); assert.ok(f.some((x) => x.includes(why)), `${name}: wanted "${why}", got ${JSON.stringify(f)}`); cases++; };
const green = (name, d) => { assert.deepEqual(scan(d), [], name); cases++; };

red("a statement commented out", diff("scripts/x.mjs", [`${SL} const total = price * qty;`]), "code commented out");
red("a tag commented out", diff("public/x.html", [`${HTML_OPEN} <div class="card"> ${HTML_CLOSE}`]), "code commented out");
red("a call left inside a block comment", diff("scripts/x.mjs", [`${OPEN} kept for later`, "   runFilm(html, opts);", CLOSE]), "code commented out");
red("a date in a new comment", diff("scripts/x.mjs", [`${SL} fixed on 2026-11-12 after the read`]), "a date in a new comment");
red("a written date in a new comment", diff("public/x.html", [`${OPEN} his pick, 11 Nov ${CLOSE}`]), "a date in a new comment");
red("a date in a Python comment", diff("lab/x.py", ["x = 1  # moved here March 2026"]), "a date in a new comment");
red("a new file named as an old copy", diff("scripts/gate-judge_old.mjs", ["export const x = 1;"], true), "a new file named as a second copy");
red("a function named as a second version", diff("scripts/x.mjs", ["function judge" + "V2(rows) {"]), "named as a second copy");
red("a legacy constant", diff("src/lib/x.ts", ["export const leg" + "acyDoors = [];"]), "named as a second copy");

green("a comment that says why", diff("scripts/x.mjs", [`${SL} the median of the per-round differences, not the difference of two medians`]));
green("a web address in a string", diff("scripts/x.mjs", [`const url = "https:${SL}vaydin.agency/";`]));
green("names that only end in letters a copy name has", diff("scripts/x.mjs", ["const threshold = 0.2;", "let old = rows[0];", "const golden = 1;"]));
green("a film's comment", diff("public/x.html", [`  ${OPEN} a message on its way: a bright head and a trail over an arc ${CLOSE}`]));
green("a date in a data file", diff("lab/ledger/ledger.json", ['  "read": "core 2026-11-12: OK"']));
green("prose that starts like code", diff("scripts/x.mjs", [`${SL} return early when the list is empty`, `${SL} if the anchor moves, the owner says so`]));
green("a legacy name kept in a file that already had it", diff("scripts/legacy-gate.mjs", ["const a = 1;"]));

console.log(`${cases} added-lines cases passed`);
