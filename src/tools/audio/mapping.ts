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

// `size` is the canvas square render dimension (the caller passes Math.min(width, height)).
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
    // Amplitude is intentionally NOT clamped: at high sensitivity the waveform overdrives past the canvas edges for a clipping effect (unlike barHeights, which clamps via applySensitivity).
    const amplitude = ((time[i] - 128) / 128) * config.sensitivity;
    out.push({ x: (i / Math.max(1, n - 1)) * width, y: mid - amplitude * mid });
  }
  return out;
}
