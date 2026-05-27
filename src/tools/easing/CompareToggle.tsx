import { PRESETS } from './presets';
import type { PresetName } from './types';

interface Props {
  value: PresetName | null;
  onChange: (next: PresetName | null) => void;
}

export function CompareToggle({ value, onChange }: Props) {
  return (
    <label className="flex items-center gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
        Compare with
      </span>
      <select
        value={value ?? ''}
        onChange={(e) => {
          const next = (e.target as HTMLSelectElement).value;
          onChange(next === '' ? null : (next as PresetName));
        }}
        className="bg-graphite border border-paper/10 rounded-full px-3 py-1.5 font-mono text-xs focus:border-cyan focus:outline-none"
      >
        <option value="">none</option>
        {PRESETS.map((preset) => (
          <option key={preset.name} value={preset.name}>
            {preset.label}
          </option>
        ))}
      </select>
    </label>
  );
}
