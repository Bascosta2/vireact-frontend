import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringBrackets, text } from '../../kit/presets';
import { glowSpot, vignette } from '../../kit/textures';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Product Studio: the product-promo recipe. A dark studio grade with a spotlight on the middle, camera
 * framing marks in the corners, hard cuts that land on a black-and-white comic speed-line burst, and
 * slams set on a big colour circle. Short, punchy, built for ads and launches.
 */

const ORANGE = '#FF6B1A';
const INK = '#0E0E10';

/** Corner framing marks that breathe slightly. */
function Framing({ c }: { c: Ctx }) {
  const s = 40 + 6 * Math.sin(c.frame / 20);
  const arm = 70;
  const corner = (x: number, y: number, dx: number, dy: number) => <path d={`M ${x} ${y + dy * arm} V ${y} H ${x + dx * arm}`} fill="none" stroke="#fff" strokeWidth={6} />;
  return (
    <AbsoluteFill>
      {glowSpot('50%', '42%', '#FFFFFF', '45%', 0.12, 'soft-light')}
      {vignette(0.85, INK, 35)}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {corner(s + 40, s + 140, 1, 1)}
        {corner(1080 - s - 40, s + 140, -1, 1)}
        {corner(s + 40, 1920 - s - 240, 1, -1)}
        {corner(1080 - s - 40, 1920 - s - 240, -1, -1)}
        <circle cx={80} cy={110} r={11} fill="#FF3B30" opacity={Math.floor(c.frame / 15) % 2 ? 1 : 0.25} />
        <text x={102} y={120} fill="#fff" fontSize={28} fontFamily={c.fonts.body} letterSpacing={2}>
          REC · 4K · 24
        </text>
      </svg>
    </AbsoluteFill>
  );
}

/** The cut: a black-and-white comic speed-line burst for a few frames. */
const burst: StyleTheme['transition'] = {
  before: 2,
  after: 6,
  Draw: ({ d }) => {
    const o = d < 0 ? 0.5 : interpolate(d, [0, 6], [1, 0], { extrapolateRight: 'clamp' });
    return (
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: o }}>
        <svg width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#fff" />
          {Array.from({ length: 60 }, (_, k) => {
            const a = (k / 60) * Math.PI * 2;
            const r0 = 260 + noise(k, d + 9) * 140;
            return <polygon key={k} points={`${540 + Math.cos(a) * r0},${900 + Math.sin(a) * r0} ${540 + Math.cos(a - 0.03) * 2000},${900 + Math.sin(a - 0.03) * 2000} ${540 + Math.cos(a + 0.03) * 2000},${900 + Math.sin(a + 0.03) * 2000}`} fill={INK} />;
          })}
        </svg>
      </AbsoluteFill>
    );
  },
  camera: (d) => (d >= 0 && d < 6 ? { scale: interpolate(d, [0, 6], [1.18, 1]) } : {}),
};

export const productStudio = defineStyle({
  id: 'product-studio',
  accent: ORANGE,
  colors: ['#FFFFFF', '#1A1A1E'],
  entrance: 'pop',
  footage: 'contrast(1.15) saturate(1.1) brightness(0.95)',
  Overlay: Framing,
  caption: caption({ size: 98, glyph: 0.5, color: '#FFFFFF', emph: ORANGE, weight: 900, upper: true, letter: -1, shadow: '0 6px 24px rgba(0,0,0,0.7)' }),
  hook: hook({ top: 0.1, color: INK, size: 74, weight: 900, upper: true, letter: -1, bg: '#FFFFFF', pad: '14px 32px', boxExtra: { borderBottom: `12px solid ${ORANGE}` } }),
  card: card({ bg: '#FFFFFF', radius: 0, shadow: `14px 14px 0 ${ORANGE}` }),
  title: text({ color: INK, weight: 900, upper: true, letter: -0.5 }),
  body: text({ font: 'body', color: '#3A3A40', weight: 600 }),
  number: text({ color: '#FFFFFF', weight: 900, letter: -3, shadow: `0 0 0 ${ORANGE}, 10px 10px 0 ${ORANGE}` }),
  slam: text({ color: '#FFFFFF', weight: 900, upper: true, letter: -2, stroke: [10, INK] }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', left: '50%', top: '50%', width: 620, height: 620, borderRadius: '50%', background: ORANGE, transform: `translate(-50%, -50%) scale(${t})` }} />,
  Marker: markerDot([ORANGE, '#FFFFFF', INK], 30, `4px solid ${INK}`),
  Ring: ringBrackets('#FFFFFF', 6),
  stage: { shape: 'circle', fill: ['#2A2A30', INK], ring: ORANGE, ringWidth: 8 },
  transition: burst,
  sample: { type: 'slam', text: 'NEW DROP' },
});
