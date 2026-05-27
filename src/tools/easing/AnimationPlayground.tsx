import { useRAFAnimation } from './useRAFAnimation';
import { bezierY } from './bezier';
import type { AnimationTarget, BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  ghost: BezierTuple | null;
  duration: number;
  target: AnimationTarget;
  paused: boolean;
  reducedMotion: boolean;
}

const TARGET_LABELS: Record<AnimationTarget, string> = {
  translate: 'Translation',
  scale: 'Scale',
  stagger: 'Stagger',
  color: 'Color',
  rotate: 'Rotation',
};

export function AnimationPlayground({
  curve,
  ghost,
  duration,
  target,
  paused,
  reducedMotion,
}: Props) {
  const { raw } = useRAFAnimation({ curve, duration, paused: paused || reducedMotion });
  const progress = reducedMotion ? 1 : bezierY(curve, raw);
  const ghostProgress = ghost ? (reducedMotion ? 1 : bezierY(ghost, raw)) : null;

  return (
    <div className="rounded-2xl border border-paper/10 bg-graphite p-8">
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50">
          Playground — {TARGET_LABELS[target]}
        </p>
        <p className="font-mono text-[10px] opacity-40">{duration}ms loop</p>
      </div>
      <Target target={target} progress={progress} ghostProgress={ghostProgress} />
    </div>
  );
}

function Target({
  target,
  progress,
  ghostProgress,
}: {
  target: AnimationTarget;
  progress: number;
  ghostProgress: number | null;
}) {
  if (target === 'translate') {
    return (
      <div className="space-y-4">
        <Track progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Track progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'scale') {
    return (
      <div className="flex items-center justify-center gap-8 py-8">
        <Dot progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Dot progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'rotate') {
    return (
      <div className="flex items-center justify-center gap-8 py-8">
        <Rotator progress={progress} colorClass="bg-cyan" />
        {ghostProgress !== null && <Rotator progress={ghostProgress} colorClass="bg-violet/50" />}
      </div>
    );
  }
  if (target === 'color') {
    return (
      <div className="space-y-3">
        <ColorBar progress={progress} />
        {ghostProgress !== null && <ColorBar progress={ghostProgress} />}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <StaggerList progress={progress} />
      {ghostProgress !== null && <StaggerList progress={ghostProgress} dashed />}
    </div>
  );
}

function Track({ progress, colorClass }: { progress: number; colorClass: string }) {
  return (
    <div className="relative h-12 rounded-full bg-ink/60 border border-paper/5">
      <div
        className={`absolute top-1.5 left-1.5 h-9 w-9 rounded-full ${colorClass}`}
        style={{ transform: `translateX(${progress * 100}%)`, transition: 'none' }}
      />
    </div>
  );
}

function Dot({ progress, colorClass }: { progress: number; colorClass: string }) {
  const scale = 0.4 + progress * 1.6;
  return (
    <div
      className={`h-16 w-16 rounded-full ${colorClass}`}
      style={{ transform: `scale(${scale})`, transition: 'none' }}
    />
  );
}

function Rotator({ progress, colorClass }: { progress: number; colorClass: string }) {
  return (
    <div
      className={`h-2 w-24 origin-left ${colorClass}`}
      style={{ transform: `rotate(${progress * 180}deg)`, transition: 'none' }}
    />
  );
}

function ColorBar({ progress }: { progress: number }) {
  const r = Math.round(34 + (236 - 34) * progress);
  const g = Math.round(211 + (72 - 211) * progress);
  const b = Math.round(238 + (153 - 238) * progress);
  return (
    <div
      className="h-8 rounded-md"
      style={{ background: `rgb(${r}, ${g}, ${b})`, transition: 'none' }}
    />
  );
}

function StaggerList({ progress, dashed = false }: { progress: number; dashed?: boolean }) {
  const items = [0, 1, 2, 3, 4, 5];
  return (
    <ul className="space-y-2">
      {items.map((i) => {
        const offset = i / (items.length - 1);
        const itemProgress = Math.max(0, Math.min(1, (progress - offset * 0.5) / 0.5));
        return (
          <li
            key={i}
            className={`h-3 rounded-full ${dashed ? 'border border-dashed border-violet' : 'bg-cyan'}`}
            style={{
              transform: `scaleX(${itemProgress})`,
              transformOrigin: 'left',
              transition: 'none',
            }}
          />
        );
      })}
    </ul>
  );
}
