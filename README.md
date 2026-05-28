# biczak.dev

Personal site for Alex Biczak. Astro + React islands on Cloudflare Pages.

## Setup

- Requires Node 22+ and pnpm 11+
- `pnpm install`
- `pnpm dev` — local dev server at http://localhost:4321
- `pnpm test` — Vitest unit tests
- `pnpm e2e` — Playwright E2E tests
- `pnpm build` — production build to `dist/`
- `pnpm preview` — serve the production build locally

## Quality gates

- TypeScript strict, no errors (`pnpm typecheck`)
- ESLint clean (`pnpm lint`)
- Prettier formatted (`pnpm format`)
- Unit tests green (`pnpm test`)
- E2E green on Chromium minimum (`pnpm e2e`)
- Lighthouse ≥95 perf/a11y/best-practices, ≥90 SEO

CI runs all of the above on every PR.

## Deploy

Production deploys are managed by Cloudflare Pages, hooked to `main` on this repo.

Manual deploy:

```bash
pnpm build
pnpm exec wrangler pages deploy dist --project-name biczak-site
```

## Architecture

See `docs/superpowers/specs/2026-05-27-personal-website-design.md` for the design spec.
v1.0 ships the site shell + Easing Curve Lab. v1.1–v1.3 add the other three tools.
