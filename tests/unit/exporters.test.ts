import { describe, it, expect } from 'vitest';
import { exportCSS, exportJS, exportMotion, exportSCSS } from '@/tools/easing/exporters';

const CURVE = [0.2, 0.7, 0.1, 1] as const;

describe('exporters', () => {
  it('exportCSS produces a transition-timing-function declaration', () => {
    expect(exportCSS(CURVE)).toBe('transition-timing-function: cubic-bezier(0.2, 0.7, 0.1, 1);');
  });

  it('exportJS produces a cubic-bezier function call', () => {
    expect(exportJS(CURVE)).toBe('cubic-bezier(0.2, 0.7, 0.1, 1)');
  });

  it('exportMotion produces a tuple for Motion/Framer Motion', () => {
    expect(exportMotion(CURVE)).toBe('ease: [0.2, 0.7, 0.1, 1]');
  });

  it('exportSCSS produces a variable declaration', () => {
    expect(exportSCSS(CURVE)).toBe('$ease-custom: cubic-bezier(0.2, 0.7, 0.1, 1);');
  });

  it('rounds values to 3 decimals', () => {
    expect(exportCSS([0.1234, 0.5, 0.5, 0.9876])).toBe(
      'transition-timing-function: cubic-bezier(0.123, 0.5, 0.5, 0.988);',
    );
  });
});
