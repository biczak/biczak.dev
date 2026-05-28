import type { BezierTuple } from '@/design-system/motion';

export type { BezierTuple };

export type PresetName =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'expo-in'
  | 'expo-out'
  | 'circ-in-out'
  | 'back-out'
  | 'quart-in-out';

export interface Preset {
  name: PresetName;
  label: string;
  curve: BezierTuple;
}

export type AnimationTarget = 'translate' | 'scale' | 'stagger' | 'color' | 'rotate';

export interface EasingState {
  curve: BezierTuple;
  duration: number; // ms
  target: AnimationTarget;
  compare: PresetName | null;
}

export const DEFAULT_STATE: EasingState = {
  curve: [0.2, 0.7, 0.1, 1] as const,
  duration: 800,
  target: 'translate',
  compare: null,
};
