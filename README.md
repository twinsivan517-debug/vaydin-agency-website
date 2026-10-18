# vaydin-night

The site at https://vaydin.agency. Next.js, TypeScript, Tailwind, exported to plain files
and published by GitHub Pages from `main`. The home page is the guide: an illustrated
woman who walks in and tells the pitch, chapter by chapter, in her own voice. The five
product pages and the three legal pages are the standalone `.html` files in `public/`.

## Where things are

- `src/app/page.tsx` — the home page: headline, the stage, the closing frame.
- `src/components/Stage.tsx` — the speech cloud, the Meet-her button, the chapter chips,
  Stop, the two buttons she lights at the end, the transcript.
- `src/components/Guide.tsx` — her clips keyed onto a canvas, the walk-in, cross-fades,
  moods, the opener with its own sound. Reduced motion shows `public/guide/still.webp`.
- `src/lib/chroma.ts` — the green-screen keyer, two layers so clips fade into each other.
- `src/lib/pitch.ts` — her words, chapter by chapter, and the path of each line's sound.
- `src/lib/pitchMachine.ts` — what a tap, a poke, a line's end or Stop does; tested by
  `npm test`.
- `src/lib/speaker.ts` — one audio element, unlocked by the first tap.
- `public/guide/` — `walk`, `idle`, `talk` loops (silent, 258x480) and `opener.mp4`
  (with sound). `public/voice/` — one mp3 per line. `public/guide/lines/` — one clip
  per line: the idle loop with her lips on that line, made by `scripts/lipsync.py`.
- `scripts/` — `lipsync.py` (the lines, over the shared loop or a line's own body),
  `opener_lipsync.py` (the greeting's standing part), `body.py` (a generated gesture clip
  made ready as a line's body), `loop.py` (her idle, talk and sleep loops from generated clips), `seal.py` (her mouth closed in a
  silent loop the generator made talk), `green_gate.py` (can every frame be keyed), `rekey.py`
  (rescues a clip whose backdrop drifted), `LIPSYNC.md` (the lab they need, outside the repo).
- `media/guide/bodies/` — one gesture clip per line that has one, not in git (made again
  from `body.py` and the job id in the log); a `<id>.front` file, in git, holds how many
  frames show her face. The page's clips in `public/guide/lines/` are made from them.
- `media/prompt-log.md` — every generation that made her, with job ids; the sources
  under `media/` are not in git.

Sound never starts on load: the first tap plays the opener, and that tap unlocks the
page for every later line. The scroll story that was the home page until the guide is at
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
