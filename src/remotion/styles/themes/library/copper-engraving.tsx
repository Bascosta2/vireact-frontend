import { AbsoluteFill } from 'remotion';
import { rampFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Copper Engraving: an intaglio plate that engraves itself. The footage printed in warm sepia ink with
 * fine parallel hatching lines that read as engraved tone, a plate mark pressed into thick paper,
 * copperplate lettering and ornamental rules.
 */

const INK = '#2B1D14';
const PAPER = '#F2E9D6';
const COPPER = '#B5651D';

function Plate({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {/* Engraved hatching: fine lines that darken the shadows. */}
      {layer({ backgroundImage: `repeating-linear-gradient(28deg, rgba(43,29,20,0.55) 0 1.4px, transparent 1.4px 6px)`, mixBlendMode: 'multiply', opacity: 0.55 })}
      {layer({ backgroundImage: `repeating-linear-gradient(-62deg, rgba(43,29,20,0.4) 0 1.2px, transparent 1.2px 8px)`, mixBlendMode: 'multiply', opacity: 0.35 })}
      {grain({ color: '#6E5A3E', alpha: 0.25, freq: 0.9 })}
      {/* The plate mark and margin. */}
      <div style={{ position: 'absolute', inset: 0, border: `46px solid ${PAPER}` }} />
      <div style={{ position: 'absolute', inset: 46, boxShadow: 'inset 0 0 0 3px rgba(43,29,20,0.6), inset 4px 4px 6px rgba(0,0,0,0.25)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 4, textAlign: 'center', fontFamily: c.fonts.body, fontStyle: 'italic', fontSize: 26, color: INK }}>Fig. {1 + Math.floor(c.frame / 150)}. Drawn from life</div>
    </AbsoluteFill>
  );
}

export const copperEngraving = defineStyle({
  id: 'copper-engraving',
  accent: COPPER,
  colors: [INK, '#8A6A4A'],
  entrance: 'fade',
  footage: 'url(#ce-sepia) contrast(1.1)',
  Defs: () => rampFilter('ce-sepia', [INK, '#6E4B30', '#C9AE88', PAPER], { contrast: 1.3 }),
  Overlay: Plate,
  caption: caption({ size: 88, glyph: 0.5, color: INK, emph: COPPER, bg: 'rgba(242,233,214,0.94)', pad: '4px 26px', italic: true, boxExtra: { borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}` }, entrance: 'fade' }),
  hook: hook({ top: 0.09, entrance: 'fade', color: INK, size: 76, bg: PAPER, pad: '18px 36px', boxExtra: { border: `3px double ${INK}`, outline: `1px solid ${INK}`, outlineOffset: 6 } }),
  card: card({ bg: PAPER, border: `3px double ${INK}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#4A3A2A', italic: true }),
  number: text({ color: INK, shadow: `0 0 0 ${INK}` }),
  slam: text({ color: INK, extra: { background: PAPER, padding: '0 30px', border: `3px double ${INK}` } }),
  Marker: markerDot([COPPER, INK], 18),
  Ring: ringCircle(INK, 4, { dash: '1 7' }),
  stage: { shape: 'circle', fill: [PAPER, '#E0D2B4'], ring: INK, ringWidth: 4 },
  transition: trBlinds({ color: PAPER, n: 18 }),
  sample: { type: 'headline', text: 'A study of the common', subtext: 'Plate IV' },
});
