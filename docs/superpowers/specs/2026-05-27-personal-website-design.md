# Personal Website — Design Spec

**Date:** 2026-05-27
**Status:** Draft — pending user review
**Owner:** Alex Biczak
**Domain:** biczak.dev

## Overview

A personal website at `biczak.dev` aimed at potential employers evaluating Alex for senior frontend / UI engineer roles. The site doubles as a portfolio and as a live work sample: its own design and engineering quality is part of what's being evaluated.

The site combines a small personal section (hero, about, work history, contact) with a curated set of four interactive tools that each demonstrate a distinct senior-frontend competency:

1. **Easing Curve Lab** — animation craft (v1.0, lead tool)
2. **Audio-Reactive Canvas** — Web Audio + Canvas + perf (v1.1)
3. **AI Mood Palette** — AI integration + streaming + accessible color (v1.2)
4. **3D Type Playground** — WebGL + variable typography + motion (v1.3)

Aesthetic direction is **Bold / Expressive** with a Voltage palette (cyan / violet / magenta on near-black) and Bricolage Grotesque display type.

The site ships in phased releases, starting with v1.0 (site shell + Easing Curve Lab). Each subsequent release adds one tool without changing the site shell. The site is launchable at every phase.

## Goals & Non-Goals

### Goals
- Communicate Alex's senior-frontend competence through both content and craft.
- Make every tool genuinely useful or fun — not a static demo. Visitors should want to play with them.
- Maintain a high quality bar: ≥95 Lighthouse on Perf/A11y/Best Practices for every release.
- Be launchable in phases — the site is shippable after v1.0 alone.
- Keep the surface small. Four tools, well done, beats eight half-finished ones.

### Non-Goals (out of scope, v1.x)
- Blog or writing section.
- Featured projects / case studies separate from the tools.
- Contact form (social links + email only).
- Authentication or any user accounts.
- Server-rendered personal content (everything personal is static).
- Saving / favoriting / sharing user-generated content beyond URL state.

## Architecture & Stack

### Frontend
- **Astro 5** — static-first site generator. All non-tool pages render to static HTML with ~0 KB of client JS.
- **React 18** islands — each tool is a self-contained React island, hydrated only on its own route.
- **TypeScript** in strict mode across all source files.
- **Tailwind CSS 4** — primary styling. CSS Modules / vanilla CSS where Tailwind feels wrong (notably inside the 3D Type Playground and any complex visual-effect work).
- **Motion** (the lighter successor to Framer Motion) — site-level transitions and any motion that benefits from a unified API. Tool-specific motion libs adopted where appropriate (e.g., raw `requestAnimationFrame` inside the Easing Lab to demonstrate fluency).
- **pnpm** as package manager. **Vite** is the bundler via Astro.

### Hosting & Backend
- **Cloudflare Pages** — static site hosting.
- **Cloudflare Workers** — only for the AI Mood Palette endpoint at `/api/palette`. All other pages are pure static.
- **Cloudflare KV** — rate-limit counters for the AI endpoint.
- **Cloudflare Web Analytics** — privacy-friendly, no consent banner needed, zero client JS impact.
- **Domain:** biczak.dev, DNS managed through Cloudflare.

### Repo
- **Public GitHub repo.** Each tool page includes a "view source" link in the footer pointing to its source directory on GitHub. Strong portfolio signal — employers can read the code.

### Repo layout
```
src/
  pages/               Astro routes (.astro files)
  components/          Astro components (site shell: header, footer, etc.)
  tools/               React islands, one folder per tool
    easing/
    audio/
    palette/
    type/
  design-system/       Tokens, typography, motion primitives
  lib/                 Shared utilities
worker/                Cloudflare Worker for /api/palette
public/                Static assets (resume PDF, og images, favicons)
tests/
  unit/                Vitest unit tests
  e2e/                 Playwright E2E
docs/                  Specs, plans, design docs (this file)
```

### Routes
| Route | Phase | Type |
|-------|-------|------|
| `/` | v1.0 | Static — hero, about, work history, contact |
| `/tools` | v1.0 | Static — tool gallery |
| `/tools/easing` | v1.0 | Static page + React island |
| `/tools/audio` | v1.1 | Static page + React island |
| `/tools/palette` | v1.2 | Static page + React island |
| `/tools/type` | v1.3 | Static page + React island |
| `/api/palette` | v1.2 | Cloudflare Worker |

