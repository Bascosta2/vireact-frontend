import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { H, W, type StyleTheme } from '../theme';

/**
 * Minimal Line: very thin outlines, sparse geometry, lots of negative space and a premium design-system
 * feel. A near-monochrome picture with one red accent. Motion is quiet: lines draw, things fade, and a
 * jump in the edit is a single hairline sweep with a soft dip.
 */

const RED = '#FF3B30';
const LINE = 'rgba(255,255,255,0.9)';
const GREY = '#B4B8BE';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Corner brackets and a baseline that draw in over the first second and then stay. */
function frame({ frame }: { frame: number }) {
  const t = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
  const L = 90 * t;
  const m = 44;
  const corners = [
    `M${m} ${m + L} V${m} H${m + L}`,
    `M${W - m - L} ${m} H${W - m} V${m + L}`,
    `M${m} ${H - m - L} V${H - m} H${m + L}`,
    `M${W - m - L} ${H - m} H${W - m} V${H - m - L}`,
  ];
  // A slow record light, the only color on screen when nothing is happening.
  const dot = 0.45 + 0.55 * Math.max(0, Math.sin(frame / 20));
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      {corners.map((d) => <path key={d} d={d} fill="none" stroke={LINE} strokeWidth={2} />)}
      <line x1={W / 2 - 300 * t} y1={H - 120} x2={W / 2 + 300 * t} y2={H - 120} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      {Array.from({ length: 13 }, (_, k) => (
        <line key={k} x1={W / 2 - 300 + k * 50} y1={H - 126} x2={W / 2 - 300 + k * 50} y2={H - 114} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} opacity={t} />
      ))}
      <circle cx={m + 18} cy={m + 130} r={7} fill={RED} opacity={dot * t} />
    </svg>
  );
}

export const minimalLine: StyleTheme = {
  id: 'minimal-line',
  accent: RED,
  colors: ['#FFFFFF', GREY],
  footage: 'grayscale(0.85) contrast(1.14) brightness(0.88)',
  entrance: 'fade',
  step: 1,
  textScale: 0.9,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0,0,0,0.55) 100%)' }} />
      {frame({ frame: c.frame })}
    </AbsoluteFill>
  ),
  caption: {
    size: 66,
    glyph: 0.56,
    entrance: 'fade',
    box: (c) => ({ fontFamily: c.fonts.body, fontWeight: 500, letterSpacing: -0.5, textShadow: '0 2px 14px rgba(0,0,0,0.65)' }),
    word: (emphasis) => ({ color: emphasis ? RED : '#fff' }),
  },
  hook: {
    top: 0.13,
    entrance: 'fade',
    box: () => ({ padding: '30px 20px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 300, fontSize: 66, lineHeight: 1.2, letterSpacing: -1, color: '#fff', textShadow: '0 2px 18px rgba(0,0,0,0.6)' }),
    // Hairlines above and below the words, drawn out from the centre.
    Decor: ({ c }) => {
      const t = interpolate(c.frame, [4, 22], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
      const rule = (top: boolean): CSSProperties => ({ position: 'absolute', left: `${50 - 40 * t}%`, right: `${50 - 40 * t}%`, ...(top ? { top: 0 } : { bottom: 0 }), height: 2, background: LINE });
      return (
        <>
          <div style={rule(true)} />
          <div style={rule(false)} />
          <div style={{ position: 'absolute', left: '50%', bottom: -6, width: 12, height: 12, marginLeft: -6, borderRadius: 999, background: RED, opacity: t }} />
        </>
      );
    },
  },
  card: () => ({ background: 'rgba(0,0,0,0.38)', border: `2px solid ${LINE}`, borderRadius: 0 }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 300, color: '#fff', letterSpacing: -0.5 }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 500, color: GREY }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 200, color: '#fff', letterSpacing: -6, textShadow: '0 4px 24px rgba(0,0,0,0.6)' }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 300, color: '#fff', textTransform: 'uppercase', letterSpacing: 10, textShadow: '0 4px 24px rgba(0,0,0,0.6)' }),
  // Two thin rules reach out from the word.
  SlamBack: ({ t }) => (
    <>
      <div style={{ position: 'absolute', right: '104%', top: '50%', width: 160 * t, height: 2, background: LINE }} />
      <div style={{ position: 'absolute', left: '104%', top: '50%', width: 160 * t, height: 2, background: RED }} />
    </>
  ),
  Marker: ({ t }) => (
    <span style={{ position: 'relative', flex: 'none', width: 28, height: 28, borderRadius: 999, border: `2px solid ${LINE}`, opacity: t }}>
      <span style={{ position: 'absolute', inset: 9, borderRadius: 999, background: RED }} />
    </span>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke={LINE} strokeWidth={2.5} strokeDasharray={2 * Math.PI * r} strokeDashoffset={2 * Math.PI * r * (1 - t)} transform={`rotate(-90 ${x} ${y})`} />
      <circle cx={x} cy={y} r={6} fill={RED} opacity={t} />
    </g>
  ),
  stage: { shape: 'circle', fill: ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.65)'], ring: LINE, ringWidth: 2 },
  transition: {
    before: 6,
    after: 8,
    // A hairline crosses the frame while the picture dips almost to black.
    Draw: ({ d }) => {
      const dip = interpolate(d, [-6, 0, 8], [0, 0.85, 0], clamp);
      const span = interpolate(d, [-6, 0], [0, 1], clamp);
      const fade = interpolate(d, [0, 8], [1, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <AbsoluteFill style={{ background: '#000', opacity: dip }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, width: `${span * 100}%`, height: 2, background: '#fff', opacity: fade }} />
          <div style={{ position: 'absolute', top: '50%', left: `${span * 100}%`, width: 10, height: 10, marginTop: -4, marginLeft: -5, borderRadius: 999, background: RED, opacity: fade }} />
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => {
    const x = (c.frame / Math.max(1, total)) * (W - 88);
    return (
      <svg width={W} height={20} style={{ position: 'absolute', top: 18, left: 0 }}>
        <line x1={44} y1={10} x2={44 + x} y2={10} stroke="#fff" strokeWidth={2} />
        <circle cx={44 + x} cy={10} r={5} fill={RED} />
      </svg>
    );
  },
  sample: { type: 'headline', text: 'Less, but better', subtext: 'one idea per frame' },
};
