import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { ChartBar, Ctx } from '../../theme';

/**
 * Transit Map: a metro schematic printed on a sheet. Lines hold to eight directions, stops are white
 * ticks, interchanges are black-outlined capsules, water is flat blue; little trains run the lines.
 */

const PAPER = '#F7F5EF';
const INK = '#1D1D1F';
const WATER = '#BFE0F2';
const LINES: { color: string; pts: [number, number][] }[] = [
  { color: '#E63946', pts: [[120, 360], [380, 360], [540, 520], [540, 900], [760, 1120], [960, 1120]] },
  { color: '#1D6FD8', pts: [[120, 1240], [300, 1240], [540, 1000], [540, 900], [780, 660], [960, 660]] },
  { color: '#2BA84A', pts: [[300, 200], [300, 600], [540, 840], [820, 840], [820, 1360]] },
  { color: '#F4A300', pts: [[960, 300], [700, 300], [540, 460], [340, 660], [140, 860]] },
];
const lineLen = (pts: [number, number][]) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const pointAt = (pts: [number, number][], d: number): [number, number] => {
  let left = d;
  for (let k = 1; k < pts.length; k += 1) {
    const seg = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (left <= seg) return [pts[k - 1][0] + ((pts[k][0] - pts[k - 1][0]) * left) / seg, pts[k - 1][1] + ((pts[k][1] - pts[k - 1][1]) * left) / seg];
    left -= seg;
  }
  return pts[pts.length - 1];
};

function MapSheet({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 100, 420);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g>
          {/* A river crossing the map. */}
          <path d="M -20 1000 L 260 1000 L 420 1160 L 1100 1160 L 1100 1260 L 380 1260 L 220 1100 L -20 1100 Z" fill={WATER} />
          {LINES.map((l, k) => {
            const len = lineLen(l.pts);
            const tr = pointAt(l.pts, (((c.frame * 4 + k * 300) % len) + len) % len);
            return (
              <g key={k}>
                <polyline points={l.pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={l.color} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" style={drawStroke(smooth(u, k * 0.12, k * 0.12 + 0.4), len + 20)} />
                {u >= 1 && <rect x={tr[0] - 18} y={tr[1] - 10} width={36} height={20} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />}
                {l.pts.slice(1, -1).map((p, j) => (
                  <circle key={j} cx={p[0]} cy={p[1]} r={9} fill="#fff" stroke={INK} strokeWidth={3} opacity={smooth(u, 0.5, 0.7)} />
                ))}
              </g>
            );
          })}
          {/* Interchanges. */}
          {[
            [540, 900, 'Central'],
            [540, 480, 'Market'],
            [300, 360, 'North'],
            [820, 1120, 'Harbour'],
          ].map(([x, y, n]) => (
            <g key={n as string} opacity={smooth(u, 0.6, 0.8)}>
              <rect x={(x as number) - 30} y={(y as number) - 18} width={60} height={36} rx={18} fill="#fff" stroke={INK} strokeWidth={6} />
              {label((x as number) + 44, (y as number) + 10, n as string, { size: 30, fill: INK, font: c.fonts.display, anchor: 'start', weight: 800 })}
            </g>
          ))}
        </g>,
      )}
      {grain({ color: '#7A7462', alpha: 0.12, freq: 0.85 })}
    </AbsoluteFill>
  );
}

/** Bars as line lengths, each in a line colour with a stop at its end. */
function LineChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {bars.map((b, k) => (
        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 170, fontFamily: c.fonts.body, fontSize: 28, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</div>
          <div style={{ flex: 1, position: 'relative', height: 26 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 26, borderRadius: 13, width: `${(b.value / max) * 100 * b.grow}%`, background: LINES[k % LINES.length].color }} />
            <div style={{ position: 'absolute', top: -5, left: `calc(${(b.value / max) * 100 * b.grow}% - 18px)`, width: 36, height: 36, borderRadius: 18, background: '#fff', border: `5px solid ${INK}`, boxSizing: 'border-box' }} />
          </div>
          <div style={{ width: 130, fontFamily: c.fonts.display, fontWeight: 800, fontSize: 30, color: INK, opacity: b.grow > 0.6 ? 1 : 0 }}>{b.text}</div>
        </div>
      ))}
    </div>
  );
}

export const transitMap = defineStyle({
  id: 'transit-map',
  accent: '#E63946',
  colors: ['#1D6FD8', '#2BA84A'],
  entrance: 'glide',
  Scene: MapSheet,
  pip: pipAt({ border: `12px solid #fff`, boxShadow: `0 0 0 8px ${INK}` }, 'circle'),
  caption: caption({ size: 90, glyph: 0.55, color: INK, emph: '#E63946', weight: 800, bg: '#FFFFFF', pad: '6px 26px', radius: 40, boxExtra: { border: `5px solid ${INK}` }, entrance: 'glide' }),
  hook: hook({ top: 0.08, align: 'left', color: '#FFFFFF', size: 62, weight: 800, bg: INK, radius: 10, pad: '18px 30px', boxExtra: { borderLeft: '22px solid #E63946' } }),
  card: card({ bg: '#FFFFFF', border: `4px solid ${INK}`, radius: 14, shadow: '0 10px 24px rgba(0,0,0,0.15)' }),
  title: text({ color: INK, weight: 800 }),
  body: text({ font: 'body', color: '#3A3A3E', weight: 500 }),
  number: text({ color: '#E63946', weight: 800, stroke: [8, '#fff'] }),
  slam: text({ color: '#fff', weight: 800, extra: { background: '#E63946', padding: '0 28px', borderRadius: 60 } }),
  Marker: markerDot(['#E63946', '#1D6FD8', '#2BA84A', '#F4A300'], 36, `6px solid ${INK}`),
  Ring: ringCircle(INK, 8, { under: [16, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', PAPER], ring: INK, ringWidth: 8 },
  transition: trWipe({ color: '#1D6FD8', dir: 'right', angle: 45, before: 4, after: 9 }),
  Chart: LineChart,
  sample: { type: 'list', text: 'The founder line', items: ['Idea', 'First sale', 'First hire'] },
});
