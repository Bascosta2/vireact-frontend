import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text, trPixels } from '../../kit/presets';
import { block, svgFrame } from '../../kit/scenery';
import { layer } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Pixel Diorama: hand-made pixel sprites standing like paper cut-outs inside a lit, fogged 3D diorama,
 * seen from a high three-quarter angle through a tilt-shift lens: a village of blocks, lanterns that
 * glow, a little hero walking, warm fog and blurred top and bottom. (The "HD-2D" look, by another name.)
 */

const P = 8;
const STONE: [string, string, string] = ['#C9C2B0', '#8A8270', '#A9A190'];
const ROOF: [string, string, string] = ['#C2553A', '#7E2F1E', '#A0412A'];
const GRASS: [string, string, string] = ['#6FAF5A', '#3E7A35', '#558F48'];

/** A pixel sprite from rows of palette indexes. */
const HERO = ['..1111..', '.122221.', '.123321.', '..2222..', '.444444.', '4.4444.4', '..5..5..', '.55..55.'];
const PAL = ['', '#2A1A10', '#F2C6A0', '#1A1A1A', '#3A6EE8', '#5A3A20'];

function Village({ c }: { c: Ctx }) {
  const walk = ((c.frame * 2) % 600) - 100;
  const flick = (k: number) => 0.7 + 0.3 * noise(Math.floor(c.frame / 4), k);
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(#2A3B5C, #5A6B8C 40%, #C9A27A)' }}>
      {svgFrame(
        <g>
          {block(540, 900, 520, 520, 40, GRASS)}
          {[[380, 900, 'a'], [640, 960, 'b'], [500, 1110, 'c']].map(([x, y, key]) => (
            <g key={key as string}>
              {block(x as number, y as number, 110, 110, 120, STONE)}
              {block(x as number, (y as number) - 120, 110, 110, 50, ROOF)}
            </g>
          ))}
          {/* Lanterns that glow and flicker. */}
          {[[300, 1080], [760, 1170], [560, 1290]].map(([x, y], k) => (
            <g key={k}>
              <circle cx={x} cy={y - 60} r={60} fill="#FFC870" opacity={0.25 * flick(k)} style={{ filter: 'blur(10px)' }} />
              <rect x={x - 4} y={y - 70} width={8} height={70} fill="#3A2A20" />
              <rect x={x - 12} y={y - 90} width={24} height={24} fill="#FFD98A" opacity={flick(k)} />
            </g>
          ))}
          {/* The hero sprite walking across, standing like a paper cut-out. */}
          <g transform={`translate(${300 + (walk % 500)} ${1200 - (walk % 500) * 0.3})`} shapeRendering="crispEdges">
            <ellipse cx={32} cy={66} rx={26} ry={8} fill="rgba(0,0,0,0.35)" />
            {HERO.flatMap((row, y) => row.split('').map((ch, x) => (ch === '.' ? null : <rect key={`${x}-${y}`} x={x * P} y={y * P + (Math.floor(c.frame / 6) % 2 && y > 5 ? -2 : 0)} width={P} height={P} fill={PAL[Number(ch)]} />)))}
          </g>
        </g>,
      )}
      {/* Warm fog, then a tilt-shift blur band top and bottom. */}
      {layer({ background: 'linear-gradient(transparent 30%, rgba(255,214,160,0.28) 70%, rgba(255,214,160,0.4))' })}
      {layer({ backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)', maskImage: 'linear-gradient(#000 0%, transparent 32%, transparent 68%, #000 100%)', WebkitMaskImage: 'linear-gradient(#000 0%, transparent 32%, transparent 68%, #000 100%)' })}
    </AbsoluteFill>
  );
}

export const pixelDiorama = defineStyle({
  id: 'pixel-diorama',
  accent: '#FFD98A',
  colors: ['#3A6EE8', '#C2553A'],
  entrance: 'step',
  step: 2,
  Scene: Village,
  caption: caption({ size: 66, glyph: 0.85, color: '#FFFFFF', emph: '#FFD98A', upper: true, shadow: '4px 4px 0 #1A1420', entrance: 'step' }),
  hook: hook({ top: 0.08, entrance: 'step', typewriter: true, color: '#FFFFFF', size: 42, upper: true, lineHeight: 1.5, bg: 'rgba(20,16,40,0.9)', border: '6px solid #E8DCC0', pad: '18px 26px', radius: 6 }),
  card: card({ bg: 'rgba(20,16,40,0.9)', border: '6px solid #E8DCC0', radius: 6 }),
  title: text({ color: '#FFFFFF', upper: true }),
  body: text({ font: 'body', color: '#E8DCC0' }),
  number: text({ color: '#FFD98A', shadow: '6px 6px 0 #1A1420' }),
  slam: text({ color: '#FFFFFF', upper: true, shadow: '6px 6px 0 #C2553A' }),
  Marker: markerSquare(['#FFD98A', '#3A6EE8', '#C2553A'], 22),
  Ring: ringSquare('#FFD98A', 6),
  stage: { shape: 'square', fill: ['#2A3B5C', '#14102A'], ring: '#E8DCC0', ringWidth: 6 },
  transition: trPixels({ color: '#14102A', cell: 64 }),
  sample: { type: 'list', text: 'Quest log', items: ['Find the lantern', 'Cross the bridge', 'Rest at the inn'] },
});
