// The ship gate on a GitHub runner (the owner's yes, 2026-11-09, given in web-studio: "yes do whatever is
// best fo better work"). It judges the pushed commit before anything deploys: pages.yml's deploy job needs it.
//
// PAIRED, because no single machine holds still: on 2026-11-09 the laptop scored the same bytes 79 to 90, and
// one GitHub runner scored the same commit 69 to 94 within a single job while the next runner gave 70 to 73.
// So the gate measures a fixed ANCHOR commit and the candidate on the same runner, back to back: one
// discarded warm-up each, then RUNS interleaved runs each. Rule: candidate performance median >= anchor
// median - tolerance. The anchor (.github/ship-floors.json) moves only on the owner's word, so losses cannot
// ratchet push after push. The tolerance is measured first by an A/A test (the anchor against itself on
// separate runners) and written down before any candidate is judged; until then main never deploys.
// Accessibility, best practices and SEO keep absolute floors. Weight, dead links, reduce motion and secrets
// are judged as web-studio's laptop ship_check judged them (spine/rituals/ship_check.py verdict()).
//
// HONEST LIMIT: the anchor must be moved by hand, on the owner's word, when a slower page is accepted.
// Reduce motion is a text search without ship_check's starter exclusion (the runner has no starter to compare):
// a new site cloned from the starter would pass on an untouched starter file. vaydin-night passed WITH it.
// This is not a visitor's phone on mobile data, and it does not make the page faster: about 0.4 s of
// Next.js start-up on the home is a real cost on every phone.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { scan as secretScan } from "./secret-scan.mjs";

const RUNS = Number(process.env.RUNS || 5);
const FLOORS = JSON.parse(readFileSync(".github/ship-floors.json", "utf8"));
const ABSOLUTE = FLOORS.floors;       // accessibility, best practices, SEO: one place, the floors file
const TOLERANCE = FLOORS.tolerance;   // null until the A/A test sets it
const BYTES = { static: 600_000, motion: 1_500_000, "3d": 5_000_000 };   // web-studio's SHIP_BYTES
const STORY_PATH = "/frames/";                                           // web-studio's SHIP_STORY_PATH
const MOTION_SAFE = /prefers-reduced-motion|useReducedMotion|motion-reduce:/;
const SOURCE = /\.(tsx|ts|css|jsx|js|mjs)$/;                            // web-studio's SOURCE, src/ only
const LIGHTHOUSE = "lighthouse@13.5.0";
const CAND = { name: "candidate", dir: "out", port: 4173 };
const LIVE = { name: "anchor", dir: process.env.ANCHOR_OUT || "", port: 4174 };
const reportOnly = (process.env.GITHUB_REF || "").startsWith("refs/heads/gate/");
const fails = [];

const site = JSON.parse(readFileSync("site.json", "utf8"));
console.log(`[runner-gate] chrome ${tryRun("google-chrome", ["--version"])} · image ${process.env.ImageVersion || "?"} · runs ${RUNS} each`);

function tryRun(cmd, args) { try { return execFileSync(cmd, args, { encoding: "utf8" }).trim(); } catch { return "?"; } }
const url = (t) => `http://127.0.0.1:${t.port}/`;

