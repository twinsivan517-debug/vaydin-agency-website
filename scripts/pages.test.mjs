// Run with `npm test`. Holds every public page to what a render can hide: style comments that open also close
// (a comment cut in half still renders); the brand mark keeps its own shape; a room's film draws shapes only --
// nothing written, no picture, no pixel read; a room's lines are lit unless its film runs. Each guard is also shown
// biting on a planted fault.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import vm from "node:vm";
import { filmLabelElements } from "./film-labels.mjs";
import { filmScript, roomPages, runFilm } from "./film-canvas.mjs";

let cases = 0;
const test = (name, fn) => { try { fn(); cases++; } catch (e) { console.error(`FAILED: ${name}`); throw e; } };
const read = (f) => readFileSync(`public/${f}`, "utf8").replace(/\r\n/g, "\n");
const pages = readdirSync("public").filter((f) => f.endsWith(".html"));
const rooms = roomPages(pages, read);

// --- style comments ------------------------------------------------------------------------------------
const styles = (html) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
export const commentFault = (css) => {
  let open = false;
  for (const m of css.matchAll(/\/\*|\*\//g)) {
    if (m[0] === "/*" && !open) open = true;
    else if (m[0] === "*/" && open) open = false;
    else return `"${m[0]}" at ${m.index} while a comment is ${open ? "open" : "closed"}`;
  }
  return open ? "a comment opens and never closes" : null;
};
test("every page's style comments open and close in turn", () => {
  for (const f of pages) styles(read(f)).forEach((css, i) => assert.equal(commentFault(css), null, `${f} style block ${i + 1}`));
});
test("a comment cut in half is caught", () => {
  assert.ok(commentFault(".a{color:red} /* the trimmer took this { for a rule"));
  assert.ok(commentFault(".a{color:red} half a comment */ .b{}"));
  assert.equal(commentFault("/* one */ .a{} /* two */"), null);
});

// --- the brand mark --------------------------------------------------------------------------------------
const markFault = (css) => [...css.matchAll(/\.brand img\{([^}]*)\}/g)].map((m) => m[1])
  .find((d) => /width:\s*\d/.test(d) && /height:\s*\d/.test(d)) ?? null;
test("the brand mark is never forced into a box of both width and height", () => {
  for (const f of pages) for (const css of styles(read(f))) assert.equal(markFault(css), null, `${f}: .brand img{${markFault(css)}}`);
});
test("a squashed mark is caught", () => assert.ok(markFault(".brand img{width:32px;height:32px}")));

// --- the films -------------------------------------------------------------------------------------------
// Shapes, fills, gradients and transforms. A new kind of call is added here by a person, never by a film.
const ALLOWED = new Set(["save", "restore", "setTransform", "translate", "rotate", "scale", "clearRect", "fillRect",
  "rect", "roundRect", "beginPath", "closePath", "moveTo", "lineTo", "arc", "quadraticCurveTo", "bezierCurveTo",
  "fill", "stroke", "clip", "createLinearGradient", "createRadialGradient"]);
const outside = (methods) => Object.keys(methods).filter((k) => !ALLOWED.has(k));
test("there are room pages to judge", () => assert.ok(rooms.length >= 2, `rooms found: ${rooms.join(", ")}`));
for (const f of rooms) {
  for (const opts of [{ width: 1240 }, { width: 390 }, { width: 1240, reduced: true }]) {
    test(`${f} at ${opts.width}${opts.reduced ? " reduced" : ""}: the film draws shapes only, to its end`, () => {
      const r = runFilm(read(f), opts);
      assert.deepEqual(outside(r.methods), [], `${f} calls outside the list`);
      assert.ok(r.methods.fillRect > 0, `${f} drew nothing`);
      assert.ok(r.settled, `${f} never settled`);
      if (!opts.reduced) assert.ok(r.frames > 300, `${f} ran only ${r.frames} frames`);
    });
  }
}
test("a film that writes is caught, however the call is spelled", () => {
  const html = read(rooms[0]);
  for (const plant of ["ctx.fillText('4.8', 10, 10);", "ctx['fill' + 'Text']('4.8', 10, 10);", "ctx.drawImage(cv, 0, 0);"]) {
    const planted = html.replace(/function frame\(now\)\{/, (m) => `${m} ${plant}`);
    assert.notEqual(planted, html, "the plant found no frame function");
    assert.notDeepEqual(outside(runFilm(planted, { width: 1240 }).methods), [], plant);
  }
});

// --- lines lit unless the film runs --------------------------------------------------------------------------
for (const f of rooms) {
  const html = read(f);
  const list = html.match(/<ol class="([\w-]+)" data-room=/)[1];
  const item = html.slice(html.indexOf(`class="${list}"`)).match(/<li class="([\w-]+)/)[1];
  test(`${f}: no rule dims .${item} except under .${list}.dim`, () => {
    for (const css of styles(html)) for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g))
      if (m[1].includes(`.${item}`) && /opacity:\s*0?\.\d/.test(m[2])) assert.match(m[1], new RegExp(`\\.${list}\\.dim`), m[0].trim());
  });
  test(`${f}: the film dims its list when it runs, never with reduced motion, and any page error lights it again`, () => {
    const run = runFilm(html, { width: 1240 });
    const el = run.bySelector.get(`.${list}`);
    assert.ok(el && el.classList.contains("dim"), "the running film did not dim its list");
    run.listeners.filter((l) => l.type === "error").forEach((l) => l.fn());
    assert.ok(!el.classList.contains("dim"), "an error left the list dimmed");
    const calm = runFilm(html, { width: 1240, reduced: true }).bySelector.get(`.${list}`);
    assert.ok(!calm || !calm.classList.contains("dim"), "reduced motion dimmed the list");
  });
}

