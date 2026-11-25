import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringScribble, text, trIris } from '../../kit/presets';
import { stars, svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Sci-Fi Toon: adult-animation sci-fi sitcom look (an original world). Thick boiling outlines, flat
 * colour, a swirling green portal, an alien planet with a ringed moon and weird plants; one palette per
 * world.
 */

const PORTAL = '#7CFF4F';
const SKY = '#2B1B54';
const GROUND = '#C46BFF';
const INK = '#0E0A1A';

function Planet({ c }: { c: Ctx }) {
  const b = Math.floor(c.frame / 3);
  const w = (k: number) => (noise(b, k) - 0.5) * 5;
  const spin = c.frame * 4;
  return (
    <AbsoluteFill style={{ background: SKY }}>
      {svgFrame(
        <g stroke={INK} strokeWidth={8} strokeLinejoin="round">
          <g stroke="none">{stars(c.frame, { n: 60, seed: 31, bottom: 900, size: 3.5, color: '#FFE9A8' })}</g>
          <circle cx={260} cy={360} r={120 + w(1)} fill="#FF9F43" />
          <ellipse cx={260} cy={360} rx={190} ry={40} fill="none" stroke="#FFE9A8" strokeWidth={10} transform="rotate(-20 260 360)" />
          {/* The portal: a swirling green disc. */}
          <g transform={`translate(700 ${820 + w(2)})`}>
            <ellipse rx={230} ry={300} fill="#1F5E12" />
            {[0, 1, 2, 3].map((k) => (
              <ellipse key={k} rx={200 - k * 45} ry={270 - k * 60} fill={k % 2 ? '#B8FF8F' : PORTAL} stroke="none" transform={`rotate(${spin * (k % 2 ? -1 : 1) + k * 30})`} opacity={0.9} />
            ))}
            <ellipse rx={230} ry={300} fill="none" />
          </g>
          {/* Ground with weird plants. */}
          <path d={`M -20 1300 Q 300 ${1240 + w(3)} 600 1290 T 1100 1270 V 1920 H -20 Z`} fill={GROUND} />
          {[150, 420, 900].map((x, k) => (
            <g key={x} transform={`translate(${x} 1300) rotate(${Math.sin(c.frame / 20 + k) * 6})`}>
              <path d={`M 0 0 C ${-20 + w(k + 5)} -120 30 -160 0 -240`} fill="none" stroke={INK} />
              <circle cx={0} cy={-260} r={40 + w(k + 9)} fill={['#4FE3FF', '#FFE14D', '#FF5C8A'][k]} />
              <circle cx={-10} cy={-270} r={10} fill={INK} stroke="none" />
            </g>
          ))}
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const scifiToon = defineStyle({
  id: 'scifi-toon',
  accent: PORTAL,
  colors: [GROUND, '#FFE14D'],
  entrance: 'pop',
  step: 2,
  Scene: Planet,
  caption: caption({ size: 96, glyph: 0.5, color: '#FFFFFF', emph: PORTAL, stroke: [12, INK], shadow: `0 6px 0 ${INK}`, entrance: 'pop' }),
  hook: hook({ top: 0.07, color: INK, size: 74, bg: PORTAL, border: `7px solid ${INK}`, radius: 26, rotate: -2 }),
  card: card({ bg: '#FFFFFF', border: `7px solid ${INK}`, radius: 26 }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#3A2A5A' }),
  number: text({ color: PORTAL, stroke: [12, INK] }),
  slam: text({ color: PORTAL, stroke: [14, INK], shadow: `0 10px 0 ${INK}` }),
  Marker: markerDot([PORTAL, '#FF5C8A', '#4FE3FF'], 38, `5px solid ${INK}`),
  Ring: ringScribble(PORTAL, 10, 13),
  stage: { shape: 'circle', fill: ['#4A2E8A', SKY], ring: INK, ringWidth: 8 },
  transition: trIris({ color: PORTAL }),
  sample: { type: 'slam', text: 'OH NO.' },
});