async function up(t) {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url(t))).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${t.name}: the built site never answered`);
}

function lighthouse(t, label) {
  const out = `lh-${t.name}-${label}.json`;
  execFileSync("npx", ["--yes", LIGHTHOUSE, url(t), "--form-factor=mobile", "--output=json", `--output-path=${out}`,
    "--quiet", "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,seo,best-practices"], { stdio: "ignore" });
  const d = JSON.parse(readFileSync(out, "utf8"));
  const scores = Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, Math.round((v.score || 0) * 100)]));
  const reqs = d.audits?.["network-requests"]?.details?.items || [];
  const story = reqs.filter((r) => String(r.url || "").includes(STORY_PATH)).reduce((s, r) => s + (r.transferSize || 0), 0);
  const weight = d.audits?.["total-byte-weight"]?.numericValue;
  const bytes = weight ? Math.round(weight - story) : null;   // null = not measured, a refusal (as ship_check)
  return { scores, bytes, bench: Math.round(d.environment?.benchmarkIndex || 0) };
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function deadLinks(t) {
  const html = await (await fetch(url(t))).text();
  const own = new URL(site.url).host.replace(/^www\./, "");
  const seen = new Set(), dead = [];
  for (const m of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const href = m[1] || m[2] || m[3] || "";
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    let u = new URL(href, url(t));
    if (u.host.replace(/^www\./, "") === own) u = new URL(u.pathname + u.search, url(t));
    if (u.host !== new URL(url(t)).host) continue;
    u.hash = "";
    if (seen.has(u.href)) continue;
    seen.add(u.href);
    const res = await fetch(u.href).catch(() => null);
    if (!res || res.status !== 200) dead.push(`${u.pathname} (${res ? res.status : "no answer"})`);   // ship_check: anything but 200
  }
  return dead;
}

// As ship_check's motion_safe: the site's own tracked source under src/ names reduced motion. A text search.
function motionSafe() {
  return execFileSync("git", ["ls-files", "-z", "src"], { encoding: "utf8" }).split("\0")
    .filter((p) => p && SOURCE.test(p))
    .some((p) => { try { return MOTION_SAFE.test(readFileSync(p, "utf8")); } catch { return false; } });
}

const servers = [];
try {
  fails.push(...secretScan().map((s) => `secret: ${s}`));
  if (site.tier !== "static" && !motionSafe()) fails.push("a motion or 3D site whose own code shows no sign it honours 'reduce motion'");

  const targets = [CAND, ...(LIVE.dir && existsSync(LIVE.dir) ? [LIVE] : [])];
  for (const t of targets) servers.push(spawn("npx", ["http-server", t.dir, "-s", "-g", "-c-1", "-p", String(t.port), "-a", "127.0.0.1"], { stdio: "ignore" }));
  for (const t of targets) await up(t);

  for (const t of targets) lighthouse(t, "warmup");                       // discarded
  const runs = Object.fromEntries(targets.map((t) => [t.name, []]));
  // Interleaved, and the order flips each round (candidate first, then anchor first), so neither side
  // always runs on the warmer machine.
  for (let n = 0; n < RUNS; n++) for (const t of (n % 2 ? [...targets].reverse() : targets)) runs[t.name].push(lighthouse(t, n));
  for (const t of targets) console.log(`[runner-gate] ${t.name.padEnd(9)} performance in run order ${JSON.stringify(runs[t.name].map((r) => r.scores.performance))} · benchmark ${JSON.stringify(runs[t.name].map((r) => r.bench))}`);

  const cand = runs.candidate, perf = median(cand.map((r) => r.scores.performance));
  const judged = cand.find((r) => r.scores.performance === perf);
  console.log(`[runner-gate] candidate median: performance ${perf} · a11y ${judged.scores.accessibility} · BP ${judged.scores["best-practices"]} · SEO ${judged.scores.seo} · ${judged.bytes == null ? "weight not measured" : judged.bytes.toLocaleString("en") + " b"}`);
  if (runs.anchor) {
    const anchor = median(runs.anchor.map((r) => r.scores.performance));
    console.log(`[runner-gate] anchor ${FLOORS.anchor} median: performance ${anchor} · difference ${perf - anchor} · tolerance ${TOLERANCE ?? "not yet measured"}`);
    if (TOLERANCE == null) { if (!reportOnly) fails.push("no tolerance yet: the A/A test sets it, and main never deploys before it"); }
    else if (perf < anchor - TOLERANCE) fails.push(`performance ${perf} is more than ${TOLERANCE} under the anchor's ${anchor}, measured side by side`);
  } else if (!reportOnly) {
    fails.push("the anchor could not be built to measure side by side: main never deploys unjudged");
  }
  for (const [k, f] of Object.entries(ABSOLUTE)) if ((judged.scores[k] ?? 0) < f) fails.push(`${k}: ${judged.scores[k]} is under the floor of ${f}`);
  const limit = BYTES[site.tier];
  if (!limit) fails.push(`site.json must name a tier, one of ${Object.keys(BYTES).join(", ")}`);
  else if (!judged.bytes) fails.push("page weight: not measured");
  else if (judged.bytes > limit) fails.push(`page weight: ${judged.bytes.toLocaleString("en")} b is over the ${site.tier} budget of ${limit.toLocaleString("en")} b`);
  // Lighthouse ran through execFileSync, which blocks this process's event loop for minutes; meanwhile the
  // server closed the idle keep-alive socket from up(). Without one yield, the next fetch writes into that dead
  // socket: "fetch failed" (ECONNRESET). Proven 2026-11-09: run 42628188860 failed here, and a local repro
  // failed after an 8 s block and passed after the same block plus one yield.
  await new Promise((r) => setTimeout(r, 50));
  for (const d of await deadLinks(CAND)) fails.push(`dead link: ${d}`);
} catch (e) {
  fails.push(`the gate could not measure: ${e.message}${e.cause ? ` (${e.cause.code || e.cause.message})` : ""}`);
} finally {
  for (const s of servers) s.kill();
}

if (fails.length) {
  console.log("[runner-gate] " + (reportOnly ? "REPORT (gate branch, never deploys):" : "REFUSED:") + "\n  " + fails.join("\n  "));
  if (!reportOnly) process.exit(1);
} else {
  console.log("[runner-gate] PASSED");
}
