import { useEffect, useState } from 'react';
import { CurveEditor } from './CurveEditor';
import { AnimationPlayground } from './AnimationPlayground';
import { PresetStrip } from './PresetStrip';
import { CompareToggle } from './CompareToggle';
import { ExportPanel } from './ExportPanel';
import { NumericValues } from './NumericValues';
import { useURLState } from './useURLState';
import { getPresetCurve, PRESETS } from './presets';
import type { AnimationTarget, BezierTuple, PresetName } from './types';
import { subscribeReducedMotion, prefersReducedMotion } from '@/lib/reduced-motion';

const TARGETS: AnimationTarget[] = ['translate', 'scale', 'stagger', 'color', 'rotate'];

export function EasingLab() {
  const [state, setState] = useURLState();
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    return subscribeReducedMotion(setReduced);
  }, []);

  function setCurve(curve: BezierTuple) {
    setState({ ...state, curve });
  }
  function selectPreset(curve: BezierTuple, _name: PresetName) {
    setState({ ...state, curve });
  }
  function setTarget(target: AnimationTarget) {
    setState({ ...state, target });
  }
  function setDuration(duration: number) {
    setState({ ...state, duration });
  }
  function setCompare(compare: PresetName | null) {
    setState({ ...state, compare });
  }

  const ghost = state.compare ? (getPresetCurve(state.compare) ?? null) : null;

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-2xl border border-paper/10 bg-graphite p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">Curve</p>
            <CompareToggle value={state.compare} onChange={setCompare} />
          </div>
          <CurveEditor curve={state.curve} ghost={ghost} onChange={setCurve} />
          <div className="mt-6">
            <NumericValues curve={state.curve} onChange={setCurve} />
          </div>
          <div role="status" aria-live="polite" className="sr-only">
            Control point 1: {state.curve[0].toFixed(2)}, {state.curve[1].toFixed(2)}. Control point
            2: {state.curve[2].toFixed(2)}, {state.curve[3].toFixed(2)}.
          </div>
        </div>
        <PresetStrip active={matchPreset(state.curve)} onSelect={selectPreset} />
      </div>

      <div className="lg:col-span-5 space-y-6">
        <AnimationPlayground
          curve={state.curve}
          ghost={ghost}
          duration={state.duration}
          target={state.target}
          paused={paused}
          reducedMotion={reduced}
        />

        <div className="rounded-2xl border border-paper/10 bg-graphite p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 mb-4">
            Controls
          </p>
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2">
                Target
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Animation target">
                {TARGETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTarget(t)}
                    aria-pressed={state.target === t}
                    className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-colors duration-quick
                      ${state.target === t ? 'border-cyan text-cyan' : 'border-paper/10 hover:border-paper/30'}
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="duration-slider"
                className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 block mb-2"
              >
                Duration: {state.duration}ms
              </label>
              <input
                id="duration-slider"
                type="range"
                min="100"
                max="3000"
                step="50"
                value={state.duration}
                onChange={(e) =>
                  setDuration(Number.parseInt((e.target as HTMLInputElement).value, 10))
                }
                className="w-full accent-cyan"
              />
            </div>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="font-mono text-xs px-3 py-2 rounded-md border border-paper/10 hover:border-cyan hover:text-cyan transition-colors duration-quick"
              aria-pressed={paused}
            >
              {paused ? '▶ play' : '⏸ pause'}
            </button>
          </div>
        </div>

        <ExportPanel curve={state.curve} />
      </div>
    </div>
  );
}

function matchPreset(curve: BezierTuple): PresetName | null {
  for (const preset of PRESETS) {
    if (
      eq(preset.curve[0], curve[0]) &&
      eq(preset.curve[1], curve[1]) &&
      eq(preset.curve[2], curve[2]) &&
      eq(preset.curve[3], curve[3])
    ) {
      return preset.name;
    }
  }
  return null;
}

function eq(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001;
}
