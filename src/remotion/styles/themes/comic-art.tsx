import { AbsoluteFill, interpolate } from 'remotion';
import { H, W, noise, type StyleTheme } from '../theme';

/**
 * Comic Art: bold black outlines, halftone dots, flat vibrant color and a narrator caption panel, like a
 * page of an editorial comic. Motion is punchy: things pop onto the page, slams land on a burst, and a
 * jump in the edit turns the page with a panel swipe and speed lines.
 */

const INK = '#111111';
const YELLOW = '#FFD400';
const RED = '#E8202A';
const BLUE = '#1E6BFF';
const PAPER = '#FFFDF4';

/** A starburst polygon of `n` points around (cx, cy). */
const burst = (cx: number, cy: number, outer: number, inner: number, n: number, seed = 1) =>
  Array.from({ length: n * 2 }, (_, k) => {
    const a = (Math.PI * k) / n - Math.PI / 2;
    const r = k % 2 === 0 ? outer * (0.86 + 0.14 * noise(k, seed)) : inner;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ');

export const comicArt: StyleTheme = {
  id: 'comic-art',
  accent: YELLOW,
  colors: [RED, BLUE],
  footage: 'saturate(1.6) contrast(1.3) brightness(1.05)',
  entrance: 'pop',
  step: 1,
  textScale: 1.12,
  Overlay: () => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Halftone print dots over the picture. */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${INK} 1.7px, transparent 2.4px)`, backgroundSize: '13px 13px', mixBlendMode: 'multiply', opacity: 0.16 }} />
      {/* The panel: a white gutter and a heavy black border. */}
      <div style={{ position: 'absolute', inset: 0, border: `22px solid ${PAPER}` }} />
      <div style={{ position: 'absolute', inset: 22, border: `9px solid ${INK}` }} />
    </AbsoluteFill>
  ),
  caption: {
    size: 96,
    glyph: 0.48,
    entrance: 'pop',
    box: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', letterSpacing: 1.5 }),
    word: (emphasis) => ({ color: emphasis ? YELLOW : '#fff', WebkitTextStroke: `10px ${INK}`, paintOrder: 'stroke fill', textShadow: `7px 7px 0 ${INK}` }),
  },
  hook: {
    top: 0.1,
    align: 'left',
    entrance: 'pop',
    // The narrator's caption box ("Meanwhile, on the road...").
    box: () => ({ background: '#FFE14D', border: `7px solid ${INK}`, boxShadow: `12px 12px 0 ${INK}`, padding: '20px 32px', transform: 'rotate(-1.5deg)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 74, lineHeight: 1.08, letterSpacing: 1.5, color: INK, textTransform: 'uppercase' }),
  },
  card: () => ({ background: PAPER, border: `7px solid ${INK}`, borderRadius: 6, boxShadow: `11px 11px 0 ${INK}` }),
  title: (c) => ({ fontFamily: c.fonts.display, letterSpacing: 1.2, color: INK, textTransform: 'uppercase' }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 700, color: RED }),
  number: (c) => ({ fontFamily: c.fonts.display, color: YELLOW, WebkitTextStroke: `9px ${INK}`, paintOrder: 'stroke fill', textShadow: `10px 10px 0 ${INK}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: YELLOW, letterSpacing: 3, textTransform: 'uppercase', WebkitTextStroke: `11px ${INK}`, paintOrder: 'stroke fill', textShadow: `11px 11px 0 ${INK}` }),
  SlamBack: ({ t }) => (
    <svg viewBox="0 0 600 400" style={{ position: 'absolute', left: '50%', top: '50%', width: '150%', height: '230%', transform: `translate(-50%, -50%) scale(${0.4 + 0.6 * t})`, overflow: 'visible' }}>
      <polygon points={burst(300, 200, 290, 170, 14)} fill={RED} stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      <polygon points={burst(300, 200, 200, 130, 12, 4)} fill="#FF7A1A" />
    </svg>
  ),
  Marker: ({ k, t }) => (
    <svg width={52} height={52} viewBox="0 0 100 100" style={{ flex: 'none', transform: `scale(${t}) rotate(${(1 - t) * -90}deg)` }}>
      <polygon points={burst(50, 50, 48, 22, 5)} fill={[YELLOW, RED, BLUE][k % 3]} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </svg>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={INK} strokeWidth={20} />
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={YELLOW} strokeWidth={10} />
    </g>
  ),
  stage: { shape: 'circle', fill: [PAPER, '#FFF0A0'], ring: INK, ringWidth: 10 },
  transition: {
    before: 4,
    after: 8,
    // A white comic panel swipes across on a slant, trailing speed lines.
    Draw: ({ d }) => {
      const x = interpolate(d, [-4, 0, 8], [-130, 0, 130]);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', bottom: '-10%', left: '-15%', width: '130%', transform: `translateX(${x}%) skewX(-12deg)`, background: PAPER, border: `14px solid ${INK}` }}>
            <svg width={W} height={H * 1.2} style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: 16 }, (_, k) => (
                <line key={k} x1={0} y1={60 + k * 140} x2={W * (0.55 + 0.4 * noise(k, 3))} y2={60 + k * 140} stroke={INK} strokeWidth={6 + 8 * noise(k, 9)} strokeLinecap="round" />
              ))}
            </svg>
          </div>
        </AbsoluteFill>
      );
    },
    camera: (d) => (d >= 0 && d < 8 ? { scale: interpolate(d, [0, 8], [1.12, 1]) } : {}),
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 31, left: 31, height: 14, width: `${(c.frame / Math.max(1, total)) * 94}%`, background: YELLOW, borderRight: `5px solid ${INK}`, borderBottom: `5px solid ${INK}` }} />
  ),
  sample: { type: 'slam', text: 'BOOM!' },
};
