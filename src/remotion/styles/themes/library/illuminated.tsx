import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Illuminated Manuscript: the whole frame is one gilded miniature on vellum. Flat mineral pigments in
 * firm ink outlines, white-lead highlights, a burnished gold sky that glints as light moves, a vine
 * border with a decorated initial, and a little castle on a hill where the story happens.
 */

const VELLUM = '#F1E6CC';
const GOLD = '#D4A637';
const LAPIS = '#1F3F8C';
const VERMILION = '#C8402C';
const VERDIGRIS = '#3E8E6E';
const INK = '#2A1A10';

function Miniature({ c }: { c: Ctx }) {
  const glint = (c.frame % 180) / 180;
  return (
    <AbsoluteFill style={{ background: VELLUM }}>
      {svgFrame(
        <g stroke={INK} strokeWidth={4} strokeLinejoin="round">
          <defs>
            <linearGradient id="il-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#B8862B" />
              <stop offset={Math.max(0, glint - 0.1)} stopColor={GOLD} />
              <stop offset={glint} stopColor="#FFF0B0" />
              <stop offset={Math.min(1, glint + 0.1)} stopColor={GOLD} />
              <stop offset="1" stopColor="#9C6E1E" />
            </linearGradient>
          </defs>
          {/* The vine border. */}
          <rect x={60} y={120} width={960} height={1500} fill="none" stroke={LAPIS} strokeWidth={22} />
          <rect x={90} y={150} width={900} height={1440} fill="none" stroke={GOLD} strokeWidth={6} />
          {Array.from({ length: 16 }, (_, k) => (
            <g key={k}>
              <circle cx={75} cy={200 + k * 90} r={12} fill={k % 2 ? VERMILION : GOLD} />
              <circle cx={1005} cy={200 + k * 90} r={12} fill={k % 2 ? GOLD : VERMILION} />
            </g>
          ))}
          {/* The miniature: gold sky, a hill, a castle, a little figure. */}
          <path d="M 130 190 H 950 V 1100 H 130 Z" fill="url(#il-gold)" />
          <path d="M 130 1100 Q 300 860 540 900 T 950 980 V 1100 Z" fill={VERDIGRIS} />
          <g transform="translate(620 760)">
            <rect x={-80} y={0} width={160} height={150} fill={VELLUM} />
            <rect x={-110} y={-60} width={60} height={210} fill={VELLUM} />
            <rect x={50} y={-60} width={60} height={210} fill={VELLUM} />
            <path d="M -110 -60 L -80 -120 L -50 -60 Z M 50 -60 L 80 -120 L 110 -60 Z" fill={VERMILION} />
            <rect x={-20} y={80} width={40} height={70} fill={INK} />
          </g>
          <g transform={`translate(${300 + Math.sin(c.frame / 50) * 20} 1000)`}>
            <circle cy={-90} r={20} fill="#F2D1B0" />
            <path d="M -30 -66 H 30 L 40 20 H -40 Z" fill={LAPIS} />
            <path d="M -40 20 H 40" stroke={GOLD} strokeWidth={6} />
          </g>
          {/* The decorated initial. */}
          <rect x={130} y={1160} width={200} height={200} fill={LAPIS} />
          <text x={230} y={1320} textAnchor="middle" fill="url(#il-gold)" stroke={INK} strokeWidth={3} fontSize={190} fontFamily={c.fonts.display}>
            O
          </text>
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={360} y1={1200 + k * 50} x2={940} y2={1200 + k * 50} stroke={INK} strokeWidth={3} opacity={0.3} />
          ))}
        </g>,
      )}
      {grain({ color: '#7A5A30', alpha: 0.3, freq: 0.7 })}
    </AbsoluteFill>
  );
}

export const illuminated = defineStyle({
  id: 'illuminated',
  accent: GOLD,
  colors: [LAPIS, VERMILION],
  entrance: 'fade',
  Scene: Miniature,
  caption: caption({ size: 92, glyph: 0.48, color: INK, emph: VERMILION, bg: 'rgba(241,230,204,0.95)', pad: '4px 26px', boxExtra: { borderTop: `4px solid ${GOLD}`, borderBottom: `4px solid ${GOLD}` }, entrance: 'fade' }),
  hook: hook({ top: 0.84, entrance: 'fade', color: VELLUM, size: 64, bg: LAPIS, border: `5px solid ${GOLD}`, pad: '12px 30px' }),
  card: card({ bg: VELLUM, border: `6px double ${GOLD}` }),
  title: text({ color: LAPIS }),
  body: text({ font: 'body', color: INK, italic: true }),
  number: text({ color: VERMILION, stroke: [4, GOLD] }),
  slam: text({ color: GOLD, stroke: [6, INK] }),
  Marker: markerDot([VERMILION, GOLD, LAPIS], 24, `3px solid ${INK}`),
  Ring: ringCircle(GOLD, 8, { under: [14, INK] }),
  stage: { shape: 'circle', fill: [VELLUM, '#E2D2AC'], ring: GOLD, ringWidth: 10 },
  transition: trBlinds({ color: VELLUM, n: 8 }),
  sample: { type: 'headline', text: 'Once, in a gold country', subtext: '' },
});
