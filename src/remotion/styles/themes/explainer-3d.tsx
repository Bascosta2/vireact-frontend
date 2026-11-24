import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { hexA, type StyleTheme } from '../theme';

/**
 * Explainer 3D: soft, rounded 3D in bright daylight. Toy-like materials, puffy cards, clay lettering with
 * a soft extruded edge, glossy spheres and puffy clouds. Motion is soft and friendly: rounded springs,
 * gentle bobbing, and a jump in the edit is a soft bubble that grows and pops open.
 */

const BLUE = '#3D8BFF';
const YELLOW = '#FFC93C';
const PINK = '#FF6F91';
const INK = '#1E2A4A';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Clay lettering: a stack of shadows makes a soft extruded edge. */
const extrude = (edge: string, depth = 6) =>
  [...Array.from({ length: depth }, (_, k) => `0 ${(k + 1) * 2}px 0 ${edge}`), `0 ${depth * 2 + 10}px 22px rgba(20,40,90,0.4)`].join(', ');

const puffy = (): CSSProperties => ({
  background: 'linear-gradient(180deg, #FFFFFF 0%, #EEF3FF 100%)',
  borderRadius: 40,
  boxShadow: '0 12px 0 #C9D6F2, 0 30px 44px rgba(30,60,120,0.35), inset 0 -6px 0 rgba(30,60,120,0.05), inset 0 4px 0 #fff',
});

/** A glossy sphere (radial highlight, soft shadow under it). */
function sphere({ x, y, r, color, frame, phase }: { x: number; y: number; r: number; color: string; frame: number; phase: number }) {
  const bob = Math.sin(frame / 26 + phase) * 14;
  return (
    <>
      <div style={{ position: 'absolute', left: x - r * 0.8, top: y + r + 26, width: r * 1.6, height: r * 0.34, borderRadius: 999, background: 'rgba(20,40,90,0.22)', filter: 'blur(8px)', transform: `scale(${1 - bob / 120})` }} />
      <div style={{ position: 'absolute', left: x - r, top: y - r + bob, width: r * 2, height: r * 2, borderRadius: 999, background: `radial-gradient(circle at 34% 30%, #fff 0%, ${hexA(color, 0.9)} 22%, ${color} 55%, ${hexA(color, 0.75)} 100%)`, boxShadow: `inset -10px -14px 26px rgba(0,0,0,0.18)` }} />
    </>
  );
}

/** A puffy cloud of overlapping soft circles. */
function cloud({ x, y, s, frame }: { x: number; y: number; s: number; frame: number }) {
  const dx = Math.sin(frame / 80 + x) * 16;
  const puff = (left: number, top: number, d: number) => (
    <div style={{ position: 'absolute', left: left * s, top: top * s, width: d * s, height: d * s, borderRadius: 999, background: 'radial-gradient(circle at 40% 35%, #fff 0%, #fff 55%, #E3ECFA 100%)' }} />
  );
  return (
    <div style={{ position: 'absolute', left: x + dx, top: y, filter: 'drop-shadow(0 10px 14px rgba(30,60,120,0.25))' }}>
      {puff(0, 60, 100)}
      {puff(60, 10, 130)}
      {puff(150, 30, 120)}
      {puff(230, 70, 90)}
      <div style={{ position: 'absolute', left: 20 * s, top: 110 * s, width: 290 * s, height: 70 * s, borderRadius: 999, background: 'linear-gradient(180deg, #fff, #E3ECFA)' }} />
    </div>
  );
}

