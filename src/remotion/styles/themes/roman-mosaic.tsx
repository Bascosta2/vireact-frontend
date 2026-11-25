import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop } from '../painted';
import { H, W, noise, type StyleTheme } from '../theme';

/**
 * Roman Mosaic: small stone tiles laid in rows, grout between them, each tile with its own slight colour
 * shift and a bevel highlight, in ochre, terracotta, sea green, slate and cream with one glass accent.
 * The guide's sea turtle swims across the floor as its own layer of tiles with slow flipper strokes,
 * sunlight plays across the tiles as if through water, and tiles never slide through each other: a jump
 * in the edit turns the floor over tile by tile.
 */

const OCHRE = '#D9A441';
const TERRA = '#C2553A';
const SEA = '#3E8E7E';
const SLATE = '#3F4852';
const CREAM = '#EFE3C8';
const GLASS = '#2FB6C9';
const GROUT = '#5A4A3A';
const TILE = 18;

/** A stone colour with this tile's own small shift. */
const shift = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const d = Math.round((noise(k, 11) - 0.5) * 26);
  const ch = (s: number) => Math.max(0, Math.min(255, ((n >> s) & 255) + d)).toString(16).padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};

/** Grout over the footage, so the picture itself reads as laid tiles. */
const grout: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  backgroundImage: `repeating-linear-gradient(0deg, ${GROUT} 0 2px, transparent 2px ${TILE}px), repeating-linear-gradient(90deg, ${GROUT} 0 2px, transparent 2px ${TILE}px)`,
  mixBlendMode: 'multiply',
  opacity: 0.5,
};

/** A band of tiles in a wave pattern (built once: it never changes). */
let bandCache: ReactNode = null;
function bands() {
  if (bandCache) return bandCache;
  const cols = Math.ceil(W / TILE);
  const rows = 6;
  const tiles: ReactNode[] = [];
  for (const top of [0, H - rows * TILE]) {
    for (let r = 0; r < rows; r += 1) {
      for (let col = 0; col < cols; col += 1) {
        const k = col * 31 + r * 7 + top;
        const wave = Math.round(2.5 + 2.5 * Math.sin(col / 3.2 + (top ? Math.PI : 0)));
        const base = r === 0 || r === rows - 1 ? SLATE : r === wave ? TERRA : Math.abs(r - wave) === 1 ? OCHRE : CREAM;
        tiles.push(<rect key={k} x={col * TILE + 1} y={top + r * TILE + 1} width={TILE - 2} height={TILE - 2} rx={2} fill={shift(base, k)} />);
      }
    }
  }
  bandCache = <g>{tiles}</g>;
  return bandCache;
}

/** The turtle's tiles, relative to its centre: shell, head, and four flippers that stroke. */
const SHELL = (() => {
  const out: { x: number; y: number; color: string }[] = [];
  for (let gy = -4; gy <= 4; gy += 1) {
    for (let gx = -5; gx <= 5; gx += 1) {
      const d = (gx / 5.4) ** 2 + (gy / 4.3) ** 2;
      if (d > 1) continue;
      const ring = d > 0.7 ? SLATE : (Math.abs(gx) + Math.abs(gy)) % 3 === 0 ? OCHRE : SEA;
      out.push({ x: gx * 14, y: gy * 14, color: ring });
    }
  }
  return out;
})();

function turtle(frame: number) {
  const x = ((frame * 2.2) % (W + 360)) - 180;
  const y = 1640 + Math.sin(frame / 50) * 18;
  const bank = Math.sin(frame / 50) * 10;
  const stroke = Math.sin(frame / 9);
  const flipper = (fx: number, fy: number, side: number, front: boolean) => {
    const a = (front ? 35 : 20) * stroke * side;
    return (
      <g transform={`translate(${fx} ${fy}) rotate(${a + side * (front ? 40 : 140)})`}>
        {[0, 1, 2, 3].slice(0, front ? 4 : 2).map((i) => <rect key={i} x={i * 14} y={-6} width={12} height={12} rx={2} fill={shift(SEA, i + fx)} />)}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) rotate(${bank})`}>
      {flipper(40, -50, -1, true)}
      {flipper(40, 50, 1, true)}
      {flipper(-50, -40, -1, false)}
      {flipper(-50, 40, 1, false)}
      {[0, 1, 2].map((i) => <rect key={i} x={78 + i * 13} y={-6 + (i === 1 ? 0 : 0)} width={12} height={12} rx={2} fill={shift(SEA, 40 + i)} />)}
      <rect x={104} y={-12} width={12} height={12} rx={2} fill={shift(SEA, 50)} />
      {SHELL.map((t, k) => <rect key={k} x={t.x - 6} y={t.y - 6} width={12} height={12} rx={2} fill={shift(t.color, k)} />)}
      {/* The one glass tile. */}
      <rect x={-6} y={-6} width={12} height={12} rx={2} fill={GLASS} opacity={0.6 + 0.4 * Math.sin(frame / 7)} />
    </g>
  );
}

const panel = (): CSSProperties => ({
  background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px ${TILE}px), repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0 2px, transparent 2px ${TILE}px), ${SLATE}`,
  border: `6px solid ${OCHRE}`,
  borderRadius: 4,
  boxShadow: `0 0 0 4px ${TERRA}, 0 16px 30px rgba(0,0,0,0.45)`,
});

