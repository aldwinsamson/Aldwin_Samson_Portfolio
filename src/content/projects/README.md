# Projects

One file = one project. No database, no registry to edit.

## Add a project (30 seconds)
```bash
npm run new:project -- aws-three-tier "AWS Three-Tier App"
```
This creates `src/content/projects/aws-three-tier.ts` from the template with a **valid slug**
(lowercase-with-dashes — the file name and the `slug` must be the same; the pretty name goes in `title`).

1. Open the new file and fill it in. Only the **REQUIRED** block is mandatory.
2. Run `npm run dev` — the project appears on the homepage wheel, `/projects`, its own `/projects/<slug>` page,
   prev/next links and the ⌘K search. New projects start as a **draft** (a "Draft · dev only" badge).
3. When it is ready, **delete the `draft: true` line**. Now it is on the live site, in the sitemap and in the assistant.

## Draft = safe to work on
`draft: true` projects are visible **only** in `npm run dev`. They are removed from the production build
(not just hidden), left out of `sitemap.xml` and ignored by the portfolio assistant — so half-written text can never go live.

## Images
Put them in `public/images/projects/<slug>/` and reference `"/images/projects/<slug>/cover.webp"`.
No image yet? Omit `cover` and a placeholder is shown.

## Ordering
`order: 1` shows first, `order: 2` next… Projects without `order` go after the numbered ones (A→Z by slug).
The homepage wheel shows up to 10 projects (featured ones first); everything is always on `/projects`.

## Remove / hide a project
Delete the file, or rename it to start with `_` (e.g. `_old-idea.ts`) to ignore it completely.

## Catching mistakes
* `npm run dev` — the browser console warns about a bad slug, a wrong file name, or two projects with the
  same text (the "I copied a file and forgot to edit it" mistake).
* `npm run check` — typecheck + all tests (also run automatically on every push by GitHub Actions).
* Do NOT keep an old `src/content/projects.ts` next to this folder: it would shadow `projects/index.ts`
  and your new projects would silently not appear.
