// Runs a room's film script in node against a recording canvas: no browser, about a second a page. Every call
// the film makes on its canvas is counted by name, whatever spelling reached it (ctx['fill' + 'Text'] included),
// so pages.test.mjs can refuse a film that writes, draws a picture or reads pixels. Built from the main house's
// probe (2026-11-11), made to run any room: the page elements are stand-ins sized from the width given.
import vm from "node:vm";

export const roomPages = (files, read) => files.filter((f) => f.endsWith(".html") && read(f).includes(' data-room="'));
export const filmScript = (html) => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((s) => s.includes("getContext("));

// How many elements a selector would find, read from the page's own markup: the last part's [attribute] or class.
// An attribute counts with or without a value (a room's lines carry a bare data-line), never inside a script's selector.
export const countFor = (html, sel) => {
  const last = sel.trim().split(/\s+/).pop();
  const attr = last.match(/\[([\w-]+)\]/);
  if (attr) return (html.match(new RegExp(`\\s${attr[1]}(?=[\\s=>/])`, "g")) || []).length;
  const cls = last.match(/\.([\w-]+)/);
  if (!cls) return 0;
  return [...html.matchAll(/class="([^"]*)"/g)].filter((m) => m[1].split(/\s+/).includes(cls[1])).length;
};

const classes = () => {
  const set = new Set();
  return { set, add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c),
    toggle: (c, f) => ((f ?? !set.has(c)) ? set.add(c) : set.delete(c), set.has(c)) };
};

// walk: the seconds his lines start at (the stage's data-walk). After the film plays alone, it is told what
// public/guide/corner.js tells it while he walks (restart, then each line's start and the hold before the next later
// start, then his end), and each step records whether the film still runs and how many of each selector's elements
// are lit.
export function runFilm(html, { width = 1240, reduced = false, seconds = 120, walk = null } = {}) {
  const script = filmScript(html);
  if (!script) throw new Error("no film script (no <script> with getContext) on a room page");
  const calls = new Map(), state = {}, phone = width < 900;
  const gradient = () => ({ addColorStop() {} });
  const ctx = new Proxy(state, {
    get(t, k) {
      if (typeof k !== "string") return undefined;
      if (k in t) return t[k];
      return (...a) => { calls.set(k, (calls.get(k) || 0) + 1);
        if (k.startsWith("create") && k.endsWith("Gradient")) return gradient(); };
    },
    set(t, k, v) { t[k] = v; return true; },
  });
  const rect = { left: 24, top: 24, width: phone ? width - 44 : 590, height: phone ? 290 : 440, right: 0, bottom: 0 };
  const stageRect = { left: 0, top: 0, width, height: phone ? 1150 : 620 };
  const element = (id) => ({ id, classList: classes(), style: {}, width: 0, height: 0, dataset: {},
    getAttribute: () => null, setAttribute() {}, addEventListener() {},
    getBoundingClientRect: () => (/stage/.test(id) ? stageRect : rect),
    getContext: () => ctx, querySelector: () => element("child") });
  const byId = new Map(), bySelector = new Map(), byAll = new Map(), listeners = [];
  let io = null, raf = null;
  const sandbox = {
    window: { matchMedia: () => ({ matches: reduced }), devicePixelRatio: 1,
      addEventListener: (type, fn) => listeners.push({ type, fn }), innerWidth: width },
    document: {
      getElementById: (id) => byId.get(id) || byId.set(id, element(id)).get(id),
      querySelector: (sel) => bySelector.get(sel) || bySelector.set(sel, element(sel)).get(sel),
      querySelectorAll: (sel) => byAll.get(sel) || byAll.set(sel, Array.from({ length: countFor(html, sel) }, (_, i) => element(`${sel}#${i}`))).get(sel),
    },
    IntersectionObserver: function (cb) { io = cb; this.observe = () => {}; this.disconnect = () => {}; },
    requestAnimationFrame: (cb) => { raf = cb; return 1; }, cancelAnimationFrame: () => { raf = null; },
    setTimeout: () => 0, clearTimeout: () => {}, Math, Date, console,
  };
  vm.runInNewContext(script, sandbox, { timeout: 10_000 });
  let frames = 0, now = 1000;
  const play = () => { for (let t = 0; raf && t <= seconds; t += 1 / 30) { const cb = raf; raf = null; cb(now); now += 1000 / 30; frames++; } };
  if (io) io([{ isIntersecting: true, intersectionRatio: 1 }]);
  play();
  const settled = raf === null, steps = [];
  if (walk) {
    const lit = () => Object.fromEntries([...byAll].map(([sel, els]) => [sel, els.filter((e) => e.classList.contains("on")).length]));
    const tell = (detail) => { for (const l of listeners) if (l.type === "vaydin:film") l.fn({ detail }); play(); };
    tell({ restart: true, guided: true, hold: 0 });
    walk.forEach((at, i) => {
      const next = walk.slice(i + 1).find((s) => s > at);
      const hold = next === undefined ? Infinity : next - 0.05;
      tell({ guided: true, at, hold });
      steps.push({ at, hold, running: raf !== null, lit: lit() });
    });
    tell({ guided: false, hold: Infinity });
    steps.push({ end: true, running: raf !== null, lit: lit() });
  }
  return { methods: Object.fromEntries(calls), frames, settled, listeners, bySelector, byAll, steps };
}
