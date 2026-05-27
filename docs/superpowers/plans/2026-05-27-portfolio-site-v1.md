# Portfolio Site v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1.0 of `biczak.dev` — an Astro static site (hero, about, work history, contact, tools gallery) plus the Easing Curve Lab interactive React island — deployed on Cloudflare Pages with CI, analytics, and the full quality bar (Lighthouse ≥95 perf/a11y/best-practices, axe-clean, E2E green).

**Architecture:** Astro 5 static-first with React 18 islands. Tailwind CSS 4 for styling. Each tool is a self-contained React island under `src/tools/<name>/` with its own state and tests. Site shell is pure Astro (zero client JS on non-tool pages). Pure logic (bezier math, exporters, URL state) lives in plain TS modules separate from React components, enabling strict Vitest TDD on the logic and lighter Playwright smoke coverage on the UI.

**Tech Stack:** Astro 5, React 18, TypeScript (strict), Tailwind CSS 4, Vitest, Playwright, ESLint, Prettier, pnpm, Cloudflare Pages, Cloudflare Web Analytics, GitHub Actions.

**Reference spec:** `docs/superpowers/specs/2026-05-27-personal-website-design.md`

---

## File Structure (target by end of plan)

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                                   GitHub Actions CI pipeline
├── .gitignore                                       (exists)
├── astro.config.mjs                                 Astro config (Tailwind, React, CF adapter)
├── package.json                                     Dependencies and scripts
├── pnpm-lock.yaml                                   Lockfile
├── tsconfig.json                                    Strict TS config
├── .eslintrc.cjs                                    ESLint config
├── .prettierrc                                      Prettier config
├── playwright.config.ts                             Playwright config
├── vitest.config.ts                                 Vitest config
├── public/
│   ├── favicon.svg                                  Placeholder favicon (replace pre-launch)
│   ├── og-image.png                                 Placeholder OG image (replace pre-launch)
│   └── _headers                                     Cloudflare Pages headers (security/caching)
├── src/
│   ├── design-system/
│   │   ├── tokens.ts                                Color/duration/spacing as TS exports
│   │   ├── motion.ts                                Easings, springs, reduced-motion helper
│   │   └── styles/
│   │       └── global.css                           CSS reset, font imports, CSS variables
│   ├── components/
│   │   ├── Header.astro                             Top nav (logo, links)
│   │   ├── Footer.astro                             Bottom (copyright, social, view-source)
│   │   ├── GradientText.astro                       Italic gradient text component
│   │   ├── HeroSection.astro                        Landing hero
│   │   ├── AboutSection.astro                       Landing about
│   │   ├── WorkHistorySection.astro                 Landing work history
│   │   ├── ContactSection.astro                     Landing contact
│   │   └── ToolCard.astro                           Tool gallery card
│   ├── content/
│   │   └── site.ts                                  Centralized content (placeholders for now)
│   ├── layouts/
│   │   └── BaseLayout.astro                         Root HTML/meta/theme
│   ├── pages/
│   │   ├── index.astro                              / — Landing
│   │   └── tools/
│   │       ├── index.astro                          /tools — Gallery
│   │       └── easing.astro                         /tools/easing — Lab island host
│   ├── tools/
│   │   └── easing/
│   │       ├── EasingLab.tsx                        Top-level React island
│   │       ├── CurveEditor.tsx                      SVG bezier editor
│   │       ├── AnimationPlayground.tsx              Multi-target animation
│   │       ├── PresetStrip.tsx                      Preset buttons
│   │       ├── CompareToggle.tsx                    Ghost-overlay toggle
│   │       ├── ExportPanel.tsx                      Generated code + copy buttons
│   │       ├── useURLState.ts                       URL hash sync
│   │       ├── useRAFAnimation.ts                   Single rAF loop
│   │       ├── bezier.ts                            Pure bezier math
│   │       ├── presets.ts                           Named easings
│   │       ├── exporters.ts                         Code generators
│   │       ├── url-state.ts                         Hash encode/decode
│   │       └── types.ts                             Shared types
│   └── lib/
│       └── reduced-motion.ts                        Prefers-reduced-motion helper
├── tests/
│   ├── unit/
│   │   ├── bezier.test.ts
│   │   ├── presets.test.ts
│   │   ├── exporters.test.ts
│   │   └── url-state.test.ts
│   └── e2e/
│       ├── landing.spec.ts
│       ├── tools-gallery.spec.ts
│       └── easing-lab.spec.ts
└── README.md                                        Setup / scripts / deploy notes
```

**Decomposition principles applied:**
- Pure logic (`bezier.ts`, `presets.ts`, `exporters.ts`, `url-state.ts`) is isolated from React components so it can be TDD'd with Vitest without DOM mocking.
- Each React component has one clear responsibility (curve editor, animation playground, preset strip, etc.).
- The `EasingLab.tsx` orchestrator is the only component that knows about *all* the others; siblings communicate only by props.
- Site content lives in `src/content/site.ts` — a single source of truth that's easy to swap pre-launch.

---

## Milestones (read at start, not separate tasks)

1. **Tasks 1–3** — Project scaffolding, dev server runs.
2. **Tasks 4–7** — Design system foundation + global styles.
3. **Tasks 8–11** — Site shell + landing page.
4. **Task 12** — Tools gallery.
5. **Tasks 13–16** — Easing Lab pure logic (full TDD).
6. **Tasks 17–22** — Easing Lab React components.
7. **Tasks 23–25** — Easing Lab assembly + a11y + reduced-motion.
8. **Tasks 26–28** — E2E tests + CI workflow + Lighthouse.
9. **Tasks 29–31** — Cloudflare Pages deploy + DNS + Web Analytics.

Each task ends with a commit. After Task 31, v1.0 is live.

---

## Task 1: Initialize Astro Project with React + Tailwind

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Initialize pnpm project**

Run from project root:
```bash
pnpm init
```

- [ ] **Step 2: Install Astro, React, Tailwind, and their integrations**

Tailwind v4 dropped the classic `@astrojs/tailwind` integration (which only supported v3). The supported v4 path for Astro is the `@tailwindcss/vite` plugin registered directly in the Vite config — no Astro-specific integration package needed.

```bash
pnpm add astro@^5 react@^18 react-dom@^18 @types/react@^18 @types/react-dom@^18
pnpm add @astrojs/react tailwindcss@^4 @tailwindcss/vite@^4
pnpm add -D typescript@^5 @types/node
```

- [ ] **Step 3: Create `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://biczak.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: 'lightningcss' },
  },
});
```

- [ ] **Step 4: Create `tsconfig.json` with strict mode**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  },
  "include": ["src/**/*", "tests/**/*", "astro.config.mjs"]
}
```

- [ ] **Step 5: Add scripts to `package.json`**

Edit `package.json` and replace the `"scripts"` section with:
```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "typecheck": "astro check && tsc --noEmit"
}
```

- [ ] **Step 6: Create placeholder homepage**

Create `src/pages/index.astro`:
```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>biczak.dev</title>
  </head>
  <body>
    <h1>Hello</h1>
  </body>
</html>
```

- [ ] **Step 7: Verify dev server starts**

Run: `pnpm dev`
Expected: Output includes `Local   http://localhost:4321/` and the page renders "Hello" in the browser. Stop the server with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project with React + Tailwind"
```

---

## Task 2: Configure ESLint, Prettier, and Vitest

**Files:**
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `vitest.config.ts`
- Create: `tests/unit/.gitkeep`
- Modify: `package.json` (add lint/test scripts and deps)

- [ ] **Step 1: Install ESLint, Prettier, and Vitest**

```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-astro eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier prettier-plugin-astro vitest @vitest/coverage-v8 happy-dom
```

- [ ] **Step 2: Create `.eslintrc.cjs`**

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:astro/recommended',
  ],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser', extraFileExtensions: ['.astro'] },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    coverage: { reporter: ['text', 'html'] },
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

Add inside `"scripts"`:
```json
"lint": "eslint --ext .ts,.tsx,.astro src tests",
"format": "prettier --write \"**/*.{ts,tsx,astro,md,json}\"",
"format:check": "prettier --check \"**/*.{ts,tsx,astro,md,json}\"",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Create placeholder test directory**

```bash
mkdir -p tests/unit tests/e2e
echo "" > tests/unit/.gitkeep
```

- [ ] **Step 7: Verify lint and test commands run**

```bash
pnpm lint
pnpm test
```
Expected: `pnpm lint` reports no errors (may report 0 files matched). `pnpm test` reports "No test files found" — this is fine.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: add eslint, prettier, and vitest configuration"
```

---

## Task 3: Install Playwright and Configure E2E

**Files:**
- Create: `playwright.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium firefox webkit
```

- [ ] **Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
    { name: 'mobile-chrome', use: devices['Pixel 7'] },
    { name: 'mobile-safari', use: devices['iPhone 14'] },
  ],
});
```

- [ ] **Step 3: Add E2E scripts to `package.json`**

```json
"e2e": "playwright test",
"e2e:ui": "playwright test --ui"
```

- [ ] **Step 4: Verify Playwright is wired**

Run: `pnpm exec playwright --version`
Expected: Prints a version (e.g., `Version 1.x.x`).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure Playwright E2E"
```

---

## Task 4: Design System Tokens

**Files:**
- Create: `src/design-system/tokens.ts`
- Create: `tests/unit/tokens.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/tokens.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { colors, durations, easings } from '@/design-system/tokens';

