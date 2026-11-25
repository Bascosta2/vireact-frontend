import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Ukiyo-e: an Edo-period woodblock print brought to life (an original composition). Flat colour blocks
 * with carved ink lines, a bokashi sky fading from deep blue, a great curling wave with claw-like foam
 * rolling in front of a distant snow-capped mountain, boats riding it; paper you can feel.
 */

const PRUSSIAN = '#1B3A5C';
const INDIGO = '#2E5A88';
const FOAM = '#F3EEDF';
const PAPER = '#EFE4CC';
const RED = '#B83A2E';

function Print({ c }: { c: Ctx }) {
  const roll = Math.sin(c.frame / 40) * 20;
  const claws = Array.from({ length: 14 }, (_, k) => {
    const x = 120 + k * 46 + roll;
    const y = 780 - Math.sin((k / 13) * Math.PI) * 160;
    return <path key={k} d={`M ${x} ${y} q 14 -30 30 -6 q -10 -6 -16 6`} fill={FOAM} stroke={PRUSSIAN} strokeWidth={3} />;
  });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {/* Bokashi: the sky fades from deep blue at the top. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 520, background: `linear-gradient(${PRUSSIAN}, rgba(239,228,204,0))` }} />
      {svgFrame(
        <g strokeLinejoin="round">
          {/* The distant mountain. */}
          <path d="M 560 1080 L 760 820 L 960 1080 Z" fill={INDIGO} stroke={PRUSSIAN} strokeWidth={4} />
          <path d="M 705 890 L 760 820 L 815 890 L 790 875 L 770 900 L 748 878 Z" fill={FOAM} />
          {/* The great wave. */}
          <path d={`M -40 1300 C 100 1000 ${200 + roll} 640 ${560 + roll} 640 C ${760 + roll} 640 ${800 + roll} 780 ${700 + roll} 820 C ${620 + roll} 760 ${500 + roll} 780 ${520 + roll} 900 C 560 1080 760 1200 1120 1180 V 1920 H -40 Z`} fill={INDIGO} stroke={PRUSSIAN} strokeWidth={6} />
          <path d={`M -40 1400 C 200 1300 400 1350 600 1300 S 900 1250 1120 1300 V 1920 H -40 Z`} fill={PRUSSIAN} />
          {/* Foam lines and claws. */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${40 + k * 40} ${1240 - k * 40} C 180 ${1000 - k * 40} ${280 + roll} ${720 + k * 30} ${540 + roll} ${700 + k * 30}`} fill="none" stroke={FOAM} strokeWidth={5} />
          ))}
          {claws}
          {/* Two boats riding the wave. */}
          {[[260, 1180, -24], [700, 1270, 10]].map(([x, y, r], k) => (
            <g key={k} transform={`translate(${x} ${y + Math.sin(c.frame / 20 + k) * 10}) rotate(${r})`}>
              <path d="M -120 0 Q 0 40 120 0 L 100 -20 H -100 Z" fill="#E8D7B0" stroke={PRUSSIAN} strokeWidth={4} />
              {[-60, -20, 20, 60].map((bx) => <circle key={bx} cx={bx} cy={-30} r={10} fill={PRUSSIAN} />)}
            </g>
          ))}
          {/* The cartouche and the red seal. */}
          <rect x={80} y={160} width={120} height={380} fill="#F7EEDA" stroke={PRUSSIAN} strokeWidth={4} />
          <rect x={90} y={560} width={60} height={60} fill={RED} />
        </g>,
      )}
      {grain({ color: '#7A6040', alpha: 0.35, freq: 0.5, stretch: [4, 1] })}
    </AbsoluteFill>
  );
}

export const ukiyoE = defineStyle({
  id: 'ukiyo-e',
  accent: RED,
  colors: [INDIGO, FOAM],
  entrance: 'fade',
  Scene: Print,
  caption: caption({ size: 92, glyph: 0.5, color: PRUSSIAN, emph: RED, bg: 'rgba(247,238,218,0.95)', pad: '4px 24px', boxExtra: { border: `3px solid ${PRUSSIAN}` }, entrance: 'fade' }),
  hook: hook({ top: 0.33, align: 'left', entrance: 'fade', color: PRUSSIAN, size: 70, bg: '#F7EEDA', pad: '14px 26px', boxExtra: { border: `4px solid ${PRUSSIAN}`, marginLeft: 120 } }),
  card: card({ bg: '#F7EEDA', border: `4px solid ${PRUSSIAN}` }),
  title: text({ color: PRUSSIAN }),
  body: text({ font: 'body', color: '#3A4A5A' }),
  number: text({ color: RED, stroke: [6, '#F7EEDA'] }),
  slam: text({ color: '#F7EEDA', extra: { background: RED, padding: '0 26px' } }),
  Marker: markerDot([RED, INDIGO], 26),
  Ring: ringCircle(RED, 8),
  stage: { shape: 'circle', fill: ['#F7EEDA', PAPER], ring: PRUSSIAN, ringWidth: 6 },
  transition: trWipe({ color: INDIGO, dir: 'right', edge: `8px solid ${FOAM}` }),
  sample: { type: 'headline', text: 'The great wave', subtext: 'and the three boats' },
});
