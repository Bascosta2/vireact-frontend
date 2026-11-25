import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { layer, vignette } from '../../kit/textures';
import { gradientText, type Ctx, type StyleTheme } from '../../theme';

/**
 * Glass Product: launch-film rendering in transparent and frosted glass. A dark-field studio, a soft
 * strip light sweeping diagonally across the picture, prism dispersion at the edges and caustic shimmer;
 * graphics are frosted glass panes with bright edges, text is cut crystal.
 */

const ICE = '#9EE7FF';
const VIOLET = '#B69CFF';

function Studio({ c }: { c: Ctx }) {
  // A strip light crosses every 4 seconds.
  const x = ((c.frame % 120) / 120) * 180 - 40;
  return (
    <AbsoluteFill>
      {vignette(0.85, '#020308', 38)}
      {layer({ background: `linear-gradient(115deg, transparent ${x - 8}%, rgba(255,255,255,0.22) ${x}%, transparent ${x + 8}%)`, mixBlendMode: 'screen' })}
      {layer({ background: `linear-gradient(115deg, transparent ${x - 14}%, rgba(255,80,160,0.12) ${x - 6}%, rgba(80,200,255,0.12) ${x + 6}%, transparent ${x + 14}%)`, mixBlendMode: 'screen' })}
      {/* Caustics: soft moving light ripples at the bottom of the frame. */}
      {layer({ top: '70%', backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(158,231,255,0.18), transparent 40%), radial-gradient(ellipse at 70% 60%, rgba(182,156,255,0.16), transparent 40%)', backgroundPosition: `${Math.sin(c.frame / 25) * 40}px 0`, filter: 'blur(10px)', mixBlendMode: 'screen' })}
    </AbsoluteFill>
  );
}

const crystal = gradientText('linear-gradient(180deg, #FFFFFF 0%, #DDF6FF 40%, #8FB8D8 52%, #FFFFFF 70%, #C9E9FF 100%)');

const refract: StyleTheme['transition'] = {
  before: 4,
  after: 10,
  Draw: ({ d }) => {
    const p = d < 0 ? interpolate(d, [-4, 0], [0, 1]) : interpolate(d, [0, 10], [1, 0], { extrapolateRight: 'clamp' });
    return <AbsoluteFill style={{ pointerEvents: 'none', background: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,${0.7 * p}) 50%, transparent 80%)`, mixBlendMode: 'screen', filter: 'blur(6px)' }} />;
  },
  camera: (d) => (d >= 0 ? { scale: interpolate(d, [0, 10], [1.08, 1], { extrapolateRight: 'clamp' }), blur: interpolate(d, [0, 5], [6, 0], { extrapolateRight: 'clamp' }) } : { blur: interpolate(d, [-4, 0], [0, 4]) }),
};

export const glassProduct = defineStyle({
  id: 'glass-product',
  accent: ICE,
  colors: [VIOLET, '#FFFFFF'],
  entrance: 'glide',
  footage: 'contrast(1.12) brightness(0.92) saturate(0.95)',
  drift: (f) => ({ scale: 1.02 + 0.015 * Math.sin(f / 90), x: Math.sin(f / 120) * 0.6 }),
  Overlay: ({ c }: { c: Ctx }) => <Studio c={c} />,
  caption: caption({ size: 88, glyph: 0.55, color: '#FFFFFF', emph: ICE, weight: 600, letter: 1, shadow: '0 4px 24px rgba(0,0,0,0.8)', entrance: 'glide' }),
  hook: hook({ top: 0.1, entrance: 'glide', color: '#FFFFFF', size: 70, weight: 600, letter: 2, bg: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.5)', radius: 30, pad: '22px 40px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 30px 60px rgba(0,0,0,0.5)', boxExtra: { backdropFilter: 'blur(18px) saturate(1.4)' } }),
  card: card({ bg: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.45)', radius: 30, blur: 18, shadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 30px 60px rgba(0,0,0,0.5)' }),
  title: text({ color: '#FFFFFF', weight: 600, letter: 1 }),
  body: text({ font: 'body', color: 'rgba(230,240,255,0.75)' }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, ...crystal, filter: `drop-shadow(0 0 22px ${ICE}88)` }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, textTransform: 'uppercase', ...crystal, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.6))' }),
  Marker: markerDot([ICE, VIOLET], 22, '2px solid rgba(255,255,255,0.8)'),
  Ring: ringCircle('rgba(255,255,255,0.9)', 3, { glow: true }),
  stage: { shape: 'circle', fill: ['#1B2133', '#05070C'], ring: 'rgba(255,255,255,0.6)', ringWidth: 2, glow: ICE },
  transition: refract,
  sample: { type: 'headline', text: 'Clear by design', subtext: 'Every edge, polished' },
});
