// Run with `npm test`. Holds the two gates to the preconditions their ports once lost (2026-11-09): the secret
// scan reads what is PUSHED, never the disk; the runner gate refuses past its tolerance and fails closed when
// it cannot measure. A fake key is assembled at run time, so this file never carries one.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { exitCode, judge } from "./gate-judge.mjs";
import { scanPushed } from "./secret-scan.mjs";

let cases = 0;
const test = (name, fn) => { try { fn(); cases++; } catch (e) { console.error(`FAILED: ${name}`); throw e; } };

// --- the runner gate's verdict -------------------------------------------------------------------------
const run = (performance, bytes = 300_000, rest = 100) =>
  ({ scores: { performance, accessibility: rest, "best-practices": rest, seo: rest }, bytes });
const five = (p, bytes) => [p, p, p, p, p].map((x) => run(x, bytes));
const FLOORS = { accessibility: 95, "best-practices": 90, seo: 95 };
const base = { floors: FLOORS, budget: 1_500_000, tier: "motion", tiers: ["static", "motion", "3d"], tolerance: 3, reportOnly: false };
const verdict = (over) => judge({ cand: five(80), anchor: five(84), ...base, ...over });

test("a candidate 4 under the anchor is refused at tolerance 3", () => {
  const { fails } = verdict({});
  assert.equal(fails.length, 1);
  assert.match(fails[0], /more than 3 under the anchor's 84/);
});
test("a candidate exactly 3 under passes", () => assert.deepEqual(verdict({ anchor: five(83) }).fails, []));
test("a faster candidate passes", () => assert.deepEqual(verdict({ anchor: five(70) }).fails, []));
test("the median is judged, not one lucky run", () => {
  const cand = [69, 90, 90, 94, 94].map((p) => run(p));
  assert.deepEqual(judge({ cand, anchor: five(93), ...base }).fails, []);
  assert.equal(judge({ cand, anchor: five(94), ...base }).fails.length, 1);
});
test("no tolerance refuses on main, reports on a gate branch", () => {
  assert.match(verdict({ tolerance: null }).fails[0], /no tolerance yet/);
  assert.deepEqual(verdict({ tolerance: null, reportOnly: true, anchor: five(80) }).fails, []);
});
test("no anchor refuses on main, never passes as if judged", () => {
  for (const anchor of [null, []]) assert.match(verdict({ anchor }).fails[0], /anchor could not be built/);
});
test("weight: unmeasured and over budget both refuse", () => {
  assert.match(verdict({ anchor: five(80), cand: five(80, null) }).fails[0], /page weight: not measured/);
  assert.match(verdict({ anchor: five(80), cand: five(80, 1_600_000) }).fails[0], /over the motion budget/);
  assert.match(verdict({ anchor: five(80), budget: undefined }).fails[0], /must name a tier/);
});
test("an absolute floor refuses on its own", () => {
  const cand = [80, 80, 80].map((p) => run(p, 300_000, 94));
  assert.equal(judge({ cand, anchor: five(80), ...base }).fails.length, 2);   // accessibility 94, SEO 94
});
test("no candidate runs is a failure to measure", () => {
  assert.match(judge({ cand: [], anchor: five(80), ...base }).fails[0], /could not measure/);
});
test("main exits 1 on any finding; a gate branch exits 0", () => {
  assert.equal(exitCode(["x"], false), 1);
  assert.equal(exitCode(["x"], true), 0);
  assert.equal(exitCode([], false), 0);
});

// --- the runner gate, end to end, when it cannot measure ------------------------------------------------
const GATE = resolve("scripts/runner-gate.mjs");
const bare = () => {
  const dir = mkdtempSync(join(tmpdir(), "gate-"));
  mkdirSync(join(dir, ".github"));
  writeFileSync(join(dir, ".github/ship-floors.json"), JSON.stringify({ anchor: "x", tolerance: 3, floors: FLOORS }));
  writeFileSync(join(dir, "site.json"), JSON.stringify({ url: "https://example.com", tier: "motion" }));
  return dir;   // not a git repository: the secret scan throws first, before any server or browser
};
const gate = (cwd, ref, extra = {}) =>
  spawnSync(process.execPath, [GATE], { cwd, encoding: "utf8", env: { ...process.env, GITHUB_REF: ref, ANCHOR_OUT: "", ...extra } });
test("main fails closed when the gate cannot measure", () => {
  const r = gate(bare(), "refs/heads/main");
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /REFUSED:[\s\S]*could not measure/);
});
test("a gate branch that cannot measure reports and never deploys", () => {
  const r = gate(bare(), "refs/heads/gate/x");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /REPORT \(gate branch, never deploys\)/);
});
test("without its floors file the gate does not pass", () => {
  const r = gate(mkdtempSync(join(tmpdir(), "gate-")), "refs/heads/main");
  assert.notEqual(r.status, 0);
});

// --- the secret scan reads the pushed commits, never the disk ---------------------------------------------
const KEY = ["AK", "IA", "ABCDEFGHIJKLMNOP"].join("");
const ZERO = "0".repeat(40);
const repo = () => {
  const dir = mkdtempSync(join(tmpdir(), "scan-"));
  const g = (...a) => execFileSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "core.autocrlf=false", ...a], { cwd: dir, encoding: "utf8" }).trim();
  g("init", "-q");
  const commit = (file, text, msg) => { writeFileSync(join(dir, file), text); g("add", "-A"); g("commit", "-q", "-m", msg); return g("rev-parse", "HEAD"); };
  return { dir, g, commit };
};
const pushed = (dir, local, remote) => {
  const was = process.cwd();
  process.chdir(dir);
  try { return scanPushed(`refs/heads/main ${local} refs/heads/main ${remote}\n`); } finally { process.chdir(was); }
};

test("a key added then removed inside the pushed range is refused, naming its commit", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const withKey = commit("config.ts", `export const k = "${KEY}";\n`, "key");
  const removed = commit("config.ts", 'export const k = "";\n', "remove");
  const found = pushed(dir, removed, start);
  assert.equal(found.length, 1, found.join("; "));
  assert.ok(found[0].startsWith(withKey.slice(0, 7)) && /cloud access key/.test(found[0]), found[0]);
});
test("a key only on disk, never committed, is not what is pushed", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const clean = commit("config.ts", 'export const k = "";\n', "clean");
  writeFileSync(join(dir, "config.ts"), `export const k = "${KEY}";\n`);
  assert.deepEqual(pushed(dir, clean, start), []);
});
test("a key committed, then deleted only on disk, is still refused", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const withKey = commit("config.ts", `export const k = "${KEY}";\n`, "key");
  writeFileSync(join(dir, "config.ts"), 'export const k = "";\n');
  assert.equal(pushed(dir, withKey, start).length, 1);
});
test("a new branch scans every commit it brings, not only its tip; a secret file is refused by name", () => {
  const { dir, g, commit } = repo();
  commit("a.ts", "export const a = 1;\n", "start");
  const env = commit(".env", "TOKEN=1\n", "env");
  g("rm", "-q", ".env");
  g("commit", "-q", "-m", "drop env");
  const found = pushed(dir, g("rev-parse", "HEAD"), ZERO);
  assert.ok(found.some((f) => f.startsWith(env.slice(0, 7)) && /\.env {2}is a secret file/.test(f)), found.join("; "));
});
test("deleting a branch pushes no bytes and passes", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  assert.deepEqual(pushed(dir, ZERO, start), []);
});

console.log(`${cases} gate cases passed`);
