import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBlinds } from '../../kit/presets';
import { block, svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Isometric Town: a calm picture-book place drawn in true isometric with flat colour. A crossroads with
 * a café, a bakery and a park; small faceless people walk the pavements, a bus goes round, and the
 * windows warm up as the day turns.
 */

const GROUND = '#E8E2D4';
const ROAD = '#9AA0A8';

/** Iso position of grid point (gx, gy) on the ground. */
const iso = (gx: number, gy: number) => ({ x: 540 + (gx - gy) * 78, y: 760 + (gx + gy) * 45 });

function Town({ c }: { c: Ctx }) {
  const t = c.frame / 30;
  const buildings: [number, number, number, [string, string, string]][] = [
    [0, 0, 180, ['#F4A261', '#C9703A', '#E08A4E']],
    [3, 0, 120, ['#E9C46A', '#B8932E', '#D4AD4C']],
    [0, 3, 140, ['#8AB6D6', '#5A86A6', '#709EC0']],
    [4, 4, 90, ['#F28482', '#C25452', '#DA6C6A']],
  ];
  return (
    <AbsoluteFill style={{ background: '#CFE6F2' }}>
      {svgFrame(
        <g>
          {block(540, 700, 470, 470, 20, [GROUND, '#C9C2B2', '#D9D2C2'])}
          {/* Roads in a cross. */}
          {block(540 + (2 - 0) * 78, 700 + 2 * 45, 70, 470, 22, [ROAD, '#7A8088', '#8A9098'])}
          {block(540 - 2 * 78 + 78, 700 + 2 * 45 + 45, 470, 70, 22, [ROAD, '#7A8088', '#8A9098'])}
          {buildings.map(([gx, gy, h, col], k) => {
            const p = iso(gx, gy);
            return (
              <g key={k}>
                {block(p.x, p.y - 20, 120, 120, h, col)}
                {/* Windows that warm up. */}
                {[0, 1].map((w) => (
                  <rect key={w} x={p.x + 30 + w * 34} y={p.y - h + 40 + w * 18} width={20} height={26} fill={Math.sin(t / 3 + k + w) > 0 ? '#FFE9A8' : '#5A6A7A'} transform={`skewY(30)`} style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                ))}
              </g>
            );
          })}
          {/* A tree in the park. */}
          {(() => {
            const p = iso(4, 1);
            return (
              <g>
                {block(p.x, p.y - 20, 20, 20, 50, ['#8B5A2B', '#5E3A1A', '#734820'])}
                <circle cx={p.x} cy={p.y - 110} r={60} fill="#6CB860" />
              </g>
            );
          })()}
          {/* People walking (faceless, seen from behind). */}
          {Array.from({ length: 6 }, (_, k) => {
            const s = ((t * 0.2 + noise(k, 1)) % 1) * 4;
            const p = iso(2.4 + (k % 2) * 0.6, s);
            return (
              <g key={k} transform={`translate(${p.x} ${p.y - 30})`}>
                <circle cy={-34} r={9} fill="#3A3A3A" />
                <rect x={-8} y={-26} width={16} height={26} rx={6} fill={['#E76F51', '#2A9D8F', '#264653'][k % 3]} />
              </g>
            );
          })}
          {/* The bus going round the block. */}
          {(() => {
            const s = (t * 0.25) % 4;
            const p = iso(s, 2.4);
            return <g transform={`translate(${p.x} ${p.y - 40})`}>{block(0, 0, 60, 26, 30, ['#FFD166', '#C99A2E', '#E6B54A'])}</g>;
          })()}
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const isometricTown = defineStyle({
  id: 'isometric-town',
  accent: '#E76F51',
  colors: ['#2A9D8F', '#E9C46A'],
  entrance: 'glide',
  Scene: Town,
  caption: caption({ size: 90, glyph: 0.55, color: '#264653', emph: '#E76F51', weight: 700, bg: '#FFFFFF', pad: '6px 24px', radius: 14, entrance: 'glide' }),
  hook: hook({ top: 0.08, color: '#264653', size: 68, weight: 700, bg: '#FFFFFF', radius: 16, boxShadow: '0 10px 24px rgba(38,70,83,0.2)' }),
  card: card({ bg: '#FFFFFF', radius: 16, shadow: '0 12px 28px rgba(38,70,83,0.22)' }),
  title: text({ color: '#264653', weight: 700 }),
  body: text({ font: 'body', color: '#4A6A73' }),
  number: text({ color: '#E76F51', weight: 700, stroke: [6, '#fff'] }),
  slam: text({ color: '#fff', weight: 700, extra: { background: '#E76F51', padding: '0 26px', borderRadius: 16 } }),
  Marker: markerDot(['#E76F51', '#2A9D8F', '#E9C46A'], 30),
  Ring: ringCircle('#E76F51', 8, { under: [14, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#CFE6F2'], ring: '#264653', ringWidth: 5 },
  transition: trBlinds({ color: '#CFE6F2', n: 7, vertical: true }),
  sample: { type: 'list', text: 'The rule here', items: ['Walk on the left', 'Wait at the line', 'Say good morning'] },
});
