// Run with `npm test`. Holds the two gates to the preconditions their ports once lost (2026-11-09): the secret
// scan reads what is PUSHED, never the disk; the runner gate refuses past its tolerance and fails closed when
// it cannot measure. A fake key is assembled at run time, so this file never carries one.
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { exitCode, judge, pairs } from "./gate-judge.mjs";
import { privateWords, scanPushed } from "./secret-scan.mjs";

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
test("an anchor that has /app.html holds /app to its own /app", () => {
  assert.deepEqual(pairs(true, true).map((p) => [p.page, p.cand, p.anchor]), [["home", "/", "/"], ["app", "/app.html", "/app.html"]]);
});
test("an anchor older than /app holds it to grow.html", () => {
  assert.deepEqual(pairs(true, false).map((p) => [p.page, p.anchor]), [["home", "/"], ["app", "/grow.html"]]);
});
test("a candidate without /app.html is judged on home alone", () => {
  assert.deepEqual(pairs(false, true).map((p) => p.page), ["home"]);
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

// --- private words (lesson 22): whole words, any case, in pushed files and messages; the list lives outside ---
// The words below are invented, so this public file carries no real one.
const listFile = (text) => { const p = join(mkdtempSync(join(tmpdir(), "words-")), "list.txt"); writeFileSync(p, text); return p; };
const WORDS = privateWords(listFile("# a comment\nZorblax Quint\nqux@example.test\nPlimbo\n")).words;
const pushedWith = (dir, local, remote, ref = "refs/heads/main") => {
  const was = process.cwd();
  process.chdir(dir);
  try { return scanPushed(`${ref} ${local} ${ref} ${remote}\n`, WORDS); } finally { process.chdir(was); }
};
const SCAN = resolve("scripts/secret-scan.mjs");
const hook = (dir, local, remote, list) => spawnSync(process.execPath, [SCAN, "--pre-push"],
  { cwd: dir, encoding: "utf8", input: `refs/heads/main ${local} refs/heads/main ${remote}\n`, env: { ...process.env, VAYDIN_PRIVATE_WORDS: list } });

test("a private word in a pushed file is refused, naming its commit and the list's line, never the word", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const bad = commit("page.html", "<p>Made by zorblax quint.</p>\n", "page");
  const found = pushedWith(dir, bad, start);
  assert.equal(found.length, 1, found.join("; "));
  assert.ok(found[0].startsWith(bad.slice(0, 7)) && /page\.html .*line 2 of the list/.test(found[0]) && !/zorblax/i.test(found[0]), found[0]);
});
test("a private word in a pushed commit's message is refused", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const bad = commit("b.ts", "export const b = 2;\n", "ask qux@example.test first");
  assert.ok(pushedWith(dir, bad, start).some((f) => /its message carries a private word \(line 3 of the list\)/.test(f)));
});
test("a private word on a later line of a pushed commit's message is refused", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const bad = commit("b.ts", "export const b = 2;\n", "tidy the page\n\nThe second paragraph asks qux@example.test first.");
  assert.ok(pushedWith(dir, bad, start).some((f) => /its message carries a private word \(line 3 of the list\)/.test(f)));
});
test("a private word in a pushed file's path is refused, and the path is not printed", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const bad = commit("plimbo-plan.md", "clean text\n", "notes");
  const found = pushedWith(dir, bad, start);
  assert.ok(found.some((f) => f.startsWith(bad.slice(0, 7)) && /a file path carries a private word \(line 4 of the list\)/.test(f)), found.join("; "));
  assert.ok(!found.some((f) => /plimbo/i.test(f)), found.join("; "));
});
test("a private word in the name of a pushed ref is refused", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const next = commit("b.ts", "export const b = 2;\n", "next");
  const found = pushedWith(dir, next, start, "refs/heads/plimbo-fix");
  assert.deepEqual(found, ["a pushed ref's name carries a private word (line 4 of the list)"]);
});
test("a private word in a pushed commit's author or committer is refused", () => {
  const { dir, g, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  writeFileSync(join(dir, "b.ts"), "export const b = 2;\n");
  g("add", "-A");
  execFileSync("git", ["-c", "user.name=Plimbo Smith", "-c", "user.email=t@t", "commit", "-q", "-m", "clean"], { cwd: dir });
  const byName = g("rev-parse", "HEAD");
  writeFileSync(join(dir, "c.ts"), "export const c = 3;\n");
  g("add", "-A");
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "clean", "--author=t <qux@example.test>"], { cwd: dir });
  const byMail = g("rev-parse", "HEAD");
  const found = pushedWith(dir, byMail, start);
  assert.ok(found.some((f) => f.startsWith(byName.slice(0, 7)) && /its author or committer carries a private word \(line 4 of the list\)/.test(f)), found.join("; "));
  assert.ok(found.some((f) => f.startsWith(byMail.slice(0, 7)) && /its author or committer carries a private word \(line 3 of the list\)/.test(f)), found.join("; "));
  assert.equal(found.length, 2, found.join("; "));
});
test("a private word in the committer alone, with a clean author, is refused", () => {
  const { dir, g, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  writeFileSync(join(dir, "b.ts"), "export const b = 2;\n");
  g("add", "-A");
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "clean"],
    { cwd: dir, env: { ...process.env, GIT_COMMITTER_NAME: "Plimbo Smith", GIT_COMMITTER_EMAIL: "t@t" } });
  const byCommitter = g("rev-parse", "HEAD");
  assert.equal(g("log", "-1", "--format=%an", byCommitter), "t");
  assert.deepEqual(pushedWith(dir, byCommitter, start), [`${byCommitter.slice(0, 7)} its author or committer carries a private word (line 4 of the list)`]);
});
test("a word inside a longer word is not the private word", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const ok = commit("c.py", "np.zorblaxquintalg(x)  # Zorblax Quinted\n", "maths");
  assert.deepEqual(pushedWith(dir, ok, start), []);
});
test("the list fails closed: missing, or comments only", () => {
  assert.match(privateWords(join(tmpdir(), `no-such-list-${process.pid}.txt`)).error, /not on this machine/);
  assert.match(privateWords(listFile("# only a comment\n\n")).error, /no words/);
});
test("the pre-push hook refuses a clean push when the list is missing, and passes it when the list is there", () => {
  const { dir, commit } = repo();
  const start = commit("a.ts", "export const a = 1;\n", "start");
  const next = commit("b.ts", "export const b = 2;\n", "next");
  const missing = hook(dir, next, start, join(dir, "missing.txt"));
  assert.equal(missing.status, 1, missing.stdout + missing.stderr);
  assert.match(missing.stderr, /not on this machine/);
  const present = hook(dir, next, start, listFile("Zorblax Quint\n"));
  assert.equal(present.status, 0, present.stdout + present.stderr);
  assert.match(present.stdout, /1 private words checked/);
});

console.log(`${cases} gate cases passed`);
