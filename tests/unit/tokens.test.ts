import { describe, it, expect } from 'vitest';
import { colors, durations, easings } from '@/design-system/tokens';

describe('design tokens', () => {
  it('exposes the Voltage palette', () => {
    expect(colors.ink).toBe('#07091a');
    expect(colors.paper).toBe('#e5e7ff');
    expect(colors.cyan).toBe('#22d3ee');
    expect(colors.violet).toBe('#8b5cf6');
    expect(colors.rose).toBe('#ec4899');
    expect(colors.graphite).toBe('#14171f');
  });

  it('exposes the duration scale', () => {
    expect(durations.flash).toBe(80);
    expect(durations.quick).toBe(180);
    expect(durations.base).toBe(320);
    expect(durations.slow).toBe(560);
  });

  it('exposes house easings', () => {
    expect(easings.entrance).toEqual([0.2, 0.7, 0.1, 1]);
    expect(easings.spring).toEqual({ stiffness: 400, damping: 30 });
  });
});
