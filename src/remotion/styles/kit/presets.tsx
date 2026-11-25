import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { Entrance } from '../motion';
import { H, W, hexA, noise, type CaptionLook, type Ctx, type HookLook, type StyleTheme } from '../theme';

/**
 * Building blocks for a style's text, markers, rings, transitions and progress, so each style picks and
 * tunes them instead of drawing everything from scratch. Factories return the functions and components
 * the StyleTheme contract expects.
 */

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

// ---------------------------------------------------------------- text

export interface TextOpts {
  font?: 'display' | 'body';
  color?: string;
  upper?: boolean;
  letter?: number;
  weight?: number | string;
  italic?: boolean;
  shadow?: string;
  stroke?: [number, string];
  /** Neon or phosphor glow in this color. */
  glow?: string;
  extra?: CSSProperties;
}

/** A text style (title, body, number, slam). */
export const text =
  ({ font = 'display', color = '#fff', upper, letter, weight, italic, shadow, stroke, glow, extra }: TextOpts) =>
  (c: Ctx): CSSProperties => ({
    fontFamily: font === 'display' ? c.fonts.display : c.fonts.body,
    color,
    textTransform: upper ? 'uppercase' : undefined,
    letterSpacing: letter,
    fontWeight: weight,
    fontStyle: italic ? 'italic' : undefined,
    textShadow: [glow ? `0 0 10px ${glow}, 0 0 28px ${glow}` : '', shadow ?? ''].filter(Boolean).join(', ') || undefined,
    ...(stroke ? { WebkitTextStroke: `${stroke[0]}px ${stroke[1]}`, paintOrder: 'stroke fill' } : {}),
    ...extra,
  });

/** A card (the surface graphics sit on). */
export const card =
  ({ bg, border, radius = 0, shadow, blur, extra }: { bg: string; border?: string; radius?: number; shadow?: string; blur?: number; extra?: CSSProperties }) =>
  (): CSSProperties => ({
    background: bg,
    border,
    borderRadius: radius,
    boxShadow: shadow,
    backdropFilter: blur ? `blur(${blur}px)` : undefined,
    ...extra,
  });

export interface CaptionOpts extends TextOpts {
  size?: number;
  glyph?: number;
  /** Emphasis word color. */
  emph?: string;
  /** A box behind the whole line. */
  bg?: string;
  pad?: string;
  radius?: number;
  boxExtra?: CSSProperties;
  /** A highlight box behind emphasis words. */
  emphBg?: string;
  emphColor?: string;
  entrance?: Entrance;
}

/** A caption look from a few choices. */
export function caption(o: CaptionOpts): CaptionLook {
  const t = text(o);
  return {
    size: o.size ?? 92,
    glyph: o.glyph ?? 0.52,
    entrance: o.entrance ?? 'pop',
    box: (c) => {
      const s = t(c);
      return {
        fontFamily: s.fontFamily,
        textTransform: s.textTransform,
        letterSpacing: s.letterSpacing,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        ...(o.bg ? { background: o.bg, padding: o.pad ?? '10px 26px', borderRadius: o.radius ?? 0 } : {}),
        ...o.boxExtra,
      };
    },
    word: (emphasis, c) => {
      const s = t(c);
      return {
        color: emphasis ? (o.emphBg ? (o.emphColor ?? s.color) : (o.emph ?? c.accent)) : s.color,
        WebkitTextStroke: s.WebkitTextStroke,
        paintOrder: s.paintOrder,
        textShadow: emphasis && o.glow ? `0 0 12px ${o.emph ?? c.accent}, 0 0 30px ${o.emph ?? c.accent}` : s.textShadow,
        ...(emphasis && o.emphBg ? { background: o.emphBg, padding: '0 0.16em', borderRadius: Math.min(12, o.radius ?? 8), boxDecorationBreak: 'clone' } : {}),
      };
    },
  };
}

