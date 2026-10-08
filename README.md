# Starter

The template every site is cloned from. Next.js, TypeScript, Tailwind.

## What to change first

- `site.json` — the name, the tier (`static`, `motion` or `3d`), the live address, one sentence, the email.
- `src/app/page.tsx` — the page itself. Every sentence in it is a placeholder.

## What is already here

- `src/app/layout.tsx`, `robots.ts`, `sitemap.ts` — search basics, read from `site.json`.
- `src/components/ContactForm.tsx` + `src/app/actions.ts` — a contact form. It forwards to the address in the `CONTACT_WEBHOOK_URL` setting; with none set it tells the visitor to email instead.
- `src/components/Reveal.tsx` + `.reveal` in `globals.css` — slides a block up into place as it scrolls into view, with no script and no fade (faded text fails the contrast check while it is half shown). It stands still for a visitor who asked for reduced motion, and in a browser without scroll-driven animation.

## The ship gate

`npm install` points git at `.githooks/`. From then on a push to `main` is refused unless
`.ship/stamp.json` names a commit that passed the ship gate, and nothing but `.ship/` changed
after it. `git push --no-verify` skips the check, and a stamp written by hand with a real
commit id passes it; nothing here can stop either. It catches drift, not intent.

Each page sets its own canonical address in its own `metadata` (see `page.tsx`). Set in the
layout it would be inherited, and every page would claim to be the home page.

A new site is made from an export of this repository, not a clone: `.ship/` is left out of
the export, so a new site never starts with this starter's stamp.

## Commands

    npm run dev      work on it
    npm run build    build it
    npm run start    serve the build
