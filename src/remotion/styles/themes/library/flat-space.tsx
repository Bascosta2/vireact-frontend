import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { label, stars, svgFrame } from '../../kit/scenery';
import { hexA, type Ctx } from '../../theme';

/**
 * Flat Space: solid flat shapes on deep night blue. Planets have one shade step and hard-edged ring
 * glows (stepped, not blurred); dotted orbits; a tiny rocket on its way.
 */

const NIGHT = '#0B1240';
const SUN = '#FFC857';
const ORBIT = '#3C4C9E';

/** A planet with one shade step and stepped ring glows. */
const planet = (x: number, y: number, r: number, fill: string, shade: string, glow?: string) => (
  <g>
    {glow && [3, 2, 1].map((k) => <circle key={k} cx={x} cy={y} r={r + k * r * 0.22} fill={hexA(glow, 0.1 + (3 - k) * 0.07)} />)}
    <circle cx={x} cy={y} r={r} fill={fill} />
    <path d={`M ${x - r} ${y} A ${r} ${r} 0 0 0 ${x + r} ${y} A ${r * 1.15} ${r * 0.8} 0 0 1 ${x - r} ${y}`} fill={shade} />
  </g>
);

function Space({ c }: { c: Ctx }) {
  const a = c.frame / 60;
  const ex = 540 + Math.cos(a) * 330;
  const ey = 760 + Math.sin(a) * 120;
  const mx = 540 + Math.cos(a * 1.6 + 2) * 470;
  const my = 760 + Math.sin(a * 1.6 + 2) * 180;
  const rocketT = (c.frame % 240) / 240;
  const rx = 140 + rocketT * 820;
  const ry = 1220 - Math.sin(rocketT * Math.PI) * 220;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {svgFrame(
        <g>
          {stars(c.frame, { n: 110, seed: 3, bottom: 1920, size: 3.2 })}
          <ellipse cx={540} cy={760} rx={330} ry={120} fill="none" stroke={ORBIT} strokeWidth={3} strokeDasharray="4 14" />
          <ellipse cx={540} cy={760} rx={470} ry={180} fill="none" stroke={ORBIT} strokeWidth={3} strokeDasharray="4 14" />
          {/* Back halves of orbits are drawn before the sun, front halves after: here the planets pass in front. */}
          {planet(540, 760, 120, SUN, '#F59E2B', SUN)}
          {planet(ex, ey, 46, '#3FA9F5', '#2A78C2', '#3FA9F5')}
          {planet(mx, my, 34, '#F25F5C', '#C2403E')}
          {/* The rocket on its arc with a dotted trail. */}
          <path d={`M 140 1220 Q 550 780 960 1220`} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="2 14" opacity={0.5} />
          <g transform={`translate(${rx} ${ry}) rotate(${(rocketT - 0.5) * 70})`}>
            <path d="M 0 -40 C 18 -20 18 10 12 26 H -12 C -18 10 -18 -20 0 -40 Z" fill="#F4F4F8" />
            <circle cy={-8} r={7} fill="#3FA9F5" />
            <path d="M -12 26 L -22 40 L -6 30 Z M 12 26 L 22 40 L 6 30 Z" fill="#F25F5C" />
            <path d="M -8 30 L 0 52 L 8 30 Z" fill={SUN} />
          </g>
          {label(540, 960, 'NOT TO SCALE', { size: 26, fill: '#8EA0E6', font: c.fonts.body, weight: 400 })}
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const flatSpace = defineStyle({
  id: 'flat-space',
  accent: SUN,
  colors: ['#3FA9F5', '#F25F5C'],
  entrance: 'glide',
  footage: 'saturate(1.1) contrast(1.05)',
  Scene: Space,
  pip: pipAt({ boxShadow: `0 0 0 10px ${hexA(SUN, 0.35)}, 0 0 0 22px ${hexA(SUN, 0.18)}, 0 0 0 34px ${hexA(SUN, 0.08)}` }, 'circle'),
  Overlay: ({ c, scene }) => (scene ? null : <AbsoluteFill>{svgFrame(<g>{stars(c.frame, { n: 40, seed: 5, size: 2.4, bottom: 500 })}</g>)}</AbsoluteFill>),
  caption: caption({ size: 92, glyph: 0.55, color: '#FFFFFF', emph: SUN, weight: 800, stroke: [10, NIGHT], entrance: 'glide' }),
  hook: hook({ top: 0.085, color: '#FFFFFF', size: 66, weight: 800, bg: '#18237A', radius: 60, pad: '18px 40px', boxShadow: `0 0 0 8px ${hexA(SUN, 0.25)}` }),
  card: card({ bg: '#121C5C', radius: 28, shadow: `0 0 0 8px ${hexA('#3FA9F5', 0.2)}` }),
  title: text({ color: '#FFFFFF', weight: 800 }),
  body: text({ font: 'body', color: '#C8D2FF', weight: 400 }),
  number: text({ color: SUN, weight: 800 }),
  slam: text({ color: SUN, weight: 800, upper: true, stroke: [10, NIGHT] }),
  Marker: markerDot([SUN, '#3FA9F5', '#F25F5C'], 36),
  Ring: ringCircle(SUN, 8, { dash: '4 14' }),
  stage: { shape: 'circle', fill: ['#1B2A86', NIGHT], ring: SUN, ringWidth: 6 },
  transition: trIris({ color: NIGHT }),
  sample: { type: 'counter', text: '150M km', subtext: 'from Earth to the Sun' },
});
