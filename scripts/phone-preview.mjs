// A copy of out/ that works from any folder, for a private preview link on a
// phone (a claude.ai artifact serves its files under a version folder, where a
// path starting with "/" finds nothing, and keeps names starting with "_" for
// itself). Every quoted path to a top-level entry of out/ is made relative to
// the file's page depth, and _next/ moves to build/_next/; her clips, the gzip
// twins, the domain file and the "_" files only client navigation fetches stay
// behind. Writes <dest> and <dest>/files.json, the published paths but the page.
// Usage: node scripts/phone-preview.mjs <dest> [title]

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const OUT = "out";
const NEXT = "build/";
const [dest, title] = process.argv.slice(2);
if (!dest) throw new Error("usage: node scripts/phone-preview.mjs <dest> [title]");
if (!existsSync(join(OUT, "index.html"))) throw new Error("no out/index.html: run npm run build first");

const LEFT = (p) =>
  p.endsWith(".gz") || p === "CNAME" || /^guide\/.*\.(mp4|webm|mov)$/.test(p) || p.split("/").some((s) => s.startsWith("_") && s !== "_next");
const TEXT = /\.(html|js|css|txt|json|xml)$/;
const top = readdirSync(OUT).filter((n) => !n.endsWith(".gz")).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const ROOTED = new RegExp(`(["'\`(=]|\\\\")/(?=(?:${top.join("|")})(?:[/"'\`?#)\\\\]|$))`, "g");

/* The destination is emptied first: never this repository, a folder holding it, or out/ itself. */
const here = resolve("."), there = resolve(dest);
if (there === here || here.startsWith(there + sep) || there === resolve(OUT)) throw new Error(`refusing to empty ${there}`);
rmSync(dest, { recursive: true, force: true });
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const from = join(dir, name);
    const rel = relative(OUT, from).split(sep).join("/");
    if (statSync(from).isDirectory()) { walk(from); continue; }
    if (LEFT(rel)) continue;
    const pub = rel.startsWith("_next/") ? NEXT + rel : rel;
    const to = join(dest, pub);
    mkdirSync(join(to, ".."), { recursive: true });
    files.push(pub);
    if (!TEXT.test(name)) { cpSync(from, to); continue; }
    /* Scripts and styles resolve against the page that loads them, a page at the root. */
    const depth = name.endsWith(".html") ? rel.split("/").length - 1 : 0;
    const up = depth ? "../".repeat(depth) : "./";
    /* Left as they are, being markers the router compares, not addresses: the
       bare "/_next/" (Next finds its own folder in a script's address by it),
       "/_next/static/immutable", "/index.txt" and the "_" names. */
    let text = readFileSync(from, "utf8").replace(ROOTED, (m, lead, at, all) => {
      const rest = all.slice(at + lead.length);
      if (/^\/(?:_next\/\\?"|_next\/static\/immutable|index\.txt|_(?!next\/))/.test(rest)) return m;
      return lead + up + (rest.startsWith("/_next/") ? NEXT : "");
    });
    /* The chunk loader's folder, relative as the payload's chunk paths now are:
       the loader knows a chunk by its folder plus its name, so the two must match as text. */
    if (name.endsWith(".html")) text = text.replace("<head>", `<head><script>TURBOPACK_CHUNK_BASE_PATH="${up}${NEXT}_next/"</script>`);
    /* The link home, in the page and in its payload. */
    if (/\.(html|txt)$/.test(name)) text = text.replaceAll('href="/"', `href="${up}"`).replaceAll('\\"href\\":\\"/\\"', `\\"href\\":\\"${up}\\"`);
    if (rel === "index.html" && title) text = text.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
    /* The publisher refuses a literal U+FFFD; in the scripts it only stands in string literals, where the escape is the same character. */
    if (name.endsWith(".js")) text = text.replaceAll("�", "\\ufffd");
    writeFileSync(to, text);
  }
})(OUT);
writeFileSync(join(dest, "files.json"), JSON.stringify(files.filter((f) => f !== "index.html").map((path) => ({ path }))));
console.log(`${files.length} files -> ${dest}`);
