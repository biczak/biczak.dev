import { describe, it, expect } from 'vitest';
import { PRESETS, getPreset } from '@/tools/easing/presets';

describe('easing presets', () => {
  it('exposes a non-empty list of presets', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it('each preset has a 4-tuple curve with values in [-1, 2]', () => {
    for (const preset of PRESETS) {
      expect(preset.curve).toHaveLength(4);
      for (const v of preset.curve) {
        expect(v).toBeGreaterThanOrEqual(-1);
        expect(v).toBeLessThanOrEqual(2);
      }
    }
  });

  it('every preset name is unique', () => {
    const names = PRESETS.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('linear is [0, 0, 1, 1]', () => {
    expect(getPreset('linear')?.curve).toEqual([0, 0, 1, 1]);
  });

  it('getPreset returns undefined for unknown name', () => {
    // @ts-expect-error testing runtime safety
    expect(getPreset('bogus')).toBeUndefined();
  });
});
