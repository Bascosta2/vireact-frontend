import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerStar, ringScribble, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Doodle: hand-drawn doodles live round the footage: stars, squiggles, hearts, arrows and sparkles with
 * wobbly black outlines, animated on twos so the lines boil; a hot pink and aqua palette, bubbly
 * outlined captions.
 */

const PINK = '#FF4FA3';
const AQUA = '#3EE6D4';
const YELLOW = '#FFE14D';
const INK = '#151515';

function Doodles({ c }: { c: Ctx }) {
  const b = Math.floor(c.frame / 2);
  const w = (k: number) => (noise(b, k) - 0.5) * 6;
  const star = (x: number, y: number, r: number, fill: string, k: number) => {
    const pts = Array.from({ length: 10 }, (_, i) => {
      const rr = i % 2 ? r * 0.45 : r;
      const a = (Math.PI * i) / 5 - Math.PI / 2;
      return `${(x + Math.cos(a) * rr + w(k + i)).toFixed(1)},${(y + Math.sin(a) * rr + w(k + i + 20)).toFixed(1)}`;
    }).join(' ');
    return <polygon key={k} points={pts} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />;
  };
  return (
    <AbsoluteFill>
      {svgFrame(
        <g strokeLinecap="round">
          {star(140, 260, 70, YELLOW, 1)}
          {star(950, 520, 50, PINK, 40)}
          {star(120, 1500, 46, AQUA, 80)}
          <path d={`M ${760 + w(3)} 230 q 40 -50 80 0 t 80 0 t 80 0`} stroke={PINK} strokeWidth={10} fill="none" />
          <path d={`M 80 ${880 + w(5)} q 30 40 0 80 t 0 80`} stroke={AQUA} strokeWidth={10} fill="none" />
          <path d={`M ${880 + w(7)} 1420 c -40 -40 -80 0 -40 40 l 40 40 l 40 -40 c 40 -40 0 -80 -40 -40 z`} fill={PINK} stroke={INK} strokeWidth={6} />
          <path d={`M 860 1700 q ${60 + w(8)} -80 120 -40 m -20 -30 l 20 30 l -36 10`} stroke={INK} strokeWidth={7} fill="none" />
          {[0, 1, 2].map((k) => (
            <g key={k} transform={`translate(${300 + k * 280} ${1780 + w(9 + k)}) scale(${0.8 + 0.2 * Math.abs(Math.sin(c.frame / 8 + k))})`}>
              <path d="M 0 -26 V 26 M -26 0 H 26" stroke={[YELLOW, AQUA, PINK][k]} strokeWidth={9} />
            </g>
          ))}
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const doodle = defineStyle({
  id: 'doodle',
  accent: PINK,
  colors: [AQUA, YELLOW],
  entrance: 'pop',
  step: 2,
  footage: 'saturate(1.15) brightness(1.04)',
  Overlay: Doodles,
  caption: caption({ size: 98, glyph: 0.5, color: '#FFFFFF', emph: YELLOW, stroke: [12, INK], shadow: `6px 6px 0 ${PINK}`, entrance: 'pop' }),
  hook: hook({ top: 0.09, color: INK, size: 76, bg: YELLOW, radius: 30, border: `6px solid ${INK}`, rotate: -3, boxShadow: `8px 8px 0 ${PINK}` }),
  card: card({ bg: '#FFFFFF', border: `6px solid ${INK}`, radius: 30, shadow: `10px 10px 0 ${AQUA}`, extra: { transform: 'rotate(-1.5deg)' } }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#333' }),
  number: text({ color: PINK, stroke: [10, INK], shadow: `8px 8px 0 ${AQUA}` }),
  slam: text({ color: YELLOW, stroke: [12, INK], shadow: `10px 10px 0 ${PINK}` }),
  Marker: markerStar([YELLOW, AQUA, PINK], 50, INK),
  Ring: ringScribble(PINK, 10, 7),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#FFF4FA'], ring: INK, ringWidth: 7 },
  transition: trWipe({ color: AQUA, dir: 'right', angle: -6, edge: `10px solid ${INK}` }),
  sample: { type: 'slam', text: 'YAY!' },
});
