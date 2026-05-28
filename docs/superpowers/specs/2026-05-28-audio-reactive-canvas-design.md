# Audio-Reactive Canvas ("Spectral Bloom") — Design Spec

**Date:** 2026-05-28
**Status:** Draft — pending user review
**Owner:** Alex Biczak
**Domain:** biczak.dev
**Relates to:** v1.0.1 — second tool in the `/tools` catalog (Tool 02)

## Overview

The tools catalog ships entries on their own schedule; `audio` is currently a
disabled teaser (`available: false`) in `src/content/site.ts`. This spec
defines **Spectral Bloom**, an audio-reactive Canvas 2D visualizer that turns
live frequency data into a signature radial bloom (plus classic bars and
waveform modes).

It is a fully client-side tool — no backend, no recurring cost, no shipped
audio asset. A generative ambient soundscape is synthesized in-browser for
instant demoing, and an optional microphone source provides the live "wow."
The tool follows the existing EasingLab island convention exactly so it slots
into the established `/tools` pattern without inventing new primitives.

## Goals & Non-Goals

### Goals
- Ship a visually striking, self-contained code sample that demonstrates Web
  Audio API command, `requestAnimationFrame` render-loop discipline, and
  Canvas 2D rendering.
- Two zero-friction audio sources: a synthesized demo (instant, one click to
  satisfy autoplay policy) and an optional live microphone.
- Stay within the existing Lighthouse performance gate — no external libraries,
  Canvas 2D only.
- Match the established tool-island architecture (page → island → catalog →
  footer source link) and the site's voice/visual tokens.
- Keep the interesting logic (frequency→geometry mapping, rendering) in pure,
  unit-testable functions behind a thin imperative shell.
- Honor the project's transparency value: microphone privacy is communicated
  **before** the visitor grants permission, and tracks are released when the
  mic is toggled off.

### Non-Goals
- File upload as an audio source (deferred; mic + synth cover the use cases).
- A shipped audio file / CC0 clip (synthesized demo instead — zero bytes, no
  licensing).
- A particle-field visualization mode (deferred to a fast-follow; MVP is three
  modes).
- WebGL / 3D rendering (Canvas 2D is sufficient and lighter).
- Recording, persistence, or upload of any audio (audio never leaves the
  browser).
- Multi-source mixing (only one source active at a time).

## Current Behavior

`src/content/site.ts` lists the `audio` tool with `available: false`, so
`ToolCard` renders it as an unavailable teaser and there is no
`src/pages/tools/audio.astro`. Navigating to `/tools/audio/` 404s.

## Design

### Architecture (matches the EasingLab island convention)

- **Page:** `src/pages/tools/audio.astro` — `BaseLayout → Header → main → Footer`.
  The `main` mirrors `easing.astro`: eyebrow `Tool — 02`, gradient heading
  ("Spectral Bloom"), a one-paragraph description, the island, and an optional
  keyboard/shortcuts aside.
- **Island mount:** `client:only="react"` — matches EasingLab; canvas + audio
  have no useful SSR output, and the bundle stays light (no 3D lib).
