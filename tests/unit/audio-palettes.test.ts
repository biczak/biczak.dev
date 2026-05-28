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
