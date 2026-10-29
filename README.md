# John Aldwin R. Samson — Portfolio

A content-driven, accessible engineering portfolio with an adaptive 3D hero.
Luxury-editorial design (Instrument Serif · Manrope · JetBrains Mono), obsidian/ivory themes, a champagne primary
accent and a restrained cyan technical accent.

> **Not deployed.** This project has intentionally **not** been deployed or published anywhere.
> Deployed to AWS from Terraform + GitHub Actions (see [AWS deployment & DevOps pipeline](#aws-deployment--devops-pipeline)).

---

## Tech stack

| Concern | Choice |
| --- | --- |
| UI | React 19 + TypeScript (strict) |
| Build | Vite 7 — code-split (vendor chunks, lazy routes, lazy three.js); serve `dist/` from any static host (`npm run preview` locally) |
| Styling | Tailwind CSS v4 with CSS-variable design tokens (`src/index.css`) |
| Motion | Motion for React (`motion/react`) + shared tokens (`src/styles/motion.ts`) |
| 3D | three.js (WebGL particle portrait in the hero) + CSS 3D transforms (project ring) |
| Routing | react-router-dom v7 (hash or browser mode, `src/config/site.ts`) |
| Icons | lucide-react (+ custom GitHub/LinkedIn SVGs) |
| Tests | Vitest (pure logic tests in `tests/`) |
| Smooth Scroll | Lenis (buttery-smooth scroll, agency-grade feel) |

No backend, database, paid API, analytics or external AI service is used.

## Premium Features (Wow-Factor)

All premium features can be individually toggled in `src/config/site.ts` → `features`.

### 🎯 Custom Cursor
A dual dot+ring cursor that morphs on interactive elements:
- **Default** — small dot + trailing ring
- **Hover** — ring expands on interactive elements
- **Text mode** — ring becomes a labelled pill (e.g. "View" on project cards) via `data-cursor="text"` + `data-cursor-text="View"`
- **Magnetic** — cursor is pulled toward elements with `data-cursor="magnetic"`
- Fine-pointer only; disabled on touch/reduced-motion

### 🎬 Cinematic Preloader
A luxury entrance sequence (once per session):
1. Animated monogram with expanding rings
2. Name reveal with scanning line
3. Upward curtain exit into the site

### 📜 Smooth Scroll (Lenis)
Buttery-smooth momentum scrolling — the feel of a high-end agency site. Disabled under reduced motion.

### ⌘K Command Palette
Press `⌘K` (Mac) or `Ctrl+K` (Windows) to open a fuzzy search over:
- All pages and sections
- All projects (by name, category, tech)
- Actions (toggle theme, copy email)
- External links (GitHub, LinkedIn)
Keyboard navigable with arrow keys + Enter.

### 📊 Animated Counters
Numbers count up from zero with an easing curve when scrolled into view. Used in the "By the Numbers" stats section.

### 🔤 Text Scramble
Letters decode from random characters into real text — a premium "hacker aesthetic" effect. Triggers on scroll (once) and replays on hover for discipline titles.

### ⌨️ TypeWriter Effect
Cycles through phrases character-by-character in the hero subtitle (bench → breadboard → browser → command line).

### 🌟 Glow Cards
Cards with a luminous gradient border that follows the mouse pointer. Used for the Recognition panel and About page values.

### 🧲 Magnetic Wrap
Elements are magnetically pulled toward the cursor on hover. Applied to CTAs and social buttons.

### 📐 Parallax Dividers
Large editorial text scrolls at a different rate than its background between sections — Apple product page style.

### 🔲 Horizontal Gallery (not mounted)
`HorizontalGallery.tsx` is currently unused; the homepage projects use the 3D Project Ring below.

### 🏗 Floating Dock
A macOS-style navigation dock at the bottom of the screen with distance-based icon magnification.

### 📍 Spotlight Container
A collective mouse-following spotlight glow over card grids (used on the Stack page).

### 🔅 Progress Bar
A thin gradient bar at the top of the viewport showing scroll progress.

### ✨ Beam Effect
Animated beams of light behind project detail page headings.

### 🔄 Animated Gradient Border
The contact section has a continuously rotating gradient border (conic gradient with CSS `@property`).

## Prerequisites

- Node.js 20+ and npm 10+

## Getting started

```bash
npm install          # install dependencies (uses package-lock.json)
npm run dev          # local dev server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve the production build locally
npx vitest run       # run automated tests
npm run check        # strict TypeScript check + all tests
```

## Project structure

```
src/
  App.tsx                 router, layout shell, page transitions, error boundary
  index.css               design tokens (light/dark), type scale, grain, reduced-motion policy
  config/
    site.ts               site metadata, router mode, feature flags, navigation
    hero.ts               ★ hero image + interaction settings (the only file to edit for the hero)
  content/                ★ all editable portfolio content (typed)
    types.ts              content models
    profile.ts            bio, hero copy, socials, contact copy
    projects/             ★ one file per project (auto-discovered) — see projects/README.md
    projectLogic.ts       sorting, validation, drafts, copy-paste detection
    experience.ts         experience, education, certifications, honors
    skills.ts             tech-stack groups
    knowledge.ts          Portfolio Guide knowledge base + local search
  components/             Navbar, Footer, ThemeToggle, BackToTop, Icons, ui primitives
  features/
    hero/                 Hero (cinematic, pinned on desktop), ParticlePortrait (WebGL), particles.ts (sampling),
                          HeroWord (chrome lettering), HeroImage (About page portrait)
    projects/             ProjectRing (home, 3D rotating ring), ringMath.ts, ProjectCard, ProjectExplorer
    experience/           Timeline, ExperienceRows
    stack/                StackGrid
    contact/              ContactSection, CopyEmailButton
    guide/                PortfolioGuide (in-browser assistant: engine, corpus, glossary)
  hooks/                  useTheme, useMediaQuery, useDeviceCapability, useCopy
  pages/                  Home, Projects, ProjectDetail, Experience, Stack, About, Contact, NotFound
  styles/motion.ts        easing, durations, springs, distances, stagger
public/                   robots.txt, sitemap.xml, favicon.svg (add images to public/images/)
tests/                    Vitest unit tests
scripts/                  generate-sitemap.mjs (runs before build), new-project.mjs, smoke-test.sh
infra/                    Terraform (bootstrap, prod, modules) + runbook — see infra/README.md
gitops/                   Argo CD apps, Helm values, Kustomize manifests (k3s lab)
.github/workflows/        CI, deploy, terraform, container, CodeQL
Dockerfile, docker/       Container image (nginx-unprivileged) used by the staging deployment
```

## Replacing the portrait

- **Homepage hero** — the particles are sampled from `public/images/portrait-cutout-512.webp` (a square, background-free
  PNG/WebP with transparency; head near the top, shoulders at the bottom). Replace that file (keep the name) to change the
  portrait. `public/images/portrait-cutout.webp` (1024 px) is the still version used if WebGL/motion is unavailable.
- **About page** — configured in **`src/config/hero.ts`** (`src`, `srcSet`, `alt`, `focalPoint`, `aspectRatio`).
  `isPlaceholder: false` hides the placeholder captions and the footer credit.

### Tuning framing & movement

| Setting | Effect |
| --- | --- |
| `focalPoint.desktop / mobile` | CSS `object-position` for each crop (e.g. `"50% 25%"` moves the subject up) |
| `aspectRatio` | Arch frame ratio (width/height). 0.72–0.8 suits portraits |
| `initialScale` / `exploredScale` | Art-directed close crop at rest → zoom-out once explored |
| `maxTilt` | Max rotation in degrees (keep ≤ 12) |
| `maxShift`, `depthIntensity` | Parallax distance and layer separation |
| `hoverSensitivity`, `dragSensitivity` | Pointer vs drag/touch response |
| `lightingIntensity` | Specular highlight + tonal overlay strength |
| `exploreThreshold`, `idleResetMs` | When the "explored" state triggers / when it returns to rest |
| `mobile.interaction` | `"drag"` (horizontal drag; vertical scroll stays native) or `"static"` |
| `mobile.disable3D` | Skip WebGL on phones/tablets (image parallax still works) |
| `reducedMotion.behavior` | Static composition for reduced-motion visitors |

### Navigation

One centred capsule on every screen size (logo · links · ⌘K · theme · Contact on desktop; logo · theme · menu on phones).
It never spans the page, so it can't collide with the hero, and it tucks away while scrolling down.

### Performance notes

Full-screen `mix-blend-mode` grain/vignette overlays, page-wide blur filters, per-element `filter: blur(0px)` leftovers and
scroll springs were removed; the hero particles throttle themselves when idle, step down their quality on slow GPUs, and stop
drawing once dispersed. Lenis uses a short lerp (no delayed easing).

### Cinematic homepage (desktop) vs fixed layout (mobile)

`useCinematic()` (`src/hooks/useCinematic.ts`) is true only for wide screens with a mouse/trackpad and no reduced-motion
preference. In that mode:

- **Hero** — a 250svh section with a pinned stage. Your portrait is rebuilt from ~28k gold particles
  (`ParticlePortrait`); scrolling disperses it, the chrome name rises and the side copy slides away.
  The pointer pushes particles aside.
- **Projects** — a pinned 380svh stage. Scrolling turns a tilted 3D ring of project faces
  (`ProjectRing`); it also drifts on its own, can be dragged, and has previous/next buttons.
- **Other sections** — `SectionTransition` scrubs each section in from depth (scale, tilt, blur).

On phones, tablets, touch laptops and reduced-motion visitors nothing is pinned or scroll-scrubbed: the hero is one
aspect-locked "poster" (portrait, outline name, chrome name and badge are positioned in % of the poster so nothing can
collapse; fewer particles, ~30 fps, still disperses as you scroll) and the ring is a swipeable coverflow.
In the light theme the real photo is the base layer and particles only play the intro and the scroll dispersal.
If WebGL is unavailable the hero shows the still cut-out portrait instead.

Assets: `public/images/portrait-cutout*.webp` (background-free portrait the particles are sampled from),
`public/images/logo-mark-*.webp` (transparent gold monogram used in the navbar, footer and preloader),
`public/favicon*.png`, `public/apple-touch-icon.png` and `public/og-image.png`.

## Adaptive quality, fallbacks & reduced motion

`ParticlePortrait` renders only while visible and the tab is active, caps the device pixel ratio, halves the frame rate on
touch devices and falls back to the still portrait on WebGL failure or context loss. `siteConfig.features.hero3D = false`
also forces the still portrait. The global CSS neutralises animations under reduced motion, and `MotionConfig reducedMotion="user"`
is set app-wide.

## Light & dark themes

Tokens are CSS variables in `src/index.css` (`:root` = light, `.dark` = dark), each tuned separately (contrast, borders,
shadows, grain, image overlay; the WebGL palette and lighting also switch). An inline script in `index.html` applies the
stored choice — or the OS preference on first visit — **before paint** (no flash). Choices persist in `localStorage`
(`jas-theme`); OS changes are followed until the visitor picks a theme.

## Editing content

- **Add a project:** `npm run new:project -- my-slug "My Title"`, fill in the file, check it with `npm run dev`, then delete
  its `draft: true` line to publish. The wheel, cards, filters, `/projects/<slug>`, the sitemap and the assistant are all generated.
  Mark stock images `kind: "representative"`; only add `links.repository` / `links.demo` if public and approved.
  Details: `src/content/projects/README.md`.
- **Add experience:** append to `experience` or `education` in `src/content/experience.ts`.
- **Add a skill:** add an item (optionally with `note`) to a group in `src/content/skills.ts`.
- **Guide answers:** edit `src/content/knowledge.ts`. Disable the guide with `features.portfolioGuide = false`.

## Portfolio Guide (honest scope)

A local keyword search over a hand-written knowledge base. It does **not** use an AI model, does not send data
anywhere, stores nothing, and says so when it has no answer.

## Environment variables

None. The project has no secrets.

## AWS deployment & DevOps pipeline

Production is **S3 (private) + CloudFront + ACM + Route 53**, defined entirely in Terraform and
published by GitHub Actions through OIDC (no stored AWS keys). An optional single-node **k3s lab**
runs Argo CD (GitOps), Prometheus and Grafana, and watches the real production site.

Everything — architecture diagram, step-by-step runbook, costs, rollback and troubleshooting — is in
**[infra/README.md](infra/README.md)**.

## Security & privacy checklist

- [x] No API keys, tokens or secrets anywhere in the codebase
- [x] Phone number and street address from the CV are **not** published
- [x] External links use `target="_blank" rel="noopener noreferrer"`; `ExternalLink` only allows `https:`/`mailto:`
- [x] No `dangerouslySetInnerHTML`; all content rendered as text
- [x] No analytics, trackers or cookies; theme preference is the only stored value
- [x] Guide input is length-limited and processed locally only
- [x] No contact form (so no fake submissions); contact uses Gmail compose / mailto / copy
- [x] CloudFront response-headers policy (Terraform) sets HSTS, CSP (report-only first), `X-Frame-Options`, `nosniff`, referrer and permissions policies
- [x] Private repositories are not linked
- [ ] Run `npm audit` before deploying and review advisories (some reported at install time may be dev-only)

### Dependency review

react / react-dom, react-router-dom, motion, three, lucide-react, clsx, tailwind-merge — all widely
used and actively maintained. `vitest` is only for tests. `@types/three` provides types.

## Asset credits & licensing

All photos are from [Pexels](https://www.pexels.com/license/) (free to use, no attribution required — credited anyway):

- Hero placeholder: Daniil Kondrashin; fallback: K H — **placeholders only, they do not depict John.**
- L.I.G.T.A.S. (representative): Engin Akyurt, Arturo A, Magda Ehlers
- KidVerse (representative): Ryutaro Tsukata
- Portfolio (representative): Jakub Zerdzicki

Replace representative images with authentic project photos/screenshots when available. Fonts via Google Fonts (OFL).

## Known limitations & unexecuted checks

- **Multi-file build:** `vite-plugin-singlefile` was removed (it inlined everything, defeated code-splitting and slowed first paint).
  `dist/index.html` must now be served over HTTP (S3/CloudFront, `npm run preview`) — double-clicking it from disk won't work.
- **Browser (clean-URL) routing** is enabled; the host must fall back to `/index.html` (CloudFront Function / nginx.conf do). Set `routerMode: "hash"` in `src/config/site.ts` to run on a host with no rewrite support.
- **Remote images** are served by Pexels' CDN; for full control, download them into `public/images/`.
- **ZIP archive:** the development environment had no shell access, so `John-Aldwin-Samson-Portfolio.zip` could not be
  generated automatically. Create it from the project root, excluding `node_modules` and `dist`:
  `zip -r John-Aldwin-Samson-Portfolio.zip . -x "node_modules/*" "dist/*" ".git/*"`
- **Verified:** the production build (`npm run build`) completes successfully.
- **Not executed in this environment:** `npx vitest run`, `npx tsc --noEmit`, linting, Lighthouse/Core Web Vitals, real
  device touch tests, screen-reader passes and cross-browser testing. Please run these before deployment.
- A `test` npm script was not added because `package.json` was managed by the tooling; use `npx vitest run`.
