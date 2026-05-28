import type { PaletteName } from './config';

export interface Palette {
  name: PaletteName;
  label: string;
  stops: [string, string, string]; // low → mid → high frequency colors
}

export const PALETTES: Palette[] = [
  { name: 'aurora', label: 'Aurora', stops: ['#22d3ee', '#8b5cf6', '#ec4899'] },
  { name: 'ember', label: 'Ember', stops: ['#fbbf24', '#fb7185', '#ec4899'] },
  { name: 'mono', label: 'Mono', stops: ['#e5e7ff', '#9aa0c7', '#4b5572'] },
];

export function getPalette(name: PaletteName): Palette {
  return PALETTES.find((p) => p.name === name) ?? PALETTES[0];
}
