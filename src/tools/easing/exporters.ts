import type { BezierTuple } from './types';

function fmt(curve: BezierTuple): string {
  return curve.map((n) => Math.round(n * 1000) / 1000).join(', ');
}

export function exportCSS(curve: BezierTuple): string {
  return `transition-timing-function: cubic-bezier(${fmt(curve)});`;
}

export function exportJS(curve: BezierTuple): string {
  return `cubic-bezier(${fmt(curve)})`;
}

export function exportMotion(curve: BezierTuple): string {
  return `ease: [${fmt(curve)}]`;
}

export function exportSCSS(curve: BezierTuple): string {
  return `$ease-custom: cubic-bezier(${fmt(curve)});`;
}

export const EXPORT_FORMATS = [
  { id: 'css', label: 'CSS', fn: exportCSS },
  { id: 'js', label: 'JS', fn: exportJS },
  { id: 'motion', label: 'Motion', fn: exportMotion },
  { id: 'scss', label: 'SCSS', fn: exportSCSS },
] as const;

export type ExportFormatId = (typeof EXPORT_FORMATS)[number]['id'];
