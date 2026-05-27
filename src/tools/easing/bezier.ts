import type { BezierTuple } from './types';

/**
 * Compute Y of a cubic-bezier ease (P0=(0,0), P3=(1,1)) given a normalized progress t in [0,1].
 * For CSS-style easings, t IS the parameter — we solve for the X coordinate matching t,
 * then return the Y at that coordinate. Standard browser implementation pattern.
 */
export function bezierY(curve: BezierTuple, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped === 0) return 0;
  if (clamped === 1) return 1;

  const [x1, y1, x2, y2] = curve;
  const param = solveParamForX(clamped, x1, x2);
  return cubicBezier(param, y1, y2);
}

/**
 * Sample N+1 evenly-spaced points along the curve, returning [x, y] pairs.
 * Useful for SVG path drawing.
 */
export function sampleCurve(curve: BezierTuple, steps: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push([t, bezierY(curve, t)]);
  }
  return out;
}

// --- internals ---

function cubicBezier(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return 3 * oneMinusT * oneMinusT * t * p1 + 3 * oneMinusT * t * t * p2 + t * t * t;
}

function cubicBezierDerivative(t: number, p1: number, p2: number): number {
  const oneMinusT = 1 - t;
  return 3 * oneMinusT * oneMinusT * p1 + 6 * oneMinusT * t * (p2 - p1) + 3 * t * t * (1 - p2);
}

function solveParamForX(x: number, x1: number, x2: number): number {
  let t = x;
  for (let i = 0; i < 8; i++) {
    const fx = cubicBezier(t, x1, x2) - x;
    if (Math.abs(fx) < 1e-6) return t;
    const dfx = cubicBezierDerivative(t, x1, x2);
    if (Math.abs(dfx) < 1e-6) break;
    t -= fx / dfx;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  for (let i = 0; i < 32; i++) {
    const fx = cubicBezier(t, x1, x2) - x;
    if (Math.abs(fx) < 1e-6) return t;
    if (fx > 0) hi = t;
    else lo = t;
    t = (lo + hi) / 2;
  }
  return t;
}
