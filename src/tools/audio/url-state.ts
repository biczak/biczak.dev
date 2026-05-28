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
