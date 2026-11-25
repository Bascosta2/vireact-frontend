import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trWipe } from '../../kit/presets';
import { grain, halftone } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Case File: a retro printed case file. Cream archive paper in a manila folder, the footage as a
 * halftone photo held by a paper clip, typed headings, a rubber stamp, and misregistered heavy headlines
 * in a few flat inks.
 */

const MANILA = '#D9B76E';
const PAPER = '#F3EBD8';
const INK = '#1F1A17';
const RED = '#C8102E';
const PHOTO = { x: 200, y: 560, w: 680, h: 820 };

function Folder({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill style={{ background: '#3A3530' }}>
      <div style={{ position: 'absolute', left: 30, top: 160, right: 30, bottom: 120, background: MANILA, borderRadius: '0 20px 20px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
      <div style={{ position: 'absolute', left: 30, top: 120, width: 360, height: 60, background: MANILA, borderRadius: '18px 18px 0 0' }} />
      <div style={{ position: 'absolute', left: 70, top: 200, right: 70, bottom: 160, background: PAPER, boxShadow: '0 6px 12px rgba(0,0,0,0.25)', padding: '34px 40px', boxSizing: 'border-box', fontFamily: c.fonts.body, color: INK }}>
        <div style={{ fontSize: 30, letterSpacing: 4 }}>FILE NO. 0417 · SUBJECT</div>
        <div style={{ height: 3, background: INK, margin: '14px 0 20px' }} />
        <div style={{ fontSize: 24, lineHeight: 1.6, opacity: 0.8 }}>
          DATE ......... 11/24
          <br />
          STATUS ...... OPEN
        </div>
        <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40, fontSize: 22, lineHeight: 1.7, opacity: 0.6 }}>
          {['██████ ████ ███████ ██', '███ █████ ████ ██████ ████', '██████ ███ ████'].map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
      {halftone({ color: INK, size: 9, dot: 1, opacity: 0.08 })}
      {grain({ color: '#6E5A3A', alpha: 0.25, freq: 0.8 })}
    </AbsoluteFill>
  );
}

function Clip({ c }: { c: Ctx }) {
  const stamp = Math.min(1, Math.max(0, (c.frame - 20) / 6));
  return (
    <AbsoluteFill>
      {halftone({ color: INK, size: 8, dot: 1.3, opacity: 0.18, blend: 'multiply' })}
      <div style={{ position: 'absolute', left: PHOTO.x + 80, top: PHOTO.y - 50, width: 60, height: 150, border: '8px solid #9AA0A8', borderRadius: 30, borderBottom: 'none' }} />
      <div style={{ position: 'absolute', right: 120, top: 1330, padding: '8px 22px', border: `6px solid ${RED}`, color: RED, fontFamily: c.fonts.display, fontSize: 60, letterSpacing: 4, transform: `rotate(-12deg) scale(${2 - stamp})`, opacity: stamp * 0.85, mixBlendMode: 'multiply' }}>CLASSIFIED</div>
    </AbsoluteFill>
  );
}

/** Misregistered headline: a red shadow offset from the black type. */
const misreg = (c: Ctx, size?: number) => ({ fontFamily: c.fonts.display, color: INK, textShadow: `6px 4px 0 ${RED}`, fontSize: size });

const stampMarker: StyleTheme['Marker'] = markerSquare([RED, INK], 26, 45);

export const caseFile = defineStyle({
  id: 'case-file',
  accent: RED,
  colors: [INK, MANILA],
  entrance: 'pop',
  footage: 'grayscale(0.9) contrast(1.35) brightness(1.05) sepia(0.2)',
  screen: { ...PHOTO, rotate: -2, shape: 'rect', style: { border: '14px solid #fff', boxShadow: '0 12px 20px rgba(0,0,0,0.4)' } },
  Backdrop: Folder,
  Overlay: Clip,
  caption: caption({ size: 92, glyph: 0.52, color: INK, emph: RED, upper: true, letter: 1, bg: PAPER, pad: '6px 22px', boxExtra: { border: `4px solid ${INK}` }, shadow: `4px 3px 0 ${RED}55` }),
  hook: hook({ top: 0.09, align: 'left', color: INK, size: 74, upper: true, letter: 1, bg: PAPER, pad: '10px 24px', rotate: -1, boxExtra: { border: `5px solid ${INK}` }, shadow: `6px 4px 0 ${RED}` }),
  card: card({ bg: PAPER, border: `4px solid ${INK}`, shadow: '0 12px 22px rgba(0,0,0,0.35)' }),
  title: (c) => ({ ...misreg(c), textTransform: 'uppercase', letterSpacing: 1 }),
  body: text({ font: 'body', color: '#3A332C' }),
  number: (c) => ({ ...misreg(c), textShadow: `10px 6px 0 ${RED}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: RED, textTransform: 'uppercase', letterSpacing: 6, border: `8px solid ${RED}`, padding: '0 26px', transform: 'rotate(-6deg)', mixBlendMode: 'multiply' }),
  Marker: stampMarker,
  Ring: ringCircle(RED, 6, { dash: '4 8' }),
  stage: { shape: 'square', fill: [PAPER, '#E4D8BC'], ring: INK, ringWidth: 5 },
  transition: trWipe({ color: MANILA, dir: 'left', edge: `10px solid ${INK}` }),
  sample: { type: 'slam', text: 'Classified' },
});
