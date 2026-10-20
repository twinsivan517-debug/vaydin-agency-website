/* Her, small, in the bottom-left corner of this page: a frame added once the page has
   loaded, so the page is never slower for her. The frame is her size until
   she is opened, then the panel's; the frame says which. Her side of it is
   src/components/Corner.tsx. */
(function () {
  var page = location.pathname.replace(/^.*\//, "").replace(/\.html$/, "");
  var CLOSED = ["112px", "222px"];
  var OPEN = ["min(380px, calc(100vw - 8px))", "min(640px, calc(100vh - 76px))"];
  function size(frame, wh) {
    frame.style.width = wh[0];
    frame.style.height = wh[1];
  }
  function add() {
    var frame = document.createElement("iframe");
    frame.src = "/corner.html?p=" + encodeURIComponent(page);
    frame.title = "Ask Vaydin";
    frame.setAttribute("allow", "autoplay");
    frame.style.cssText = "position:fixed;left:4px;bottom:4px;border:0;background:transparent;z-index:45;color-scheme:normal";
    size(frame, CLOSED);
    document.body.appendChild(frame);
    addEventListener("message", function (event) {
      if (event.origin !== location.origin || event.source !== frame.contentWindow || !event.data) return;
      if (event.data.vaydinCorner) size(frame, event.data.vaydinCorner === "open" ? OPEN : CLOSED);
    });
  }
  function soon() {
    setTimeout(add, 800);
  }
  if (document.readyState === "complete") soon();
  else addEventListener("load", soon);
})();
