import { PRESETS } from './presets';
import type { BezierTuple, PresetName } from './types';

interface Props {
  active: PresetName | null;
  onSelect: (curve: BezierTuple, name: PresetName) => void;
}

export function PresetStrip({ active, onSelect }: Props) {
  return (
    <div className="overflow-x-auto pb-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-3">Presets</p>
      <div className="flex gap-2 min-w-max">
        {PRESETS.map((preset) => {
          const isActive = active === preset.name;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onSelect(preset.curve, preset.name)}
              className={`px-4 py-2 rounded-full font-mono text-xs border transition-colors duration-quick whitespace-nowrap
                ${isActive ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'}
              `}
              aria-pressed={isActive}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
