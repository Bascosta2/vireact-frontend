import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { card, hook, markerStar, ringScribble, text, trTear } from '../../kit/presets';
import { grain, halftone } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Vintage Collage: a magazine collage made on a paper table. The footage is cut out with a white paper
 * margin and taped down; stamps, ticket stubs, an old map scrap, a torn page of type and a pressed
 * flower lie round it; captions are ransom-note cut-outs.
 */

const TABLE = '#E9DFC9';
const INK = '#2A2420';
const PHOTO = { x: 170, y: 520, w: 740, h: 860 };

function Table({ c }: { c: Ctx }) {
  const piece = (x: number, y: number, w: number, h: number, r: number, bg: string, children?: ReactNode) => (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: bg, transform: `rotate(${r}deg)`, boxShadow: '0 8px 14px rgba(60,40,20,0.3)', overflow: 'hidden' }}>{children}</div>
  );
  return (
    <AbsoluteFill style={{ background: TABLE }}>
      {piece(40, 160, 420, 300, -6, '#D7C9A4', <div style={{ padding: 18, fontFamily: c.fonts.body, fontSize: 22, color: INK, lineHeight: 1.5, opacity: 0.8 }}>{'In the summer of that year the travellers came down from the hills with maps of places nobody had seen. '.repeat(3)}</div>)}
      {piece(620, 140, 360, 260, 7, '#C8D8C0', <svg width={360} height={260}><path d="M 0 200 C 80 140 140 220 220 160 S 320 80 360 120" stroke="#6E8A60" strokeWidth={8} fill="none" /><circle cx={220} cy={160} r={10} fill="#B5502E" /></svg>)}
      {piece(60, 1460, 220, 280, 8, '#F4E8C8', <div style={{ margin: 14, height: 250, border: '3px dashed #B5502E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: c.fonts.display, fontSize: 60, color: '#B5502E' }}>5c</div>)}
      {piece(760, 1480, 270, 130, -4, '#F2C1A0', <div style={{ padding: 16, fontFamily: c.fonts.display, fontSize: 34, color: INK }}>ADMIT ONE · 1962</div>)}
      {piece(420, 1560, 240, 200, 3, '#FFF8E8', <svg width={240} height={200}><path d="M 120 190 V 70" stroke="#5E7A3A" strokeWidth={6} /><circle cx={120} cy={60} r={36} fill="#E07A9A" /><circle cx={120} cy={60} r={12} fill="#F2C14A" /></svg>)}
      <div style={{ position: 'absolute', left: PHOTO.x - 20, top: PHOTO.y - 20, width: PHOTO.w + 40, height: PHOTO.h + 40, background: '#FBF8F0', transform: 'rotate(-2deg)', boxShadow: '0 14px 24px rgba(60,40,20,0.35)' }} />
      {grain({ color: '#6E5A3E', alpha: 0.3, freq: 0.8 })}
    </AbsoluteFill>
  );
}

function Tape() {
  return (
    <AbsoluteFill>
      {halftone({ color: INK, size: 7, dot: 1, opacity: 0.08 })}
      {[[PHOTO.x - 40, PHOTO.y - 30, -30], [PHOTO.x + PHOTO.w - 120, PHOTO.y + PHOTO.h - 10, -20]].map(([x, y, r], k) => (
        <div key={k} style={{ position: 'absolute', left: x, top: y, width: 180, height: 50, background: 'rgba(240,230,190,0.75)', transform: `rotate(${r}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
      ))}
    </AbsoluteFill>
  );
}

export const vintageCollage = defineStyle({
  id: 'vintage-collage',
  accent: '#B5502E',
  colors: ['#6E8A60', '#F2C14A'],
  entrance: 'pop',
  footage: 'sepia(0.3) saturate(0.85) contrast(1.05)',
  screen: { ...PHOTO, rotate: -2, shape: 'rect' },
  Backdrop: Table,
  Overlay: Tape,
  caption: {
    size: 88,
    glyph: 0.55,
    entrance: 'pop',
    box: (c) => ({ fontFamily: c.fonts.display }),
    // Ransom-note words: paper cut-outs, the emphasis word cut from a red page.
    word: (emphasis) => ({ background: emphasis ? '#B5502E' : '#FBF8F0', color: emphasis ? '#FFFFFF' : INK, padding: '0 10px', display: 'inline-block', transform: `rotate(${emphasis ? -3 : 2}deg)`, boxShadow: '0 4px 6px rgba(0,0,0,0.25)' }),
  },
  hook: hook({ top: 0.02, align: 'left', color: INK, size: 70, bg: '#FBF8F0', rotate: -3, pad: '10px 24px', boxShadow: '0 10px 18px rgba(60,40,20,0.35)' }),
  card: card({ bg: '#FBF8F0', shadow: '0 12px 20px rgba(60,40,20,0.35)', extra: { transform: 'rotate(-1.5deg)' } }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#4A3A2E', italic: true }),
  number: text({ color: '#B5502E', extra: { background: '#FBF8F0', padding: '0 18px', transform: 'rotate(-3deg)' } }),
  slam: text({ color: '#FFFFFF', extra: { background: '#B5502E', padding: '0 22px', transform: 'rotate(-4deg)' } }),
  Marker: markerStar(['#B5502E', '#F2C14A', '#6E8A60'], 40, INK),
  Ring: ringScribble('#B5502E', 7, 27),
  stage: { shape: 'square', fill: ['#FBF8F0', TABLE], ring: INK, ringWidth: 4 },
  transition: trTear({ paper: '#FBF8F0' }),
  sample: { type: 'pill', text: 'Found in a flea market' },
});
