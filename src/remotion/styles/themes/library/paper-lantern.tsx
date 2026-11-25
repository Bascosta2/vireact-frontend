import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { ridge } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Paper Lantern: a layered paper-cut shadow box lit from behind. Six sheets of cut card stacked in a
 * shallow box (mountains, a pagoda, trees, a bridge, birds), a warm light glowing through the paper so
 * each layer reads a different depth of amber; the light breathes and the layers sway slightly apart.
 */

const LAYERS = ['#FFE3A8', '#F7C978', '#E9A24E', '#C9732E', '#8E4A1E', '#4A2410'];

function ShadowBox({ c }: { c: Ctx }) {
  const glow = 0.9 + 0.1 * Math.sin(c.frame / 40);
  return (
    <AbsoluteFill style={{ background: '#2A160A' }}>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 180, bottom: 220, borderRadius: 20, overflow: 'hidden', boxShadow: 'inset 0 0 0 18px #3A2010, 0 30px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 35%, #FFF6DA, ${LAYERS[0]} 50%, ${LAYERS[1]})`, filter: `brightness(${glow})` }} />
        <svg width={980} height={1520} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={680} cy={330} r={110} fill="#FFFBEA" opacity={0.9} />
          {LAYERS.slice(1).map((col, k) => {
            const y = 620 + k * 170;
            const sway = Math.sin(c.frame / 50 + k) * (k + 1) * 2;
            return (
              <g key={k} transform={`translate(${sway} 0)`} style={{ filter: 'drop-shadow(0 6px 6px rgba(60,20,0,0.35))' }}>
                <polygon points={`-60,1600 ${ridge(y, 120 - k * 14, { freq: 1.4 + k * 0.3, seed: k * 1.7, peaks: 0.5 }).map((p) => p.split(',').map((v, i) => (i === 0 ? String(Number(v) * 0.92) : v)).join(',')).join(' ')} 1060,1600`} fill={col} />
                {k === 2 && (
                  <g transform="translate(300 720)" fill={col}>
                    <rect x={-50} y={-160} width={100} height={170} />
                    {[0, 1, 2].map((t) => <path key={t} d={`M ${-90 + t * 12} ${-160 - t * 60} H ${90 - t * 12} L ${50 - t * 12} ${-210 - t * 60} H ${-50 + t * 12} Z`} />)}
                  </g>
                )}
                {k === 3 && <path d="M 560 1050 Q 700 960 840 1050 V 1080 Q 700 1000 560 1080 Z" fill={col} />}
              </g>
            );
          })}
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M ${200 + k * 90 + Math.sin(c.frame / 20 + k) * 10} ${300 + k * 40} q 20 -16 40 0 q 20 -16 40 0`} stroke={LAYERS[5]} strokeWidth={6} fill="none" />
          ))}
        </svg>
      </div>
      {grain({ color: '#4A2A10', alpha: 0.25, freq: 0.6 })}
    </AbsoluteFill>
  );
}

export const paperLantern = defineStyle({
  id: 'paper-lantern',
  accent: '#FFE3A8',
  colors: ['#E9A24E', '#8E4A1E'],
  entrance: 'fade',
  Scene: ShadowBox,
  caption: caption({ size: 90, glyph: 0.5, color: '#FFF6DA', emph: '#FFE3A8', shadow: '0 0 14px #2A160A, 0 4px 0 #2A160A', entrance: 'fade' }),
  hook: hook({ top: 0.03, entrance: 'fade', color: '#FFE3A8', size: 66, shadow: '0 0 20px #000' }),
  card: card({ bg: 'rgba(42,22,10,0.88)', border: '3px solid #E9A24E', radius: 16 }),
  title: text({ color: '#FFF6DA' }),
  body: text({ font: 'body', color: '#F7C978' }),
  number: text({ color: '#FFE3A8', glow: '#E9A24E' }),
  slam: text({ color: '#FFF6DA', glow: '#E9A24E' }),
  Marker: markerDot(['#FFE3A8', '#E9A24E'], 22),
  Ring: ringCircle('#FFE3A8', 6),
  stage: { shape: 'circle', fill: ['#FFE3A8', '#C9732E'], ring: '#4A2410', ringWidth: 8 },
  transition: trIris({ color: '#2A160A' }),
  sample: { type: 'headline', text: 'The pagoda on the hill', subtext: '' },
});
