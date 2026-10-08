// Points git at .githooks/ so the push check is armed. Run by `npm install`.
// Outside a git repository (a hosting build, a zip) there is nothing to arm.
import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  console.log("[arm-hooks] not a git repository here: the push check is not armed.");
}
