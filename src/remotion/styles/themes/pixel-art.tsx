import { Fragment, type CSSProperties } from 'react';
import { AbsoluteFill } from 'remotion';
import { H, W, noise, stepped, type StyleTheme } from '../theme';

/**
 * Pixel Art: a crisp 8/16-bit game look. Everything moves in small steps (10 frames a second, never
 * smooth), the hook is an RPG dialog box that types itself out, a HUD tracks score and hearts with the
 * progress as an XP bar, pixel clouds loop across the top, and a jump in the edit is a pixel dissolve.
 */

const YELLOW = '#FFD43B';
const NAVY = '#1B1F4B';
const RED = '#FF4D6D';
const GREEN = '#3DDC84';
const INK = '#000';

/** A hard pixel outline round text (no blur). */
const pixelOutline = (px: number, color = INK) =>
  [[px, 0], [-px, 0], [0, px], [0, -px], [px, px], [-px, px], [px, -px], [-px, -px]].map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(', ');

/** A box with a double pixel border. */
const pixelBox = (fill = NAVY): CSSProperties => ({
  background: fill,
  border: '6px solid #fff',
  boxShadow: `0 0 0 6px ${INK}, 12px 12px 0 6px rgba(0,0,0,0.45)`,
  borderRadius: 0,
});

/** Pixel art drawn from rows of characters: each non-space is one `px`-sized square of that color. */
function sprite({ rows, px, colors, style }: { rows: string[]; px: number; colors: Record<string, string>; style?: CSSProperties }) {
  return (
    <svg width={rows[0].length * px} height={rows.length * px} shapeRendering="crispEdges" style={style}>
      {rows.flatMap((r, y) => [...r].map((ch, x) => (colors[ch] ? <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={colors[ch]} /> : null)))}
    </svg>
  );
}

const HEART = [' rr rr ', 'rrrrrrr', 'rrrrrrr', ' rrrrr ', '  rrr  ', '   r   '];
const CLOUD = ['   wwww    ', ' wwwwwwww  ', 'wwwwwwwwwww', 'wwwwwwwwwww', ' sssssssss '];
const ARROW = ['y   ', 'yy  ', 'yyy ', 'yyyy', 'yyy ', 'yy  ', 'y   '];

