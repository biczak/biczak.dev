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
