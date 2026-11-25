import { AbsoluteFill } from 'remotion';
import { phosphorFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerArrow, ringSquare, text, trShutter } from '../../kit/presets';
import { scanlines, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Retro Terminal: everything on an old monochrome CRT in amber phosphor. The footage is the screen,
 * curved, with scanlines and a glow; ASCII readouts frame it, the hook types in with a block cursor,
 * and cuts are the tube collapsing to a line and back.
 */

const AMBER = '#FFB000';
const DIM = '#5A3A00';
const SCREEN = { x: 70, y: 380, w: 940, h: 1060 };

function Case({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill style={{ background: '#2A2620' }}>
      <div style={{ position: 'absolute', left: 30, top: 300, right: 30, height: 1230, background: 'linear-gradient(#D9D2C2, #B9B09C)', borderRadius: 50, boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 -10px 0 rgba(0,0,0,0.15)' }} />
      <div style={{ position: 'absolute', left: SCREEN.x - 20, top: SCREEN.y - 20, width: SCREEN.w + 40, height: SCREEN.h + 40, background: '#0B0900', borderRadius: 60 }} />
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1560, fontFamily: c.fonts.display, fontSize: 30, color: AMBER, textShadow: `0 0 10px ${AMBER}`, lineHeight: 1.5 }}>
        <div>&gt; RUN EDIT.EXE</div>
        <div style={{ opacity: 0.7 }}>
          LOADING [{'#'.repeat(Math.min(20, Math.floor(c.frame / 4) % 21)).padEnd(20, '.')}]
        </div>
      </div>
      <div style={{ position: 'absolute', left: 80, top: 160, fontFamily: c.fonts.display, fontSize: 34, color: AMBER, textShadow: `0 0 10px ${AMBER}`, letterSpacing: 4 }}>DEEP SIGNAL · TERMINAL 7</div>
    </AbsoluteFill>
  );
}

function Tube() {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, borderRadius: 50, overflow: 'hidden' }}>
        {scanlines({ gap: 5, alpha: 0.5 })}
        {vignette(0.8, '#000', 40)}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.12), transparent 40%)' }} />
      </div>
    </AbsoluteFill>
  );
}

export const retroTerminal = defineStyle({
  id: 'retro-terminal',
  accent: AMBER,
  colors: [DIM, '#FFE2A0'],
  entrance: 'flicker',
  footage: 'url(#rt-amber) blur(0.6px)',
  Defs: () => phosphorFilter('rt-amber', AMBER, '#0B0900'),
  screen: { ...SCREEN, shape: 'rect', radius: 50 },
  Backdrop: Case,
  Overlay: Tube,
  caption: caption({ size: 80, glyph: 0.6, color: AMBER, emph: '#FFE2A0', upper: true, glow: AMBER, shadow: `0 0 12px ${AMBER}`, bg: 'rgba(11,9,0,0.85)', pad: '6px 20px', entrance: 'flicker' }),
  hook: hook({ top: 0.13, align: 'left', entrance: 'flicker', typewriter: true, color: AMBER, size: 58, upper: true, glow: AMBER, bg: 'rgba(11,9,0,0.9)', pad: '12px 22px', Decor: ({ c }) => <span style={{ position: 'absolute', right: 12, bottom: 14, width: 26, height: 42, background: AMBER, opacity: Math.floor(c.frame / 8) % 2 }} /> }),
  card: card({ bg: 'rgba(11,9,0,0.92)', border: `3px solid ${AMBER}`, shadow: `0 0 24px ${AMBER}55` }),
  title: text({ color: AMBER, upper: true, glow: AMBER }),
  body: text({ font: 'body', color: '#E0A040' }),
  number: text({ color: AMBER, glow: AMBER }),
  slam: text({ color: '#FFE2A0', upper: true, glow: AMBER }),
  Marker: markerArrow(AMBER, 36),
  Ring: ringSquare(AMBER, 4),
  stage: { shape: 'square', fill: ['#1A1200', '#0B0900'], ring: AMBER, ringWidth: 3, glow: AMBER },
  transition: trShutter({ color: '#000' }),
  sample: { type: 'list', text: '> STATUS', items: ['SIGNAL FOUND', 'DECODING', 'READY'] },
});
