# Spectral Bloom (Audio-Reactive Canvas) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/tools/audio/` — a client-side Web Audio + Canvas 2D visualizer ("Spectral Bloom") with a synthesized demo source and an optional live microphone, in three modes (bloom, bars, waveform).

**Architecture:** Mirror the EasingLab island convention. All frequency→geometry math lives in pure, unit-tested modules (`config.ts`, `url-state.ts`, `mapping.ts`, `palettes.ts`); browser-only glue (AudioContext, getUserMedia, rAF, canvas) lives in thin hooks/components verified by typecheck + build + Playwright rather than mocked unit tests. Visual config round-trips through the URL hash exactly like EasingLab.

**Tech Stack:** Astro 5 + React 18 island (`client:only="react"`), Web Audio `AnalyserNode`, Canvas 2D, Tailwind v4 tokens, Vitest (happy-dom), Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-05-28-audio-reactive-canvas-design.md`

---

## File Structure

**New — pure core (unit-tested):**
- `src/tools/audio/config.ts` — `VisualizerConfig`, `Mode`, `PaletteName`, `Source` types + `DEFAULT_CONFIG`
- `src/tools/audio/palettes.ts` — `Palette` type, `PALETTES`, `getPalette()`
- `src/tools/audio/url-state.ts` — `encodeConfig()` / `decodeConfig()` (clamped, validated)
- `src/tools/audio/mapping.ts` — pure `bandAverage`, `applySensitivity`, `bloomGeometry`, `barHeights`, `waveformPoints`

**New — renderers (thin; one representative unit test):**
- `src/tools/audio/renderers/bloom.ts` — `drawBloom(ctx, geo, palette, size)`
- `src/tools/audio/renderers/bars.ts` — `drawBars(ctx, heights, palette, width, height)`
- `src/tools/audio/renderers/waveform.ts` — `drawWaveform(ctx, points, palette, width, height)`

**New — browser glue (verified by build/E2E):**
- `src/tools/audio/synth.ts` — `createSynthSource(ctx)`
- `src/tools/audio/useAudioEngine.ts` — AudioContext + AnalyserNode + source switching
- `src/tools/audio/useRenderLoop.ts` — rAF loop, DPR sizing, visibility/pause gating
- `src/tools/audio/useURLConfig.ts` — hash-sync hook (mirrors `useURLState.ts`)
- `src/tools/audio/Controls.tsx` — source toggle, mode, sliders, palette, play/pause, volume
- `src/tools/audio/SpectralBloom.tsx` — root island

**New — page & tests:**
- `src/pages/tools/audio.astro` — tool page
- `tests/unit/audio-url-state.test.ts`, `tests/unit/audio-mapping.test.ts`, `tests/unit/audio-palettes.test.ts`, `tests/unit/audio-renderers.test.ts`

**Modified:**
- `src/content/site.ts` — flip `audio` to available + rename to "Spectral Bloom"; fix GitHub handle `alexbiczak` → `biczak`
- `tests/e2e/a11y.spec.ts` — add `/tools/audio` to axe routes

---

## Task 1: Config types

**Files:**
- Create: `src/tools/audio/config.ts`

- [ ] **Step 1: Write the config module**

```ts
// src/tools/audio/config.ts
export type Mode = 'bloom' | 'bars' | 'waveform';
export type PaletteName = 'aurora' | 'ember' | 'mono';
export type Source = 'synth' | 'mic' | null;

export interface VisualizerConfig {
  mode: Mode;
  sensitivity: number; // 0.5 .. 3
  smoothing: number; // 0 .. 0.95
  palette: PaletteName;
}

export const MODES: readonly Mode[] = ['bloom', 'bars', 'waveform'];

export const SENSITIVITY_RANGE = { min: 0.5, max: 3 } as const;
export const SMOOTHING_RANGE = { min: 0, max: 0.95 } as const;

