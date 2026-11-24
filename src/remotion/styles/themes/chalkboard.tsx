import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { H, W, hexA, noise, type StyleTheme } from '../theme';

/**
 * Chalkboard: the edit drawn on a classroom board. A green board with a wooden frame and a chalk tray,
 * white chalk lines with a soft dusty edge, and colored chalk only for accents. Following the guide,
 * everything is written in: lines draw themselves, handwriting is revealed left to right, and a jump in
 * the edit is an eraser swipe.
 */

const BOARD = '#2F5D3A';
const BOARD_DARK = '#244A2E';
const WOOD = '#8B5A2B';
const CHALK = '#F4F4EA';
const YELLOW = '#FFE66B';
const PINK = '#FF9EC4';
const BLUE = '#8FD3FF';

/** Chalk lines are rough: an SVG filter breaks the edge up a little. Each svg defines its own copy. */
function chalkFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={4} />
    </filter>
  );
}

/** A path that draws itself as `t` goes 0 → 1. */
const drawn = (t: number, length = 1000): Pick<CSSProperties, 'strokeDasharray' | 'strokeDashoffset'> => ({ strokeDasharray: length, strokeDashoffset: length * (1 - Math.max(0, Math.min(1, t))) });

const chalkText = (color = CHALK): CSSProperties => ({ color, textShadow: `0 0 2px ${hexA(color, 0.8)}, 0 0 1px ${hexA(color, 0.9)}, 1px 1px 0 ${hexA(color, 0.25)}` });

const boardSurface = (): CSSProperties => ({
  background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08), transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(255,255,255,0.05), transparent 50%), ${BOARD}`,
  border: `10px solid ${WOOD}`,
  borderRadius: 8,
  boxShadow: 'inset 0 0 24px rgba(0,0,0,0.45), 0 16px 34px rgba(0,0,0,0.45)',
});

/** Doodles in the board's corners, drawn in over the first second. */
function doodles({ frame }: { frame: number }) {
  const t = interpolate(frame, [4, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const sway = Math.sin(frame / 30) * 3;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <defs>{chalkFilter({ id: 'chalk-doodles' })}</defs>
      <g filter="url(#chalk-doodles)" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.85}>
        {/* A cloud, top left, drifting a little. */}
        <path transform={`translate(${sway} 0)`} d="M70 250 q-10 -40 34 -46 q14 -36 58 -24 q30 -26 62 4 q40 -4 40 34 q22 26 -10 40 h-170 q-30 -4 -14 -8z" stroke={CHALK} strokeWidth={5} style={drawn(t)} />
        {/* A sun, top right, with rays. */}
        <circle cx={940} cy={240} r={40} stroke={YELLOW} strokeWidth={5} style={drawn(t, 260)} />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + frame / 90;
          return <line key={k} x1={940 + Math.cos(a) * 56} y1={240 + Math.sin(a) * 56} x2={940 + Math.cos(a) * 76} y2={240 + Math.sin(a) * 76} stroke={YELLOW} strokeWidth={5} opacity={t} />;
        })}
      </g>
    </svg>
  );
}

/** The ledge at the bottom with chalk sticks and an eraser, like the guide's board. */
function tray() {
  const stick = (left: number, color: string): CSSProperties => ({ position: 'absolute', left, bottom: 40, width: 74, height: 16, borderRadius: 6, background: color, boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.15)' });
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: `linear-gradient(180deg, #A06B36, ${WOOD} 40%, #6B4420)`, boxShadow: '0 -6px 12px rgba(0,0,0,0.35)' }} />
      <div style={stick(260, CHALK)} />
      <div style={stick(350, PINK)} />
      <div style={stick(440, YELLOW)} />
      <div style={{ position: 'absolute', right: 180, bottom: 40, width: 150, height: 34, borderRadius: 6, background: '#4A3A2A', borderTop: '10px solid #CFC6B8' }} />
    </>
  );
}

