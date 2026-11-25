import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, ringCircle, text } from '../../kit/presets';
import { glowSpot, vignette } from '../../kit/textures';
import { noise, type ChartBar, type Ctx, type StyleTheme } from '../../theme';

/**
 * Coin Stacks: numbers built as real things. Every chart is gold coin discs (elliptical tops, shaded
 * edges) dropping into stacks on a dark navy stage, counters are struck in gold, and the cut is a shower
 * of coins. The footage keeps its colour under a navy vignette and a soft studio key light.
 */

const NAVY = '#0B1630';
const GOLD = '#F5C542';
const GOLD_D = '#B8860B';
const GOLD_L = '#FFE69A';

/** One coin seen from slightly above. */
const coin = (x: number, y: number, w: number, key: string | number) => (
  <g key={key}>
    <ellipse cx={x} cy={y + 7} rx={w / 2} ry={w * 0.16} fill={GOLD_D} />
    <rect x={x - w / 2} y={y} width={w} height={7} fill={GOLD_D} />
    <ellipse cx={x} cy={y} rx={w / 2} ry={w * 0.16} fill={GOLD} stroke={GOLD_L} strokeWidth={2} />
    <ellipse cx={x} cy={y} rx={w * 0.33} ry={w * 0.1} fill="none" stroke={GOLD_D} strokeWidth={2} opacity={0.6} />
  </g>
);

function CoinChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  const w = 760 / bars.length;
  const cw = Math.min(110, w * 0.7);
  return (
    <svg width="100%" height={500} viewBox="0 0 800 500" style={{ overflow: 'visible' }}>
      <ellipse cx={400} cy={430} rx={420} ry={40} fill="rgba(255,255,255,0.06)" />
      {bars.map((b, k) => {
        const full = Math.max(1, Math.round((b.value / max) * 26));
        const n = Math.round(full * b.grow);
        const x = 20 + k * w + w / 2;
        // The newest coin is still falling into place.
        const drop = b.grow < 1 ? interpolate((full * b.grow) % 1, [0, 1], [-60, 0]) : 0;
        return (
          <g key={k}>
            {Array.from({ length: n }, (_, j) => coin(x + (noise(j, k) - 0.5) * 4, 410 - j * 12 + (j === n - 1 ? drop : 0), cw, j))}
            <text x={x} y={370 - n * 12} textAnchor="middle" fontSize={32} fontWeight={700} fill={GOLD_L} fontFamily={c.fonts.display} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={x} y={480} textAnchor="middle" fontSize={26} fill="#C9D3EA" fontFamily={c.fonts.body}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const coinRain: StyleTheme['transition'] = {
  before: 6,
  after: 8,
  Draw: ({ d }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={1080} height={1920}>
        {Array.from({ length: 46 }, (_, k) => {
          const y = -200 + (d + 6 + noise(k, 2) * 4) * (150 + noise(k, 3) * 90);
          return <g key={k} transform={`translate(${noise(k, 1) * 1080} ${y}) rotate(${(noise(k, 4) - 0.5) * 60})`}>{coin(0, 0, 120 + noise(k, 5) * 60, k)}</g>;
        })}
      </svg>
    </AbsoluteFill>
  ),
  camera: (d) => (d >= 0 && d < 8 ? { scale: 1.06 - d * 0.0075 } : {}),
};

export const coinStacks = defineStyle({
  id: 'coin-stacks',
  accent: GOLD,
  colors: ['#4F8BFF', GOLD_L],
  entrance: 'pop',
  footage: 'contrast(1.08) saturate(1.05)',
  Overlay: () => (
    <AbsoluteFill>
      {vignette(0.75, NAVY, 40)}
      {glowSpot('50%', '0%', '#FFE6B0', '55%', 0.18)}
    </AbsoluteFill>
  ),
  caption: caption({ size: 96, glyph: 0.52, color: '#FFFFFF', emph: GOLD, weight: 700, stroke: [10, NAVY], shadow: '0 8px 24px rgba(0,0,0,0.6)' }),
  hook: hook({ top: 0.08, color: NAVY, size: 64, weight: 700, bg: `linear-gradient(180deg, ${GOLD_L}, ${GOLD})`, radius: 14, boxShadow: `0 8px 0 ${GOLD_D}, 0 20px 40px rgba(0,0,0,0.5)` }),
  card: card({ bg: 'rgba(11,22,48,0.9)', border: `2px solid ${GOLD}`, radius: 22, shadow: '0 20px 50px rgba(0,0,0,0.55)' }),
  title: text({ color: '#FFFFFF', weight: 700 }),
  body: text({ font: 'body', color: '#C9D3EA' }),
  number: text({ color: GOLD, weight: 700, extra: { backgroundImage: `linear-gradient(180deg, ${GOLD_L}, ${GOLD} 55%, ${GOLD_D})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.6))' } }),
  slam: text({ color: GOLD_L, weight: 700, upper: true, stroke: [8, NAVY] }),
  Marker: ({ t }) => (
    <svg width={46} height={46} viewBox="-23 -23 46 46" style={{ flex: 'none', transform: `scale(${t})` }}>
      {coin(0, -2, 40, 0)}
    </svg>
  ),
  Ring: ringCircle(GOLD, 8, { glow: true }),
  stage: { shape: 'circle', fill: ['#1B2B55', NAVY], ring: GOLD, ringWidth: 6, glow: GOLD },
  transition: coinRain,
  Chart: CoinChart,
  sample: { type: 'chart', text: 'Revenue by year', items: ['2022: $1.2M', '2023: $1.8M', '2024: $2.6M', '2025: $4.4M'] },
});

