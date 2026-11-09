// The ship gate on a fixed GitHub runner (the owner's yes, 2026-11-09, given in web-studio: "yes do whatever
// is best fo better work"). It replaces the laptop gate, whose scores swung 79 to 90 on unchanged bytes.
// It measures the build of the pushed commit, served the way `npm start` serves it (http-server -s -g),
// before anything deploys: the deploy job in pages.yml needs this step to pass.
//
// Floors live in .github/ship-floors.json, set from 5 runs of the live commit 4396036 on this runner
// (run 42624917106: performance [69, 90, 90, 94, 94]) BEFORE any candidate was measured. The performance
// floor is that baseline's median, 90: the same statistic this gate judges, so the live site passes and
// anything slower fails. The rule first written here, the lowest of the 5 runs, would have set 69 from a
// cold first run; it was replaced, openly, before any candidate was measured (2026-11-09).
// With no floors file (the baseline branch) it only reports, and main never passes without one.
//
// HONEST LIMIT: this runner removes the laptop's drift. It is not a visitor's phone on mobile data, and it
// does not make the page faster: about 0.4 s of Next.js start-up on the home is a real cost on every phone.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const RUNS = Number(process.env.RUNS || 3);
const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/`;
const LIGHTHOUSE = "lighthouse@13.5.0"; // the version the laptop gate ran, pinned
const FLOORS_FILE = ".github/ship-floors.json";
const onMain = process.env.GITHUB_REF === "refs/heads/main";

function fail(why) {
  console.error(`[runner-gate] REFUSED: ${why}`);
  process.exit(1);
}

async function up() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  fail("the built site never answered on " + URL);
}

function once(n) {
  const out = `lighthouse-${n}.json`;
  execFileSync("npx", ["--yes", LIGHTHOUSE, URL, "--form-factor=mobile", "--output=json", `--output-path=${out}`,
    "--quiet", "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,seo,best-practices"], { stdio: "inherit" });
  const data = JSON.parse(readFileSync(out, "utf8"));
  return Object.fromEntries(Object.entries(data.categories).map(([k, v]) => [k, Math.round((v.score || 0) * 100)]));
}

const server = spawn("npx", ["http-server", "out", "-s", "-g", "-c-1", "-p", String(PORT), "-a", "127.0.0.1"], { stdio: "ignore" });
try {
  await up();
  const runs = [];
  for (let n = 0; n < RUNS; n++) runs.push(once(n));
  runs.sort((a, b) => (a.performance || 0) - (b.performance || 0));
  const middle = runs[Math.floor(runs.length / 2)];
  console.log(`[runner-gate] performance runs ${JSON.stringify(runs.map((r) => r.performance))}, the middle one is judged`);
  for (const [k, v] of Object.entries(middle)) console.log(`[runner-gate] ${k.padEnd(16)} ${v}`);

  if (!existsSync(FLOORS_FILE)) {
    if (onMain) fail(`no ${FLOORS_FILE}: main never deploys unjudged`);
    console.log("[runner-gate] BASELINE: no floors yet, measured and reported only");
  } else {
    const { floors } = JSON.parse(readFileSync(FLOORS_FILE, "utf8"));
    const under = Object.entries(floors).filter(([k, f]) => (middle[k] ?? 0) < f).map(([k, f]) => `${k} ${middle[k] ?? 0} is under the floor of ${f}`);
    if (under.length) fail(under.join("; "));
    console.log("[runner-gate] PASSED every floor");
  }
} finally {
  server.kill();
}
