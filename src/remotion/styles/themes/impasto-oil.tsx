import { AbsoluteFill, interpolate } from 'remotion';
import { grainStyle, loop, roughFilter, weaveStyle } from '../painted';
import { H, W, hexA, type StyleTheme } from '../theme';

/**
 * Impasto Oil: thick paint, palette-knife and bristle strokes that follow the forms, swirling strokes in
 * the sea and sky, raised ridges catching the light, canvas weave where the paint is thin. The guide's
 * whale lives at the bottom: it breaches out of a stormy stroke sea on a slow loop, hangs, and crashes
 * back in a splash of paint flicks while the waves roll. The weave stays fixed to the frame.
 */

const DEEP = '#1D3A5F';
const SEA = '#2E6E8E';
const FOAM = '#E8E0CC';
const GOLD = '#E9A13B';
const SKIN = '#0F2233';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** One rolling wave of swirling strokes along the bottom. */
function waveBand(frame: number, base: number, color: string, amp: number, speed: number, opacity: number) {
  const pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 60) pts.push(`${x},${base + Math.sin(x / 130 + frame / speed) * amp}`);
  return <path d={`M-40 ${H} L${pts.join(' L')} L${W + 40} ${H} Z`} fill={color} opacity={opacity} filter="url(#io-edge)" />;
}

/** The whale: rises, hangs, falls. `p` is the breach loop 0 → 1. */
function whale(frame: number) {
  const p = loop(frame, 360);
  const rise = p < 0.35 ? interpolate(p, [0, 0.35], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 2) }) : p < 0.5 ? 1 : interpolate(p, [0.5, 0.68], [1, 0], { ...clamp, easing: (v) => v * v });
  const y = 1760 - rise * 300;
  const tilt = interpolate(p, [0, 0.35, 0.5, 0.68], [-24, -6, 8, 30], clamp);
  const spray = p > 0.6 && p < 0.8 ? (p - 0.6) / 0.2 : 0;
  return (
    <g transform={`translate(790 ${y}) rotate(${tilt})`}>
      <path d="M-190 30 Q-120 -52 30 -58 Q170 -58 215 8 Q150 34 60 38 Q-90 44 -190 30 Z" fill={SKIN} opacity={0.92} filter="url(#io-edge)" />
      <path d="M-190 30 Q-235 2 -258 -34 Q-214 -30 -196 -8 Q-186 4 -190 30 Z" fill={SKIN} opacity={0.9} />
      <path d="M40 36 Q70 96 128 118 Q96 52 74 30 Z" fill={SKIN} opacity={0.85} />
      <path d="M-160 18 Q-60 -30 90 -34" stroke={FOAM} strokeWidth={7} fill="none" opacity={0.5} strokeLinecap="round" />
      {spray > 0 &&
        Array.from({ length: 12 }, (_, k) => {
          const a = -Math.PI * (0.15 + (k / 12) * 0.7);
          const d = spray * (90 + (k % 4) * 36);
          return <ellipse key={k} cx={Math.cos(a) * d * 1.6} cy={60 + Math.sin(a) * d + spray * spray * 120} rx={16 - spray * 6} ry={6} fill={FOAM} opacity={0.85 * (1 - spray * 0.5)} transform={`rotate(${a * 40} ${Math.cos(a) * d * 1.6} ${60 + Math.sin(a) * d})`} />;
        })}
    </g>
  );
}

