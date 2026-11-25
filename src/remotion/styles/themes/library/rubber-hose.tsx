import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { filmDamage, grain, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Rubber Hose: black-and-white hand-inked 1930s cartoon where everything is alive and swings to a hot
 * jazz beat: smiling clouds, a bouncing house, trees with arms, a grinning sun; film grain and flicker,
 * a round iris at each cut. An original world, no existing character.
 */

const INK = '#111111';
const PAPER = '#F2EDE1';

function Swing({ c }: { c: Ctx }) {
  const beat = Math.sin(c.frame / 6);
  const sq = 1 + 0.06 * beat;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round">
          {/* The sun, grinning and swaying. */}
          <g transform={`translate(800 330) rotate(${beat * 8})`}>
            {Array.from({ length: 12 }, (_, k) => (
              <path key={k} d="M 0 -120 Q 14 -150 0 -180" fill="none" transform={`rotate(${k * 30})`} />
            ))}
            <circle r={100} fill="#fff" />
            <ellipse cx={-30} cy={-20} rx={12} ry={22} fill={INK} />
            <ellipse cx={30} cy={-20} rx={12} ry={22} fill={INK} />
            <path d="M -50 30 Q 0 80 50 30" fill={INK} />
          </g>
          {/* A cloud with a face. */}
          <g transform={`translate(${250 + beat * 12} 420)`}>
            <path d="M -130 40 a 50 50 0 0 1 40 -80 a 70 70 0 0 1 130 -10 a 50 50 0 0 1 60 90 z" fill="#fff" />
            <circle cx={-20} cy={0} r={8} fill={INK} />
            <circle cx={30} cy={0} r={8} fill={INK} />
          </g>
          {/* Ground, a bouncing house with a face and a tree with arms. */}
          <path d="M -20 1400 Q 540 1340 1100 1400 V 1920 H -20 Z" fill="#fff" />
          <g transform={`translate(380 1380) scale(${1 / sq} ${sq})`}>
            <path d="M -150 0 V -260 L 0 -400 L 150 -260 V 0 Z" fill="#fff" />
            <rect x={-90} y={-220} width={60} height={70} fill={INK} />
            <rect x={30} y={-220} width={60} height={70} fill={INK} />
            <path d="M -60 -90 Q 0 -20 60 -90" fill="#fff" />
            <rect x={-30} y={-80} width={60} height={80} fill="#fff" />
          </g>
          <g transform={`translate(800 1390) rotate(${beat * 5})`} style={{ transformOrigin: '0 0' }}>
            <path d="M -20 0 C -30 -120 -10 -200 -40 -300 M 20 0 C 30 -120 10 -200 40 -300" fill="none" />
            <path d={`M -30 -220 Q -120 ${-260 + beat * 40} -150 -200 M 30 -220 Q 120 ${-260 - beat * 40} 150 -200`} fill="none" />
            <circle cx={0} cy={-360} r={110} fill="#fff" />
            <circle cx={-34} cy={-370} r={10} fill={INK} />
            <circle cx={34} cy={-370} r={10} fill={INK} />
          </g>
          {/* Music notes floating up on the beat. */}
          {[0, 1, 2].map((k) => {
            const t = ((c.frame + k * 25) % 75) / 75;
            return (
              <g key={k} transform={`translate(${560 + k * 60 + Math.sin(t * 8) * 20} ${1100 - t * 400})`} opacity={1 - t} stroke="none" fill={INK}>
                <ellipse cx={0} cy={0} rx={16} ry={12} transform="rotate(-20)" />
                <rect x={12} y={-60} width={6} height={60} />
                <path d="M 18 -60 q 26 10 20 34 q -6 -18 -20 -18 z" />
              </g>
            );
          })}
        </g>,
      )}
      {filmDamage(c.frame, { step: 2, scratches: 2, dust: 14, flicker: 0.1 })}
      {grain({ color: '#000', alpha: 0.35, frame: c.frame })}
      {vignette(0.6, '#000', 50)}
    </AbsoluteFill>
  );
}

export const rubberHose = defineStyle({
  id: 'rubber-hose',
  accent: '#FFFFFF',
  colors: [INK, PAPER],
  entrance: 'bounce',
  step: 2,
  Scene: Swing,
  caption: caption({ size: 94, glyph: 0.5, color: '#FFFFFF', emph: '#FFFFFF', stroke: [12, INK], shadow: `0 6px 0 ${INK}`, entrance: 'bounce' }),
  hook: hook({ top: 0.08, entrance: 'bounce', color: INK, size: 78, bg: '#FFFFFF', border: `8px solid ${INK}`, radius: 60, pad: '16px 40px' }),
  card: card({ bg: '#FFFFFF', border: `7px solid ${INK}`, radius: 40 }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#333' }),
  number: text({ color: '#FFFFFF', stroke: [12, INK] }),
  slam: text({ color: '#FFFFFF', stroke: [14, INK], shadow: `0 10px 0 ${INK}` }),
  Marker: markerDot([INK], 30),
  Ring: ringCircle(INK, 10),
  stage: { shape: 'circle', fill: ['#FFFFFF', PAPER], ring: INK, ringWidth: 8 },
  transition: trIris({ color: '#000' }),
  sample: { type: 'slam', text: 'HOT DOG!' },
});
