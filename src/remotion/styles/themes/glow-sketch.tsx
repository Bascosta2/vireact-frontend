import { AbsoluteFill, interpolate } from 'remotion';
import { H, W, hexA, noise, type StyleTheme } from '../theme';

/**
 * Glow Sketch: a dark, night-time take with thin neon outlines, a warm golden streetlight glow and a
 * luminous city contour. Animated the way the guide says: the glow breathes, the streetlight flickers
 * and the skyline's windows pulse.
 */

const GOLD = '#FFC24B';
const RED = '#FF4D6D';
const CYAN = '#5CE1FF';
const WARM = '#FFF3D6';

const glow = (color: string, k = 1) => `0 0 ${8 * k}px ${color}, 0 0 ${22 * k}px ${color}, 0 0 ${44 * k}px ${hexA(color, 0.55)}`;

/** Streetlight brightness: steady with a slow breath, and a short stutter now and then. */
const lamp = (frame: number) => {
  const stutter = noise(Math.floor(frame / 3), 7) > 0.93 ? 0.45 : 1;
  return (0.82 + 0.18 * Math.sin(frame / 22)) * stutter;
};

/** Building outlines along the bottom: [x, width, height] in px. */
const BUILDINGS: [number, number, number][] = [
  [30, 90, 120], [130, 70, 190], [210, 110, 150], [330, 60, 240], [400, 120, 170], [530, 80, 280],
  [620, 100, 160], [730, 70, 220], [810, 120, 140], [940, 110, 200],
];
const GROUND = 1868;

function skyline({ frame }: { frame: number }) {
  const path = BUILDINGS.map(([x, w, h]) => `M${x} ${GROUND} V${GROUND - h} H${x + w} V${GROUND}`).join(' ');
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, filter: `drop-shadow(0 0 6px ${GOLD}) drop-shadow(0 0 14px ${hexA(GOLD, 0.6)})` }}>
      <path d={path} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.75} />
      <line x1={0} y1={GROUND} x2={W} y2={GROUND} stroke={GOLD} strokeWidth={3} opacity={0.8} />
      {/* The road's centre line drifts by, like the car in the guide's scene. */}
      <line x1={0} y1={GROUND + 30} x2={W} y2={GROUND + 30} stroke={GOLD} strokeWidth={4} strokeDasharray="46 34" strokeDashoffset={frame * 6} opacity={0.6} />
      {BUILDINGS.flatMap(([x, w, h], b) =>
        [0, 1, 2].map((k) => {
          const pulse = 0.25 + 0.75 * Math.max(0, Math.sin(frame / (14 + b) + k * 2.1 + b));
          return <rect key={`${b}-${k}`} x={x + 16 + (k % 2) * (w / 2)} y={GROUND - h + 26 + k * 38} width={14} height={18} fill={k === 1 && b % 3 === 0 ? RED : GOLD} opacity={pulse} />;
        })
      )}
    </svg>
  );
}

