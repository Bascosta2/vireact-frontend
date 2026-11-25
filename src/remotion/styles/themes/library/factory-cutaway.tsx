import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerNum, ringCircle, text, trShutter } from '../../kit/presets';
import { label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';
import { gearPath } from '../../../visuals/kit';

/**
 * Factory Cutaway: a process explained as a building cut open in elevation, room by room like a doll's
 * house. Conveyors run, gears turn, pipes carry, and small crates travel from room to room on a loop.
 */

const WALL = '#2B2D42';
const ROOM = ['#F2E8CF', '#E9F1F7', '#FDE2D7', '#E6F4EA'];
const ORANGE = '#FF5A36';
const STEEL = '#8D99AE';
const INK = '#14151F';

/** The rooms: x, y, w, h and what is in them. */
const ROOMS = [
  { x: 90, y: 420, w: 430, h: 330, name: 'INTAKE' },
  { x: 560, y: 420, w: 430, h: 330, name: 'SORT' },
  { x: 90, y: 790, w: 430, h: 330, name: 'PROCESS' },
  { x: 560, y: 790, w: 430, h: 330, name: 'SHIP' },
];

function Factory({ c }: { c: Ctx }) {
  const belt = (c.frame * 4) % 60;
  // A crate's route: across the top floor, down the shaft, across the bottom floor (6 s loop).
  const t = (c.frame % 180) / 180;
  const crate = t < 0.45 ? { x: 120 + (t / 0.45) * 800, y: 690 } : t < 0.55 ? { x: 920, y: 690 + ((t - 0.45) / 0.1) * 370 } : { x: 920 - ((t - 0.55) / 0.45) * 800, y: 1060 };
  return (
    <AbsoluteFill style={{ background: '#C9D6DF' }}>
      {svgFrame(
        <g>
          {/* The building: roof, walls and the cut face. */}
          <polygon points="60,400 540,230 1020,400" fill={WALL} />
          <rect x={60} y={400} width={960} height={750} fill={WALL} />
          <rect x={60} y={1150} width={960} height={60} fill="#4A4E69" />
          {ROOMS.map((r, k) => (
            <g key={r.name}>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={ROOM[k]} />
              {label(r.x + 20, r.y + 44, r.name, { size: 30, fill: INK, font: c.fonts.display, anchor: 'start', weight: 800 })}
              {/* A conveyor along the floor of each room. */}
              <rect x={r.x + 20} y={r.y + r.h - 40} width={r.w - 40} height={22} rx={11} fill={STEEL} />
              <line x1={r.x + 30} y1={r.y + r.h - 29} x2={r.x + r.w - 30} y2={r.y + r.h - 29} stroke={INK} strokeWidth={3} strokeDasharray="20 40" strokeDashoffset={-belt} />
            </g>
          ))}
          {/* Machines: gears, a press, pipes. */}
          <g transform={`translate(300 600) rotate(${c.frame * 2})`}>
            <path d={gearPath(12, 70, 56)} fill={STEEL} stroke={INK} strokeWidth={4} />
            <circle r={18} fill={INK} />
          </g>
          <g transform={`translate(400 560) rotate(${-c.frame * 2.4})`}>
            <path d={gearPath(9, 46, 36)} fill={ORANGE} stroke={INK} strokeWidth={4} />
          </g>
          <rect x={720} y={480 + Math.abs(Math.sin(c.frame / 8)) * 120} width={110} height={40} fill={ORANGE} stroke={INK} strokeWidth={4} />
          <rect x={765} y={440} width={20} height={40 + Math.abs(Math.sin(c.frame / 8)) * 120} fill={STEEL} />
          <path d="M 120 880 H 260 V 980 H 460" fill="none" stroke={STEEL} strokeWidth={22} />
          <path d="M 120 880 H 260 V 980 H 460" fill="none" stroke="#5FA8D3" strokeWidth={10} strokeDasharray="16 22" strokeDashoffset={-c.frame * 3} />
          {/* The crate. */}
          <g transform={`translate(${crate.x} ${crate.y - 60})`}>
            <rect x={-30} y={0} width={60} height={50} fill="#D4A373" stroke={INK} strokeWidth={4} />
            <path d="M -30 0 L 30 50 M 30 0 L -30 50" stroke={INK} strokeWidth={2} opacity={0.5} />
          </g>
          {label(540, 360, 'FACTORY 01', { size: 34, fill: '#fff', font: c.fonts.display, weight: 800 })}
        </g>,
      )}
      {grain({ color: '#000', alpha: 0.1, freq: 0.8 })}
    </AbsoluteFill>
  );
}

export const factoryCutaway = defineStyle({
  id: 'factory-cutaway',
  accent: ORANGE,
  colors: [STEEL, '#5FA8D3'],
  entrance: 'pop',
  Scene: Factory,
  pip: pipAt({ border: `8px solid ${WALL}`, boxShadow: `0 0 0 4px ${ORANGE}` }, 'rect', { radius: 12, y: 1250, h: 360 }),
  caption: caption({ size: 92, glyph: 0.5, color: '#FFFFFF', emph: ORANGE, upper: true, weight: 800, bg: WALL, pad: '6px 24px', radius: 8, entrance: 'pop' }),
  hook: hook({ top: 0.065, color: '#FFFFFF', size: 66, upper: true, weight: 800, bg: ORANGE, border: `5px solid ${INK}`, radius: 8, boxShadow: `8px 8px 0 ${INK}` }),
  card: card({ bg: '#F7F3E8', border: `5px solid ${INK}`, radius: 10, shadow: `8px 8px 0 ${INK}` }),
  title: text({ color: INK, upper: true, weight: 800 }),
  body: text({ font: 'body', color: '#33354A', weight: 500 }),
  number: text({ color: ORANGE, weight: 800, stroke: [8, INK] }),
  slam: text({ color: '#fff', weight: 800, upper: true, stroke: [12, INK] }),
  Marker: markerNum({ bg: ORANGE, fg: '#fff', shape: 'square', border: `4px solid ${INK}` }),
  Ring: ringCircle(ORANGE, 9, { under: [17, INK] }),
  stage: { shape: 'square', fill: ['#F2E8CF', '#E0D6BD'], ring: INK, ringWidth: 6 },
  transition: trShutter({ color: WALL }),
  sample: { type: 'list', text: 'Inside your gut', items: ['Break down', 'Absorb', 'Send out'] },
});
