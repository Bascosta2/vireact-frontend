import type { CSSProperties, ReactNode } from 'react';
import { H, W, noise } from '../theme';

/**
 * Pieces of the animated worlds (scenes, backdrops, overlays): skies, suns, hills, stars, clouds, a
 * synthwave floor, isometric blocks, rain and snow. SVG pieces are drawn in the 1080 x 1920 frame and
 * meant to go inside one <svg width={W} height={H}>; `frame` drives every motion.
 */

/** A vertical gradient sky as a full-frame div. `stops` run top to bottom. */
export const sky = (stops: string[], angle = 180, extra?: CSSProperties) => (
  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${angle}deg, ${stops.join(', ')})`, ...extra }} />
);

/** Points of a ridge line across the frame, for hills and mountains. */
export function ridge(y: number, amp: number, { freq = 3, seed = 1, shift = 0, peaks = 0 }: { freq?: number; seed?: number; shift?: number; peaks?: number } = {}) {
  const pts: string[] = [];
  for (let k = 0; k <= 48; k += 1) {
    const x = (k / 48) * (W + 200) - 100;
    const u = x / W + shift;
    let h = Math.sin(u * Math.PI * freq + seed) * 0.5 + Math.sin(u * Math.PI * freq * 2.3 + seed * 2.1) * 0.3 + Math.sin(u * Math.PI * freq * 5.1 + seed * 3.7) * 0.2;
    if (peaks) h = Math.pow(Math.abs(h), 1 - peaks * 0.5) * Math.sign(h);
    pts.push(`${x.toFixed(1)},${(y - h * amp).toFixed(1)}`);
  }
  return pts;
}

/** A filled hill or mountain range. `shift` scrolls it (parallax). */
export const hill = (y: number, amp: number, fill: string, opts: { freq?: number; seed?: number; shift?: number; peaks?: number; stroke?: string; strokeWidth?: number; key?: string | number; opacity?: number } = {}) => (
  <polygon key={opts.key} points={`-100,${H + 10} ${ridge(y, amp, opts).join(' ')} ${W + 100},${H + 10}`} fill={fill} stroke={opts.stroke} strokeWidth={opts.strokeWidth} opacity={opts.opacity} />
);

/** Twinkling stars in a band of the frame. */
export const stars = (frame: number, { n = 80, seed = 1, color = '#fff', top = 0, bottom = H * 0.55, size = 3, twinkle = true }: { n?: number; seed?: number; color?: string; top?: number; bottom?: number; size?: number; twinkle?: boolean } = {}) =>
  Array.from({ length: n }, (_, k) => {
    const x = noise(k, seed) * W;
    const y = top + noise(k, seed + 1) * (bottom - top);
    const r = size * (0.35 + noise(k, seed + 2) * 0.8);
    const tw = twinkle ? 0.45 + 0.55 * Math.abs(Math.sin(frame / (12 + noise(k, seed + 3) * 20) + k)) : 1;
    return <circle key={`st${k}`} cx={x} cy={y} r={r} fill={color} opacity={tw} />;
  });

/** A soft cartoon cloud (bumps along a flat base) at (x, y), `w` wide. */
export const cloud = (x: number, y: number, w: number, fill: string, { key, opacity = 1, stroke, strokeWidth }: { key?: string | number; opacity?: number; stroke?: string; strokeWidth?: number } = {}) => {
  const r = w / 5;
  return (
    <g key={key} opacity={opacity} fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
      <path d={`M ${x - w / 2} ${y} a ${r} ${r} 0 0 1 ${r * 1.2} ${-r * 0.9} a ${r * 1.3} ${r * 1.3} 0 0 1 ${r * 2.2} ${-r * 0.5} a ${r * 1.1} ${r * 1.1} 0 0 1 ${r * 1.7} ${r * 0.6} a ${r * 0.8} ${r * 0.8} 0 0 1 ${w - r * 5.1} ${r * 0.8} Z`} />
    </g>
  );
};

/** A sun or moon disc, optionally with the horizontal slices of a synthwave sun. */
export const sun = (cx: number, cy: number, r: number, { colors = ['#FFE56B', '#FF5E7E'], slices = 0, glow, id = 'sun' }: { colors?: [string, string] | string[]; slices?: number; glow?: string; id?: string } = {}) => (
  <g>
    <defs>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={colors[0]} />
        <stop offset="1" stopColor={colors[1] ?? colors[0]} />
      </linearGradient>
      {slices > 0 && (
        <mask id={`${id}-m`}>
          <rect x={cx - r} y={cy - r} width={2 * r} height={2 * r} fill="#fff" />
          {Array.from({ length: slices }, (_, k) => {
            const t = k / slices;
            return <rect key={k} x={cx - r} y={cy + t * r + (k * r) / slices / 2.2} width={2 * r} height={(r / slices) * (0.25 + t * 0.6)} fill="#000" />;
          })}
        </mask>
      )}
    </defs>
    {glow && <circle cx={cx} cy={cy} r={r * 1.5} fill={glow} opacity={0.35} style={{ filter: 'blur(30px)' }} />}
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-g)`} mask={slices > 0 ? `url(#${id}-m)` : undefined} />
  </g>
);

/**
 * A perspective floor grid flying toward the camera (synthwave, tron). `horizon` is the y of the
 * vanishing line; `speed` is grid lines per second.
 */