export const glowSketch: StyleTheme = {
  id: 'glow-sketch',
  accent: GOLD,
  colors: [RED, CYAN],
  footage: 'grayscale(0.5) brightness(0.72) contrast(1.28)',
  entrance: 'flicker',
  step: 1,
  textScale: 1,
  Overlay: ({ c }) => {
    const l = lamp(c.frame);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <AbsoluteFill style={{ background: '#0a1030', mixBlendMode: 'multiply', opacity: 0.38 }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 40%, rgba(0,0,0,0.78) 100%)' }} />
        {/* The streetlight: a warm cone from the top of the frame. */}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 46% 62% at 50% -4%, ${hexA(GOLD, 0.34)} 0%, ${hexA(GOLD, 0.1)} 45%, transparent 70%)`, mixBlendMode: 'screen', opacity: l }} />
        {skyline({ frame: c.frame })}
        <div style={{ position: 'absolute', inset: 26, borderRadius: 30, border: `3px solid ${GOLD}`, boxShadow: `0 0 16px ${GOLD}, inset 0 0 16px ${hexA(GOLD, 0.6)}`, opacity: 0.5 + 0.35 * l }} />
      </AbsoluteFill>
    );
  },
  caption: {
    size: 80,
    glyph: 0.6,
    // Lines change every half second: a quick fade reads calmer than a flicker on every one.
    entrance: 'fade',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, letterSpacing: 0.5 }),
    word: (emphasis) => ({ color: emphasis ? '#FFE4EA' : WARM, textShadow: glow(emphasis ? RED : GOLD, 0.9) }),
  },
  hook: {
    top: 0.12,
    entrance: 'flicker',
    box: () => ({ border: `4px solid ${GOLD}`, borderRadius: 22, padding: '22px 38px', boxShadow: `0 0 20px ${GOLD}, inset 0 0 20px ${hexA(GOLD, 0.55)}`, background: 'rgba(5,6,16,0.55)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 600, fontSize: 64, lineHeight: 1.16, color: WARM, textShadow: glow(GOLD, 0.8) }),
  },
  card: () => ({ background: 'rgba(5,7,18,0.74)', border: `3px solid ${GOLD}`, borderRadius: 22, boxShadow: `0 0 20px ${hexA(GOLD, 0.6)}, inset 0 0 16px ${hexA(GOLD, 0.35)}` }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: WARM, textShadow: glow(GOLD, 0.6) }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: GOLD, textShadow: glow(GOLD, 0.35) }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 300, color: 'transparent', WebkitTextStroke: `5px ${GOLD}`, textShadow: glow(GOLD, 1.1) }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: WARM, textTransform: 'uppercase', textShadow: glow(RED, 1.1) }),
  SlamBack: ({ t }) => (
    <svg viewBox="0 0 600 220" style={{ position: 'absolute', left: '50%', top: '50%', width: '120%', height: '150%', transform: 'translate(-50%, -50%)', overflow: 'visible', filter: `drop-shadow(0 0 10px ${RED})` }}>
      <path d="M40 30 H10 V190 H40 M560 30 H590 V190 H560" fill="none" stroke={RED} strokeWidth={5} opacity={t} />
    </svg>
  ),
  Marker: ({ t }) => (
    <span style={{ flex: 'none', width: 34, height: 34, borderRadius: 999, border: `4px solid ${GOLD}`, boxShadow: `0 0 12px ${GOLD}, inset 0 0 10px ${GOLD}`, opacity: t }} />
  ),
  Ring: ({ c, x, y, r, t }) => (
    <g style={{ filter: `drop-shadow(0 0 10px ${GOLD}) drop-shadow(0 0 22px ${GOLD})` }}>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={GOLD} strokeWidth={5} />
      <circle cx={x} cy={y} r={r * t + 18} fill="none" stroke={RED} strokeWidth={2} opacity={0.4 + 0.4 * Math.sin(c.frame / 5)} />
    </g>
  ),
  stage: { shape: 'circle', fill: ['#141a3a', '#03040a'], ring: GOLD, ringWidth: 4, glow: GOLD },
  transition: {
    before: 4,
    after: 9,
    // A neon line scans down the frame over a dimmed picture.
    Draw: ({ d }) => {
      const y = interpolate(d, [-4, 9], [-4, 104]);
      const dim = interpolate(d, [-4, 0, 9], [0, 0.6, 0]);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <AbsoluteFill style={{ background: '#000', opacity: dim }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 5, background: WARM, boxShadow: `0 0 18px ${GOLD}, 0 0 46px ${GOLD}, 0 0 90px ${hexA(GOLD, 0.6)}` }} />
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 26, left: 56, width: `${((c.frame / Math.max(1, total)) * (W - 112) / W) * 100}%`, height: 4, background: WARM, boxShadow: glow(GOLD, 0.6) }} />
  ),
  sample: { type: 'headline', text: 'Edits that glow at night', subtext: 'neon outlines, warm light' },
};
