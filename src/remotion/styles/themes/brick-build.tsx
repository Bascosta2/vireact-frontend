import { Fragment, type CSSProperties } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { W, noise, stepped, type StyleTheme } from '../theme';

/**
 * Brick Build (the guide's "Lego style", renamed: that name is a trademark): a bright, toy-like edit
 * built from plastic bricks. Cards are brick plates with studs on top, motion is snappy and runs on
 * two-frame steps like stop-motion, and a jump in the edit is covered by a wall of bricks that drops
 * in and pops away.
 */

const YELLOW = '#FFCD00';
const RED = '#E3000B';
const BLUE = '#006CB7';
const GREEN = '#00A650';
const INK = '#1A1A1A';
const BRICKS = [RED, YELLOW, BLUE, GREEN];

/** Darken a hex color (for the brick's shaded side). */
const shade = (hex: string, k = 0.72) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s: number) => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};

/** A round stud with a highlight, as on top of a brick. */
function stud({ color, size = 30, style }: { color: string; size?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size * 0.55,
        borderRadius: `${size / 2}px ${size / 2}px 4px 4px`,
        background: `linear-gradient(90deg, ${shade(color, 0.85)}, ${color} 35%, ${shade(color, 0.8)})`,
        boxShadow: `inset 0 3px 0 rgba(255,255,255,0.35)`,
        ...style,
      }}
    />
  );
}

/** A brick plate surface in a color. */
const plate = (color: string): CSSProperties => ({
  background: `linear-gradient(180deg, ${color}, ${shade(color, 0.9)})`,
  borderRadius: 12,
  boxShadow: `inset 0 4px 0 rgba(255,255,255,0.3), inset 0 -8px 0 rgba(0,0,0,0.16), 0 12px 0 ${shade(color, 0.6)}, 0 22px 30px rgba(0,0,0,0.35)`,
});

/** A row of studs along the top edge of a plate. */
function studRow({ color, count = 6 }: { color: string; count?: number }) {
  return (
    <div style={{ position: 'absolute', left: 24, right: 24, top: -15, display: 'flex', justifyContent: 'space-between' }}>
      {Array.from({ length: count }, (_, k) => <Fragment key={k}>{stud({ color })}</Fragment>)}
    </div>
  );
}