export function perspectiveGrid(frame: number, { horizon = 1100, color = '#FF3CAC', fps = 30, speed = 1.2, lines = 22, width = 3, glow = true }: { horizon?: number; color?: string; fps?: number; speed?: number; lines?: number; width?: number; glow?: boolean } = {}) {
  const depth = H - horizon;
  const phase = ((frame / fps) * speed) % 1;
  const rows = Array.from({ length: 14 }, (_, k) => {
    const z = (k + 1 - phase) / 14;
    return horizon + depth * Math.pow(z, 2.2);
  });
  return (
    <g stroke={color} strokeWidth={width} style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}>
      {Array.from({ length: lines + 1 }, (_, k) => {
        const u = k / lines - 0.5;
        return <line key={`v${k}`} x1={W / 2 + u * 120} y1={horizon} x2={W / 2 + u * W * 4.2} y2={H} />;
      })}
      {rows.map((y, k) => (
        <line key={`h${k}`} x1={0} y1={y} x2={W} y2={y} opacity={0.35 + 0.65 * ((y - horizon) / depth)} />
      ))}
    </g>
  );
}

/** The three visible faces of an isometric block whose top-front corner sits at (x, y). */
export function isoBox(x: number, y: number, w: number, d: number, h: number) {
  const c = Math.cos(Math.PI / 6);
  const s = 0.5;
  const p = (dx: number, dy: number, dz: number) => `${(x + (dx - dy) * c).toFixed(1)},${(y + (dx + dy) * s - dz).toFixed(1)}`;
  return {
    top: [p(0, 0, h), p(w, 0, h), p(w, d, h), p(0, d, h)].join(' '),
    left: [p(0, d, h), p(w, d, h), p(w, d, 0), p(0, d, 0)].join(' '),
    right: [p(w, 0, h), p(w, d, h), p(w, d, 0), p(w, 0, 0)].join(' '),
  };
}

/** Draw an isometric block with three shades. */
export const block = (x: number, y: number, w: number, d: number, h: number, [top, left, right]: [string, string, string], { key, stroke, strokeWidth = 2 }: { key?: string | number; stroke?: string; strokeWidth?: number } = {}) => {
  const b = isoBox(x, y, w, d, h);
  return (
    <g key={key} stroke={stroke} strokeWidth={stroke ? strokeWidth : 0} strokeLinejoin="round">
      <polygon points={b.left} fill={left} />
      <polygon points={b.right} fill={right} />
      <polygon points={b.top} fill={top} />
    </g>
  );
};

/** Falling rain streaks. */
export const rain = (frame: number, { n = 90, color = '#BFD8FF', angle = 12, speed = 70, len = 60, seed = 4, opacity = 0.5, width = 2 }: { n?: number; color?: string; angle?: number; speed?: number; len?: number; seed?: number; opacity?: number; width?: number } = {}) => {
  const dx = Math.tan((angle * Math.PI) / 180);
  return (
    <g stroke={color} strokeWidth={width} opacity={opacity} strokeLinecap="round">
      {Array.from({ length: n }, (_, k) => {
        const y = (noise(k, seed) * (H + 200) + frame * speed * (0.7 + noise(k, seed + 1) * 0.6)) % (H + 200) - 100;
        const x = noise(k, seed + 2) * (W + 300) - 150 + y * dx;
        return <line key={k} x1={x} y1={y} x2={x - len * dx} y2={y - len} />;
      })}
    </g>
  );
};

/** Drifting snow, petals or dust motes (any small shape as circles). */
export const drift = (frame: number, { n = 60, color = '#fff', size = 6, speed = 3, sway = 30, seed = 6, opacity = 0.85, top = 0, bottom = H, up = false }: { n?: number; color?: string; size?: number; speed?: number; sway?: number; seed?: number; opacity?: number; top?: number; bottom?: number; up?: boolean } = {}) =>
  Array.from({ length: n }, (_, k) => {
    const span = bottom - top + 60;
    const t = (noise(k, seed) * span + frame * speed * (0.6 + noise(k, seed + 1) * 0.8)) % span;
    const y = up ? bottom - t + 30 : top + t - 30;
    const x = noise(k, seed + 2) * W + Math.sin(frame / 30 + k) * sway;
    return <circle key={`dr${k}`} cx={x} cy={y} r={size * (0.4 + noise(k, seed + 3) * 0.8)} fill={color} opacity={opacity} />;
  });

/** Sunburst rays from a point (game shows, pop art, retro posters). */
export const rays = (cx: number, cy: number, { n = 18, colors = ['#FFD23F', '#FFB703'], spin = 0, r = 2400 }: { n?: number; colors?: [string, string]; spin?: number; r?: number } = {}) => (
  <g transform={`rotate(${spin} ${cx} ${cy})`}>
    {Array.from({ length: n }, (_, k) => {
      const a0 = (k / n) * Math.PI * 2;
      const a1 = ((k + 0.5) / n) * Math.PI * 2;
      return <polygon key={k} points={`${cx},${cy} ${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} ${cx + Math.cos(a1) * r},${cy + Math.sin(a1) * r}`} fill={colors[k % 2]} />;
    })}
  </g>
);

/** A full-frame svg wrapper for scene pieces. */
export const svgFrame = (children: ReactNode, style?: CSSProperties) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
    {children}
  </svg>
);

/**
 * Progress of a scene that draws itself: 0 → 1 over `dur` frames, held, then redrawn every `period`
 * frames, so covers and short edits always see the finished picture within a few seconds.
 */
export const drawCycle = (frame: number, dur = 110, period = 360) => Math.min(1, (((frame % period) + period) % period) / dur);

/** A word of text in an svg scene. */
export const label = (x: number, y: number, s: string, { size = 30, fill = '#000', font, anchor = 'middle', weight, opacity = 1, key }: { size?: number; fill?: string; font?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number | string; opacity?: number; key?: string | number } = {}) => (
  <text key={key} x={x} y={y} fill={fill} fontSize={size} fontFamily={font} textAnchor={anchor} fontWeight={weight} opacity={opacity}>
    {s}
  </text>
);
