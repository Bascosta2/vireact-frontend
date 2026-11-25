import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle } from '../../kit/presets';
import { rain, svgFrame } from '../../kit/scenery';
import { glowSpot, grain, layer } from '../../kit/textures';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Neon Signs: a wet night street lit by real neon. The footage is cooled and darkened, rain falls, the
 * signs' colour bleeds onto the picture and pools in reflections at the bottom; every piece of text is a
 * bent glass tube that strikes with a flicker, with bloom and a little chromatic fringe.
 */

const PINK = '#FF2E88';
const CYAN = '#00E5FF';
const AMBER = '#FFB547';

/** A neon tube's text style: a hot core, a coloured tube, a wide bloom. */
const tube = (col: string) => ({ color: '#FFF5FB', textShadow: `0 0 4px #fff, 0 0 10px ${col}, 0 0 22px ${col}, 0 0 46px ${col}, 0 0 80px ${col}` });

function Street({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {glowSpot('0%', '30%', PINK, '45%', 0.35)}
      {glowSpot('100%', '55%', CYAN, '40%', 0.3)}
      {layer({ top: '74%', background: `linear-gradient(transparent, rgba(255,46,136,0.18) 30%, rgba(0,229,255,0.16))`, filter: 'blur(10px)', mixBlendMode: 'screen' })}
      {svgFrame(<g>{rain(c.frame, { n: 120, color: '#BFE6FF', opacity: 0.35, speed: 80, len: 70 })}</g>)}
      {grain({ color: '#000', alpha: 0.2, frame: c.frame })}
    </AbsoluteFill>
  );
}

/** A neon flicker on at the cut, with a buzz of dark frames. */
const strike: StyleTheme['transition'] = {
  before: 2,
  after: 10,
  Draw: ({ d }) => (d >= 0 && noise(d, 3) > 0.55 && d < 8 ? <AbsoluteFill style={{ background: '#05020A', opacity: 0.75 }} /> : null),
  camera: (d) => (d >= 0 && d < 10 ? { scale: 1.03 } : {}),
};

export const neonSigns = defineStyle({
  id: 'neon-signs',
  accent: PINK,
  colors: [CYAN, AMBER],
  entrance: 'flicker',
  footage: 'brightness(0.72) contrast(1.2) saturate(1.2) hue-rotate(8deg)',
  Overlay: Street,
  caption: caption({ size: 96, glyph: 0.5, color: '#FFF5FB', emph: CYAN, glow: CYAN, entrance: 'flicker', shadow: `0 0 4px #fff, 0 0 12px ${PINK}, 0 0 28px ${PINK}, 0 0 60px ${PINK}` }),
  hook: hook({ top: 0.09, entrance: 'flicker', size: 80, color: '#FFF5FB', shadow: `0 0 4px #fff, 0 0 12px ${CYAN}, 0 0 30px ${CYAN}, 0 0 60px ${CYAN}`, border: `5px solid ${CYAN}`, radius: 30, pad: '18px 34px', boxShadow: `0 0 18px ${CYAN}, inset 0 0 18px ${CYAN}`, bg: 'rgba(5,2,10,0.55)' }),
  card: card({ bg: 'rgba(5,2,10,0.75)', border: `4px solid ${PINK}`, radius: 26, shadow: `0 0 20px ${PINK}, inset 0 0 20px ${PINK}66` }),
  title: (c) => ({ fontFamily: c.fonts.display, ...tube(CYAN) }),
  body: (c) => ({ fontFamily: c.fonts.body, color: '#FFD9EC', textShadow: `0 0 8px ${PINK}` }),
  number: (c) => ({ fontFamily: c.fonts.display, ...tube(AMBER) }),
  slam: (c) => ({ fontFamily: c.fonts.display, ...tube(PINK) }),
  Marker: markerDot([PINK, CYAN, AMBER], 22),
  Ring: ringCircle(CYAN, 6, { glow: true }),
  stage: { shape: 'circle', fill: ['#1A0A24', '#05020A'], ring: PINK, ringWidth: 5, glow: PINK },
  transition: strike,
  sample: { type: 'pill', text: 'Open all night' },
});
