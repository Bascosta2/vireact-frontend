import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { filmDamage, grain, vignette } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Newsreel: a sound newsreel of the late 1920s. Warm silver print with flicker, dust and scratches, a
 * rounded film gate, captions as white intertitle type, and a spinning globe-and-searchlight ident at
 * each cut.
 */

const SILVER = '#EDE6D6';
const BLACK = '#0E0C0A';

function Print({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {filmDamage(c.frame, { step: 2, scratches: 3, dust: 18, flicker: 0.1 })}
      {grain({ color: '#000', alpha: 0.35, frame: c.frame, freq: 1.1 })}
      {vignette(0.85, BLACK, 45)}
      <AbsoluteFill style={{ boxShadow: `inset 0 0 0 26px ${BLACK}`, borderRadius: 60 }} />
    </AbsoluteFill>
  );
}

/** The ident: a globe and searchlight beams spin over black. */
const ident: StyleTheme['transition'] = {
  before: 6,
  after: 10,
  Draw: ({ c, d }) => {
    const o = d < 0 ? interpolate(d, [-6, -2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : interpolate(d, [4, 10], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const spin = (d + 6) * 9;
    return (
      <AbsoluteFill style={{ background: BLACK, opacity: o, alignItems: 'center', justifyContent: 'center' }}>
        <svg width={700} height={700} viewBox="-350 -350 700 700">
          {[-50, -20, 20, 50].map((a, k) => (
            <polygon key={k} points={`0,300 ${Math.sin(((a + spin * 0.3) * Math.PI) / 180) * 700},-400 ${Math.sin(((a + 6 + spin * 0.3) * Math.PI) / 180) * 700},-400`} fill={SILVER} opacity={0.15} />
          ))}
          <circle r={170} fill="none" stroke={SILVER} strokeWidth={8} />
          {[-120, -60, 0, 60, 120].map((x) => (
            <ellipse key={x} rx={Math.abs(Math.cos(((x + spin) * Math.PI) / 180)) * 170} ry={170} fill="none" stroke={SILVER} strokeWidth={4} />
          ))}
          {[-100, -50, 0, 50, 100].map((y) => (
            <line key={y} x1={-Math.sqrt(170 * 170 - y * y)} y1={y} x2={Math.sqrt(170 * 170 - y * y)} y2={y} stroke={SILVER} strokeWidth={4} />
          ))}
          <text y={260} textAnchor="middle" fill={SILVER} fontSize={60} fontFamily={c.fonts.display} letterSpacing={8}>
            NEWS OF THE DAY
          </text>
        </svg>
      </AbsoluteFill>
    );
  },
};

export const newsreel = defineStyle({
  id: 'newsreel',
  accent: SILVER,
  colors: ['#B8AE98', BLACK],
  entrance: 'fade',
  step: 2,
  footage: 'grayscale(1) sepia(0.35) contrast(1.3) brightness(1.05)',
  Overlay: Print,
  caption: caption({ size: 86, glyph: 0.5, color: SILVER, emph: '#FFFFFF', upper: true, letter: 3, shadow: `0 0 4px ${BLACK}, 0 3px 0 ${BLACK}`, entrance: 'fade' }),
  hook: hook({ top: 0.1, entrance: 'fade', color: SILVER, size: 70, upper: true, letter: 5, bg: BLACK, border: `4px double ${SILVER}`, pad: '20px 34px' }),
  card: card({ bg: BLACK, border: `4px double ${SILVER}` }),
  title: text({ color: SILVER, upper: true, letter: 4 }),
  body: text({ font: 'body', color: '#C9C0AC', italic: true }),
  number: text({ color: SILVER, letter: 2, shadow: '0 4px 0 #000' }),
  slam: text({ color: SILVER, upper: true, letter: 8, extra: { background: BLACK, border: `4px double ${SILVER}`, padding: '0 30px' } }),
  Marker: markerDot([SILVER], 18),
  Ring: ringCircle(SILVER, 4, { dash: '14 8' }),
  stage: { shape: 'circle', fill: ['#3A352C', BLACK], ring: SILVER, ringWidth: 4 },
  transition: ident,
  sample: { type: 'headline', text: 'City opens new bridge', subtext: 'Crowds line the river' },
});
