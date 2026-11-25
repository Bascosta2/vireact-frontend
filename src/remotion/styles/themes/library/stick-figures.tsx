import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trTear } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain, linedPaper } from '../../kit/textures';
import { smooth } from '../../painted';
import { noise, type Ctx } from '../../theme';

/**
 * Stick Figures: plain stick people on lined notebook paper, one red accent, lines that boil a little
 * (redrawn every few frames). They stand on a line, wave, jump and point; one of them is red.
 */

const PAPER = '#FDFCF7';
const INK = '#1B1B1F';
const RED = '#E63946';

/** A stick figure at (x, y feet), pose 0 stand, 1 wave, 2 jump, 3 point; `b` boils the line. */
function figure(x: number, y: number, pose: number, frame: number, color: string, b: number) {
  const j = (k: number) => (noise(b * 13 + k, 2) - 0.5) * 3;
  const jump = pose === 2 ? Math.abs(Math.sin(frame / 7)) * 60 : 0;
  const yy = y - jump;
  const wave = Math.sin(frame / 5) * 30;
  const arms = pose === 1 ? `M ${x} ${yy - 120} L ${x + 50 + j(1)} ${yy - 170 + wave * 0.6} M ${x} ${yy - 120} L ${x - 45} ${yy - 80}` : pose === 3 ? `M ${x} ${yy - 120} L ${x + 85} ${yy - 130 + j(2)} M ${x} ${yy - 120} L ${x - 40} ${yy - 80}` : pose === 2 ? `M ${x} ${yy - 120} L ${x - 55} ${yy - 175} M ${x} ${yy - 120} L ${x + 55} ${yy - 175}` : `M ${x} ${yy - 120} L ${x - 40} ${yy - 75 + j(3)} M ${x} ${yy - 120} L ${x + 40} ${yy - 75}`;
  return (
    <g stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={x + j(4)} cy={yy - 175} r={32} />
      <path d={`M ${x} ${yy - 143} L ${x + j(5)} ${yy - 60} M ${x} ${yy - 60} L ${x - 35 + j(6)} ${yy} M ${x} ${yy - 60} L ${x + 35} ${yy + j(7)} ${arms}`} />
    </g>
  );
}

function Notebook({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 60);
  const b = Math.floor(c.frame / 4);
  const f = c.fonts.display;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {linedPaper({ line: '#B8D4EE', margin: '#F08A8A', gap: 70, left: 120 })}
      {svgFrame(
        <g>
          {/* The "system line" they stand on. */}
          <path d={`M 160 1060 Q 540 ${1050 + (noise(b, 1) - 0.5) * 6} 980 1060`} stroke={INK} strokeWidth={5} fill="none" opacity={smooth(u, 0, 0.3)} />
          <g opacity={smooth(u, 0.2, 0.5)}>
            {figure(280, 1060, 1, c.frame, INK, b)}
            {figure(520, 1060, 2, c.frame, RED, b + 1)}
            {figure(760, 1060, 3, c.frame, INK, b + 2)}
          </g>
          {/* Speech marks and a scribbled note. */}
          <g opacity={smooth(u, 0.6, 0.9)}>
            <path d="M 600 780 q 120 -60 230 -10 q 30 70 -60 90 l -40 40 l 0 -42 q -110 -8 -130 -78 z" fill="#fff" stroke={INK} strokeWidth={5} />
            {label(715, 830, 'later!', { size: 52, fill: RED, font: f })}
            <path d="M 260 760 q -10 -60 50 -80 M 300 690 l 10 -10" stroke={INK} strokeWidth={4} fill="none" />
            {label(250, 670, 'me', { size: 44, fill: INK, font: f })}
          </g>
        </g>,
      )}
      {grain({ color: '#7A7360', alpha: 0.14, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const stickFigures = defineStyle({
  id: 'stick-figures',
  accent: RED,
  colors: [INK, '#B8D4EE'],
  entrance: 'pop',
  step: 2,
  Scene: Notebook,
  pip: pipAt({ border: `5px solid ${INK}`, background: '#fff', boxShadow: '6px 8px 0 rgba(0,0,0,0.15)' }, 'rect', { rotate: 2, radius: 4 }),
  caption: caption({ size: 100, glyph: 0.44, color: INK, emph: RED, bg: 'rgba(253,252,247,0.95)', pad: '4px 22px', radius: 10, boxExtra: { border: `4px solid ${INK}` }, entrance: 'pop' }),
  hook: hook({ top: 0.08, color: INK, size: 80, bg: '#FFFFFF', pad: '10px 30px', rotate: -2, border: `5px solid ${INK}`, radius: 12, Decor: ({ t }) => <div style={{ position: 'absolute', inset: -18, border: `5px solid ${RED}`, borderRadius: '50%', opacity: t, transform: 'rotate(-3deg)' }} /> }),
  card: card({ bg: '#FFFFFF', border: `5px solid ${INK}`, radius: 10, shadow: '6px 8px 0 rgba(0,0,0,0.12)', extra: { transform: 'rotate(-1deg)' } }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#25252A' }),
  number: text({ color: RED, stroke: [6, '#fff'] }),
  slam: text({ color: RED, stroke: [8, '#fff'] }),
  Marker: markerScribble(RED),
  Ring: ringScribble(RED, 7, 6),
  stage: { shape: 'square', fill: ['#FFFFFF', PAPER], ring: INK, ringWidth: 5 },
  transition: trTear({ paper: PAPER }),
  sample: { type: 'slam', text: 'LATER!' },
});
