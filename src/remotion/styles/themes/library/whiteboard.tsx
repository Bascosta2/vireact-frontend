import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerNum, ringScribble, text, trWipe } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { layer } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Whiteboard: one glossy dry-erase board, written on live. Black marker for structure, blue for the
 * idea, red for what matters; ghosts of erased lines; an eraser wipes the board at each jump.
 */

const BOARD = '#F7F8F5';
const BLACK = '#1C1D21';
const BLUE = '#1F4FD8';
const RED = '#E5383B';

/** A marker box with its words. */
const box = (x: number, y: number, w: number, h: number, word: string, t: number, c: Ctx, color = BLACK) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke={color} strokeWidth={7} style={drawStroke(t, 2 * (w + h) + 40)} strokeLinecap="round" />
    {label(x + w / 2, y + h / 2 + 18, word, { size: 52, fill: color, font: c.fonts.display, opacity: smooth(t, 0.6, 1) })}
  </g>
);

const arrow = (x1: number, y1: number, x2: number, y2: number, t: number, color = BLACK) => (
  <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 50} ${x2} ${y2} m -26 -10 l 26 10 l -16 22`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" style={drawStroke(t, 600)} />
);

function Board({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120);
  const s = (a: number, b: number) => smooth(u, a, b);
  return (
    <AbsoluteFill style={{ background: BOARD }}>
      {/* Gloss: a soft diagonal reflection, and ghosts of erased marker. */}
      {layer({ background: 'linear-gradient(118deg, transparent 30%, rgba(255,255,255,0.9) 42%, transparent 52%)', opacity: 0.8 })}
      {layer({ background: 'radial-gradient(ellipse at 70% 75%, rgba(120,130,150,0.12), transparent 40%), radial-gradient(ellipse at 25% 55%, rgba(120,130,150,0.1), transparent 30%)' })}
      {svgFrame(
        <g>
          {box(90, 360, 270, 150, 'IDEA', s(0, 0.2), c, BLUE)}
          {arrow(370, 420, 450, 440, s(0.18, 0.28))}
          {box(470, 380, 250, 150, 'TEST', s(0.24, 0.42), c)}
          {arrow(730, 440, 800, 470, s(0.4, 0.5))}
          {box(800, 420, 220, 150, 'GROW', s(0.46, 0.62), c, RED)}
          {/* A quick chart: axes, then a line that climbs. */}
          <path d="M 150 1180 V 760 M 150 1180 H 940" fill="none" stroke={BLACK} strokeWidth={6} strokeLinecap="round" style={drawStroke(s(0.55, 0.7), 1300)} />
          <path d="M 170 1130 C 330 1110 380 1030 480 1010 S 650 900 720 860 S 860 770 920 720" fill="none" stroke={BLUE} strokeWidth={8} strokeLinecap="round" style={drawStroke(s(0.66, 0.86), 1000)} />
          <circle cx={920} cy={720} r={16} fill={RED} opacity={s(0.85, 0.9)} />
          {label(790, 690, 'wow!', { size: 56, fill: RED, font: c.fonts.display, opacity: s(0.88, 0.96) })}
        </g>,
      )}
      {/* The aluminium frame and the marker tray. */}
      {layer({ border: '24px solid #BFC5CC', boxShadow: 'inset 0 0 0 3px #9AA1A9, inset 0 8px 18px rgba(0,0,0,0.12)' })}
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 24, height: 30, background: 'linear-gradient(#D5DADF, #A9B0B8)', borderRadius: 6 }} />
      {[BLACK, BLUE, RED].map((col, k) => (
        <div key={col} style={{ position: 'absolute', bottom: 38, left: 120 + k * 120, width: 100, height: 22, borderRadius: 11, background: '#EDEDED', borderRight: `26px solid ${col}` }} />
      ))}
    </AbsoluteFill>
  );
}

export const whiteboard = defineStyle({
  id: 'whiteboard',
  accent: RED,
  colors: [BLUE, BLACK],
  entrance: 'write',
  Scene: Board,
  pip: pipAt({ border: '10px solid #fff', boxShadow: '0 12px 26px rgba(0,0,0,0.28)' }, 'rect', { rotate: -3, radius: 6 }),
  Overlay: ({ scene }) => (scene ? null : layer({ border: '18px solid #BFC5CC', boxShadow: 'inset 0 0 0 3px #9AA1A9' })),
  caption: caption({ size: 100, glyph: 0.42, color: BLACK, emph: RED, weight: 700, bg: 'rgba(255,255,255,0.94)', pad: '4px 26px', radius: 16, entrance: 'write' }),
  hook: hook({ top: 0.08, entrance: 'write', color: BLUE, size: 84, weight: 700, bg: 'rgba(255,255,255,0.94)', radius: 14, Decor: ({ t }) => <div style={{ height: 8, margin: '6px 10% 0', background: RED, borderRadius: 4, transform: `scaleX(${t})`, transformOrigin: 'left' }} /> }),
  card: card({ bg: '#FFFFFF', border: `5px solid ${BLACK}`, radius: 22, shadow: '0 10px 26px rgba(0,0,0,0.16)' }),
  title: text({ color: BLACK, weight: 700 }),
  body: text({ font: 'body', color: '#2E3440', weight: 500 }),
  number: text({ color: BLUE, weight: 700, shadow: '0 0 0 #fff' }),
  slam: text({ color: RED, weight: 700, shadow: '0 0 24px #fff, 0 0 8px #fff' }),
  Marker: markerNum({ bg: 'transparent', fg: BLUE, border: `5px solid ${BLUE}`, size: 56 }),
  Ring: ringScribble(RED, 8),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#EEF0F3'], ring: BLACK, ringWidth: 6 },
  transition: trWipe({ color: BOARD, dir: 'right', before: 5, after: 9, content: () => <div style={{ position: 'absolute', right: -10, top: '40%', width: 140, height: 260, background: '#3A3F47', borderRadius: 18, borderLeft: '40px solid #C9B79C' }} /> }),
  sample: { type: 'list', text: 'The plan', items: ['Find the idea', 'Test it small', 'Grow what works'] },
});
