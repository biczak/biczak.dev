import type { Preset, PresetName, BezierTuple } from './types';

export const PRESETS: readonly Preset[] = [
  { name: 'linear', label: 'linear', curve: [0, 0, 1, 1] },
  { name: 'ease', label: 'ease', curve: [0.25, 0.1, 0.25, 1] },
  { name: 'ease-in', label: 'ease-in', curve: [0.42, 0, 1, 1] },
  { name: 'ease-out', label: 'ease-out', curve: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', label: 'ease-in-out', curve: [0.42, 0, 0.58, 1] },
  { name: 'expo-in', label: 'expo in', curve: [0.7, 0, 0.84, 0] },
  { name: 'expo-out', label: 'expo out', curve: [0.16, 1, 0.3, 1] },
  { name: 'circ-in-out', label: 'circ in-out', curve: [0.85, 0, 0.15, 1] },
  { name: 'back-out', label: 'back out', curve: [0.34, 1.56, 0.64, 1] },
  { name: 'quart-in-out', label: 'quart in-out', curve: [0.76, 0, 0.24, 1] },
] as const;

const lookup = new Map<string, Preset>(PRESETS.map((p) => [p.name, p]));

export function getPreset(name: PresetName): Preset | undefined {
  return lookup.get(name);
}

export function getPresetCurve(name: PresetName): BezierTuple | undefined {
  return lookup.get(name)?.curve;
}
