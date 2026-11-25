import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { ridge, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { drawStroke } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Screen Print Poster: opaque, hard-edged flat inks pulled one colour at a time, stepped colour bands
 * instead of gradients, and a travel-poster composition: layered mountains, a winding trail to the
 * summit, pines, a warm sun and a lake, with a big title band. (Also the "Visit Mount Opus" travel poster
 * from the prompt list, as an original poster.)
 */

const TEAL = '#2F6F73';
const OCHRE = '#D9963A';
const CREAM = '#F2E6C9';
const RUST = '#B5502E';
const NAVY = '#1F3448';

function Poster({ c }: { c: Ctx }) {
  const rise = Math.min(1, (c.frame % 420) / 80);
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {svgFrame(
        <g>
          {/* Stepped sky bands. */}
          {[CREAM, '#F2D8A8', '#EFC07E', OCHRE].map((col, k) => <rect key={col} x={0} y={180 + k * 120} width={1080} height={120} fill={col} />)}
          <circle cx={700} cy={640 - rise * 120} r={120} fill={RUST} />
          {[NAVY, TEAL, '#4E8C7E', '#8FB59A'].map((col, k) => (
            <polygon key={col} points={`-100,1920 ${ridge(780 + k * 150, 220 - k * 40, { freq: 1.2 + k * 0.4, seed: 3 + k, peaks: 0.8, shift: (c.frame / 2000) * (k + 1) }).join(' ')} 1180,1920`} fill={col} />
          ))}
          <path d="M 540 1700 C 420 1560 700 1440 560 1300 S 480 1060 600 900" stroke={CREAM} strokeWidth={10} fill="none" strokeDasharray="20 14" style={drawStroke(Math.min(1, (c.frame % 420) / 120), 1400)} />
          <ellipse cx={300} cy={1640} rx={200} ry={46} fill="#7FB8C8" />
          {[[160, 1500], [220, 1530], [860, 1480], [920, 1520]].map(([x, y], k) => (
            <path key={k} d={`M ${x} ${y} l 30 -110 l 30 110 z`} fill={NAVY} />
          ))}
        </g>,
      )}
      {/* Title band and footer, like a printed poster. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 180, background: NAVY }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: NAVY, color: CREAM, fontFamily: c.fonts.body, fontSize: 30, letterSpacing: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>FICTIONAL DESTINATION</div>
      {grain({ color: '#5A4A30', alpha: 0.35, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const screenPrint = defineStyle({
  id: 'screen-print',
  accent: RUST,
  colors: [TEAL, OCHRE],
  entrance: 'glide',
  Scene: Poster,
  caption: caption({ size: 92, glyph: 0.52, color: CREAM, emph: OCHRE, upper: true, letter: 2, bg: NAVY, pad: '4px 24px', entrance: 'glide' }),
  hook: hook({ top: 0.02, entrance: 'glide', color: CREAM, size: 92, upper: true, letter: 6, lineHeight: 1 }),
  card: card({ bg: CREAM, border: `6px solid ${NAVY}` }),
  title: text({ color: NAVY, upper: true, letter: 2 }),
  body: text({ font: 'body', color: TEAL, upper: true, letter: 2 }),
  number: text({ color: RUST, shadow: `6px 6px 0 ${NAVY}` }),
  slam: text({ color: CREAM, upper: true, letter: 4, extra: { background: RUST, padding: '0 26px' } }),
  Marker: markerDot([RUST, TEAL, OCHRE], 30),
  Ring: ringCircle(RUST, 12),
  stage: { shape: 'circle', fill: [CREAM, '#E6D4AE'], ring: NAVY, ringWidth: 10 },
  transition: trBlinds({ color: NAVY, n: 6 }),
  sample: { type: 'headline', text: 'Visit the high pass', subtext: 'Trains daily' },
});
