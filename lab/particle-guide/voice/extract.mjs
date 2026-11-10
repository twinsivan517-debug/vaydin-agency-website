// Every spoken line of the site with its file name, read from the site's own sources. node extract.mjs SITE_DIR OUT_JSON
// The walk itself is lines.mjs, shared with scripts/voice-lines.test.mjs, so the test reads lines exactly as this does.
import { writeFileSync } from "node:fs";
import { collect } from "./lines.mjs";

const [site, out] = process.argv.slice(2);
const { lines, clashes, disk } = await collect(site);
for (const c of clashes) console.error(`two texts for ${c.id} (${c.first} and ${c.second})`);
console.log("lines found", Object.keys(lines).length, "files on disk", disk.length);
console.log("on disk, no text:", disk.filter((d) => !lines[d]).join(" ") || "none");
console.log("text, no file:", Object.keys(lines).filter((l) => !disk.includes(l)).join(" ") || "none");
/* One recording, two texts: whichever came last would be recorded, so nothing is written (2026-11-10). */
if (clashes.length) {
  console.error(`refused: ${clashes.map((c) => c.id).join(" ")} ha${clashes.length > 1 ? "ve" : "s"} two texts; nothing written`);
  process.exit(1);
}
writeFileSync(out, JSON.stringify(lines, null, 1));
