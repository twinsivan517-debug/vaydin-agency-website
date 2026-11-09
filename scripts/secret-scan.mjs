// Does this repository carry a key or a secret file? A port of web-studio's spine/rituals/site_secrets.py.
// Two modes:
//   node scripts/secret-scan.mjs              the checked-out tree (the runner gate: a fresh, clean checkout)
//   node scripts/secret-scan.mjs --pre-push   what is being PUSHED (the pre-push hook): every file each pushed
//     commit adds or changes, read from that commit, never from the disk. ship_check refused a dirty tree, so
//     its disk read was the commit; a hook has no such guarantee (web-studio proved it 2026-11-09: a key
//     committed, then deleted only on disk, passed a disk scan). A key added in one pushed commit and removed
//     in a later one is refused too: the public repo would keep it in history.
// HONEST LIMIT: a named list of shapes; a key from a service not listed here passes. GitHub's push protection
// (on for this repo) blocks provider-format keys too; this list adds our own shapes.
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
const ZERO = /^0+$/;
const git = (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] });

// One file: its name, then its text. `where` prefixes the finding (a commit, or nothing for the tree).
function judge(rel, read, found, where = "") {
  if (EXAMPLE.test(rel)) return;
  if (SECRET_FILES.test(rel)) { found.push(`${where}${rel}  is a secret file tracked by git`); return; }
  let text;
  try { text = read(rel); } catch { found.push(`${where}${rel}  could not be read, so it was not checked`); return; }
  for (const [shape, what] of KEY_SHAPES) if (shape.test(text)) { found.push(`${where}${rel}  carries ${what}`); return; }
}

export function scan() {
  const found = [];
  for (const rel of git(["ls-files", "-z"]).split("\0").filter(Boolean)) judge(rel, (p) => readFileSync(p, "utf8"), found);
  return found;
}

// git gives the hook one line per ref: <local ref> <local sha> <remote ref> <remote sha>.
export function scanPushed(stdin) {
  const found = [];
  for (const line of stdin.split("\n").map((s) => s.trim()).filter(Boolean)) {
    const [, local, , remote] = line.split(/\s+/);
    if (!local || ZERO.test(local)) continue;                  // deleting a branch pushes no bytes
    let commits;
    try { commits = git(["rev-list", ...(remote && !ZERO.test(remote) ? [`${remote}..${local}`] : [local, "--not", "--remotes"])]); }
    catch { commits = git(["rev-list", local, "--not", "--remotes"]); }   // the remote's tip is unknown here
    for (const sha of commits.split("\n").filter(Boolean)) {
      const names = git(["diff-tree", "--root", "-m", "--no-commit-id", "-r", "-z", "--name-only", "--diff-filter=AMRC", sha]);
      for (const rel of new Set(names.split("\0").filter(Boolean))) judge(rel, (p) => git(["cat-file", "blob", `${sha}:${p}`]), found, `${sha.slice(0, 7)} `);
    }
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("secret-scan.mjs")) {
  const prePush = process.argv.includes("--pre-push");
  const found = prePush ? scanPushed(readFileSync(0, "utf8")) : scan();
  if (found.length) {
    console.error("[secret-scan] REFUSED:\n  " + found.join("\n  "));
    process.exit(1);
  }
  console.log(`[secret-scan] clean (${prePush ? "the pushed commits" : "the checked-out tree"})`);
}
