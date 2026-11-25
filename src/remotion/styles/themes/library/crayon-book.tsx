import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trTear } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { roughFilter } from '../../painted';
import { noise, type Ctx } from '../../theme';

/**
 * Crayon Book: a picture-book page drawn live in wax crayon on toothy paper, redrawn by a child's hand
 * twelve times a second, with a watercolour wash sweeping in underneath to reveal the colour the crayon
 * was hiding. A house, a sun, a big tree, a dog and a kite.
 */

const PAPER = '#FBF7EC';

function Page({ c }: { c: Ctx }) {
  const f = Math.floor(c.frame / 2.5);
  const j = (k: number) => (noise(f, k) - 0.5) * 6;
  const wash = Math.min(1, (c.frame % 360) / 90);
  const kite = Math.sin(c.frame / 30) * 30;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {/* The watercolour wash reveals itself from left to right. */}
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - wash * 100}% 0 0)` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '58%', background: 'linear-gradient(#9FD0F0, #CFE8F7)', opacity: 0.7 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%', background: '#A7D88A', opacity: 0.7 }} />
      </div>
      {svgFrame(
        <g>
          <defs>{roughFilter('crayon', { scale: 5, freq: 0.06, seed: f % 5 })}</defs>
          <g filter="url(#crayon)" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth={14}>
            <circle cx={840 + j(1)} cy={290 + j(2)} r={110} stroke="#FFB703" />
            {Array.from({ length: 8 }, (_, k) => <line key={k} x1={840 + Math.cos(k * 0.8) * 140} y1={290 + Math.sin(k * 0.8) * 140} x2={840 + Math.cos(k * 0.8) * 200} y2={290 + Math.sin(k * 0.8) * 200} stroke="#FFB703" />)}
            <path d={`M ${200 + j(3)} 1120 V 860 L 360 720 L 520 860 V 1120 Z`} stroke="#E63946" />
            <path d="M 320 1120 V 1000 H 400 V 1120" stroke="#6B3A1E" />
            <path d="M 0 1120 H 1080" stroke="#3E8A3A" />
            <path d={`M 800 1120 V 860 M 800 860 m -150 0 a 150 130 0 1 0 300 0 a 150 130 0 1 0 -300 0`} stroke="#2E7D32" />
            {/* The dog. */}
            <path d={`M 560 1110 h 140 v -60 h -140 z M 700 1050 l 40 -40 l 20 50 M 580 1110 v 30 M 680 1110 v 30 M 560 1060 l -30 -30`} stroke="#8D5524" />
            {/* The kite on its string. */}
            <path d={`M ${300 + kite} 360 l 60 80 l -60 80 l -60 -80 z M ${300 + kite} 520 Q 450 800 640 1050`} stroke="#3A86FF" strokeWidth={10} />
          </g>
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.4, freq: 0.6, seed: f % 3 })}
    </AbsoluteFill>
  );
}

export const crayonBook = defineStyle({
  id: 'crayon-book',
  accent: '#E63946',
  colors: ['#3A86FF', '#FFB703'],
  entrance: 'bounce',
  step: 2,
  Scene: Page,
  caption: caption({ size: 98, glyph: 0.48, color: '#3A2A1A', emph: '#E63946', bg: 'rgba(251,247,236,0.92)', pad: '2px 22px', radius: 20, entrance: 'bounce' }),
  hook: hook({ top: 0.07, entrance: 'bounce', color: '#3A86FF', size: 86, stroke: [4, '#1D4E9E'], shadow: '4px 4px 0 #FFD36E' }),
  card: card({ bg: PAPER, border: '6px solid #3A86FF', radius: 26, extra: { borderStyle: 'dashed' } }),
  title: text({ color: '#3A2A1A' }),
  body: text({ font: 'body', color: '#5A4A3A' }),
  number: text({ color: '#E63946', stroke: [8, PAPER] }),
  slam: text({ color: '#FFB703', stroke: [10, '#3A2A1A'] }),
  Marker: markerScribble('#E63946'),
  Ring: ringScribble('#3A86FF', 12, 23),
  stage: { shape: 'circle', fill: [PAPER, '#F2EBD8'], ring: '#E63946', ringWidth: 8 },
  transition: trTear({ paper: PAPER }),
  sample: { type: 'pill', text: 'The best day ever' },
});
