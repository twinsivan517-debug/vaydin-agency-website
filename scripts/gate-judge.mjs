// The runner gate's verdict, apart from its measuring, so a test can hold it to its numbers without a
// browser (scripts/gates.test.mjs). runner-gate.mjs measures; this decides. Messages are the gate's own.
export const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// Round i of the candidate and round i of the anchor ran back to back on one runner (runner-gate.mjs interleaves
// them), so the gate judges the median of the per-round differences, not the difference of two medians: a runner
// that switches between its two speed groups mid-job moves both sides of most rounds alike (the owner's pick,
// 2026-11-11 18:04Z; run 43069225621's /app: medians 87 vs 79, +8; paired, +1). null when the rounds cannot pair.
export const pairedDifference = (cand, anchor) =>
  cand.length && cand.length === anchor.length ? median(cand.map((c, i) => c - anchor[i])) : null;

// Every room the site speaks (src/lib/pages.ts ROOMS) must be among the pages measured, or the gate refuses: a
// room list emptied or broken fails CLOSED (the main house's survivor, 2026-11-11). SPOKEN_ROOMS is the command
// that prints those names, run by the gate and by its test alike.
export const SPOKEN_ROOMS = ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e",
  'const { ROOMS } = await import("./src/lib/pages.ts"); console.log(JSON.stringify(Object.keys(ROOMS)));'];
export const unmeasuredRooms = (spoken, measured) => spoken.filter((r) => !measured.includes(r))
  .map((r) => `room "${r}" is spoken in src/lib/pages.ts but was not measured`);

// cand, anchor: Lighthouse runs, each { scores: { performance, accessibility, ... }, bytes }.
// anchor null or empty = the anchor could not be built. tolerance null = the A/A test has not set it.
export function judge({ cand, anchor, tolerance, floors, budget, tier, tiers, reportOnly, anchorName = "" }) {
  const fails = [], log = [];
  if (!cand?.length) return { fails: ["the gate could not measure: no candidate runs"], log };
  const perf = median(cand.map((r) => r.scores.performance));
  const judged = cand.find((r) => r.scores.performance === perf);
  log.push(`[runner-gate] candidate median: performance ${perf} · a11y ${judged.scores.accessibility} · BP ${judged.scores["best-practices"]} · SEO ${judged.scores.seo} · ${judged.bytes == null ? "weight not measured" : judged.bytes.toLocaleString("en") + " b"}`);
  if (anchor?.length) {
    const base = median(anchor.map((r) => r.scores.performance));
    const d = pairedDifference(cand.map((r) => r.scores.performance), anchor.map((r) => r.scores.performance));
    log.push(`[runner-gate] anchor ${anchorName} median: performance ${base} · difference ${d} (median of ${cand.length} paired rounds; the medians differ by ${perf - base}) · tolerance ${tolerance ?? "not yet measured"}`);
    if (d == null) fails.push(`the gate could not pair the rounds: ${cand.length} candidate runs, ${anchor.length} anchor runs`);
    else if (tolerance == null) { if (!reportOnly) fails.push("no tolerance yet: the A/A test sets it, and main never deploys before it"); }
    else if (d < -tolerance) fails.push(`performance is more than ${tolerance} under the anchor's, measured side by side: the paired rounds differ by ${d} (medians ${perf} and ${base})`);
  } else if (!reportOnly) {
    fails.push("the anchor could not be built to measure side by side: main never deploys unjudged");
  }
  for (const [k, f] of Object.entries(floors)) if ((judged.scores[k] ?? 0) < f) fails.push(`${k}: ${judged.scores[k]} is under the floor of ${f}`);
  if (!budget) fails.push(`site.json must name a tier, one of ${tiers.join(", ")}`);
  else if (!judged.bytes) fails.push("page weight: not measured");
  else if (judged.bytes > budget) fails.push(`page weight: ${judged.bytes.toLocaleString("en")} b is over the ${tier} budget of ${budget.toLocaleString("en")} b`);
  return { fails, log };
}

// Main refuses on any finding; a gate/** branch only reports.
export const exitCode = (fails, reportOnly) => (fails.length && !reportOnly ? 1 : 0);

// The pages judged, each beside the anchor page it must not fall behind on the same runner. /app.html is held to
// the anchor's own /app.html when the anchor has one; an anchor older than the page has none, so it is held to
// grow.html, the same static shell and canvas pattern. A candidate without /app.html is judged on home alone.
// rooms: the inner pages the candidate has rebuilt (their list carries data-room, 2026-11-11), each held to the
// anchor's own copy of the same page; with no tolerance of its own yet, main refuses it (toleranceFor).
export const pairs = (candHasApp, anchorHasApp, rooms = []) => [{ page: "home", cand: "/", anchor: "/" },
  ...(candHasApp ? [{ page: "app", cand: "/app.html", anchor: anchorHasApp ? "/app.html" : "/grow.html" }] : []),
  ...rooms.map((room) => ({ page: room, cand: `/${room}.html`, anchor: `/${room}.html` }))];

// The floors file's tolerance is one number for every page, or one per page ({ home: 2, app: 5 }), each set by an
// A/A test of that page. A page with no number of its own gets null: main then refuses, as before any A/A test.
export const toleranceFor = (tolerance, page) =>
  tolerance !== null && typeof tolerance === "object" ? (Number.isFinite(tolerance[page]) ? tolerance[page] : null) : (tolerance ?? null);

// Every page judged beside its anchor page, each at its own tolerance. runs: { [page]: { candidate: [...], anchor:
// [...] } }. The join of page and tolerance lives here, where a test can hold it, not in the measuring script.
export function judgePages(pagePairs, runs, { tolerance, anchorCommit, ...common }) {
  const fails = [], log = [];
  for (const p of pagePairs) {
    const anchor = runs[p.page]?.anchor;
    const verdict = judge({ ...common, cand: runs[p.page]?.candidate, anchor: anchor?.length ? anchor : null,
      tolerance: toleranceFor(tolerance, p.page), anchorName: `${anchorCommit} ${p.anchor}` });
    log.push(...verdict.log.map((line) => line.replace("[runner-gate]", `[runner-gate] ${p.page}:`)));
    fails.push(...verdict.fails.map((f) => `${p.page} (${p.cand}): ${f}`));
  }
  return { fails, log };
}

// Every audit that costs a point in accessibility, best practices or SEO, by id, so a new failure cannot hide behind
// an old one at the same score (the main house, 2026-11-11: /app's best practices sat at 96 on two runs and the gate
// never said why). Performance is left out: its audits are timings, not pass or fail. lhr: one Lighthouse report.
export const failingAudits = (lhr) => Object.entries(lhr.categories || {}).filter(([k]) => k !== "performance")
  .flatMap(([k, c]) => (c.auditRefs || []).filter((a) => a.weight > 0 && typeof lhr.audits?.[a.id]?.score === "number"
    && lhr.audits[a.id].score < 1).map((a) => `${k}:${a.id}`));

// One side's runs -> "best-practices:errors-in-console 5/5 · seo:link-text 1/5", or "none". against: the other
// side's runs; an audit failing here and in none of those is marked NEW.
export function auditTally(runs, against = null) {
  const n = new Map();
  for (const r of runs) for (const id of new Set(r.failing || [])) n.set(id, (n.get(id) || 0) + 1);
  const seen = against && new Set(against.flatMap((r) => r.failing || []));
  return [...n].sort(([a], [b]) => a.localeCompare(b))
    .map(([id, k]) => `${id} ${k}/${runs.length}${seen && !seen.has(id) ? " NEW" : ""}`).join(" · ") || "none";
}
