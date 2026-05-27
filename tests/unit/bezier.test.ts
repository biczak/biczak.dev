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
