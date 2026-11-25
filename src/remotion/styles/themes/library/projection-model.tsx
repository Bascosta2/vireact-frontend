import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trScan } from '../../kit/presets';
import { block, drawCycle, svgFrame } from '../../kit/scenery';
import { vignette } from '../../kit/textures';
import { smooth } from '../../painted';
import { noise, type Ctx } from '../../theme';

/**
 * Projection Model: a pure white massing model of a city on a plinth in a dark room, and a projector
 * painting data onto it as light, one layer at a time: towers rise to their values and glow, a sweep of
 * coloured light runs across the blocks.
 */

const DARK = '#0B0C10';
const WHITE: [string, string, string] = ['#F4F4F2', '#C9CACC', '#E0E1E2'];
const CYAN = '#3CE0FF';
const MAGENTA = '#FF4FB8';

const TOWERS = Array.from({ length: 30 }, (_, k) => ({ gx: k % 6, gy: Math.floor(k / 6), h: 30 + noise(k, 3) * 200, data: noise(k, 7) }));

function Model({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120, 480);
  const sweep = ((c.frame % 150) / 150) * 1400 - 200;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #20232B, ${DARK})` }}>
      {svgFrame(
        <g>
          {/* The plinth. */}
          {block(540, 1080, 520, 520, 60, ['#2A2D34', '#16181D', '#1F2228'])}
          {[...TOWERS]
            .sort((a, b) => a.gx + a.gy - (b.gx + b.gy))
            .map((t, k) => {
              const x = 540 + (t.gx - t.gy) * 78;
              const y = 1080 - 60 + (t.gx + t.gy) * 45 - 520 * 0.5 + 40;
              const rise = smooth(u, 0.1 + (k % 6) * 0.05, 0.5 + (k % 6) * 0.05);
              const h = t.h * (0.4 + 0.6 * rise) * (1 + t.data * 0.6 * smooth(u, 0.6, 0.9));
              // Projected light: towers inside the sweep glow cyan, the tallest magenta.
              const lit = Math.abs(x - sweep) < 140;
              const col: [string, string, string] = t.data > 0.8 && u > 0.7 ? ['#FFD1EC', MAGENTA, '#FF8FD0'] : lit ? ['#CFF7FF', '#5FB7CC', '#9EE8F7'] : WHITE;
              return <g key={k}>{block(x, y, 62, 62, h, col)}</g>;
            })}
          {/* The projector's beam from the top. */}
          <polygon points={`540,0 ${sweep - 160},1200 ${sweep + 160},1200`} fill={CYAN} opacity={0.06} />
        </g>,
      )}
      {vignette(0.7, DARK)}
    </AbsoluteFill>
  );
}

export const projectionModel = defineStyle({
  id: 'projection-model',
  accent: CYAN,
  colors: [MAGENTA, '#F4F4F2'],
  entrance: 'fade',
  Scene: Model,
  caption: caption({ size: 88, glyph: 0.56, color: '#FFFFFF', emph: CYAN, weight: 600, glow: CYAN, shadow: '0 4px 18px rgba(0,0,0,0.8)', entrance: 'fade' }),
  hook: hook({ top: 0.08, entrance: 'fade', color: '#FFFFFF', size: 70, weight: 600, letter: 2, upper: true, shadow: `0 0 30px ${CYAN}` }),
  card: card({ bg: 'rgba(11,12,16,0.8)', border: `1px solid ${CYAN}`, radius: 4, blur: 8 }),
  title: text({ color: '#FFFFFF', weight: 600, upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#B9C2CC' }),
  number: text({ color: CYAN, weight: 600, glow: CYAN }),
  slam: text({ color: '#fff', weight: 600, upper: true, glow: MAGENTA }),
  Marker: markerDash(CYAN, 40, 6),
  Ring: ringCircle(CYAN, 4, { glow: true }),
  stage: { shape: 'square', fill: ['#20232B', DARK], ring: CYAN, ringWidth: 3, glow: CYAN },
  transition: trScan({ color: CYAN, dim: 0.5 }),
  sample: { type: 'counter', text: '8.1B', subtext: 'people on Earth' },
});
