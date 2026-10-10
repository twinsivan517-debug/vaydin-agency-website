// Turns each looping clip in media/clips/ into the two silent videos the page
// plays round and round (LoopClip).
//   node scripts/loops.mjs
// Writes public/loops/<clip>-d.mp4 (the whole 16:9 picture, 1920 wide) and
// <clip>-m.mp4 (a 3:4 cut around the clip's focus, 648 wide, for phones).
// A clip's focus is where the phone cut is centred across the picture.
// Needs ffmpeg on the PATH.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const CLIPS = { l: { focus: 0.56 } };
// Clips are 2560x1440; the phone cut is 1080x1440, kept inside the picture.
const left = (cx) => Math.round(Math.min(Math.max(2560 * cx - 540, 0), 1480));
const SIZES = {
  d: () => "scale=1920:-2:flags=lanczos",
  m: (focus) => `crop=1080:1440:${left(focus)}:0,scale=648:-2:flags=lanczos`,
};
const CRF = { d: 27, m: 26 };

mkdirSync("public/loops", { recursive: true });
for (const [clip, { focus }] of Object.entries(CLIPS)) {
  for (const [key, shape] of Object.entries(SIZES)) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `media/clips/${clip}.mp4`, "-vf", shape(focus), "-an",
      "-c:v", "libx264", "-preset", "slow", "-crf", String(CRF[key]), "-pix_fmt", "yuv420p",
      "-movflags", "+faststart", `public/loops/${clip}-${key}.mp4`], { stdio: "inherit" });
  }
}
