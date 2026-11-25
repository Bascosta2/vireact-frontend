import { AbsoluteFill } from 'remotion';
import { thresholdFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { halftone } from '../../kit/textures';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Manga Panels: a black-and-white manga page that moves. The footage is inked in black and white with
 * screentone dots, framed as a panel with a heavy border and gutter; speed lines burst behind slams,
 * one spot colour (red) for emphasis, and cuts are a new panel sliding in at an angle.
 */

const RED = '#E0262E';

function Page({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {halftone({ color: '#000', size: 8, dot: 1.4, opacity: 0.22, angle: 45 })}
      <div style={{ position: 'absolute', inset: 0, border: '30px solid #FFFFFF' }} />
      <div style={{ position: 'absolute', inset: 30, border: '10px solid #000' }} />
      <div style={{ position: 'absolute', right: 70, bottom: 260, fontFamily: c.fonts.display, fontSize: 30, color: '#000', background: '#fff', padding: '2px 10px', border: '3px solid #000' }}>P. {1 + Math.floor(c.frame / 150)}</div>
    </AbsoluteFill>
  );
}

const speedLines: StyleTheme['SlamBack'] = ({ t }) => (
  <svg viewBox="-500 -400 1000 800" style={{ position: 'absolute', left: '50%', top: '50%', width: '170%', height: '300%', transform: `translate(-50%, -50%) scale(${0.5 + 0.5 * t})`, overflow: 'visible' }}>
    <ellipse rx={420} ry={300} fill="#fff" />
    {Array.from({ length: 70 }, (_, k) => {
      const a = (k / 70) * Math.PI * 2;
      const r0 = 200 + noise(k, 3) * 60;
      return <polygon key={k} points={`${Math.cos(a) * r0},${Math.sin(a) * r0} ${Math.cos(a - 0.02) * 520},${Math.sin(a - 0.02) * 400} ${Math.cos(a + 0.02) * 520},${Math.sin(a + 0.02) * 400}`} fill="#000" />;
    })}
  </svg>
);

const panelSlide: StyleTheme['transition'] = {
  before: 4,
  after: 8,
  Draw: ({ d }) => {
    const p = d < 0 ? 0 : 1 - Math.min(1, d / 8);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#fff', clipPath: `polygon(0 0, ${100 * p + 20}% 0, ${100 * p}% 100%, 0 100%)`, opacity: d < 0 ? 0 : 1 }} />
        <div style={{ position: 'absolute', inset: 0, background: '#000', clipPath: `polygon(${100 * p + 20}% 0, ${100 * p + 22}% 0, ${100 * p + 2}% 100%, ${100 * p}% 100%)`, opacity: d < 0 ? 0 : 1 }} />
      </AbsoluteFill>
    );
  },
  camera: (d) => (d >= 0 && d < 8 ? { scale: 1.08 - d * 0.01 } : {}),
};

export const mangaPanels = defineStyle({
  id: 'manga-panels',
  accent: RED,
  colors: ['#000000', '#FFFFFF'],
  entrance: 'pop',
  footage: 'url(#mg-ink) contrast(1.1)',
  Defs: () => thresholdFilter('mg-ink', '#0A0A0A', '#FAFAFA', 0.38, 0.08),
  Overlay: Page,
  caption: caption({ size: 82, glyph: 0.5, color: '#000', emph: RED, bg: '#FFFFFF', pad: '10px 26px', radius: 60, boxExtra: { border: '5px solid #000' }, entrance: 'pop' }),
  hook: hook({ top: 0.07, align: 'left', color: '#000', size: 62, bg: '#FFFFFF', border: '5px solid #000', pad: '14px 26px' }),
  card: card({ bg: '#FFFFFF', border: '6px solid #000' }),
  title: text({ color: '#000' }),
  body: text({ font: 'body', color: '#222' }),
  number: text({ color: '#000', stroke: [10, '#fff'] }),
  slam: text({ color: '#000', stroke: [12, '#fff'], extra: { fontStyle: 'italic' } }),
  SlamBack: speedLines,
  Marker: markerDot(['#000', RED], 22),
  Ring: ringCircle(RED, 8),
  stage: { shape: 'square', fill: ['#FFFFFF', '#EEEEEE'], ring: '#000', ringWidth: 8 },
  transition: panelSlide,
  sample: { type: 'slam', text: 'DOOON!' },
});
