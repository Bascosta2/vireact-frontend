import { AbsoluteFill } from 'remotion';
import { thresholdFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trInk } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';

/**
 * Woodcut: a relief print that carves itself. The footage is printed in black ink on warm paper with a
 * hard edge (light exists only where the knife cut it away), carved gouge strokes run through the
 * darks, wood grain shows in the solid black, and one red block prints for emphasis.
 */

const INK = '#141210';
const PAPER = '#EFE6D2';
const RED = '#B3261E';

function Block() {
  return (
    <AbsoluteFill>
      {/* Gouge strokes and wood grain that show in the solid black areas. */}
      {layer({ backgroundImage: 'repeating-linear-gradient(-8deg, transparent 0 9px, rgba(239,230,210,0.16) 9px 11px)', mixBlendMode: 'screen' })}
      {grain({ color: '#3A2A1A', alpha: 0.45, freq: 0.45, stretch: [6, 1] })}
      <div style={{ position: 'absolute', inset: 0, border: `34px solid ${INK}`, boxShadow: `inset 0 0 0 10px ${PAPER}` }} />
      {/* The artist's seal: a red block with carved lines. */}
      <svg width={74} height={74} viewBox="0 0 74 74" style={{ position: 'absolute', right: 70, bottom: 240 }}>
        <rect width={74} height={74} fill={RED} />
        <path d="M 14 18 H 60 M 37 18 V 58 M 18 40 H 56 M 20 58 H 54" stroke={PAPER} strokeWidth={6} strokeLinecap="square" />
      </svg>
    </AbsoluteFill>
  );
}

export const woodcut = defineStyle({
  id: 'woodcut',
  accent: RED,
  colors: [INK, PAPER],
  entrance: 'pop',
  footage: 'url(#wc-print)',
  Defs: () => thresholdFilter('wc-print', INK, PAPER, 0.46, 0.03),
  Overlay: Block,
  caption: caption({ size: 98, glyph: 0.5, color: PAPER, emph: '#FF8A7A', upper: true, bg: INK, pad: '4px 24px', entrance: 'pop' }),
  hook: hook({ top: 0.08, color: INK, size: 84, upper: true, bg: PAPER, pad: '10px 30px', boxExtra: { border: `8px solid ${INK}` } }),
  card: card({ bg: PAPER, border: `8px solid ${INK}` }),
  title: text({ color: INK, upper: true }),
  body: text({ font: 'body', color: '#3A2E24' }),
  number: text({ color: RED, stroke: [6, INK] }),
  slam: text({ color: PAPER, upper: true, extra: { background: RED, padding: '0 28px' } }),
  Marker: markerSquare([RED, INK], 28),
  Ring: ringCircle(RED, 12),
  stage: { shape: 'square', fill: [PAPER, '#E2D6BC'], ring: INK, ringWidth: 10 },
  transition: trInk({ color: INK }),
  sample: { type: 'headline', text: 'Carved by hand', subtext: 'One block, one ink' },
});
