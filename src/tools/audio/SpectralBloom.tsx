import { useEffect, useRef, useState } from 'react';
import { Controls } from './Controls';
import { useURLConfig } from './useURLConfig';
import { useAudioEngine } from './useAudioEngine';
import { useRenderLoop } from './useRenderLoop';
import type { Source } from './config';
import { prefersReducedMotion } from '@/lib/reduced-motion';

export function SpectralBloom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useURLConfig();
  const engine = useAudioEngine();
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [startedOnce, setStartedOnce] = useState(false);

  // Keep the analyser smoothing in sync with the config slider.
  useEffect(() => {
    engine.setSmoothing(config.smoothing);
  }, [config.smoothing, engine]);

  useRenderLoop({ canvasRef, analyserRef: engine.analyserRef, config, paused });

  async function handleSource(next: Source) {
    await engine.setSource(next);
    setStartedOnce(true);
    // Honor reduced-motion: stay paused until the visitor presses play.
    if (!prefersReducedMotion()) setPaused(false);
  }

  function handleVolume(v: number) {
    setVolume(v);
    engine.setVolume(v);
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="rounded-2xl border border-paper/10 bg-graphite p-4">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Audio visualization in ${config.mode} mode${
              engine.source ? `, reacting to the ${engine.source} source` : ', idle'
            }`}
            className="w-full aspect-square md:aspect-video rounded-xl bg-ink"
          />
          {!startedOnce && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
              Pick a source to begin
            </p>
          )}
        </div>
      </div>
      <div className="lg:col-span-4">
        <Controls
          config={config}
          onConfigChange={setConfig}
          source={engine.source}
          onSourceChange={handleSource}
          micError={engine.micError}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
          volume={volume}
          onVolumeChange={handleVolume}
        />
      </div>
    </div>
  );
}
