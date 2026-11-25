import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerNum, ringScribble, text, trWipe } from '../../kit/presets';
import { label, svgFrame } from '../../kit/scenery';
import { layer } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Briefing Board: one real whiteboard wall, filmed in window light. The footage is a cut-out photo held
 * by magnets, with marker arrows, circled notes and the ghosts of erased marks round it.
 */

const BOARD = '#F2F3EF';
const BLUE = '#1E4FD8';
const RED = '#D62828';
const BLACK = '#1A1A1A';
const PHOTO = { x: 130, y: 470, w: 820, h: 900 };

function Wall({ c }: { c: Ctx }) {
  const u = Math.min(1, (c.frame % 400) / 110);
  return (
    <AbsoluteFill style={{ background: BOARD }}>
      {layer({ background: 'linear-gradient(105deg, rgba(255,255,255,0.9) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.06) 100%)' })}
      {layer({ background: 'radial-gradient(ellipse at 80% 20%, rgba(120,130,150,0.12), transparent 30%), radial-gradient(ellipse at 15% 85%, rgba(120,130,150,0.1), transparent 25%)' })}
      <div style={{ position: 'absolute', left: PHOTO.x - 14, top: PHOTO.y - 14, width: PHOTO.w + 28, height: PHOTO.h + 28, background: '#fff', transform: 'rotate(1.5deg)', boxShadow: '0 16px 28px rgba(0,0,0,0.25)' }} />
      {svgFrame(
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 860 330 C 960 360 990 420 940 470" stroke={RED} strokeWidth={8} style={drawStroke(smooth(u, 0.2, 0.5), 300)} />
          <path d="M 925 450 l 15 25 l 20 -22" stroke={RED} strokeWidth={8} opacity={smooth(u, 0.45, 0.5)} />
          {label(700, 330, 'the key', { size: 56, fill: RED, font: c.fonts.display, opacity: smooth(u, 0.1, 0.3) })}
          <path d="M 120 1460 H 600" stroke={BLUE} strokeWidth={8} style={drawStroke(smooth(u, 0.5, 0.8), 500)} />
          {label(130, 1440, 'timeline: 3 days', { size: 50, fill: BLUE, font: c.fonts.display, anchor: 'start', opacity: smooth(u, 0.6, 0.8) })}
        </g>,
      )}
    </AbsoluteFill>
  );
}

/** Magnets holding the photo, over the footage. */
function Magnets() {
  return (
    <AbsoluteFill>
      {[
        [PHOTO.x + 10, PHOTO.y - 10, RED],
        [PHOTO.x + PHOTO.w - 40, PHOTO.y + 6, BLUE],
        [PHOTO.x + PHOTO.w - 30, PHOTO.y + PHOTO.h - 20, BLACK],
      ].map(([x, y, col]) => (
        <div key={`${x}`} style={{ position: 'absolute', left: x as number, top: y as number, width: 44, height: 44, borderRadius: 22, background: col as string, boxShadow: '0 6px 8px rgba(0,0,0,0.35), inset -4px -4px 0 rgba(0,0,0,0.2)', zIndex: 2 }} />
      ))}
    </AbsoluteFill>
  );
}

export const briefingBoard = defineStyle({
  id: 'briefing-board',
  accent: RED,
  colors: [BLUE, BLACK],
  entrance: 'write',
  footage: 'contrast(1.05) saturate(0.95)',
  screen: { ...PHOTO, rotate: 1.5, shape: 'rect' },
  Backdrop: Wall,
  Overlay: Magnets,
  caption: caption({ size: 92, glyph: 0.46, color: BLACK, emph: RED, weight: 700, bg: 'rgba(255,255,255,0.94)', pad: '4px 22px', radius: 8, entrance: 'write' }),
  hook: hook({ top: 0.06, align: 'left', entrance: 'write', color: BLUE, size: 80, weight: 700, Decor: ({ t }) => <div style={{ height: 8, marginTop: 4, background: RED, transform: `scaleX(${t})`, transformOrigin: 'left', borderRadius: 4 }} /> }),
  card: card({ bg: '#FFFFFF', border: `5px solid ${BLACK}`, radius: 12, shadow: '0 12px 24px rgba(0,0,0,0.2)' }),
  title: text({ color: BLACK, weight: 700 }),
  body: text({ font: 'body', color: '#333' }),
  number: text({ color: RED, weight: 700, shadow: '0 0 18px #fff' }),
  slam: text({ color: RED, weight: 700, shadow: '0 0 24px #fff' }),
  Marker: markerNum({ bg: 'transparent', fg: BLUE, border: `5px solid ${BLUE}` }),
  Ring: ringScribble(RED, 8, 3),
  stage: { shape: 'square', fill: ['#FFFFFF', BOARD], ring: BLACK, ringWidth: 5 },
  transition: trWipe({ color: BOARD, dir: 'right', before: 5, after: 9 }),
  sample: { type: 'callout', text: 'Look here' },
});
