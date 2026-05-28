import type { VisualizerConfig, Mode, Source } from './config';
import { MODES, SENSITIVITY_RANGE, SMOOTHING_RANGE } from './config';
import { PALETTES } from './palettes';

interface Props {
  config: VisualizerConfig;
  onConfigChange: (next: VisualizerConfig) => void;
  source: Source;
  onSourceChange: (next: Source) => void;
  micError: string | null;
  paused: boolean;
  onTogglePause: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
}

export function Controls({
  config,
  onConfigChange,
  source,
  onSourceChange,
  micError,
  paused,
  onTogglePause,
  volume,
  onVolumeChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-paper/10 bg-graphite p-6 space-y-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Controls</p>

      {/* Source */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Source</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Audio source">
          <button
            type="button"
            onClick={() => onSourceChange('synth')}
            aria-pressed={source === 'synth'}
            className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
              source === 'synth' ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'
            }`}
          >
            ◇ synth demo
          </button>
          <button
            type="button"
            onClick={() => onSourceChange('mic')}
            aria-pressed={source === 'mic'}
            className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
              source === 'mic' ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'
            }`}
          >
            ◉ microphone
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] opacity-50 leading-relaxed">
          Audio is analyzed in your browser and never recorded or sent anywhere.
        </p>
        {micError && (
          <p role="alert" className="mt-1 font-mono text-[10px] text-rose">
            {micError}
          </p>
        )}
      </div>

      {/* Mode */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Mode</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Visualization mode">
          {MODES.map((m: Mode) => (
            <button
              key={m}
              type="button"
              onClick={() => onConfigChange({ ...config, mode: m })}
              aria-pressed={config.mode === m}
              className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
                config.mode === m
                  ? 'border-cyan text-cyan'
                  : 'border-paper/10 hover:border-paper/30'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitivity */}
      <div>
        <label
          htmlFor="audio-sensitivity"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Sensitivity: {config.sensitivity.toFixed(2)}
        </label>
        <input
          id="audio-sensitivity"
          type="range"
          min={SENSITIVITY_RANGE.min}
          max={SENSITIVITY_RANGE.max}
          step="0.05"
          value={config.sensitivity}
          onChange={(e) => onConfigChange({ ...config, sensitivity: Number(e.target.value) })}
          className="w-full accent-cyan"
        />
      </div>

      {/* Smoothing */}
      <div>
        <label
          htmlFor="audio-smoothing"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Smoothing: {config.smoothing.toFixed(2)}
        </label>
        <input
          id="audio-smoothing"
          type="range"
          min={SMOOTHING_RANGE.min}
          max={SMOOTHING_RANGE.max}
          step="0.01"
          value={config.smoothing}
          onChange={(e) => onConfigChange({ ...config, smoothing: Number(e.target.value) })}
          className="w-full accent-cyan"
        />
      </div>

      {/* Palette */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Palette</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Color palette">
          {PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => onConfigChange({ ...config, palette: p.name })}
              aria-pressed={config.palette === p.name}
              className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick ${
                config.palette === p.name
                  ? 'border-cyan text-cyan'
                  : 'border-paper/10 hover:border-paper/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume (synth only) */}
      <div>
        <label
          htmlFor="audio-volume"
          className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
        >
          Volume: {Math.round(volume * 100)}%
        </label>
        <input
          id="audio-volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full accent-cyan"
          disabled={source !== 'synth'}
        />
      </div>

      <button
        type="button"
        onClick={onTogglePause}
        aria-pressed={paused}
        className="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick"
      >
        {paused ? '▶ play' : '⏸ pause'}
      </button>
    </div>
  );
}
