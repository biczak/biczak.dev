import { describe, it, expect, vi } from 'vitest';
import { drawBars } from '@/tools/audio/renderers/bars';
import { getPalette } from '@/tools/audio/palettes';

function stubCtx() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    set fillStyle(_v: string) {},
    set strokeStyle(_v: string) {},
    set lineWidth(_v: number) {},
    set globalAlpha(_v: number) {},
  } as unknown as CanvasRenderingContext2D;
}

describe('drawBars', () => {
  it('clears once and draws one rect per bar', () => {
    const ctx = stubCtx();
    drawBars(ctx, [0.1, 0.5, 1], getPalette('aurora'), 300, 200);
    expect((ctx.clearRect as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
    expect((ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(3);
  });
});
