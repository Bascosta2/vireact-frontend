import { AbsoluteFill } from 'remotion';
import { rampFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { grain, halftone } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Risograph: animation that looks printed frame by frame on a stencil duplicator. The footage in two
 * translucent spot inks (fluorescent pink over blue) on warm paper, each pass slightly misregistered and
 * shifting every frame, with grainy halftone and ink drop-outs.
 */

const PINK = '#FF48B0';
const BLUE = '#0078BF';
const PAPER = '#F4EFE3';

function Press({ c }: { c: Ctx }) {
  const dx = (noise(Math.floor(c.frame / 2), 1) - 0.5) * 6;
  const dy = (noise(Math.floor(c.frame / 2), 2) - 0.5) * 6;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: PINK, mixBlendMode: 'multiply', opacity: 0.22, transform: `translate(${dx}px, ${dy}px)` }} />
      {halftone({ color: BLUE, size: 7, dot: 1.1, opacity: 0.18, angle: 15 })}
      {grain({ color: '#3A2A1A', alpha: 0.35, freq: 0.9, frame: c.frame })}
    </AbsoluteFill>
  );
}

/** Text printed twice in two inks, off register. */
const riso = (main: string, ghost: string, dx = 5, dy = 3) => ({ color: main, textShadow: `${dx}px ${dy}px 0 ${ghost}`, mixBlendMode: 'multiply' as const });

export const risograph = defineStyle({
  id: 'risograph',
  accent: PINK,
  colors: [BLUE, '#FFD23F'],
  entrance: 'pop',
  step: 2,
  footage: 'url(#riso-duo) contrast(1.05)',
  Defs: () => rampFilter('riso-duo', ['#1D2D6B', BLUE, '#E39AC8', PAPER], { contrast: 1.25 }),
  Overlay: Press,
  caption: caption({ size: 96, glyph: 0.5, color: BLUE, emph: PINK, upper: true, bg: PAPER, pad: '4px 24px', shadow: `5px 3px 0 ${PINK}`, entrance: 'pop' }),
  hook: hook({ top: 0.09, align: 'left', size: 84, upper: true, bg: PAPER, pad: '8px 24px', extra: riso(BLUE, PINK, 7, 4) }),
  card: card({ bg: PAPER, border: `5px solid ${BLUE}`, shadow: `8px 6px 0 ${PINK}` }),
  title: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', ...riso(BLUE, PINK) }),
  body: text({ font: 'body', color: BLUE }),
  number: (c) => ({ fontFamily: c.fonts.display, ...riso(PINK, BLUE, 8, 5) }),
  slam: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', ...riso(PINK, BLUE, 10, 6) }),
  Marker: markerDot([PINK, BLUE], 32),
  Ring: ringCircle(PINK, 10, { under: [10, BLUE] }),
  stage: { shape: 'circle', fill: [PAPER, '#EADFCB'], ring: BLUE, ringWidth: 8 },
  transition: trBlinds({ color: PINK, n: 5 }),
  sample: { type: 'counter', text: '2 inks', subtext: 'and a lot of love' },
});
