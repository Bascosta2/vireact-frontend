import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trTear } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain, gridPaper } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import { noise, type ChartBar, type Ctx } from '../../theme';

/**
 * Pencil Dataviz: a chart that tells a story, drawn mark by mark on cream paper with a red-blue
 * editing pencil: hatched bars, a trend line, and handwritten notes pinned to the numbers that matter.
 */

const CREAM = '#F8F1E1';
const GRAPHITE = '#3A3A40';
const RED = '#D7263D';
const BLUE = '#1B4F9C';

/** Pencil hatching inside a bar. */
const hatch = (x: number, y: number, w: number, h: number, color: string, key: string | number) => (
  <g key={key} stroke={color} strokeWidth={3} opacity={0.85}>
    <rect x={x} y={y} width={w} height={h} fill="none" strokeWidth={4} />
    {Array.from({ length: Math.max(0, Math.floor(h / 14)) }, (_, j) => (
      <line key={j} x1={x + 3} y1={y + h - j * 14 - 2} x2={x + w - 3} y2={y + h - j * 14 - 12 + (noise(j, 3) - 0.5) * 4} />
    ))}
  </g>
);

function Sheet({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 130);
  const s = (a: number, b: number) => smooth(u, a, b);
  const vals = [0.3, 0.42, 0.38, 0.6, 0.86];
  const f = c.fonts.display;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {gridPaper({ color: '#9DB6D9', size: 36, major: 5, alpha: 0.18, majorAlpha: 0.3 })}
      {svgFrame(
        <g fill="none" strokeLinecap="round">
          {label(140, 330, 'Weekly sign-ups', { size: 62, fill: GRAPHITE, font: f, anchor: 'start', opacity: s(0, 0.1) })}
          <path d="M 140 1150 V 420 M 140 1150 H 960" stroke={GRAPHITE} strokeWidth={5} style={drawStroke(s(0.05, 0.2), 1600)} />
          {vals.map((v, k) => {
            const h = v * 640 * s(0.15 + k * 0.08, 0.3 + k * 0.08);
            return hatch(190 + k * 150, 1150 - h, 100, h, k === 4 ? RED : BLUE, k);
          })}
          <path d="M 240 940 L 390 860 L 540 900 L 690 750 L 840 560" stroke={RED} strokeWidth={6} strokeDasharray="2 14" style={drawStroke(s(0.6, 0.78), 900)} />
          {/* A note pinned to the last bar. */}
          <g opacity={s(0.78, 0.9)}>
            <path d="M 860 520 C 900 450 860 400 800 400" stroke={RED} strokeWidth={4} />
            <path d="M 815 390 l -18 10 l 18 10" stroke={RED} strokeWidth={4} />
            {label(560, 395, 'launch week!', { size: 52, fill: RED, font: f, anchor: 'start' })}
          </g>
          {['W1', 'W2', 'W3', 'W4', 'W5'].map((w, k) => label(240 + k * 150, 1200, w, { size: 36, fill: GRAPHITE, font: f, key: w, opacity: s(0.2, 0.3) }))}
        </g>,
      )}
      {grain({ color: '#6E6450', alpha: 0.22, freq: 0.95 })}
    </AbsoluteFill>
  );
}

function PencilChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  const w = 800 / bars.length;
  return (
    <svg width="100%" height={460} viewBox="0 0 800 460" style={{ overflow: 'visible' }}>
      <path d="M 0 400 H 800" stroke={GRAPHITE} strokeWidth={4} />
      {bars.map((b, k) => {
        const h = (b.value / max) * 330 * b.grow;
        return (
          <g key={k}>
            {hatch(k * w + w * 0.18, 400 - h, w * 0.64, h, k === bars.length - 1 ? RED : BLUE, k)}
            <text x={k * w + w / 2} y={388 - h} textAnchor="middle" fontSize={34} fill={k === bars.length - 1 ? RED : BLUE} fontFamily={c.fonts.display} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={k * w + w / 2} y={444} textAnchor="middle" fontSize={28} fill={GRAPHITE} fontFamily={c.fonts.display}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const pencilDataviz = defineStyle({
  id: 'pencil-dataviz',
  accent: RED,
  colors: [BLUE, GRAPHITE],
  entrance: 'write',
  Scene: Sheet,
  pip: pipAt({ border: '10px solid #fff', boxShadow: '0 10px 20px rgba(0,0,0,0.25)' }, 'rect', { rotate: 3, radius: 2 }),
  caption: caption({ size: 98, glyph: 0.44, color: GRAPHITE, emph: RED, bg: 'rgba(248,241,225,0.95)', pad: '4px 22px', radius: 6, boxExtra: { borderBottom: `5px solid ${BLUE}` }, entrance: 'write' }),
  hook: hook({ top: 0.075, align: 'left', entrance: 'write', color: GRAPHITE, size: 76, bg: CREAM, pad: '10px 26px', boxShadow: '0 8px 18px rgba(0,0,0,0.18)', Decor: ({ t }) => <div style={{ height: 6, marginTop: 4, background: RED, transform: `scaleX(${t})`, transformOrigin: 'left', borderRadius: 3 }} /> }),
  card: card({ bg: CREAM, border: `3px solid ${GRAPHITE}`, radius: 6, shadow: '0 10px 22px rgba(0,0,0,0.18)' }),
  title: text({ color: GRAPHITE }),
  body: text({ font: 'body', color: '#4A4A52' }),
  number: text({ color: RED, stroke: [6, CREAM] }),
  slam: text({ color: RED, stroke: [8, CREAM] }),
  Marker: markerScribble(BLUE),
  Ring: ringScribble(RED, 6, 4),
  stage: { shape: 'square', fill: [CREAM, '#EDE3CC'], ring: GRAPHITE, ringWidth: 4 },
  transition: trTear({ paper: CREAM }),
  Chart: PencilChart,
  sample: { type: 'chart', text: 'Sign-ups', items: ['W1: 120', 'W2: 160', 'W3: 150', 'W4: 290'] },
});