## Design System

### Color (Voltage palette)
| Token | Hex | Role |
|-------|-----|------|
| `--ink` | `#07091a` | Default page background (dark mode default for tool pages) |
| `--paper` | `#e5e7ff` | Light surface / dark-on-light contexts |
| `--cyan` | `#22d3ee` | Gradient start |
| `--violet` | `#8b5cf6` | Gradient mid |
| `--rose` | `#ec4899` | Gradient end |
| `--graphite` | `#14171f` | Elevated surface in dark contexts |

Gradient accent reserved for hero moments and the italic display text:
```css
linear-gradient(95deg, #22d3ee 0%, #8b5cf6 55%, #ec4899 100%)
```

The site supports both light and dark; **dark is default for tool pages** (better contrast for canvas, audio viz, and WebGL).

### Typography
| Font | Use | Source |
|------|-----|--------|
| **Bricolage Grotesque Variable** (200–800, opsz 12–96) | Display headings | Google Fonts |
| **Inter** (400, 500, 600) | Body, UI | Google Fonts |
| **JetBrains Mono** (400, 500) | Code, monospace labels, meta | Google Fonts |

Type scale anchored at the display: 88px / 1.0 / -0.04em for the hero, scaling down by ~0.75× steps for sub-heads.

**Italic gradient text** uses an explicit padding/negative-margin fix to prevent `background-clip: text` from clipping italic slant:
```css
.gradient-text {
  background: linear-gradient(95deg, #22d3ee, #8b5cf6, #ec4899);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
  padding: 0.1em 0.2em 0.1em 0.05em;
  margin: -0.1em -0.2em -0.1em -0.05em;
}
```

### Motion
Duration scale (ms): `80 / 180 / 320 / 560` — named `flash / quick / base / slow`.

Two house easings:
- `cubic-bezier(.2, .7, .1, 1)` — default entrance/exit
- Spring `{ stiffness: 400, damping: 30 }` — interactive feedback

All motion respects `prefers-reduced-motion`; reduced-motion users get instant state changes with no transitions.

## Site Information Architecture

### `/` — Landing
Single long-scroll page with these sections, in order:

1. **Hero** — large gradient display headline, short tagline. Subtle scroll indicator. **Content slots:** name (full + how it should display), one-sentence tagline.
2. **About** — 2–3 paragraph bio. **Content slot:** bio copy.
3. **Work history** — list of past roles. Each entry: company name, role title, dates, 1–2 lines of detail. **Content slots:** N entries (number TBD, design supports 3–8 gracefully).
4. **Contact** — email + social links (GitHub, LinkedIn, Twitter/X, others as desired). No form. **Content slots:** email, social URLs, optional inline call-to-action.

Optional elements (decision deferred to pre-launch):
- Headshot in the about section.
- Downloadable résumé PDF (linked from work history or contact).

