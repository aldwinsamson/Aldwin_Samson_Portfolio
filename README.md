# Aldwin Samson — Portfolio
[![CI](https://github.com/aldwinsamson/Aldwin_Samson_Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/aldwinsamson/Aldwin_Samson_Portfolio/actions/workflows/ci.yml)

Personal portfolio of John Aldwin R. Samson, a Computer Engineering graduate focused on cloud infrastructure, DevOps and embedded systems.

**Live site:** [aldwinsamson.com](https://aldwinsamson.com)

A React single-page application in which every page is generated from typed content files. It includes an adaptive WebGL hero, light and dark themes, reduced-motion support, and an assistant that answers questions about the work shown on the site.

## Stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript (strict) |
| Build | Vite 8, code-split routes, lazy-loaded three.js |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Motion and 3D | Motion, three.js, Lenis smooth scroll |
| Routing | react-router-dom v7 |
| Assistant | Local search engine plus a Vercel serverless function calling the Gemini API |
| Tests | Vitest, plus a Node self-test for the chat backend |
| Hosting | Vercel (production); AWS, Terraform and k3s retained as an alternative |
| Telemetry | Vercel Web Analytics and Speed Insights |

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` (see `.nvmrc`).

```bash
npm ci        # install exact versions from package-lock.json
npm run dev   # development server at http://localhost:5173
```

| Command | Purpose |
| --- | --- |
| `npm run build` | Generate the sitemap and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Run the Vitest suite |
| `npm run check` | Typecheck and tests |
| `npm run test:chat` | Chat backend self-test (Gemini is mocked) |
| `npm run build:knowledge` | Regenerate the assistant's knowledge files from `src/content` |
| `npm run check:knowledge` | Fail if either generated knowledge file is out of date |
| `npm run new:project -- <slug> "<Title>"` | Scaffold a new project file |

## Project structure

```
src/
  config/       site.ts (metadata, router mode, feature flags), hero.ts (hero image settings)
  content/      Typed content: profile, experience, skills, projects/, knowledge
  components/   Shared UI and motion primitives
  features/     hero, projects, experience, stack, contact, guide (assistant)
  hooks/        Theme, media queries, device capability, smooth scroll
  pages/        Route-level pages
  styles/       Motion tokens
api/            Vercel serverless function: POST /api/chat
server/chat/    Chat backend core, AWS Lambda adapter, generated knowledge file, self-test
scripts/        Sitemap, project scaffolding, knowledge build, smoke test
tests/          Vitest unit tests
infra/          Terraform for the AWS hosting option
gitops/         Argo CD applications and Kubernetes manifests for the k3s lab
docker/         nginx configuration for the container image
docs/           Hosting runbooks
.github/        Workflows and Dependabot configuration
```

## Editing content

All site content lives in `src/content/`; components do not need to change.

| Task | Location |
| --- | --- |
| Profile, hero copy, contact details | `src/content/profile.ts` |
| Experience, education, honors | `src/content/experience.ts` |
| Skills | `src/content/skills.ts` |
| Projects | `src/content/projects/` ([guide](src/content/projects/README.md)) |
| Hero portrait framing | `src/config/hero.ts` |
| Feature flags | `src/config/site.ts` |

After changing content, regenerate the assistant's knowledge files and commit them:

```bash
npm run build:knowledge
```

CI runs `check:knowledge` and fails if the file is stale.

## Assistant

1. **Local search** (`src/features/guide/`): keyword search over the site content, running in the browser. It is the fallback whenever the API is unavailable.
2. **Gemini API** (`api/chat.mjs`, `server/chat/core.mjs`): answers open-ended questions using only the generated knowledge file (`server/chat/knowledge.generated.mjs`, with a `.txt` copy used by the Vercel function bundle).

The backend enforces an origin allow-list, request size and turn limits, per-IP and global rate limits, per-model timeouts and a fallback chain across models. The API key is read from the server environment and never reaches the client.

### Environment variables

Set these in the Vercel project settings. Never commit them and never prefix them with `VITE_`.

| Name | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | For the assistant | Google AI Studio key. Mark as Sensitive. |
| `GEMINI_MODEL` | No | Force one model; otherwise the built-in fallback chain is used. |
| `ALLOWED_ORIGINS` | No | Extra comma-separated origins allowed to call the API. |
| `RATE_PER_MINUTE`, `RATE_PER_HOUR`, `DAILY_LIMIT` | No | Rate-limit overrides. |
| `CHAT_DEBUG` | No | `true` returns upstream error details. Keep off in production. |

Without a key the site works normally using local search only.

## Deployment

Vercel deploys production on every push to `main`. Build settings, the SPA rewrite and security headers (including a strict Content Security Policy) are defined in `vercel.json`.

The repository also contains a complete AWS implementation (S3, CloudFront, ACM, Route 53, deployed from GitHub Actions through OIDC with no stored keys) and an optional k3s observability lab. Which one serves the domain is controlled by one Terraform setting.

- [infra/README.md](infra/README.md): architecture, runbook and Terraform layout

## Continuous integration

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `ci.yml` | Pull requests, pushes | Typecheck, tests, knowledge freshness, chat self-test, build, `npm audit`, Checkov, Kubernetes manifest validation, dependency review |
| `codeql.yml` | Pushes, pull requests, weekly | CodeQL analysis |
| `terraform.yml` | Changes under `infra/` | Validate, plan on pull requests, apply behind a protected environment |
| `deploy.yml` | Manual | Build, publish to S3, invalidate CloudFront, smoke test |
| `container.yml` | Manual | Build and push the nginx image, update the staging image tag |

## License

The source code is released under the [MIT License](LICENSE). The written content, photographs, logos and project material in `src/content/` and `public/` are © 2026 John Aldwin R. Samson, all rights reserved, and are not covered by that licence.

## Credits

Project images in `public/images/` are the author's own. Fonts are served by Google Fonts under the SIL Open Font License.
