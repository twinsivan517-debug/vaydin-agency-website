// Turns each clip in media/clips/ into the image sequences the page scrubs.
//   node scripts/frames.mjs
// Writes public/frames/<clip>/d (the whole 16:9 picture, 1920 wide) and /m
// (a 3:4 cut around the clip's focus, 648 wide, for phones), 12 frames a
// second, WebP, plus src/lib/frames.json with the frame count per clip.
// A clip's focus is where the phone cut is centred across the picture, at
// its first and its last frame; the cut slides between the two.
// Needs ffmpeg on the PATH. Posters (first and last frame) go to public/img/.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";

// `secs` keeps only the start of a clip, for one whose move ends early and
// then stands still.
const CLIPS = {
  m: { focus: [0.72, 0.72] },
  n: { focus: [0.72, 0.5], secs: 3.4 },
  e: { focus: [0.5, 0.56] },
  b: { focus: [0.68, 0.68] },
  r: { focus: [0.56, 0.56] },
};
const FPS = 12;
const FULL = 124 / 24;
// Clips are 2560x1440; the phone cut is 1080x1440, kept inside the picture.
const left = (cx) => Math.round(Math.min(Math.max(2560 * cx - 540, 0), 1480));
const cut = ([from, to], last) => `crop=1080:1440:${left(from)}+(${left(to) - left(from)})*n/${last}:0,`;
const SIZES = { d: () => "scale=1920:-2", m: (focus, last) => `${cut(focus, last)}scale=648:-2` };
const QUALITY = { d: 62, m: 52 };

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

const counts = {};
for (const [clip, { focus, secs = FULL }] of Object.entries(CLIPS)) {
  const last = Math.round(secs * FPS) - 1;
  const src = `media/clips/${clip}.mp4`;
  rmSync(`public/frames/${clip}`, { recursive: true, force: true });
  for (const [key, shape] of Object.entries(SIZES)) {
    const dir = `public/frames/${clip}/${key}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    ff("-t", String(secs), "-i", src, "-vf", `fps=${FPS},${shape(focus, last)}:flags=lanczos`, "-c:v", "libwebp",
      "-quality", String(QUALITY[key]), "-an", `${dir}/%03d.webp`);
    counts[clip] = readdirSync(dir).length;
  }
  mkdirSync("public/img", { recursive: true });
  ff("-i", src, "-vf", "scale=1600:-2:flags=lanczos", "-frames:v", "1", "-c:v", "libwebp",
    "-quality", "72", `public/img/${clip}-first.webp`);
  ff("-i", `public/frames/${clip}/d/${String(counts[clip]).padStart(3, "0")}.webp`, "-frames:v", "1", "-c:v", "libwebp",
    "-quality", "80", `public/img/${clip}-last.webp`);
}
writeFileSync("src/lib/frames.json", JSON.stringify(counts, null, 2) + "\n");
console.log(counts);