/** One band of bricks across the frame (top or bottom). */
function band({ top, frame }: { top: number; frame: number }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top, height: 58, display: 'flex' }}>
      {Array.from({ length: 9 }, (_, k) => {
        const color = BRICKS[(k + (top > 0 ? 2 : 0)) % 4];
        // A brick now and then gives a small toy hop.
        const hop = noise(Math.floor(frame / 40) * 9 + k, top) > 0.9 ? -6 : 0;
        return (
          <div key={k} style={{ position: 'relative', flex: 1, margin: '0 2px', transform: `translateY(${hop}px)`, ...plate(color), borderRadius: 6, boxShadow: `inset 0 3px 0 rgba(255,255,255,0.3), inset 0 -6px 0 ${shade(color, 0.75)}` }}>
            <div style={{ position: 'absolute', top: -13, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
              {stud({ color, size: 34 })}
              {stud({ color, size: 34 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const brickBuild: StyleTheme = {
  id: 'brick-build',
  accent: YELLOW,
  colors: [RED, BLUE],
  footage: 'saturate(1.35) contrast(1.08) brightness(1.06)',
  entrance: 'pop',
  step: 2,
  textScale: 0.9,
  Overlay: ({ c }) => {
    const f = stepped(c.frame, 2);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {/* Glossy plastic: a soft sheen from the top. */}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.14), transparent 30%)', mixBlendMode: 'screen' }} />
        {band({ top: 8, frame: f })}
        {band({ top: 1856, frame: f })}
      </AbsoluteFill>
    );
  },
  caption: {
    size: 82,
    glyph: 0.66,
    entrance: 'pop',
    box: (c) => ({ fontFamily: c.fonts.display, letterSpacing: 1 }),
    word: (emphasis) => ({ color: emphasis ? YELLOW : '#fff', WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 7px 0 ${INK}` }),
  },
  hook: {
    top: 0.12,
    entrance: 'pop',
    box: () => ({ ...plate(YELLOW), padding: '30px 40px 24px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 62, lineHeight: 1.15, color: INK }),
    Decor: () => studRow({ color: YELLOW, count: 5 }),
  },
  card: () => ({ ...plate(BLUE), position: 'relative' }),
  title: (c) => ({ fontFamily: c.fonts.display, color: '#fff', textShadow: `0 4px 0 ${shade(BLUE, 0.55)}` }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: '#FFE680' }),
  number: (c) => ({ fontFamily: c.fonts.display, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}` }),
  SlamBack: ({ t }) => (
    <div style={{ position: 'absolute', left: '-8%', right: '-8%', top: '-10%', bottom: '-14%', ...plate(RED), transform: `translateY(${(1 - t) * -80}px)` }}>
      {studRow({ color: RED, count: 7 })}
    </div>
  ),
  Marker: ({ k, t }) => {
    const color = BRICKS[k % 4];
    return (
      <span style={{ position: 'relative', flex: 'none', width: 50, height: 44, marginTop: 10, ...plate(color), borderRadius: 6, boxShadow: `inset 0 3px 0 rgba(255,255,255,0.3), 0 6px 0 ${shade(color, 0.6)}`, transform: `translateY(${(1 - t) * -40}px)`, opacity: t > 0 ? 1 : 0 }}>
        {stud({ color, size: 26, style: { position: 'absolute', top: -12, left: 12 } })}
      </span>
    );
  },
  // The ring is a circle of studs.
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={shade(RED, 0.6)} strokeWidth={22} strokeDasharray="0.1 30" strokeLinecap="round" transform={`translate(0 5)`} />
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={RED} strokeWidth={22} strokeDasharray="0.1 30" strokeLinecap="round" />
    </g>
  ),
  stage: { shape: 'square', fill: [GREEN, shade(GREEN, 0.75)], ring: shade(GREEN, 0.55), ringWidth: 8 },
  transition: {
    before: 8,
    after: 10,
    // A wall of bricks drops in row by row (bottom row first), then pops away top row first.
    Draw: ({ d }) => {
      const rows = 12;
      const cols = 5;
      const f = stepped(d, 2);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {Array.from({ length: rows * cols }, (_, k) => {
            const row = Math.floor(k / cols);
            const col = k % cols;
            const fromBottom = rows - 1 - row;
            const land = -8 + fromBottom * 0.55;
            const leave = row * 0.75;
            const fallY = interpolate(f, [land - 3, land], [-1200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const gone = f > leave ? interpolate(f, [leave, leave + 2], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
            if (gone <= 0 || fallY <= -1200) return null;
            const color = BRICKS[(row + col * 3) % 4];
            const offset = row % 2 ? -W / cols / 2 : 0;
            return (
              <div key={k} style={{ position: 'absolute', left: col * (W / cols) + offset, top: row * 160, width: W / cols + (row % 2 && col === cols - 1 ? W / cols / 2 : 0), height: 160, padding: 2, boxSizing: 'border-box', transform: `translateY(${fallY}px) scale(${gone})` }}>
                <div style={{ position: 'relative', width: '100%', height: '100%', ...plate(color), borderRadius: 8, boxShadow: `inset 0 4px 0 rgba(255,255,255,0.3), inset 0 -10px 0 ${shade(color, 0.75)}` }}>
                  <div style={{ position: 'absolute', top: -14, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
                    {stud({ color, size: 46 })}
                    {stud({ color, size: 46 })}
                  </div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      );
    },
  },
  sample: { type: 'list', text: 'Build it', items: ['Hook', 'Story', 'Payoff'] },
};
