// Run with `npm test`. Holds every public page to four things a render can hide (2026-11-11, from the main
// house's reads): style comments that open also close (a trimmer once cut one in half and the page still looked
// right); the brand mark keeps its own shape; a room's film draws shapes only -- nothing written, no picture, no
// pixel read; a room's lines are lit unless its film runs. Each guard is also shown biting on a planted fault.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { roomPages, runFilm } from "./film-canvas.mjs";

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

console.log(`${cases} page cases passed`);
