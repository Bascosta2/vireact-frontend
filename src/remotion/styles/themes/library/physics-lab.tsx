import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { noise, type ChartBar, type Ctx, type StyleTheme } from '../../theme';

/**
 * Physics Lab: a warm beige studio floor with physics running on it, each piece computed from the frame
 * with a fixed timestep and seeded randomness (so every render matches): a Galton board pours balls into
 * a bell curve, and a ball rolls down a ramp into a line of dominoes that topple in turn.
 */

const BEIGE = '#EFE3CF';
const INK = '#2D2A26';
const RED = '#E85D3A';
const CREAM = '#FBF5EA';
const LOOP = 420;

const ROWS = 9;
const PIN_GAP = 64;
const TOP = 300;
const BINS = ROWS + 1;
const BALLS = 140;
const ROW_FRAMES = 3;

/** Where ball i is after `t` frames of falling: its column offset per row, then its bin. */
const ballPath = (i: number) => {
  let col = 0;
  const cols: number[] = [0];
  for (let r = 0; r < ROWS; r += 1) {
    col += noise(i * 31 + r, 7) > 0.5 ? 0.5 : -0.5;
    cols.push(col);
  }
  return cols;
};
const PATHS = Array.from({ length: BALLS }, (_, i) => ballPath(i));

function Lab({ c }: { c: Ctx }) {
  const f = c.frame % LOOP;
  const bins = Array.from({ length: BINS }, () => 0);
  const falling: [number, number][] = [];
  for (let i = 0; i < BALLS; i += 1) {
    const t = f - i * 1.6;
    if (t < 0) break;
    const p = t / ROW_FRAMES;
    const path = PATHS[i];
    if (p >= ROWS) {
      bins[Math.round(path[ROWS] + ROWS / 2)] += 1;
      continue;
    }
    const r = Math.floor(p);
    const k = p - r;
    const x = 540 + (path[r] + (path[r + 1] - path[r]) * k) * PIN_GAP;
    const y = TOP + (r + k) * PIN_GAP - Math.sin(k * Math.PI) * 14;
    falling.push([x, y]);
  }
  const binTop = TOP + ROWS * PIN_GAP + 20;
  // The ball on the ramp, then the dominoes.
  const roll = Math.min(1, Math.max(0, (f - 30) / 50));
  const ballX = 120 + roll * 200;
  const ballY = 1080 + roll * 120;
  const fallAt = (k: number) => 80 + k * 4;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${BEIGE} 0%, #E7D7BC 100%)` }}>
      {svgFrame(
        <g>
          {/* The Galton board. */}
          <rect x={540 - (BINS / 2) * PIN_GAP - 20} y={TOP - 80} width={BINS * PIN_GAP + 40} height={ROWS * PIN_GAP + 330} rx={18} fill={CREAM} stroke={INK} strokeWidth={5} />
          <path d={`M ${540 - 90} ${TOP - 80} L 540 ${TOP - 20} L ${540 + 90} ${TOP - 80}`} fill="none" stroke={INK} strokeWidth={5} />
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: r + 1 }, (_, k) => <circle key={`${r}-${k}`} cx={540 + (k - r / 2) * PIN_GAP} cy={TOP + r * PIN_GAP + PIN_GAP / 2} r={6} fill={INK} />),
          )}
          {Array.from({ length: BINS + 1 }, (_, k) => (
            <line key={k} x1={540 + (k - BINS / 2) * PIN_GAP} y1={binTop} x2={540 + (k - BINS / 2) * PIN_GAP} y2={binTop + 230} stroke={INK} strokeWidth={4} />
          ))}
          {bins.map((n, b) =>
            Array.from({ length: n }, (_, j) => <circle key={`${b}-${j}`} cx={540 + (b - BINS / 2 + 0.5) * PIN_GAP + (j % 2 ? 9 : -9)} cy={binTop + 222 - Math.floor(j / 2) * 17} r={8.5} fill={RED} />),
          )}
          {falling.map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={9} fill={RED} />
          ))}
          {/* The bell curve, once most balls have landed. */}
          {f > BALLS * 1.6 + 30 && (
            <path d={Array.from({ length: 41 }, (_, k) => {
              const x = (k / 40 - 0.5) * BINS * PIN_GAP;
              const y = binTop + 222 - Math.exp(-(x * x) / (2 * Math.pow(PIN_GAP * 1.5, 2))) * 215;
              return `${k ? 'L' : 'M'} ${540 + x} ${y}`;
            }).join(' ')} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
          )}
          {/* The ramp, the ball and the dominoes. */}
          <path d="M 90 1060 L 340 1210" stroke={INK} strokeWidth={8} />
          <circle cx={ballX} cy={ballY - 24} r={22} fill="#C9CDD4" stroke={INK} strokeWidth={4} />
          <line x1={340} y1={1240} x2={1010} y2={1240} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 14 }, (_, k) => {
            const a = Math.min(76, Math.max(0, (f - fallAt(k)) * 13));
            const x = 370 + k * 45;
            return <rect key={k} x={x} y={1240 - 110} width={20} height={110} rx={3} fill={k % 2 ? CREAM : RED} stroke={INK} strokeWidth={3} transform={`rotate(${a} ${x + 20} 1240)`} />;
          })}
          {label(540, 1330, 'n = 9 rows · p = ½', { size: 30, fill: INK, font: c.fonts.body })}
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.15, freq: 0.85 })}
    </AbsoluteFill>
  );
}

