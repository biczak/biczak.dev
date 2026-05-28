import { useState } from 'react';
import { EXPORT_FORMATS } from './exporters';
import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
}

export function ExportPanel({ curve }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
    } catch {
      setCopied('error');
      setTimeout(() => setCopied(null), 1600);
    }
  }

  return (
    <div className="rounded-2xl border border-paper/10 bg-graphite p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">Export</p>
      <div className="space-y-3">
        {EXPORT_FORMATS.map((format) => {
          const code = format.fn(curve);
          const justCopied = copied === format.id;
          return (
            <div key={format.id} className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 w-12 shrink-0">
                {format.label}
              </span>
              <div
                tabIndex={0}
                role="region"
                aria-label={`${format.label} export code`}
                className="flex-1 font-mono text-xs px-3 py-2 rounded-md bg-ink/60 border border-paper/5 overflow-x-auto whitespace-nowrap"
              >
                <code>{code}</code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(format.id, code)}
                className="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick whitespace-nowrap"
                aria-live="polite"
              >
                {justCopied ? '✓ copied' : 'copy'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
