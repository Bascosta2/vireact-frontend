import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text, trBlinds } from '../../kit/presets';
import { noise, type ChartBar, type Ctx } from '../../theme';

/**
 * Spreadsheet: the whole video inside one spreadsheet window. The footage fills a merged range of
 * cells, column letters and row numbers run round it, conditional formatting paints the cells around
 * it in steps, the formula bar shows a running formula, and charts are data bars in cells.
 */

const GRID = '#D9DCE1';
const HEAD = '#F1F3F5';
const GREEN = '#1E8E3E';
const INK = '#202124';
const CELL_W = 130;
const CELL_H = 62;
const LEFT = 70;
const TOP = 250;
const COLS = 'ABCDEFGH'.split('');

/** The footage sits in B3:H17. */
const RANGE = { x: LEFT + CELL_W, y: TOP + CELL_H * 2, w: CELL_W * 6.65, h: CELL_H * 15 };

function Window({ c }: { c: Ctx }) {
  const rows = 26;
  const f = Math.floor(c.frame / 6);
  return (
    <AbsoluteFill style={{ background: '#FFFFFF' }}>
      {/* Title bar, ribbon and formula bar. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120, background: GREEN, color: '#fff', fontFamily: c.fonts.body, fontSize: 30, display: 'flex', alignItems: 'flex-end', padding: '0 30px 20px', boxSizing: 'border-box' }}>video_edit.xlsx</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, height: 70, background: '#F8F9FA', borderBottom: `2px solid ${GRID}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px', fontFamily: c.fonts.body, fontSize: 26, color: '#5F6368' }}>
        {['File', 'Home', 'Insert', 'Data', 'View'].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 190, height: 60, borderBottom: `2px solid ${GRID}`, display: 'flex', alignItems: 'center', fontFamily: c.fonts.display, fontSize: 26, color: INK }}>
        <span style={{ width: 120, textAlign: 'center', borderRight: `2px solid ${GRID}` }}>B3</span>
        <span style={{ padding: '0 18px', color: GREEN, fontStyle: 'italic' }}>fx</span>
        <span>=PLAY(B3:H17, &quot;frame&quot;, {c.frame})</span>
      </div>
      {/* Column letters and row numbers. */}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <rect x={0} y={TOP} width={1080} height={CELL_H} fill={HEAD} />
        <rect x={0} y={TOP} width={LEFT} height={1920} fill={HEAD} />
        {COLS.map((col, k) => (
          <text key={col} x={LEFT + k * CELL_W + CELL_W / 2} y={TOP + 42} textAnchor="middle" fontSize={26} fill="#5F6368" fontFamily={c.fonts.body}>
            {col}
          </text>
        ))}
        {Array.from({ length: rows }, (_, r) => (
          <g key={r}>
            <text x={LEFT / 2} y={TOP + CELL_H * (r + 1) + 40} textAnchor="middle" fontSize={24} fill="#5F6368" fontFamily={c.fonts.body}>
              {r + 1}
            </text>
            <line x1={0} y1={TOP + CELL_H * (r + 1)} x2={1080} y2={TOP + CELL_H * (r + 1)} stroke={GRID} strokeWidth={2} />
          </g>
        ))}
        {COLS.map((_, k) => (
          <line key={k} x1={LEFT + k * CELL_W} y1={TOP} x2={LEFT + k * CELL_W} y2={1920} stroke={GRID} strokeWidth={2} />
        ))}
        {/* Conditional formatting in the free cells, stepping every few frames. */}
        {Array.from({ length: 8 }, (_, r) =>
          COLS.map((_, k) => {
            const v = noise(r * 9 + k + f * 0.0, f % 7);
            return <rect key={`${r}-${k}`} x={LEFT + k * CELL_W + 2} y={TOP + CELL_H * (18 + r) + 2} width={CELL_W - 4} height={CELL_H - 4} fill={v > 0.66 ? '#B7E1CD' : v > 0.33 ? '#FCE8B2' : '#F4C7C3'} opacity={0.9} />;
          }),
        )}
      </svg>
      {/* The selected range's border sits round the footage (drawn in the overlay). */}
    </AbsoluteFill>
  );
}

function CellChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <div style={{ border: `2px solid ${GRID}` }}>
      {bars.map((b, k) => (
        <div key={k} style={{ display: 'flex', borderBottom: k < bars.length - 1 ? `2px solid ${GRID}` : undefined, height: 64, alignItems: 'stretch', fontFamily: c.fonts.display, fontSize: 28, color: INK }}>
          <div style={{ width: 200, padding: '0 14px', display: 'flex', alignItems: 'center', borderRight: `2px solid ${GRID}`, background: HEAD, overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.label}</div>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 14px' }}>
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: `${(b.value / max) * 100 * b.grow}%`, background: 'linear-gradient(90deg, #63BE7B, #B7E1CD)' }} />
            <span style={{ position: 'relative', opacity: b.grow > 0.6 ? 1 : 0 }}>{b.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export const spreadsheet = defineStyle({
  id: 'spreadsheet',
  accent: GREEN,
  colors: ['#63BE7B', '#FBBC04'],
  entrance: 'step',
  screen: { ...RANGE, shape: 'rect' },
  Backdrop: Window,
  Overlay: () => <div style={{ position: 'absolute', left: RANGE.x - 3, top: RANGE.y - 3, width: RANGE.w + 6, height: RANGE.h + 6, border: `5px solid ${GREEN}`, boxSizing: 'border-box' }}><div style={{ position: 'absolute', right: -10, bottom: -10, width: 16, height: 16, background: GREEN, border: '3px solid #fff' }} /></div>,
  caption: caption({ size: 74, glyph: 0.62, color: INK, emph: GREEN, weight: 600, bg: '#FFFFFF', pad: '8px 20px', boxExtra: { border: `4px solid ${GREEN}` }, entrance: 'step' }),
  hook: hook({ top: 0.135, align: 'left', entrance: 'step', typewriter: true, color: INK, size: 52, weight: 600, bg: '#FFF7D6', border: `3px solid #FBBC04`, pad: '12px 20px' }),
  card: card({ bg: '#FFFFFF', border: `3px solid ${GRID}`, shadow: '0 10px 30px rgba(0,0,0,0.18)' }),
  title: text({ color: INK, weight: 600 }),
  body: text({ font: 'body', color: '#3C4043' }),
  number: text({ color: GREEN, weight: 600, extra: { background: '#E6F4EA', padding: '0 24px', border: `4px solid ${GREEN}` } }),
  slam: text({ color: '#fff', weight: 600, upper: true, extra: { background: GREEN, padding: '0 26px' } }),
  Marker: markerSquare([GREEN, '#FBBC04', '#EA4335'], 30),
  Ring: ringSquare(GREEN, 6),
  stage: { shape: 'square', fill: ['#FFFFFF', HEAD], ring: GREEN, ringWidth: 5 },
  transition: trBlinds({ color: '#FFFFFF', n: 14 }),
  Chart: CellChart,
  sample: { type: 'chart', text: 'Q1 views', items: ['Jan: 12K', 'Feb: 18K', 'Mar: 31K'] },
});