export const romanMosaic: StyleTheme = {
  id: 'roman-mosaic',
  accent: OCHRE,
  colors: [TERRA, SEA],
  footage: 'sepia(0.3) saturate(0.95) contrast(1.08)',
  entrance: 'pop',
  step: 1,
  textScale: 0.86,
  Overlay: ({ c, scene }) => {
    const light = loop(c.frame, 150);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={grout} />
        {/* Sunlight through water: a soft band of brighter tiles drifting across. */}
        <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${light * 140 - 40}%, rgba(255,240,200,0.22) ${light * 140 - 25}%, transparent ${light * 140 - 10}%)`, mixBlendMode: 'screen' }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {bands()}
          {!scene && turtle(c.frame)}
        </svg>
        <div style={grainStyle({ color: '#3A2A1A', alpha: 0.35, freq: 1.2, size: 200, seed: 5, opacity: 0.5 })} />
      </AbsoluteFill>
    );
  },
  Scene: ({ c }) => (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #2B6F66 0%, ${SEA} 38%, #78AE9A 62%, #D9C59A 76%, #C9AE7E 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* Coral and weed laid in tiles on the sea floor. */}
        {Array.from({ length: 6 }, (_, k) => {
          const cx = 90 + k * 185;
          const cy = 1470 + (k % 2) * 110;
          return (
            <g key={k}>
              {Array.from({ length: 19 }, (_, i) => {
                const a = (i / 19) * Math.PI * 2;
                const r = i % 2 ? 36 : 18;
                return <rect key={i} x={cx + Math.cos(a) * r - 7} y={cy + Math.sin(a) * r * 0.8 - 7} width={14} height={14} rx={2} fill={shift(k % 2 ? TERRA : OCHRE, i + k * 19)} />;
              })}
              {Array.from({ length: 7 }, (_, i) => (
                <rect key={`w${i}`} x={cx + 60 + Math.sin(c.frame / 30 + i * 0.6 + k) * (i * 2)} y={cy - 40 - i * 16} width={12} height={14} rx={2} fill={shift(SEA, 200 + i + k)} />
              ))}
            </g>
          );
        })}
        {/* Slower than in the border and timed to be mid-floor early on, so the story opens on it. */}
        <g transform={focus(540, 1640, 540, 930, 2.3)}>{turtle(c.frame * 0.45 + 300)}</g>
      </svg>
    </AbsoluteFill>
  ),
  caption: {
    size: 66,
    glyph: 0.78,
    entrance: 'pop',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, padding: '10px 34px 14px', ...panel() }),
    word: (emphasis) => ({ color: emphasis ? OCHRE : CREAM }),
  },
  hook: {
    top: 0.12,
    entrance: 'pop',
    box: () => ({ ...panel(), padding: '24px 40px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, fontSize: 56, lineHeight: 1.18, color: CREAM, letterSpacing: 1 }),
  },
  card: panel,
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: CREAM, letterSpacing: 1 }),
  body: (c) => ({ fontFamily: c.fonts.body, color: OCHRE }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, color: OCHRE, WebkitTextStroke: `6px ${SLATE}`, paintOrder: 'stroke fill', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, color: CREAM, textTransform: 'uppercase', WebkitTextStroke: `7px ${SLATE}`, paintOrder: 'stroke fill', textShadow: '0 10px 22px rgba(0,0,0,0.55)' }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', inset: '-6% -10%', ...panel(), background: TERRA, transform: `scaleX(${t})` }} />,
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 32, height: 32, borderRadius: 3, background: shift([TERRA, SEA, OCHRE][k % 3], k), boxShadow: 'inset 3px 3px 0 rgba(255,255,255,0.3), inset -3px -3px 0 rgba(0,0,0,0.25)', transform: `scale(${t})` }} />,
  Ring: ({ x, y, r, t }) => <circle cx={x} cy={y} r={r * t} fill="none" stroke={OCHRE} strokeWidth={16} strokeDasharray="14 4" />,
  stage: { shape: 'square', fill: [SEA, '#2C6B5F'], ring: OCHRE, ringWidth: 8 },
  transition: {
    before: 6,
    after: 9,
    // The floor turns over: tiles flip up in a diagonal wave, then away.
    Draw: ({ d }) => {
      const size = 90;
      const cols = 12;
      const rows = 22;
      return (
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: cols * rows }, (_, k) => {
            const col = k % cols;
            const row = Math.floor(k / cols);
            const lag = (col + row) / (cols + rows);
            const s = d < 0 ? interpolate(d, [-6 + lag * 5, -1 + lag * 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(d, [lag * 6, lag * 6 + 3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            if (s <= 0) return null;
            const cx = col * size + size / 2;
            const cy = row * size + size / 2;
            return <rect key={k} x={cx - (size / 2) * s} y={cy - (size / 2) * s} width={size * s - 3} height={size * s - 3} rx={4} fill={shift([TERRA, SEA, OCHRE, SLATE, CREAM][(col * 3 + row) % 5], k)} />;
          })}
        </svg>
      );
    },
  },
  sample: { type: 'counter', text: '2,000', subtext: 'years old and still here' },
};
