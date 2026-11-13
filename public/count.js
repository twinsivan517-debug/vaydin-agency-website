/* The visitor count (Umami Cloud): each visit, and each tap on WhatsApp, phone or email, with the page it came
   from. The tracker is umami.js beside this file, Umami's own script pinned by its hash, so what it does is what was
   read: no cookie, nothing written to the visitor's browser, one opt-out flag read, and nothing sent when the browser
   asks not to be tracked. It sends only to gateway.umami.is, and only from vaydin.agency, so a preview, a phone on
   the laptop's network and the speed gate's runner load it and count nothing. Each page loads this file once, at the
   end of its body, never in a head or a footer; layout.tsx never loads it, or the corner's frame would count every
   room twice. */
(function () {
  var tracker = document.createElement("script");
  tracker.src = "/umami.js";
  tracker.setAttribute("data-website-id", "ed751a4e-5b3d-4fb7-8bc9-b004b95fbeda");
  tracker.setAttribute("data-domains", "vaydin.agency");
  tracker.setAttribute("data-do-not-track", "true");
  document.body.appendChild(tracker);

  var KINDS = [[/^https:\/\/wa\.me\//, "whatsapp"], [/^tel:/, "phone"], [/^mailto:/, "email"]];
  document.addEventListener("click", function (e) {
    var link = e.target instanceof Element ? e.target.closest("a[href]") : null;
    if (!link || !window.umami) return;
    var href = link.getAttribute("href");
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i][0].test(href)) return window.umami.track(KINDS[i][1]);
  }, true);
})();
