// The runner gate's verdict, apart from its measuring, so a test can hold it to its numbers without a
// browser (scripts/gates.test.mjs). runner-gate.mjs measures; this decides. Messages are the gate's own.
export const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

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
    log.push(`[runner-gate] anchor ${anchorName} median: performance ${base} · difference ${perf - base} · tolerance ${tolerance ?? "not yet measured"}`);
    if (tolerance == null) { if (!reportOnly) fails.push("no tolerance yet: the A/A test sets it, and main never deploys before it"); }
    else if (perf < base - tolerance) fails.push(`performance ${perf} is more than ${tolerance} under the anchor's ${base}, measured side by side`);
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