export const explainer3d: StyleTheme = {
  id: 'explainer-3d',
  accent: YELLOW,
  colors: [BLUE, PINK],
  footage: 'brightness(1.07) saturate(1.2) contrast(1.02)',
  entrance: 'bounce',
  step: 1,
  textScale: 0.92,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Soft daylight at the edges. */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(220,235,255,0.35) 100%)' }} />
      {cloud({ x: -60, y: 150, s: 0.75, frame: c.frame })}
      {cloud({ x: 850, y: 250, s: 0.55, frame: c.frame })}
      {sphere({ x: 980, y: 1650, r: 46, color: PINK, frame: c.frame, phase: 0 })}
      {sphere({ x: 110, y: 1720, r: 34, color: BLUE, frame: c.frame, phase: 1.7 })}
      {sphere({ x: 210, y: 1610, r: 22, color: YELLOW, frame: c.frame, phase: 3.1 })}
    </AbsoluteFill>
  ),
  caption: {
    size: 84,
    glyph: 0.6,
    entrance: 'bounce',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, letterSpacing: 0 }),
    word: (emphasis) => ({ color: emphasis ? YELLOW : '#fff', WebkitTextStroke: `3px ${INK}`, paintOrder: 'stroke fill', textShadow: extrude(emphasis ? '#C98A00' : '#9FB2DD', 5) }),
  },
  hook: {
    top: 0.12,
    entrance: 'bounce',
    box: () => ({ ...puffy(), padding: '28px 44px 30px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, fontSize: 66, lineHeight: 1.1, color: INK }),
    Decor: ({ t }) => (
      <div style={{ position: 'absolute', left: -26, top: -26, width: 64, height: 64, borderRadius: 999, background: `radial-gradient(circle at 34% 30%, #fff, ${BLUE} 40%, #1F5FD0)`, boxShadow: '0 10px 18px rgba(30,60,120,0.35)', transform: `scale(${t})` }} />
    ),
  },
  card: puffy,
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: INK }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 800, color: BLUE }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: YELLOW, WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill', textShadow: extrude('#C98A00', 8) }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#fff', WebkitTextStroke: `4px ${INK}`, paintOrder: 'stroke fill', textShadow: extrude('#9FB2DD', 8) }),
  SlamBack: ({ t }) => (
    <div style={{ position: 'absolute', left: '50%', top: '50%', width: 420, height: 420, marginLeft: -210, marginTop: -230, borderRadius: 999, background: `radial-gradient(circle at 34% 30%, #fff, ${PINK} 35%, #D9416A)`, opacity: 0.9, transform: `scale(${t})`, boxShadow: '0 30px 50px rgba(30,60,120,0.35)' }} />
  ),
  Marker: ({ k, t }) => {
    const color = [BLUE, PINK, YELLOW][k % 3];
    return (
      <span style={{ flex: 'none', width: 50, height: 50, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(circle at 34% 30%, #fff, ${color} 40%, ${color})`, boxShadow: '0 6px 10px rgba(30,60,120,0.3)', transform: `scale(${t})` }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
    );
  },
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y + 8} r={r * t} fill="none" stroke="rgba(20,40,90,0.3)" strokeWidth={18} />
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={YELLOW} strokeWidth={18} />
      <circle cx={x} cy={y - 3} r={r * t} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
    </g>
  ),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#DCE7FF'], ring: BLUE, ringWidth: 8 },
  transition: {
    before: 6,
    after: 9,
    // A soft bubble grows from the middle to cover the cut, then opens out.
    Draw: ({ d }) => {
      const r = d < 0 ? interpolate(d, [-6, 0], [0, 1300], { ...clamp, easing: (v) => v * v }) : interpolate(d, [0, 9], [1300, 0], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 2) });
      if (r <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '50%', top: '45%', width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r, borderRadius: 999, background: `radial-gradient(circle at 36% 30%, #ffffff 0%, #9CC3FF 18%, ${BLUE} 55%, #2459C7 100%)` }} />
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 18, left: 40, right: 40, height: 20, borderRadius: 999, background: 'rgba(255,255,255,0.55)', boxShadow: 'inset 0 3px 6px rgba(30,60,120,0.2)' }}>
      <div style={{ height: '100%', width: `${(c.frame / Math.max(1, total)) * 100}%`, borderRadius: 999, background: `linear-gradient(180deg, #FFE08A, ${YELLOW})`, boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.6)' }} />
    </div>
  ),
  sample: { type: 'list', text: 'How it works', items: ['Upload', 'Pick a style', 'Post it'] },
};
