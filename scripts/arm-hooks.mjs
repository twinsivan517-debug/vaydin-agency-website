// Points git at .githooks/ so the push check is armed, and names this clone's commits "Vaydin" (the owner's word,
// 2026-11-11: the push check refuses a personal name as author). Run by `npm install`; the runner's `npm ci
// --ignore-scripts` skips it. The e-mail is not set here: on a fresh clone set it to the GitHub no-reply address.
// Outside a git repository (a hosting build, a zip) there is nothing to arm.
import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Vaydin"], { stdio: "ignore" });
} catch {
  console.log("[arm-hooks] not a git repository here: the push check is not armed.");
}
