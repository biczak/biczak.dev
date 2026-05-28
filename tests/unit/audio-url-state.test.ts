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
