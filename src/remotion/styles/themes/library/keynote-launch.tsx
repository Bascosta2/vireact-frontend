import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { glowSpot, layer, vignette } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Keynote Launch: a software launch film. Near-black gradient, a hairline grid, soft light from above,
 * one electric accent; text arrives in a waterfall cascade, graphics are soft dark panels, and cuts are a
 * velocity-matched zoom-through (the HyperFrames / ShotCraft launch grammar).
 */

const ELECTRIC = '#4D7CFF';
const SOFT = '#9DB4FF';

function Stage({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {layer({ background: 'linear-gradient(180deg, rgba(5,6,12,0.55), rgba(5,6,12,0.15) 35%, rgba(5,6,12,0.65))' })}
      {layer({ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '90px 90px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 20%, transparent 75%)' })}
      {glowSpot('50%', '-5%', ELECTRIC, '50%', 0.28 + 0.06 * Math.sin(c.frame / 40))}
      {vignette(0.6, '#05060C')}
    </AbsoluteFill>
  );
}

/** Zoom-through: the picture rushes forward into the cut and settles out of it. */
const zoomThrough: StyleTheme['transition'] = {
  before: 5,
  after: 10,
  Draw: ({ d }) => (d >= -2 && d <= 1 ? <AbsoluteFill style={{ background: '#05060C', opacity: d === 0 ? 0.6 : 0.3 }} /> : null),
  camera: (d) =>
    d < 0
      ? { scale: interpolate(d, [-5, 0], [1, 1.6], { easing: (v) => v * v * v }), blur: interpolate(d, [-5, 0], [0, 12]) }
      : { scale: interpolate(d, [0, 10], [0.86, 1], { extrapolateRight: 'clamp', easing: (v) => 1 - Math.pow(1 - v, 3) }), blur: interpolate(d, [0, 6], [10, 0], { extrapolateRight: 'clamp' }) },
};

export const keynoteLaunch = defineStyle({
  id: 'keynote-launch',
  accent: ELECTRIC,
  colors: [SOFT, '#FFFFFF'],
  entrance: 'glide',
  footage: 'contrast(1.06) saturate(0.95)',
  Overlay: Stage,
  caption: caption({ size: 90, glyph: 0.52, color: '#FFFFFF', emph: SOFT, weight: 600, letter: -1, shadow: '0 6px 30px rgba(0,0,0,0.8)', entrance: 'glide' }),
  hook: hook({ top: 0.1, entrance: 'glide', color: '#FFFFFF', size: 78, weight: 700, letter: -2, shadow: '0 10px 40px rgba(0,0,0,0.7)', Decor: ({ t }) => <div style={{ margin: '18px auto 0', width: 120 * t, height: 6, borderRadius: 3, background: ELECTRIC, boxShadow: `0 0 20px ${ELECTRIC}` }} /> }),
  card: card({ bg: 'linear-gradient(180deg, rgba(28,31,44,0.92), rgba(14,16,24,0.92))', border: '1px solid rgba(255,255,255,0.12)', radius: 28, shadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }),
  title: text({ color: '#FFFFFF', weight: 700, letter: -1 }),
  body: text({ font: 'body', color: 'rgba(220,226,255,0.7)', weight: 500 }),
  number: text({ weight: 700, letter: -4, extra: { backgroundImage: `linear-gradient(180deg, #FFFFFF, ${SOFT})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } }),
  slam: text({ color: '#FFFFFF', weight: 800, letter: -3, glow: ELECTRIC }),
  Marker: markerDot([ELECTRIC, SOFT], 20),
  Ring: ringCircle(ELECTRIC, 5, { glow: true }),
  stage: { shape: 'square', fill: ['#1C1F2C', '#0B0D14'], ring: 'rgba(255,255,255,0.15)', ringWidth: 2, glow: ELECTRIC },
  transition: zoomThrough,
  sample: { type: 'headline', text: 'Introducing Flow', subtext: 'Your work, one place' },
});
