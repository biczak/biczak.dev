// src/tools/audio/config.ts
export type Mode = 'bloom' | 'bars' | 'waveform';
export type PaletteName = 'aurora' | 'ember' | 'mono';
export type Source = 'synth' | 'mic' | null;

export interface VisualizerConfig {
  mode: Mode;
  sensitivity: number; // 0.5 .. 3
  smoothing: number; // 0 .. 0.95
  palette: PaletteName;
}

export const MODES: readonly Mode[] = ['bloom', 'bars', 'waveform'];

export const SENSITIVITY_RANGE = { min: 0.5, max: 3 } as const;
export const SMOOTHING_RANGE = { min: 0, max: 0.95 } as const;

export const DEFAULT_CONFIG: VisualizerConfig = {
  mode: 'bloom',
  sensitivity: 1,
  smoothing: 0.8,
  palette: 'aurora',
};
