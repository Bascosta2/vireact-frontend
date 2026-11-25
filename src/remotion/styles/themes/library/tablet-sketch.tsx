import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { drawCycle, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Tablet Sketch: a cream drawing canvas inside a tablet, seen while someone draws and explains. Grainy
 * pencil lines go down first, flat colour fills in after, a stylus cursor moves with the stroke.
 */

const CANVAS = '#FBF6EC';
const PENCIL = '#3B3A40';
const CORAL = '#FF6B6B';
const TEAL = '#2EC4B6';
const SUN = '#FFC145';
const BEZEL = '#1E1F24';

function Canvas({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 130);
  const s = (a: number, b: number) => smooth(u, a, b);
  // Where the stylus is: it follows the stroke being drawn.
  const tip = u < 0.4 ? { x: 300 + 400 * (u / 0.4), y: 700 - 180 * Math.sin((u / 0.4) * Math.PI) } : { x: 560 + 140 * Math.cos(u * 12), y: 900 + 80 * Math.sin(u * 9) };
  return (
    <AbsoluteFill style={{ background: BEZEL }}>
      <div style={{ position: 'absolute', left: 54, right: 54, top: 120, bottom: 150, background: CANVAS, borderRadius: 26, overflow: 'hidden' }}>
        {grain({ color: '#8C7B5E', alpha: 0.22, freq: 0.95 })}
      </div>
      {svgFrame(
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* Flat colour fills arrive after the pencil. */}
          <circle cx={790} cy={420} r={110} fill={SUN} opacity={s(0.55, 0.7)} />
          <path d="M 110 1120 Q 400 900 700 1050 T 980 1000 V 1320 H 110 Z" fill={TEAL} opacity={s(0.6, 0.75)} />
          <path d="M 300 1000 V 760 L 450 640 L 600 760 V 1000 Z" fill={CORAL} opacity={s(0.65, 0.8)} />
          <rect x={410} y={860} width={80} height={140} fill={CANVAS} opacity={s(0.7, 0.82)} />
          {/* Pencil lines first. */}
          <g fill="none" stroke={PENCIL} strokeWidth={5} opacity={0.85}>
            <circle cx={790} cy={420} r={110} style={drawStroke(s(0, 0.18), 700)} />
            <path d="M 300 1000 V 760 L 450 640 L 600 760 V 1000 Z" style={drawStroke(s(0.12, 0.38), 1100)} />
            <rect x={410} y={860} width={80} height={140} style={drawStroke(s(0.3, 0.45), 440)} />
            <path d="M 110 1120 Q 400 900 700 1050 T 980 1000" style={drawStroke(s(0.38, 0.55), 1000)} />
          </g>
        </g>,
      )}
      {/* The tool bar and the stylus. */}
      <div style={{ position: 'absolute', left: 70, top: 260, width: 70, padding: '16px 0', background: 'rgba(30,31,36,0.85)', borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        {[PENCIL, CORAL, TEAL, SUN].map((col) => (
          <div key={col} style={{ width: 34, height: 34, borderRadius: 17, background: col, border: '3px solid #fff' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: tip.x, top: tip.y, width: 22, height: 220, background: 'linear-gradient(#E9E9EC, #B9BBC2)', borderRadius: 11, transform: 'rotate(28deg)', transformOrigin: '50% 0%', boxShadow: '6px 10px 18px rgba(0,0,0,0.25)' }} />
    </AbsoluteFill>
  );
}

export const tabletSketch = defineStyle({
  id: 'tablet-sketch',
  accent: CORAL,
  colors: [TEAL, SUN],
  entrance: 'bounce',
  Scene: Canvas,
  pip: pipAt({ border: '8px solid #fff', boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }, 'circle'),
  Overlay: ({ scene }) => (scene ? null : <AbsoluteFill style={{ border: `30px solid ${BEZEL}`, borderRadius: 60 }} />),
  caption: caption({ size: 94, glyph: 0.52, color: '#2A2930', emph: CORAL, weight: 700, bg: '#FFFFFF', pad: '8px 28px', radius: 40, boxExtra: { boxShadow: '0 10px 26px rgba(0,0,0,0.18)' }, entrance: 'bounce' }),
  hook: hook({ top: 0.09, entrance: 'bounce', color: '#2A2930', size: 70, weight: 700, bg: '#FFFFFF', radius: 30, boxShadow: '0 14px 34px rgba(0,0,0,0.22)', boxExtra: { borderLeft: `14px solid ${CORAL}` } }),
  card: card({ bg: '#FFFFFF', radius: 30, shadow: '0 16px 36px rgba(0,0,0,0.22)' }),
  title: text({ color: '#2A2930', weight: 700 }),
  body: text({ font: 'body', color: '#4A4952', weight: 500 }),
  number: text({ color: CORAL, weight: 700, shadow: '0 8px 24px rgba(0,0,0,0.2)' }),
  slam: text({ color: '#fff', weight: 700, stroke: [10, CORAL] }),
  Marker: markerDot([CORAL, TEAL, SUN], 38, '4px solid #fff'),
  Ring: ringCircle(CORAL, 9, { under: [16, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', CANVAS], ring: CORAL, ringWidth: 8 },
  transition: trWipe({ color: CORAL, dir: 'right', angle: -12, before: 4, after: 9 }),
  sample: { type: 'pill', text: 'Layer 2: colour' },
});