// --- the films' labels -------------------------------------------------------------------------------------
// The owner's lock on the films: the canvas writes nothing; a drawing's name stands beside it as page text, a few words,
// never a digit. Each label lights on the film's own clock, inside a layer screen readers skip (the room's list says it all).
// Which elements are labels is film-labels.mjs's one definition, the one the ledger reads too: any element a film lights.
const labels = filmLabelElements;
export const labelFault = ({ attrs, text }) => {
  if (/\d/.test(text)) return `a digit in "${text}"`;
  if (text.split(" ").length > 4) return `more than four words: "${text}"`;
  const din = attrs.match(/data-in="([\d.]+)"/), dout = attrs.match(/data-out="([\d.]+)"/);
  if (!din) return `no data-in on "${text}"`;
  if (dout && +dout[1] <= +din[1]) return `"${text}" leaves before it comes`;
  if (!/style="left:[\d.]+%;top:[\d.]+%"/.test(attrs)) return `"${text}" not placed in percent of its film`;
  return null;
};
const filmFault = (html, room) => {
  if (!new RegExp(`<div class="${room}-tags"[^>]*aria-hidden="true"`).test(html)) return `no ${room}-tags layer hidden from screen readers`;
  if (!/tags\[\w+\]\.classList\.toggle\('on', t >= TIN\[\w+\] && t < TOUT\[\w+\]\)/.test(filmScript(html))) return "the film never lights its labels";
  return null;
};
const labelled = rooms.filter((f) => labels(read(f)).length);
test("every room's film carries its labels", () => assert.deepEqual(labelled, rooms));
for (const f of labelled) {
  test(`${f}: every label a few words, never a digit, on the film's clock, lit by the film`, () => {
    const html = read(f), ls = labels(html);
    for (const l of ls) assert.equal(labelFault(l), null, f);
    assert.equal(filmFault(html, ls[0].room), null, f);
  });
}
test("a label with a digit, five words, an end before its start, or a film that never lights them is caught", () => {
  const ok = { attrs: 'data-in="4.6" style="left:21.5%;top:4.8%"', text: "Paid campaign" };
  assert.equal(labelFault(ok), null);
  assert.match(labelFault({ ...ok, text: "Open at 2am" }), /a digit/);
  assert.match(labelFault({ ...ok, text: "One two three four five" }), /more than four/);
  assert.match(labelFault({ ...ok, attrs: 'data-in="9" data-out="8" style="left:1%;top:1%"' }), /leaves before/);
  const html = read(labelled[0]), room = labels(html)[0].room;
  assert.match(filmFault(html.replace(/tags\[(\w+)\]\.classList\.toggle\('on', t >= TIN/, "tags[$1].classList.toggle('off', t >= TIN"), room), /never lights/);
});
test("a label beside another class, or written as another element, is still seen and judged (the main house's L4, L5)", () => {
  const html = read("grow.html"), n = labels(html).length, at = '<div class="gr-tag" data-in="3.0"';
  const l4 = html.replace(at, `<div class="gr-tag wide" data-in="5.0" style="left:50%;top:50%">Open 24/7</div>${at}`);
  const l5 = html.replace(at, `<span class="gr-tag" data-in="5.0" style="left:50%;top:50%">Guaranteed results</span>${at}`);
  assert.notEqual(l4, html, "the L4 plant found no label to sit beside");
  assert.equal(labels(l4).length, n + 1);
  assert.match(labels(l4).map(labelFault).filter(Boolean).join("; "), /a digit in "Open 24\/7"/);
  assert.equal(labels(l5).length, n + 1);
  assert.ok(labels(l5).some((l) => l.el === "span" && l.text === "Guaranteed results"), "the span label went unseen");
});

// --- the visitor count -------------------------------------------------------------------------------------
// Once per page, after its footer: a head or a footer is never touched, and a page that loads it twice counts
// every visit twice. layout.tsx never loads it: the corner's frame is built from it and would count each room again.
const COUNTER = '<script src="/count.js" defer></script>';
const HOME_COUNTER = '<script src="/count.js" defer />';
export const counterFault = (html, tag = COUNTER) => {
  const n = html.split(tag).length - 1;
  if (n !== 1) return `the counter is loaded ${n} times`;
  return html.indexOf(tag) < html.lastIndexOf("</footer>") ? "the counter sits before the footer ends" : null;
};
test("every page loads the visitor count once, after its footer; layout.tsx never does", () => {
  for (const f of pages) assert.equal(counterFault(read(f)), null, f);
  assert.equal(counterFault(readFileSync("src/app/page.tsx", "utf8"), HOME_COUNTER), null, "src/app/page.tsx");
  assert.ok(!readFileSync("src/app/layout.tsx", "utf8").includes("count.js"), "layout.tsx loads the counter");
});
test("a page with no counter, two, or one inside its footer is caught", () => {
  const html = read(pages[0]);
  assert.ok(counterFault(html.replace(COUNTER, "")));
  assert.ok(counterFault(html.replace(COUNTER, COUNTER + COUNTER)));
  assert.ok(counterFault(html.replace(COUNTER, "").replace("</footer>", `${COUNTER}</footer>`)));
});
// count.js run against a stand-in page: what it adds, and what each tap is called. The numbers he reads are only
// as true as the tap names, and the tracker's address is what the privacy page's reader is told.
const runCounter = (js) => {
  class Element { constructor(href) { this.href = href; } closest() { return this.href === null ? null : { getAttribute: () => this.href }; } }
  const added = [], counted = [], listeners = [];
  const document = {
    createElement: (name) => { const el = { name, src: "", attrs: {} }; el.setAttribute = (k, v) => { el.attrs[k] = v; }; return el; },
    body: { appendChild: (el) => added.push(el) },
    addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
  };
  vm.runInNewContext(js, { document, window: { umami: { track: (name) => counted.push(name) } }, Element });
  const tap = (href) => listeners.filter((l) => l.type === "click").forEach((l) => l.fn({ target: new Element(href) }));
  for (const href of ["https://wa.me/971505553148?text=Hi", "tel:+971505553148", "mailto:hello@vaydin.agency", "/privacy/", null]) tap(href);
  return { added, counted, listeners };
};
const TRACKER = { name: "script", src: "/umami.js", attrs: { "data-website-id": "ed751a4e-5b3d-4fb7-8bc9-b004b95fbeda",
  "data-domains": "vaydin.agency", "data-do-not-track": "true" } };
const counterRunFault = (js) => {
  const r = runCounter(js);
  if (r.added.length !== 1) return `${r.added.length} trackers added`;
  const { setAttribute, ...el } = r.added[0];
  try { assert.deepEqual(el, TRACKER); } catch { return `the tracker added is ${JSON.stringify(el)}`; }
  if (!r.listeners.some((l) => l.type === "click" && l.capture === true)) return "no click listener on the capture phase";
  try { assert.deepEqual(r.counted, ["whatsapp", "phone", "email"]); } catch { return `taps counted as ${JSON.stringify(r.counted)}`; }
  return null;
};
test("count.js, run: one tracker, our own /umami.js, only on vaydin.agency, honouring do-not-track; each tap named for what it opens, any other link not counted", () => {
  assert.equal(counterRunFault(read("count.js")), null);
});
test("a tracker from another host, a tap misnamed, or no tracker added is caught", () => {
  const js = read("count.js");
  for (const [plant, change] of [["another host", (s) => s.replace('"/umami.js"', '"https://example.com/t.js"')],
    ["wa.me named phone", (s) => s.replace('"whatsapp"]', '"phone"]')],
    ["no tracker added", (s) => s.replace("document.body.appendChild(tracker);", "")],
    ["a second domain", (s) => s.replace('"vaydin.agency"', '"vaydin.agency,example.com"')],
    ["do-not-track off", (s) => s.replace('"data-do-not-track", "true"', '"data-do-not-track", "false"')]]) {
    const planted = change(js);
    assert.notEqual(planted, js, `the plant "${plant}" changed nothing`);
    assert.ok(counterRunFault(planted), plant);
  }
});
// umami.js is Umami's tracker copied whole: every byte after its header comment must hash to what was read.
const UMAMI_SHA256 = "c11c9d29ac15ee26ef07059add176fd7db95acbf8e8bdb1a79796b0ffdb58f18";
const trackerBody = (bytes) => bytes.subarray(bytes.indexOf("*/\n") + 3);
test("umami.js after its header is the tracker that was read, byte for byte", () => {
  assert.equal(createHash("sha256").update(trackerBody(readFileSync("public/umami.js"))).digest("hex"), UMAMI_SHA256);
});
test("a tracker changed by one byte is caught", () => {
  const bytes = Buffer.from(readFileSync("public/umami.js"));
  bytes[bytes.length - 2] ^= 1;
  assert.notEqual(createHash("sha256").update(trackerBody(bytes)).digest("hex"), UMAMI_SHA256);
});

console.log(`${cases} page cases passed`);
