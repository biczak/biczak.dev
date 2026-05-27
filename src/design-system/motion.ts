export type BezierTuple = readonly [number, number, number, number];

export const prefersReducedMotionMediaQuery = '(prefers-reduced-motion: reduce)';

export function cssEase(curve: BezierTuple): string {
  const [a, b, c, d] = curve.map((n) => Math.round(n * 1000) / 1000);
  return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}
