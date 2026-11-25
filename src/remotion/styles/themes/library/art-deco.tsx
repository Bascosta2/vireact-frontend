import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text } from '../../kit/presets';
import { gradientText, type Ctx, type StyleTheme } from '../../theme';

/**
 * Art Deco: black lacquer, engraved gold line and airbrushed geometry, a 1930s poster that moves. A
 * symmetrical gold frame with stepped corners and sunburst fans round the footage, gold lettering with a
 * centre axis, and cuts that open like elevator doors.
 */

const GOLD = '#D8B25A';
const BLACK = '#0B0B0C';
const GOLD_TEXT = gradientText('linear-gradient(180deg, #FFF3C4 0%, #D8B25A 45%, #8A6A22 55%, #F2D98A 100%)');

function Frame({ c }: { c: Ctx }) {
  const glint = (c.frame % 120) / 120;
  const fan = (x: number, y: number, flip: number) => (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`}>
      {Array.from({ length: 9 }, (_, k) => <line key={k} x1={0} y1={0} x2={Math.cos((k / 8) * Math.PI * 0.5) * 220} y2={Math.sin((k / 8) * Math.PI * 0.5) * 220} stroke={GOLD} strokeWidth={3} />)}
      <path d="M 220 0 A 220 220 0 0 1 0 220" fill="none" stroke={GOLD} strokeWidth={4} />
    </g>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(11,11,12,0.75) 100%)' }} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="ad-glint" x1="0" y1="0" x2="1" y2="1">
            <stop offset={Math.max(0, glint - 0.08)} stopColor={GOLD} />
            <stop offset={glint} stopColor="#FFF6D0" />
            <stop offset={Math.min(1, glint + 0.08)} stopColor={GOLD} />
          </linearGradient>
        </defs>
        <path d="M 40 160 H 280 L 320 120 H 760 L 800 160 H 1040 V 1760 H 800 L 760 1800 H 320 L 280 1760 H 40 Z" fill="none" stroke="url(#ad-glint)" strokeWidth={6} />
        <path d="M 64 184 H 290 L 330 144 H 750 L 790 184 H 1016 V 1736 H 790 L 750 1776 H 330 L 290 1736 H 64 Z" fill="none" stroke={GOLD} strokeWidth={2} />
        {fan(64, 184, 1)}
        {fan(1016, 184, -1)}
        <line x1={540} y1={120} x2={540} y2={60} stroke={GOLD} strokeWidth={4} />
        <path d="M 500 60 L 540 20 L 580 60 Z" fill={GOLD} />
      </svg>
    </AbsoluteFill>
  );
}

/** Elevator doors: two gold-edged black panels close and open. */
const doors: StyleTheme['transition'] = {
  before: 6,
  after: 8,
  Draw: ({ d }) => {
    const p = d < 0 ? interpolate(d, [-6, 0], [0, 50]) : interpolate(d, [0, 8], [50, 0], { extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${p}%`, background: BLACK, borderRight: `6px solid ${GOLD}` }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: `${p}%`, background: BLACK, borderLeft: `6px solid ${GOLD}` }} />
      </AbsoluteFill>
    );
  },
};

export const artDeco = defineStyle({
  id: 'art-deco',
  accent: GOLD,
  colors: ['#2E5E4E', '#F2EAD8'],
  entrance: 'fade',
  footage: 'contrast(1.12) saturate(0.8) sepia(0.15)',
  Overlay: Frame,
  caption: caption({ size: 86, glyph: 0.5, color: '#F2EAD8', emph: GOLD, upper: true, letter: 5, bg: 'rgba(11,11,12,0.82)', pad: '6px 30px', boxExtra: { borderTop: `2px solid ${GOLD}`, borderBottom: `2px solid ${GOLD}` }, entrance: 'fade' }),
  hook: hook({ top: 0.11, entrance: 'fade', size: 78, upper: true, letter: 8, extra: GOLD_TEXT, bg: 'rgba(11,11,12,0.85)', pad: '20px 40px', boxExtra: { border: `3px solid ${GOLD}`, outline: `1px solid ${GOLD}`, outlineOffset: 8 } }),
  card: card({ bg: 'rgba(11,11,12,0.9)', border: `3px solid ${GOLD}`, extra: { outline: `1px solid ${GOLD}`, outlineOffset: -10 } }),
  title: (c: Ctx) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', letterSpacing: 5, ...GOLD_TEXT }),
  body: text({ font: 'body', color: '#E8DCC0', letter: 2 }),
  number: (c: Ctx) => ({ fontFamily: c.fonts.display, ...GOLD_TEXT }),
  slam: (c: Ctx) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', letterSpacing: 10, ...GOLD_TEXT }),
  Marker: markerSquare([GOLD], 18, 45),
  Ring: ringCircle(GOLD, 3, { under: [9, BLACK] }),
  stage: { shape: 'circle', fill: ['#1A1A1C', BLACK], ring: GOLD, ringWidth: 5 },
  transition: doors,
  sample: { type: 'headline', text: 'The grand opening', subtext: 'Since 1931' },
});
