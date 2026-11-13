// The ledger's check, on planted rows: each rule turns red on its hit and stays green on its miss.
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check, codeLike, filmLabels } from "./ledger.mjs";

const root = mkdtempSync(join(tmpdir(), "ledger-"));
mkdirSync(join(root, "house"));
writeFileSync(join(root, "house", "RULES.md"), "line one\n- **Grow** only on an active Engine, NEVER standalone.\nline three\n");
const S = "Grow opens once the Engine runs.", N = "Once the Engine runs, the room counts what it did.";
const found = new Map([[S, new Set(["a.html"])], [N, new Set(["a.html"])]]);
const run = (row, opts = {}) => check(found, [row, { s: row.s === S ? N : S, tag: "none", read: "" }], { lockRoot: root, ...opts });
const lock = (n, w) => `lock:house/RULES.md:${n} "${w}"`;
const READ = "main house 2026-11-10: OK";

let n = 0;
const red = (name, row, has, opts) => {
  const { fails } = run(row, opts);
  if (!fails.some((f) => f.includes(has))) throw new Error(`${name}: expected "${has}", got ${JSON.stringify(fails)}`);
  n++;
};
const green = (name, row, opts) => {
  const { fails } = run(row, opts);
  if (fails.length) throw new Error(`${name}: expected green, got ${JSON.stringify(fails)}`);
  n++;
};

green("a lock tag whose words stand on its line", { s: S, tag: lock(2, "only on an active Engine, NEVER standalone"), read: READ });
red("a lock tag with no words anywhere", { s: S, tag: "lock:house/RULES.md:2", read: READ }, "quotes no words");
green("a lock tag whose words are private", { s: S, tag: "lock:house/RULES.md:2", read: READ }, { privateLocks: { "house/RULES.md:2": "NEVER standalone" } });
red("a lock tag whose private words are gone", { s: S, tag: "lock:house/RULES.md:2", read: READ }, "gone from the file", { privateLocks: { "house/RULES.md:2": "sold standalone" } });
red("a lock tag whose line moved", { s: S, tag: lock(1, "NEVER standalone"), read: READ }, "now on line 2");
red("a lock tag whose words are gone", { s: S, tag: lock(2, "sold standalone"), read: READ }, "gone from the file");
{
  const { fails, notes } = run({ s: S, tag: lock(2, "words nobody can check"), read: READ }, { lockRoot: join(root, "absent") });
  if (fails.length || !notes.some((x) => x.includes("not checked"))) throw new Error(`a missing file: ${JSON.stringify({ fails, notes })}`);
  n++;
}
green("no hold", { s: S, tag: "task:CORE-F0", read: "core 2026-11-10: OK" });
red("a hold with no reason", { s: S, tag: "task:CORE-F0", read: "core 2026-11-10: FALSE", hold: ["core"] }, "hold names no reason");
red("a hold with a flat reason", { s: S, tag: "task:CORE-F0", read: "core 2026-11-10: FALSE", hold: ["core: too bold"] }, "hold names no reason");
red("a hold with its reason", { s: S, tag: "task:CORE-F0", read: "core 2026-11-10: FALSE", hold: ["core: capability intake/google_reviews.py:60"] }, "held by core: capability");
const RULED = "main house 2026-11-10: ruled not built (R2)";
const nb = (cond, read = RULED) => ({ s: N, tag: "none", read, notBuilt: { by: "core", what: "the engine room", cond } });
red("not built, with only a plain main-house OK", nb("once the Engine runs", READ), "no main-house ruling on it");
green("not built, its condition in its words, ruled", nb("once the Engine runs"));
red("not built, its condition missing", nb("from day one"), "is not in its words");
red("not built, with no main-house ruling", nb("once the Engine runs", ""), "no main-house ruling");
red("not built, naming no house", { ...nb("once the Engine runs"), notBuilt: { by: "", what: "x", cond: "once" } }, "naming no house");
red("an untagged sentence", { s: S, tag: "", read: "" }, "untagged");
red("a claim with no read", { s: S, tag: "task:CORE-F0", read: "" }, "no read by core");
for (const [s, code] of [["3 leaks found, worst first", false], ["fixed inset-x-0 top-0 z-50", true], ["opacity .3s, transform .3s", true]]) {
  if (codeLike(s) !== code) throw new Error(`codeLike("${s}") should be ${code}`);
  n++;
}
const LABELS = '<div class="gr-tags" aria-hidden="true"><div class="gr-tag" data-in="1" style="left:1%;top:1%">Booked</div>'
  + '<div class="gr-tag fit" data-in="2" style="left:1%;top:1%">Patients,<br>not likes</div>'
  + '<div class="gr-tag wide" data-in="5" style="left:1%;top:1%">Open 24/7</div>'
  + '<span class="gr-tag" data-in="5" style="left:1%;top:1%">Guaranteed results</span>'
  + "<div class='gr-tag' data-in=\"5\">Open late</div><div class=gr-tag data-in=\"5\">Best in Dubai</div></div><div class=\"nav\">Menu</div>";
if (JSON.stringify(filmLabels(LABELS)) !== JSON.stringify(["Booked", "Patients, not likes", "Open 24/7", "Guaranteed results", "Open late", "Best in Dubai"]))
  throw new Error(`a film's labels are held whole, in any element, beside any class, in any quoting, other short text not: got ${JSON.stringify(filmLabels(LABELS))}`);
n++;
if (!/for \(const s of filmLabels\(h\)\) add\(s, `\$\{page\} \(film label\)`\);/.test(readFileSync(new URL("./ledger.mjs", import.meta.url), "utf8")))
  throw new Error("gather() no longer adds the films' labels");
n++;
console.log(`${n} ledger cases passed`);
