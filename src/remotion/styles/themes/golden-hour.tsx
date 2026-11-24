import { AbsoluteFill, interpolate } from 'remotion';
import { grainStyle, loop } from '../painted';
import { H, W, hexA, type StyleTheme } from '../theme';

/**
 * Golden Hour: warm opaque gouache at sunset — the low sun turning wheat gold and orange, long
 * shadows, a soft hazy sky and visible brush texture. The guide's field runs along the bottom: wheat
 * bends in waves of painted strokes and slides past, while a swallow swoops low in fast arcs with
 * sharp wingbeats, banks, and snaps an insect out of the air.
 */

const SUN = '#FF8C42';
const GOLD = '#F2B33D';
const WHEAT = '#D9932E';
const SHADOW = '#7A4A21';
const SKY = '#F7C98B';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Wheat heads along the bottom, bending in a travelling wave. */
function wheat(frame: number) {
  return Array.from({ length: 30 }, (_, k) => {
    const x = 20 + k * 36 + Math.sin(frame / 90 + k) * 6;
    const bend = Math.sin(frame / 26 - k * 0.55) * 16;
    const h = 130 + (k % 5) * 26;
    return (
      <g key={k} transform={`translate(${x} ${H - 30})`}>
        <path d={`M0 0 Q ${bend * 0.5} ${-h * 0.55} ${bend} ${-h}`} stroke={k % 4 ? WHEAT : GOLD} strokeWidth={6} fill="none" strokeLinecap="round" />
        {[-1, 0, 1].map((s) => (
          <ellipse key={s} cx={bend + s * 11} cy={-h - 8 - Math.abs(s) * -6} rx={7.5} ry={17} fill={k % 3 ? GOLD : SUN} transform={`rotate(${s * 24 + bend} ${bend + s * 11} ${-h})`} opacity={0.95} />
        ))}
      </g>
    );
  });
}

/** The swallow: swooping arcs across the upper frame, banking, with an insect ahead of it. */
function swallow(frame: number) {
  const p = loop(frame, 330);
  const x = -120 + p * (W + 240);
  const y = 330 + Math.sin(p * Math.PI * 3) * 130 - Math.sin(p * Math.PI) * 90;
  const bank = Math.cos(p * Math.PI * 3) * 26;
  const flap = Math.sin(frame * 1.9) * 30;
  const caught = p > 0.52 && p < 0.58;
  return (
    <g>
      {!caught && <circle cx={x + 120} cy={y - 8 + Math.sin(frame / 6) * 7} r={5.5} fill={SHADOW} opacity={0.85} />}
      <g transform={`translate(${x} ${y}) rotate(${bank})`}>
        <path d={`M-14 -4 Q-58 ${-26 - flap} -92 ${-16 - flap}`} stroke={SHADOW} strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d={`M12 -4 Q52 ${-30 + flap} 88 ${-20 + flap}`} stroke={SHADOW} strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d="M-52 4 Q0 -16 54 -4 Q30 14 -8 13 Q-40 12 -52 4 Z" fill="#3E2A18" />
        <path d="M-52 4 L-86 -12 L-78 8 L-88 22 Z" fill="#3E2A18" />
        <path d="M54 -4 L86 -1 L54 7 Z" fill="#3E2A18" />
        <circle cx={42} cy={-3} r={4} fill={SKY} />
        <path d="M-30 9 Q4 17 34 8" stroke={SKY} strokeWidth={4.6} fill="none" opacity={0.8} />
      </g>
    </g>
  );
}

