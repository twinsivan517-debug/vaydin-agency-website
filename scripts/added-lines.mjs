// Refuses, in the lines a commit adds to code, three shapes that let a codebase grow without working: code
// commented out instead of removed, a second copy named as one (old, new, v2, backup, orig, tmp, final, legacy, copy),
// and a date inside a new comment (the story lives in the commit message). Only added lines are read, so an older
// file is cleaned when it is next touched for a real reason. The pre-commit hook runs it on the staged diff; `node
// scripts/added-lines.mjs <base>` runs it on base..HEAD. HONEST LIMIT: it matches shapes, never meaning. Not seen: a
// copy named with a bare digit (x2.js) or "prev" in a name inside code; a date with neither a year nor a month's
// name (11-12), or "may" in lower case; commented-out code that also reads as prose (two plain words in a row, as
// "return words" or a tag holding a sentence over two lines); a date or code in a string that is data rather than a
// docstring. A commit made with --no-verify skips it; the main house's range read is the second net.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CODE = /\.(mjs|cjs|js|jsx|ts|tsx|css|html|py)$/;
const MONTH = "(?:[Jj]an(?:uary)?|[Ff]eb(?:ruary)?|[Mm]ar(?:ch)?|[Aa]pr(?:il)?|May|[Jj]une?|[Jj]uly?|[Aa]ug(?:ust)?" +
  "|[Ss]ep(?:t(?:ember)?)?|[Oo]ct(?:ober)?|[Nn]ov(?:ember)?|[Dd]ec(?:ember)?|JAN|FEB|MAR|APR|MAY|JUNE?|JULY?|AUG|SEPT?|OCT|NOV|DEC)(?:\\.|\\b)";
const DAY = "\\d{1,2}(?:st|nd|rd|th)?\\b";
const DASH = "\\-\\u2010-\\u2015", SEP = `[${DASH}/.]`, NUM_END = "(?!\\d)";
const DATE = new RegExp([`\\b(?:19|20)\\d\\d${SEP}\\d{1,2}${SEP}\\d{1,2}${NUM_END}`, `\\b\\d{1,2}${SEP}\\d{1,2}${SEP}(?:19|20)\\d\\d${NUM_END}`,
  `\\b(?:19|20)\\d\\d(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])${NUM_END}`, `\\b${DAY}[\\s${DASH}/.]+(?:of\\s+)?${MONTH}`,
  `\\b${MONTH}[\\s${DASH}/]*${DAY}`, `\\b${MONTH}[,\\s${DASH}/.]*(?:19|20)\\d\\d${NUM_END}`].join("|"));
