import type { ReactNode } from 'react';
import { Easing, interpolate, spring } from 'remotion';

/**
 * Helpers for the animated illustrations. Every illustration is a pure function of the frame (no
 * state, no Math.random), drawn in a 400 x 400 box centered on (200, 200), so the preview and the
 * Lambda render always match.
 */

export interface VisualProps {
  /** Frames since the illustration appeared. */
  frame: number;
  fps: number;
  /** The edit's accent color (hex). */
  accent: string;
  /** Unique prefix for gradient and clip ids. */
  uid: string;
}

export type Visual = (p: VisualProps) => ReactNode;

export const INK = '#0B0D17';
export const PAPER = '#F5F7FF';
export const STEEL = '#C9D1E0';
export const SLATE = '#3A4257';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 → 1 between two frames, easing out. */
export const tween = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });

/** 0 → 1 with a small, soft overshoot, starting at frame `at`. */
export const pop = (frame: number, fps: number, at = 0, damping = 13) => spring({ frame: frame - at, fps, config: { damping, stiffness: 190, mass: 0.7 } });

/** -1..1 wave with a period in frames. */
export const wave = (frame: number, period: number, phase = 0) => Math.sin((frame / period + phase) * Math.PI * 2);

/** 0 → 1 sawtooth with a period in frames. */
export const cycle = (frame: number, period: number, phase = 0) => (((frame / period + phase) % 1) + 1) % 1;

/** Repeatable noise in -1..1 for a frame. */
export const jitter = (frame: number, seed: number) => {
  const x = Math.sin(frame * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** SVG transform that scales (and optionally turns) around a point. */
export const about = (cx: number, cy: number, scale: number | [number, number] = 1, rotate = 0) => {
  const [sx, sy] = Array.isArray(scale) ? scale : [scale, scale];
  return `translate(${cx} ${cy}) rotate(${rotate}) scale(${sx} ${sy}) translate(${-cx} ${-cy})`;
};

/** A regular star as a path. */
export const starPath = (cx: number, cy: number, outer: number, inner = outer * 0.46, points = 5) => {
  const pts: string[] = [];
  for (let k = 0; k < points * 2; k += 1) {
    const r = k % 2 === 0 ? outer : inner;
    const a = (Math.PI * k) / points - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

/** A gear outline around (0, 0) with `teeth` teeth between the `inner` and `outer` radius. */
export const gearPath = (teeth: number, outer: number, inner: number) => {
  const pitch = (Math.PI * 2) / teeth;
  const pts: string[] = [];
  const at = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  for (let k = 0; k < teeth; k += 1) {
    const a = k * pitch;
    pts.push(at(inner, a - pitch * 0.27), at(outer, a - pitch * 0.15), at(outer, a + pitch * 0.15), at(inner, a + pitch * 0.27));
  }
  return `M ${pts.join(' L ')} Z`;
};

/** A small heart centered on (0, 0), about 28 wide. */
export const HEART = 'M 0 9 C -16 -3 -11 -17 0 -8 C 11 -17 16 -3 0 9 Z';
