// The ship gate on a GitHub runner (the owner's yes, 2026-11-09, given in web-studio: "yes do whatever is
// best fo better work"). It judges the pushed commit before anything deploys: pages.yml's deploy job needs it.
//
// PAIRED, because no single machine holds still: on 2026-11-09 the laptop scored the same bytes 79 to 90, and
// one GitHub runner scored the same commit 69 to 94 within a single job while the next runner gave 70 to 73.
// So the gate measures a fixed ANCHOR commit and the candidate on the same runner, back to back: one
// discarded warm-up each, then RUNS interleaved runs each. Rule: the median of the per-round differences
// (candidate - anchor, round by round) >= -tolerance (gate-judge.mjs pairedDifference; the owner's pick 2026-11-11).
// The anchor (.github/ship-floors.json) moves only on the owner's word, so losses cannot ratchet push after push. The tolerance is measured first by an A/A test (the anchor against itself on
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
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { scan as secretScan } from "./secret-scan.mjs";
import { SPOKEN_ROOMS, auditTally, exitCode, failingAudits, judgePages, pairs, unmeasuredRooms } from "./gate-judge.mjs";

const RUNS = Number(process.env.RUNS || 5);
const FLOORS = JSON.parse(readFileSync(".github/ship-floors.json", "utf8"));
const ABSOLUTE = FLOORS.floors;       // accessibility, best practices, SEO: one place, the floors file
const TOLERANCE = FLOORS.tolerance;   // one number, or one per page (gate-judge.mjs toleranceFor); null until set
const BYTES = { static: 600_000, motion: 1_500_000, "3d": 5_000_000 };   // web-studio's SHIP_BYTES
const STORY_PATH = "/frames/";                                           // web-studio's SHIP_STORY_PATH
const MOTION_SAFE = /prefers-reduced-motion|useReducedMotion|motion-reduce:/;
const SOURCE = /\.(tsx|ts|css|jsx|js|mjs)$/;                            // web-studio's SOURCE, src/ only
const LIGHTHOUSE = "lighthouse@13.5.0";
const CAND = { name: "candidate", dir: "out", port: 4173 };
const LIVE = { name: "anchor", dir: process.env.ANCHOR_OUT || "", port: 4174 };
const reportOnly = (process.env.GITHUB_REF || "").startsWith("refs/heads/gate/");
/* The pages judged (gate-judge.mjs pairs): /app.html is held to the anchor's own /app.html once the anchor has one,
   until then to its grow.html. Each page's tolerance comes from an A/A test of that page against itself (the floors
   file's aa_rule_app and history.aa_app, 2026-11-11). A rebuilt room (its list marked data-room) is judged beside the
   anchor's own copy of that page, and refused on main until its own A/A number is written. */
const ROOMS = (existsSync(CAND.dir) ? readdirSync(CAND.dir) : []).filter((f) => f.endsWith(".html") && readFileSync(`${CAND.dir}/${f}`, "utf8").includes(' data-room="'))
  .map((f) => f.replace(/\.html$/, "")).sort();
const PAIRS = pairs(existsSync(`${CAND.dir}/app.html`), Boolean(LIVE.dir) && existsSync(`${LIVE.dir}/app.html`), ROOMS);
const fails = [];
try {
  fails.push(...unmeasuredRooms(JSON.parse(execFileSync(process.execPath, SPOKEN_ROOMS, { encoding: "utf8" })), PAIRS.map((p) => p.page)));
} catch (e) { fails.push(`the gate could not read the rooms in src/lib/pages.ts: ${e.message}`); }

const site = JSON.parse(readFileSync("site.json", "utf8"));
console.log(`[runner-gate] chrome ${tryRun("google-chrome", ["--version"])} · image ${process.env.ImageVersion || "?"} · runs ${RUNS} each`);

function tryRun(cmd, args) { try { return execFileSync(cmd, args, { encoding: "utf8" }).trim(); } catch { return "?"; } }
const url = (t, path = "/") => `http://127.0.0.1:${t.port}${path}`;

