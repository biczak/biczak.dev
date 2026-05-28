import { useCallback, useEffect, useRef, useState } from 'react';
import type { Source } from './config';
import { createSynthSource, type SynthSource } from './synth';

export interface AudioEngine {
  source: Source;
  micError: string | null;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  setSource: (next: Source) => Promise<void>;
  setSmoothing: (value: number) => void;
  setVolume: (value: number) => void;
}

export function useAudioEngine(): AudioEngine {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeRef = useRef<GainNode | null>(null);
  const synthRef = useRef<SynthSource | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const [source, setSourceState] = useState<Source>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    const volume = ctx.createGain();
    volume.gain.value = 0.8;
    volume.connect(ctx.destination);
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    volumeRef.current = volume;
    return ctx;
  }, []);

  const teardownSources = useCallback(() => {
    synthRef.current?.stop();
    synthRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
  }, []);

  const setSource = useCallback(
    async (next: Source) => {
      setMicError(null);
      const ctx = ensureContext();
      await ctx.resume();
      teardownSources();

      if (next === 'synth') {
        const synth = createSynthSource(ctx);
        synth.output.connect(analyserRef.current!);
        synth.output.connect(volumeRef.current!); // audible
        synth.start();
        synthRef.current = synth;
        setSourceState('synth');
      } else if (next === 'mic') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStreamRef.current = stream;
          const micNode = ctx.createMediaStreamSource(stream);
          micNode.connect(analyserRef.current!); // analyser only — never destination
          setSourceState('mic');
        } catch {
          setMicError('Microphone access was blocked. Check your browser permissions.');
          setSourceState(null);
        }
      } else {
        setSourceState(null);
      }
    },
    [ensureContext, teardownSources],
  );

  const setSmoothing = useCallback((value: number) => {
    if (analyserRef.current) analyserRef.current.smoothingTimeConstant = value;
  }, []);

  const setVolume = useCallback((value: number) => {
    if (volumeRef.current) volumeRef.current.gain.value = value;
  }, []);

  useEffect(() => {
    return () => {
      teardownSources();
      ctxRef.current?.close();
    };
  }, [teardownSources]);

  return { source, micError, analyserRef, setSource, setSmoothing, setVolume };
}