export interface HookOpts extends TextOpts {
  top?: number;
  align?: 'center' | 'left';
  entrance?: Entrance;
  size?: number;
  lineHeight?: number;
  bg?: string;
  border?: string;
  radius?: number;
  boxShadow?: string;
  pad?: string;
  rotate?: number;
  typewriter?: boolean;
  boxExtra?: CSSProperties;
  Decor?: HookLook['Decor'];
}

/** A hook card from a few choices. */
export function hook(o: HookOpts): HookLook {
  const t = text(o);
  return {
    top: o.top ?? 0.1,
    align: o.align,
    entrance: o.entrance ?? 'pop',
    typewriter: o.typewriter,
    Decor: o.Decor,
    box: () => ({
      background: o.bg,
      border: o.border,
      borderRadius: o.radius,
      boxShadow: o.boxShadow,
      padding: o.pad ?? (o.bg || o.border ? '20px 34px' : '0'),
      transform: o.rotate ? `rotate(${o.rotate}deg)` : undefined,
      ...o.boxExtra,
    }),
    text: (c) => ({ fontSize: o.size ?? 72, lineHeight: o.lineHeight ?? 1.1, ...t(c) }),
  };
}

// ---------------------------------------------------------------- markers

type Marker = StyleTheme['Marker'];

export const markerDot =
  (colors: string[], size = 40, border?: string): Marker =>
  ({ k, t }) => <span style={{ flex: 'none', width: size, height: size, borderRadius: '50%', background: colors[k % colors.length], border, transform: `scale(${t})` }} />;

export const markerSquare =
  (colors: string[], size = 38, rotate = 0, border?: string): Marker =>
  ({ k, t }) => <span style={{ flex: 'none', width: size, height: size, background: colors[k % colors.length], border, transform: `scale(${t}) rotate(${rotate}deg)` }} />;

export const markerNum =
  ({ bg, fg, shape = 'circle', size = 58, border, font = 'display' }: { bg: string; fg: string; shape?: 'circle' | 'square'; size?: number; border?: string; font?: 'display' | 'body' }): Marker =>
  ({ c, k, t }) => (
    <span style={{ flex: 'none', width: size, height: size, borderRadius: shape === 'circle' ? '50%' : 6, background: bg, border, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font === 'display' ? c.fonts.display : c.fonts.body, fontSize: size * 0.56, fontWeight: 800, transform: `scale(${t})` }}>
      {k + 1}
    </span>
  );

export const markerDash =
  (color: string, width = 44, height = 8): Marker =>
  ({ t }) => <span style={{ flex: 'none', width: width * t, height, background: color, borderRadius: height / 2 }} />;

export const markerCheck =
  (color: string, bg?: string, size = 52): Marker =>
  ({ t }) => (
    <svg width={size} height={size} viewBox="0 0 52 52" style={{ flex: 'none' }}>
      {bg && <circle cx={26} cy={26} r={24} fill={bg} transform={`translate(26 26) scale(${t}) translate(-26 -26)`} />}
      <path d="M13 27 L22 36 L39 17" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - t)} />
    </svg>
  );