describe('design tokens', () => {
  it('exposes the Voltage palette', () => {
    expect(colors.ink).toBe('#07091a');
    expect(colors.paper).toBe('#e5e7ff');
    expect(colors.cyan).toBe('#22d3ee');
    expect(colors.violet).toBe('#8b5cf6');
    expect(colors.rose).toBe('#ec4899');
    expect(colors.graphite).toBe('#14171f');
  });

  it('exposes the duration scale', () => {
    expect(durations.flash).toBe(80);
    expect(durations.quick).toBe(180);
    expect(durations.base).toBe(320);
    expect(durations.slow).toBe(560);
  });

  it('exposes house easings', () => {
    expect(easings.entrance).toEqual([0.2, 0.7, 0.1, 1]);
    expect(easings.spring).toEqual({ stiffness: 400, damping: 30 });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '@/design-system/tokens'`.

- [ ] **Step 3: Create tokens module**

Create `src/design-system/tokens.ts`:
```typescript
export const colors = {
  ink: '#07091a',
  paper: '#e5e7ff',
  cyan: '#22d3ee',
  violet: '#8b5cf6',
  rose: '#ec4899',
  graphite: '#14171f',
} as const;

export const durations = {
  flash: 80,
  quick: 180,
  base: 320,
  slow: 560,
} as const;

export const easings = {
  entrance: [0.2, 0.7, 0.1, 1] as const,
  spring: { stiffness: 400, damping: 30 } as const,
};

export const gradient = `linear-gradient(95deg, ${colors.cyan} 0%, ${colors.violet} 55%, ${colors.rose} 100%)`;

export type ColorToken = keyof typeof colors;
export type DurationToken = keyof typeof durations;
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(design-system): add Voltage palette, duration, and easing tokens"
```

---

## Task 5: Global CSS, Fonts, and CSS Variables

Tailwind v4 uses CSS-first config — theme tokens are declared in an `@theme` block inside the global CSS file. There is no `tailwind.config.ts` in this project. Color tokens defined in `@theme` automatically generate utilities like `bg-ink`, `text-paper`, `font-display`, etc.

**Files:**
- Create: `src/design-system/styles/global.css`

- [ ] **Step 1: Create `src/design-system/styles/global.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@import "tailwindcss";

@theme {
  --color-ink: #07091a;
  --color-paper: #e5e7ff;
  --color-cyan: #22d3ee;
  --color-violet: #8b5cf6;
  --color-rose: #ec4899;
  --color-graphite: #14171f;

  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-sans: Inter, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --duration-flash: 80ms;
  --duration-quick: 180ms;
  --duration-base: 320ms;
  --duration-slow: 560ms;

  --ease-entrance: cubic-bezier(0.2, 0.7, 0.1, 1);
}

@layer base {
  :root {
    --gradient: linear-gradient(95deg, var(--color-cyan) 0%, var(--color-violet) 55%, var(--color-rose) 100%);
    color-scheme: dark light;
  }

  html {
    background: var(--color-ink);
    color: var(--color-paper);
    font-family: var(--font-sans);
    font-feature-settings: 'cv11', 'ss01';
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    margin: 0;
    min-height: 100vh;
  }

  ::selection {
    background: var(--color-violet);
    color: var(--color-paper);
  }

  *:focus-visible {
    outline: 2px solid var(--color-cyan);
    outline-offset: 3px;
    border-radius: 2px;
  }
}

@layer components {
  .gradient-text {
    background: var(--gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
    padding: 0.1em 0.2em 0.1em 0.05em;
    margin: -0.1em -0.2em -0.1em -0.05em;
    font-style: italic;
    font-weight: 500;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Verify the styles compile**

Modify `src/pages/index.astro` temporarily to import the styles and use a sample utility:
```astro
---
import '@/design-system/styles/global.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>biczak.dev</title>
  </head>
  <body class="bg-ink text-paper">
    <h1 class="font-display text-6xl">
      Type that <em class="gradient-text">moves</em>.
    </h1>
  </body>
</html>
```

Run: `pnpm build`
Expected: build completes without errors. The built CSS in `dist/` should contain rules for `.bg-ink`, `.text-paper`, `.font-display`, and `.gradient-text`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(design-system): add global CSS, fonts, and gradient-text utility"
```

---

## Task 6: Motion Primitives Module

**Files:**
- Create: `src/design-system/motion.ts`
- Create: `src/lib/reduced-motion.ts`
- Create: `tests/unit/motion.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/unit/motion.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { cssEase, prefersReducedMotionMediaQuery } from '@/design-system/motion';

describe('motion primitives', () => {
  it('formats a 4-tuple as CSS cubic-bezier', () => {
    expect(cssEase([0.2, 0.7, 0.1, 1])).toBe('cubic-bezier(0.2, 0.7, 0.1, 1)');
  });

  it('rounds to 3 decimals to avoid float noise', () => {
    expect(cssEase([0.1234567, 0.5, 0.5, 0.9876543])).toBe(
      'cubic-bezier(0.123, 0.5, 0.5, 0.988)',
    );
  });

  it('exposes the reduced-motion media query string', () => {
    expect(prefersReducedMotionMediaQuery).toBe('(prefers-reduced-motion: reduce)');
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Create motion module**

Create `src/design-system/motion.ts`:
```typescript
export type BezierTuple = readonly [number, number, number, number];

export const prefersReducedMotionMediaQuery = '(prefers-reduced-motion: reduce)';

export function cssEase(curve: BezierTuple): string {
  const [a, b, c, d] = curve.map((n) => Math.round(n * 1000) / 1000);
  return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}
```

Create `src/lib/reduced-motion.ts`:
```typescript
import { prefersReducedMotionMediaQuery } from '@/design-system/motion';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(prefersReducedMotionMediaQuery).matches;
}

export function subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(prefersReducedMotionMediaQuery);
  const listener = (e: MediaQueryListEvent) => callback(e.matches);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(design-system): add motion primitives and reduced-motion helper"
```

---

## Task 7: BaseLayout, GradientText, and Content Source

**Files:**
- Create: `src/content/site.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/GradientText.astro`

- [ ] **Step 1: Create content source**

Create `src/content/site.ts`:
```typescript
export const site = {
  name: 'Alex Biczak',
  shortName: 'Alex Biczak',
  tagline: 'I build the interesting bits — frontend at the seam of motion, color, and interaction.',
  bio: [
    'Senior frontend engineer with experience across React, other modern frameworks, and the parts of the platform that make interfaces feel alive — motion, 3D, real-time canvas, accessible color.',
    'I care about the craft. The site you are reading is part of the work sample — every interaction here was designed and built with the same attention I bring to client projects.',
  ],
  email: 'alex@biczak.dev',
  socials: [
    { label: 'GitHub', href: 'https://github.com/alexbiczak' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/alexbiczak' },
  ],
  workHistory: [
    {
      company: 'Placeholder Co.',
      role: 'Senior Frontend Engineer',
      dates: '2024 — Present',
      detail: 'One to two lines describing scope, impact, and tech.',
    },
    {
      company: 'Earlier Co.',
      role: 'Frontend Engineer',
      dates: '2021 — 2024',
      detail: 'One to two lines describing scope, impact, and tech.',
    },
  ],
  tools: [
    {
      slug: 'easing',
      name: 'Easing Curve Lab',
      summary: 'Design and feel custom cubic-bezier easings across five animated targets at once.',
      skills: 'Animation · UX · CSS',
      available: true,
    },
    {
      slug: 'audio',
      name: 'Audio-Reactive Canvas',
      summary: 'Web Audio FFT into a canvas visualization with real-time controls.',
      skills: 'WebAudio · Canvas · Perf',
      available: false,
    },
    {
      slug: 'palette',
      name: 'AI Mood Palette',
      summary: 'Type a mood, stream a 5-color palette with evocative names. Rate-limited demo.',
      skills: 'AI · Color · Streaming',
      available: false,
    },
    {
      slug: 'type',
      name: '3D Type Playground',
      summary: 'Variable font axes bound to mouse and scroll, exportable as a poster.',
      skills: 'WebGL · Typography · Motion',
      available: false,
    },
  ],
  repo: 'https://github.com/alexbiczak/biczak.dev',
} as const;

export type SiteContent = typeof site;
```

> CONTENT NOTE: All copy in this file is placeholder. Alex fills in actual content pre-launch (see "Pre-Launch Checklist" in the spec). Email and GitHub username are placeholders — these specific values must be replaced before the site goes live.

- [ ] **Step 2: Create `BaseLayout.astro`**

Create `src/layouts/BaseLayout.astro`:
```astro
---
import '@/design-system/styles/global.css';
import { site } from '@/content/site';

interface Props {
  title?: string;
  description?: string;
  themeMode?: 'light' | 'dark';
}

const {
  title = site.name,
  description = site.tagline,
  themeMode = 'dark',
} = Astro.props;

const fullTitle = title === site.name ? site.name : `${title} — ${site.name}`;
---
<!doctype html>
<html lang="en" data-theme={themeMode}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={Astro.url.href} />
    <meta property="og:image" content="/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="canonical" href={Astro.url.href} />
    <title>{fullTitle}</title>
  </head>
  <body class="min-h-screen bg-ink text-paper antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Create `GradientText.astro`**

Create `src/components/GradientText.astro`:
```astro
---
interface Props {
  as?: 'span' | 'em';
  class?: string;
}

const { as: Tag = 'em', class: className = '' } = Astro.props;
---
<Tag class={`gradient-text ${className}`}>
  <slot />
</Tag>
```

- [ ] **Step 4: Verify BaseLayout renders**

Modify `src/pages/index.astro`:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import GradientText from '@/components/GradientText.astro';
---
<BaseLayout>
  <main class="p-12">
    <h1 class="font-display text-6xl">
      Hi, I build the <GradientText>interesting</GradientText> bits.
    </h1>
  </main>
</BaseLayout>
```

Run: `pnpm dev`
Expected: page renders with dark background, large display headline, gradient italic "interesting" with no clipping. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(site): add BaseLayout, GradientText, and content source"
```

---

## Task 8: Header and Footer Components

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `Header.astro`**

Create `src/components/Header.astro`:
```astro
---
import { site } from '@/content/site';
---
<header class="sticky top-0 z-40 backdrop-blur-md bg-ink/70 border-b border-paper/5">
  <nav class="mx-auto max-w-6xl flex items-center justify-between px-6 py-4 font-mono text-xs">
    <a href="/" class="hover:text-cyan transition-colors duration-quick" aria-label="Home">
      <span class="opacity-60">~/</span><span>{site.shortName.toLowerCase().replace(' ', '-')}</span>
    </a>
    <ul class="flex gap-6">
      <li><a href="/#about" class="hover:text-cyan transition-colors duration-quick">about</a></li>
      <li><a href="/tools" class="hover:text-cyan transition-colors duration-quick">tools</a></li>
      <li><a href="/#contact" class="hover:text-cyan transition-colors duration-quick">contact</a></li>
    </ul>
  </nav>
</header>
```

- [ ] **Step 2: Create `Footer.astro`**

Create `src/components/Footer.astro`:
```astro
---
import { site } from '@/content/site';

interface Props {
  sourcePath?: string;
}

const { sourcePath } = Astro.props;
const sourceUrl = sourcePath ? `${site.repo}/tree/main/${sourcePath}` : null;
const year = new Date().getFullYear();
---
<footer class="border-t border-paper/5 mt-32">
  <div class="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between font-mono text-xs opacity-70">
    <p>© {year} {site.name}</p>
    <div class="flex gap-4">
      {sourceUrl && (
        <a href={sourceUrl} class="hover:text-cyan transition-colors duration-quick" rel="noopener">view source ↗</a>
      )}
      <a href={site.repo} class="hover:text-cyan transition-colors duration-quick" rel="noopener">github ↗</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Update landing page to use Header/Footer**

Modify `src/pages/index.astro`:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import GradientText from '@/components/GradientText.astro';
---
<BaseLayout>
  <Header />
  <main class="mx-auto max-w-6xl px-6 py-24">
    <h1 class="font-display text-6xl md:text-8xl leading-[1] tracking-[-0.04em]">
      Hi, I build the <GradientText>interesting</GradientText> bits.
    </h1>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 4: Verify in dev server**

Run: `pnpm dev`
Expected: sticky header at the top, large headline, footer at the bottom with copyright and github link. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(site): add Header and Footer components"
```

---

## Task 9: Landing Page Section Components

**Files:**
- Create: `src/components/HeroSection.astro`
- Create: `src/components/AboutSection.astro`
- Create: `src/components/WorkHistorySection.astro`
- Create: `src/components/ContactSection.astro`

- [ ] **Step 1: Create `HeroSection.astro`**

Create `src/components/HeroSection.astro`:
```astro
---
import { site } from '@/content/site';
import GradientText from './GradientText.astro';

const [taglineHead, taglineTail] = site.tagline.split(' — ');
---
<section class="mx-auto max-w-6xl px-6 pt-32 pb-24 md:pt-48 md:pb-32">
  <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-8">
    Portfolio / 2026
  </p>
  <h1 class="font-display font-bold text-5xl md:text-7xl lg:text-[88px] leading-[1] tracking-[-0.04em] max-w-5xl">
    Hi, I build the <GradientText>interesting</GradientText> bits.
  </h1>
  <p class="mt-8 max-w-2xl text-lg md:text-xl opacity-75 leading-relaxed">
    {taglineHead}{taglineTail && <> — {taglineTail}</>}
  </p>
  <a
    href="/tools"
    class="inline-flex items-center gap-2 mt-12 px-5 py-3 rounded-full border border-paper/20 hover:border-cyan hover:text-cyan transition-colors duration-base font-mono text-sm"
  >
    See the tools <span aria-hidden="true">↓</span>
  </a>
</section>
```

- [ ] **Step 2: Create `AboutSection.astro`**

Create `src/components/AboutSection.astro`:
```astro
---
import { site } from '@/content/site';
---
<section id="about" class="mx-auto max-w-6xl px-6 py-24 border-t border-paper/5">
  <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">About</p>
  <div class="grid md:grid-cols-12 gap-8">
    <h2 class="md:col-span-4 font-display text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em]">
      A little about me.
    </h2>
    <div class="md:col-span-7 md:col-start-6 space-y-5 text-lg leading-relaxed opacity-85">
      {site.bio.map((paragraph) => <p>{paragraph}</p>)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create `WorkHistorySection.astro`**

Create `src/components/WorkHistorySection.astro`:
```astro
---
import { site } from '@/content/site';
---
<section id="work" class="mx-auto max-w-6xl px-6 py-24 border-t border-paper/5">
  <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">Work</p>
  <h2 class="font-display text-3xl md:text-4xl leading-[1.05] tracking-[-0.02em] mb-12">
    Where I've shipped.
  </h2>
  <ol class="space-y-10">
    {site.workHistory.map((entry) => (
      <li class="grid md:grid-cols-12 gap-4 md:gap-8 items-baseline border-t border-paper/5 pt-6">
        <p class="md:col-span-3 font-mono text-xs opacity-60">{entry.dates}</p>
        <div class="md:col-span-9">
          <h3 class="font-display text-xl md:text-2xl">
            <span class="font-medium">{entry.role}</span>
            <span class="opacity-50"> · </span>
            <span>{entry.company}</span>
          </h3>
          <p class="mt-2 opacity-75 max-w-2xl">{entry.detail}</p>
        </div>
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 4: Create `ContactSection.astro`**

Create `src/components/ContactSection.astro`:
```astro
---
import { site } from '@/content/site';
import GradientText from './GradientText.astro';
---
<section id="contact" class="mx-auto max-w-6xl px-6 py-24 border-t border-paper/5">
  <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">Contact</p>
  <h2 class="font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.03em] max-w-3xl">
    Let's <GradientText>talk</GradientText>.
  </h2>
  <p class="mt-6 max-w-2xl opacity-75 text-lg">
    I'm open to senior frontend / UI engineering roles. Drop me a line.
  </p>
  <div class="mt-10 flex flex-wrap gap-3">
    <a
      href={`mailto:${site.email}`}
      class="px-5 py-3 rounded-full bg-paper text-ink hover:bg-cyan transition-colors duration-base font-mono text-sm"
    >
      {site.email}
    </a>
    {site.socials.map((social) => (
      <a
        href={social.href}
        class="px-5 py-3 rounded-full border border-paper/20 hover:border-cyan hover:text-cyan transition-colors duration-base font-mono text-sm"
        rel="noopener"
      >
        {social.label} ↗
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 5: Wire sections into the landing page**

Replace `src/pages/index.astro` contents:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import HeroSection from '@/components/HeroSection.astro';
import AboutSection from '@/components/AboutSection.astro';
import WorkHistorySection from '@/components/WorkHistorySection.astro';
import ContactSection from '@/components/ContactSection.astro';
---
<BaseLayout>
  <Header />
  <main>
    <HeroSection />
    <AboutSection />
    <WorkHistorySection />
    <ContactSection />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 6: Verify the landing page renders**

Run: `pnpm dev` and visit http://localhost:4321/
Expected: Hero with gradient "interesting", scrolls to About, then Work History (two placeholder entries), then Contact with mailto button. Stop with Ctrl+C.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(site): add landing page sections (hero, about, work, contact)"
```

---

## Task 10: Tool Card Component

**Files:**
- Create: `src/components/ToolCard.astro`

- [ ] **Step 1: Create `ToolCard.astro`**

Create `src/components/ToolCard.astro`:
```astro
---
interface Props {
  slug: string;
  name: string;
  summary: string;
  skills: string;
  available: boolean;
}

const { slug, name, summary, skills, available } = Astro.props;
const href = available ? `/tools/${slug}` : null;
const Tag = href ? 'a' : 'div';
---
<Tag
  href={href}
  class:list={[
    'group block relative rounded-2xl border border-paper/10 bg-graphite p-8 overflow-hidden',
    'transition-all duration-base ease-entrance',
    available && 'hover:border-cyan/40 hover:-translate-y-1',
    !available && 'opacity-50 cursor-not-allowed',
  ]}
  aria-disabled={!available ? 'true' : undefined}
>
  <div class="flex items-start justify-between gap-4">
    <div>
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">
        {skills}
      </p>
      <h3 class="font-display text-2xl font-semibold leading-tight">
        {name}
      </h3>
      <p class="mt-3 opacity-75 leading-relaxed max-w-md">{summary}</p>
    </div>
    {available && (
      <span aria-hidden="true" class="text-2xl opacity-40 group-hover:opacity-100 group-hover:text-cyan transition-all duration-base">→</span>
    )}
    {!available && (
      <span class="font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 border border-paper/10 rounded-full">soon</span>
    )}
  </div>
</Tag>
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(site): add ToolCard component"
```

---

## Task 11: Tools Gallery Page

**Files:**
- Create: `src/pages/tools/index.astro`

- [ ] **Step 1: Create `tools/index.astro`**

Create `src/pages/tools/index.astro`:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import ToolCard from '@/components/ToolCard.astro';
import GradientText from '@/components/GradientText.astro';
import { site } from '@/content/site';
---
<BaseLayout title="Tools" description="Four interactive tools built as code samples.">
  <Header />
  <main class="mx-auto max-w-6xl px-6 pt-32 pb-24">
    <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">Tools</p>
    <h1 class="font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.03em] max-w-4xl">
      Four small things. <GradientText>Made carefully.</GradientText>
    </h1>
    <p class="mt-6 max-w-2xl opacity-75 text-lg">
      Each tool is a self-contained code sample, shipping on its own schedule. Source is open — every card links to its directory on GitHub.
    </p>
    <div class="mt-16 grid md:grid-cols-2 gap-6">
      {site.tools.map((tool) => (
        <ToolCard
          slug={tool.slug}
          name={tool.name}
          summary={tool.summary}
          skills={tool.skills}
          available={tool.available}
        />
      ))}
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Verify the gallery renders**

Run: `pnpm dev` and visit http://localhost:4321/tools
Expected: 2×2 grid of tool cards. Easing Curve Lab is available (hover effect, → arrow). Three others are dimmed with "soon" pill. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(site): add /tools gallery page"
```

---

## Task 12: Easing Lab — Shared Types

**Files:**
- Create: `src/tools/easing/types.ts`

- [ ] **Step 1: Create shared types**

Create `src/tools/easing/types.ts`:
```typescript
import type { BezierTuple } from '@/design-system/motion';

export type { BezierTuple };

export type PresetName =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'expo-in'
  | 'expo-out'
  | 'circ-in-out'
  | 'back-out'
  | 'quart-in-out';

export interface Preset {
  name: PresetName;
  label: string;
  curve: BezierTuple;
}

export type AnimationTarget = 'translate' | 'scale' | 'stagger' | 'color' | 'rotate';

export interface EasingState {
  curve: BezierTuple;
  duration: number; // ms
  target: AnimationTarget;
  compare: PresetName | null;
}

export const DEFAULT_STATE: EasingState = {
  curve: [0.2, 0.7, 0.1, 1] as const,
  duration: 800,
  target: 'translate',
  compare: null,
};
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add shared types"
```

---

## Task 13: Easing Lab — Bezier Math (TDD)

**Files:**
- Create: `src/tools/easing/bezier.ts`
- Create: `tests/unit/bezier.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/bezier.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { bezierY, sampleCurve } from '@/tools/easing/bezier';

describe('bezier math', () => {
  describe('bezierY', () => {
    it('returns 0 at t=0 for any curve', () => {
      expect(bezierY([0.2, 0.7, 0.1, 1], 0)).toBe(0);
      expect(bezierY([0, 0, 1, 1], 0)).toBe(0);
    });

    it('returns 1 at t=1 for any curve', () => {
      expect(bezierY([0.2, 0.7, 0.1, 1], 1)).toBe(1);
      expect(bezierY([0, 0, 1, 1], 1)).toBe(1);
    });

    it('linear curve maps t to t', () => {
      expect(bezierY([0, 0, 1, 1], 0.25)).toBeCloseTo(0.25, 2);
      expect(bezierY([0, 0, 1, 1], 0.5)).toBeCloseTo(0.5, 2);
      expect(bezierY([0, 0, 1, 1], 0.75)).toBeCloseTo(0.75, 2);
    });

    it('ease-in curve outputs less than t for t in (0,1)', () => {
      const easeIn: [number, number, number, number] = [0.42, 0, 1, 1];
      expect(bezierY(easeIn, 0.5)).toBeLessThan(0.5);
    });

    it('ease-out curve outputs more than t for t in (0,1)', () => {
      const easeOut: [number, number, number, number] = [0, 0, 0.58, 1];
      expect(bezierY(easeOut, 0.5)).toBeGreaterThan(0.5);
    });

    it('clamps inputs outside [0,1]', () => {
      expect(bezierY([0.2, 0.7, 0.1, 1], -0.5)).toBe(0);
      expect(bezierY([0.2, 0.7, 0.1, 1], 1.5)).toBe(1);
    });
  });

  describe('sampleCurve', () => {
    it('produces N+1 samples spanning [0,1]', () => {
      const samples = sampleCurve([0.2, 0.7, 0.1, 1], 10);
      expect(samples).toHaveLength(11);
      expect(samples[0]).toEqual([0, 0]);
      expect(samples[10]?.[0]).toBe(1);
      expect(samples[10]?.[1]).toBe(1);
    });

    it('returns monotonically increasing X values', () => {
      const samples = sampleCurve([0.2, 0.7, 0.1, 1], 50);
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]![0]).toBeGreaterThanOrEqual(samples[i - 1]![0]);
      }
    });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement bezier math**

Create `src/tools/easing/bezier.ts`:
```typescript
import type { BezierTuple } from './types';

/**
 * Compute Y of a cubic-bezier ease (P0=(0,0), P3=(1,1)) given a normalized progress t in [0,1].
 * For CSS-style easings, t IS the parameter — we solve for the X coordinate matching t,
 * then return the Y at that coordinate. Standard browser implementation pattern.
 */
export function bezierY(curve: BezierTuple, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped === 0) return 0;
  if (clamped === 1) return 1;

  const [x1, y1, x2, y2] = curve;
  const param = solveParamForX(clamped, x1, x2);
  return cubicBezier(param, y1, y2);
}

/**
 * Sample N+1 evenly-spaced points along the curve, returning [x, y] pairs.
 * Useful for SVG path drawing.
 */
export function sampleCurve(curve: BezierTuple, steps: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push([t, bezierY(curve, t)]);
  }
  return out;
}

// --- internals ---

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * t * p1 +
    3 * oneMinusT * t * t * p2 +
    t * t * t
  );
}

function cubicBezierDerivative(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * p1 +
    6 * oneMinusT * t * (p2 - p1) +
    3 * t * t * (1 - p2)
  );
}

function solveParamForX(x: number, x1: number, x2: number): number {
  let t = x;
  for (let i = 0; i < 8; i++) {
    const fx = cubicBezier(t, x1, x2) - x;
    if (Math.abs(fx) < 1e-6) return t;
    const dfx = cubicBezierDerivative(t, x1, x2);
    if (Math.abs(dfx) < 1e-6) break;
    t -= fx / dfx;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 32; i++) {
    const fx = cubicBezier(t, x1, x2) - x;
    if (Math.abs(fx) < 1e-6) return t;
    if (fx > 0) hi = t;
    else lo = t;
    t = (lo + hi) / 2;
  }
  return t;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test`
Expected: PASS, all bezier tests green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(easing): add bezier math module with newton/bisection solver"
```

---

## Task 14: Easing Lab — Presets (TDD)

**Files:**
- Create: `src/tools/easing/presets.ts`
- Create: `tests/unit/presets.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/presets.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { PRESETS, getPreset } from '@/tools/easing/presets';

describe('easing presets', () => {
  it('exposes a non-empty list of presets', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it('each preset has a 4-tuple curve with values in [-1, 2]', () => {
    for (const preset of PRESETS) {
      expect(preset.curve).toHaveLength(4);
      for (const v of preset.curve) {
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(2);
      }
    }
  });

  it('every preset name is unique', () => {
    const names = PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('linear is [0, 0, 1, 1]', () => {
    expect(getPreset('linear')?.curve).toEqual([0, 0, 1, 1]);
  });

  it('getPreset returns undefined for unknown name', () => {
    // @ts-expect-error testing runtime safety
    expect(getPreset('bogus')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement presets**

Create `src/tools/easing/presets.ts`:
```typescript
import type { Preset, PresetName, BezierTuple } from './types';

export const PRESETS: readonly Preset[] = [
  { name: 'linear', label: 'linear', curve: [0, 0, 1, 1] },
  { name: 'ease', label: 'ease', curve: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-in', label: 'ease-in', curve: [0.42, 0, 1, 1] },
  { name: 'ease-out', label: 'ease-out', curve: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', label: 'ease-in-out', curve: [0.42, 0, 0.58, 1] },
  { name: 'expo-in', label: 'expo in', curve: [0.7, 0, 0.84, 0] },
  { name: 'expo-out', label: 'expo out', curve: [0.16, 1, 0.3, 1] },
  { name: 'circ-in-out', label: 'circ in-out', curve: [0.85, 0, 0.15, 1] },
  { name: 'back-out', label: 'back out', curve: [0.34, 1.56, 0.64, 1] },
  { name: 'quart-in-out', label: 'quart in-out', curve: [0.76, 0, 0.24, 1] },
] as const;

const lookup = new Map<string, Preset>(PRESETS.map((p) => [p.name, p]));

export function getPreset(name: PresetName): Preset | undefined {
  return lookup.get(name);
}

export function getPresetCurve(name: PresetName): BezierTuple | undefined {
  return lookup.get(name)?.curve;
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(easing): add named preset library"
```

---

## Task 15: Easing Lab — Exporters (TDD)

**Files:**
- Create: `src/tools/easing/exporters.ts`
- Create: `tests/unit/exporters.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/exporters.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { exportCSS, exportJS, exportMotion, exportSCSS } from '@/tools/easing/exporters';

const CURVE = [0.2, 0.7, 0.1, 1] as const;

describe('exporters', () => {
  it('exportCSS produces a transition-timing-function declaration', () => {
    expect(exportCSS(CURVE)).toBe('transition-timing-function: cubic-bezier(0.2, 0.7, 0.1, 1);');
  });

  it('exportJS produces a cubic-bezier function call', () => {
    expect(exportJS(CURVE)).toBe('cubic-bezier(0.2, 0.7, 0.1, 1)');
  });

  it('exportMotion produces a tuple for Motion/Framer Motion', () => {
    expect(exportMotion(CURVE)).toBe('ease: [0.2, 0.7, 0.1, 1]');
  });

  it('exportSCSS produces a variable declaration', () => {
    expect(exportSCSS(CURVE)).toBe('$ease-custom: cubic-bezier(0.2, 0.7, 0.1, 1);');
  });

  it('rounds values to 3 decimals', () => {
    expect(exportCSS([0.1234, 0.5, 0.5, 0.9876])).toBe(
      'transition-timing-function: cubic-bezier(0.123, 0.5, 0.5, 0.988);',
    );
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement exporters**

Create `src/tools/easing/exporters.ts`:
```typescript
import type { BezierTuple } from './types';

function fmt(curve: BezierTuple): string {
  return curve.map((n) => Math.round(n * 1000) / 1000).join(', ');
}

export function exportCSS(curve: BezierTuple): string {
  return `transition-timing-function: cubic-bezier(${fmt(curve)});`;
}

export function exportJS(curve: BezierTuple): string {
  return `cubic-bezier(${fmt(curve)})`;
}

export function exportMotion(curve: BezierTuple): string {
  return `ease: [${fmt(curve)}]`;
}

export function exportSCSS(curve: BezierTuple): string {
  return `$ease-custom: cubic-bezier(${fmt(curve)});`;
}

export const EXPORT_FORMATS = [
  { id: 'css', label: 'CSS', fn: exportCSS },
  { id: 'js', label: 'JS', fn: exportJS },
  { id: 'motion', label: 'Motion', fn: exportMotion },
  { id: 'scss', label: 'SCSS', fn: exportSCSS },
] as const;

export type ExportFormatId = (typeof EXPORT_FORMATS)[number]['id'];
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(easing): add code exporters for CSS/JS/Motion/SCSS"
```

---

## Task 16: Easing Lab — URL State Encode/Decode (TDD)

**Files:**
- Create: `src/tools/easing/url-state.ts`
- Create: `tests/unit/url-state.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/url-state.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from '@/tools/easing/url-state';
import { DEFAULT_STATE } from '@/tools/easing/types';

describe('url state', () => {
  it('encodes state to a query-string-style hash', () => {
    const hash = encodeState({
      curve: [0.2, 0.7, 0.1, 1],
      duration: 800,
      target: 'translate',
      compare: null,
    });
    expect(hash).toBe('c=0.2,0.7,0.1,1&d=800&t=translate');
  });

  it('includes compare key when set', () => {
    const hash = encodeState({
      curve: [0, 0, 1, 1],
      duration: 500,
      target: 'scale',
      compare: 'ease-out',
    });
    expect(hash).toBe('c=0,0,1,1&d=500&t=scale&v=ease-out');
  });

  it('decodes a full hash back to state', () => {
    const decoded = decodeState('c=0.2,0.7,0.1,1&d=800&t=translate&v=ease-out');
    expect(decoded.curve).toEqual([0.2, 0.7, 0.1, 1]);
    expect(decoded.duration).toBe(800);
    expect(decoded.target).toBe('translate');
    expect(decoded.compare).toBe('ease-out');
  });

  it('returns default state for empty hash', () => {
    expect(decodeState('')).toEqual(DEFAULT_STATE);
  });

  it('ignores leading # in hash input', () => {
    const decoded = decodeState('#c=0,0,1,1&d=300&t=rotate');
    expect(decoded.curve).toEqual([0, 0, 1, 1]);
    expect(decoded.duration).toBe(300);
    expect(decoded.target).toBe('rotate');
    expect(decoded.compare).toBeNull();
  });

  it('falls back to defaults on malformed values', () => {
    const decoded = decodeState('c=bad&d=notnum&t=unknown');
    expect(decoded).toEqual(DEFAULT_STATE);
  });

  it('clamps curve values into bezier-safe range', () => {
    const decoded = decodeState('c=-5,99,0.5,0.5&d=800&t=translate');
    expect(decoded.curve[0]).toBe(0);
    expect(decoded.curve[1]).toBe(1.6);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement url-state**

Create `src/tools/easing/url-state.ts`:
```typescript
import type { EasingState, AnimationTarget, BezierTuple, PresetName } from './types';
import { DEFAULT_STATE } from './types';
import { PRESETS } from './presets';

const TARGETS: readonly AnimationTarget[] = ['translate', 'scale', 'stagger', 'color', 'rotate'];
const PRESET_NAMES: readonly PresetName[] = PRESETS.map((p) => p.name);

export function encodeState(state: EasingState): string {
  const parts: string[] = [
    `c=${state.curve.map(fmt).join(',')}`,
    `d=${state.duration}`,
    `t=${state.target}`,
  ];
  if (state.compare) parts.push(`v=${state.compare}`);
  return parts.join('&');
}

export function decodeState(input: string): EasingState {
  const cleaned = input.startsWith('#') ? input.slice(1) : input;
  if (!cleaned) return DEFAULT_STATE;

  const params = new URLSearchParams(cleaned);
  const curve = parseCurve(params.get('c'));
  const duration = parseDuration(params.get('d'));
  const target = parseTarget(params.get('t'));
  const compare = parseCompare(params.get('v'));

  if (!curve || duration === null || !target) return DEFAULT_STATE;
  return { curve, duration, target, compare };
}

function parseCurve(raw: string | null): BezierTuple | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => Number.parseFloat(s));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  const clamped = parts.map((n, i) => {
    if (i === 0 || i === 2) return clamp(n, 0, 1);
    return clamp(n, -0.5, 1.6);
  }) as unknown as [number, number, number, number];
  return clamped as BezierTuple;
}

function parseDuration(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 50 || n > 5000) return null;
  return n;
}

function parseTarget(raw: string | null): AnimationTarget | null {
  if (!raw) return null;
  return (TARGETS as readonly string[]).includes(raw) ? (raw as AnimationTarget) : null;
}

function parseCompare(raw: string | null): PresetName | null {
  if (!raw) return null;
  return (PRESET_NAMES as readonly string[]).includes(raw) ? (raw as PresetName) : null;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function fmt(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(easing): add URL state encode/decode with strict parsing"
```

---

## Task 17: Easing Lab — useRAFAnimation Hook

**Files:**
- Create: `src/tools/easing/useRAFAnimation.ts`

- [ ] **Step 1: Implement the hook**

Create `src/tools/easing/useRAFAnimation.ts`:
```typescript
import { useEffect, useRef, useState } from 'react';
import { bezierY } from './bezier';
import type { BezierTuple } from './types';

interface UseRAFAnimationOptions {
  duration: number;
  curve: BezierTuple;
  paused?: boolean;
  pauseAtEnd?: number;
}

export function useRAFAnimation({
  duration,
  curve,
  paused = false,
  pauseAtEnd = 800,
}: UseRAFAnimationOptions): { progress: number; raw: number; running: boolean } {
  const [progress, setProgress] = useState(0);
  const [raw, setRaw] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    function tick(now: number) {
      if (cancelled) return;
      if (pausedRef.current) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= duration + pauseAtEnd) {
        startRef.current = now;
        setRaw(0);
        setProgress(0);
      } else if (elapsed >= duration) {
        setRaw(1);
        setProgress(1);
      } else {
        const t = elapsed / duration;
        setRaw(t);
        setProgress(bezierY(curve, t));
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [duration, curve, pauseAtEnd]);

  return { progress, raw, running: !paused };
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add useRAFAnimation hook with single shared frame loop"
```

---

## Task 18: Easing Lab — CurveEditor Component

**Files:**
- Create: `src/tools/easing/CurveEditor.tsx`

- [ ] **Step 1: Implement CurveEditor**

Create `src/tools/easing/CurveEditor.tsx`:
```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { sampleCurve } from './bezier';
import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  onChange: (next: BezierTuple) => void;
  ghost?: BezierTuple | null;
  ariaLabel?: string;
}

const VB = 1000;
const PAD = 40;

export function CurveEditor({ curve, onChange, ghost = null, ariaLabel = 'Bezier curve editor' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);

  const toSvg = useCallback((nx: number, ny: number): [number, number] => {
    const x = PAD + nx * (VB - PAD * 2);
    const y = VB - PAD - ny * (VB - PAD * 2);
    return [x, y];
  }, []);

  const fromSvg = useCallback((x: number, y: number): [number, number] => {
    const nx = (x - PAD) / (VB - PAD * 2);
    const ny = (VB - PAD - y) / (VB - PAD * 2);
    return [clamp(nx, 0, 1), clamp(ny, -0.5, 1.6)];
  }, []);

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, handle: 0 | 1) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const { x, y } = pt.matrixTransform(ctm.inverse());
      const [nx, ny] = fromSvg(x, y);
      const next: BezierTuple = handle === 0
        ? [nx, ny, curve[2], curve[3]]
        : [curve[0], curve[1], nx, ny];
      onChange(next);
    },
    [curve, fromSvg, onChange],
  );

  useEffect(() => {
    if (activeHandle === null) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const { x, y } = pt.matrixTransform(ctm.inverse());
      const [nx, ny] = fromSvg(x, y);
      const next: BezierTuple = activeHandle === 0
        ? [nx, ny, curve[2], curve[3]]
        : [curve[0], curve[1], nx, ny];
      onChange(next);
    };
    const onUp = () => setActiveHandle(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [activeHandle, curve, fromSvg, onChange]);

  const onKey = useCallback(
    (handle: 0 | 1) => (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      let [x, y] = handle === 0 ? [curve[0], curve[1]] : [curve[2], curve[3]];
      if (e.key === 'ArrowLeft') x -= step;
      else if (e.key === 'ArrowRight') x += step;
      else if (e.key === 'ArrowUp') y += step;
      else if (e.key === 'ArrowDown') y -= step;
      else return;
      e.preventDefault();
      x = clamp(x, 0, 1);
      y = clamp(y, -0.5, 1.6);
      const next: BezierTuple = handle === 0 ? [x, y, curve[2], curve[3]] : [curve[0], curve[1], x, y];
      onChange(next);
    },
    [curve, onChange],
  );

  const samples = sampleCurve(curve, 64);
  const path = pathFromSamples(samples, toSvg);
  const ghostPath = ghost ? pathFromSamples(sampleCurve(ghost, 64), toSvg) : null;

  const [h1x, h1y] = toSvg(curve[0], curve[1]);
  const [h2x, h2y] = toSvg(curve[2], curve[3]);
  const [p0x, p0y] = toSvg(0, 0);
  const [p3x, p3y] = toSvg(1, 1);

  return (
    <div
      role="application"
      aria-label={ariaLabel}
      aria-roledescription="cubic bezier curve editor"
      class="w-full"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB} ${VB}`}
        class="w-full h-auto select-none touch-none"
        onPointerDown={(e) => {
          const target = e.target as Element;
          const handleAttr = target.getAttribute?.('data-handle');
          if (handleAttr === '0' || handleAttr === '1') {
            setActiveHandle(handleAttr === '0' ? 0 : 1);
            (e.target as Element).setPointerCapture?.(e.pointerId);
            handlePointer(e, handleAttr === '0' ? 0 : 1);
          }
        }}
      >
        <rect x="0" y="0" width={VB} height={VB} fill="transparent" />
        <line x1={PAD} y1={VB - PAD} x2={VB - PAD} y2={VB - PAD} stroke="#3a3f55" stroke-width="2" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={VB - PAD} stroke="#3a3f55" stroke-width="2" />

        {ghostPath && (
          <path d={ghostPath} fill="none" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="14 12" opacity="0.6" />
        )}

        <path d={path} fill="none" stroke="url(#curve-gradient)" stroke-width="8" stroke-linecap="round" />

        <line x1={p0x} y1={p0y} x2={h1x} y2={h1y} stroke="#22d3ee" stroke-width="2" stroke-dasharray="4 6" opacity="0.7" />
        <line x1={p3x} y1={p3y} x2={h2x} y2={h2y} stroke="#ec4899" stroke-width="2" stroke-dasharray="4 6" opacity="0.7" />

        <circle cx={p0x} cy={p0y} r="10" fill="#e5e7ff" />
        <circle cx={p3x} cy={p3y} r="10" fill="#e5e7ff" />

        <circle
          data-handle="0"
          cx={h1x}
          cy={h1y}
          r="22"
          fill="#22d3ee"
          tabIndex={0}
          onKeyDown={onKey(0)}
          aria-label={`Control point 1: x ${curve[0].toFixed(2)}, y ${curve[1].toFixed(2)}`}
          style={{ cursor: 'grab' }}
        />
        <circle
          data-handle="1"
          cx={h2x}
          cy={h2y}
          r="22"
          fill="#ec4899"
          tabIndex={0}
          onKeyDown={onKey(1)}
          aria-label={`Control point 2: x ${curve[2].toFixed(2)}, y ${curve[3].toFixed(2)}`}
          style={{ cursor: 'grab' }}
        />

        <defs>
          <linearGradient id="curve-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stop-color="#22d3ee" />
            <stop offset="0.55" stop-color="#8b5cf6" />
            <stop offset="1" stop-color="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function pathFromSamples(samples: Array<[number, number]>, toSvg: (nx: number, ny: number) => [number, number]): string {
  return samples
    .map(([x, y], i) => {
      const [sx, sy] = toSvg(x, y);
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(' ');
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add CurveEditor with draggable handles and keyboard support"
```

---

## Task 19: Easing Lab — AnimationPlayground Component

**Files:**
- Create: `src/tools/easing/AnimationPlayground.tsx`

This component MUST use a single `useRAFAnimation` instance and compute both main and ghost progress from the same raw `t` via `bezierY(curve, raw)` and `bezierY(ghost, raw)`. This guarantees one rAF tick per frame for all animated targets (the spec's perf requirement).

- [ ] **Step 1: Implement AnimationPlayground**

Create `src/tools/easing/AnimationPlayground.tsx`:
```tsx
import { useRAFAnimation } from './useRAFAnimation';
import { bezierY } from './bezier';
import type { AnimationTarget, BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  ghost: BezierTuple | null;
  duration: number;
  target: AnimationTarget;
  paused: boolean;
  reducedMotion: boolean;
}

const TARGET_LABELS: Record<AnimationTarget, string> = {
  translate: 'Translation',
  scale: 'Scale',
  stagger: 'Stagger',
  color: 'Color',
  rotate: 'Rotation',
};

export function AnimationPlayground({ curve, ghost, duration, target, paused, reducedMotion }: Props) {
  const { raw } = useRAFAnimation({ curve, duration, paused: paused || reducedMotion });
  const progress = reducedMotion ? 1 : bezierY(curve, raw);
  const ghostProgress = ghost ? (reducedMotion ? 1 : bezierY(ghost, raw)) : null;

  return (
    <div class="rounded-2xl border border-paper/10 bg-graphite p-8">
      <div class="flex items-center justify-between mb-6">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
          Playground — {TARGET_LABELS[target]}
        </p>
        <p class="font-mono text-[10px] opacity-40">{duration}ms loop</p>
      </div>
      <Target target={target} progress={progress} ghostProgress={ghostProgress} />
    </div>
  );
}

function Target({
  target,
  progress,
  ghostProgress,
}: {
  target: AnimationTarget;
  progress: number;
  ghostProgress: number | null;
}) {
  if (target === 'translate') {
    return (
      <div class="space-y-4">
        <Track progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Track progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'scale') {
    return (
      <div class="flex items-center justify-center gap-8 py-8">
        <Dot progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Dot progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'rotate') {
    return (
      <div class="flex items-center justify-center gap-8 py-8">
        <Rotator progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Rotator progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'color') {
    return (
      <div class="space-y-3">
        <ColorBar progress={progress} />
        {ghostProgress !== null && <ColorBar progress={ghostProgress} />}
      </div>
    );
  }
  return (
    <div class="space-y-2">
      <StaggerList progress={progress} />
      {ghostProgress !== null && <StaggerList progress={ghostProgress} dashed />}
    </div>
  );
}

function Track({ progress, colorClass }: { progress: number; colorClass: string }) {
  return (
    <div class="relative h-12 rounded-full bg-ink/60 border border-paper/5">
      <div
        class={`absolute top-1.5 left-1.5 h-9 w-9 rounded-full ${colorClass}`}
        style={{ transform: `translateX(${progress * 100}%)`, transition: 'none' }}
      />
    </div>
  );
}

function Dot({ progress, colorClass }: { progress: number; colorClass: string }) {
  const scale = 0.4 + progress * 1.6;
  return (
    <div
      class={`h-16 w-16 rounded-full ${colorClass}`}
      style={{ transform: `scale(${scale})`, transition: 'none' }}
    />
  );
}

function Rotator({ progress, colorClass }: { progress: number; colorClass: string }) {
  return (
    <div
      class={`h-2 w-24 origin-left ${colorClass}`}
      style={{ transform: `rotate(${progress * 180}deg)`, transition: 'none' }}
    />
  );
}

function ColorBar({ progress }: { progress: number }) {
  const r = Math.round(34 + (236 - 34) * progress);
  const g = Math.round(211 + (72 - 211) * progress);
  const b = Math.round(238 + (153 - 238) * progress);
  return (
    <div
      class="h-8 rounded-md"
      style={{ background: `rgb(${r}, ${g}, ${b})`, transition: 'none' }}
    />
  );
}

function StaggerList({ progress, dashed = false }: { progress: number; dashed?: boolean }) {
  const items = [0, 1, 2, 3, 4, 5];
  return (
    <ul class="space-y-2">
      {items.map((i) => {
        const offset = i / (items.length - 1);
        const itemProgress = Math.max(0, Math.min(1, (progress - offset * 0.5) / 0.5));
        return (
          <li
            class={`h-3 rounded-full ${dashed ? 'border border-dashed border-violet' : 'bg-cyan'}`}
            style={{ transform: `scaleX(${itemProgress})`, transformOrigin: 'left', transition: 'none' }}
          />
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add AnimationPlayground with 5 visual targets"
```

---

## Task 20: Easing Lab — PresetStrip and CompareToggle Components

**Files:**
- Create: `src/tools/easing/PresetStrip.tsx`
- Create: `src/tools/easing/CompareToggle.tsx`

- [ ] **Step 1: Create PresetStrip**

Create `src/tools/easing/PresetStrip.tsx`:
```tsx
import { PRESETS } from './presets';
import type { BezierTuple, PresetName } from './types';

interface Props {
  active: PresetName | null;
  onSelect: (curve: BezierTuple, name: PresetName) => void;
}

export function PresetStrip({ active, onSelect }: Props) {
  return (
    <div class="overflow-x-auto pb-2">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Presets</p>
      <div class="flex gap-2 min-w-max">
        {PRESETS.map((preset) => {
          const isActive = active === preset.name;
          return (
            <button
              type="button"
              onClick={() => onSelect(preset.curve, preset.name)}
              class={`px-4 py-2 rounded-full font-mono text-xs border transition-colors duration-quick whitespace-nowrap
                ${isActive ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'}
              `}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CompareToggle**

Create `src/tools/easing/CompareToggle.tsx`:
```tsx
import { PRESETS } from './presets';
import type { PresetName } from './types';

interface Props {
  value: PresetName | null;
  onChange: (next: PresetName | null) => void;
}

export function CompareToggle({ value, onChange }: Props) {
  return (
    <div class="flex items-center gap-3">
      <label class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
        Compare with
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const next = (e.target as HTMLSelectElement).value;
          onChange(next === '' ? null : (next as PresetName));
        }}
        class="bg-graphite border border-paper/10 rounded-full px-3 py-1.5 font-mono text-xs focus:border-cyan focus:outline-none"
      >
        <option value="">none</option>
        {PRESETS.map((preset) => (
          <option value={preset.name}>{preset.label}</option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(easing): add PresetStrip and CompareToggle components"
```

---

## Task 21: Easing Lab — ExportPanel Component

**Files:**
- Create: `src/tools/easing/ExportPanel.tsx`

- [ ] **Step 1: Implement ExportPanel**

Create `src/tools/easing/ExportPanel.tsx`:
```tsx
import { useState } from 'react';
import { EXPORT_FORMATS } from './exporters';
import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
}

export function ExportPanel({ curve }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      setCopied('error');
      setTimeout(() => setCopied(null), 1600);
    }
  }

  return (
    <div class="rounded-2xl border border-paper/10 bg-graphite p-6">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">Export</p>
      <div class="space-y-3">
        {EXPORT_FORMATS.map((format) => {
          const code = format.fn(curve);
          const justCopied = copied === format.id;
          return (
            <div class="flex items-center gap-3">
              <span class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 w-12 shrink-0">
                {format.label}
              </span>
              <code class="flex-1 font-mono text-xs px-3 py-2 rounded-md bg-ink/60 border border-paper/5 overflow-x-auto whitespace-nowrap">
                {code}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(format.id, code)}
                class="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick whitespace-nowrap"
                aria-live="polite"
              >
                {justCopied ? '✓ copied' : 'copy'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add ExportPanel with copy-to-clipboard"
```

---

## Task 22: Easing Lab — useURLState Hook

**Files:**
- Create: `src/tools/easing/useURLState.ts`

- [ ] **Step 1: Implement useURLState**

Create `src/tools/easing/useURLState.ts`:
```typescript
import { useEffect, useRef, useState } from 'react';
import { decodeState, encodeState } from './url-state';
import type { EasingState } from './types';
import { DEFAULT_STATE } from './types';

export function useURLState(): [EasingState, (next: EasingState) => void] {
  const [state, setState] = useState<EasingState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    return decodeState(window.location.hash);
  });
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      setState(decodeState(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = `#${encodeState(state)}`;
    if (window.location.hash !== hash) {
      skipNextSyncRef.current = true;
      window.history.replaceState(null, '', hash);
    }
  }, [state]);

  return [state, setState];
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(easing): add useURLState hook with hash sync"
```

---

## Task 23: Easing Lab — EasingLab Assembly

**Files:**
- Create: `src/tools/easing/NumericValues.tsx`
- Create: `src/tools/easing/EasingLab.tsx`

The spec requires three input modes for the curve: drag, keyboard, and direct numeric entry. Tasks 18 (drag/keyboard) covered the first two; this task adds the numeric-input mode via a small `NumericValues` component.

- [ ] **Step 1: Create `NumericValues.tsx`**

Create `src/tools/easing/NumericValues.tsx`:
```tsx
import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  onChange: (next: BezierTuple) => void;
}

const FIELDS: Array<{ index: 0 | 1 | 2 | 3; label: string; min: number; max: number }> = [
  { index: 0, label: 'x1', min: 0, max: 1 },
  { index: 1, label: 'y1', min: -0.5, max: 1.6 },
  { index: 2, label: 'x2', min: 0, max: 1 },
  { index: 3, label: 'y2', min: -0.5, max: 1.6 },
];

export function NumericValues({ curve, onChange }: Props) {
  function handleField(index: 0 | 1 | 2 | 3, raw: string) {
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) return;
    const field = FIELDS.find((f) => f.index === index)!;
    const clamped = Math.max(field.min, Math.min(field.max, n));
    const next = [...curve] as unknown as [number, number, number, number];
    next[index] = clamped;
    onChange(next as BezierTuple);
  }

  return (
    <div class="grid grid-cols-4 gap-3">
      {FIELDS.map((field) => (
        <label class="block">
          <span class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-1.5">
            {field.label}
          </span>
          <input
            type="number"
            step="0.01"
            min={field.min}
            max={field.max}
            value={curve[field.index].toFixed(2)}
            onChange={(e) => handleField(field.index, (e.target as HTMLInputElement).value)}
            class="w-full bg-ink/60 border border-paper/10 rounded-md px-2 py-1.5 font-mono text-sm focus:border-cyan focus:outline-none"
          />
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Implement EasingLab**

Create `src/tools/easing/EasingLab.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { CurveEditor } from './CurveEditor';
import { AnimationPlayground } from './AnimationPlayground';
import { PresetStrip } from './PresetStrip';
import { CompareToggle } from './CompareToggle';
import { ExportPanel } from './ExportPanel';
import { NumericValues } from './NumericValues';
import { useURLState } from './useURLState';
import { getPresetCurve, PRESETS } from './presets';
import type { AnimationTarget, BezierTuple, PresetName } from './types';
import { subscribeReducedMotion, prefersReducedMotion } from '@/lib/reduced-motion';

const TARGETS: AnimationTarget[] = ['translate', 'scale', 'stagger', 'color', 'rotate'];

export function EasingLab() {
  const [state, setState] = useURLState();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    return subscribeReducedMotion(setReduced);
  }, []);

  function setCurve(curve: BezierTuple) {
    setState({ ...state, curve });
  }
  function selectPreset(curve: BezierTuple, _name: PresetName) {
    setState({ ...state, curve });
  }
  function setTarget(target: AnimationTarget) {
    setState({ ...state, target });
  }
  function setDuration(duration: number) {
    setState({ ...state, duration });
  }
  function setCompare(compare: PresetName | null) {
    setState({ ...state, compare });
  }

  const ghost = state.compare ? getPresetCurve(state.compare) ?? null : null;

  return (
    <div class="grid lg:grid-cols-12 gap-8">
      <div class="lg:col-span-7 space-y-6">
        <div class="rounded-2xl border border-paper/10 bg-graphite p-6 md:p-8">
          <div class="flex items-center justify-between mb-6">
            <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Curve</p>
            <CompareToggle value={state.compare} onChange={setCompare} />
          </div>
          <CurveEditor curve={state.curve} ghost={ghost} onChange={setCurve} />
          <div class="mt-6">
            <NumericValues curve={state.curve} onChange={setCurve} />
          </div>
          <div role="status" aria-live="polite" class="sr-only">
            Control point 1: {state.curve[0].toFixed(2)}, {state.curve[1].toFixed(2)}.
            Control point 2: {state.curve[2].toFixed(2)}, {state.curve[3].toFixed(2)}.
          </div>
        </div>
        <PresetStrip
          active={matchPreset(state.curve)}
          onSelect={selectPreset}
        />
      </div>

      <div class="lg:col-span-5 space-y-6">
        <AnimationPlayground
          curve={state.curve}
          ghost={ghost}
          duration={state.duration}
          target={state.target}
          paused={paused}
          reducedMotion={reduced}
        />

        <div class="rounded-2xl border border-paper/10 bg-graphite p-6">
          <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">Controls</p>
          <div class="space-y-4">
            <div>
              <label class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2">
                Target
              </label>
              <div class="flex flex-wrap gap-2">
                {TARGETS.map((t) => (
                  <button
                    type="button"
                    onClick={() => setTarget(t)}
                    aria-pressed={state.target === t}
                    class={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick
                      ${state.target === t ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'}
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label for="duration-slider" class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2">
                Duration: {state.duration}ms
              </label>
              <input
                id="duration-slider"
                type="range"
                min="100"
                max="3000"
                step="50"
                value={state.duration}
                onChange={(e) => setDuration(Number.parseInt((e.target as HTMLInputElement).value, 10))}
                class="w-full accent-cyan"
              />
            </div>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              class="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick"
              aria-pressed={paused}
            >
              {paused ? '▶ play' : '⏸ pause'}
            </button>
          </div>
        </div>

        <ExportPanel curve={state.curve} />
      </div>
    </div>
  );
}

function matchPreset(curve: BezierTuple): PresetName | null {
  for (const preset of PRESETS) {
    if (
      eq(preset.curve[0], curve[0]) &&
      eq(preset.curve[1], curve[1]) &&
      eq(preset.curve[2], curve[2]) &&
      eq(preset.curve[3], curve[3])
    ) {
      return preset.name;
    }
  }
  return null;
}

function eq(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(easing): assemble EasingLab with numeric inputs, URL state, and reduced-motion snap"
```

---

## Task 24: Easing Lab — Page Route

**Files:**
- Create: `src/pages/tools/easing.astro`

- [ ] **Step 1: Create the page route**

Create `src/pages/tools/easing.astro`:
```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import GradientText from '@/components/GradientText.astro';
import { EasingLab } from '@/tools/easing/EasingLab';
---
<BaseLayout
  title="Easing Curve Lab"
  description="Design custom cubic-bezier easings and feel them across five animated targets at once."
>
  <Header />
  <main class="mx-auto max-w-7xl px-6 pt-32 pb-24">
    <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">Tool — 01</p>
    <h1 class="font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.03em] max-w-4xl">
      <GradientText>Easing</GradientText> Curve Lab
    </h1>
    <p class="mt-6 max-w-2xl opacity-75 text-lg">
      Design a cubic-bezier curve and feel it apply to five different animated properties at once. Compare against built-in easings. Export to CSS, JS, Motion, or SCSS. Share the URL — your curve is in the hash.
    </p>
    <div class="mt-16">
      <EasingLab client:only="react" />
    </div>
  </main>
  <Footer sourcePath="src/tools/easing" />
</BaseLayout>
```

- [ ] **Step 2: Verify the page renders**

Run: `pnpm dev` and visit http://localhost:4321/tools/easing
Expected: Page loads, EasingLab component hydrates, curve is interactive, draggable handles work, presets cycle the curve, target buttons switch the playground, export panel shows CSS/JS/Motion/SCSS with copy buttons. Stop with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(easing): add /tools/easing page route hosting the React island"
```

---

## Task 25: Easing Lab — Polish + A11y Audit Pass

**Files:**
- Modify: `src/design-system/styles/global.css` (add magnet-hover and drop-settle styles)
- Modify: `src/tools/easing/CurveEditor.tsx` (apply curve-handle class and drop-settle state)
- Modify: `src/pages/tools/easing.astro` (keyboard summary)

This task adds the two remaining "polish moments" from the spec — the magnet hover and drop-spring overshoot — and does the manual a11y audit pass.

- [ ] **Step 1: Add curve-handle styles to global.css**

Append these rules to `src/design-system/styles/global.css` (inside the existing `@layer components` block):
```css
.curve-handle {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 180ms cubic-bezier(0.2, 0.7, 0.1, 1);
}
.curve-handle:hover,
.curve-handle:focus-visible {
  transform: scale(1.18);
}
.curve-handle[data-dragging='true'] {
  transform: scale(0.9);
  transition-duration: 60ms;
}
.curve-handle[data-just-dropped='true'] {
  animation: drop-settle 420ms cubic-bezier(0.2, 0.7, 0.1, 1);
}
@keyframes drop-settle {
  0%   { transform: scale(0.9); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .curve-handle,
  .curve-handle[data-just-dropped='true'] {
    transition: none;
    animation: none;
  }
}
```

- [ ] **Step 2: Wire up the drop-settle state in CurveEditor**

Modify `src/tools/easing/CurveEditor.tsx`. Add a `justDropped` state right after the existing `activeHandle` state:
```tsx
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);
  const [justDropped, setJustDropped] = useState<0 | 1 | null>(null);
```

Inside the existing `useEffect` block (the one that listens for `pointermove` / `pointerup`), change the `onUp` handler from:
```tsx
    const onUp = () => setActiveHandle(null);
```
to:
```tsx
    const onUp = () => {
      const released = activeHandle;
      setActiveHandle(null);
      if (released !== null) {
        setJustDropped(released);
        window.setTimeout(() => setJustDropped((d) => (d === released ? null : d)), 420);
      }
    };
```

Update the two `<circle>` handle elements to apply the class and data attributes. Replace each handle circle's element with this pattern (substituting `0`/`1` for the two handles):
```tsx
        <circle
          data-handle="0"
          data-dragging={activeHandle === 0 ? 'true' : 'false'}
          data-just-dropped={justDropped === 0 ? 'true' : 'false'}
          class="curve-handle"
          cx={h1x}
          cy={h1y}
          r="22"
          fill="#22d3ee"
          tabIndex={0}
          onKeyDown={onKey(0)}
          aria-label={`Control point 1: x ${curve[0].toFixed(2)}, y ${curve[1].toFixed(2)}`}
          style={{ cursor: 'grab' }}
        />
```

And for handle 1 (note: substitute `0` → `1` in `data-handle`, `data-dragging`, `data-just-dropped`; `cx={h2x}` `cy={h2y}`; `fill="#ec4899"`; `onKeyDown={onKey(1)}`; ARIA label using `curve[2]` and `curve[3]`).

- [ ] **Step 3: Run a manual a11y audit**

Run `pnpm dev`, open http://localhost:4321/tools/easing, and verify each of the following manually:
- Tab focus cycles through: target buttons → duration slider → pause button → preset buttons → compare select → numeric inputs → control point 1 → control point 2 → copy buttons.
- Focus rings are visible (cyan outline at 2px offset).
- Arrow keys with the curve handle focused nudge it by 0.01.
- Shift+Arrow nudges by 0.1.
- ARIA live region announces curve changes (inspect DOM at `role="status"`).
- Hover on a curve handle scales it up smoothly (magnet effect).
- Dragging a handle compresses it slightly, releasing it triggers a soft overshoot settle.
- Toggle OS-level reduced-motion preference: animation in the playground snaps to end-state (progress = 1) and handle hover/drop animations are disabled.

If any of the above fails, fix it in the relevant component before continuing.

- [ ] **Step 4: Add a keyboard shortcut summary in the UI**

Add this block inside `src/pages/tools/easing.astro`, before the closing `</main>`:
```astro
    <aside class="mt-12 rounded-2xl border border-paper/10 bg-graphite p-6">
      <p class="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Keyboard</p>
      <ul class="grid sm:grid-cols-2 gap-2 font-mono text-xs opacity-75">
        <li>↑ ↓ ← → — nudge handle 0.01</li>
        <li>Shift + arrows — nudge 0.10</li>
        <li>Tab — cycle handle / control focus</li>
        <li>Space — toggle play/pause (when pause button focused)</li>
      </ul>
    </aside>
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(easing): polish — magnet hover, drop-settle spring, a11y audit, keyboard summary"
```

---

## Task 26: E2E Tests — Landing and Tools Gallery

**Files:**
- Create: `tests/e2e/landing.spec.ts`
- Create: `tests/e2e/tools-gallery.spec.ts`

- [ ] **Step 1: Write landing E2E test**

Create `tests/e2e/landing.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero, about, work, and contact sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('has a working mailto link', async ({ page }) => {
    await page.goto('/');
    const mailto = page.locator('a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible();
    const href = await mailto.getAttribute('href');
    expect(href).toMatch(/^mailto:.+@.+\..+$/);
  });

  test('header navigates to tools page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'tools' }).click();
    await expect(page).toHaveURL(/\/tools$/);
  });
});
```

- [ ] **Step 2: Write tools-gallery E2E test**

Create `tests/e2e/tools-gallery.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Tools gallery', () => {
  test('shows all four tools with correct availability', async ({ page }) => {
    await page.goto('/tools');
    const cards = page.getByRole('link').filter({ hasText: /Easing Curve Lab/ });
    await expect(cards.first()).toBeVisible();

    const soonPills = page.getByText('soon', { exact: true });
    await expect(soonPills).toHaveCount(3);
  });

  test('Easing Curve Lab card links to the tool page', async ({ page }) => {
    await page.goto('/tools');
    await page.getByText('Easing Curve Lab').click();
    await expect(page).toHaveURL(/\/tools\/easing$/);
  });
});
```

- [ ] **Step 3: Build site and run E2E**

```bash
pnpm build
pnpm e2e --project=chromium
```
Expected: All landing + tools-gallery tests pass on Chromium.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: add E2E for landing and tools gallery"
```

---

## Task 27: E2E Tests — Easing Lab Interactions

**Files:**
- Create: `tests/e2e/easing-lab.spec.ts`

- [ ] **Step 1: Write Easing Lab E2E tests**

Create `tests/e2e/easing-lab.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Easing Curve Lab', () => {
  test('loads with default state and core controls visible', async ({ page }) => {
    await page.goto('/tools/easing');
    await expect(page.getByRole('heading', { name: /easing curve lab/i })).toBeVisible();
    await expect(page.getByRole('application', { name: /bezier curve editor/i })).toBeVisible();
    await expect(page.getByText('Export', { exact: false })).toBeVisible();
  });

  test('selecting a preset updates the curve in the URL', async ({ page }) => {
    await page.goto('/tools/easing');
    await page.getByRole('button', { name: 'ease-out' }).click();
    await expect(page).toHaveURL(/c=0,0,0\.58,1/);
  });

  test('clicking a target button updates URL state', async ({ page }) => {
    await page.goto('/tools/easing');
    await page.getByRole('button', { name: 'scale', exact: true }).click();
    await expect(page).toHaveURL(/t=scale/);
  });

  test('export panel copy button triggers copy and shows confirmation', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'Clipboard permission API differs on webkit');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tools/easing');
    const copyButtons = page.getByRole('button', { name: 'copy' });
    await copyButtons.first().click();
    await expect(page.getByText('✓ copied').first()).toBeVisible({ timeout: 2000 });
  });

  test('keyboard nudges the control point', async ({ page }) => {
    await page.goto('/tools/easing#c=0.2,0.7,0.1,1&d=800&t=translate');
    await page.getByLabel(/control point 1/i).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(/c=0\.22/);
  });

  test('pasted URL hash restores state', async ({ page }) => {
    await page.goto('/tools/easing#c=0,0,1,1&d=500&t=rotate');
    const select = page.locator('select');
    await expect(page.getByRole('button', { name: 'rotate', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(select).toHaveValue('');
  });
});
```

- [ ] **Step 2: Run the E2E**

```bash
pnpm build
pnpm e2e --project=chromium
```
Expected: All Easing Lab tests pass on Chromium.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "test: add E2E for Easing Curve Lab interactions and URL state"
```

---

## Task 28: GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json` (add `ci` script)

- [ ] **Step 1: Add CI script**

Add to `"scripts"` in `package.json`:
```json
"ci": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm e2e"
```

- [ ] **Step 2: Create CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm test --coverage
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm build
      - run: pnpm e2e --project=chromium
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "ci: add GitHub Actions workflow for typecheck/lint/test/e2e"
```

---

## Task 29: Lighthouse and axe-core in CI

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `lighthouserc.json`

- [ ] **Step 1: Install Lighthouse CI and axe-core/playwright**

```bash
pnpm add -D @lhci/cli @axe-core/playwright
```

- [ ] **Step 2: Create `lighthouserc.json`**

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4321/", "http://localhost:4321/tools", "http://localhost:4321/tools/easing"],
      "numberOfRuns": 1,
      "startServerCommand": "pnpm preview",
      "startServerReadyPattern": "ready in"
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

- [ ] **Step 3: Add axe smoke test**

Create `tests/e2e/a11y.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/tools', '/tools/easing'];

for (const route of routes) {
  test(`axe: no violations on ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 4: Append Lighthouse step to CI workflow**

Add to the `steps:` section of `.github/workflows/ci.yml`, after the `pnpm e2e ...` step:
```yaml
      - name: Lighthouse CI
        run: pnpm exec lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

- [ ] **Step 5: Run locally to verify**

```bash
pnpm build
pnpm e2e --project=chromium
pnpm exec lhci autorun
```
Expected: axe tests pass, Lighthouse reports ≥95 on performance/a11y/best-practices and ≥90 on SEO for all three routes.

If any score is below threshold, investigate (likely culprits: missing meta description, low-contrast text, render-blocking font loading) and fix before continuing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "ci: add Lighthouse CI and axe-core a11y checks"
```

---

## Task 30: Cloudflare Pages Deployment Setup

**Files:**
- Create: `public/_headers`
- Create: `wrangler.toml` (placeholder for v1.2 Worker)
- Modify: `README.md`

- [ ] **Step 1: Create `public/_headers`**

```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.svg
  Cache-Control: public, max-age=604800
```

- [ ] **Step 2: Create placeholder `wrangler.toml`**

```toml
name = "biczak-site"
compatibility_date = "2026-05-01"

[env.production]
# Worker for /api/palette comes in v1.2; this file is in place so deploy
# tooling has a stable target. v1.0 is pure Pages.
```

- [ ] **Step 3: Update README with deploy instructions**

Replace or create `README.md` with:
```markdown
# biczak.dev

Personal site for Alex Biczak. Astro + React islands on Cloudflare Pages.

## Setup
- Requires Node 22+ and pnpm 9+
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
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add CF Pages headers, wrangler placeholder, and README"
```

---

## Task 31: Cloudflare Web Analytics, DNS, and Production Deploy

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

This task is the manual deployment step. Each command must be run by an operator with Cloudflare account access.

- [ ] **Step 1: Provision Cloudflare Pages project**

In the Cloudflare dashboard:
1. Workers & Pages → Create application → Pages → Connect to Git.
2. Connect the GitHub repo for this project.
3. Build settings: framework preset = Astro, build command = `pnpm build`, output directory = `dist`.
4. Save and deploy. Note the assigned `*.pages.dev` URL for the preview.

- [ ] **Step 2: Point biczak.dev DNS**

In the Cloudflare dashboard for `biczak.dev`:
1. DNS → Records: add a CNAME from `@` (or apex via flattening) to the Pages project domain.
2. SSL/TLS → Edge Certificates: confirm certificate provisioning is active.
3. Custom Domains in Pages project: add `biczak.dev`. Cloudflare verifies and activates.

- [ ] **Step 3: Configure CF Web Analytics**

In the Cloudflare dashboard:
1. Analytics & Logs → Web Analytics → Add a site → biczak.dev.
2. Note the **JS token** issued. (Web Analytics works without JS in CF Pages mode, but JS-mode gives richer event data; we use the simpler no-JS option for v1.0.)
3. Confirm Web Analytics shows traffic after the first preview deploy.

> NOTE: No code change is needed for CF Web Analytics when run on CF Pages — it's automatic. If a JS-based mode is added later, modify `BaseLayout.astro` to include the analytics snippet.

- [ ] **Step 4: Verify production**

After the first push to `main`:
1. Visit https://biczak.dev — site loads.
2. Run Lighthouse on the production URL (Chrome DevTools → Lighthouse → all four categories, mobile profile). Confirm ≥95/95/95/90.
3. Navigate to https://biczak.dev/tools/easing — Easing Lab loads, all interactions work.
4. Confirm Web Analytics has registered the visit.

- [ ] **Step 5: Final commit (release tag)**

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then post on the project's deploy tracker or commit log: **v1.0 shipped — biczak.dev + Easing Curve Lab live.**

---

## After v1.0

Once v1.0 is in production:

1. **Replace placeholder content** in `src/content/site.ts` with real bio, tagline, work history, and social URLs.
2. **Replace `public/og-image.png` and `public/favicon.svg`** with real assets.
3. **Decide on headshot and resume PDF** per the spec's open questions.
4. **Start v1.1 spec & plan** for the Audio-Reactive Canvas, following the same brainstorming → spec → plan → execute flow.

The site shell is now a stable foundation: each subsequent tool slots in as a single new island under `src/tools/<name>/` and a new route at `src/pages/tools/<name>.astro`, with no changes to the site shell required.
