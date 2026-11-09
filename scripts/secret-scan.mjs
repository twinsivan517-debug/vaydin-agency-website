// Does this repository carry a key or a secret file? A port of web-studio's spine/rituals/site_secrets.py,
// run by the pre-push hook (before anything reaches the public repo) and by the runner gate.
// HONEST LIMIT: a named list of shapes; a key from a service not listed here passes. Tracked files only.
// GitHub's push protection (on for this repo) blocks provider-format keys too; this list adds our own shapes.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const SECRET_FILES = /(^|\/)(\.env(\.[^/]+)?|[^/]*\.(pem|key|p12|pfx)|credentials\.json|service[-_]account[^/]*\.json)$/;
const EXAMPLE = /\.(example|sample|template)$/;
const KEY_SHAPES = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
  [/\b[sr]k[-_](live|test|proj|ant)?[-_]?[A-Za-z0-9_-]{20,}/, "an API secret key"],
  [/\bAKIA[0-9A-Z]{16}\b/, "a cloud access key"],
  [/\bAIza[0-9A-Za-z_-]{30,}/, "a Google API key"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}/, "a GitHub token"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, "a Slack token"],
  [/https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]{20,}/, "a Slack webhook address"],
  [/\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/, "a signed token"],
  [/_authToken\s*=\s*\S{8,}/, "a package registry token"],
];

export function scan() {
  const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const found = [];
  for (const rel of files) {
    if (EXAMPLE.test(rel)) continue;
    if (SECRET_FILES.test(rel)) { found.push(`${rel}  is a secret file tracked by git`); continue; }
    let text;
    try { text = readFileSync(rel, "utf8"); } catch { found.push(`${rel}  could not be read, so it was not checked`); continue; }
    for (const [shape, what] of KEY_SHAPES) if (shape.test(text)) { found.push(`${rel}  carries ${what}`); break; }
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("secret-scan.mjs")) {
  const found = scan();
  if (found.length) {
    console.error("[secret-scan] REFUSED:\n  " + found.join("\n  "));
    process.exit(1);
  }
  console.log("[secret-scan] clean");
}