async function up(t) {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(url(t))).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${t.name}: the built site never answered`);
}

function lighthouse(t, label, path = "/") {
  const out = `lh-${t.name}-${label}.json`;
  execFileSync("npx", ["--yes", LIGHTHOUSE, url(t, path), "--form-factor=mobile", "--output=json", `--output-path=${out}`,
    "--quiet", "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance,accessibility,seo,best-practices"], { stdio: "ignore" });
  const d = JSON.parse(readFileSync(out, "utf8"));
  const scores = Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, Math.round((v.score || 0) * 100)]));
  const reqs = d.audits?.["network-requests"]?.details?.items || [];
  const story = reqs.filter((r) => String(r.url || "").includes(STORY_PATH)).reduce((s, r) => s + (r.transferSize || 0), 0);
  const weight = d.audits?.["total-byte-weight"]?.numericValue;
  const bytes = weight ? Math.round(weight - story) : null;   // null = not measured, a refusal (as ship_check)
  return { scores, bytes, bench: Math.round(d.environment?.benchmarkIndex || 0), failing: failingAudits(d) };
}

async function deadLinks(t, path = "/") {
  const html = await (await fetch(url(t, path))).text();
  const own = new URL(site.url).host.replace(/^www\./, "");
  const seen = new Set(), dead = [];
  for (const m of html.matchAll(/<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    const href = m[1] || m[2] || m[3] || "";
    if (!href || /^(mailto:|tel:|javascript:|#)/i.test(href)) continue;
    let u = new URL(href, url(t, path));
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

  const at = (t, p) => (t === CAND ? p.cand : p.anchor);
  for (const p of PAIRS) for (const t of targets) lighthouse(t, `warmup-${p.page}`, at(t, p));   // discarded
  const runs = Object.fromEntries(PAIRS.map((p) => [p.page, Object.fromEntries(targets.map((t) => [t.name, []]))]));
  // Interleaved, and the order flips each round (candidate first, then anchor first), so neither side
  // always runs on the warmer machine.
  for (let n = 0; n < RUNS; n++) for (const p of PAIRS) for (const t of (n % 2 ? [...targets].reverse() : targets))
    runs[p.page][t.name].push(lighthouse(t, `${p.page}-${n}`, at(t, p)));
  for (const p of PAIRS) for (const t of targets) console.log(`[runner-gate] ${p.page} ${t.name.padEnd(9)} ${at(t, p)} performance in run order ${JSON.stringify(runs[p.page][t.name].map((r) => r.scores.performance))} · benchmark ${JSON.stringify(runs[p.page][t.name].map((r) => r.bench))}`);
  for (const p of PAIRS) for (const t of targets) console.log(`[runner-gate] ${p.page} ${t.name.padEnd(9)} failing audits: ${auditTally(runs[p.page][t.name], t === CAND ? runs[p.page].anchor : null)}`);

  const judged = judgePages(PAIRS, runs, { tolerance: TOLERANCE, anchorCommit: FLOORS.anchor,
    floors: ABSOLUTE, budget: BYTES[site.tier], tier: site.tier, tiers: Object.keys(BYTES), reportOnly });
  for (const line of judged.log) console.log(line);
  fails.push(...judged.fails);
  // Lighthouse ran through execFileSync, which blocks this process's event loop for minutes; meanwhile the
  // server closed the idle keep-alive socket from up(). Without one yield, the next fetch writes into that dead
  // socket: "fetch failed" (ECONNRESET). Proven 2026-11-09: run 42628188860 failed here, and a local repro
  // failed after an 8 s block and passed after the same block plus one yield.
  await new Promise((r) => setTimeout(r, 50));
  for (const p of PAIRS) for (const d of await deadLinks(CAND, p.cand)) fails.push(`dead link on ${p.cand}: ${d}`);
} catch (e) {
  fails.push(`the gate could not measure: ${e.message}${e.cause ? ` (${e.cause.code || e.cause.message})` : ""}`);
} finally {
  for (const s of servers) s.kill();
}

if (fails.length) {
  console.log("[runner-gate] " + (reportOnly ? "REPORT (gate branch, never deploys):" : "REFUSED:") + "\n  " + fails.join("\n  "));
  if (exitCode(fails, reportOnly)) process.exit(1);
} else {
  console.log("[runner-gate] PASSED");
}
