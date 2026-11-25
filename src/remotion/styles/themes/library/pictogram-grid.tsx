import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { noise, type Ctx } from '../../theme';

/**
 * Pictogram Grid: a beat-locked film built from a square-grid core graphic. Bands of circles,
 * half-discs and tiny patterned cells along the top and bottom slide one cell on every beat of the talk,
 * cells flip colour, and the footage sits between the bands.
 */

const INK = '#141414';
const CREAM = '#F3EEE3';
const PALETTE = ['#FF5A3C', '#2F5BFF', '#FFC531', '#141414', '#F3EEE3'];
const CELL = 90;

/** One cell's shape: circle, half-disc (4 turns), quarter, square, stripes. */
function cellShape(kind: number, col: string, bg: string, key: string, x: number, y: number) {
  const r = CELL / 2;
  const cx = x + r;
  const cy = y + r;
  return (
    <g key={key}>
      <rect x={x} y={y} width={CELL} height={CELL} fill={bg} />
      {kind === 0 && <circle cx={cx} cy={cy} r={r * 0.86} fill={col} />}
      {kind >= 1 && kind <= 4 && <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`} fill={col} transform={`rotate(${(kind - 1) * 90} ${cx} ${cy})`} />}
      {kind === 5 && <path d={`M ${x} ${y + CELL} A ${CELL} ${CELL} 0 0 1 ${x + CELL} ${y} V ${y + CELL} Z`} fill={col} />}
      {kind === 6 && [0, 1, 2].map((k) => <rect key={k} x={x + 8 + k * 28} y={y + 8} width={14} height={CELL - 16} fill={col} />)}
    </g>
  );
}

function Band({ c, y, rows, seed }: { c: Ctx; y: number; rows: number; seed: number }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const step = Math.max(0, k);
  const slide = d === Infinity ? 0 : 1 - spring({ frame: d, fps: c.fps, config: { damping: 18, stiffness: 220 } });
  const cols = 14;
  return (
    <g transform={`translate(0 ${y})`}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const n = i + step * (row % 2 ? 1 : -1);
        const kind = Math.floor(noise(n, seed) * 7);
        const fg = PALETTE[Math.floor(noise(n, seed + 1) * 4)];
        const bg = PALETTE[(Math.floor(noise(n, seed + 2) * 5) + 1) % 5];
        const x = (col - 1) * CELL + (row % 2 ? 1 : -1) * slide * CELL;
        return cellShape(kind, fg, bg === fg ? CREAM : bg, `${i}`, x, row * CELL);
      })}
    </g>
  );
}

function Bands({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <Band c={c} y={0} rows={3} seed={3} />
        <Band c={c} y={1920 - CELL * 3} rows={3} seed={9} />
      </svg>
    </AbsoluteFill>
  );
}

export const pictogramGrid = defineStyle({
  id: 'pictogram-grid',
  accent: '#FF5A3C',
  colors: ['#2F5BFF', '#FFC531'],
  entrance: 'pop',
  footage: 'contrast(1.08) saturate(1.05)',
  Overlay: Bands,
  caption: caption({ size: 92, glyph: 0.56, color: INK, emph: '#FF5A3C', weight: 800, upper: true, bg: CREAM, pad: '4px 22px', entrance: 'pop' }),
  hook: hook({ top: 0.16, color: CREAM, size: 70, weight: 800, upper: true, bg: INK, pad: '14px 28px' }),
  card: card({ bg: CREAM, border: `6px solid ${INK}` }),
  title: text({ color: INK, weight: 800, upper: true }),
  body: text({ font: 'body', color: '#3A3A3A', weight: 600 }),
  number: text({ color: INK, weight: 800, extra: { background: '#FFC531', padding: '0 24px' } }),
  slam: text({ color: CREAM, weight: 800, upper: true, extra: { background: '#2F5BFF', padding: '0 24px' } }),
  Marker: markerDot(PALETTE.slice(0, 3), 34),
  Ring: ringCircle('#FF5A3C', 12),
  stage: { shape: 'square', fill: [CREAM, '#E6DFD0'], ring: INK, ringWidth: 8 },
  transition: trBlinds({ color: INK, n: 10, vertical: true }),
  sample: { type: 'pill', text: 'On the beat' },
});
