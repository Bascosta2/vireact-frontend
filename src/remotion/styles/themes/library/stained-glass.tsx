import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Stained Glass: a window seen from inside a dark stone hall, alive only where the sun touches it. Glass
 * pieces of a bird in a tree held in black lead lines (a seeded mosaic), each catching light differently;
 * a band of sunlight moves across and the pieces it passes flare, throwing coloured light on the floor.
 * (Also the glass-mosaic tile wall from the prompt list.)
 */

const LEAD = '#141014';
const GLASS = ['#1F4E9E', '#2E7DD1', '#C2272D', '#E8A33A', '#2F8F4E', '#6A3FA0', '#F2D16B'];

/** A seeded mosaic of quads filling the arch window. */
const TILES = (() => {
  const out: { pts: string; col: string; cx: number; cy: number }[] = [];
  const cols = 9;
  const rows = 15;
  for (let r = 0; r < rows; r += 1) {
    for (let q = 0; q < cols; q += 1) {
      const j = (k: number) => (noise(r * 31 + q, k) - 0.5) * 30;
      const x0 = 190 + q * 78;
      const y0 = 260 + r * 84;
      const cx = x0 + 39;
      const cy = y0 + 42;
      // A bird (red) on a branch (green) in a blue sky, picked by position.
      const bird = Math.hypot(cx - 560, cy - 760) < 120;
      const leaf = Math.hypot(cx - 380, cy - 1060) < 170 || Math.hypot(cx - 720, cy - 1000) < 120;
      const trunk = Math.abs(cx - 520) < 50 && cy > 1050;
      const sun = Math.hypot(cx - 800, cy - 420) < 90;
      const col = bird ? GLASS[2] : leaf ? GLASS[4] : trunk ? '#7A4A2A' : sun ? GLASS[6] : GLASS[noise(r * 9 + q, 3) > 0.5 ? 0 : 1];
      out.push({ pts: `${x0 + j(1)},${y0 + j(2)} ${x0 + 78 + j(3)},${y0 + j(4)} ${x0 + 78 + j(5)},${y0 + 84 + j(6)} ${x0 + j(7)},${y0 + 84 + j(8)}`, col, cx, cy });
    }
  }
  return out;
})();

function Window({ c }: { c: Ctx }) {
  const beam = ((c.frame % 240) / 240) * 1100 - 100;
  return (
    <AbsoluteFill style={{ background: '#0E0B0C' }}>
      {svgFrame(
        <g>
          <defs>
            <clipPath id="sg-arch">
              <path d="M 190 1520 V 560 Q 190 260 540 240 Q 890 260 890 560 V 1520 Z" />
            </clipPath>
          </defs>
          {/* Stone wall. */}
          {Array.from({ length: 30 }, (_, k) => (
            <rect key={k} x={(k % 5) * 216 + (Math.floor(k / 5) % 2) * 108 - 108} y={Math.floor(k / 5) * 320} width={212} height={316} fill="#1E1A1C" stroke="#0A0809" strokeWidth={6} />
          ))}
          <g clipPath="url(#sg-arch)">
            {TILES.map((t, k) => {
              const lit = Math.max(0, 1 - Math.abs(t.cx + t.cy * 0.4 - beam - 300) / 260);
              return <polygon key={k} points={t.pts} fill={t.col} stroke={LEAD} strokeWidth={7} strokeLinejoin="round" style={{ filter: `brightness(${0.55 + 0.4 * noise(k, 9) + lit * 0.9})` }} />;
            })}
          </g>
          <path d="M 190 1520 V 560 Q 190 260 540 240 Q 890 260 890 560 V 1520 Z" fill="none" stroke="#3A3236" strokeWidth={30} />
          {/* Coloured light thrown on the floor. */}
          <ellipse cx={beam * 0.6 + 200} cy={1760} rx={380} ry={90} fill="url(#sg-floor)" opacity={0.6} />
          <defs>
            <radialGradient id="sg-floor">
              <stop offset="0" stopColor="#F2D16B" stopOpacity={0.7} />
              <stop offset="0.5" stopColor="#C2272D" stopOpacity={0.35} />
              <stop offset="1" stopColor="#1F4E9E" stopOpacity={0} />
            </radialGradient>
          </defs>
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const stainedGlass = defineStyle({
  id: 'stained-glass',
  accent: '#F2D16B',
  colors: ['#C2272D', '#2E7DD1'],
  entrance: 'fade',
  Scene: Window,
  caption: caption({ size: 90, glyph: 0.5, color: '#FFF4D6', emph: '#F2D16B', shadow: '0 0 14px #000, 0 4px 0 #000', entrance: 'fade' }),
  hook: hook({ top: 0.05, entrance: 'fade', color: '#FFF4D6', size: 72, bg: 'rgba(14,11,12,0.85)', border: '6px solid #F2D16B', pad: '14px 34px', radius: 4 }),
  card: card({ bg: 'rgba(14,11,12,0.88)', border: '5px solid #F2D16B', radius: 4 }),
  title: text({ color: '#FFF4D6' }),
  body: text({ font: 'body', color: '#E8D7B0' }),
  number: text({ color: '#F2D16B', glow: '#E8A33A' }),
  slam: text({ color: '#FFF4D6', glow: '#C2272D' }),
  Marker: markerDot(GLASS.slice(0, 4), 28, `5px solid ${LEAD}`),
  Ring: ringCircle('#F2D16B', 8, { under: [16, LEAD] }),
  stage: { shape: 'circle', fill: ['#2E7DD1', '#1F4E9E'], ring: LEAD, ringWidth: 12 },
  transition: trBlinds({ color: '#0E0B0C', n: 7, vertical: true }),
  sample: { type: 'headline', text: 'The bird in the window', subtext: '' },
});
