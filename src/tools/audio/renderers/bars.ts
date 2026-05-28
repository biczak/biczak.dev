import type { Palette } from '../palettes';

export function drawBars(
  ctx: CanvasRenderingContext2D,
  heights: number[],
  palette: Palette,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  const gap = 2;
  const barWidth = Math.max(1, (width - gap * (heights.length - 1)) / heights.length);
  heights.forEach((h, i) => {
    const barHeight = h * height;
    ctx.fillStyle = palette.stops[Math.min(2, Math.floor(h * 3))] as string;
    ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
  });
}
