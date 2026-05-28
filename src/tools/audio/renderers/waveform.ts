import type { Palette } from '../palettes';

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  palette: Palette,
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height);
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
  ctx.strokeStyle = palette.stops[0];
  ctx.lineWidth = 2;
  ctx.stroke();
}
