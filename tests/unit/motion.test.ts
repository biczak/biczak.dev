import { describe, it, expect } from 'vitest';
import { cssEase, prefersReducedMotionMediaQuery } from '@/design-system/motion';

describe('motion primitives', () => {
  it('formats a 4-tuple as CSS cubic-bezier', () => {
    expect(cssEase([0.2, 0.7, 0.1, 1])).toBe('cubic-bezier(0.2, 0.7, 0.1, 1)');
  });

  it('rounds to 3 decimals to avoid float noise', () => {
    expect(cssEase([0.1234567, 0.5, 0.5, 0.9876543])).toBe('cubic-bezier(0.123, 0.5, 0.5, 0.988)');
  });

  it('exposes the reduced-motion media query string', () => {
    expect(prefersReducedMotionMediaQuery).toBe('(prefers-reduced-motion: reduce)');
  });
});
