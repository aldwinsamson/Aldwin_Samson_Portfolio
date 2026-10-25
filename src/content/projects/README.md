# Projects

One file = one project. No database, no registry to edit.

## Add a project
1. Copy `_template.ts` → `your-slug.ts` (the file name must equal the `slug`).
2. Fill it in. Only the fields in the **REQUIRED** block are mandatory.
3. Save. It appears everywhere automatically:
   homepage wheel · `/projects` · `/projects/your-slug` · prev/next links · ⌘K search.

## Images
Put them in `public/images/projects/<slug>/` and reference `"/images/projects/<slug>/cover.webp"`.
No image yet? Omit `cover` and a placeholder is shown.

## Ordering
`order: 1` shows first, `order: 2` next… Projects without `order` go after the numbered ones (A→Z by slug).
The homepage wheel shows up to 10 projects (featured ones first); everything is always on `/projects`.

## Remove / hide a project
Delete the file, or rename it to start with `_` (e.g. `_old-idea.ts`) to keep it as a draft.

## Mistakes
`npm test` checks every project file (unique slug, file name = slug, valid categories, https links…).
In `npm run dev` the browser console also warns about problems as you type.
