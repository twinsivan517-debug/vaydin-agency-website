# vaydin-night

The site at https://vaydin.agency. Next.js, TypeScript, Tailwind, exported to plain files
and published by GitHub Pages from `main`. The home page is the guide. On `main` that is an
illustrated woman; on branch `particle-guide` it is him, a figure of gold dots drawn by
code, who shows shapes and lights the doors as he speaks. The five
product pages and the three legal pages are the standalone `.html` files in `public/`.

## Where things are

- `src/app/page.tsx` — the home page: headline, the stage, the closing frame.
- `src/components/Stage.tsx` — the hero: his cloud and the card, him, the five door
  tiles beside him, the ask box and the questions, Stop, the bar; his waking by himself.
- `src/components/Figure.tsx` and `src/lib/figure/` — him: `engine.ts` (the dots frame by
  frame, the cues, the doors and question chips he rings, pokes, hibernation, dizziness, the logo light), `body.ts` (his shape), `shapes.ts`
  (what his body becomes). `public/guide/cues.json` says what he shows on each recording.
- `src/components/Corner.tsx` and `public/guide/corner.js` — his small self in the corner
  of the five other pages, in a frame the page adds after it has loaded.
- `src/lib/doors.ts` — the five pages as doors, beside him and under the hero (`Doors.tsx`).
- `src/components/Guide.tsx` — hers: her clips keyed onto a canvas. Unused on his branch
  but for the handle type; it goes once he is approved.
- `src/lib/chroma.ts` — the green-screen keyer, two layers so clips fade into each other.
- `src/lib/pitch.ts` — her words, chapter by chapter, and the path of each line's sound.
- `src/lib/pitchMachine.ts` — what a tap, a poke, a line's end or Stop does; tested by
  `npm test`.
- `src/lib/speaker.ts` — one audio element, unlocked by the first tap.
- `public/guide/` — `walk`, `idle`, `talk` loops (silent, 258x480) and `opener.mp4`
  (with sound). `public/voice/` — one mp3 per line. `public/guide/lines/` — one clip
  per line: the idle loop with her lips on that line, made by `scripts/lipsync.py`.
- `scripts/phone-preview.mjs` — a copy of `out/` that works from any folder, for a private
  preview link on a phone (a claude.ai artifact) without going live.
- `scripts/` (hers) — `lipsync.py` (the lines, over the shared loop or a line's own body),
  `opener_lipsync.py` (the greeting's standing part), `body.py` (a generated gesture clip
  made ready as a line's body), `loop.py` (her idle, talk and sleep loops from generated clips), `seal.py` (her mouth closed in a
  silent loop the generator made talk), `green_gate.py` (can every frame be keyed), `rekey.py`
  (rescues a clip whose backdrop drifted), `LIPSYNC.md` (the lab they need, outside the repo).
- `media/guide/bodies/` — one gesture clip per line that has one, not in git (made again
  from `body.py` and the job id in the log); a `<id>.front` file, in git, holds how many
  frames show her face. The page's clips in `public/guide/lines/` are made from them.
- `media/prompt-log.md` — every generation that made her, with job ids; the sources
  under `media/` are not in git.

Sound never starts on load: the first touch plays the opener (or the question touched),
and that touch unlocks the page for every later line. The scroll story that was the home page until the guide is at
tag `story-home-2026-10-17`.

## The ship gate

`npm install` points git at `.githooks/`. From then on a push to `main` is refused unless
`.ship/stamp.json` names a commit that passed the ship gate, and nothing but `.ship/` changed
after it. `git push --no-verify` skips the check, and a stamp written by hand with a real
commit id passes it; nothing here can stop either. It catches drift, not intent.

Each page sets its own canonical address in its own `metadata` (see `page.tsx`). Set in the
layout it would be inherited, and every page would claim to be the home page.

## Commands

    npm run dev      work on it
    npm run build    build it (gzip twins are written after)
    npm run start    serve the build at http://127.0.0.1:8080/
    npm test         the guide's state machine
