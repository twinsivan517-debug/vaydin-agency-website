// A copy of out/ that works from any folder, for a private preview link on a
// phone (a claude.ai artifact serves its files under a version folder, where a
// path starting with "/" finds nothing). Every quoted path to a top-level entry
// of out/ is made relative to the file's page depth; her clips, the gzip twins
// and the domain file stay behind. Writes <dest> and <dest>/files.json, the
// list of published paths. Usage: node scripts/phone-preview.mjs <dest> [title]

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
const [dest, title] = process.argv.slice(2);
if (!dest) throw new Error("usage: node scripts/phone-preview.mjs <dest> [title]");
if (!existsSync(join(OUT, "index.html"))) throw new Error("no out/index.html: run npm run build first");

const LEFT = (p) => p.endsWith(".gz") || p === "CNAME" || (p.startsWith(`guide${sep}`) && /\.(mp4|webm|mov)$/.test(p));
const TEXT = /\.(html|js|css|txt|json|xml)$/;
const top = readdirSync(OUT).filter((n) => !n.endsWith(".gz")).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const ROOTED = new RegExp(`(["'\`(=]|\\\\")/(?=(?:${top.join("|")})(?:[/"'\`?#)\\\\]|$))`, "g");

rmSync(dest, { recursive: true, force: true });
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const from = join(dir, name);
    const rel = relative(OUT, from);
    if (statSync(from).isDirectory()) { walk(from); continue; }
    if (LEFT(rel)) continue;
    const to = join(dest, rel);
    mkdirSync(join(to, ".."), { recursive: true });
    if (!TEXT.test(name)) { cpSync(from, to); files.push(rel.split(sep).join("/")); continue; }
    /* Scripts and styles resolve against the page that loads them, a page at the root. */
    const depth = name.endsWith(".html") ? rel.split(sep).length - 1 : 0;
    const up = depth ? "../".repeat(depth) : "./";
    /* The bare "/_next/" stays: Next finds its own folder in a script's address by it. */
    let text = readFileSync(from, "utf8").replace(ROOTED, (m, lead, at, all) => (/^\/_next\/\\?"/.test(all.slice(at + lead.length)) ? m : lead + up));
    /* The chunk loader's folder, relative as the payload's chunk paths now are:
       the loader knows a chunk by its folder plus its name, so the two must match as text. */
    if (name.endsWith(".html")) text = text.replace("<head>", `<head><script>TURBOPACK_CHUNK_BASE_PATH="${up}_next/"</script>`);
    /* The link home, in the page and in its payload. */
    if (/\.(html|txt)$/.test(name)) text = text.replaceAll('href="/"', `href="${up}"`).replaceAll('\\"href\\":\\"/\\"', `\\"href\\":\\"${up}\\"`);
    if (rel === "index.html" && title) text = text.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
    writeFileSync(to, text);
    files.push(rel.split(sep).join("/"));
  }
})(OUT);
writeFileSync(join(dest, "files.json"), JSON.stringify(files.filter((f) => f !== "index.html")));
console.log(`${files.length} files -> ${dest}`);
