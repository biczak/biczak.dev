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