export const markerStar =
  (colors: string[], size = 48, stroke?: string): Marker =>
  ({ k, t }) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 ? 10 : 23;
      const a = (Math.PI * i) / 5 - Math.PI / 2;
      return `${(24 + r * Math.cos(a)).toFixed(1)},${(24 + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: 'none', transform: `scale(${t}) rotate(${(1 - t) * -120}deg)` }}>
        <polygon points={pts} fill={colors[k % colors.length]} stroke={stroke} strokeWidth={stroke ? 3 : 0} strokeLinejoin="round" />
      </svg>
    );
  };

export const markerArrow =
  (color: string, size = 46): Marker =>
  ({ t }) => (
    <svg width={size} height={size} viewBox="0 0 46 46" style={{ flex: 'none', transform: `translateX(${(1 - t) * -20}px)`, opacity: t }}>
      <path d="M6 23 H36 M24 11 L37 23 L24 35" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

/** A hand-drawn tick or star (wobbly line), for paper styles. */
export const markerScribble =
  (color: string, size = 50): Marker =>
  ({ k, t }) => {
    const w = (i: number) => (noise(k * 9 + i, 4) - 0.5) * 5;
    return (
      <svg width={size} height={size} viewBox="0 0 50 50" style={{ flex: 'none' }}>
        <path d={`M ${8 + w(1)} ${28 + w(2)} Q ${17 + w(3)} ${34 + w(4)} ${21 + w(5)} ${41 + w(6)} Q ${29 + w(7)} ${22 + w(8)} ${44 + w(9)} ${9 + w(10)}`} fill="none" stroke={color} strokeWidth={5.5} strokeLinecap="round" strokeDasharray={70} strokeDashoffset={70 * (1 - t)} />
      </svg>
    );
  };

// ---------------------------------------------------------------- rings

type Ring = StyleTheme['Ring'];

export const ringCircle =
  (color: string, width = 10, { dash, under, glow }: { dash?: string; under?: [number, string]; glow?: boolean } = {}): Ring =>
  ({ x, y, r, t }) => (
    <g style={glow ? { filter: `drop-shadow(0 0 10px ${color})` } : undefined}>
      {under && <circle cx={x} cy={y} r={r * t} fill="none" stroke={under[1]} strokeWidth={under[0]} />}
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} />
    </g>
  );

/** Four corner brackets locking onto a point (HUDs, cameras, targeting). */
export const ringBrackets =
  (color: string, width = 7, arm = 34): Ring =>
  ({ x, y, r, t }) => {
    const s = r * (1.6 - 0.6 * t);
    return (
      <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="square" opacity={t}>
        {[
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([dx, dy], k) => (
          <path key={k} d={`M ${x + dx * s} ${y + dy * s - dy * arm} V ${y + dy * s} H ${x + dx * s - dx * arm}`} />
        ))}
        <circle cx={x} cy={y} r={5} fill={color} stroke="none" />
      </g>
    );
  };

/** A rotating gun-sight reticle. */
export const ringReticle =
  (color: string, width = 5): Ring =>
  ({ c, x, y, r, t }) => (
    <g stroke={color} strokeWidth={width} fill="none" opacity={t} transform={`rotate(${c.frame * 2} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r * t} strokeDasharray="30 18" />
      <circle cx={x} cy={y} r={r * 0.55 * t} />
      {[0, 90, 180, 270].map((a) => (
        <line key={a} x1={x + Math.cos((a * Math.PI) / 180) * r * 0.7} y1={y + Math.sin((a * Math.PI) / 180) * r * 0.7} x2={x + Math.cos((a * Math.PI) / 180) * r * 1.25} y2={y + Math.sin((a * Math.PI) / 180) * r * 1.25} />
      ))}
    </g>
  );