### `/tools` — Tool Gallery
Grid of large tool cards. Each card: tool name, one-line description, animated preview tile (the tool's signature visual element looping subtly), and a "skills demonstrated" tag line. Card click → tool page.

### `/tools/<name>` — Tool pages
Each follows the same layout shell:
- Tool title + one-line description
- The tool itself (full-bleed or contained, as appropriate)
- A small "view source" link in the page footer, deep-linking to the tool's source directory on GitHub
- A "made by Alex" footer with link back to `/`

## Lead Tool: Easing Curve Lab (v1.0)

### What it does
An interactive cubic-bezier curve editor that lets visitors design custom easings and immediately feel how they apply to real animated elements across multiple visual properties simultaneously. The competitive bar is [cubic-bezier.com](https://cubic-bezier.com) and easings.net; this aims to be visibly more polished than both.

### Features (v1.0 must-haves)
1. **Interactive bezier editor**
   - Large SVG curve in the canvas region, fully responsive (resizes with viewport).
   - Two draggable control points with visible handle lines connecting to endpoints.
   - Three input modes: drag handles, click-to-set values on a numeric pad, type numeric values directly.
2. **Multi-target animation playground** — these animate in lockstep so visitors feel the curve across different visual properties:
   - Translation (a box across a track)
   - Scale (a dot pulsing)
   - Stagger (a 6-item list cascading)
   - Color tween (background fading between two palette colors)
   - Rotation (a marker rotating a half-turn)
3. **Built-in easing presets** — `ease`, `ease-in`, `ease-out`, `ease-in-out`, plus named tweens (`expo`, `circ`, `back`, `quart`) clickable to load into the editor.
4. **Compare mode** — toggle a "ghost" of any built-in easing alongside the custom curve. Side-by-side animated comparison on the same targets. Ghost is rendered with dashed stroke so the comparison reads correctly even for colorblind viewers.
5. **Export panel** — generated code for:
   - CSS: `transition-timing-function: cubic-bezier(...)`
   - JS: `cubic-bezier(...)`
   - Framer Motion / Motion One: `ease: [x1, y1, x2, y2]`
   - SCSS variable: `$ease-custom: cubic-bezier(...);`

   Copy-to-clipboard on each format with toast confirmation.
6. **Shareable URL state** — curve values, selected duration, selected target encoded in the URL hash. Pasting a URL restores the exact state.

### Polish moments
- Curve handles have a subtle "magnet" feel on hover (small inward animation).
- All animated targets share a single `requestAnimationFrame` loop (one tick per frame, no per-element intervals).
- Keyboard: arrow keys nudge focused handle by 0.01, `Shift+arrow` nudges by 0.1, `Tab` cycles handle focus, `Space` plays/pauses the animation.
- Drop-handle micro-interaction: a spring-overshoot settling animation when releasing.
- Mobile: handles are 44×44pt touch targets even when the visual point is small.

### Out of scope for v1.0
- Saved presets / favorites (would need persistence).
- Multi-curve sequencing.
- Account-bound saving.
- Export to After Effects / Lottie.

### Accessibility
- Curve values exposed as an ARIA live region (e.g., "control point 1, x: 0.42, y: 0.6") that announces on change.
- All controls keyboard-operable. Visible focus indicators using the palette's cyan accent at 2px outline.
- Compare-mode ghost uses dashed stroke, not just a color difference.
- `prefers-reduced-motion`: animated targets snap to end-state without transitioning. The bezier visualization remains static.

### Performance budget
- Tool route ≤ 60 KB compressed JS (excluding shared site chunks).
- Interaction-to-paint latency ≤ 16 ms during drag (60 fps).
- No layout thrash on resize.

### Tests
- Vitest unit tests for: bezier math (Y at given X for a cubic curve), URL hash encoding/decoding, code generators (CSS / JS / Framer / SCSS), and the named-preset values.
- Playwright E2E: load page, drag a handle, verify URL hash updates, click an export format, verify clipboard contents.

## Other Tools (Summary Specs)

The following are designed at summary level; each gets its own detailed design spec when it enters active development (at the start of its respective phase).

### Audio-Reactive Canvas (v1.1)
Upload an audio file or use microphone input. Web Audio API `AnalyserNode` feeds FFT data into a Canvas visualization. Multiple visualization modes (3–5 presets). Real-time controls for FFT size, smoothing, and color mapping (constrained to palette gradients). Mic input requires explicit permission with a clear prompt. Falls back to a pre-loaded sample track if mic permission denied or file upload not used.

### AI Mood Palette (v1.2)
Type a mood / scene / poetic phrase. Streams a 5-color palette from Claude with evocative color names and semantic roles (background / surface / accent / text / highlight). Export to CSS variables, Tailwind config, or copy as hex codes. Backend: `/api/palette` Cloudflare Worker (see AI Backend section).

### 3D Type Playground (v1.3)
A single word (user-editable) rendered in Bricolage Grotesque Variable. Mouse position and scroll bind to font axes (weight, width, slant via `font-variation-settings`) and to a subtle 3D `perspective` transform. Click to "freeze" a frame and export as PNG poster. WebGL path explored for distortion effects if it fits the perf budget.

## AI Backend (v1.2, designed now)

This section is designed with **two non-negotiable constraints**:

1. **Cost ceiling:** absolute maximum spend on the Anthropic API is bounded by a hard monthly request cap. No way for usage to silently exceed it.
2. **Visitor awareness:** any visitor is shown how many uses they have available *before* and *during* their interaction. They are never surprised by a rate limit.

### Endpoint
```
POST /api/palette
Content-Type: application/json
Body: { mood: string, count?: 5 | 7 }
Response: text/event-stream  (streaming SSE)

GET /api/palette/quota
Response: { perIp: { remaining, resetAt }, daily: { remaining }, monthly: { remaining } }
```

The `GET /api/palette/quota` endpoint exists so the frontend can show remaining-quota counters **on page load**, before the visitor even types a prompt.

### Worker stack
- Cloudflare Worker, Module Worker syntax, TypeScript.
- `@anthropic-ai/sdk` calling **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`). Haiku is fully capable of evocative color naming for this task; Sonnet would be ~3× the cost with no perceptible quality gain for this surface area.
- **Prompt caching** enabled on the system prompt. After cache warm, the system prompt is read at cache-read pricing ($0.10/M tokens on Haiku), keeping per-request input cost negligible.
- **Streaming response** so the palette renders token-by-token in the browser.
- **`max_tokens: 400`** on every request — prevents runaway responses. A 5-color palette with names and roles fits comfortably in ~250 tokens.

### Rate limiting — three layers
Cloudflare KV-backed counters. Layers escalate from per-user friendliness to absolute cost protection:

| Layer | Limit | Purpose | Key |
|-------|-------|---------|-----|
| **Per IP** | **5 requests per hour** | Prevent single-visitor abuse. Generous enough for genuine exploration (try a few moods, regenerate variants), tight enough to block spam. | `rl:ip:<ip>:<hour>` |
| **Daily total** | **150 requests / day** | Cap a viral / curiosity-driven traffic spike day. | `rl:daily:<YYYY-MM-DD>` |
| **Monthly total** | **3000 requests / month** | **Hard cost ceiling.** Worst-case: 3000 × ~$0.0018 ≈ **$5.40 / month**. | `rl:monthly:<YYYY-MM>` |

On any limit exceeded: HTTP 429 with `{ "error": "rate-limited", "scope": "ip" | "daily" | "monthly", "retry_after": <seconds> }`.

KV write cost note: at 150/day cap, KV writes are ~3 per request × 150 = 450/day, well under the 1000/day free tier.

### Visitor-facing rate limit communication
The AI Mood Palette UI must show the visitor exactly where they stand at all times:

- **On page load:** fetch `/api/palette/quota`. Display a subtle counter near the input: *"5 uses available this hour"*. The counter must appear before the visitor commits effort to typing.
- **After each generation:** counter updates in place: *"4 left this hour"*.
- **When 1 remaining:** counter visually emphasizes (palette accent color): *"1 use left this hour — make it count"*.
- **When per-IP limit hit:** input is disabled with a clear message: *"You've used your 5 uses for this hour. Comes back at HH:MM. In the meantime, here are some examples ↓"* — followed by pre-baked example palettes the visitor can still browse.
- **When daily site-wide limit hit:** *"The AI is taking a breather — daily community quota reached. Try again tomorrow, or browse examples ↓"*.
- **When monthly cap hit:** same UX as daily, with messaging tuned to the longer wait (*"…try again next month"*).
- **At all times when quota is nonzero:** below the counter, a small link *"Why is this rate-limited?"* expands to a one-paragraph explanation that this is a portfolio piece running on the author's personal budget.

### Prompt design
- **System prompt** (cached): defines the JSON output schema, the naming style ("evocative, 1–2 words, like vintage paint chips"), and 3-shot examples of mood → palette.
- **User prompt**: `Mood: ${mood}\nGenerate ${count} colors.`
- **Output schema**: streaming JSON with `[{hex, name, role}]` where `role ∈ {background, surface, accent, text, highlight}`.
- **`max_tokens: 400`** as a hard cap.

### Failure modes
- **Anthropic API unavailable** → fall back to a deterministic palette generator (HSL rotation seeded from the mood string hash). Show a small "AI offline, showing fallback palette" indicator. **No charge incurred** when fallback is used.
- **Rate limit hit (any layer)** → no Anthropic call is made; pre-baked example palettes are shown instead. **No charge incurred** when limit is hit.
- **Malformed AI response** → retry once with adjusted prompt, then fall back. The retry counts as a second request internally (consumes one extra `max_tokens` worth of budget) but does not count against the visitor's per-IP quota.

### Cost ceiling — explicit math
- Pricing (Claude Haiku 4.5, current): input $1/M, output $5/M, cache read $0.10/M, cache write $1.25/M.
- Per-request token usage (typical):
  - System prompt cached (cache-read): ~800 tokens → $0.00008
  - User prompt (uncached input): ~50 tokens → $0.00005
  - Output: ~250 tokens → $0.00125
  - **Total: ~$0.0014 per request**
- Cache write happens once per ~5 minutes of activity, amortized to ≈0.
- **Worst-case monthly cost at 3000-request cap: ~$4.20/month.** Realistic portfolio traffic: well under $1/month.
- Other costs across the whole site: $0 (CF Pages free, CF Workers free at <100k req/day, CF KV free at <1k writes/day, CF Web Analytics free, domain already owned).

If realized traffic stays low for a sustained period, the monthly cap can be raised. If traffic surges, the cap holds and the site continues to function (with examples shown when AI is rate-limited). **At no point can the spend exceed roughly $5/month** without an explicit code change.

### Security
- `ANTHROPIC_API_KEY` stored as a Cloudflare Worker secret. Never reaches the client.
- CORS restricted to `biczak.dev` and the preview deployment subdomain (`*.pages.dev` for the specific project).
- Request body size hard-capped at 1 KB.
- No logging of full mood text long-term (KV counters only — no persistent prompt log).

## Quality Bar

Every release must pass before merging to `main`:

- **Lighthouse** (throttled mobile profile): Perf ≥ 95, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- Zero TypeScript errors, zero ESLint errors.
- `axe-core` clean — no violations — on every route.
- Each tool has Playwright smoke tests covering its core interaction; pure logic has Vitest unit tests.
- Manual browser pass: Chrome, Safari, Firefox (latest). iOS Safari and Android Chrome on phone-sized viewports.
- `prefers-reduced-motion` respected globally.

CI runs typecheck, lint, unit tests, E2E tests, and Lighthouse against a preview deployment on every PR.

## Phasing & Releases

| Phase | Scope |
|-------|-------|
| **v1.0** | Astro site shell (hero + about + work history + contact), `/tools` gallery, Easing Curve Lab, Cloudflare Pages deployment, biczak.dev DNS, CF Web Analytics, public GitHub repo. **First launch.** |
| **v1.1** | Audio-Reactive Canvas + its `/tools/audio` page. |
| **v1.2** | AI Mood Palette + `/api/palette` Worker + KV rate-limit setup. |
| **v1.3** | 3D Type Playground + its `/tools/type` page. |

Each phase ships independently. The site is launchable at every step. No phase depends on a later phase.

## Content & Assets (Placeholder Approach)

All personal content is described in the spec as **content slots**, with placeholder copy in the implementation. Alex provides the actual copy and assets pre-launch.

**Required pre-launch content:**
- Hero tagline (one sentence).
- About bio (2–3 paragraphs).
- Work history entries (3–8 ideal): company, role, dates, 1–2 lines each.
- Email address for contact.
- Social URLs (GitHub, LinkedIn, others as desired).
- Site `og:image` (1200×630) and favicon set.

**Optional pre-launch content:**
- Headshot (square, used in about section if included).
- Résumé PDF (linked from contact and/or work history).

## Pre-Launch Checklist (v1.0)

- [ ] Domain DNS pointed at Cloudflare Pages.
- [ ] All content slots filled (see above).
- [ ] `og:image` and favicon set.
- [ ] CF Web Analytics property configured for biczak.dev.
- [ ] Lighthouse audit passes on production deploy.
- [ ] `axe-core` audit passes on all routes.
- [ ] Cross-browser smoke pass.
- [ ] Reduced-motion behavior verified.
- [ ] Tool source links in footer point to correct GitHub URLs.

## Open Questions

These are intentionally deferred until they need answers:

1. **Photo or no photo?** — Defer to pre-launch content collection.
2. **Number of work history entries?** — Determined by what Alex wants to include; design must look intentional with anywhere from 3 to 8 entries.
3. **`og:image` design** — Could be auto-generated (one per tool) or hand-designed. Defer until v1.0 implementation.
4. **Detailed designs for v1.1, v1.2, v1.3 tools** — Each gets its own design spec when the phase starts.
