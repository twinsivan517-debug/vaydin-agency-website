// A film label, as every reader of the site takes it: any element whose class list holds "<room>-tag", the class a
// room's film lights with querySelectorAll. The ledger reads each one's words from this list and pages.test.mjs its
// rules, so no markup a film can light (another element, another class beside it) escapes either of them.
const LABEL_CLASS = /^[a-z]+-tag$/;

export const filmLabelElements = (html) => {
  const out = [];
  for (const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const cls = (m[2].match(/\bclass="([^"]*)"/) || [])[1];
    const tag = cls && cls.split(/\s+/).find((c) => LABEL_CLASS.test(c));
    if (!tag) continue;
    const start = m.index + m[0].length, end = html.indexOf(`</${m[1]}>`, start);
    const inner = end < 0 ? html.slice(start) : html.slice(start, end);
    out.push({ el: m[1].toLowerCase(), room: tag.slice(0, -4), attrs: m[2], inner,
      text: inner.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  }
  return out;
};
