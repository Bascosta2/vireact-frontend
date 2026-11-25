import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trFlash } from '../../kit/presets';
import { stars, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Cel Anime: hand-painted cel animation from the 80s and 90s OVA era, re-created in code (an original
 * scene). An airbrushed dusk sky, a neon city on the horizon with backlit windows, diagonal rain, a
 * two-tone cel rocket shaking on a jagged flame, film grain; a yellow subtitle line.
 */

const DUSK = ['#0B1E4A', '#3B2E7E', '#C94F7C', '#FF9E6E'];
const NEON = '#FF4FB8';
const CYAN = '#4FE3FF';

function Dusk({ c }: { c: Ctx }) {
  const shake = (k: number) => (noise(c.frame, k) - 0.5) * 6;
  const lift = Math.min(1, (c.frame % 300) / 260);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${DUSK.join(', ')})` }}>
      {svgFrame(
        <g>
          {stars(c.frame, { n: 70, seed: 41, bottom: 700, size: 2.6 })}
          {/* City silhouettes with backlit windows. */}
          {Array.from({ length: 14 }, (_, k) => {
            const w = 60 + noise(k, 1) * 80;
            const h = 180 + noise(k, 2) * 380;
            const x = k * 80 - 20;
            return (
              <g key={k}>
                <rect x={x} y={1500 - h} width={w} height={h + 420} fill={k % 2 ? '#1A1440' : '#241B55'} />
                {Array.from({ length: 6 }, (_, j) => (
                  <rect key={j} x={x + 10 + (j % 2) * 26} y={1500 - h + 20 + Math.floor(j / 2) * 50} width={14} height={20} fill={noise(k * 9 + j, 3) > 0.5 ? (k % 3 ? NEON : CYAN) : '#3A2E7E'} />
                ))}
              </g>
            );
          })}
          {/* The cel rocket: two tones, ink outline, a jagged flame. */}
          <g transform={`translate(${540 + shake(1)} ${1300 - lift * 900 + shake(2)})`} stroke="#120A20" strokeWidth={6} strokeLinejoin="round">
            <path d={`M -30 120 L 0 ${200 + noise(c.frame, 5) * 80} L 30 120 Z`} fill="#FFE14D" />
            <path d="M 0 -170 C 60 -110 60 40 46 120 H -46 C -60 40 -60 -110 0 -170 Z" fill="#F2F2F2" />
            <path d="M 0 -170 C 60 -110 60 40 46 120 H 6 C 20 40 24 -110 0 -170 Z" fill="#B9B9C8" stroke="none" />
            <path d="M 0 -170 C 30 -140 44 -110 50 -90 H -50 C -44 -110 -30 -140 0 -170 Z" fill="#E63946" />
            <circle cy={-20} r={24} fill="#3A86FF" />
            <path d="M -46 60 L -90 140 L -46 120 Z M 46 60 L 90 140 L 46 120 Z" fill="#E63946" />
          </g>
          {/* Diagonal rain. */}
          <g stroke="#CFE3FF" strokeWidth={2} opacity={0.5}>
            {Array.from({ length: 60 }, (_, k) => {
              const y = (noise(k, 7) * 2100 + c.frame * 60) % 2100 - 100;
              const x = noise(k, 8) * 1300 - 100 + y * 0.35;
              return <line key={k} x1={x} y1={y} x2={x - 24} y2={y - 70} />;
            })}
          </g>
        </g>,
      )}
      {grain({ color: '#000', alpha: 0.25, frame: c.frame })}
    </AbsoluteFill>
  );
}

export const celAnime = defineStyle({
  id: 'cel-anime',
  accent: '#FFE14D',
  colors: [NEON, CYAN],
  entrance: 'glide',
  Scene: Dusk,
  caption: caption({ size: 82, glyph: 0.5, color: '#FFE14D', emph: '#FFFFFF', weight: 700, italic: true, shadow: '0 0 2px #000, 3px 3px 0 #000', entrance: 'glide' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'glide', color: '#FFFFFF', size: 80, weight: 800, italic: true, shadow: `4px 4px 0 ${NEON}, -2px -2px 0 ${CYAN}` }),
  card: card({ bg: 'rgba(11,30,74,0.82)', border: `3px solid ${NEON}`, shadow: `0 0 24px ${NEON}88` }),
  title: text({ color: '#FFFFFF', weight: 800, italic: true }),
  body: text({ font: 'body', color: '#FFD9EE' }),
  number: text({ color: '#FFE14D', weight: 800, italic: true, shadow: `5px 5px 0 ${NEON}` }),
  slam: text({ color: '#FFFFFF', weight: 800, italic: true, shadow: `8px 8px 0 ${NEON}, -4px -4px 0 ${CYAN}` }),
  Marker: markerDot([NEON, CYAN, '#FFE14D'], 26),
  Ring: ringCircle(NEON, 6, { glow: true }),
  stage: { shape: 'circle', fill: ['#3B2E7E', '#0B1E4A'], ring: NEON, ringWidth: 5, glow: NEON },
  transition: trFlash({ color: '#FFFFFF', peak: 0.85, push: 1.1 }),
  sample: { type: 'headline', text: "Don't look back.", subtext: '' },
});
