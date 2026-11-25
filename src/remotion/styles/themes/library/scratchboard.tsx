import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trInk } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Scratchboard: a world rendered as a scratchboard print, white lines scratched out of black ink with
 * one red, crossed by one unbroken camera move: a lighthouse on a cliff, a sea of scratched wave lines,
 * rain and a beam that sweeps. Depth and light are made only from line density.
 */

const INK = '#0B0B0D';
const WHITE = '#F4F1EA';
const RED = '#D2332A';

function Print({ c }: { c: Ctx }) {
  const beam = Math.sin(c.frame / 50) * 40;
  const push = (c.frame % 600) / 600;
  return (
    <AbsoluteFill style={{ background: INK }}>
      <AbsoluteFill style={{ transform: `scale(${1 + push * 0.12})`, transformOrigin: '60% 45%' }}>
        {svgFrame(
          <g stroke={WHITE} fill="none" strokeLinecap="round">
            {/* Sky: sparse horizontal scratches, denser near the horizon. */}
            {Array.from({ length: 60 }, (_, k) => {
              const y = 120 + k * 14;
              const density = k / 60;
              return <line key={`s${k}`} x1={noise(k, 1) * 200} y1={y} x2={1080 - noise(k, 2) * 200} y2={y + (noise(k, 3) - 0.5) * 4} strokeWidth={0.8 + density * 1.6} opacity={0.25 + density * 0.5} />;
            })}
            {/* The sea: wave lines that move. */}
            {Array.from({ length: 34 }, (_, k) => {
              const y = 1000 + k * 26;
              const ph = c.frame / 20 + k * 0.7;
              return <path key={`w${k}`} d={Array.from({ length: 12 }, (_, i) => `${i ? 'L' : 'M'} ${i * 100} ${y + Math.sin(i * 0.9 + ph) * (6 + k * 0.4)}`).join(' ')} strokeWidth={1.4 + k * 0.05} opacity={0.5 + (k / 34) * 0.4} />;
            })}
            {/* The cliff, cross-hatched, and the lighthouse. */}
            <path d="M 560 1000 L 640 760 L 760 700 L 1100 700 V 1000 Z" fill={INK} stroke={WHITE} strokeWidth={3} />
            {Array.from({ length: 22 }, (_, k) => (
              <line key={`c${k}`} x1={640 + k * 20} y1={760} x2={600 + k * 22} y2={1000} strokeWidth={1.2} opacity={0.6} />
            ))}
            <path d="M 820 700 L 840 420 H 900 L 920 700 Z" fill={INK} stroke={WHITE} strokeWidth={3} />
            {[480, 560, 640].map((y) => <line key={y} x1={836} y1={y} x2={906} y2={y} stroke={RED} strokeWidth={14} />)}
            <rect x={836} y={380} width={70} height={40} fill={WHITE} />
            {/* The sweeping beam. */}
            <path d={`M 870 400 L ${120 + beam * 6} ${300 + beam} L ${120 + beam * 6} ${470 + beam} Z`} fill={WHITE} stroke="none" opacity={0.18} />
            {/* Scratched rain. */}
            {Array.from({ length: 40 }, (_, k) => {
              const y = (noise(k, 9) * 1900 + c.frame * 30) % 1900;
              const x = noise(k, 10) * 1080;
              return <line key={`r${k}`} x1={x} y1={y} x2={x - 8} y2={y + 40} strokeWidth={1.2} opacity={0.5} />;
            })}
          </g>,
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const scratchboard = defineStyle({
  id: 'scratchboard',
  accent: RED,
  colors: [WHITE, '#6E6A66'],
  entrance: 'fade',
  Scene: Print,
  caption: caption({ size: 92, glyph: 0.5, color: WHITE, emph: RED, upper: true, letter: 2, bg: INK, pad: '4px 24px', boxExtra: { border: `2px solid ${WHITE}` }, entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: WHITE, size: 76, upper: true, letter: 4, bg: INK, border: `3px solid ${WHITE}`, pad: '14px 30px' }),
  card: card({ bg: INK, border: `3px solid ${WHITE}` }),
  title: text({ color: WHITE, upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#CFCAC0' }),
  number: text({ color: RED, stroke: [4, INK] }),
  slam: text({ color: WHITE, upper: true, letter: 6, extra: { borderBottom: `8px solid ${RED}` } }),
  Marker: markerDot([RED, WHITE], 18),
  Ring: ringCircle(WHITE, 3, { dash: '2 6' }),
  stage: { shape: 'circle', fill: ['#1E1E22', INK], ring: WHITE, ringWidth: 3 },
  transition: trInk({ color: INK }),
  sample: { type: 'headline', text: 'The last keeper', subtext: '' },
});
