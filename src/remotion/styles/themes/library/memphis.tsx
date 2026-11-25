import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Memphis Diorama: a place built as a tabletop model. On warm white paper an organic grainy frame grows
 * open, and inside it a small world in flat Memphis colours: squiggles, confetti, pastel blocks, a
 * striped tower and a palm, outlined in ink, everything springing up with a playful bounce.
 */

const INK = '#1C1C1C';
const PINK = '#FF8FB1';
const MINT = '#7ED9C3';
const YELLOW = '#FFD447';
const BLUE = '#5B7CFA';
const PAPER = '#FBF7F0';

function Model({ c }: { c: Ctx }) {
  const up = (k: number) => spring({ frame: (c.frame % 450) - k * 5, fps: c.fps, config: { damping: 9, stiffness: 160 } });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
          {/* The organic frame. */}
          <path d="M 120 400 C 80 200 400 140 540 220 C 700 120 1000 220 960 460 C 1060 700 1000 1300 940 1460 C 860 1660 300 1680 160 1480 C 60 1300 160 700 120 400 Z" fill="#F4EEE2" strokeWidth={8} />
          {/* Ground and blocks. */}
          <g transform={`translate(0 ${(1 - up(0)) * 80})`}>
            <rect x={200} y={1120} width={680} height={160} rx={20} fill={MINT} />
          </g>
          <g transform={`translate(260 ${1120 - 260 * up(1)}) scale(1 ${up(1)})`}>
            <rect width={160} height={260} fill={PINK} />
            {[0, 1, 2, 3].map((k) => <line key={k} x1={0} y1={40 + k * 60} x2={160} y2={40 + k * 60} />)}
          </g>
          <g transform={`translate(470 ${1120 - 420 * up(2)})`}>
            <rect width={130} height={420} fill={YELLOW} />
            <circle cx={65} cy={-40} r={50} fill={BLUE} />
          </g>
          <g transform={`translate(660 1120) scale(${up(3)})`}>
            <path d="M 0 0 V -260" strokeWidth={14} />
            {[-60, -20, 20, 60].map((a) => <path key={a} d="M 0 -260 Q 60 -300 120 -250" fill="none" strokeWidth={10} transform={`rotate(${a * 1.8} 0 -260)`} />)}
          </g>
          {/* Squiggles and confetti. */}
          <path d={`M 220 520 q 40 -40 80 0 t 80 0 t 80 0`} fill="none" stroke={BLUE} strokeWidth={12} transform={`translate(0 ${Math.sin(c.frame / 20) * 8})`} />
          {[[760, 480, PINK], [820, 760, YELLOW], [240, 860, BLUE], [880, 1000, PINK]].map(([x, y, col], k) => (
            <rect key={k} x={x as number} y={y as number} width={40} height={40} fill={col as string} transform={`rotate(${c.frame * 2 + k * 40} ${(x as number) + 20} ${(y as number) + 20})`} />
          ))}
          {[[300, 640], [640, 600], [500, 1400]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={14} fill={INK} />)}
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.25, freq: 0.7 })}
    </AbsoluteFill>
  );
}

export const memphis = defineStyle({
  id: 'memphis',
  accent: BLUE,
  colors: [PINK, YELLOW],
  entrance: 'bounce',
  Scene: Model,
  caption: caption({ size: 92, glyph: 0.52, color: INK, emph: BLUE, bg: YELLOW, pad: '4px 24px', boxExtra: { border: `5px solid ${INK}`, boxShadow: `8px 8px 0 ${PINK}` }, entrance: 'bounce' }),
  hook: hook({ top: 0.035, entrance: 'bounce', color: INK, size: 70, bg: MINT, border: `5px solid ${INK}`, radius: 40, boxShadow: `8px 8px 0 ${INK}` }),
  card: card({ bg: '#FFFFFF', border: `5px solid ${INK}`, radius: 24, shadow: `10px 10px 0 ${PINK}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#3A3A3A' }),
  number: text({ color: BLUE, stroke: [8, INK], shadow: `8px 8px 0 ${YELLOW}` }),
  slam: text({ color: PINK, stroke: [10, INK], shadow: `8px 8px 0 ${INK}` }),
  Marker: markerDot([PINK, MINT, YELLOW, BLUE], 34, `5px solid ${INK}`),
  Ring: ringCircle(BLUE, 10, { under: [18, INK] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#F4EEE2'], ring: INK, ringWidth: 7 },
  transition: trWipe({ color: PINK, dir: 'left', angle: 6, content: () => <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${INK} 6px, transparent 7px)`, backgroundSize: '60px 60px' }} /> }),
  sample: { type: 'pill', text: 'Welcome to town' },
});
