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

// corner: the source of public/guide/corner.js. After the film plays alone, the corner's own code runs against
// stand-ins of the page and is handed his messages as src/components/Corner.tsx posts them (messages, by default his
// start, each line of the stage's data-walk, his end); every event it sends the film is played, and each message
// leaves a step: whether the film still runs and how many of each selector's elements are lit.
export function runFilm(html, { width = 1240, reduced = false, seconds = 120, corner = null, messages = null } = {}) {
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
  const timers = [];
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
    setTimeout: (fn) => timers.push(fn), clearTimeout: () => {}, Math, Date, console,
  };
  vm.runInNewContext(script, sandbox, { timeout: 10_000 });
  let frames = 0, now = 1000;
  const play = () => { for (let t = 0; raf && t <= seconds; t += 1 / 30) { const cb = raf; raf = null; cb(now); now += 1000 / 30; frames++; } };
  if (io) io([{ isIntersecting: true, intersectionRatio: 1 }]);
  play();
  const settled = raf === null, steps = [];
  if (corner) {
    const walk = html.match(/data-walk="([^"]*)"/)?.[1] ?? null;
    const origin = "https://vaydin.agency", his = {}, heard = [];
    const stage = { getAttribute: (k) => (k === "data-walk" ? walk : null), getBoundingClientRect: () => ({ top: 300 }) };
    const page = {
      location: { pathname: "/room.html", origin },
      document: { readyState: "complete", body: { appendChild() {} }, querySelectorAll: () => [], addEventListener() {},
        querySelector: (s) => (s === "[data-walk]" && walk !== null ? stage : null),
        createElement: () => ({ style: {}, setAttribute() {}, contentWindow: his }) },
      addEventListener: (type, fn) => heard.push({ type, fn }),
      getComputedStyle: () => ({}), innerHeight: 844, innerWidth: 390, scrollY: 0, scrollTo() {},
      requestAnimationFrame() {}, setTimeout: (fn) => fn(),
      CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
      dispatchEvent: (e) => { for (const l of listeners) if (l.type === e.type) l.fn(e); play(); return true; },
    };
    vm.runInNewContext(corner, page, { timeout: 10_000 });
    const lit = () => Object.fromEntries([...byAll].map(([sel, els]) => [sel, els.filter((e) => e.classList.contains("on")).length]));
    const lines = walk === null ? 0 : walk.split(",").length;
    const said = messages ?? [{ vaydinGuide: "start" }, ...Array.from({ length: lines }, (_, i) => ({ vaydinLine: i })), { vaydinGuide: "end" }];
    /* A { resize: true } message is the page resized instead of his word: the film's resize handlers and the timers
       they set run, and the step records whether the film drew. */
    for (const data of said) {
      const drawn = calls.get("fillRect") || 0;
      if (data.resize) {
        for (const l of listeners) if (l.type === "resize") l.fn();
        timers.splice(0).forEach((fn) => fn());
      } else for (const h of heard) if (h.type === "message") h.fn({ origin, source: his, data });
      steps.push({ ...data, running: raf !== null, lit: lit(), drew: (calls.get("fillRect") || 0) > drawn });
    }
  }
  return { methods: Object.fromEntries(calls), frames, settled, listeners, bySelector, byAll, steps };
}
