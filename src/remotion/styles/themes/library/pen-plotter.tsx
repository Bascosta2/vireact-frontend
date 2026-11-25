import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, ringCircle, text, trWipe } from '../../kit/presets';
import { drawCycle, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { ChartBar, Ctx, StyleTheme } from '../../theme';

/**
 * Pen Plotter: a plotter on a desk draws the idea one stroke at a time. A gantry and pen carriage move,
 * the pen drops and lifts, and fine black and blue ink lines appear exactly at its tip.
 */

const PAPER = '#FFFFFF';
const INK = '#151515';
const BLUE = '#2B59C3';
const DESK = '#C8B8A0';

/** The plot: a spiral (black) then a little chart (blue), as one list of points. */
const SPIRAL = Array.from({ length: 260 }, (_, k) => {
  const a = k * 0.16;
  const r = 12 + k * 1.3;
  return [540 + Math.cos(a) * r, 620 + Math.sin(a) * r] as [number, number];
});
const CHART: [number, number][] = [[200, 1200], [200, 960], [200, 1200], [880, 1200], [260, 1150], [380, 1100], [500, 1120], [620, 1030], [740, 1000], [860, 940]];

function Plotter({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 150, 420);
  const nS = Math.floor(Math.min(1, u / 0.7) * SPIRAL.length);
  const nC = Math.floor(Math.max(0, Math.min(1, (u - 0.7) / 0.3)) * CHART.length);
  const tip = nC > 0 ? CHART[Math.min(nC, CHART.length) - 1] : SPIRAL[Math.max(0, nS - 1)];
  return (
    <AbsoluteFill style={{ background: DESK }}>
      <div style={{ position: 'absolute', left: 80, right: 80, top: 200, bottom: 340, background: PAPER, boxShadow: '0 16px 30px rgba(0,0,0,0.25)' }}>{grain({ color: '#8A8070', alpha: 0.12, freq: 0.95 })}</div>
      {svgFrame(
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points={SPIRAL.slice(0, nS).map((p) => p.join(',')).join(' ')} stroke={INK} strokeWidth={2.5} />
          <polyline points={CHART.slice(0, nC).map((p) => p.join(',')).join(' ')} stroke={BLUE} strokeWidth={4} />
          {/* The gantry: a rail across at the tip's height, a carriage and the pen. */}
          <rect x={40} y={tip[1] - 22} width={1000} height={20} rx={6} fill="#3C3C40" />
          <rect x={20} y={tip[1] - 40} width={40} height={60} rx={6} fill="#26262A" />
          <rect x={1020} y={tip[1] - 40} width={40} height={60} rx={6} fill="#26262A" />
          <g transform={`translate(${tip[0]} ${tip[1]})`}>
            <rect x={-40} y={-70} width={80} height={60} rx={8} fill="#E4E4E8" stroke="#26262A" strokeWidth={3} />
            <rect x={-8} y={-30} width={16} height={34} fill={nC > 0 ? BLUE : INK} />
            <circle r={4} fill={nC > 0 ? BLUE : INK} />
          </g>
        </g>,
      )}
      <div style={{ position: 'absolute', left: 90, bottom: 260, fontFamily: c.fonts.body, fontSize: 24, color: '#3C3C40' }}>plot_01.svg · {Math.round(u * 100)}%</div>
    </AbsoluteFill>
  );
}

/** Bars plotted as hatched outlines. */
function PlotChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <svg width="100%" height={450} viewBox="0 0 800 450" style={{ overflow: 'visible' }}>
      <path d="M 0 400 H 800 M 0 400 V 20" stroke={INK} strokeWidth={2.5} fill="none" />
      {bars.map((b, k) => {
        const w = 800 / bars.length;
        const h = (b.value / max) * 340 * b.grow;
        const x = k * w + w * 0.2;
        return (
          <g key={k}>
            <rect x={x} y={400 - h} width={w * 0.6} height={h} fill="none" stroke={k === bars.length - 1 ? BLUE : INK} strokeWidth={3} />
            {Array.from({ length: Math.floor(h / 16) }, (_, j) => (
              <line key={j} x1={x} y1={400 - j * 16} x2={x + w * 0.6} y2={400 - j * 16 - 12} stroke={k === bars.length - 1 ? BLUE : INK} strokeWidth={1.4} />
            ))}
            <text x={x + w * 0.3} y={388 - h} textAnchor="middle" fontSize={28} fontFamily={c.fonts.display} fill={BLUE} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={x + w * 0.3} y={436} textAnchor="middle" fontSize={22} fontFamily={c.fonts.body} fill={INK}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const plus: StyleTheme['Marker'] = ({ t }) => (
  <svg width={40} height={40} viewBox="0 0 40 40" style={{ flex: 'none', opacity: t }}>
    <path d="M 20 4 V 36 M 4 20 H 36" stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
  </svg>
);

export const penPlotter = defineStyle({
  id: 'pen-plotter',
  accent: BLUE,
  colors: [INK, '#8C8C93'],
  entrance: 'write',
  footage: 'grayscale(0.4) contrast(1.05)',
  Scene: Plotter,
  pip: pipAt({ border: `3px solid ${INK}`, boxShadow: `8px 8px 0 ${BLUE}` }, 'rect', { radius: 0, y: 1300 }),
  caption: caption({ size: 80, glyph: 0.62, color: INK, emph: BLUE, weight: 500, bg: PAPER, pad: '6px 22px', boxExtra: { border: `2px solid ${INK}` }, entrance: 'write' }),
  hook: hook({ top: 0.065, align: 'left', entrance: 'write', typewriter: true, color: INK, size: 56, weight: 500, bg: PAPER, border: `2px solid ${INK}`, pad: '14px 24px' }),
  card: card({ bg: PAPER, border: `2px solid ${INK}`, shadow: `8px 8px 0 ${BLUE}` }),
  title: text({ color: INK, weight: 500 }),
  body: text({ font: 'body', color: '#33333A' }),
  number: text({ color: BLUE, weight: 500 }),
  slam: text({ color: INK, weight: 500, extra: { background: PAPER, border: `3px solid ${INK}`, padding: '0 24px' } }),
  Marker: plus,
  Ring: ringCircle(BLUE, 3, { dash: '2 8' }),
  stage: { shape: 'square', fill: [PAPER, '#F2F2F2'], ring: INK, ringWidth: 3 },
  transition: trWipe({ color: PAPER, dir: 'right', edge: `14px solid #3C3C40` }),
  Chart: PlotChart,
  sample: { type: 'chart', text: 'Users per month', items: ['Jan: 1K', 'Feb: 2K', 'Mar: 4K', 'Apr: 7K'] },
});
