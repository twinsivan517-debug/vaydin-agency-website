// The ledger's colours, read on this laptop from the main house's one plan (CI cannot reach it). Each claim takes the
// state of what backs it: a task's colour, a job's build status from the plan's own jobs table, or "lock" for a rule
// of the business. An id the plan does not know is an error. node lab/ledger/colours.mjs [PLAN_JSON] [--rows]
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const plan = JSON.parse(readFileSync(process.argv[2]?.endsWith(".json") ? process.argv[2]
  : join(homedir(), "AppData/Local/jarvis/supervisor/one_plan/plan_as_built.json"), "utf8"));
const rows = JSON.parse(readFileSync(new URL("./ledger.json", import.meta.url), "utf8"));
const tasks = Object.fromEntries(plan.tasks.map((t) => [t.id, t.s]));
const jobs = Object.fromEntries(plan.jobs.map((j) => [String(j.n), j.task ? `${tasks[j.task]} (${j.task})` : j.built]));

const count = {}, unknown = new Set(), byPart = {};
for (const r of rows) {
  if (r.tag === "none") { count.none = (count.none || 0) + 1; continue; }
  for (const part of r.tag.split(" + ")) {
    const [kind, id] = [part.slice(0, part.indexOf(":")), part.slice(part.indexOf(":") + 1)];
    const colour = kind === "task" ? tasks[id] : kind === "job" ? jobs[id] : "lock";
    if (!colour) unknown.add(part);
    byPart[part] ??= { colour: colour || "UNKNOWN", n: 0 };
    byPart[part].n++;
  }
  count.claims = (count.claims || 0) + 1;
}
console.log(`plan built ${plan.meta.built}; ledger ${rows.length} sentences: ${count.claims} claims, ${count.none} none`);
for (const [part, { colour, n }] of Object.entries(byPart).sort()) console.log(`${String(n).padStart(4)}  ${part.padEnd(48)} ${colour}`);
if (process.argv.includes("--rows")) for (const r of rows) if (r.tag !== "none") console.log(`- [${r.tag}] ${r.s}`);
if (unknown.size) { console.log(`UNKNOWN to the plan: ${[...unknown].join(", ")}`); process.exit(1); }
