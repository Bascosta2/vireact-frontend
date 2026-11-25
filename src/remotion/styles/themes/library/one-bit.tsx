import { AbsoluteFill } from 'remotion';
import { ditherFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text, trPixels } from '../../kit/presets';
import type { Ctx } from '../../theme';

/**
 * 1-Bit Dither: the footage shown with exactly two inks. Every grey becomes a fixed ordered-dither
 * pattern (an old handheld screen or a 1980s Mac), text is a pixel font, cards are 1-pixel-bordered
 * windows with title bars, and cuts dissolve pixel by pixel.
 */

const INK = '#1C1E26';
const PAPER = '#E6E2CF';

function Window({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 96, background: PAPER, borderBottom: `6px solid ${INK}`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 34px', fontFamily: c.fonts.display, fontSize: 30, color: INK }}>
        <span>■</span>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span style={{ marginLeft: 'auto' }}>{`${String(9 + Math.floor(c.frame / 1800)).padStart(2, '0')}:${String(Math.floor(c.frame / 30) % 60).padStart(2, '0')}`}</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, top: 96, border: `14px solid ${PAPER}`, boxShadow: `inset 0 0 0 6px ${INK}` }} />
    </AbsoluteFill>
  );
}

const win = { background: PAPER, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}` };

export const oneBit = defineStyle({
  id: 'one-bit',
  accent: INK,
  colors: [PAPER, '#7A7666'],
  entrance: 'step',
  step: 3,
  footage: 'url(#ob-dither)',
  Defs: () => ditherFilter('ob-dither', INK, PAPER, 4),
  Overlay: Window,
  caption: caption({ size: 70, glyph: 0.62, color: INK, emphBg: INK, emphColor: PAPER, bg: PAPER, pad: '8px 20px', boxExtra: { border: `6px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}` }, entrance: 'step' }),
  hook: hook({ top: 0.09, entrance: 'step', typewriter: true, color: INK, size: 52, bg: PAPER, pad: '50px 26px 16px', boxExtra: { ...win, backgroundImage: `repeating-linear-gradient(${INK} 0 3px, transparent 3px 7px)`, backgroundSize: '100% 34px', backgroundRepeat: 'no-repeat', backgroundColor: PAPER } }),
  card: card({ bg: PAPER, border: `6px solid ${INK}`, shadow: `10px 10px 0 ${INK}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: INK }),
  number: text({ color: PAPER, extra: { background: INK, padding: '0 24px' } }),
  slam: text({ color: INK, extra: { background: PAPER, padding: '0 24px', border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}` } }),
  Marker: markerSquare([INK], 22),
  Ring: ringSquare(INK, 6),
  stage: { shape: 'square', fill: [PAPER, PAPER], ring: INK, ringWidth: 6 },
  transition: trPixels({ color: INK, cell: 60 }),
  sample: { type: 'pill', text: 'Saving...' },
});