export const pixelArt: StyleTheme = {
  id: 'pixel-art',
  accent: YELLOW,
  colors: [RED, GREEN],
  footage: 'saturate(1.45) contrast(1.22)',
  entrance: 'step',
  step: 3,
  textScale: 0.5,
  bodyScale: 0.85,
  Overlay: ({ c }) => {
    const f = stepped(c.frame, 3);
    const score = String(Math.floor(f / c.fps) * 10 + (f > 0 ? 100 : 0)).padStart(6, '0');
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 3px, transparent 3px 7px)', opacity: 0.55 }} />
        <AbsoluteFill style={{ backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.07) 1px, transparent 1px)', backgroundSize: '9px 9px' }} />
        {/* Clouds loop across the top in 6 px steps. */}
        {[0, 1].map((k) => {
          const x = ((f * 2 + k * 560) % (W + 300)) - 220;
          return <Fragment key={k}>{sprite({ rows: CLOUD, px: 14, colors: { w: '#fff', s: '#CFE3FF' }, style: { position: 'absolute', left: x, top: 236 + k * 80, opacity: 0.9 } })}</Fragment>;
        })}
        {/* HUD */}
        <div style={{ position: 'absolute', top: 54, left: 56, right: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontFamily: c.fonts.display, fontSize: 30, color: '#fff', textShadow: pixelOutline(4) }}>
          <div>
            <div>SCORE</div>
            <div style={{ color: YELLOW, marginTop: 10 }}>{score}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[0, 1, 2].map((k) => <Fragment key={k}>{sprite({ rows: HEART, px: 7, colors: { r: RED }, style: { filter: 'drop-shadow(4px 4px 0 #000)' } })}</Fragment>)}
          </div>
        </div>
      </AbsoluteFill>
    );
  },
  caption: {
    size: 52,
    glyph: 1.0,
    entrance: 'step',
    box: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', lineHeight: 1.4 }),
    word: (emphasis) => ({ color: emphasis ? YELLOW : '#fff', textShadow: `${pixelOutline(5)}, 9px 9px 0 rgba(0,0,0,0.6)` }),
  },
  hook: {
    top: 0.14,
    entrance: 'step',
    typewriter: true,
    box: () => ({ ...pixelBox(), padding: '30px 36px 40px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 38, lineHeight: 1.6, color: '#fff', textAlign: 'left' }),
    // The dialog box's "next" arrow blinks once the text is out.
    Decor: ({ c }) => (Math.floor(stepped(c.frame, 3) / 9) % 2 === 0 ? (
      sprite({ rows: ['yyyyyyy', ' yyyyy ', '  yyy  ', '   y   '], px: 6, colors: { y: YELLOW }, style: { position: 'absolute', right: 20, bottom: 12 } })
    ) : null),
  },
  card: () => pixelBox(),
  title: (c) => ({ fontFamily: c.fonts.display, color: YELLOW, textTransform: 'uppercase', lineHeight: 1.4 }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }),
  number: (c) => ({ fontFamily: c.fonts.display, color: YELLOW, textShadow: `${pixelOutline(8)}, 16px 16px 0 rgba(0,0,0,0.55)` }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: '#fff', textTransform: 'uppercase', lineHeight: 1.3, textShadow: `${pixelOutline(8)}, 14px 14px 0 ${RED}` }),
  Marker: ({ t }) => (t > 0 ? sprite({ rows: ARROW, px: 6, colors: { y: YELLOW }, style: { flex: 'none' } }) : <span style={{ width: 24 }} />),
  // A square target with stepped corners.
  Ring: ({ x, y, r, t, c }) => {
    const s = Math.round((r * t) / 12) * 12;
    const blink = Math.floor(stepped(c.frame, 3) / 6) % 2 === 0;
    return (
      <g shapeRendering="crispEdges">
        <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill="none" stroke={INK} strokeWidth={18} />
        <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill="none" stroke={blink ? YELLOW : '#fff'} strokeWidth={9} strokeDasharray="24 12" />
      </g>
    );
  },
  stage: { shape: 'square', fill: ['#2B3A8C', NAVY], ring: '#fff', ringWidth: 8 },
  transition: {
    before: 6,
    after: 9,
    // Pixel dissolve: big squares fill the frame in a scattered order, then clear in another.
    Draw: ({ d }) => {
      const f = stepped(d, 2);
      const cols = 9;
      const rows = 16;
      const size = W / cols;
      return (
        <svg width={W} height={H} shapeRendering="crispEdges" style={{ position: 'absolute', inset: 0 }}>
          {Array.from({ length: cols * rows }, (_, k) => {
            const on = f < 0 ? noise(k, 1) < (f + 7) / 6 : noise(k, 2) >= f / 8;
            return on ? <rect key={k} x={(k % cols) * size} y={Math.floor(k / cols) * size} width={size + 1} height={size + 1} fill={k % 7 === 0 ? '#2B3A8C' : NAVY} /> : null;
          })}
        </svg>
      );
    },
  },
  // The XP bar under the HUD.
  Progress: ({ c, total }) => {
    const p = Math.floor((stepped(c.frame, 3) / Math.max(1, total)) * 40) / 40;
    return (
      <div style={{ position: 'absolute', top: 150, left: 56, width: 420, height: 30, ...pixelBox('#111'), boxShadow: `0 0 0 5px ${INK}`, border: '5px solid #fff' }}>
        <div style={{ height: '100%', width: `${p * 100}%`, background: GREEN, boxShadow: 'inset 0 6px 0 rgba(255,255,255,0.35)' }} />
        <span style={{ position: 'absolute', right: -84, top: -2, fontFamily: c.fonts.display, fontSize: 24, color: '#fff', textShadow: pixelOutline(3) }}>XP</span>
      </div>
    );
  },
  sample: { type: 'counter', text: '+100', subtext: 'XP for every reel' },
};
