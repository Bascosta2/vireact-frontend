import { AbsoluteFill } from 'remotion';
import { thermalFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringBrackets, text, trFlash } from '../../kit/presets';
import { vignette } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Thermal: the footage seen through a radiometric thermal camera. An iron palette where brightness is
 * heat, slight sensor softness, a crosshair with a spot temperature that drifts, corner brackets, a
 * colour scale bar and the camera's readouts.
 */

const HOT = '#FFB21F';
const SCALE = 'linear-gradient(0deg, #05001A, #2A0A6B, #7A0F8C, #C8243C, #F0631A, #FFB21F, #FFF4B8)';

function Camera({ c }: { c: Ctx }) {
  const t = 36.4 + (noise(Math.floor(c.frame / 10), 2) - 0.5) * 0.6;
  return (
    <AbsoluteFill>
      {vignette(0.45, '#05001A')}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <g stroke="#fff" strokeWidth={4} fill="none">
          <line x1={540} y1={880} x2={540} y2={930} />
          <line x1={540} y1={990} x2={540} y2={1040} />
          <line x1={460} y1={960} x2={510} y2={960} />
          <line x1={570} y1={960} x2={620} y2={960} />
          {[[60, 160, 1, 1], [1020, 160, -1, 1], [60, 1760, 1, -1], [1020, 1760, -1, -1]].map(([x, y, dx, dy], k) => (
            <path key={k} d={`M ${x} ${y + dy * 70} V ${y} H ${x + dx * 70}`} />
          ))}
        </g>
        <text x={640} y={950} fill="#fff" fontSize={40} fontFamily={c.fonts.display}>
          {t.toFixed(1)}°C
        </text>
      </svg>
      <div style={{ position: 'absolute', right: 70, top: 600, width: 34, height: 700, background: SCALE, border: '2px solid #fff' }} />
      <div style={{ position: 'absolute', right: 116, top: 588, fontFamily: c.fonts.display, fontSize: 28, color: '#fff' }}>42°</div>
      <div style={{ position: 'absolute', right: 116, top: 1280, fontFamily: c.fonts.display, fontSize: 28, color: '#fff' }}>12°</div>
      <div style={{ position: 'absolute', left: 80, top: 200, fontFamily: c.fonts.display, fontSize: 30, color: '#fff', lineHeight: 1.5 }}>
        <div>IRON · ε 0.95</div>
        <div style={{ opacity: 0.7 }}>MAX 41.8° · MIN 14.2°</div>
      </div>
    </AbsoluteFill>
  );
}

export const thermal = defineStyle({
  id: 'thermal',
  accent: HOT,
  colors: ['#C8243C', '#7A0F8C'],
  entrance: 'fade',
  footage: 'url(#th-iron) blur(1.2px)',
  Defs: () => thermalFilter('th-iron'),
  Overlay: Camera,
  caption: caption({ size: 82, glyph: 0.6, color: '#FFFFFF', emph: HOT, upper: true, shadow: '0 0 6px #000, 0 4px 14px rgba(0,0,0,0.9)', entrance: 'fade' }),
  hook: hook({ top: 0.14, align: 'left', entrance: 'fade', color: '#FFFFFF', size: 58, upper: true, bg: 'rgba(5,0,26,0.8)', border: '2px solid #fff', pad: '12px 22px' }),
  card: card({ bg: 'rgba(5,0,26,0.82)', border: '2px solid #fff' }),
  title: text({ color: '#FFFFFF', upper: true }),
  body: text({ font: 'body', color: '#FFD9A0' }),
  number: text({ color: HOT, glow: '#F0631A' }),
  slam: text({ color: '#FFF4B8', upper: true, glow: '#F0631A' }),
  Marker: markerSquare([HOT, '#C8243C', '#7A0F8C'], 24),
  Ring: ringBrackets('#FFFFFF', 4),
  stage: { shape: 'square', fill: ['#2A0A6B', '#05001A'], ring: HOT, ringWidth: 4, glow: '#F0631A' },
  transition: trFlash({ color: '#FFF4B8', peak: 0.7 }),
  sample: { type: 'counter', text: '41.8°', subtext: 'the hottest spot' },
});