export const goldenHour: StyleTheme = {
  id: 'golden-hour',
  accent: SUN,
  colors: [GOLD, SKY],
  footage: 'saturate(1.14) contrast(1.02) brightness(1.04) sepia(0.22)',
  entrance: 'glide',
  step: 1,
  textScale: 1,
  Overlay: ({ c }) => {
    const glow = 0.5 + Math.sin(c.frame / 47) * 0.08;
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 108%, ${hexA(SUN, glow * 0.5)} 0%, transparent 55%), linear-gradient(180deg, ${hexA(SKY, 0.4)} 0%, transparent 26%)`, mixBlendMode: 'soft-light' }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {/* Long shadows raking up from the bottom corners. */}
          <path d={`M0 ${H} L420 ${H} L120 ${H - 420} L0 ${H - 300} Z`} fill={SHADOW} opacity={0.14} />
          <path d={`M${W} ${H} L${W - 380} ${H} L${W - 90} ${H - 460} L${W} ${H - 320} Z`} fill={SHADOW} opacity={0.12} />
          {swallow(c.frame)}
          {wheat(c.frame)}
        </svg>
        <div style={grainStyle({ color: '#7A4A21', alpha: 0.42, freq: 0.65, size: 220, seed: 12, stretch: [1.9, 0.85], opacity: 0.36 })} />
      </AbsoluteFill>
    );
  },
  caption: {
    size: 82,
    glyph: 0.58,
    entrance: 'glide',
    box: () => ({ background: hexA('#4A2C12', 0.82), padding: '20px 44px', borderRadius: 16, boxShadow: `0 16px 32px rgba(74,44,18,0.45), inset 0 2px 0 ${hexA(SKY, 0.4)}` }),
    word: (emphasis) => ({ color: emphasis ? GOLD : '#FFF3DC' }),
  },
  hook: {
    top: 0.11,
    entrance: 'glide',
    box: () => ({ background: `linear-gradient(165deg, ${hexA('#B85C1E', 0.94)}, ${hexA('#7A4A21', 0.95)})`, padding: '26px 44px', borderRadius: 18, boxShadow: `0 18px 36px rgba(74,44,18,0.5), inset 0 3px 0 ${hexA(SKY, 0.5)}` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 66, lineHeight: 1.1, color: '#FFF3DC' }),
  },
  card: () => ({ background: `linear-gradient(165deg, ${hexA('#B85C1E', 0.94)}, ${hexA('#6E421E', 0.96)})`, borderRadius: 16, boxShadow: `0 16px 34px rgba(74,44,18,0.5), inset 0 3px 0 ${hexA(SKY, 0.45)}` }),
  title: (c) => ({ fontFamily: c.fonts.display, color: '#FFF3DC' }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: SKY }),
  number: (c) => ({ fontFamily: c.fonts.display, color: GOLD, textShadow: '0 3px 0 rgba(74,44,18,0.6)' }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: GOLD, textShadow: `0 4px 0 ${hexA('#7A4A21', 0.9)}, 0 12px 28px rgba(74,44,18,0.5)` }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', inset: '-38% -28%', background: `radial-gradient(circle, ${hexA(SKY, 0.95)} 0%, ${hexA(SUN, 0.75)} 55%, transparent 72%)`, transform: `scale(${0.55 + 0.45 * t})` }} />,
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 30, height: 38, borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%', background: [GOLD, SUN, WHEAT][k % 3], opacity: t, boxShadow: 'inset -5px -7px 0 rgba(122,74,33,0.45)' }} />,
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={SUN} strokeWidth={10} opacity={0.92} />
      <circle cx={x} cy={y} r={r * t * 1.14} fill="none" stroke={hexA(SKY, 0.6)} strokeWidth={4} />
    </g>
  ),
  stage: { shape: 'circle', fill: ['#B85C1E', '#7A4A21'], ring: SKY, ringWidth: 6, glow: hexA(SUN, 0.4) },
  transition: {
    before: 6,
    after: 11,
    // A band of low sunlight sweeps across the cut.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-6, 0], [0, 1], clamp) : interpolate(d, [0, 11], [1, 0], clamp);
      if (cover <= 0) return null;
      return <AbsoluteFill style={{ background: `linear-gradient(100deg, transparent ${38 - cover * 90}%, ${hexA(SKY, 0.95)} ${50 - cover * 40}%, ${hexA(SUN, 0.95)} ${58 - cover * 30}%, transparent ${78 - cover * 10}%)`, opacity: Math.min(1, cover * 1.5), pointerEvents: 'none' }} />;
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={36} style={{ position: 'absolute', top: 20, left: 0 }}>
      <line x1={40} y1={26} x2={W - 40} y2={26} stroke={hexA('#4A2C12', 0.5)} strokeWidth={5} />
      <line x1={40} y1={26} x2={40 + (W - 80) * (c.frame / Math.max(1, total))} y2={26} stroke={GOLD} strokeWidth={6} />
      <circle cx={40 + (W - 80) * (c.frame / Math.max(1, total))} cy={18} r={11} fill={SUN} opacity={0.95} />
    </svg>
  ),
  sample: { type: 'headline', text: 'Golden light', subtext: 'the last hour of the day' },
};