export const impastoOil: StyleTheme = {
  id: 'impasto-oil',
  accent: GOLD,
  colors: [SEA, FOAM],
  footage: 'saturate(1.12) contrast(1.05) brightness(0.99)',
  entrance: 'glide',
  step: 1,
  textScale: 1,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>{roughFilter('io-edge', { scale: 9, freq: 0.03 })}</defs>
        {waveBand(c.frame, 1830, DEEP, 22, 46, 0.75)}
        {waveBand(c.frame + 40, 1870, SEA, 26, 34, 0.8)}
        {whale(c.frame)}
        {waveBand(c.frame + 90, 1905, '#3E84A8', 20, 27, 0.85)}
        {/* Stroke ridges catching light along the top edge, like a stormy sky band. */}
        {Array.from({ length: 9 }, (_, k) => (
          <path key={k} d={`M${k * 130 - 30} 26 q60 ${14 + Math.sin(c.frame / 50 + k) * 8} 120 4`} stroke={k % 3 ? DEEP : GOLD} strokeWidth={13} fill="none" opacity={0.28} strokeLinecap="round" filter="url(#io-edge)" />
        ))}
      </svg>
      <div style={weaveStyle(0.16)} />
      <div style={grainStyle({ color: '#2A1C08', alpha: 0.4, freq: 0.55, size: 200, seed: 5, stretch: [2.2, 0.7], opacity: 0.35 })} />
    </AbsoluteFill>
  ),
  caption: {
    size: 82,
    glyph: 0.58,
    entrance: 'glide',
    box: () => ({ background: hexA(DEEP, 0.88), padding: '20px 44px', borderRadius: 10, boxShadow: `inset 0 3px 0 ${hexA(FOAM, 0.35)}, inset 0 -6px 12px rgba(0,0,0,0.35), 0 14px 30px rgba(0,0,0,0.4)` }),
    word: (emphasis) => ({ color: emphasis ? GOLD : FOAM, fontFamily: undefined }),
  },
  hook: {
    top: 0.11,
    entrance: 'glide',
    box: () => ({ background: `linear-gradient(160deg, ${SEA}, ${DEEP})`, padding: '26px 44px', borderRadius: 12, boxShadow: `inset 0 4px 0 ${hexA(FOAM, 0.4)}, inset 0 -10px 18px rgba(0,0,0,0.35), 0 16px 36px rgba(0,0,0,0.45)` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 66, lineHeight: 1.08, color: FOAM }),
  },
  card: () => ({ background: `linear-gradient(165deg, ${hexA(SEA, 0.94)}, ${hexA(DEEP, 0.96)})`, borderRadius: 14, boxShadow: `inset 0 3px 0 ${hexA(FOAM, 0.35)}, inset 0 -8px 14px rgba(0,0,0,0.3), 0 16px 36px rgba(0,0,0,0.45)` }),
  title: (c) => ({ fontFamily: c.fonts.display, color: FOAM }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: hexA(FOAM, 0.9) }),
  number: (c) => ({ fontFamily: c.fonts.display, color: GOLD, textShadow: '0 3px 0 rgba(0,0,0,0.35)' }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: GOLD, textShadow: `0 4px 0 ${DEEP}, 0 10px 26px rgba(0,0,0,0.5)` }),
  SlamBack: ({ t }) => (
    <svg style={{ position: 'absolute', inset: '-35% -25%', opacity: t }} viewBox="0 0 400 300">
      <defs>{roughFilter('io-slam', { scale: 10, freq: 0.03 })}</defs>
      <ellipse cx={200} cy={150} rx={185} ry={105} fill={SEA} opacity={0.9} filter="url(#io-slam)" />
      <ellipse cx={200} cy={140} rx={150} ry={78} fill={DEEP} opacity={0.65} filter="url(#io-slam)" />
    </svg>
  ),
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 36, height: 26, borderRadius: '46% 54% 60% 40%', background: [GOLD, FOAM, SEA][k % 3], opacity: t, boxShadow: 'inset -5px -6px 0 rgba(0,0,0,0.25), inset 4px 5px 0 rgba(255,255,255,0.35)' }} />,
  Ring: ({ x, y, r, t }) => (
    <g>
      <defs>{roughFilter('io-ring', { scale: 8, freq: 0.03 })}</defs>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={GOLD} strokeWidth={11} opacity={0.9} filter="url(#io-ring)" />
    </g>
  ),
  stage: { shape: 'circle', fill: [SEA, DEEP], ring: GOLD, ringWidth: 6 },
  transition: {
    before: 6,
    after: 10,
    // Thick strokes sweep across like a palette knife, then wipe away.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-6, 0], [0, 1], clamp) : interpolate(d, [0, 10], [1, 0], clamp);
      if (cover <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <defs>{roughFilter('io-wipe', { scale: 10, freq: 0.025 })}</defs>
            {Array.from({ length: 7 }, (_, k) => {
              const w = (W + 300) * Math.max(0, Math.min(1, cover * 1.6 - k * 0.09));
              return <rect key={k} x={-150} y={k * (H / 7) - 8} width={w} height={H / 7 + 16} fill={k % 2 ? DEEP : SEA} opacity={0.97} filter="url(#io-wipe)" />;
            })}
          </svg>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 24, left: 40, width: (W - 80) * (c.frame / Math.max(1, total)), height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${SEA}, ${GOLD})`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4)' }} />
  ),
  sample: { type: 'counter', text: '$10,000', subtext: 'painted in thick strokes' },
};
