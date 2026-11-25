import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringReticle, text } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Microscope: the footage seen down a microscope. A round eyepiece in a black field with a soft edge
 * and a faint colour fringe, a scale bar, crosshair ticks, a specimen label and stage readouts; each
 * jump is a focus pull.
 */

const MINT = '#7FE3C8';
const R = 470;
const CX = 540;
const CY = 820;

function Field({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill style={{ background: '#030405' }}>
      <div style={{ position: 'absolute', left: 60, top: 150, fontFamily: c.fonts.body, fontSize: 26, color: MINT, letterSpacing: 2, lineHeight: 1.5 }}>
        <div>OBJ 40x · NA 0.65</div>
        <div style={{ opacity: 0.7 }}>STAGE X {(12.4 + Math.sin(c.frame / 60)).toFixed(2)} Y {(8.1 + Math.cos(c.frame / 70)).toFixed(2)}</div>
      </div>
    </AbsoluteFill>
  );
}

const ring = (c: Ctx) =>
  svgFrame(
    <g>
      {/* A faint chromatic fringe and the soft edge of the eyepiece. */}
      <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="rgba(255,60,120,0.35)" strokeWidth={6} />
      <circle cx={CX} cy={CY} r={R + 9} fill="none" stroke="rgba(60,200,255,0.3)" strokeWidth={6} />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#000" strokeWidth={40} style={{ filter: 'blur(14px)' }} />
      {/* Crosshair ticks. */}
      <g stroke={MINT} strokeWidth={2} opacity={0.75}>
        {Array.from({ length: 21 }, (_, k) => (
          <line key={k} x1={CX - 200 + k * 20} y1={CY - (k % 5 ? 8 : 16)} x2={CX - 200 + k * 20} y2={CY + (k % 5 ? 8 : 16)} />
        ))}
        <line x1={CX - 200} y1={CY} x2={CX + 200} y2={CY} />
      </g>
      {/* Scale bar. */}
      <g transform={`translate(${CX + 120} ${CY + R - 90})`}>
        <rect width={160} height={8} fill="#fff" />
        <text x={80} y={-12} textAnchor="middle" fill="#fff" fontSize={26} fontFamily={c.fonts.body}>
          50 µm
        </text>
      </g>
    </g>,
  );

export const microscope = defineStyle({
  id: 'microscope',
  accent: MINT,
  colors: ['#FFFFFF', '#3FA7D6'],
  entrance: 'fade',
  footage: 'saturate(1.15) contrast(1.08) brightness(1.05)',
  screen: { x: CX - R, y: CY - R, w: 2 * R, h: 2 * R, shape: 'circle' },
  Backdrop: Field,
  Overlay: ({ c }) => (
    <AbsoluteFill>
      {ring(c)}
      <div style={{ position: 'absolute', left: 60, bottom: 230, padding: '10px 18px', background: '#F4F1E8', color: '#222', fontFamily: c.fonts.body, fontSize: 26, transform: 'rotate(-2deg)', boxShadow: '0 6px 14px rgba(0,0,0,0.5)' }}>SAMPLE 04 · 40x</div>
      {grain({ color: '#ffffff', alpha: 0.08, blend: 'screen', frame: c.frame })}
    </AbsoluteFill>
  ),
  caption: caption({ size: 80, glyph: 0.62, color: '#FFFFFF', emph: MINT, weight: 600, bg: 'rgba(3,4,5,0.75)', pad: '6px 22px', radius: 8, entrance: 'fade' }),
  hook: hook({ top: 0.055, align: 'left', entrance: 'fade', color: '#111', size: 50, weight: 600, bg: '#F4F1E8', pad: '12px 22px', rotate: -1.5, boxShadow: '0 8px 18px rgba(0,0,0,0.5)', boxExtra: { borderLeft: `14px solid ${MINT}` } }),
  card: card({ bg: 'rgba(3,6,8,0.86)', border: `2px solid ${MINT}`, radius: 8 }),
  title: text({ color: '#FFFFFF', weight: 600 }),
  body: text({ font: 'body', color: '#BDEFE2' }),
  number: text({ color: MINT, weight: 600 }),
  slam: text({ color: '#fff', weight: 600, upper: true, glow: MINT }),
  Marker: markerDash(MINT, 36, 6),
  Ring: ringReticle(MINT, 3),
  stage: { shape: 'circle', fill: ['#0C1A18', '#030405'], ring: MINT, ringWidth: 3 },
  // A focus pull: the picture blurs out and back.
  transition: {
    before: 6,
    after: 10,
    Draw: () => null,
    camera: (d) => ({ blur: d < 0 ? interpolate(d, [-6, 0], [0, 16]) : interpolate(d, [0, 10], [16, 0], { extrapolateRight: 'clamp' }), scale: d < 0 ? 1 : interpolate(d, [0, 10], [1.06, 1], { extrapolateRight: 'clamp' }) }),
  },
  sample: { type: 'callout', text: 'Crema' },
});
