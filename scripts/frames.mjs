// Turns each clip in media/clips/ into the image sequences the page scrubs.
//   node scripts/frames.mjs
// Writes public/frames/<clip>/d (the whole 16:9 picture, 1280 wide) and /m
// (a 3:4 cut around the clip's focus, 648 wide, for phones), 12 frames a
// second, WebP, plus src/lib/frames.json with the frame count per clip.
// The focus is the same number the page gives its stage as --cx.
// Needs ffmpeg on the PATH. Posters (first and last frame) go to public/img/.
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const CLIPS = { m: 0.72, a: 0.68, b: 0.68, c: 0.68 };
// Clips are 2560x1440; the phone cut is 1080x1440, kept inside the picture.
const cut = (cx) => `crop=1080:1440:${Math.round(Math.min(Math.max(2560 * cx - 540, 0), 1480))}:0,`;
const SIZES = { d: () => "scale=1280:-2", m: (cx) => `${cut(cx)}scale=648:-2` };
const FPS = 12;
const QUALITY = { d: 62, m: 52 };

const ff = (...args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

const counts = {};
for (const [clip, cx] of Object.entries(CLIPS)) {
  const src = `media/clips/${clip}.mp4`;
  for (const [key, shape] of Object.entries(SIZES)) {
    const dir = `public/frames/${clip}/${key}`;
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    ff("-i", src, "-vf", `fps=${FPS},${shape(cx)}:flags=lanczos`, "-c:v", "libwebp",
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
