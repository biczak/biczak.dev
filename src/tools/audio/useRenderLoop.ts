import { useEffect } from 'react';
import type { VisualizerConfig, Source } from './config';
import { getPalette } from './palettes';
import { bloomGeometry, barHeights, waveformPoints } from './mapping';
import { drawBloom } from './renderers/bloom';
import { drawBars } from './renderers/bars';
import { drawWaveform } from './renderers/waveform';

interface Options {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  config: VisualizerConfig;
  paused: boolean;
  // `source` is state (unlike analyserRef, which is a stable ref). Including it
  // re-runs the effect when the active source changes, so a paused/reduced-motion
  // visitor still gets a freshly painted static frame after picking a source.
  source: Source;
}

export function useRenderLoop({ canvasRef, analyserRef, config, paused, source }: Options): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const palette = getPalette(config.palette);

    // Paint one frame from the current analyser state. With no active source it
    // clears to a clean canvas. Reused as both the static (paused) frame and the
    // body of the animation loop.
    const draw = () => {
      const analyser = analyserRef.current;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      if (!analyser || !source) {
        ctx.clearRect(0, 0, w, h);
        return;
      }
      if (config.mode === 'waveform') {
        const time = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(time);
        drawWaveform(ctx, waveformPoints(time, config, w, h), palette, w, h);
      } else {
        const freq = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freq);
        if (config.mode === 'bloom') {
          drawBloom(ctx, bloomGeometry(freq, config, Math.min(w, h)), palette, w, h);
        } else {
          drawBars(ctx, barHeights(freq, config, 48), palette, w, h);
        }
      }
    };

    const frame = () => {
      draw();
      raf = requestAnimationFrame(frame);
    };

    if (paused) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!paused) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [canvasRef, analyserRef, config, paused, source]);
}