- **Catalog:** in `src/content/site.ts`, the `audio` entry keeps `slug: 'audio'`
  (URL stays `/tools/audio/`), flips to `available: true`, and is renamed
  `name: 'Spectral Bloom'` with `summary` updated to match the new framing
  (e.g. *"Synthesized or live audio rendered as a reactive radial bloom, bars,
  or waveform — all in-browser."*). `skills` stays `WebAudio · Canvas · Perf`.
- **Footer source link:** `<Footer sourcePath="src/tools/audio" />`.

### Module breakdown (thin imperative shell, pure-function core)

| File | Responsibility |
|------|----------------|
| `src/tools/audio/SpectralBloom.tsx` | Root component: owns engine + config state, lays out canvas + controls |
| `src/tools/audio/useAudioEngine.ts` | Lazily creates one `AudioContext`, wires the `AnalyserNode`, switches sources, tears down on unmount |
| `src/tools/audio/synthSource.ts` | Builds the generative ambient graph (oscillators + LFOs + filtered noise); returns a connectable node + start/stop |
| `src/tools/audio/renderers/bloom.ts` | **Pure** radial-bloom frame painter `(data, config, ctx) ⇒ void` |
| `src/tools/audio/renderers/bars.ts` | **Pure** frequency-bars painter |
| `src/tools/audio/renderers/waveform.ts` | **Pure** time-domain oscilloscope painter |
| `src/tools/audio/useRenderLoop.ts` | rAF loop; pauses on tab-hidden and on `prefers-reduced-motion` |
| `src/tools/audio/Controls.tsx` | Source toggle, mode selector, sensitivity, smoothing, palette, play/pause, volume/mute |
| `src/tools/audio/types.ts` | Shared `VisualizerConfig`, `Mode`, `Palette` types |
| `src/tools/audio/hash.ts` | Encode/decode config to/from the URL hash (mirrors EasingLab's share approach) |

### Audio engine

- A single shared `AudioContext`, created **on the first user gesture** (autoplay
  policy requires this).
- Signal graph:
  - **Synth source** → `AnalyserNode` **and** `destination` (the visitor hears
    it). Includes a gain node bound to the volume/mute control.
  - **Mic source** (`getUserMedia({ audio: true })` → `MediaStreamAudioSourceNode`)
    → `AnalyserNode` **only**, never `destination` (avoids feedback howl).
- Exactly one source active at a time. Switching stops/disconnects the other.
- **`AnalyserNode` config:** `fftSize` 2048 (1024 frequency bins);
  `smoothingTimeConstant` bound to the Smoothing control (0–0.95).
- **Cleanup / privacy:** toggling the mic off (or unmounting) calls
  `MediaStreamTrack.stop()` on every track so the OS mic indicator goes dark;
  the `AudioContext` is closed on unmount.

### Visualization — three modes (MVP)

1. **Bloom** (signature radial): low-frequency bins drive a central pulse
   radius, mid bins deform a surrounding ring, high bins spawn orbiting
   shimmer.
2. **Bars**: classic vertical frequency spectrum.
3. **Waveform**: time-domain oscilloscope from `getByteTimeDomainData`.

Each renderer is a pure function of `(frequencyData/timeData, config, ctx)`.

### Controls

Source (Synth ⇄ Mic) · Mode · Sensitivity (amplitude gain applied before
mapping) · Smoothing (`AnalyserNode.smoothingTimeConstant`) · Palette (3
presets built from the site's ink/paper/graphite + accent-gradient tokens) ·
Volume/Mute (synth only) · Play/Pause.

**Shareable config:** visual config (mode, sensitivity, smoothing, palette)
serializes to the URL hash, mirroring EasingLab. The audio **source** is
excluded — a shared link cannot auto-grant microphone access.

### Accessibility & transparency

- **Microphone privacy copy shown up-front**, adjacent to the mic toggle and
  before any permission prompt: *"Audio is analyzed in your browser and never
  recorded or sent anywhere."* A visible active-state indicates when the mic
  is live; tracks are released on toggle-off.
- **`prefers-reduced-motion`:** the visualizer defaults to **paused** with a
  calm static first frame; the visitor opts into motion via Play. (Canvas
  motion is a vestibular trigger.)
- The canvas carries `role="img"` and a descriptive `aria-label`.
- All controls are native, keyboard-accessible inputs/buttons with visible
  focus states, consistent with EasingLab.
- The synth starts at a moderate gain with a volume/mute control — no loud
  surprise on first play.

### Performance

- Canvas 2D, `devicePixelRatio`-aware backing store, `ResizeObserver` for
  responsive sizing.
- The rAF loop runs **only** while playing and the tab is visible
  (`document.hidden` / `visibilitychange`) to save CPU/battery.
- No external libraries → minimal added bundle; page stays inside the existing
  Lighthouse gate.

### Testing

- **Unit (TDD):** pure renderers and frequency-mapping helpers — feed a known
  `Uint8Array` plus a `VisualizerConfig`, assert computed geometry/values (bloom
  radius, bin→bar height, hash round-trip). The `AudioContext`, `getUserMedia`,
  and canvas glue stay dumb and untested at the unit level.
- **E2E:** add `/tools/audio` to the axe a11y routes in `tests/e2e/a11y.spec.ts`;
  smoke-test that the page loads, controls render, and there are no console
  errors. (Audio/mic is not reliably testable headless — kept light by design.)
- **Lighthouse:** verify `/tools/audio` stays within the existing performance
  gate.

## Acceptance Criteria

1. `/tools/audio/` renders the tool with the same header, footer, and color
   tokens as the rest of the site; the `audio` card on `/tools/` is now an
   available link.
2. On first interaction the synthesized demo plays and the Bloom visualization
   reacts to it; switching modes to Bars and Waveform works.
3. The microphone toggle shows privacy copy before requesting permission;
   granting it drives the visualization from live input; toggling it off
   releases the mic (OS indicator clears).
4. Sensitivity, smoothing, palette, volume/mute, and play/pause all visibly
   affect output.
5. The visual config round-trips through the URL hash (copy URL → reload →
   same mode/sensitivity/smoothing/palette).
6. With `prefers-reduced-motion: reduce`, the tool loads paused on a static
   frame and only animates after the visitor presses Play.
7. The rAF loop stops when the tab is hidden and resumes on return.
8. Unit tests for renderers/mappers/hash pass; `/tools/audio` is added to the
   axe E2E route list and passes.
9. CI green: typecheck, lint, format, unit tests, build, Playwright E2E,
   Lighthouse (per existing gates), verified locally with `pnpm ci`.

## Out of Scope (future candidates)

- File-upload audio source.
- A fourth "particle field" visualization mode.
- Beat/onset detection or BPM-synced effects.
- Saving/naming custom palettes beyond the built-in presets.
- WebGL rendering for higher particle counts.

## References

- Web Audio `AnalyserNode`: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode
- `getUserMedia` constraints: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Autoplay policy (gesture requirement): https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
- Existing pattern: `src/tools/easing/` and `src/pages/tools/easing.astro`.
- Related backlog item #2 (island hydration cost) in project memory — informs
  the `client:only` vs `client:visible` choice for tool-page islands.
