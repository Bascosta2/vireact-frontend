import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { label, svgFrame } from '../../kit/scenery';
import { grain, gridPaper } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Crowd Sim: a crowd of tiny round characters running a simulation on a warm paper lab board. They
 * flock in swirling currents (closed-form flow, so every frame is exact), and a colour spreads from
 * one to the next by distance from the first; counters tick.
 */

const PAPER = '#F6EEDD';
const INK = '#2A2A33';
const RED = '#F25C54';
const BLUE = '#4D96FF';
const N = 150;
const LOOP = 360;

function Board({ c }: { c: Ctx }) {
  const t = c.frame / 30;
  const f = c.frame % LOOP;
  // Infection front: a radius that grows from the first character.
  const front = Math.max(0, (f - 30) * 3.2);
  const start = { x: 540, y: 760 };
  let infected = 0;
  const dots = Array.from({ length: N }, (_, k) => {
    const cx = 160 + noise(k, 1) * 760;
    const cy = 330 + noise(k, 2) * 900;
    const r = 30 + noise(k, 3) * 70;
    const sp = 0.6 + noise(k, 4);
    const x = cx + Math.cos(t * sp + k) * r + Math.sin(t * 0.4 + cy / 200) * 40;
    const y = cy + Math.sin(t * sp * 1.2 + k) * r * 0.7;
    const sick = Math.hypot(cx - start.x, cy - start.y) < front;
    if (sick) infected += 1;
    return { x, y, sick, k };
  });
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {gridPaper({ color: '#B9A98A', size: 54, major: 4, alpha: 0.18, majorAlpha: 0.3 })}
      {svgFrame(
        <g>
          <rect x={100} y={260} width={880} height={1020} rx={30} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="20 12" />
          {dots.map((d) => (
            <g key={d.k} transform={`translate(${d.x} ${d.y})`}>
              <circle r={16} fill={d.sick ? RED : BLUE} stroke={INK} strokeWidth={3} />
              <circle cx={-5} cy={-3} r={2.6} fill={INK} />
              <circle cx={5} cy={-3} r={2.6} fill={INK} />
            </g>
          ))}
          {/* Counters on the board. */}
          <g fontFamily={c.fonts.display} fontWeight={900}>
            <rect x={120} y={1310} width={400} height={90} rx={18} fill="#fff" stroke={INK} strokeWidth={4} />
            {label(320, 1370, `healthy ${N - infected}`, { size: 40, fill: BLUE, font: c.fonts.display, weight: 900 })}
            <rect x={560} y={1310} width={400} height={90} rx={18} fill="#fff" stroke={INK} strokeWidth={4} />
            {label(760, 1370, `shared ${infected}`, { size: 40, fill: RED, font: c.fonts.display, weight: 900 })}
          </g>
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.16, freq: 0.85 })}
    </AbsoluteFill>
  );
}

export const crowdSim = defineStyle({
  id: 'crowd-sim',
  accent: RED,
  colors: [BLUE, INK],
  entrance: 'bounce',
  Scene: Board,
  pip: pipAt({ border: `7px solid ${INK}`, boxShadow: `0 0 0 9px ${PAPER}` }, 'circle', { y: 1440, w: 300, h: 300, x: 720 }),
  caption: caption({ size: 90, glyph: 0.58, color: INK, emph: RED, weight: 900, bg: '#FFFFFF', pad: '8px 26px', radius: 40, boxExtra: { border: `5px solid ${INK}` }, entrance: 'bounce' }),
  hook: hook({ top: 0.06, color: INK, size: 64, weight: 900, bg: '#FFFFFF', radius: 30, border: `5px solid ${INK}`, entrance: 'bounce' }),
  card: card({ bg: '#FFFFFF', border: `5px solid ${INK}`, radius: 26 }),
  title: text({ color: INK, weight: 900 }),
  body: text({ font: 'body', color: '#44444F', weight: 600 }),
  number: text({ color: RED, weight: 900, stroke: [8, '#fff'] }),
  slam: text({ color: '#fff', weight: 900, stroke: [12, INK] }),
  Marker: markerDot([BLUE, RED], 34, `4px solid ${INK}`),
  Ring: ringCircle(RED, 8, { under: [16, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', PAPER], ring: INK, ringWidth: 6 },
  transition: trWipe({ color: BLUE, dir: 'left', before: 4, after: 8, content: () => <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${RED} 18px, transparent 19px)`, backgroundSize: '90px 90px' }} /> }),
  sample: { type: 'counter', text: '86%', subtext: 'shared it within a day' },
});
