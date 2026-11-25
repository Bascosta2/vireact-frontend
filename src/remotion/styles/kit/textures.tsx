import type { CSSProperties, ReactNode } from 'react';
import { grainStyle } from '../painted';
import { hexA, noise } from '../theme';

/**
 * Full-frame surface layers the styles are built from: paper, print screens, film damage, grids and
 * frames. Each returns an element (lowercase helpers, not components) that ignores the pointer.
 * Repeating gradients and small SVG tiles are painted once by the browser, so they cost nothing per frame.
 */

const LAYER: CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' };

/** A plain full-frame layer with a style. */
export const layer = (style: CSSProperties, key?: string | number, children?: ReactNode) => (
  <div key={key} style={{ ...LAYER, ...style }}>
    {children}
  </div>
);

/** Paper, canvas or film grain. With `frame`, the grain moves every frame like film. */
export function grain({ color = '#000000', alpha = 0.35, freq = 0.85, seed = 3, blend = 'multiply', opacity = 1, frame, size = 260, stretch }: {
  color?: string;
  alpha?: number;
  freq?: number;
  seed?: number;
  blend?: CSSProperties['mixBlendMode'];
  opacity?: number;
  frame?: number;
  size?: number;
  stretch?: [number, number];
} = {}) {
  const s = grainStyle({ color, alpha, freq, seed, blend, opacity, size, stretch });
  if (frame != null) s.backgroundPosition = `${Math.round(noise(frame, 1) * size)}px ${Math.round(noise(frame, 2) * size)}px`;
  return <div style={s} />;
}

/** Print dots (Ben-Day, newsprint, halftone). */
export const halftone = ({ color = '#000', size = 12, dot = 1.6, opacity = 0.18, blend = 'multiply', angle = 0 }: { color?: string; size?: number; dot?: number; opacity?: number; blend?: CSSProperties['mixBlendMode']; angle?: number } = {}) =>
  layer({
    backgroundImage: `radial-gradient(circle, ${color} ${dot}px, transparent ${dot + 0.8}px)`,
    backgroundSize: `${size}px ${size}px`,
    mixBlendMode: blend,
    opacity,
    ...(angle ? { inset: '-30%', transform: `rotate(${angle}deg)` } : {}),
  });

/** CRT or video scanlines. */
export const scanlines = ({ gap = 4, alpha = 0.22, color = '#000', offset = 0 }: { gap?: number; alpha?: number; color?: string; offset?: number } = {}) =>
  layer({ backgroundImage: `repeating-linear-gradient(0deg, ${hexA(color, alpha)} 0 ${Math.max(1, gap / 2)}px, transparent ${Math.max(1, gap / 2)}px ${gap}px)`, backgroundPosition: `0 ${offset}px` });

/** Darkened (or tinted) corners. */
export const vignette = (strength = 0.55, color = '#000000', inner = 55) =>
  layer({ background: `radial-gradient(ellipse at 50% 45%, transparent ${inner}%, ${hexA(color, strength)} 100%)` });

/** Graph paper: a fine grid with a heavier line every `major` cells. */
export const gridPaper = ({ color = '#7FB8FF', size = 40, major = 5, alpha = 0.35, majorAlpha = 0.6 }: { color?: string; size?: number; major?: number; alpha?: number; majorAlpha?: number } = {}) =>
  layer({
    backgroundImage: [
      `linear-gradient(${hexA(color, majorAlpha)} 2px, transparent 2px)`,
      `linear-gradient(90deg, ${hexA(color, majorAlpha)} 2px, transparent 2px)`,
      `linear-gradient(${hexA(color, alpha)} 1px, transparent 1px)`,
      `linear-gradient(90deg, ${hexA(color, alpha)} 1px, transparent 1px)`,
    ].join(', '),
    backgroundSize: `${size * major}px ${size * major}px, ${size * major}px ${size * major}px, ${size}px ${size}px, ${size}px ${size}px`,
  });

/** Dot-grid notebook paper. */
export const dotGrid = ({ color = '#000', size = 36, dot = 1.6, alpha = 0.25 }: { color?: string; size?: number; dot?: number; alpha?: number } = {}) =>
  layer({ backgroundImage: `radial-gradient(circle, ${hexA(color, alpha)} ${dot}px, transparent ${dot + 0.6}px)`, backgroundSize: `${size}px ${size}px` });

/** Ruled notebook paper with a margin line. */
export const linedPaper = ({ line = '#9EC5E8', margin = '#E86A6A', gap = 64, left = 150 }: { line?: string; margin?: string; gap?: number; left?: number } = {}) => (
  <>
    {layer({ backgroundImage: `repeating-linear-gradient(0deg, transparent 0 ${gap - 3}px, ${line} ${gap - 3}px ${gap}px)` })}
    {layer({ left, width: 4, right: 'auto', background: margin, opacity: 0.8 })}
  </>
);

/** Old film: flicker (brightness wobble), dust and vertical scratches, changing every `step` frames. */
export function filmDamage(frame: number, { step = 2, scratches = 2, dust = 14, color = '#000', light = '#fff', flicker = 0.08 }: { step?: number; scratches?: number; dust?: number; color?: string; light?: string; flicker?: number } = {}) {
  const f = Math.floor(frame / step);
  return (
    <>
      {layer({ background: noise(f, 3) > 0.5 ? light : color, opacity: flicker * noise(f, 5) })}
      <svg width={1080} height={1920} style={{ ...LAYER, overflow: 'hidden' }}>
        {Array.from({ length: scratches }, (_, k) => {
          const on = noise(f, 20 + k) > 0.45;
          const x = 80 + noise(Math.floor(f / 4), 30 + k) * 920;
          return on ? <line key={`s${k}`} x1={x} y1={0} x2={x + 6 * (noise(f, 40 + k) - 0.5)} y2={1920} stroke={k % 2 ? light : color} strokeWidth={1.5 + noise(f, 50 + k) * 2} opacity={0.35} /> : null;
        })}
        {Array.from({ length: dust }, (_, k) => {
          if (noise(f, 60 + k) < 0.55) return null;
          const x = noise(f, 70 + k) * 1080;
          const y = noise(f, 80 + k) * 1920;
          const r = 1.5 + noise(f, 90 + k) * 5;
          return <ellipse key={`d${k}`} cx={x} cy={y} rx={r} ry={r * (0.6 + noise(k, 3))} fill={k % 3 ? color : light} opacity={0.5} />;
        })}
      </svg>
    </>
  );
}

/** A solid frame round the picture (`width` px), optionally rounded inside. */
export const frameBorder = (color: string, width: number, { radius = 0, inner }: { radius?: number; inner?: { color: string; width: number } } = {}) => (
  <>
    {layer({ border: `${width}px solid ${color}`, borderRadius: radius })}
    {inner && layer({ inset: width, border: `${inner.width}px solid ${inner.color}`, borderRadius: Math.max(0, radius - width) })}
  </>
);

/** A soft colored light (a lamp, a sun, a window) as a radial glow. */
export const glowSpot = (x: string, y: string, color: string, size = '60%', opacity = 0.5, blend: CSSProperties['mixBlendMode'] = 'screen') =>
  layer({ background: `radial-gradient(circle at ${x} ${y}, ${color} 0%, transparent ${size})`, opacity, mixBlendMode: blend });

/** Stripes (candy stripes, sunburst rays are in scenery). */
export const stripes = (a: string, b: string, width = 60, angle = 45, opacity = 1) =>
  layer({ backgroundImage: `repeating-linear-gradient(${angle}deg, ${a} 0 ${width}px, ${b} ${width}px ${width * 2}px)`, opacity });