export const DEFAULT_CONFIG: VisualizerConfig = {
  mode: 'bloom',
  sensitivity: 1,
  smoothing: 0.8,
  palette: 'aurora',
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/config.ts
git commit -m "feat(audio): visualizer config types and defaults"
```

---

## Task 2: Palettes

**Files:**
- Create: `src/tools/audio/palettes.ts`
- Test: `tests/unit/audio-palettes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audio-palettes.test.ts
import { describe, it, expect } from 'vitest';
import { PALETTES, getPalette } from '@/tools/audio/palettes';

describe('palettes', () => {
  it('exposes the three named palettes', () => {
    expect(PALETTES.map((p) => p.name)).toEqual(['aurora', 'ember', 'mono']);
  });

  it('every palette has three hex stops', () => {
    for (const p of PALETTES) {
      expect(p.stops).toHaveLength(3);
      for (const stop of p.stops) expect(stop).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('getPalette returns the matching palette', () => {
    expect(getPalette('ember').label).toBe('Ember');
  });

  it('getPalette falls back to aurora for an unknown name', () => {
    // @ts-expect-error testing runtime fallback
    expect(getPalette('nope').name).toBe('aurora');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- audio-palettes`
Expected: FAIL — cannot find module `@/tools/audio/palettes`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/tools/audio/palettes.ts
import type { PaletteName } from './config';

export interface Palette {
  name: PaletteName;
  label: string;
  stops: [string, string, string]; // low → mid → high frequency colors
}

export const PALETTES: Palette[] = [
  { name: 'aurora', label: 'Aurora', stops: ['#22d3ee', '#8b5cf6', '#ec4899'] },
  { name: 'ember', label: 'Ember', stops: ['#fbbf24', '#fb7185', '#ec4899'] },
  { name: 'mono', label: 'Mono', stops: ['#e5e7ff', '#9aa0c7', '#4b5572'] },
];

export function getPalette(name: PaletteName): Palette {
  return PALETTES.find((p) => p.name === name) ?? PALETTES[0];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- audio-palettes`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tools/audio/palettes.ts tests/unit/audio-palettes.test.ts
git commit -m "feat(audio): frequency palettes built from design tokens"
```

---

## Task 3: URL-hash codec

**Files:**
- Create: `src/tools/audio/url-state.ts`
- Test: `tests/unit/audio-url-state.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audio-url-state.test.ts
import { describe, it, expect } from 'vitest';
import { encodeConfig, decodeConfig } from '@/tools/audio/url-state';
import { DEFAULT_CONFIG } from '@/tools/audio/config';

describe('audio url state', () => {
  it('encodes config to a query-string-style hash', () => {
    expect(encodeConfig({ mode: 'bloom', sensitivity: 1, smoothing: 0.8, palette: 'aurora' })).toBe(
      'm=bloom&se=1&sm=0.8&p=aurora',
    );
  });

  it('decodes a full hash back to config', () => {
    expect(decodeConfig('m=bars&se=2&sm=0.5&p=ember')).toEqual({
      mode: 'bars',
      sensitivity: 2,
      smoothing: 0.5,
      palette: 'ember',
    });
  });

  it('ignores a leading # in the input', () => {
    expect(decodeConfig('#m=waveform&se=1&sm=0&p=mono').mode).toBe('waveform');
  });

  it('returns defaults for an empty hash', () => {
    expect(decodeConfig('')).toEqual(DEFAULT_CONFIG);
  });

  it('falls back to defaults on unknown enum values', () => {
    expect(decodeConfig('m=spiral&se=1&sm=0.8&p=neon')).toEqual(DEFAULT_CONFIG);
  });

  it('clamps numeric values into their valid ranges', () => {
    const c = decodeConfig('m=bloom&se=99&sm=5&p=aurora');
    expect(c.sensitivity).toBe(3);
    expect(c.smoothing).toBe(0.95);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- audio-url-state`
Expected: FAIL — cannot find module `@/tools/audio/url-state`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/tools/audio/url-state.ts
import type { VisualizerConfig, Mode, PaletteName } from './config';
import { DEFAULT_CONFIG, MODES, SENSITIVITY_RANGE, SMOOTHING_RANGE } from './config';
import { PALETTES } from './palettes';

const PALETTE_NAMES: readonly PaletteName[] = PALETTES.map((p) => p.name);

export function encodeConfig(config: VisualizerConfig): string {
  return [
    `m=${config.mode}`,
    `se=${fmt(config.sensitivity)}`,
    `sm=${fmt(config.smoothing)}`,
    `p=${config.palette}`,
  ].join('&');
}

export function decodeConfig(input: string): VisualizerConfig {
  const cleaned = input.startsWith('#') ? input.slice(1) : input;
  if (!cleaned) return DEFAULT_CONFIG;

  const params = new URLSearchParams(cleaned);
  const mode = parseEnum(params.get('m'), MODES) as Mode | null;
  const palette = parseEnum(params.get('p'), PALETTE_NAMES) as PaletteName | null;
  const sensitivity = parseNumber(params.get('se'), SENSITIVITY_RANGE);
  const smoothing = parseNumber(params.get('sm'), SMOOTHING_RANGE);

  if (!mode || !palette || sensitivity === null || smoothing === null) return DEFAULT_CONFIG;
  return { mode, sensitivity, smoothing, palette };
}

function parseEnum(raw: string | null, allowed: readonly string[]): string | null {
  if (!raw) return null;
  return allowed.includes(raw) ? raw : null;
}

function parseNumber(raw: string | null, range: { min: number; max: number }): number | null {
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n)) return null;
  return clamp(n, range.min, range.max);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function fmt(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- audio-url-state`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/tools/audio/url-state.ts tests/unit/audio-url-state.test.ts
git commit -m "feat(audio): URL-hash codec for shareable visualizer config"
```

---

## Task 4: Frequency→geometry mapping (pure core)

**Files:**
- Create: `src/tools/audio/mapping.ts`
- Test: `tests/unit/audio-mapping.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audio-mapping.test.ts
import { describe, it, expect } from 'vitest';
import {
  bandAverage,
  applySensitivity,
  bloomGeometry,
  barHeights,
  waveformPoints,
} from '@/tools/audio/mapping';
import { DEFAULT_CONFIG } from '@/tools/audio/config';

function freqOf(len: number, fill = 0): Uint8Array {
  return new Uint8Array(len).fill(fill);
}

describe('bandAverage', () => {
  it('averages an inclusive bin range normalized to 0..1', () => {
    const f = Uint8Array.from([255, 255, 0, 0]);
    expect(bandAverage(f, 0, 1)).toBeCloseTo(1);
    expect(bandAverage(f, 2, 3)).toBeCloseTo(0);
    expect(bandAverage(f, 0, 3)).toBeCloseTo(0.5);
  });
});

describe('applySensitivity', () => {
  it('scales and clamps to 0..1', () => {
    expect(applySensitivity(0.4, 2)).toBeCloseTo(0.8);
    expect(applySensitivity(0.9, 2)).toBe(1);
    expect(applySensitivity(0, 3)).toBe(0);
  });
});

describe('bloomGeometry', () => {
  it('returns the minimum pulse radius for silence', () => {
    const geo = bloomGeometry(freqOf(100), DEFAULT_CONFIG, 400);
    expect(geo.pulseRadius).toBeCloseTo(20); // 0.05 * 400
  });

  it('grows the pulse radius with bass energy', () => {
    const f = freqOf(100);
    for (let i = 0; i < 10; i++) f[i] = 255; // first 10% = bass band
    const geo = bloomGeometry(f, DEFAULT_CONFIG, 400);
    expect(geo.pulseRadius).toBeCloseTo(120); // 0.30 * 400
  });
});

describe('barHeights', () => {
  it('returns `count` normalized heights', () => {
    const heights = barHeights(freqOf(256, 255), DEFAULT_CONFIG, 16);
    expect(heights).toHaveLength(16);
    for (const h of heights) expect(h).toBeCloseTo(1);
  });

  it('is all zero for silence', () => {
    expect(barHeights(freqOf(256), DEFAULT_CONFIG, 8).every((h) => h === 0)).toBe(true);
  });
});

describe('waveformPoints', () => {
  it('maps a silent (128) signal to the vertical midline', () => {
    const pts = waveformPoints(freqOf(64, 128), DEFAULT_CONFIG, 320, 200);
    for (const p of pts) expect(p.y).toBeCloseTo(100); // height / 2
    expect(pts[0].x).toBe(0);
    expect(pts[pts.length - 1].x).toBeCloseTo(320);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- audio-mapping`
Expected: FAIL — cannot find module `@/tools/audio/mapping`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/tools/audio/mapping.ts
import type { VisualizerConfig } from './config';

const BLOOM_MIN = 0.05; // fraction of size
const BLOOM_MAX = 0.3;
const RING_BASE = 0.18;
const MAX_SHIMMER = 60;

export function bandAverage(freq: Uint8Array, loBin: number, hiBin: number): number {
  const lo = Math.max(0, loBin);
  const hi = Math.min(freq.length - 1, hiBin);
  if (hi < lo) return 0;
  let sum = 0;
  for (let i = lo; i <= hi; i++) sum += freq[i];
  return sum / (hi - lo + 1) / 255;
}

export function applySensitivity(value: number, sensitivity: number): number {
  return Math.max(0, Math.min(1, value * sensitivity));
}

export interface BloomGeometry {
  pulseRadius: number;
  ringRadius: number;
  ringWobble: number; // 0..1 mid-band deformation
  shimmerCount: number; // integer, driven by highs
}

export function bloomGeometry(
  freq: Uint8Array,
  config: VisualizerConfig,
  size: number,
): BloomGeometry {
  const n = freq.length;
  const bass = applySensitivity(bandAverage(freq, 0, Math.floor(n * 0.1) - 1), config.sensitivity);
  const mid = applySensitivity(
    bandAverage(freq, Math.floor(n * 0.1), Math.floor(n * 0.5) - 1),
    config.sensitivity,
  );
  const high = applySensitivity(
    bandAverage(freq, Math.floor(n * 0.5), n - 1),
    config.sensitivity,
  );
  return {
    pulseRadius: size * (BLOOM_MIN + bass * (BLOOM_MAX - BLOOM_MIN)),
    ringRadius: size * RING_BASE,
    ringWobble: mid,
    shimmerCount: Math.round(high * MAX_SHIMMER),
  };
}

export function barHeights(freq: Uint8Array, config: VisualizerConfig, count: number): number[] {
  const out: number[] = [];
  const per = freq.length / count;
  for (let i = 0; i < count; i++) {
    const lo = Math.floor(i * per);
    const hi = Math.floor((i + 1) * per) - 1;
    out.push(applySensitivity(bandAverage(freq, lo, hi), config.sensitivity));
  }
  return out;
}

export function waveformPoints(
  time: Uint8Array,
  config: VisualizerConfig,
  width: number,
  height: number,
): { x: number; y: number }[] {
  const mid = height / 2;
  const n = time.length;
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const amplitude = ((time[i] - 128) / 128) * config.sensitivity;
    out.push({ x: (i / (n - 1)) * width, y: mid - amplitude * mid });
  }
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- audio-mapping`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/tools/audio/mapping.ts tests/unit/audio-mapping.test.ts
git commit -m "feat(audio): pure frequency-to-geometry mapping with TDD"
```

---

## Task 5: Renderers

**Files:**
- Create: `src/tools/audio/renderers/bloom.ts`, `src/tools/audio/renderers/bars.ts`, `src/tools/audio/renderers/waveform.ts`
- Test: `tests/unit/audio-renderers.test.ts`

- [ ] **Step 1: Write the failing test (bars renderer contract)**

```ts
// tests/unit/audio-renderers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { drawBars } from '@/tools/audio/renderers/bars';
import { getPalette } from '@/tools/audio/palettes';

function stubCtx() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    set fillStyle(_v: string) {},
    set strokeStyle(_v: string) {},
    set lineWidth(_v: number) {},
    set globalAlpha(_v: number) {},
  } as unknown as CanvasRenderingContext2D;
}

describe('drawBars', () => {
  it('clears once and draws one rect per bar', () => {
    const ctx = stubCtx();
    drawBars(ctx, [0.1, 0.5, 1], getPalette('aurora'), 300, 200);
    expect((ctx.clearRect as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
    expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- audio-renderers`
Expected: FAIL — cannot find module `@/tools/audio/renderers/bars`.

- [ ] **Step 3: Write the three renderers**

```ts
// src/tools/audio/renderers/bars.ts
import type { Palette } from '../palettes';

export function drawBars(
  ctx: CanvasRenderingContext2D,
  heights: number[],
  palette: Palette,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const gap = 2;
  const barWidth = (width - gap * (heights.length - 1)) / heights.length;
  heights.forEach((h, i) => {
    const barHeight = h * height;
    ctx.fillStyle = palette.stops[Math.min(2, Math.floor(h * 3))];
    ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
  });
}
```

```ts
// src/tools/audio/renderers/waveform.ts
import type { Palette } from '../palettes';

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  palette: Palette,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = palette.stops[0];
  ctx.lineWidth = 2;
  ctx.stroke();
}
```

```ts
// src/tools/audio/renderers/bloom.ts
import type { Palette } from '../palettes';
import type { BloomGeometry } from '../mapping';

export function drawBloom(
  ctx: CanvasRenderingContext2D,
  geo: BloomGeometry,
  palette: Palette,
  size: number,
): void {
  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Deformed mid-band ring.
  ctx.beginPath();
  const segments = 96;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const wobble = 1 + geo.ringWobble * 0.4 * Math.sin(t * 6);
    const r = geo.ringRadius * wobble;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = palette.stops[1];
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central bass pulse.
  ctx.beginPath();
  ctx.arc(cx, cy, geo.pulseRadius, 0, Math.PI * 2);
  ctx.fillStyle = palette.stops[0];
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // High-band shimmer.
  ctx.fillStyle = palette.stops[2];
  for (let i = 0; i < geo.shimmerCount; i++) {
    const t = (i / geo.shimmerCount) * Math.PI * 2;
    const r = geo.ringRadius * 1.6;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(t) * r, cy + Math.sin(t) * r, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- audio-renderers`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/tools/audio/renderers tests/unit/audio-renderers.test.ts
git commit -m "feat(audio): canvas renderers for bloom, bars, and waveform"
```

---

## Task 6: Synth source

**Files:**
- Create: `src/tools/audio/synth.ts`

> Browser-only glue. No unit test (Web Audio graph is not meaningfully unit-testable in happy-dom); verified by build + manual/E2E in Task 13.

- [ ] **Step 1: Write the synth source**

```ts
// src/tools/audio/synth.ts
export interface SynthSource {
  output: AudioNode; // connect to the analyser (and, for synth, to destination)
  start(): void;
  stop(): void;
}

// An evolving ambient drone: two detuned saw oscillators + filtered noise,
// with a slow LFO sweeping the low-pass cutoff for spectral movement.
export function createSynthSource(ctx: AudioContext): SynthSource {
  const out = ctx.createGain();
  out.gain.value = 1;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 8;
  filter.connect(out);

  const oscA = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscA.frequency.value = 110;
  const oscB = ctx.createOscillator();
  oscB.type = 'sawtooth';
  oscB.frequency.value = 110;
  oscB.detune.value = 8;
  oscA.connect(filter);
  oscB.connect(filter);

  // Filtered noise for high-frequency content.
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.15;
  noise.connect(noiseGain).connect(filter);

  // Slow cutoff LFO.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 600;
  lfo.connect(lfoGain).connect(filter.frequency);

  let started = false;
  return {
    output: out,
    start() {
      if (started) return;
      started = true;
      oscA.start();
      oscB.start();
      noise.start();
      lfo.start();
    },
    stop() {
      if (!started) return;
      started = false;
      [oscA, oscB, noise, lfo].forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      out.disconnect();
    },
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/synth.ts
git commit -m "feat(audio): generative ambient synth demo source"
```

---

## Task 7: Audio engine hook

**Files:**
- Create: `src/tools/audio/useAudioEngine.ts`

> Browser-only glue. No unit test; verified by build + E2E.

- [ ] **Step 1: Write the engine hook**

```ts
// src/tools/audio/useAudioEngine.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Source } from './config';
import { createSynthSource, type SynthSource } from './synth';

export interface AudioEngine {
  source: Source;
  micError: string | null;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  setSource: (next: Source) => Promise<void>;
  setSmoothing: (value: number) => void;
  setVolume: (value: number) => void;
}

export function useAudioEngine(): AudioEngine {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef<GainNode | null>(null);
  const synthRef = useRef<SynthSource | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [source, setSourceState] = useState<Source>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    const volume = ctx.createGain();
    volume.gain.value = 0.8;
    volume.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    volumeRef.current = volume;
    return ctx;
  }, []);

  const teardownSources = useCallback(() => {
    synthRef.current?.stop();
    synthRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  }, []);

  const setSource = useCallback(
    async (next: Source) => {
      setMicError(null);
      const ctx = ensureContext();
      await ctx.resume();
      teardownSources();

      if (next === 'synth') {
        const synth = createSynthSource(ctx);
        synth.output.connect(analyserRef.current!);
        synth.output.connect(volumeRef.current!); // audible
        synth.start();
        synthRef.current = synth;
        setSourceState('synth');
      } else if (next === 'mic') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          const micNode = ctx.createMediaStreamSource(stream);
          micNode.connect(analyserRef.current!); // analyser only — never destination
          setSourceState('mic');
        } catch {
          setMicError('Microphone access was blocked. Check your browser permissions.');
          setSourceState(null);
        }
      } else {
        setSourceState(null);
      }
    },
    [ensureContext, teardownSources],
  );

  const setSmoothing = useCallback((value: number) => {
    if (analyserRef.current) analyserRef.current.smoothingTimeConstant = value;
  }, []);

  const setVolume = useCallback((value: number) => {
    if (volumeRef.current) volumeRef.current.gain.value = value;
  }, []);

  useEffect(() => {
    return () => {
      teardownSources();
      ctxRef.current?.close();
    };
  }, [teardownSources]);

  return { source, micError, analyserRef, setSource, setSmoothing, setVolume };
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/useAudioEngine.ts
git commit -m "feat(audio): AudioContext engine with synth/mic source switching"
```

---

## Task 8: Render loop hook

**Files:**
- Create: `src/tools/audio/useRenderLoop.ts`

> Browser-only glue. No unit test; verified by build + E2E.

- [ ] **Step 1: Write the render loop hook**

```ts
// src/tools/audio/useRenderLoop.ts
import { useEffect } from 'react';
import type { VisualizerConfig } from './config';
import { getPalette } from './palettes';
import { bloomGeometry, barHeights, waveformPoints } from './mapping';
import { drawBloom } from './renderers/bloom';
import { drawBars } from './renderers/bars';
import { drawWaveform } from './renderers/waveform';

interface Options {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  config: VisualizerConfig;
  paused: boolean;
}

export function useRenderLoop({ canvasRef, analyserRef, config, paused }: Options): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const palette = getPalette(config.palette);

    const frame = () => {
      const analyser = analyserRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (analyser) {
        if (config.mode === 'waveform') {
          const time = new Uint8Array(analyser.fftSize);
          analyser.getByteTimeDomainData(time);
          drawWaveform(ctx, waveformPoints(time, config, w, h), palette, w, h);
        } else {
          const freq = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(freq);
          if (config.mode === 'bloom') {
            drawBloom(ctx, bloomGeometry(freq, config, Math.min(w, h)), palette, Math.min(w, h));
          } else {
            drawBars(ctx, barHeights(freq, config, 48), palette, w, h);
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    if (!paused) raf = requestAnimationFrame(frame);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!paused) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, analyserRef, config, paused]);
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/useRenderLoop.ts
git commit -m "feat(audio): rAF render loop with DPR sizing and visibility gating"
```

---

## Task 9: URL-config hook

**Files:**
- Create: `src/tools/audio/useURLConfig.ts`

> Mirrors `src/tools/easing/useURLState.ts`. No unit test (the codec it wraps is tested in Task 3).

- [ ] **Step 1: Write the hook**

```ts
// src/tools/audio/useURLConfig.ts
import { useEffect, useRef, useState } from 'react';
import { decodeConfig, encodeConfig } from './url-state';
import type { VisualizerConfig } from './config';
import { DEFAULT_CONFIG } from './config';

export function useURLConfig(): [VisualizerConfig, (next: VisualizerConfig) => void] {
  const [config, setConfig] = useState<VisualizerConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    return decodeConfig(window.location.hash);
  });
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      setConfig(decodeConfig(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = `#${encodeConfig(config)}`;
    if (window.location.hash !== hash) {
      skipNextSyncRef.current = true;
      window.history.replaceState(null, '', hash);
    }
  }, [config]);

  return [config, setConfig];
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/useURLConfig.ts
git commit -m "feat(audio): URL-hash sync hook for visualizer config"
```

---

## Task 10: Controls component

**Files:**
- Create: `src/tools/audio/Controls.tsx`

> Follows EasingLab's control markup/token idioms (`border-paper/10`, `text-cyan`, `font-mono`, `duration-quick`, `aria-pressed`). Verified by build + axe E2E.

- [ ] **Step 1: Write the Controls component**

```tsx
// src/tools/audio/Controls.tsx
import type { VisualizerConfig, Mode, Source } from './config';
import { MODES, SENSITIVITY_RANGE, SMOOTHING_RANGE } from './config';
import { PALETTES } from './palettes';

interface Props {
  config: VisualizerConfig;
  onConfigChange: (next: VisualizerConfig) => void;
  source: Source;
  onSourceChange: (next: Source) => void;
  micError: string | null;
  paused: boolean;
  onTogglePause: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
}

export function Controls({
  config,
  onConfigChange,
  source,
  onSourceChange,
  micError,
  paused,
  onTogglePause,
  volume,
  onVolumeChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-paper/10 bg-graphite p-6 space-y-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Controls</p>

      {/* Source */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Source</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Audio source">
          <button
            type="button"
            onClick={() => onSourceChange('synth')}
            aria-pressed={source === 'synth'}
            className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
              source === 'synth' ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'
            }`}
          >
            ◇ synth demo
          </button>
          <button
            type="button"
            onClick={() => onSourceChange('mic')}
            aria-pressed={source === 'mic'}
            className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
              source === 'mic' ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'
            }`}
          >
            ◉ microphone
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] opacity-50 leading-relaxed">
          Audio is analyzed in your browser and never recorded or sent anywhere.
        </p>
        {micError && (
          <p role="alert" className="mt-1 font-mono text-[10px] text-rose">
            {micError}
          </p>
        )}
      </div>

      {/* Mode */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Mode</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Visualization mode">
          {MODES.map((m: Mode) => (
            <button
              key={m}
              type="button"
              onClick={() => onConfigChange({ ...config, mode: m })}
              aria-pressed={config.mode === m}
              className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
                config.mode === m ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitivity */}
      <div>
        <label
          htmlFor="audio-sensitivity"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Sensitivity: {config.sensitivity.toFixed(2)}
        </label>
        <input
          id="audio-sensitivity"
          type="range"
          min={SENSITIVITY_RANGE.min}
          max={SENSITIVITY_RANGE.max}
          step="0.05"
          value={config.sensitivity}
          onChange={(e) => onConfigChange({ ...config, sensitivity: Number(e.target.value) })}
          className="w-full accent-cyan"
        />
      </div>

      {/* Smoothing */}
      <div>
        <label
          htmlFor="audio-smoothing"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Smoothing: {config.smoothing.toFixed(2)}
        </label>
        <input
          id="audio-smoothing"
          type="range"
          min={SMOOTHING_RANGE.min}
          max={SMOOTHING_RANGE.max}
          step="0.01"
          value={config.smoothing}
          onChange={(e) => onConfigChange({ ...config, smoothing: Number(e.target.value) })}
          className="w-full accent-cyan"
        />
      </div>

      {/* Palette */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Palette</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Color palette">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => onConfigChange({ ...config, palette: p.name })}
              aria-pressed={config.palette === p.name}
              className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
                config.palette === p.name
                  ? 'border-cyan text-cyan'
                  : 'border-paper/10 hover:border-paper/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume (synth only) */}
      <div>
        <label
          htmlFor="audio-volume"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          id="audio-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full accent-cyan"
          disabled={source !== 'synth'}
        />
      </div>

      <button
        type="button"
        onClick={onTogglePause}
        aria-pressed={paused}
        className="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick"
      >
        {paused ? '▶ play' : '⏸ pause'}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/Controls.tsx
git commit -m "feat(audio): controls panel (source, mode, sliders, palette, transport)"
```

---

## Task 11: Root island

**Files:**
- Create: `src/tools/audio/SpectralBloom.tsx`

- [ ] **Step 1: Write the root island**

```tsx
// src/tools/audio/SpectralBloom.tsx
import { useEffect, useRef, useState } from 'react';
import { Controls } from './Controls';
import { useURLConfig } from './useURLConfig';
import { useAudioEngine } from './useAudioEngine';
import { useRenderLoop } from './useRenderLoop';
import type { Source } from './config';
import { prefersReducedMotion } from '@/lib/reduced-motion';

export function SpectralBloom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useURLConfig();
  const engine = useAudioEngine();
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const startedOnceRef = useRef(false);

  // Keep the analyser smoothing in sync with the config slider.
  useEffect(() => {
    engine.setSmoothing(config.smoothing);
  }, [config.smoothing, engine]);

  useRenderLoop({ canvasRef, analyserRef: engine.analyserRef, config, paused });

  async function handleSource(next: Source) {
    await engine.setSource(next);
    startedOnceRef.current = true;
    // Honor reduced-motion: stay paused until the visitor presses play.
    if (!prefersReducedMotion()) setPaused(false);
  }

  function handleVolume(v: number) {
    setVolume(v);
    engine.setVolume(v);
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-paper/10 bg-graphite p-4">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Audio visualization in ${config.mode} mode${
              engine.source ? `, reacting to the ${engine.source} source` : ', idle'
            }`}
            className="w-full aspect-square md:aspect-video rounded-xl bg-ink"
          />
          {!startedOnceRef.current && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
              Pick a source to begin
            </p>
          )}
        </div>
      </div>
      <div className="lg:col-span-4">
        <Controls
          config={config}
          onConfigChange={setConfig}
          source={engine.source}
          onSourceChange={handleSource}
          micError={engine.micError}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          volume={volume}
          onVolumeChange={handleVolume}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/tools/audio/SpectralBloom.tsx
git commit -m "feat(audio): SpectralBloom root island wiring engine, loop, controls"
```

---

## Task 12: Tool page

**Files:**
- Create: `src/pages/tools/audio.astro`

- [ ] **Step 1: Write the page (modeled on `easing.astro`)**

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
import GradientText from '@/components/GradientText.astro';
import { SpectralBloom } from '@/tools/audio/SpectralBloom';
---

<BaseLayout
  title="Spectral Bloom"
  description="An audio-reactive Canvas visualizer — synthesized demo or live microphone, rendered as a radial bloom, bars, or waveform. All in your browser."
>
  <Header />
  <main class="mx-auto max-w-7xl px-6 pt-32 pb-24">
    <p class="font-mono text-xs uppercase tracking-[0.2em] opacity-60 mb-6">Tool — 02</p>
    <h1 class="font-display text-4xl md:text-6xl leading-[1.05] tracking-[-0.03em] max-w-4xl">
      <GradientText>Spectral</GradientText> Bloom
    </h1>
    <p class="mt-6 max-w-2xl opacity-75 text-lg">
      Web Audio frequency data, painted to canvas in real time. Play the synthesized demo or switch
      to your microphone — audio is analyzed in your browser and never leaves it. Your mode,
      sensitivity, smoothing, and palette live in the URL, so any view is shareable.
    </p>
    <div class="mt-16 min-h-[600px]">
      <SpectralBloom client:only="react" />
    </div>
  </main>
  <Footer sourcePath="src/tools/audio" />
</BaseLayout>
```

- [ ] **Step 2: Build to verify the page compiles**

Run: `pnpm build`
Expected: PASS — build output lists `/tools/audio/index.html`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/tools/audio.astro
git commit -m "feat(audio): /tools/audio page hosting the Spectral Bloom island"
```

---

## Task 13: Catalog update + GitHub-handle fix

**Files:**
- Modify: `src/content/site.ts`

- [ ] **Step 1: Update the `audio` catalog entry**

In `src/content/site.ts`, replace the `audio` tool object:

```ts
    {
      slug: 'audio',
      name: 'Spectral Bloom',
      summary:
        'Synthesized or live audio rendered as a reactive radial bloom, bars, or waveform — all in-browser.',
      skills: 'WebAudio · Canvas · Perf',
      available: true,
    },
```

- [ ] **Step 2: Fix the live GitHub handle (promised in this PR)**

In the same file, change the GitHub social link and the repo URL from the `alexbiczak` placeholder to the real `biczak` account:

```ts
  socials: [
    { label: 'GitHub', href: 'https://github.com/biczak' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/alexbiczak' },
  ],
```

```ts
  repo: 'https://github.com/biczak/biczak.dev',
```

> Note: LinkedIn handle and the contact email are intentionally left for the deferred content session — they are not yet confirmed.

- [ ] **Step 3: Build to verify the gallery renders the available card**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content/site.ts
git commit -m "feat(audio): publish Spectral Bloom in catalog; fix GitHub handle"
```

---

## Task 14: E2E a11y route

**Files:**
- Modify: `tests/e2e/a11y.spec.ts`

- [ ] **Step 1: Add `/tools/audio` to the axe route list**

```ts
const routes = ['/', '/tools', '/tools/easing', '/tools/audio'];
```

- [ ] **Step 2: Run the a11y E2E against the new route**

Run: `pnpm e2e --project=chromium`
Expected: PASS — `axe: no violations on /tools/audio` is green. If axe flags the disabled volume slider or a control, fix the markup in `Controls.tsx` (e.g. ensure every input has an associated label) and re-run.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/a11y.spec.ts
git commit -m "test(audio): cover /tools/audio in axe a11y E2E"
```

---

## Task 15: Full local CI gate

- [ ] **Step 1: Run the complete pipeline**

Run: `pnpm ci`
Expected: PASS — typecheck, lint, format:check, unit tests, build, and Playwright (chromium) all green.

- [ ] **Step 2: Fix any formatting drift**

If `format:check` fails, run `pnpm format` and re-run `pnpm ci`. (See project memory on the `prettier-plugin-astro` --write/--stdin determinism quirk if `audio.astro` formatting oscillates — use `git show HEAD:src/pages/tools/audio.astro | pnpm exec prettier --stdin-filepath src/pages/tools/audio.astro` to settle it.)

- [ ] **Step 3: Manual smoke test in a real browser**

Run: `pnpm dev`, open `/tools/audio`, then verify:
- Clicking "synth demo" starts audio and the Bloom animates.
- Switching to Bars and Waveform changes the rendering.
- Sensitivity / smoothing / palette / volume visibly change output.
- "microphone" shows the privacy line, requests permission, reacts to input, and releases the mic (OS indicator clears) when switching back to synth.
- Reloading after changing controls preserves the config (hash round-trip).
- With OS "reduce motion" enabled, the tool stays paused until Play is pressed.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore(audio): final CI and formatting pass"
```

---

## Self-Review (completed during planning)

- **Spec coverage:** sources (synth Task 6 / mic Task 7), three modes (Tasks 4–5, 8), controls (Task 10), hash sharing (Tasks 3, 9), mic privacy copy + track release (Tasks 7, 10), reduced-motion paused default (Task 11), visibility/perf gating (Task 8), `client:only` mount (Task 12), catalog rename + availability (Task 13), axe route + unit tests (Tasks 2–5, 14), `pnpm ci` gate (Task 15) — all mapped.
- **Placeholder scan:** none — every code step contains complete source.
- **Type consistency:** `VisualizerConfig`, `Mode`, `Source`, `PaletteName`, `Palette`, `BloomGeometry`, `SynthSource`, `AudioEngine` and the `encodeConfig/decodeConfig/bandAverage/applySensitivity/bloomGeometry/barHeights/waveformPoints/drawBloom/drawBars/drawWaveform/createSynthSource/useAudioEngine/useRenderLoop/useURLConfig` signatures are consistent across tasks.
```