const CODE_SHAPES = [/^\s*(const|let|var)\s+[\w$]+\s*=/, /^\s*(async\s+)?function\s*[\w$]*\s*\(/, /^\s*return.*;\s*$/,
  /^\s*(import|export)\s.*(from|=|\{)/, /^\s*export\s+default\b/, /^\s*await\s+[\w$.]+\(/, /^\s*class\s+\w+\s*(\{|extends)/,
  /^\s*(if|for|while)\s*\(.*\)\s*(\{|\S.*;)?\s*$/, /^\s*[\w.$[\]]+\(.*\)\s*;\s*$/, /^\s*[\w.$[\]]+\s*=\s*[^=].*;\s*$/,
  /^\s*([\w$.[\]]+(\+\+|--)|(\+\+|--)[\w$.[\]]+)\s*;?\s*$/];
const PY_SHAPES = [/^\s*def\s+\w+\s*\(/, /^\s*class\s+\w+\s*(\(.*\))?\s*:\s*$/, /^\s*with\s+.+\s+as\s+\w+\s*:\s*$/,
  /^\s*for\s+[\w, ]+\s+in\s+([\w.[\]]+|[\w.]+\(.*\))\s*:\s*([\w.]+\(.*\)|[\w.[\]]+\s*=.*)?\s*$/,
  /^\s*(from\s+[\w.]+\s+)?import\s+[\w.*]+(\s+as\s+\w+)?(\s*,\s*[\w.]+(\s+as\s+\w+)?)*\s*$/];
/* A CSS rule, or one declaration ending in a semicolon, in a stylesheet or a page. */
const CSS_SHAPES = [/^\s*[^\s{}][^{}]*\{\s*([-\w]+\s*:[^;{}]*;?\s*)*\}?\s*$/, /^\s*-?[a-z][a-z-]*\s*:\s*[^;]+;\s*$/];
/* A call, an assignment, a return, a tag or a declaration without its semicolon is code only when it does not also
   read as prose; a tag that the comment ends on is code either way. */
const CALL = /^\s*[\w$]+(\.[\w$]+)*\(.*\)\s*;?\s*$/;
const ASSIGN = /^\s*[\w$]+(\.[\w$]+|\[[^\]]*\])*\s*([-+*%&|^/]|\*\*|\?\?|&&|\|\||<<|>>>?)?=(?![=>])\s*\S/;
const RETURN = /^\s*return\b\s*(.*?);?\s*$/;
const TAG = /^\s*<\/?[A-Za-z][\w.:-]*(\s[^>]*)?\/?>/;
const DECLARATION = /^\s*-?[a-z][a-z-]*\s*:\s*[^;]+$/;
const EXPRESSION = /[()[\]{}.+\-*/<>=!?:&|"'`\d_]|[a-z][A-Z]|^\w$|^(true|false|null|undefined|this|None|True|False|self)$/;
const prose = (s) => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(s.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '""'));
export const looksCode = (comment, file) => {
  const py = file.endsWith(".py"), text = comment.replace(py ? /\s#.*$/ : /\s\/\/.*$/, "");
  if (CODE_SHAPES.some((r) => r.test(text)) || (py && PY_SHAPES.some((r) => r.test(text)))) return true;
  if (/\.(css|html)$/.test(file) && CSS_SHAPES.some((r) => r.test(text))) return true;
  if (TAG.test(text)) return />\s*$/.test(text) || !prose(text.replace(/<[^>]*>/g, " "));
  if (/\.(css|html)$/.test(file) && DECLARATION.test(text)) return !prose(text);
  const ret = RETURN.exec(text);
  if (ret) { const e = ret[1].trim(); return EXPRESSION.test(e) && !prose(e); }
  return (CALL.test(text) || ASSIGN.test(text)) && !prose(text);
};

const SECOND = [/[._-](old|new|backup|bak|copy|orig|tmp|legacy|final|fixed|wip)\d*$/i, /(^|[_-])(legacy|Legacy|LEGACY)([_-]|[A-Z]|$)/,
  /^(copy|backup|Copy|Backup)([\s_-]|[A-Z]|$)/, /[a-z0-9](Old|New|Backup|Bak|Copy|Orig|Tmp|Legacy|Final|Fixed|Wip)\d*$/, /[._-]v\d+$/i,
  /[a-z]V\d+$/, /\s-\s(Copy|copy)( \(\d+\))?$/, /\s\(\d+\)$/, /\s(copy|Copy)(\s\d+)?$/];
const FLAG = /^(is|has|was|can|should|show|use)[A-Z_-]/;
export const namedAsSecond = (name) => !FLAG.test(name) && SECOND.some((r) => r.test(name));
/* A class or id is held to fewer words: on a page "copy" is its text, "v4" a version shown, "new" a state. A file
   name is held to one more: "prev" (page.prev.tsx), which as a name in code means the previous item. */
const tokenAsSecond = (t) => /[._-](old|backup|bak|orig|legacy)\d*$/i.test(t);
const fileAsSecond = (path) => {
  const name = path.split("/").pop(), base = name.replace(/\.[^.]+$/, "");
  return /(\.(bak|old|orig|tmp|swp)|~)$/i.test(name) || (CODE.test(name) && (namedAsSecond(base) || /[._-]prev\d*$/i.test(base)));
};
const DECLARED = /\b(?:function|const|let|var|class|def)\s+([A-Za-z_$][\w$]*)/g;
const ATTR = /\b(?:class|className|id)\s*=\s*["'`{]+([^"'`}]*)/g;
const SELECTOR = /(?:^|[\s,>+~(])[.#]([A-Za-z_][\w-]*)/g;

/* A line with its quoted strings emptied, same length, so an opener inside a string is not taken for a comment. */
const blank = (s) => s.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, (m) => m[0] + " ".repeat(m.length - 2) + m[m.length - 1]);

/* The text of the comments on one added line, given the closer of a comment left open before it (or false).
   Openers are taken in the order they stand, so an opener written inside another comment opens nothing. */
export const comments = (line, file, open) => {
  const out = [];
  let rest = line;
  if (open) {
    const end = rest.indexOf(open);
    if (end < 0) return { out: [rest.replace(/^\s*\*?/, "")], open };
    out.push(rest.slice(0, end).replace(/^\s*\*?/, "")); rest = rest.slice(end + open.length);
  }
  if (file.endsWith(".py")) {
    /* A string that opens a statement is a docstring: Python's other comment, where a story or parked code can hide. */
    const doc = /^\s*[rRuU]?("""|''')/.exec(rest);
    if (doc) {
      const end = rest.indexOf(doc[1], doc[0].length);
      if (end < 0) return { out: [rest.slice(doc[0].length)], open: doc[1] };
      out.push(rest.slice(doc[0].length, end)); rest = rest.slice(end + 3);
    }
    const h = blank(rest).indexOf("#");
    if (h >= 0) out.push(rest.slice(h + 1));
    return { out, open: false };
  }
  for (;;) {
    const b = blank(rest);
    const s = file.endsWith(".css") ? -1 : b.search(/(^|[^:\\])\/\/(?!\/)/);
    const slash = s < 0 ? -1 : b.indexOf("//", s);
    const [opener, closer, at] = [["<!--", "-->", file.endsWith(".html") ? b.indexOf("<!--") : -1], ["/*", "*/", b.indexOf("/*")]]
      .filter((o) => o[2] >= 0).sort((x, y) => x[2] - y[2])[0] ?? [null, null, -1];
    if (slash >= 0 && (at < 0 || slash < at)) { out.push(rest.slice(slash + 2)); return { out, open: false }; }
    if (at < 0) return { out, open: false };
    const end = rest.indexOf(closer, at + opener.length);
    if (end < 0) { out.push(rest.slice(at + opener.length)); return { out, open: closer }; }
    out.push(rest.slice(at + opener.length, end)); rest = rest.slice(0, at) + rest.slice(end + closer.length);
  }
};

/* Every refusal in a unified diff with no context lines (git diff -U0). */
export const scan = (diff) => {
  const fails = [];
  let file = null, isNew = false, open = false;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("--- ")) { isNew = raw === "--- /dev/null"; continue; }
    if (raw.startsWith("rename to ") || raw.startsWith("copy to ")) {
      const to = raw.slice(raw.indexOf(" to ") + 4);
      if (fileAsSecond(to)) fails.push(`${to}: a file renamed or copied to a second copy's name`);
      continue;
    }
    if (raw.startsWith("+++ ")) {
      file = raw.startsWith("+++ b/") ? raw.slice(6) : null; open = false;
      if (file && isNew && fileAsSecond(file)) fails.push(`${file}: a new file named as a second copy`);
      continue;
    }
    if (raw.startsWith("@@")) { open = false; continue; }
    if (!file || !CODE.test(file) || !raw.startsWith("+")) continue;
    const line = raw.slice(1);
    const c = comments(line, file, open); open = c.open;
    for (const text of c.out) {
      if (DATE.test(text)) fails.push(`${file}: a date in a new comment: "${text.trim().slice(0, 80)}"`);
      if (looksCode(text, file)) fails.push(`${file}: code commented out instead of removed: "${text.trim().slice(0, 80)}"`);
    }
    for (const m of line.matchAll(DECLARED)) if (namedAsSecond(m[1])) fails.push(`${file}: "${m[1]}" is named as a second copy`);
    const tokens = [];
    if (/\.(html|tsx|jsx)$/.test(file)) for (const m of line.matchAll(ATTR)) tokens.push(...m[1].split(/\s+/));
    if (/\.(css|html)$/.test(file)) for (const m of line.matchAll(SELECTOR)) tokens.push(m[1]);
    for (const t of tokens) if (t && tokenAsSecond(t)) fails.push(`${file}: the class or id "${t}" is named as a second copy`);
  }
  return fails;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const staged = process.argv[2] === undefined || process.argv[2] === "--staged";
  const args = staged ? ["diff", "--cached", "-U0", "--no-color"] : ["diff", "-U0", "--no-color", `${process.argv[2]}..HEAD`];
  const fails = scan(execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  if (fails.length) {
    console.error(`[added-lines] REFUSED (${fails.length}): replace what is broken, delete what is unused, keep one copy, and put the story in the commit message:\n  ${fails.join("\n  ")}`);
    process.exit(1);
  }
  console.log("[added-lines] clean");
}
