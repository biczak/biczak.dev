export interface SynthSource {
  output: AudioNode; // connect to the analyser (and, for synth, to destination)
  start(): void;
  stop(): void;
}

// An evolving ambient drone: two detuned saw oscillators + filtered noise,
// with a slow LFO sweeping the low-pass cutoff for spectral movement.
export function createSynthSource(ctx: AudioContext): SynthSource {
  const out = ctx.createGain();
  out.gain.value = 1;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  filter.Q.value = 8;
  filter.connect(out);

  const oscA = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscA.frequency.value = 110;
  const oscB = ctx.createOscillator();
  oscB.type = 'sawtooth';
  oscB.frequency.value = 110;
  oscB.detune.value = 8;
  oscA.connect(filter);
  oscB.connect(filter);

  // Filtered noise for high-frequency content.
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.15;
  noise.connect(noiseGain).connect(filter);

  // Slow cutoff LFO.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 600;
  lfo.connect(lfoGain).connect(filter.frequency);

  let started = false;
  return {
    output: out,
    start() {
      if (started) return;
      started = true;
      oscA.start();
      oscB.start();
      noise.start();
      lfo.start();
    },
    stop() {
      if (!started) return;
      started = false;
      [oscA, oscB, noise, lfo].forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      out.disconnect();
    },
  };
}