export const chalkboard: StyleTheme = {
  id: 'chalkboard',
  accent: YELLOW,
  colors: [PINK, BLUE],
  footage: 'saturate(0.8) contrast(1.05) sepia(0.16) brightness(0.97)',
  entrance: 'write',
  step: 1,
  textScale: 1.05,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* The board's green tint and chalk dust. */}
      <AbsoluteFill style={{ background: BOARD, mixBlendMode: 'soft-light', opacity: 0.55 }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.09), transparent 40%), radial-gradient(ellipse at 85% 80%, rgba(255,255,255,0.07), transparent 45%)' }} />
      {doodles({ frame: c.frame })}
      <div style={{ position: 'absolute', inset: 0, border: `24px solid ${WOOD}`, boxShadow: 'inset 0 0 0 4px #6B4420, inset 0 0 40px rgba(0,0,0,0.5)' }} />
      {tray()}
    </AbsoluteFill>
  ),
  caption: {
    size: 96,
    glyph: 0.44,
    entrance: 'write',
    box: (c) => ({ fontFamily: c.fonts.display, background: hexA(BOARD_DARK, 0.82), borderRadius: 16, padding: '4px 30px 10px', boxShadow: '0 10px 24px rgba(0,0,0,0.4)' }),
    word: (emphasis) => chalkText(emphasis ? YELLOW : CHALK),
  },
  hook: {
    top: 0.12,
    entrance: 'write',
    box: () => ({ ...boardSurface(), padding: '18px 40px 34px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 80, lineHeight: 1.12, ...chalkText() }),
    // A chalk underline is drawn under the title once it is written.
    Decor: ({ c }) => {
      const t = interpolate(c.frame, [12, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <svg viewBox="0 0 400 20" preserveAspectRatio="none" style={{ position: 'absolute', left: 40, right: 40, bottom: 12, width: 'calc(100% - 80px)', height: 20, overflow: 'visible' }}>
          <defs>{chalkFilter({ id: 'chalk-hook' })}</defs>
          <path d="M4 12 Q100 4 200 11 T396 9" fill="none" stroke={YELLOW} strokeWidth={5} strokeLinecap="round" filter="url(#chalk-hook)" style={drawn(t, 420)} />
        </svg>
      );
    },
  },
  card: boardSurface,
  title: (c) => ({ fontFamily: c.fonts.display, ...chalkText() }),
  body: (c) => ({ fontFamily: c.fonts.body, ...chalkText(YELLOW) }),
  number: (c) => ({ fontFamily: c.fonts.display, ...chalkText(YELLOW), textShadow: `0 0 3px ${YELLOW}, 0 6px 20px rgba(0,0,0,0.6)` }),
  slam: (c) => ({ fontFamily: c.fonts.display, ...chalkText(), textShadow: `0 0 3px ${CHALK}, 0 8px 22px rgba(0,0,0,0.7)` }),
  // A scribbled chalk ring round the word.
  SlamBack: ({ c }) => {
    const t = interpolate(c.frame, [2, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <svg viewBox="0 0 600 300" preserveAspectRatio="none" style={{ position: 'absolute', left: '-14%', top: '-30%', width: '128%', height: '160%', overflow: 'visible' }}>
        <defs>{chalkFilter({ id: 'chalk-slam' })}</defs>
        <path d="M80 160 C60 40 520 20 560 140 C590 250 120 290 60 190 C40 140 200 70 330 66" fill="none" stroke={PINK} strokeWidth={9} strokeLinecap="round" filter="url(#chalk-slam)" style={drawn(t, 1500)} />
      </svg>
    );
  },
  Marker: ({ t }) => (
    <svg width={48} height={48} viewBox="0 0 48 48" style={{ flex: 'none' }}>
      <defs>{chalkFilter({ id: 'chalk-tick' })}</defs>
      <path d="M6 26 L19 38 L42 9" fill="none" stroke={YELLOW} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" filter="url(#chalk-tick)" style={drawn(t, 60)} />
    </svg>
  ),
  Ring: ({ c, x, y, r }) => {
    const t = interpolate(c.frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const wob = Array.from({ length: 25 }, (_, k) => {
      const a = (k / 24) * Math.PI * 2.15 - 0.4;
      const rr = r * (1 + (noise(k, 5) - 0.5) * 0.12);
      return `${k === 0 ? 'M' : 'L'}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
    }).join(' ');
    return (
      <g>
        <defs>{chalkFilter({ id: 'chalk-ring' })}</defs>
        <path d={wob} fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" filter="url(#chalk-ring)" style={drawn(t, 800)} />
      </g>
    );
  },
  stage: { shape: 'circle', fill: [BOARD, BOARD_DARK], ring: CHALK, ringWidth: 5 },
  transition: {
    before: 6,
    after: 8,
    // An eraser sweeps the board: a green band slides in from the left, then clears off to the right.
    Draw: ({ d }) => {
      const right = interpolate(d, [-6, 0], [100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const left = interpolate(d, [0, 8], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, right: `${right}%`, background: `repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0 30px, transparent 30px 70px), ${BOARD}` }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: -40, width: 80, background: `linear-gradient(90deg, ${BOARD}, rgba(244,244,234,0.35), transparent)` }} />
          </div>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={60} style={{ position: 'absolute', top: 30, left: 0 }}>
      <defs>{chalkFilter({ id: 'chalk-progress' })}</defs>
      <line x1={50} y1={20} x2={50 + (W - 100) * (c.frame / Math.max(1, total))} y2={20} stroke={CHALK} strokeWidth={7} strokeLinecap="round" filter="url(#chalk-progress)" />
    </svg>
  ),
  sample: { type: 'list', text: 'Lesson 1', items: ['Hook them', 'Teach one thing', 'End with a why'] },
};
