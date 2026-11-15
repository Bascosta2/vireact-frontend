import type { SVGProps } from 'react';
import { wave } from './kit';

/** A stroke that draws itself: `p` is how much of the path is visible (0-1). */
export function Draw({ p, ...rest }: { p: number } & SVGProps<SVGPathElement>) {
  if (p <= 0) return null;
  return <path fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, p)} {...rest} />;
}

/** Top-to-bottom gradient (tilt it with x2 / y2). */
export function Grad({ id, from, to, x2 = 0, y2 = 1 }: { id: string; from: string; to: string; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  );
}

/** A four-point sparkle that twinkles. */
export function Sparkle({ x, y, size, frame, phase = 0, color = '#fff' }: { x: number; y: number; size: number; frame: number; phase?: number; color?: string }) {
  const s = 0.55 + 0.45 * wave(frame, 26, phase);
  const r = size * s;
  const k = r * 0.22;
  return <path d={`M ${x} ${y - r} L ${x + k} ${y - k} L ${x + r} ${y} L ${x + k} ${y + k} L ${x} ${y + r} L ${x - k} ${y + k} L ${x - r} ${y} L ${x - k} ${y - k} Z`} fill={color} opacity={0.5 + 0.5 * s} />;
}
