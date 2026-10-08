// Refuses a push to the main branch unless the ship stamp covers what is pushed.
// Run by .githooks/pre-push; git hands it one line per ref on stdin:
//   <local ref> <local sha> <remote ref> <remote sha>
// The stamp is .ship/stamp.json, written by the ship gate when a site passes.
// It names the commit that was measured. A later commit may change only .ship/.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// LIMIT: the stamp is a file. One written by hand with a real commit id passes;
// this stops code that drifted after a check, not a person set on skipping it.
const PROTECTED = ["refs/heads/main", "refs/heads/master", "refs/heads/production"];
const FULL_ID = /^[0-9a-f]{40}$/;

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function refuse(why) {
  console.error(`[ship-gate] REFUSED: ${why}`);
  console.error("  Run the ship gate on this site, commit .ship/stamp.json, then push.");
  process.exit(1);
}

const pushed = readFileSync(0, "utf8")
  .split("\n")
  .map((line) => line.trim().split(/\s+/))
  .filter((parts) => parts.length === 4 && PROTECTED.includes(parts[2]) && !/^0+$/.test(parts[1]));

for (const [, sha] of pushed) {
  let stamp;
  try {
    stamp = JSON.parse(git("show", `${sha}:.ship/stamp.json`));
  } catch {
    refuse("this commit carries no ship stamp");
  }
  if (typeof stamp.commit !== "string" || !FULL_ID.test(stamp.commit)) {
    refuse("the stamp does not name a full commit id (a branch name or HEAD is not one)");
  }
  try {
    git("rev-parse", "--verify", "--quiet", `${stamp.commit}^{commit}`);
    git("merge-base", "--is-ancestor", stamp.commit, sha);
  } catch {
    refuse(`the stamp names ${String(stamp.commit).slice(0, 10)}, which is not part of this push`);
  }
  const changed = git("diff", "--name-only", stamp.commit, sha, "--", ".", ":(exclude).ship");
  if (changed) {
    refuse(`source changed after the stamped commit:\n  ${changed.split("\n").join("\n  ")}`);
  }
}
