import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trZoom } from '../../kit/presets';
import { perspectiveGrid, stars, sun, svgFrame } from '../../kit/scenery';
import { layer, scanlines } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Synthwave: an endless neon flight. A sliced retro sun sinks behind magenta mountains, a glowing
 * perspective grid races toward the camera along the bottom, stars above; the footage gets a purple and
 * pink grade, and type is chrome with a hot pink glow.
 */

const PINK = '#FF3CAC';
const CYAN = '#2BD2FF';
const PURPLE = '#2B0A4A';

function Horizon({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {layer({ background: `linear-gradient(180deg, rgba(43,10,74,0.55), transparent 30%, transparent 62%, rgba(43,10,74,0.9) 72%)` })}
      {svgFrame(
        <g>
          {stars(c.frame, { n: 50, seed: 8, bottom: 520, size: 2.6 })}
          {sun(860, 1330, 150, { colors: ['#FFE56B', PINK], slices: 7, glow: PINK, id: 'sw-sun' })}
          <polygon points="0,1390 160,1300 300,1360 440,1270 600,1390" fill={PURPLE} stroke={PINK} strokeWidth={4} />
          <polygon points="560,1390 720,1320 860,1360 1000,1290 1080,1330 1080,1390" fill={PURPLE} stroke={CYAN} strokeWidth={4} />
          <rect x={0} y={1390} width={1080} height={530} fill="#14032A" />
          {perspectiveGrid(c.frame, { horizon: 1390, color: PINK, speed: 1.4, lines: 20, width: 3 })}
        </g>,
      )}
      {scanlines({ gap: 4, alpha: 0.12 })}
    </AbsoluteFill>
  );
}

const chrome = 'linear-gradient(180deg, #FFFFFF 0%, #BFE9FF 42%, #4A2A7A 50%, #FF9AE0 62%, #FFFFFF 100%)';

export const synthwave = defineStyle({
  id: 'synthwave',
  accent: PINK,
  colors: [CYAN, '#FFE56B'],
  entrance: 'glide',
  footage: 'saturate(1.3) contrast(1.12) hue-rotate(-14deg) brightness(0.95)',
  Overlay: Horizon,
  caption: caption({ size: 92, glyph: 0.6, color: '#FFFFFF', emph: CYAN, upper: true, italic: true, glow: PINK, shadow: `0 0 10px ${PINK}, 0 0 26px ${PINK}`, entrance: 'glide' }),
  hook: hook({ top: 0.09, entrance: 'glide', size: 82, upper: true, italic: true, color: '#FFFFFF', extra: { backgroundImage: chrome, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 14px ${PINK})` } }),
  card: card({ bg: 'rgba(20,3,42,0.86)', border: `3px solid ${PINK}`, radius: 6, shadow: `0 0 30px ${PINK}88, inset 0 0 20px ${CYAN}33` }),
  title: text({ color: '#FFFFFF', upper: true, italic: true, glow: PINK }),
  body: text({ font: 'body', color: CYAN }),
  number: text({ italic: true, extra: { backgroundImage: chrome, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 16px ${PINK})` } }),
  slam: text({ upper: true, italic: true, extra: { backgroundImage: chrome, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 20px ${PINK})` } }),
  Marker: markerDot([PINK, CYAN], 26),
  Ring: ringCircle(CYAN, 6, { glow: true }),
  stage: { shape: 'circle', fill: ['#4A1A7A', PURPLE], ring: PINK, ringWidth: 6, glow: PINK },
  transition: trZoom({ from: 1.4, blur: 18 }),
  sample: { type: 'counter', text: '1986', subtext: 'the year it began' },
});
