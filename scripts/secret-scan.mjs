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
// PRIVATE WORDS (--pre-push only; lesson 22, 2026-11-11): the houses' private names, addresses and places never reach
// this public repo. The list lives OUTSIDE it: web-studio's brain/leak_patterns.txt (one literal per line, # starts
// a comment, never committed), or the file VAYDIN_PRIVATE_WORDS names. Each word is matched whole, in any case, in
// every text file a pushed commit adds or changes, in each such file's path, in each pushed commit's whole message,
// its author and committer (names and e-mails) and in the names of the refs being pushed; a finding names the list's
// line, never the word. Fail closed: no list, or a list with no words, refuses the push. This repo's author name is
// "Vaydin" from 2026-11-11 (the owner's word); commits already public are left as they are.
// HONEST LIMIT: exact words only (a paraphrase, a quote or a verdict passes); a file is skipped as binary by its
// extension or when it holds a NUL byte, so a text file with one NUL is not read; laptop only, the runner has no
// list; `git push --no-verify` skips the hook.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
const BINARY = /\.(mp3|mp4|webm|wav|ogg|webp|png|jpe?g|gif|ico|avif|woff2?|ttf|otf|glb|gz|br|zip|pdf)$/i;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const privateListPath = () => process.env.VAYDIN_PRIVATE_WORDS
  || resolve(git(["rev-parse", "--show-toplevel"]).trim(), "../../web-studio/brain/leak_patterns.txt");

// { words: [{ re, line }] } or { error }. Findings name the list's line, never the word.
export function privateWords(path) {
  if (!existsSync(path)) return { error: `the private-word list is not on this machine (${path}); set VAYDIN_PRIVATE_WORDS to its path` };
  const words = readFileSync(path, "utf8").split(/\r?\n/).map((s, i) => [s.trim(), i + 1])
    .filter(([s]) => s && !s.startsWith("#"))
    .map(([s, line]) => ({ re: new RegExp(`(?<![\\p{L}\\p{N}_])${escape(s)}(?![\\p{L}\\p{N}_])`, "iu"), line }));
  return words.length ? { words } : { error: `the private-word list has no words (${path})` };
}

function privateHits(text, words, what, found) {
  for (const { re, line } of words) if (re.test(text)) found.push(`${what} carries a private word (line ${line} of the list)`);
}

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
// words: privateWords(...).words to check them too; omitted, only keys and secret files are checked.
export function scanPushed(stdin, words = []) {
  const found = [];
  for (const line of stdin.split("\n").map((s) => s.trim()).filter(Boolean)) {
    const [localRef, local, remoteRef, remote] = line.split(/\s+/);
    if (!local || ZERO.test(local)) continue;                  // deleting a branch pushes no bytes
    if (words.length) privateHits(`${localRef} ${remoteRef}`, words, "a pushed ref's name", found);
    let commits;
    try { commits = git(["rev-list", ...(remote && !ZERO.test(remote) ? [`${remote}..${local}`] : [local, "--not", "--remotes"])]); }
    catch { commits = git(["rev-list", local, "--not", "--remotes"]); }   // the remote's tip is unknown here
    for (const sha of commits.split("\n").filter(Boolean)) {
      const short = sha.slice(0, 7);
      if (words.length) {
        privateHits(git(["log", "-1", "--format=%B", sha]), words, `${short} its message`, found);
        privateHits(git(["log", "-1", "--format=%an%n%ae%n%cn%n%ce", sha]), words, `${short} its author or committer`, found);
      }
      const names = git(["diff-tree", "--root", "-m", "--no-commit-id", "-r", "-z", "--name-only", "--diff-filter=AMRC", sha]);
      for (const rel of new Set(names.split("\0").filter(Boolean))) {
        const read = (p) => git(["cat-file", "blob", `${sha}:${p}`]);
        judge(rel, read, found, `${short} `);
        if (!words.length) continue;
        const pathHit = words.some(({ re }) => re.test(rel));
        if (pathHit) privateHits(rel, words, `${short} a file path`, found);
        if (BINARY.test(rel)) continue;
        let text;
        try { text = read(rel); } catch { continue; }
        if (!text.includes("\u0000")) privateHits(text, words, `${short} ${pathHit ? "a file whose path carries a private word," : rel} `, found);
      }
    }
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("secret-scan.mjs")) {
  const prePush = process.argv.includes("--pre-push");
  const list = prePush ? privateWords(privateListPath()) : { words: [] };
  const found = list.error ? [list.error] : prePush ? scanPushed(readFileSync(0, "utf8"), list.words) : scan();
  if (found.length) {
    console.error("[secret-scan] REFUSED:\n  " + found.join("\n  "));
    process.exit(1);
  }
  console.log(`[secret-scan] clean (${prePush ? `the pushed commits, ${list.words.length} private words checked` : "the checked-out tree"})`);
}
