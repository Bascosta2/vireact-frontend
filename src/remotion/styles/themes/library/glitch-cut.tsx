import { AbsoluteFill, interpolate } from 'remotion';
import { rgbSplitFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringBrackets, text } from '../../kit/presets';
import { scanlines } from '../../kit/textures';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Glitch Cut: a hard digital-glitch edit. The footage carries a constant red-cyan split, a burst of
 * datamosh slices hits every couple of seconds, and every cut is a smash: RGB split, smear and blocky
 * displacement for a few frames, never a fade.
 */

const MAGENTA = '#FF0F7B';
const CYAN = '#00F0FF';

function Bursts({ c }: { c: Ctx }) {
  const burst = c.frame % 64 < 3;
  return (
    <AbsoluteFill>
      {scanlines({ gap: 3, alpha: 0.18 })}
      {burst &&
        Array.from({ length: 10 }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: `${(noise(c.frame, k) - 0.5) * 20}%`, width: '100%', top: `${noise(c.frame, k + 20) * 96}%`, height: `${1 + noise(c.frame, k + 40) * 5}%`, background: k % 2 ? MAGENTA : CYAN, opacity: 0.5, mixBlendMode: 'screen' }} />
        ))}
    </AbsoluteFill>
  );
}

/** The smash: blocks of displaced colour and a hard shake for 6 frames. */
const smash: StyleTheme['transition'] = {
  before: 2,
  after: 6,
  Draw: ({ c, d }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {Array.from({ length: 14 }, (_, k) => (
        <div key={k} style={{ position: 'absolute', left: `${noise(c.frame, k) * 80}%`, top: `${noise(c.frame, k + 30) * 92}%`, width: `${10 + noise(c.frame, k + 60) * 40}%`, height: `${3 + noise(c.frame, k + 90) * 10}%`, background: [MAGENTA, CYAN, '#fff', '#000'][k % 4], opacity: interpolate(d, [-2, 0, 6], [0.5, 0.9, 0], { extrapolateRight: 'clamp' }), mixBlendMode: k % 4 === 3 ? 'normal' : 'difference' }} />
      ))}
    </AbsoluteFill>
  ),
  camera: (d) => (d >= -1 && d < 6 ? { x: (noise(d, 5) - 0.5) * 8, y: (noise(d, 6) - 0.5) * 3, scale: 1.06 } : {}),
};

export const glitchCut = defineStyle({
  id: 'glitch-cut',
  accent: CYAN,
  colors: [MAGENTA, '#FFFFFF'],
  entrance: 'step',
  textScale: 0.8,
  footage: 'url(#gc-split) contrast(1.15) saturate(1.2)',
  Defs: () => rgbSplitFilter('gc-split', 5),
  Overlay: Bursts,
  caption: caption({ size: 96, glyph: 0.56, color: '#FFFFFF', emph: CYAN, upper: true, weight: 800, shadow: `4px 0 0 ${MAGENTA}, -4px 0 0 ${CYAN}`, entrance: 'step' }),
  hook: hook({ top: 0.1, entrance: 'step', color: '#000', size: 74, upper: true, weight: 800, bg: '#FFFFFF', pad: '8px 26px', boxShadow: `8px 0 0 ${MAGENTA}, -8px 0 0 ${CYAN}` }),
  card: card({ bg: 'rgba(0,0,0,0.88)', border: '3px solid #fff', shadow: `6px 0 0 ${MAGENTA}, -6px 0 0 ${CYAN}` }),
  title: text({ color: '#FFFFFF', upper: true, weight: 800, shadow: `3px 0 0 ${MAGENTA}, -3px 0 0 ${CYAN}` }),
  body: text({ font: 'body', color: '#C8C8D0' }),
  number: text({ color: '#FFFFFF', weight: 800, shadow: `8px 0 0 ${MAGENTA}, -8px 0 0 ${CYAN}` }),
  slam: text({ color: '#FFFFFF', upper: true, weight: 800, shadow: `10px 0 0 ${MAGENTA}, -10px 0 0 ${CYAN}` }),
  Marker: markerSquare([CYAN, MAGENTA], 22),
  Ring: ringBrackets(CYAN, 5),
  stage: { shape: 'square', fill: ['#14141C', '#000'], ring: '#fff', ringWidth: 4 },
  transition: smash,
  sample: { type: 'slam', text: 'SYSTEM ERROR' },
});
