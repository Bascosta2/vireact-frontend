import { AbsoluteFill, interpolate } from 'remotion';
import { H, W, type StyleTheme } from '../theme';

/**
 * Flat Vector: a modern editorial illustration look. Smooth flat shapes, clean outlines, balanced color,
 * simple offset shadows. Motion is tidy and presentation-like: shapes slide in on eased curves, the
 * corner shapes drift on parallax layers, and a jump in the edit is three flat panels sweeping across.
 */

const CORAL = '#FF6B4A';
const TEAL = '#2EC4B6';
const SUN = '#FFD166';
const INK = '#1F2041';

const ease = (v: number) => 1 - Math.pow(1 - v, 3);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** The corner shapes: each slides in from its edge, then drifts at its own depth. */
function shapes({ frame }: { frame: number }) {
  const t = (delay: number) => interpolate(frame, [delay, delay + 18], [0, 1], { ...clamp, easing: ease });
  const drift = (depth: number, phase: number) => ({ x: Math.sin(frame / 50 + phase) * 10 * depth, y: Math.cos(frame / 64 + phase) * 8 * depth });
  const a = drift(1, 0);
  const b = drift(1.6, 1.4);
  const d = drift(0.8, 2.6);
  const e = drift(1.3, 3.3);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
      <circle cx={-30 + a.x - 220 * (1 - t(0))} cy={150 + a.y} r={130} fill={TEAL} />
      <circle cx={86 + a.x - 220 * (1 - t(0))} cy={230 + a.y} r={18} fill={SUN} />
      <rect x={890 + b.x + 260 * (1 - t(4))} y={110 + b.y} width={150} height={150} rx={34} fill={SUN} transform={`rotate(${18 + frame * 0.15} ${965 + b.x} ${185 + b.y})`} />
      <path d={`M${-10 + d.x - 200 * (1 - t(8))} ${1800 + d.y} a140 140 0 0 1 280 0 z`} fill={CORAL} />
      {Array.from({ length: 12 }, (_, k) => (
        <circle key={k} cx={890 + (k % 4) * 34 + e.x + 240 * (1 - t(10))} cy={1700 + Math.floor(k / 4) * 34 + e.y} r={7} fill={INK} opacity={0.75} />
      ))}
    </svg>
  );
}

export const flatVector: StyleTheme = {
  id: 'flat-vector',
  accent: CORAL,
  colors: [TEAL, SUN],
  footage: 'saturate(1.1) contrast(1.04) brightness(1.04)',
  entrance: 'glide',
  step: 1,
  textScale: 0.92,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {shapes({ frame: c.frame })}
    </AbsoluteFill>
  ),
  caption: {
    size: 70,
    glyph: 0.66,
    entrance: 'glide',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, background: '#fff', color: INK, borderRadius: 18, padding: '10px 28px 12px', boxShadow: `9px 9px 0 ${TEAL}` }),
    word: (emphasis) => ({ color: emphasis ? CORAL : INK }),
  },
  hook: {
    top: 0.13,
    entrance: 'glide',
    box: () => ({ background: '#fff', borderRadius: 26, padding: '26px 40px', boxShadow: `14px 14px 0 ${CORAL}` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: INK }),
    // A small flat badge tucked on the card's corner.
    Decor: ({ t }) => <div style={{ position: 'absolute', right: -22, top: -22, width: 54, height: 54, borderRadius: 999, background: TEAL, border: '6px solid #fff', transform: `scale(${t})` }} />,
  },
  card: () => ({ background: '#fff', borderRadius: 24, boxShadow: `12px 12px 0 ${TEAL}` }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: INK }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: CORAL }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#fff', textShadow: `12px 12px 0 ${CORAL}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#fff', textTransform: 'uppercase', textShadow: `10px 10px 0 ${INK}` }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', left: '-6%', right: '-6%', top: '8%', bottom: '4%', background: CORAL, borderRadius: 20, transform: `scaleX(${t}) skewX(-8deg)`, transformOrigin: '0% 50%' }} />,
  Marker: ({ k, t }) => (
    <span style={{ flex: 'none', width: 50, height: 50, borderRadius: 999, background: [CORAL, TEAL, SUN][k % 3], display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${t})` }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </span>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x + 10} cy={y + 10} r={r * t} fill="none" stroke={TEAL} strokeWidth={12} />
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={CORAL} strokeWidth={12} />
    </g>
  ),
  stage: { shape: 'circle', fill: [TEAL, '#25A99D'], ring: '#fff', ringWidth: 10 },
  transition: {
    before: 6,
    after: 9,
    // Three flat panels sweep across, staggered, covering the cut.
    Draw: ({ d }) => (
      <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
        {[SUN, TEAL, CORAL].map((color, k) => {
          const x = interpolate(d, [-6 + k * 1.5, -0.5 + k * 0.5, 3 + k * 1.5, 9], [-105, 0, 0, 105], { ...clamp, easing: (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2) });
          return <div key={color} style={{ position: 'absolute', inset: 0, background: color, transform: `translateX(${x}%)` }} />;
        })}
      </AbsoluteFill>
    ),
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, background: 'rgba(255,255,255,0.4)' }}>
      <div style={{ height: '100%', width: `${(c.frame / Math.max(1, total)) * 100}%`, background: CORAL }} />
    </div>
  ),
  sample: { type: 'counter', text: '3x', subtext: 'faster edits' },
};
