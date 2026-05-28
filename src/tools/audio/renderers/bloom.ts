import type { Palette } from '../palettes';
import type { BloomGeometry } from '../mapping';

export function drawBloom(
  ctx: CanvasRenderingContext2D,
  geo: BloomGeometry,
  palette: Palette,
  size: number,
): void {
  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);

  // Deformed mid-band ring.
  ctx.beginPath();
  const segments = 96;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const wobble = 1 + geo.ringWobble * 0.4 * Math.sin(t * 6);
    const r = geo.ringRadius * wobble;
    const x = cx + Math.cos(t) * r;
    const y = cy + Math.sin(t) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = palette.stops[1];
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central bass pulse.
  ctx.beginPath();
  ctx.arc(cx, cy, geo.pulseRadius, 0, Math.PI * 2);
  ctx.fillStyle = palette.stops[0];
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1;

  // High-band shimmer.
  ctx.fillStyle = palette.stops[2];
  for (let i = 0; i < geo.shimmerCount; i++) {
    const t = (i / geo.shimmerCount) * Math.PI * 2;
    const r = geo.ringRadius * 1.6;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(t) * r, cy + Math.sin(t) * r, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
