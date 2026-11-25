import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { stars, svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Cosmos: a barred spiral galaxy of thousands of points. A white-gold core that blooms, lilac and violet
 * arms, a sparse blue-white halo; the disc turns slowly and the camera drifts. Seeded, so every frame is
 * the same in the preview and the render.
 */

const GOLD = '#FFD98A';
const LILAC = '#C7A6FF';
const VIOLET = '#7B5CFF';
const BLUE = '#A9D4FF';

/** Points along two spiral arms with scatter, in polar coordinates. */
const POINTS = Array.from({ length: 900 }, (_, k) => {
  const arm = k % 2;
  const t = noise(k, 1);
  const r = 40 + t * 430;
  const a = arm * Math.PI + t * 4.4 + (noise(k, 2) - 0.5) * (0.9 - t * 0.4);
  const spread = (noise(k, 3) - 0.5) * (20 + t * 60);
  return { r: r + spread, a, size: 1.2 + noise(k, 4) * 2.8, col: t < 0.18 ? GOLD : t < 0.55 ? LILAC : noise(k, 5) > 0.5 ? VIOLET : BLUE, tw: noise(k, 6) };
});

function Galaxy({ c }: { c: Ctx }) {
  const spin = c.frame * 0.12;
  const bloom = 0.85 + 0.15 * Math.sin(c.frame / 40);
  return (
    <AbsoluteFill style={{ background: '#020108' }}>
      {svgFrame(
        <g>
          {stars(c.frame, { n: 160, seed: 21, bottom: 1920, size: 2.2 })}
          <g transform={`translate(540 860) rotate(${spin}) scale(1 0.58) rotate(${-spin * 0.3})`}>
            <circle r={260} fill="url(#cs-halo)" />
            {POINTS.map((p, k) => (
              <circle key={k} cx={Math.cos(p.a) * p.r} cy={Math.sin(p.a) * p.r} r={p.size} fill={p.col} opacity={0.55 + 0.45 * Math.abs(Math.sin(c.frame / 30 + p.tw * 6))} />
            ))}
            <ellipse rx={120 * bloom} ry={60 * bloom} fill="url(#cs-core)" />
          </g>
          <defs>
            <radialGradient id="cs-core">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.35" stopColor={GOLD} stopOpacity={0.9} />
              <stop offset="1" stopColor={GOLD} stopOpacity={0} />
            </radialGradient>
            <radialGradient id="cs-halo">
              <stop offset="0" stopColor={VIOLET} stopOpacity={0.35} />
              <stop offset="1" stopColor={VIOLET} stopOpacity={0} />
            </radialGradient>
          </defs>
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const cosmos = defineStyle({
  id: 'cosmos',
  accent: GOLD,
  colors: [LILAC, BLUE],
  entrance: 'fade',
  Scene: Galaxy,
  drift: (f) => ({ scale: 1.02 + 0.03 * Math.sin(f / 200), rotate: Math.sin(f / 300) * 1.2 }),
  caption: caption({ size: 86, glyph: 0.55, color: '#FFFFFF', emph: GOLD, weight: 300, letter: 3, upper: true, shadow: '0 0 20px rgba(123,92,255,0.8)', entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: '#FFFFFF', size: 74, weight: 300, letter: 8, upper: true, shadow: `0 0 30px ${VIOLET}` }),
  card: card({ bg: 'rgba(10,6,30,0.7)', border: '1px solid rgba(199,166,255,0.4)', radius: 20, blur: 10 }),
  title: text({ color: '#FFFFFF', weight: 300, letter: 3, upper: true }),
  body: text({ font: 'body', color: LILAC }),
  number: text({ color: GOLD, weight: 300, glow: GOLD }),
  slam: text({ color: '#FFFFFF', weight: 300, letter: 10, upper: true, glow: VIOLET }),
  Marker: markerDot([GOLD, LILAC, BLUE], 14),
  Ring: ringCircle(LILAC, 3, { glow: true }),
  stage: { shape: 'circle', fill: ['#1A1040', '#020108'], ring: LILAC, ringWidth: 2, glow: VIOLET },
  transition: trIris({ color: '#020108' }),
  sample: { type: 'counter', text: '100 billion', subtext: 'stars in one galaxy' },
});
