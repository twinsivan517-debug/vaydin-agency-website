// A film label, as every reader of the site takes it: any element whose class list holds "<room>-tag", the class a
// room's film lights with querySelectorAll. The ledger reads each one's words from this list and pages.test.mjs its
// rules, so a label in another element, beside another class, or with its class written in any of HTML's three
// spellings (double quotes, single quotes, none) escapes neither. HONEST LIMIT: it reads the page as written; a class
// that a script adds at run time is not seen.
const LABEL_CLASS = /^[a-z]+-tag$/;
const CLASS_ATTR = /(?:^|\s)class\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i;

export const filmLabelElements = (html) => {
  const out = [];
  for (const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const c = m[2].match(CLASS_ATTR), cls = c && (c[1] ?? c[2] ?? c[3]);
    const tag = cls && cls.split(/\s+/).find((c) => LABEL_CLASS.test(c));
    if (!tag) continue;
    const start = m.index + m[0].length, end = html.indexOf(`</${m[1]}>`, start);
    const inner = end < 0 ? html.slice(start) : html.slice(start, end);
    out.push({ el: m[1].toLowerCase(), room: tag.slice(0, -4), attrs: m[2], inner,
      text: inner.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  }
  return out;
};
