import type { CSSProperties } from 'react';

/**
 * Helpers for the painted styles (real media drawn in code): paper and canvas texture, and SVG filters
 * that break an edge up like paint, ink or a cut. Textures are small tiles the browser paints once and
 * repeats, so they cost nothing per frame.
 */

/**
 * A tiled noise texture (paper grain, bristle, fibre) as a layer style. `color` is the ink of the grain,
 * `alpha` how strong it is; `freq` is fine (high) or blotchy (low); `stretch` streaks it sideways or up
 * (bristle marks).
 */
export function grainStyle({ color = '#000000', alpha = 0.5, freq = 0.85, size = 260, seed = 3, blend = 'multiply', opacity = 1, stretch = [1, 1] }: {
  color?: string;
  alpha?: number;
  freq?: number;
  size?: number;
  seed?: number;
  blend?: CSSProperties['mixBlendMode'];
  opacity?: number;
  stretch?: [number, number];
} = {}): CSSProperties {
  const n = parseInt(color.slice(1, 7), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(3));
  const fx = (freq / stretch[0]).toFixed(3);
  const fy = (freq / stretch[1]).toFixed(3);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><filter id='g' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='${fx} ${fy}' numOctaves='3' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${(alpha * 2.2).toFixed(2)} 0 0 0 ${(-alpha * 0.75).toFixed(2)}'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>`;
  return {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,${svg.replace(/"/g, "'").replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`,
    backgroundSize: `${size}px ${size}px`,
    mixBlendMode: blend,
    opacity,
  };
}

/** Canvas weave: fine crossing threads. */
export const weaveStyle = (opacity = 0.22): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: 'repeating-linear-gradient(0deg, rgba(60,40,20,0.5) 0 1px, transparent 1px 5px), repeating-linear-gradient(90deg, rgba(60,40,20,0.45) 0 1px, transparent 1px 5px)',
  mixBlendMode: 'multiply',
  opacity,
});

/** An SVG filter that roughens an edge (paint, ink, torn paper). Put it in the svg's <defs>. */
export function roughFilter(id: string, { scale = 6, freq = 0.035, seed = 2, blur = 0 }: { scale?: number; freq?: number; seed?: number; blur?: number } = {}) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} result="d" />
      {blur > 0 ? <feGaussianBlur in="d" stdDeviation={blur} /> : null}
    </filter>
  );
}

/** A path that draws itself as `t` goes 0 → 1. */
export const drawStroke = (t: number, length = 1000): Pick<CSSProperties, 'strokeDasharray' | 'strokeDashoffset'> => ({
  strokeDasharray: length,
  strokeDashoffset: length * (1 - Math.max(0, Math.min(1, t))),
});

/** Move a drawing from (fx, fy) to (tx, ty) at `s` times its size (SVG transform). */
export const focus = (fx: number, fy: number, tx: number, ty: number, s: number) => `translate(${tx} ${ty}) scale(${s}) translate(${-fx} ${-fy})`;

/** Smooth 0 → 1 between two values. */
export const smooth = (v: number, a: number, b: number) => {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A loop of `period` frames, as 0 → 1. */
export const loop = (frame: number, period: number, offset = 0) => ((((frame + offset) % period) + period) % period) / period;
