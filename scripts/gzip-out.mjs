/* After `next build`, write a gzip twin beside every text file in out/.
   GitHub Pages serves text gzipped (its reply carries Content-Encoding: gzip),
   and http-server only sends gzip when a .gz twin exists (`-g`). Without the
   twins the ship gate measures 0.5 MB the visitor never downloads. */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { gzipSync, constants } from "node:zlib";

const TEXT = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".xml", ".webmanifest"]);
let files = 0, before = 0, after = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (TEXT.has(extname(name))) {
      const raw = readFileSync(path);
      const gz = gzipSync(raw, { level: constants.Z_BEST_COMPRESSION });
      writeFileSync(path + ".gz", gz);
      files++; before += raw.length; after += gz.length;
    }
  }
}

walk("out");
console.log(`gzip twins: ${files} files, ${before} -> ${after} bytes`);
