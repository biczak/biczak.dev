import { useCallback, useEffect, useRef, useState } from 'react';
import { sampleCurve } from './bezier';
import type { BezierTuple } from './types';

interface Props {
  curve: BezierTuple;
  onChange: (next: BezierTuple) => void;
  ghost?: BezierTuple | null;
  ariaLabel?: string;
}

const VB = 1000;
const PAD = 40;

export function CurveEditor({
  curve,
  onChange,
  ghost = null,
  ariaLabel = 'Bezier curve editor',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeHandle, setActiveHandle] = useState<0 | 1 | null>(null);

  const toSvg = useCallback((nx: number, ny: number): [number, number] => {
    const x = PAD + nx * (VB - PAD * 2);
    const y = VB - PAD - ny * (VB - PAD * 2);
    return [x, y];
  }, []);

  const fromSvg = useCallback((x: number, y: number): [number, number] => {
    const nx = (x - PAD) / (VB - PAD * 2);
    const ny = (VB - PAD - y) / (VB - PAD * 2);
    return [clamp(nx, 0, 1), clamp(ny, -0.5, 1.6)];
  }, []);

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, handle: 0 | 1) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const { x, y } = pt.matrixTransform(ctm.inverse());
      const [nx, ny] = fromSvg(x, y);
      const next: BezierTuple =
        handle === 0 ? [nx, ny, curve[2], curve[3]] : [curve[0], curve[1], nx, ny];
      onChange(next);
    },
    [curve, fromSvg, onChange],
  );

  useEffect(() => {
    if (activeHandle === null) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const { x, y } = pt.matrixTransform(ctm.inverse());
      const [nx, ny] = fromSvg(x, y);
      const next: BezierTuple =
        activeHandle === 0 ? [nx, ny, curve[2], curve[3]] : [curve[0], curve[1], nx, ny];
      onChange(next);
    };
    const onUp = () => setActiveHandle(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [activeHandle, curve, fromSvg, onChange]);

  const onKey = useCallback(
    (handle: 0 | 1) => (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      let [x, y] = handle === 0 ? [curve[0], curve[1]] : [curve[2], curve[3]];
      if (e.key === 'ArrowLeft') x -= step;
      else if (e.key === 'ArrowRight') x += step;
      else if (e.key === 'ArrowUp') y += step;
      else if (e.key === 'ArrowDown') y -= step;
      else return;
      e.preventDefault();
      x = clamp(x, 0, 1);
      y = clamp(y, -0.5, 1.6);
      const next: BezierTuple =
        handle === 0 ? [x, y, curve[2], curve[3]] : [curve[0], curve[1], x, y];
      onChange(next);
    },
    [curve, onChange],
  );

  const samples = sampleCurve(curve, 64);
  const path = pathFromSamples(samples, toSvg);
  const ghostPath = ghost ? pathFromSamples(sampleCurve(ghost, 64), toSvg) : null;

  const [h1x, h1y] = toSvg(curve[0], curve[1]);
  const [h2x, h2y] = toSvg(curve[2], curve[3]);
  const [p0x, p0y] = toSvg(0, 0);
  const [p3x, p3y] = toSvg(1, 1);

  return (
    <div
      role="application"
      aria-label={ariaLabel}
      aria-roledescription="cubic bezier curve editor"
      className="w-full"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB} ${VB}`}
        className="w-full h-auto select-none touch-none"
        onPointerDown={(e) => {
          const target = e.target as Element;
          const handleAttr = target.getAttribute?.('data-handle');
          if (handleAttr === '0' || handleAttr === '1') {
            setActiveHandle(handleAttr === '0' ? 0 : 1);
            (e.target as Element).setPointerCapture?.(e.pointerId);
            handlePointer(e, handleAttr === '0' ? 0 : 1);
          }
        }}
      >
        <rect x="0" y="0" width={VB} height={VB} fill="transparent" />
        <line x1={PAD} y1={VB - PAD} x2={VB - PAD} y2={VB - PAD} stroke="#3a3f55" strokeWidth="2" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={VB - PAD} stroke="#3a3f55" strokeWidth="2" />

        {ghostPath && (
          <path
            d={ghostPath}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="6"
            strokeDasharray="14 12"
            opacity="0.6"
          />
        )}

        <path
          d={path}
          fill="none"
          stroke="url(#curve-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <line
          x1={p0x}
          y1={p0y}
          x2={h1x}
          y2={h1y}
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
        <line
          x1={p3x}
          y1={p3y}
          x2={h2x}
          y2={h2y}
          stroke="#ec4899"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />

        <circle cx={p0x} cy={p0y} r="10" fill="#e5e7ff" />
        <circle cx={p3x} cy={p3y} r="10" fill="#e5e7ff" />

        <circle
          data-handle="0"
          cx={h1x}
          cy={h1y}
          r="22"
          fill="#22d3ee"
          tabIndex={0}
          onKeyDown={onKey(0)}
          aria-label={`Control point 1: x ${curve[0].toFixed(2)}, y ${curve[1].toFixed(2)}`}
          style={{ cursor: 'grab' }}
        />
        <circle
          data-handle="1"
          cx={h2x}
          cy={h2y}
          r="22"
          fill="#ec4899"
          tabIndex={0}
          onKeyDown={onKey(1)}
          aria-label={`Control point 2: x ${curve[2].toFixed(2)}, y ${curve[3].toFixed(2)}`}
          style={{ cursor: 'grab' }}
        />

        <defs>
          <linearGradient id="curve-gradient" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.55" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function pathFromSamples(
  samples: Array<[number, number]>,
  toSvg: (nx: number, ny: number) => [number, number],
): string {
  return samples
    .map(([x, y], i) => {
      const [sx, sy] = toSvg(x, y);
      return `${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(' ');
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
