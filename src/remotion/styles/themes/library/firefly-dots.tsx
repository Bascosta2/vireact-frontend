import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { noise, type Ctx } from '../../theme';

/**
 * Firefly Dots: thousands of soft, breathing points of light on black make up the whole world: a moon,
 * a deer, grass, drifting fireflies. Points are never created or destroyed, they breathe and drift; the
 * picture is made of light alone.
 */

const WARM = '#FFE7A3';
const COOL = '#A8E8FF';

/** Points sampled on simple shapes (seeded): the moon, a deer, the grass line. */
const MOON = Array.from({ length: 140 }, (_, k) => {
  const a = noise(k, 1) * Math.PI * 2;
  const r = Math.sqrt(noise(k, 2)) * 120;
  return [780 + Math.cos(a) * r, 420 + Math.sin(a) * r] as [number, number];
});
const DEER_PATH: [number, number][] = [[300, 1080], [330, 960], [420, 940], [560, 950], [620, 900], [640, 820], [680, 800], [700, 830], [660, 900], [640, 980], [620, 1080], [590, 1080], [580, 1000], [420, 1000], [400, 1080], [370, 1080], [360, 1000], [330, 1080]];
const DEER = Array.from({ length: 220 }, (_, k) => {
  const i = Math.floor(noise(k, 3) * (DEER_PATH.length - 1));
  const t = noise(k, 4);
  const [a, b] = [DEER_PATH[i], DEER_PATH[i + 1]];
  return [a[0] + (b[0] - a[0]) * t + (noise(k, 5) - 0.5) * 14, a[1] + (b[1] - a[1]) * t + (noise(k, 6) - 0.5) * 14] as [number, number];
});
const GRASS = Array.from({ length: 260 }, (_, k) => [noise(k, 7) * 1080, 1120 + noise(k, 8) * 300 - Math.abs(Math.sin(k)) * 40] as [number, number]);

function Field({ c }: { c: Ctx }) {
  const breathe = (k: number) => 0.4 + 0.6 * Math.abs(Math.sin(c.frame / (25 + noise(k, 9) * 30) + k));
  const dot = (p: [number, number], k: number, col: string, r: number, dx = 0, dy = 0) => <circle key={k} cx={p[0] + dx} cy={p[1] + dy} r={r} fill={col} opacity={breathe(k)} />;
  return (
    <AbsoluteFill style={{ background: '#020306' }}>
      {svgFrame(
        <g style={{ filter: 'drop-shadow(0 0 4px rgba(255,231,163,0.9))' }}>
          {MOON.map((p, k) => dot(p, k, '#FFF6D8', 3.2))}
          {DEER.map((p, k) => dot(p, k + 500, WARM, 3.6, Math.sin(c.frame / 60) * 4))}
          {GRASS.map((p, k) => dot(p, k + 1000, k % 3 ? '#C8F2A0' : COOL, 2.6, Math.sin(c.frame / 30 + p[0] / 100) * 6))}
          {Array.from({ length: 30 }, (_, k) => dot([noise(k, 11) * 1080 + Math.sin(c.frame / 40 + k) * 40, 600 + noise(k, 12) * 700 + Math.cos(c.frame / 50 + k) * 30], k + 2000, WARM, 4.5))}
        </g>,
      )}
    </AbsoluteFill>
  );
}

export const fireflyDots = defineStyle({
  id: 'firefly-dots',
  accent: WARM,
  colors: [COOL, '#C8F2A0'],
  entrance: 'fade',
  Scene: Field,
  caption: caption({ size: 86, glyph: 0.52, color: '#FFF6D8', emph: WARM, weight: 300, letter: 2, glow: WARM, shadow: `0 0 16px ${WARM}`, entrance: 'fade' }),
  hook: hook({ top: 0.09, entrance: 'fade', color: '#FFF6D8', size: 70, weight: 300, letter: 4, shadow: `0 0 26px ${WARM}` }),
  card: card({ bg: 'rgba(2,3,6,0.7)', border: `1px solid ${WARM}66`, radius: 30 }),
  title: text({ color: '#FFF6D8', weight: 300, letter: 2, glow: WARM }),
  body: text({ font: 'body', color: '#D9E9F0' }),
  number: text({ color: WARM, weight: 300, glow: WARM }),
  slam: text({ color: '#FFF6D8', weight: 300, letter: 8, glow: WARM }),
  Marker: markerDot([WARM, COOL], 14),
  Ring: ringCircle(WARM, 3, { glow: true, dash: '2 10' }),
  stage: { shape: 'circle', fill: ['#14130A', '#020306'], ring: WARM, ringWidth: 2, glow: WARM },
  transition: trIris({ color: '#020306' }),
  sample: { type: 'headline', text: 'The night the deer came', subtext: '' },
});
