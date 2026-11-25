import { AbsoluteFill, interpolate } from 'remotion';
import { thresholdFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text } from '../../kit/presets';
import { grain, halftone } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Kino Montage: the footage printed as one ink-and-paper constructivist poster with a single red.
 * Two-ink print grade, heavy diagonal red bands and a circle that rotate on the beat, slab-serif slogans
 * on a tilt, and cuts that slam a red diagonal across the frame.
 */

const RED = '#D21F1F';
const PAPER = '#EFE6D2';
const INK = '#151413';

function Poster({ c }: { c: Ctx }) {
  const beat = Math.floor(c.frame / 15) % 4;
  const rot = [-18, -18, 12, 12][beat];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, mixBlendMode: 'multiply' }}>
        <g transform={`rotate(${rot} 540 960)`}>
          <rect x={-400} y={250} width={1900} height={110} fill={RED} />
          <rect x={-400} y={1560} width={1900} height={60} fill={RED} />
        </g>
        <circle cx={880} cy={1340} r={170 + (beat % 2) * 12} fill={RED} opacity={0.9} />
        <circle cx={880} cy={1340} r={90} fill={PAPER} />
      </svg>
      {halftone({ color: INK, size: 10, dot: 1.2, opacity: 0.12 })}
      {grain({ color: '#5A4A30', alpha: 0.35, freq: 0.75 })}
      <div style={{ position: 'absolute', left: 50, bottom: 240, fontFamily: c.fonts.display, fontSize: 40, color: INK, transform: 'rotate(-8deg)', letterSpacing: 4 }}>№ 7 · 1927</div>
    </AbsoluteFill>
  );
}

const slash: StyleTheme['transition'] = {
  before: 3,
  after: 7,
  Draw: ({ d }) => {
    const p = interpolate(d, [-3, 0, 7], [-1.2, 0, 1.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '-50%', width: '200%', top: '30%', height: '40%', background: RED, transform: `rotate(-24deg) translateX(${p * 100}%)` }} />
        <div style={{ position: 'absolute', left: '-50%', width: '200%', top: '48%', height: '8%', background: INK, transform: `rotate(-24deg) translateX(${-p * 100}%)` }} />
      </AbsoluteFill>
    );
  },
};

export const kinoMontage = defineStyle({
  id: 'kino-montage',
  accent: RED,
  colors: [INK, PAPER],
  entrance: 'pop',
  textScale: 0.82,
  footage: 'url(#kino-print) contrast(1.05)',
  Defs: () => thresholdFilter('kino-print', INK, PAPER, 0.42, 0.12),
  Overlay: Poster,
  caption: caption({ size: 104, glyph: 0.5, color: INK, emph: RED, upper: true, bg: PAPER, pad: '0 22px', boxExtra: { transform: 'rotate(-4deg)', borderLeft: `20px solid ${RED}` }, entrance: 'pop' }),
  hook: hook({ top: 0.15, align: 'left', color: PAPER, size: 88, upper: true, bg: INK, pad: '8px 26px', rotate: -8, boxShadow: `14px 14px 0 ${RED}` }),
  card: card({ bg: PAPER, border: `6px solid ${INK}`, extra: { transform: 'rotate(-3deg)' } }),
  title: text({ color: INK, upper: true }),
  body: text({ font: 'body', color: '#3A332A', upper: true, letter: 2 }),
  number: text({ color: RED, shadow: `8px 8px 0 ${INK}` }),
  slam: text({ color: PAPER, upper: true, extra: { background: RED, padding: '0 28px', transform: 'rotate(-6deg)' } }),
  Marker: markerSquare([RED, INK], 30, 45),
  Ring: ringCircle(RED, 14),
  stage: { shape: 'circle', fill: [PAPER, '#DCD0B4'], ring: RED, ringWidth: 14 },
  transition: slash,
  sample: { type: 'slam', text: 'FORWARD!' },
});
