/* Him, small, in the bottom-left corner of this page: a frame added once the
   page has loaded, so the page is never slower for him. The frame is his size
   until he is opened, then as tall as his panel needs; the frame says which.
   A bar or panel the page fixes along its bottom, on his side and showing,
   lifts him above it. His side of it is src/components/Corner.tsx. */
(function () {
  var page = location.pathname.replace(/^.*\//, "").replace(/\.html$/, "");
  var CLOSED = [112, 222];
  var WIDE = "min(380px, calc(100vw - 8px))";
  var GAP = 6;
  var frame;
  var want = null;
  var talking = false;
  var docked = [];

  /* The page's own fixed elements, found once and again on a resize. */
  function scan() {
    docked = Array.prototype.filter.call(document.querySelectorAll("body *"), function (el) {
      return el !== frame && getComputedStyle(el).position === "fixed";
    });
  }

  /* How far above the bottom he must stand to clear what shows there: an
     element reaching the bottom of the screen, on his side, that does not
     start at the top (the bar across the top, a background behind it all). */
  function clearance() {
    var most = 0;
    var right = 4 + (want === null ? CLOSED[0] : Math.min(380, innerWidth - 8));
    docked.forEach(function (el) {
      var style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.05) return;
      var box = el.getBoundingClientRect();
      if (box.height === 0 || box.top <= 80 || box.bottom < innerHeight - 60 || box.left > right || box.right < 0) return;
      most = Math.max(most, Math.ceil(innerHeight - box.top) + GAP);
    });
    return most;
  }

  function place() {
    var lift = clearance();
    /* No room for him above what the page shows: quiet and closed, he steps
       aside until it goes; speaking or open, he stays where he was, over
       it, so his Stop stays in reach. */
    var fits = innerHeight - 76 - lift >= CLOSED[1];
    if (!fits) lift = 0;
    frame.style.visibility = fits || talking || want !== null ? "visible" : "hidden";
    frame.style.bottom = Math.max(4, lift) + "px";
    if (want === null) {
      frame.style.width = CLOSED[0] + "px";
      frame.style.height = CLOSED[1] + "px";
    } else {
      frame.style.width = WIDE;
      frame.style.height = Math.max(CLOSED[1], Math.min(want, innerHeight - 76 - lift)) + "px";
    }
  }

  var queued = false;
  function soonPlace() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      place();
    });
  }

  /* While he walks the room, the page's film follows him. The film's stage lists, in data-walk, the second of the
     film each of his lines starts at; the film is told to play to that second and hold until his next line starts
     later (a scene that carries two lines holds through both), and to play out when he ends. His start brings the
     film's top under the bar across the top (76 px, as above). */
  function walked(walk, line) {
    var stage = document.querySelector("[data-walk]");
    if (!stage || (!walk && typeof line !== "number")) return;
    var starts = stage.getAttribute("data-walk").split(",").map(Number);
    var film = { restart: walk === "start", guided: walk !== "end", hold: walk === "start" ? 0 : Infinity };
    if (typeof line === "number" && line < starts.length) {
      film.at = starts[line];
      var next = starts.slice(line + 1).filter(function (s) { return s > film.at; })[0];
      film.hold = next === undefined ? Infinity : next - 0.05;
    }
    if (film.restart) scrollTo({ top: stage.getBoundingClientRect().top + scrollY - 76, behavior: "smooth" });
    dispatchEvent(new CustomEvent("vaydin:film", { detail: film }));
  }

  function add() {
    frame = document.createElement("iframe");
    frame.src = "/corner.html?p=" + encodeURIComponent(page);
    frame.title = "Ask Vaydin";
    frame.setAttribute("allow", "autoplay");
    frame.style.cssText = "position:fixed;left:4px;bottom:4px;border:0;background:transparent;z-index:45;color-scheme:normal";
    document.body.appendChild(frame);
    scan();
    place();
    addEventListener("message", function (event) {
      if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data) return;
      if (typeof event.data.vaydinTalking === "boolean") talking = event.data.vaydinTalking;
      walked(event.data.vaydinGuide, event.data.vaydinLine);
      var said = event.data.vaydinCorner;
      if (said) want = said === "closed" ? null : Math.round(event.data.height || 640);
      place();
    });
    addEventListener("scroll", soonPlace, { passive: true });
    addEventListener("resize", function () {
      scan();
      soonPlace();
    });
    /* A page's panel shows after a tap, through a transition. */
    document.addEventListener("click", function () {
      setTimeout(soonPlace, 350);
    });
    document.addEventListener("transitionend", soonPlace, true);
  }

  function soon() {
    setTimeout(add, 800);
  }
  if (document.readyState === "complete") soon();
  else addEventListener("load", soon);
})();
