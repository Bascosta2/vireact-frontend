import { AbsoluteFill } from 'remotion';
import { edgesFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trTear } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Urban Sketch: a sketchbook page drawn on location. The footage traced into wobbly sepia fineliner
 * lines (found from the picture's edges) on cream paper, with loose transparent watercolour washes
 * dropped over it that do not stay in the lines, the page's spiral binding, and handwritten notes.
 */

const SEPIA = '#4A3324';
const PAPER = '#F6EFDF';
const WASH = ['#7FB3D5', '#E8A87C', '#9BC48A'];

function Page({ c }: { c: Ctx }) {
  const drift = Math.sin(c.frame / 60) * 10;
  return (
    <AbsoluteFill>
      {/* Loose washes that do not follow the lines. */}
      {layer({ background: `radial-gradient(ellipse at ${30 + drift * 0.3}% 30%, ${WASH[0]}88, transparent 40%), radial-gradient(ellipse at 70% ${60 + drift * 0.2}%, ${WASH[1]}88, transparent 38%), radial-gradient(ellipse at 40% 85%, ${WASH[2]}77, transparent 35%)`, mixBlendMode: 'multiply' })}
      {grain({ color: '#7A6A50', alpha: 0.3, freq: 0.6 })}
      {/* Spiral binding down the left edge. */}
      <svg width={80} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {Array.from({ length: 24 }, (_, k) => (
          <ellipse key={k} cx={34} cy={40 + k * 80} rx={22} ry={14} fill="none" stroke="#6A6A6A" strokeWidth={6} />
        ))}
      </svg>
      <div style={{ position: 'absolute', right: 60, bottom: 230, fontFamily: c.fonts.display, fontSize: 40, color: SEPIA, transform: 'rotate(-4deg)' }}>Tues · from the café</div>
    </AbsoluteFill>
  );
}

export const urbanSketch = defineStyle({
  id: 'urban-sketch',
  accent: '#D9643A',
  colors: WASH.slice(0, 2) as [string, string],
  entrance: 'write',
  footage: 'url(#us-lines)',
  Defs: () => edgesFilter('us-lines', SEPIA, PAPER, 1.4, 0.78),
  Overlay: Page,
  caption: caption({ size: 96, glyph: 0.45, color: SEPIA, emph: '#D9643A', bg: 'rgba(246,239,223,0.9)', pad: '2px 22px', radius: 8, entrance: 'write' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'write', color: SEPIA, size: 84, rotate: -2, Decor: ({ t }) => <div style={{ height: 34, marginTop: -20, background: `${WASH[1]}99`, transform: `scaleX(${t})`, transformOrigin: 'left', borderRadius: 20, zIndex: -1, position: 'relative' }} /> }),
  card: card({ bg: 'rgba(246,239,223,0.95)', border: `3px solid ${SEPIA}`, radius: 6, shadow: '6px 8px 0 rgba(74,51,36,0.15)' }),
  title: text({ color: SEPIA }),
  body: text({ font: 'body', color: '#6A5240' }),
  number: text({ color: '#D9643A', stroke: [6, PAPER] }),
  slam: text({ color: SEPIA, stroke: [8, PAPER] }),
  Marker: markerScribble(SEPIA),
  Ring: ringScribble('#D9643A', 6, 17),
  stage: { shape: 'square', fill: [PAPER, '#ECE2CC'], ring: SEPIA, ringWidth: 4 },
  transition: trTear({ paper: PAPER }),
  sample: { type: 'pill', text: 'Sketched on the spot' },
});
