import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { stars, svgFrame } from '../../kit/scenery';
import type { Ctx } from '../../theme';

/**
 * Pastel 3D: a soft, glossy kids'-cartoon world (an original look, not any studio's): rounded shapes
 * with big soft highlights, a starry lilac sky, a blushing smiling moon, a ringed planet and a little
 * round rocket gliding past. Everything bobs gently.
 */

const LILAC = '#B9A7FF';
const PINK = '#FF9ECD';
const TEAL = '#6EE7D8';
const GOLD = '#FFD36E';

/** A glossy sphere with a soft highlight. */
const glossy = (x: number, y: number, r: number, base: string, id: string) => (
  <g>
    <defs>
      <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.25" stopColor={base} />
        <stop offset="1" stopColor={base} stopOpacity={0.75} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
  </g>
);

function Dream({ c }: { c: Ctx }) {
  const bob = (k: number) => Math.sin(c.frame / 25 + k) * 10;
  const rx = ((c.frame * 2.4) % 1500) - 200;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#5B3FA8, #9C7CF0 55%, #F7B8E4)' }}>
      {svgFrame(
        <g>
          {stars(c.frame, { n: 70, seed: 12, bottom: 1300, size: 4, color: '#FFF4D6' })}
          {/* The moon with a face. */}
          <g transform={`translate(780 ${420 + bob(1)})`}>
            {glossy(0, 0, 140, '#FFF1B8', 'p3-moon')}
            <path d="M -50 -10 q 12 -12 24 0 M 26 -10 q 12 -12 24 0" stroke="#7A5A20" strokeWidth={8} fill="none" strokeLinecap="round" />
            <path d="M -30 30 q 30 26 60 0" stroke="#7A5A20" strokeWidth={8} fill="none" strokeLinecap="round" />
            <circle cx={-70} cy={22} r={18} fill={PINK} opacity={0.7} />
            <circle cx={70} cy={22} r={18} fill={PINK} opacity={0.7} />
          </g>
          {/* A ringed planet. */}
          <g transform={`translate(230 ${720 + bob(2)}) rotate(-18)`}>
            <ellipse rx={150} ry={36} fill="none" stroke={GOLD} strokeWidth={14} />
            {glossy(0, 0, 90, TEAL, 'p3-planet')}
            <path d="M -150 0 A 150 36 0 0 0 150 0" fill="none" stroke={GOLD} strokeWidth={14} />
          </g>
          {/* Soft round hills. */}
          <ellipse cx={200} cy={1820} rx={560} ry={420} fill="#F2A7D8" />
          <ellipse cx={900} cy={1880} rx={600} ry={420} fill="#D99BFF" />
          {/* A little round rocket gliding past. */}
          <g transform={`translate(${rx} ${1100 + bob(3) * 2}) rotate(70)`}>
            <path d="M 0 -90 C 50 -50 50 40 34 70 H -34 C -50 40 -50 -50 0 -90 Z" fill="#FFFFFF" />
            <path d="M 0 -90 C 30 -70 40 -50 44 -40 H -44 C -40 -50 -30 -70 0 -90 Z" fill="#FF6B8B" />
            <circle cy={0} r={22} fill={TEAL} stroke="#fff" strokeWidth={6} />
            <ellipse cy={96} rx={22} ry={30} fill={GOLD} opacity={0.9} />
          </g>
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const pastel3d = defineStyle({
  id: 'pastel-3d',
  accent: '#FF6B8B',
  colors: [TEAL, GOLD],
  entrance: 'bounce',
  Scene: Dream,
  caption: caption({ size: 92, glyph: 0.55, color: '#FFFFFF', emph: GOLD, weight: 800, stroke: [10, '#5B3FA8'], shadow: '0 8px 0 #4A2F90, 0 14px 20px rgba(0,0,0,0.2)', entrance: 'bounce' }),
  hook: hook({ top: 0.08, entrance: 'bounce', size: 78, weight: 800, color: '#FFFFFF', stroke: [12, '#5B3FA8'], shadow: '0 10px 0 #4A2F90' }),
  card: card({ bg: 'linear-gradient(180deg, #FFFFFF, #F2E8FF)', radius: 44, shadow: '0 12px 0 #C9B6FF, 0 22px 30px rgba(60,30,120,0.25)' }),
  title: text({ color: '#4A2F90', weight: 800 }),
  body: text({ font: 'body', color: '#7A5FC0', weight: 700 }),
  number: text({ color: '#FF6B8B', weight: 800, stroke: [10, '#fff'], shadow: '0 8px 0 #C9B6FF' }),
  slam: text({ color: GOLD, weight: 800, stroke: [12, '#5B3FA8'], shadow: '0 10px 0 #4A2F90' }),
  Marker: markerDot(['#FF6B8B', TEAL, GOLD], 38, '5px solid #fff'),
  Ring: ringCircle('#FF6B8B', 10, { under: [18, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', LILAC], ring: '#fff', ringWidth: 8 },
  transition: trIris({ color: LILAC }),
  sample: { type: 'pill', text: 'Bedtime adventure' },
});