/** Bars as stacks of balls, like the board's bins. */
function BallChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <svg width="100%" height={450} viewBox="0 0 800 450" style={{ overflow: 'visible' }}>
      <line x1={0} y1={400} x2={800} y2={400} stroke={INK} strokeWidth={4} />
      {bars.map((b, k) => {
        const w = 800 / bars.length;
        const n = Math.round((b.value / max) * 16 * b.grow);
        return (
          <g key={k}>
            {Array.from({ length: n }, (_, j) => (
              <circle key={j} cx={k * w + w / 2 + (j % 2 ? 13 : -13)} cy={386 - Math.floor(j / 2) * 26} r={12} fill={k === bars.length - 1 ? RED : '#C9CDD4'} stroke={INK} strokeWidth={2} />
            ))}
            <text x={k * w + w / 2} y={370 - Math.ceil(n / 2) * 26} textAnchor="middle" fontSize={30} fontWeight={700} fontFamily={c.fonts.display} fill={INK} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={k * w + w / 2} y={436} textAnchor="middle" fontSize={24} fontFamily={c.fonts.body} fill={INK}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A ball rolls across and knocks the picture over (the cut). */
const rollIn: StyleTheme['transition'] = {
  before: 6,
  after: 8,
  Draw: ({ d }) => {
    const x = ((d + 6) / 14) * 1300 - 110;
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: x, top: 1500, width: 120, height: 120, borderRadius: 60, background: 'radial-gradient(circle at 35% 30%, #fff, #C9CDD4 40%, #6B7078)', boxShadow: '0 20px 30px rgba(0,0,0,0.35)', transform: `rotate(${d * 40}deg)` }} />
      </AbsoluteFill>
    );
  },
  camera: (d) => (d >= 0 && d < 8 ? { rotate: (1 - d / 8) * 2.5, scale: 1.04 } : {}),
};

export const physicsLab = defineStyle({
  id: 'physics-lab',
  accent: RED,
  colors: [INK, '#C9CDD4'],
  entrance: 'bounce',
  Scene: Lab,
  pip: pipAt({ border: `8px solid ${CREAM}`, boxShadow: `0 0 0 5px ${INK}, 0 16px 30px rgba(0,0,0,0.3)` }, 'circle', { y: 1420 }),
  caption: caption({ size: 86, glyph: 0.62, color: INK, emph: RED, weight: 700, bg: CREAM, pad: '8px 26px', radius: 40, boxExtra: { border: `4px solid ${INK}` }, entrance: 'bounce' }),
  hook: hook({ top: 0.055, color: INK, size: 56, weight: 700, bg: CREAM, radius: 18, border: `4px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`, entrance: 'bounce' }),
  card: card({ bg: CREAM, border: `4px solid ${INK}`, radius: 22, shadow: `0 8px 0 ${INK}` }),
  title: text({ color: INK, weight: 700 }),
  body: text({ font: 'body', color: '#4A4540', weight: 600 }),
  number: text({ color: RED, weight: 700, stroke: [8, CREAM] }),
  slam: text({ color: '#fff', weight: 700, stroke: [12, INK] }),
  Marker: markerDot([RED, '#C9CDD4', INK], 36, `4px solid ${INK}`),
  Ring: ringCircle(RED, 8, { under: [16, CREAM] }),
  stage: { shape: 'circle', fill: [CREAM, BEIGE], ring: INK, ringWidth: 6 },
  transition: rollIn,
  Chart: BallChart,
  sample: { type: 'chart', text: 'Where the balls land', items: ['Edge: 2', 'Mid: 9', 'Centre: 16', 'Mid: 8'] },
});