/** A loose hand-drawn loop (marker, pencil, chalk), drawn in as it appears. */
export const ringScribble =
  (color: string, width = 8, seed = 2): Ring =>
  ({ x, y, r, t }) => {
    const pts = Array.from({ length: 26 }, (_, k) => {
      const a = (k / 24) * Math.PI * 2.15 - 1.2;
      const rr = r * (1 + (noise(k, seed) - 0.5) * 0.14) * (1 + k * 0.004);
      return `${(x + Math.cos(a) * rr * 1.1).toFixed(1)} ${(y + Math.sin(a) * rr * 0.92).toFixed(1)}`;
    });
    return <path d={`M ${pts.join(' L ')}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r * 8} strokeDashoffset={r * 8 * (1 - t)} />;
  };

export const ringSquare =
  (color: string, width = 8, radius = 0): Ring =>
  ({ x, y, r, t }) => <rect x={x - r * t} y={y - r * t} width={2 * r * t} height={2 * r * t} rx={radius} fill="none" stroke={color} strokeWidth={width} />;

// ---------------------------------------------------------------- transitions

type Transition = StyleTheme['transition'];

/** A panel sweeps across and away (color, optional pattern or content on it). */
export function trWipe({ color, dir = 'left', angle = 0, before = 4, after = 9, content, edge }: { color: string; dir?: 'left' | 'right' | 'up' | 'down'; angle?: number; before?: number; after?: number; content?: (c: Ctx) => ReactNode; edge?: string }): Transition {
  return {
    before,
    after,
    Draw: ({ c, d }) => {
      const p = interpolate(d, [-before, 0, after], [-1, 0, 1], clamp);
      const sign = dir === 'left' || dir === 'up' ? -1 : 1;
      const v = dir === 'up' || dir === 'down';
      const off = `${-sign * p * 130}%`;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: '-20%', transform: `rotate(${angle}deg) translate${v ? 'Y' : 'X'}(${off})`, background: color, borderLeft: !v && edge ? edge : undefined, borderRight: !v && edge ? edge : undefined, borderTop: v && edge ? edge : undefined, borderBottom: v && edge ? edge : undefined }}>
            {content?.(c)}
          </div>
        </AbsoluteFill>
      );
    },
  };
}

/** A circle closes on the middle and opens again (classic iris). */
export function trIris({ color, before = 5, after = 7 }: { color: string; before?: number; after?: number }): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const r = d < 0 ? interpolate(d, [-before, 0], [120, 0], clamp) : interpolate(d, [0, after], [0, 120], { ...clamp, easing: easeOut });
      return <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(circle at 50% 46%, transparent ${r}%, ${color} ${r + 0.5}%)` }} />;
    },
  };
}

/** A flash of light (white, or a color) with a short push. */
export function trFlash({ color = '#ffffff', peak = 0.9, before = 2, after = 8, push = 1.08 }: { color?: string; peak?: number; before?: number; after?: number; push?: number } = {}): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => <AbsoluteFill style={{ pointerEvents: 'none', background: color, opacity: d < 0 ? interpolate(d, [-before, 0], [0, peak * 0.7], clamp) : interpolate(d, [0, after], [peak, 0], clamp) }} />,
    camera: (d) => (d >= 0 ? { scale: interpolate(d, [0, after], [push, 1], { ...clamp, easing: easeOut }) } : {}),
  };
}

/** Venetian blinds close and open. */
export function trBlinds({ color, n = 9, vertical = false, before = 5, after = 7 }: { color: string; n?: number; vertical?: boolean; before?: number; after?: number }): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const p = d < 0 ? interpolate(d, [-before, 0], [0, 1], clamp) : interpolate(d, [0, after], [1, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {Array.from({ length: n }, (_, k) => {
            const size = 100 / n;
            const s = Math.max(0, Math.min(1, p * 1.4 - (k / n) * 0.4));
            return <div key={k} style={vertical ? { position: 'absolute', top: 0, bottom: 0, left: `${k * size}%`, width: `${size * s + 0.2}%`, background: color } : { position: 'absolute', left: 0, right: 0, top: `${k * size}%`, height: `${size * s + 0.2}%`, background: color }} />;
          })}
        </AbsoluteFill>
      );
    },
  };
}

