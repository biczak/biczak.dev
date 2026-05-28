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
