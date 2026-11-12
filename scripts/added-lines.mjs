// Refuses, in the lines a commit adds to code, three shapes that let a codebase grow without working: code
// commented out instead of removed, a second copy named as one (old, v2, backup, legacy, copy), and a date inside a
// new comment (the story lives in the commit message). Only added lines are read, so an older file is cleaned when
// it is next touched for a real reason. The pre-commit hook runs it on the staged diff; `node
// scripts/added-lines.mjs <base>` runs it on base..HEAD. HONEST LIMIT: it matches shapes, never meaning, and a
// commit made with --no-verify skips it; the main house's range read is the second net.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CODE = /\.(mjs|cjs|js|ts|tsx|css|html|py)$/;
const MONTH = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*";
const DATE = new RegExp(`\\b(19|20)\\d\\d-\\d\\d-\\d\\d\\b|\\b\\d{1,2} ${MONTH}\\b|\\b${MONTH} \\d{1,2}\\b|\\b${MONTH} 20\\d\\d\\b`);
const CODE_SHAPES = [/^\s*(const|let|var)\s+[\w$]+\s*=/, /^\s*function\s*[\w$]*\s*\(/, /^\s*return.*;\s*$/,
  /^\s*(import|export)\s.*(from|=|\{)/, /^\s*await\s+[\w$.]+\(/, /^\s*class\s+\w+\s*(\{|extends)/, /^\s*(if|for|while)\s*\(.*\)\s*\{?\s*$/,
  /^\s*[\w.$[\]]+\(.*\)\s*;\s*$/, /^\s*[\w.$[\]]+\s*=\s*[^=].*;\s*$/, /^\s*<\/?[a-z][a-z0-9-]*(\s[^>]*)?\/?>/];
const SECOND = [/[_-](old|backup|bak|copy|OLD|BACKUP|BAK|COPY)$/, /(^|[_-])(legacy|Legacy|LEGACY)([_-]|[A-Z]|$)/,
  /^(copy|backup|Copy|Backup)([_-]|[A-Z]|$)/, /[a-z0-9](Old|Backup|Copy|Legacy)$/, /[_-][vV]\d+$/, /[a-z]V\d+$/, /\s-\s(Copy|copy)( \(\d+\))?$/];
export const namedAsSecond = (name) => SECOND.some((r) => r.test(name));
const DECLARED = /\b(?:function|const|let|var|class|def)\s+([A-Za-z_$][\w$]*)/g;

/* The text of the comments on one added line, given whether a block comment was open before it. */
export const comments = (line, file, open) => {
  const out = [];
  let rest = line;
  if (open) {
    const end = rest.indexOf("*/");
    if (end < 0) return { out: [rest.replace(/^\s*\*?/, "")], open: true };
    out.push(rest.slice(0, end).replace(/^\s*\*?/, "")); rest = rest.slice(end + 2);
  }
  for (const m of rest.matchAll(/<!--([\s\S]*?)(-->|$)/g)) out.push(m[1]);
  rest = rest.replace(/<!--[\s\S]*?(-->|$)/g, "");
  let stillOpen = false;
  rest = rest.replace(/\/\*([\s\S]*?)(\*\/|$)/g, (m, body, end) => { out.push(body); if (!end) stillOpen = true; return ""; });
  const slash = rest.search(/(^|[^:"'`\\])\/\/(?!\/)/);
  if (slash >= 0) out.push(rest.slice(rest.indexOf("//", slash) + 2));
  if (file.endsWith(".py")) { const h = rest.search(/(^|\s)#/); if (h >= 0) out.push(rest.slice(rest.indexOf("#", h) + 1)); }
  return { out, open: stillOpen };
};

/* Every refusal in a unified diff with no context lines (git diff -U0). */
export const scan = (diff) => {
  const fails = [];
  let file = null, isNew = false, open = false;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("--- ")) { isNew = raw === "--- /dev/null"; continue; }
    if (raw.startsWith("+++ ")) {
      file = raw.startsWith("+++ b/") ? raw.slice(6) : null; open = false;
      const base = (file ?? "").split("/").pop().replace(/\.[^.]+$/, "");
      if (file && isNew && CODE.test(file) && namedAsSecond(base)) fails.push(`${file}: a new file named as a second copy`);
      continue;
    }
    if (raw.startsWith("@@")) { open = false; continue; }
    if (!file || !CODE.test(file) || !raw.startsWith("+")) continue;
    const line = raw.slice(1);
    const c = comments(line, file, open); open = c.open;
    for (const text of c.out) {
      if (DATE.test(text)) fails.push(`${file}: a date in a new comment: "${text.trim().slice(0, 80)}"`);
      if (CODE_SHAPES.some((r) => r.test(text))) fails.push(`${file}: code commented out instead of removed: "${text.trim().slice(0, 80)}"`);
    }
    for (const m of line.matchAll(DECLARED)) if (namedAsSecond(m[1])) fails.push(`${file}: "${m[1]}" is named as a second copy`);
  }
  return fails;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const staged = process.argv[2] === undefined || process.argv[2] === "--staged";
  const args = staged ? ["diff", "--cached", "-U0", "--no-color"] : ["diff", "-U0", "--no-color", `${process.argv[2]}..HEAD`];
  const fails = scan(execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  if (fails.length) {
    console.error(`[added-lines] REFUSED (${fails.length}): replace what is broken, delete what is unused, keep one copy, and put the story in the commit message:\n  ${fails.join("\n  ")}`);
    process.exit(1);
  }
  console.log("[added-lines] clean");
}