/** A bright line scans down the frame, leaving the picture briefly dimmed. */
export function trScan({ color, dim = 0.55, before = 3, after = 12, height = 10 }: { color: string; dim?: number; before?: number; after?: number; height?: number }): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const y = interpolate(d, [-before, after], [-4, 104], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, top: `${y}%`, background: `rgba(0,0,0,${dim})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height, marginTop: -height / 2, background: color, boxShadow: `0 0 30px 10px ${hexA(color, 0.6)}` }} />
        </AbsoluteFill>
      );
    },
  };
}

/** Slices of shifted color and a jolt (digital glitch). */
export function trGlitch({ colors = ['#FF0050', '#00E5FF', '#FFFFFF'], before = 2, after = 8 }: { colors?: string[]; before?: number; after?: number } = {}): Transition {
  return {
    before,
    after,
    Draw: ({ c, d }) => {
      const s = d < 0 ? 0.6 : interpolate(d, [0, after], [1, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
          {Array.from({ length: 9 }, (_, k) => {
            const top = noise(c.frame, 10 + k) * 96;
            const h = 1 + noise(c.frame, 20 + k) * 6;
            return <div key={k} style={{ position: 'absolute', left: `${(noise(c.frame, 30 + k) - 0.5) * 16 * s}%`, right: 0, top: `${top}%`, height: `${h}%`, background: colors[k % colors.length], opacity: 0.55 * s }} />;
          })}
        </AbsoluteFill>
      );
    },
    camera: (d) => (d >= 0 && d < after ? { x: (noise(d, 7) - 0.5) * 6 * (1 - d / after), scale: 1.03 } : {}),
  };
}

/** An ink blot spreads over the frame and drains away (ink, paint, dye). */
export function trInk({ color, before = 6, after = 9, seed = 3 }: { color: string; before?: number; after?: number; seed?: number }): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const p = d < 0 ? interpolate(d, [-before, 0], [0, 1], { ...clamp, easing: easeOut }) : interpolate(d, [0, after], [1, 0], clamp);
      if (p <= 0) return null;
      const blobs = Array.from({ length: 7 }, (_, k) => ({ x: 120 + noise(k, seed) * 840, y: 200 + noise(k, seed + 1) * 1500, r: (500 + noise(k, seed + 2) * 600) * p }));
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <svg width={W} height={H}>
            <defs>
              <filter id={`ink-${seed}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed} />
                <feDisplacementMap in="SourceGraphic" scale="90" />
              </filter>
            </defs>
            <g filter={`url(#ink-${seed})`}>
              {blobs.map((b, k) => (
                <circle key={k} cx={b.x} cy={b.y} r={b.r} fill={color} />
              ))}
            </g>
          </svg>
        </AbsoluteFill>
      );
    },
  };
}

/** A sheet of paper with a torn edge slides over and off (collage, scrapbooks, paper styles). */
export function trTear({ paper, before = 5, after = 9, shadow = true }: { paper: string; before?: number; after?: number; shadow?: boolean }): Transition {
  const edge = Array.from({ length: 40 }, (_, k) => `${(k / 39) * 100}% ${noise(k, 8) * 3}%`).join(', ');
  return {
    before,
    after,
    Draw: ({ d }) => {
      const y = d < 0 ? interpolate(d, [-before, 0], [105, 0], { ...clamp, easing: easeOut }) : interpolate(d, [0, after], [0, -110], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: '-2%', right: '-2%', top: `${y}%`, height: '108%', background: paper, clipPath: `polygon(${edge}, 100% 100%, 0% 100%)`, filter: shadow ? 'drop-shadow(0 -10px 18px rgba(0,0,0,0.35))' : undefined }} />
        </AbsoluteFill>
      );
    },
  };
}

