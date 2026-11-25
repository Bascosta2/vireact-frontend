import { AbsoluteFill } from 'remotion';
import { posterizeFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { halftone } from '../../kit/textures';
import type { StyleTheme } from '../../theme';

/**
 * Pop Art: sixties screen-print poster language. The footage is posterized into flat colour with heavy
 * black keylines and Ben-Day dots fixed to the paper; red, yellow and blue blocks, speech-balloon
 * captions, and slams set in an explosion of dots.
 */

const RED = '#E4002B';
const YELLOW = '#FFE500';
const BLUE = '#0057B8';
const INK = '#111111';

const dotBurst: StyleTheme['SlamBack'] = ({ t }) => (
  <div style={{ position: 'absolute', left: '50%', top: '50%', width: 760, height: 560, transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * t})`, background: YELLOW, clipPath: 'polygon(50% 0, 60% 22%, 86% 6%, 78% 34%, 100% 44%, 78% 58%, 92% 88%, 62% 74%, 50% 100%, 38% 76%, 8% 92%, 22% 60%, 0 46%, 22% 34%, 12% 6%, 40% 22%)', backgroundImage: `radial-gradient(circle, ${RED} 5px, transparent 6px)`, backgroundSize: '22px 22px' }} />
);

export const popArt = defineStyle({
  id: 'pop-art',
  accent: YELLOW,
  colors: [RED, BLUE],
  entrance: 'pop',
  footage: 'url(#pa-poster) contrast(1.2)',
  Defs: () => posterizeFilter('pa-poster', 3, 1.8),
  Overlay: () => (
    <AbsoluteFill>
      {halftone({ color: RED, size: 16, dot: 3.4, opacity: 0.28, blend: 'multiply' })}
      <div style={{ position: 'absolute', inset: 0, border: `24px solid ${INK}` }} />
    </AbsoluteFill>
  ),
  caption: caption({ size: 90, glyph: 0.5, color: INK, emph: RED, upper: true, bg: '#FFFFFF', pad: '10px 30px', radius: 60, boxExtra: { border: `6px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}` }, entrance: 'pop' }),
  hook: hook({ top: 0.08, align: 'left', color: INK, size: 74, upper: true, bg: YELLOW, border: `6px solid ${INK}`, pad: '14px 28px', boxShadow: `10px 10px 0 ${BLUE}` }),
  card: card({ bg: '#FFFFFF', border: `6px solid ${INK}`, shadow: `10px 10px 0 ${RED}` }),
  title: text({ color: INK, upper: true }),
  body: text({ font: 'body', color: BLUE, weight: 700 }),
  number: text({ color: RED, stroke: [10, INK], shadow: `8px 8px 0 ${YELLOW}` }),
  slam: text({ color: '#FFFFFF', upper: true, stroke: [12, INK], shadow: `8px 8px 0 ${INK}` }),
  SlamBack: dotBurst,
  Marker: markerDot([RED, YELLOW, BLUE], 38, `5px solid ${INK}`),
  Ring: ringCircle(YELLOW, 12, { under: [22, INK] }),
  stage: { shape: 'circle', fill: [YELLOW, '#FFD000'], ring: INK, ringWidth: 8 },
  transition: trWipe({ color: BLUE, dir: 'right', angle: 12, content: () => <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${YELLOW} 8px, transparent 9px)`, backgroundSize: '30px 30px' }} /> }),
  sample: { type: 'slam', text: 'WHAAM!' },
});
