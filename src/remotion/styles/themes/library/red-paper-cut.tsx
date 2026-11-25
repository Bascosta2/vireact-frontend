import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Red Paper-Cut: window-flower paper-cuts brought to life. Jointed red cut-outs on cream paper where the
 * cut is the drawing and the holes are where the light comes through: a carp leaping over waves, lotus
 * flowers, cloud scrolls and a round lattice frame; pieces hinge and swing on their joints.
 */

const RED = '#C8102E';
const PAPER = '#F7EBD6';

function Cut({ c }: { c: Ctx }) {
  const leap = Math.sin(c.frame / 30);
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g fill={RED}>
          {/* The round lattice frame (a ring with cut-outs). */}
          <circle cx={540} cy={860} r={420} fill="none" stroke={RED} strokeWidth={40} />
          {Array.from({ length: 24 }, (_, k) => (
            <circle key={k} cx={540 + Math.cos((k / 24) * Math.PI * 2) * 420} cy={860 + Math.sin((k / 24) * Math.PI * 2) * 420} r={9} fill={PAPER} />
          ))}
          {/* Waves: scalloped bands with holes. */}
          {[0, 1, 2].map((k) => (
            <path key={k} d={Array.from({ length: 9 }, (_, i) => `${i ? '' : `M ${170 + k * 20} ${1120 + k * 50}`} q 45 -60 90 0`).join(' ') + ` V ${1180 + k * 50} H ${170 + k * 20} Z`} />
          ))}
          {/* The carp, hinged at the tail, leaping. */}
          <g transform={`translate(540 ${820 - leap * 60}) rotate(${-20 + leap * 12})`}>
            <path d="M -170 0 C -120 -90 80 -100 150 -10 C 80 70 -120 70 -170 0 Z" />
            <circle cx={100} cy={-20} r={14} fill={PAPER} />
            {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${-90 + i * 40} -20 q 16 20 0 40`} stroke={PAPER} strokeWidth={6} fill="none" />)}
            <g transform={`translate(-170 0) rotate(${Math.sin(c.frame / 6) * 18})`}>
              <path d="M 0 0 L -100 -70 Q -80 0 -100 70 Z" />
              <path d="M -30 0 L -80 -36 M -30 0 L -80 36" stroke={PAPER} strokeWidth={6} />
            </g>
          </g>
          {/* Lotus flowers and cloud scrolls. */}
          {[[300, 1320], [780, 1320]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y}) rotate(${Math.sin(c.frame / 40 + k) * 4})`}>
              {[-60, -30, 0, 30, 60].map((a) => <path key={a} d="M 0 0 Q -30 -60 0 -110 Q 30 -60 0 0 Z" transform={`rotate(${a})`} />)}
              <circle cy={-10} r={16} fill={PAPER} />
            </g>
          ))}
          {[[220, 380], [860, 340]].map(([x, y], k) => (
            <path key={k} d={`M ${x - 90} ${y} a 40 40 0 0 1 80 -20 a 40 40 0 0 1 80 20 h -160 z M ${x - 40} ${y - 10} a 14 14 0 1 1 1 0`} transform={`translate(${Math.sin(c.frame / 50 + k) * 12} 0)`} />
          ))}
        </g>,
      )}
      {grain({ color: '#8A5A3A', alpha: 0.25, freq: 0.7 })}
    </AbsoluteFill>
  );
}

export const redPaperCut = defineStyle({
  id: 'red-paper-cut',
  accent: RED,
  colors: ['#E8B04A', '#8E0B1F'],
  entrance: 'pop',
  Scene: Cut,
  caption: caption({ size: 92, glyph: 0.5, color: PAPER, emph: '#FFD27A', bg: RED, pad: '4px 26px', radius: 10, entrance: 'pop' }),
  hook: hook({ top: 0.08, color: RED, size: 78, bg: PAPER, border: `6px solid ${RED}`, radius: 12, pad: '12px 30px' }),
  card: card({ bg: PAPER, border: `6px solid ${RED}`, radius: 12 }),
  title: text({ color: RED }),
  body: text({ font: 'body', color: '#7A1A1A' }),
  number: text({ color: RED, stroke: [6, PAPER] }),
  slam: text({ color: PAPER, extra: { background: RED, padding: '0 28px', borderRadius: 12 } }),
  Marker: markerDot([RED, '#E8B04A'], 30),
  Ring: ringCircle(RED, 10, { dash: '2 12' }),
  stage: { shape: 'circle', fill: [PAPER, '#EEDCBE'], ring: RED, ringWidth: 12 },
  transition: trWipe({ color: RED, dir: 'right', content: () => <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${PAPER} 10px, transparent 11px)`, backgroundSize: '70px 70px' }} /> }),
  sample: { type: 'headline', text: 'The carp that leapt', subtext: '' },
});