/** A film burn: orange light blooms from an edge and whites out. */
export function trBurn({ before = 3, after = 10 }: { before?: number; after?: number } = {}): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const p = d < 0 ? interpolate(d, [-before, 0], [0, 1], clamp) : interpolate(d, [0, after], [1, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'screen' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 90% 20%, rgba(255,250,235,${p}) 0%, rgba(255,150,40,${0.9 * p}) ${20 + 40 * p}%, rgba(200,40,0,${0.5 * p}) ${45 + 40 * p}%, transparent ${70 + 30 * p}%)` }} />
        </AbsoluteFill>
      );
    },
  };
}

/** Squares fill the frame in a scattered order and clear again (pixel dissolve). */
export function trPixels({ color, cell = 90, before = 5, after = 7 }: { color: string; cell?: number; before?: number; after?: number }): Transition {
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  return {
    before,
    after,
    Draw: ({ d }) => {
      const p = d < 0 ? interpolate(d, [-before, 0], [0, 1], clamp) : interpolate(d, [0, after], [1, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <svg width={W} height={H} shapeRendering="crispEdges">
            {Array.from({ length: cols * rows }, (_, k) => (noise(k, 5) < p ? <rect key={k} x={(k % cols) * cell} y={Math.floor(k / cols) * cell} width={cell} height={cell} fill={color} /> : null))}
          </svg>
        </AbsoluteFill>
      );
    },
  };
}

/** Two halves close like a camera shutter and open. */
export function trShutter({ color, before = 4, after = 6, vertical = true }: { color: string; before?: number; after?: number; vertical?: boolean }): Transition {
  return {
    before,
    after,
    Draw: ({ d }) => {
      const p = d < 0 ? interpolate(d, [-before, 0], [0, 50.5], { ...clamp, easing: easeOut }) : interpolate(d, [0, after], [50.5, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={vertical ? { position: 'absolute', left: 0, right: 0, top: 0, height: `${p}%`, background: color } : { position: 'absolute', top: 0, bottom: 0, left: 0, width: `${p}%`, background: color }} />
          <div style={vertical ? { position: 'absolute', left: 0, right: 0, bottom: 0, height: `${p}%`, background: color } : { position: 'absolute', top: 0, bottom: 0, right: 0, width: `${p}%`, background: color }} />
        </AbsoluteFill>
      );
    },
  };
}

/** No overlay: only the camera moves (a fast zoom with motion blur). */
export function trZoom({ before = 3, after = 9, from = 1.35, blur = 14 }: { before?: number; after?: number; from?: number; blur?: number } = {}): Transition {
  return {
    before,
    after,
    Draw: () => null,
    camera: (d) => (d < 0 ? { scale: interpolate(d, [-before, 0], [1, 1.12], clamp), blur: interpolate(d, [-before, 0], [0, blur * 0.6], clamp) } : { scale: interpolate(d, [0, after], [from, 1], { ...clamp, easing: easeOut }), blur: interpolate(d, [0, after * 0.7], [blur, 0], clamp) }),
  };
}

// ---------------------------------------------------------------- progress

type Progress = NonNullable<StyleTheme['Progress']>;

export const progBar =
  ({ color, track, pos = 'top', h = 12, inset = 0, radius = 0, glow }: { color: string; track?: string; pos?: 'top' | 'bottom'; h?: number; inset?: number; radius?: number; glow?: boolean }): Progress =>
  ({ c, total }) => {
    const w = (c.frame / Math.max(1, total)) * 100;
    const base: CSSProperties = { position: 'absolute', left: inset, right: inset, height: h, borderRadius: radius, [pos]: inset };
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {track && <div style={{ ...base, background: track }} />}
        <div style={{ ...base, right: 'auto', width: `calc(${w}% - ${(inset * 2 * w) / 100}px)`, background: color, boxShadow: glow ? `0 0 14px ${color}` : undefined }} />
      </AbsoluteFill>
    );
  };

/** A running timecode (film, video, news), bottom right by default. */
export const progTimecode =
  ({ color, bg, pos = 'bottom', fontSize = 34, prefix = '' }: { color: string; bg?: string; pos?: 'top' | 'bottom'; fontSize?: number; prefix?: string }): Progress =>
  ({ c }) => {
    const s = Math.floor(c.frame / c.fps);
    const ff = c.frame % c.fps;
    const tc = `${prefix}00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(ff).padStart(2, '0')}`;
    return (
      <div style={{ position: 'absolute', right: 48, [pos]: 64, fontFamily: 'ui-monospace, Menlo, monospace', fontSize, color, background: bg, padding: bg ? '4px 12px' : 0, letterSpacing: 2 }}>{tc}</div>
    );
  };
