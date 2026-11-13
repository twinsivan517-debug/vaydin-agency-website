# vaydin-night

The site at https://vaydin.agency. Next.js, TypeScript, Tailwind, exported to plain files
and published by GitHub Pages from `main`. The home page is the guide: him, a figure of gold
dots drawn by code, who speaks his lines, shows shapes and numbers, and lights the doors
and questions as he speaks. The five product pages and the three legal pages are the
standalone `.html` files in `public/`.

## Where things are

- `src/app/page.tsx` — the home page: headline, the stage, the doors, the who-we-are
  paragraph and the transcript ("Read what he says"). `layout.tsx` — titles and the
  organisation record for search engines. `corner/` — the page inside the corner's frame.
- `src/app/robots.ts` and `sitemap.ts` — what search engines may read and the page list;
  `src/lib/site.ts` with `site.json` — the site's name, address, description and contacts;
  `public/llms.txt` — Vaydin in plain words for AI assistants.
- `public/` — the standalone pages, `assets/` (their pictures and the ambient video),
  `img/mark.png` (the logo, also sampled into his Vaydin mark), the icons, CNAME, and
  `count.js`, the visitor count (Umami Cloud): visits and taps on WhatsApp, phone and email, only on
  vaydin.agency, loaded once at the end of every page's body, never by `layout.tsx`. It loads `umami.js`,
  Umami's tracker copied whole under its MIT notice and pinned by hash in `pages.test.mjs` (`-text` in
  `.gitattributes`, so no checkout changes a byte); a newer tracker is read before it replaces this one.
- `.github/workflows/pages.yml` — builds `main` and publishes it to GitHub Pages; only its
  deploy job may publish.
- `src/components/Stage.tsx` — the hero: his cloud and the card, him, the five door
  tiles, the ask box and the questions, Stop, the bar; his waking by himself.
- `src/components/Figure.tsx` and `src/lib/figure/` — him: `engine.ts` (the dots frame by
  frame, the cues, the doors and question chips he rings, the numbers and the Vaydin mark,
  pokes, hibernation, dizziness and the scroll shake, the wave, the logo light), `body.ts`
  (his shape), `shapes.ts` (what his body becomes, each drawn the first time it is needed).
- `src/components/Corner.tsx` and `public/guide/corner.js` — his small self in the corner
  of the five other pages, in a frame the page adds after it has loaded.
- `src/components/Card.tsx` — the card beside him; `Doors.tsx` and `src/lib/doors.ts` — the
  five pages as doors; `Header.tsx` — the bar across the top.
- `src/lib/pitch.ts` — his words, chapter by chapter, and each line's sound;
  `answers.ts` — the typed questions he answers; `match.ts` and `asked.json` — how a typed
  line finds its answer; `talk.ts` — small talk; `pages.ts` — the corner's words per page.
- `src/lib/pitchMachine.ts` — what a tap, a poke, a line's end or Stop does; tested, with
  the matcher and the recordings, by `npm test`.
- `src/lib/speaker.ts` — one audio element, unlocked by the first tap.
- `public/voice/` — one mp3 per line, in Jon's voice. `public/guide/cues.json` — what he
  shows on each recording, made by `lab/particle-guide/voice/cues.py`.
- `lab/particle-guide/` — how he was made, never shipped: the voice tools (record, time,
  verify, cues), the test pages and mocks, the armour pick. Its own README.
- `scripts/phone-preview.mjs` — a copy of `out/` that works from any folder, for a private
  preview link on a phone (a claude.ai artifact) without going live. `runner-gate.mjs`,
  `secret-scan.mjs`, `arm-hooks.mjs`, `gzip-out.mjs` — the gate and the build.
- `scripts/` (hers, kept as know-how for clip guides) — `lipsync.py`, `opener_lipsync.py`,
  `opener_lying.py`, `body.py`, `loop.py`, `seal.py`, `green_gate.py`, `rekey.py`,
  `voice.py`, `gpu/`, `LIPSYNC.md`. `media/guide/` — her two base loops and a `.front` file;
  her generated sources are not in git.
- `media/prompt-log.md` — every generation and recording, with job ids and costs.

Sound never starts on load: the first touch plays the greeting (or the question touched),
and that touch unlocks the page for every later line. Earlier home pages are tags: the
scroll story at `story-home-2026-10-17`, the woman guide made of video clips (her code and
all her clips) at `guide-lady-2026-10-21`.

## The ship gate

Since 2026-11-09 the gate runs on a GitHub runner, not the laptop (whose scores swung 79 to 90
on unchanged bytes), and it measures side by side, because one runner also swung 69 to 94. Every
push to `main` builds the commit AND a fixed anchor commit (`.github/ship-floors.json`, moved
only on the owner's word), serves both as `npm start` does, and runs Lighthouse on each home,
and on `/app.html` beside the anchor's own `/app.html` once the anchor has one (until then its
`grow.html`): one discarded warm-up, then 5 runs each, interleaved. Performance passes when the
candidate's median is no more than that page's tolerance under the anchor's. Each page's
tolerance comes from an A/A test of that page against itself (5 runners): home 2, `/app` 5 since
2026-11-11, anchor `c9945eb`; a page with no number never deploys.
Accessibility, best practices and SEO keep absolute floors; page weight, dead links on the
home, reduce motion and secrets are judged as web-studio's `ship_check` judges them. The deploy
job needs the gate (`scripts/runner-gate.mjs`, `.github/workflows/pages.yml`). A `gate/**`
branch is measured and reported, never deployed. The laptop's pre-push hook refuses a key, a
secret file or a private word (`scripts/secret-scan.mjs`) before anything reaches the public
repo; the word list lives outside this repo, and without it nothing is pushed.

Commits here are authored "Vaydin" (since 2026-11-11). `npm install` sets that name in this
clone's own git config; on a fresh clone also set `git config user.email` to the GitHub no-reply
address, or the push is refused: a personal address is on the private list.

Each page sets its own canonical address in its own `metadata` (see `page.tsx`). Set in the
layout it would be inherited, and every page would claim to be the home page.

## Commands

    npm run dev      work on it
    npm run build    build it (gzip twins are written after)
    npm run start    serve the build at http://127.0.0.1:8080/
    npm test         the guide's state machine
