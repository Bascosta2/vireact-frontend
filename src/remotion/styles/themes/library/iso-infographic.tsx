import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { block, drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { smooth } from '../../painted';
import type { ChartBar, Ctx } from '../../theme';

/**
 * Isometric Infographic: a system as a tiny isometric diorama of flat three-tone blocks on cream, with
 * thin ink labels. A glowing packet travels the route (phone → tower → cable → data centre) and each
 * label appears as it arrives.
 */

const CREAM = '#F4EEDF';
const INK = '#26262E';
const ORANGE = '#FF8A3D';
const BLUE: [string, string, string] = ['#8FB8FF', '#4F7BD9', '#6C95EC'];
const GREEN: [string, string, string] = ['#9ED9A8', '#4FA866', '#72BF85'];
const GREY: [string, string, string] = ['#F2F2F5', '#B7B9C4', '#D3D5DE'];
const ORG: [string, string, string] = ['#FFC59A', '#E0702A', '#F39A5C'];

/** Route stops in frame pixels. */
const STOPS = [
  { x: 200, y: 660, name: 'Phone' },
  { x: 470, y: 520, name: 'Tower' },
  { x: 700, y: 760, name: 'Cable' },
  { x: 860, y: 1000, name: 'Data centre' },
];

function Diorama({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 100, 300);
  const rise = (k: number) => smooth(u, k * 0.12, k * 0.12 + 0.2);
  // The packet loops along the route every 3 seconds once the world is built.
  const p = ((c.frame % 90) / 90) * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(p));
  const f = p - i;
  const px = STOPS[i].x + (STOPS[i + 1].x - STOPS[i].x) * f;
  const py = STOPS[i].y + (STOPS[i + 1].y - STOPS[i].y) * f - 40;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #FFF9EC, ${CREAM})` }}>
      {svgFrame(
        <g>
          {/* The ground plate. */}
          {block(130, 560, 520, 680, 26, ['#EDE4CF', '#D2C5A6', '#E0D5BA'])}
          {/* Phone, tower, data centre, each rising into place. */}
          <g transform={`translate(0 ${(1 - rise(0)) * 60})`} opacity={rise(0)}>{block(170, 640, 60, 34, 110, BLUE)}</g>
          <g transform={`translate(0 ${(1 - rise(1)) * 60})`} opacity={rise(1)}>
            {block(450, 560, 40, 40, 220, GREY)}
            <circle cx={470} cy={330} r={18} fill={ORANGE} />
          </g>
          <g transform={`translate(0 ${(1 - rise(2)) * 60})`} opacity={rise(2)}>
            {block(790, 1000, 170, 120, 190, GREY)}
            {Array.from({ length: 4 }, (_, k) => (
              <circle key={k} cx={740 + k * 26} cy={905 + k * 15} r={7} fill={k % 2 ? ORANGE : '#4F7BD9'} opacity={0.5 + 0.5 * Math.abs(Math.sin(c.frame / 6 + k))} />
            ))}
          </g>
          <g opacity={rise(3)}>
            {block(560, 820, 50, 50, 50, GREEN)}
            {block(330, 900, 70, 50, 70, GREEN)}
            {block(260, 1040, 60, 60, 40, ORG)}
          </g>
          {/* The route: a dashed cable, then the packet with its glow. */}
          <polyline points={STOPS.map((s) => `${s.x},${s.y}`).join(' ')} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="12 10" opacity={0.6 * smooth(u, 0.5, 0.7)} />
          {u >= 1 && (
            <g>
              <circle cx={px} cy={py} r={34} fill={ORANGE} opacity={0.35} style={{ filter: 'blur(8px)' }} />
              <circle cx={px} cy={py} r={14} fill={ORANGE} stroke="#fff" strokeWidth={4} />
            </g>
          )}
          {STOPS.map((s, k) => {
            const on = u >= 1 ? interpolate(p - k, [-0.15, 0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) || (p > k ? 1 : 0) : smooth(u, 0.6 + k * 0.08, 0.7 + k * 0.08);
            return (
              <g key={s.name} opacity={Math.max(on, u >= 1 ? 0.35 : 0)}>
                <line x1={s.x} y1={s.y - 60} x2={s.x} y2={s.y - 150} stroke={INK} strokeWidth={2} />
                <rect x={s.x - 100} y={s.y - 205} width={200} height={56} rx={10} fill="#fff" stroke={INK} strokeWidth={2} />
                {label(s.x, s.y - 166, s.name, { size: 28, fill: INK, font: c.fonts.body, weight: 500 })}
              </g>
            );
          })}
        </g>,
      )}
      {grain({ color: '#8A7A5A', alpha: 0.14, freq: 0.9 })}
    </AbsoluteFill>
  );
}

/** Bars as isometric block towers. */
function IsoChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  const n = bars.length;
  return (
    <svg width="100%" height={470} viewBox="0 0 820 470" style={{ overflow: 'visible' }}>
      {bars.map((b, k) => {
        const h = (b.value / max) * 280 * b.grow;
        const x = 90 + k * (640 / Math.max(1, n - 1));
        return (
          <g key={k}>
            {block(x, 400, 46, 46, Math.max(2, h), k === n - 1 ? ORG : BLUE)}
            <text x={x} y={400 - h - 60} fill={INK} fontSize={30} fontFamily={c.fonts.display} textAnchor="middle" fontWeight={800} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={x} y={466} fill="#5A5A66" fontSize={24} fontFamily={c.fonts.body} textAnchor="middle">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const isoInfographic = defineStyle({
  id: 'iso-infographic',
  accent: ORANGE,
  colors: ['#4F7BD9', '#4FA866'],
  entrance: 'pop',
  Scene: Diorama,
  pip: pipAt({ border: `6px solid #fff`, boxShadow: `0 0 0 4px ${INK}, 14px 18px 0 rgba(38,38,46,0.18)` }, 'rect', { radius: 30 }),
  caption: caption({ size: 90, glyph: 0.55, color: INK, emph: ORANGE, weight: 800, bg: '#FFFFFF', pad: '8px 26px', radius: 16, boxExtra: { boxShadow: `0 6px 0 ${INK}` }, entrance: 'pop' }),
  hook: hook({ top: 0.08, color: INK, size: 66, weight: 800, bg: '#FFFFFF', radius: 16, boxShadow: `0 8px 0 ${INK}`, boxExtra: { borderTop: `12px solid ${ORANGE}` } }),
  card: card({ bg: '#FFFFFF', border: `3px solid ${INK}`, radius: 18, shadow: `0 8px 0 ${INK}` }),
  title: text({ color: INK, weight: 800 }),
  body: text({ font: 'body', color: '#4A4A55', weight: 500 }),
  number: text({ color: ORANGE, weight: 800, stroke: [6, '#fff'] }),
  slam: text({ color: '#fff', weight: 800, stroke: [12, INK], upper: true }),
  Marker: markerDot([ORANGE, '#4F7BD9', '#4FA866'], 38, `4px solid ${INK}`),
  Ring: ringCircle(ORANGE, 9, { under: [17, '#fff'] }),
  stage: { shape: 'square', fill: ['#FFF9EC', CREAM], ring: INK, ringWidth: 5 },
  transition: trBlinds({ color: CREAM, n: 7, vertical: true }),
  Chart: IsoChart,
  sample: { type: 'chart', text: 'Data per day', items: ['2021: 2GB', '2022: 3GB', '2023: 5GB', '2024: 8GB'] },
});
