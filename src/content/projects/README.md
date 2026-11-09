# Projects

Each project is one TypeScript file in this folder. Files are discovered automatically; there is no registry to update.

## Add a project

```bash
npm run new:project -- <slug> "<Title>"
```

This creates `src/content/projects/<slug>.ts` from `_template.ts`. The file name and the `slug` field must match and use lowercase letters, digits and hyphens.

1. Fill in the file. Only the `REQUIRED` block is mandatory.
2. Run `npm run dev`. The project appears on the homepage ring, `/projects` and `/projects/<slug>`, and in the command palette. New projects start with `draft: true`.
3. Remove `draft: true` to publish. The project is then included in the production build, `sitemap.xml` and the assistant's knowledge.
4. Run `npm run build:knowledge` and commit the regenerated file.

## Drafts

Projects with `draft: true` are visible only in the development server. They are excluded from the production build and the sitemap, and are ignored by the assistant.

## Images

Place images in `public/images/projects/<slug>/` and reference them as `/images/projects/<slug>/cover.webp`. If `cover` is omitted, a placeholder is shown. Mark stock or concept images with `kind: "representative"` so they are labelled as such.

Images listed in `gallery` appear in the project's Media section in a two-column grid. Selecting one opens it full size in a viewer with keyboard (arrow keys, Esc) and swipe navigation, so supply the largest sensible version of each image.

## Ordering

Projects are sorted by `order` (ascending). Projects without `order` follow, sorted by slug. The homepage ring shows up to 10 projects, featured ones first; `/projects` lists all of them.

## Hiding a project

Delete the file, or prefix its name with `_` (for example `_old-idea.ts`) to exclude it entirely.

## Validation

- `npm run dev` logs warnings for an invalid slug, a file name that does not match its slug, and duplicated text between projects.
- `npm run check` runs the typecheck and the full test suite. CI runs it on every push.
