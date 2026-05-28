import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  onChange: (next: BezierTuple) => void;
}

const FIELDS: Array<{ index: 0 | 1 | 2 | 3; label: string; min: number; max: number }> = [
  { index: 0, label: 'x1', min: 0, max: 1 },
  { index: 1, label: 'y1', min: -0.5, max: 1.6 },
  { index: 2, label: 'x2', min: 0, max: 1 },
  { index: 3, label: 'y2', min: -0.5, max: 1.6 },
];

export function NumericValues({ curve, onChange }: Props) {
  function handleField(index: 0 | 1 | 2 | 3, raw: string) {
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) return;
    const field = FIELDS.find((f) => f.index === index)!;
    const clamped = Math.max(field.min, Math.min(field.max, n));
    const next = [...curve] as unknown as [number, number, number, number];
    next[index] = clamped;
    onChange(next as BezierTuple);
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {FIELDS.map((field) => (
        <label key={field.label} className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-1.5">
            {field.label}
          </span>
          <input
            type="number"
            step="0.01"
            min={field.min}
            max={field.max}
            value={curve[field.index].toFixed(2)}
            onChange={(e) => handleField(field.index, (e.target as HTMLInputElement).value)}
            className="w-full bg-ink/60 border border-paper/10 rounded-md px-2 py-1.5 font-mono text-sm focus:border-cyan focus:outline-none"
          />
        </label>
      ))}
    </div>
  );
}
