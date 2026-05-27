import { useEffect, useRef, useState } from 'react';
import { bezierY } from './bezier';
import type { BezierTuple } from './types';

interface UseRAFAnimationOptions {
  duration: number;
  curve: BezierTuple;
  paused?: boolean;
  pauseAtEnd?: number;
}

export function useRAFAnimation({
  duration,
  curve,
  paused = false,
  pauseAtEnd = 800,
}: UseRAFAnimationOptions): { progress: number; raw: number; running: boolean } {
  const [progress, setProgress] = useState(0);
  const [raw, setRaw] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let cancelled = false;
    function tick(now: number) {
      if (cancelled) return;
      if (pausedRef.current) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      if (elapsed >= duration + pauseAtEnd) {
        startRef.current = now;
        setRaw(0);
        setProgress(0);
      } else if (elapsed >= duration) {
        setRaw(1);
        setProgress(1);
      } else {
        const t = elapsed / duration;
        setRaw(t);
        setProgress(bezierY(curve, t));
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      startRef.current = null;
    };
  }, [duration, curve, pauseAtEnd]);

  return { progress, raw, running: !paused };
}
