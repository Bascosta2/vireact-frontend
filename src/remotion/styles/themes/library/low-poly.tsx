import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { block, cloud, svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Low-Poly Island: a tiny faceted world seen through an orthographic isometric lens. Everything is a
 * geometric block, and everything that appears arrives with a bounce: hills, trees, a lighthouse, boats
 * bobbing on a faceted sea.
 */

const SEA = '#3FA7D6';
const SAND: [string, string, string] = ['#F6D98B', '#D4AE5A', '#E5C46F'];
const GRASS: [string, string, string] = ['#8BD17C', '#4E9A47', '#6CB860'];
const ROCK: [string, string, string] = ['#C9CED6', '#7D8592', '#A2AAB6'];
const TREE: [string, string, string] = ['#3F9B5B', '#24683A', '#2F8049'];

function Island({ c }: { c: Ctx }) {
  const pop = (k: number) => spring({ frame: (c.frame % 450) - k * 4, fps: c.fps, config: { damping: 9, stiffness: 160 } });
  const tiles: { gx: number; gy: number; h: number }[] = [];
  for (let gx = 0; gx < 6; gx += 1) for (let gy = 0; gy < 6; gy += 1) {
    const r = Math.hypot(gx - 2.5, gy - 2.5);
    if (r < 3.2) tiles.push({ gx, gy, h: 20 + Math.max(0, 2.6 - r) * 40 + noise(gx * 7 + gy, 3) * 20 });
  }
  tiles.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#BFE6FF, #8FD0F5 45%, #3FA7D6 46%, #2B86B8)' }}>
      {svgFrame(
        <g>
          {cloud(220, 360 + Math.sin(c.frame / 40) * 6, 260, '#fff')}
          {cloud(820, 260 + Math.cos(c.frame / 50) * 6, 200, '#fff', { opacity: 0.9 })}
          {/* Faceted sea: triangles that shimmer. */}
          {Array.from({ length: 60 }, (_, k) => {
            const x = (k % 10) * 120;
            const y = 900 + Math.floor(k / 10) * 170;
            const sh = 0.85 + 0.15 * Math.sin(c.frame / 18 + k);
            return <polygon key={k} points={`${x},${y} ${x + 120},${y + 40} ${x + 20},${y + 160}`} fill={SEA} opacity={0.35 * sh} />;
          })}
          {tiles.map((t, k) => {
            const p = pop(k);
            const x = 540 + (t.gx - t.gy) * 72;
            const y = 1100 + (t.gx + t.gy) * 42 - 220;
            const h = t.h * p;
            const top = t.h > 70 ? ROCK : t.h > 40 ? GRASS : SAND;
            return <g key={k}>{block(x, y, 72, 72, h, top)}</g>;
          })}
          {/* Trees and a lighthouse bounce in last. */}
          {[[470, 840], [620, 880], [560, 960]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y}) scale(${pop(30 + k * 3)})`}>
              {block(-12, 0, 24, 24, 30, ['#8B5A2B', '#5E3A1A', '#734820'])}
              <polygon points="0,-110 40,-20 -40,-20" fill={TREE[0]} />
              <polygon points="0,-110 40,-20 0,-30" fill={TREE[1]} />
            </g>
          ))}
          <g transform={`translate(700 790) scale(${pop(40)})`}>
            {block(-20, 0, 40, 40, 150, ['#FFFFFF', '#D64545', '#EDEDED'])}
            <circle cx={0} cy={-170} r={16} fill="#FFE066" opacity={0.6 + 0.4 * Math.abs(Math.sin(c.frame / 10))} />
          </g>
          {/* A boat bobbing. */}
          <g transform={`translate(${260 + Math.sin(c.frame / 60) * 40} ${1280 + Math.sin(c.frame / 12) * 8}) rotate(${Math.sin(c.frame / 15) * 4})`}>
            <polygon points="-60,0 60,0 40,30 -40,30" fill="#8B5A2B" />
            <polygon points="0,-90 0,-5 50,-5" fill="#FFFFFF" />
          </g>
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const lowPoly = defineStyle({
  id: 'low-poly',
  accent: '#FF7A45',
  colors: [GRASS[0], SEA],
  entrance: 'bounce',
  Scene: Island,
  caption: caption({ size: 92, glyph: 0.55, color: '#FFFFFF', emph: '#FFE066', weight: 800, stroke: [10, '#1D4E6B'], shadow: '0 6px 0 #1D4E6B', entrance: 'bounce' }),
  hook: hook({ top: 0.08, entrance: 'bounce', color: '#1D4E6B', size: 70, weight: 800, bg: '#FFFFFF', radius: 24, boxShadow: '0 10px 0 #1D4E6B' }),
  card: card({ bg: '#FFFFFF', radius: 24, shadow: '0 10px 0 #1D4E6B' }),
  title: text({ color: '#1D4E6B', weight: 800 }),
  body: text({ font: 'body', color: '#3A6A84', weight: 600 }),
  number: text({ color: '#FF7A45', weight: 800, stroke: [10, '#fff'] }),
  slam: text({ color: '#FFE066', weight: 800, stroke: [12, '#1D4E6B'] }),
  Marker: markerDot(['#FF7A45', GRASS[0], SEA], 34, '4px solid #1D4E6B'),
  Ring: ringCircle('#FF7A45', 9, { under: [16, '#fff'] }),
  stage: { shape: 'circle', fill: ['#BFE6FF', SEA], ring: '#1D4E6B', ringWidth: 6 },
  transition: trIris({ color: SEA }),
  sample: { type: 'pill', text: 'Day 1 on the island' },
});
