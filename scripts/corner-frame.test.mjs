// public/guide/corner.js itself, run against stand-ins of a phone's page and handed his messages as
// src/components/Corner.tsx posts them: opening him, his panel growing and his closing change only the frame's clip,
// never its box, so nothing on the page moves when he comes up by himself (a box that moves with no tap before it is a
// layout shift, and the speed gate's measure of it). The clip shows him, closed, or as much of his panel as it needs.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SOURCE = readFileSync(new URL("../public/guide/corner.js", import.meta.url), "utf8");
const H = 844, W = 390, TOP = 76;
const closedClip = (tall) => `inset(${tall - 222}px calc(100% - 112px) 0 0)`;
const openClip = (tall, shown) => `inset(${tall - shown}px 0 0 0)`;

function corner({ bar = null } = {}) {
  const frame = { style: {}, setAttribute() {}, contentWindow: {} };
  const heard = {};
  const page = {
    location: { pathname: "/diagnose.html", origin: "https://vaydin.agency" },
    document: { readyState: "complete", body: { appendChild() {} }, createElement: () => frame,
      querySelectorAll: () => (bar ? [bar] : []), querySelector: () => null, addEventListener() {} },
    getComputedStyle: (el) => el.computed ?? {},
    addEventListener: (type, fn) => (heard[type] = fn),
    innerHeight: H, innerWidth: W, scrollY: 0, scrollTo() {},
    requestAnimationFrame: (fn) => fn(), setTimeout: (fn) => fn(),
    CustomEvent: class {}, dispatchEvent() {},
  };
  vm.runInNewContext(SOURCE, page, { timeout: 10_000 });
  const box = () => ({ width: frame.style.width, height: frame.style.height, bottom: frame.style.bottom });
  const say = (data) => heard.message({ origin: page.location.origin, source: frame.contentWindow, data });
  return { frame, box, say };
}

let n = 0;
const same = (name, got, want) => {
  assert.deepStrictEqual(got, want, name);
  n++;
};

/* He opens by himself, his panel grows as his words come, he speaks, he closes: one box throughout, the clip alone moves. */
{
  const { frame, box, say } = corner();
  const tall = H - TOP - 4, first = box(), clips = [frame.style.clipPath];
  for (const data of [{ vaydinCorner: "open", height: 300 }, { vaydinCorner: "open", height: 460 }, { vaydinTalking: true }, { vaydinCorner: "closed" }]) {
    say(data);
    same(`the box after ${JSON.stringify(data)}`, box(), first);
    clips.push(frame.style.clipPath);
  }
  same("the box starts under the bar across the top and reaches his corner", [H - parseFloat(first.bottom) - parseFloat(first.height), first.bottom], [TOP, "4px"]);
  same("the clip: him alone, his panel, his panel grown, the same while he speaks, him alone again",
    clips, [closedClip(tall), openClip(tall, 300), openClip(tall, 460), openClip(tall, 460), closedClip(tall)]);
}

/* A panel shorter than him still shows him whole; one taller than the screen shows from under the bar across the top. */
{
  const { frame, say } = corner();
  const tall = H - TOP - 4;
  say({ vaydinCorner: "open", height: 100 });
  same("a short panel", frame.style.clipPath, openClip(tall, 222));
  say({ vaydinCorner: "open", height: 2000 });
  same("a panel taller than the screen", frame.style.clipPath, openClip(tall, tall));
}

/* A bar the page fixes along its bottom lifts him above it: the box still starts under the top bar, and still does
   not move when he opens. */
{
  const bar = { computed: { position: "fixed", display: "block", visibility: "visible", opacity: "1" },
    getBoundingClientRect: () => ({ top: H - 80, bottom: H, left: 0, right: W, height: 80 }) };
  const { frame, box, say } = corner({ bar });
  const first = box(), tall = H - TOP - 86;
  same("lifted above the bar", [first.bottom, H - parseFloat(first.bottom) - parseFloat(first.height)], ["86px", TOP]);
  same("lifted, closed", frame.style.clipPath, closedClip(tall));
  say({ vaydinCorner: "open", height: 300 });
  same("lifted, the box after he opens", box(), first);
  same("lifted, open", frame.style.clipPath, openClip(tall, 300));
}

console.log(`${n} corner frame cases passed`);
