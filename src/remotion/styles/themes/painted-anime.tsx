import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop } from '../painted';
import { H, W, hexA, noise, type StyleTheme } from '../theme';

/**
 * Painted Anime: a hand-painted anime film background in gouache — lush greens, big white cumulus
 * clouds in a blue sky, tiny flowers in the grass, visible brush texture. An original look with
 * original characters, not a copy of any film. The guide's meadow runs along the bottom: two kids
 * run through the grass with the camera alongside, drawn on twos (a new pose every 2 frames), hair
 * and clothes fluttering, while the clouds drift and the background layers slide past.
 */

const SKY = '#3D9BE9';
const SKY_PALE = '#BEE3F7';
const LEAF = '#58B368';
const DEEP_LEAF = '#2F7D46';
const SUNLIT = '#FFF6D8';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Drawn on twos: poses hold for 2 frames, like hand-drawn animation. */
const steppedFrame = (frame: number) => Math.floor(frame / 2) * 2;

/** A big cumulus cloud: stacked soft puffs, drifting slowly. */
function cloud(x: number, y: number, s: number, opacity = 0.95) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx={0} cy={0} rx={120} ry={52} fill="#FFFFFF" />
      <ellipse cx={-72} cy={16} rx={76} ry={38} fill="#FFFFFF" />
      <ellipse cx={74} cy={14} rx={82} ry={42} fill="#FFFFFF" />
      <ellipse cx={6} cy={-34} rx={70} ry={44} fill="#FFFFFF" />
      <ellipse cx={-30} cy={30} rx={100} ry={26} fill={SKY_PALE} opacity={0.75} />
    </g>
  );
}

/** One running kid, drawn on twos: limbs swing in held poses, hair and hem flutter. */
function kid(frame: number, base: number, colors: [string, string], phase: number, scale = 1) {
  const f = steppedFrame(frame + phase);
  const swing = Math.sin(f / 3.2) * 30;
  const bob = Math.abs(Math.sin(f / 3.2)) * 9;
  const x = base + Math.sin((frame + phase) / 300) * 130;
  return (
    <g transform={`translate(${x} ${1772 - bob}) scale(${scale})`}>
      {/* Legs mid-stride. */}
      <path d={`M0 -64 L${-16 - swing * 0.6} -8 L${-26 - swing * 0.7} 34`} stroke="#3A4A5A" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={`M2 -64 L${20 + swing * 0.6} -10 L${30 + swing * 0.7} 30`} stroke="#3A4A5A" strokeWidth={13} fill="none" strokeLinecap="round" />
      {/* Body and fluttering clothes. */}
      <path d={`M-17 -118 Q0 -128 17 -118 L21 -62 Q0 -52 -21 -62 Z`} fill={colors[0]} />
      <path d={`M-21 -62 Q-8 -72 2 -60 Q-10 -50 -21 -62 M21 -62 Q8 -52 -2 -60 Q12 -50 21 -62`} fill={colors[0]} opacity={0.85} transform={`translate(0 ${Math.sin(f / 2) * 3})`} />
      {/* Arms pumping. */}
      <path d={`M-15 -106 L${-34} ${-76 + swing * 0.5}`} stroke={colors[0]} strokeWidth={11} strokeLinecap="round" />
      <path d={`M15 -106 L${36} ${-78 - swing * 0.5}`} stroke={colors[0]} strokeWidth={11} strokeLinecap="round" />
      {/* Head and wind-blown hair. */}
      <circle cx={2} cy={-140} r={21} fill="#F6CFA8" />
      <path d={`M-19 -148 Q-24 -172 2 -174 Q26 -172 22 -146 Q12 -160 -2 -158 Q-14 -156 -19 -148 M22 -146 Q38 -140 40 -126 Q28 -128 20 -134`} fill={colors[1]} />
    </g>
  );
}

export const paintedAnime: StyleTheme = {
  id: 'painted-anime',
  accent: SKY,
  colors: [LEAF, SUNLIT],
  footage: 'saturate(1.12) contrast(1.0) brightness(1.05)',
  entrance: 'step',
  step: 2,
  textScale: 1,
  Overlay: ({ c, scene }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${hexA(SKY, 0.28)} 0%, transparent 24%, transparent 76%, ${hexA(DEEP_LEAF, 0.35)} 100%)`, mixBlendMode: 'soft-light' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {cloud(240 - loop(c.frame, 1600) * 90, 210, 1.05)}
        {cloud(830 - loop(c.frame, 2100) * 80, 330, 0.72, 0.9)}
        {cloud(560 - loop(c.frame, 2600) * 70, 130, 0.55, 0.85)}
        {/* Grass band with flowers, sliding past faster than the clouds. */}
        <path d={`M0 ${H} L0 1812 Q 270 ${1786 - Math.sin(c.frame / 40) * 5} 540 1806 T ${W} 1796 L${W} ${H} Z`} fill={LEAF} opacity={0.92} />
        <path d={`M0 ${H} L0 1866 Q 300 1844 600 1860 T ${W} 1852 L${W} ${H} Z`} fill={DEEP_LEAF} opacity={0.95} />
        {Array.from({ length: 24 }, (_, k) => {
          const x = ((k * 173 - c.frame * 2.2) % (W + 60) + W + 60) % (W + 60) - 30;
          const y = 1846 + (k % 4) * 18;
          return (
            <g key={k} transform={`translate(${x} ${y})`}>
              <path d={`M0 12 q${Math.sin(c.frame / 16 + k) * 5} -12 0 -20`} stroke={DEEP_LEAF} strokeWidth={3.4} fill="none" />
              <circle cx={Math.sin(c.frame / 16 + k) * 5} cy={-22} r={5.4} fill={k % 3 ? '#FFFFFF' : '#F6D365'} />
            </g>
          );
        })}
        {!scene && kid(c.frame, 330, ['#F2784B', '#5A3A2A'], 0)}
        {!scene && kid(c.frame, 520, ['#4A7FD4', '#2E2418'], 47, 0.88)}
      </svg>
      <div style={grainStyle({ color: '#2F5D33', alpha: 0.38, freq: 0.62, size: 230, seed: 14, stretch: [1.7, 0.9], opacity: 0.32 })} />
    </AbsoluteFill>
  ),
  Scene: ({ c }) => (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SKY} 0%, #6CB6EE 40%, ${SKY_PALE} 62%, ${LEAF} 66%, ${DEEP_LEAF} 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {cloud(300 - loop(c.frame, 2400) * 160, 520, 2.1)}
        {cloud(860 - loop(c.frame, 3000) * 120, 760, 1.5, 0.92)}
        {cloud(120 - loop(c.frame, 3600) * 100, 960, 1.1, 0.85)}
        <ellipse cx={260} cy={1300} rx={520} ry={120} fill="#7CC47A" />
        <ellipse cx={900} cy={1290} rx={480} ry={110} fill="#6DB86B" />
        <rect x={0} y={1290} width={W} height={H - 1290} fill={LEAF} />
        {/* Tiny white and yellow flowers in the grass. */}
        {Array.from({ length: 30 }, (_, k) => (
          <circle key={k} cx={noise(k, 41) * W} cy={1320 + noise(k, 42) * 560} r={5 + noise(k, 43) * 4} fill={k % 3 ? '#FFFFFF' : '#FFE066'} opacity={0.9} />
        ))}
        <g transform={focus(425, 1700, 540, 1330, 2.2)}>
          {kid(c.frame, 330, ['#F2784B', '#5A3A2A'], 0)}
          {kid(c.frame, 520, ['#4A7FD4', '#2E2418'], 47, 0.88)}
        </g>
      </svg>
    </AbsoluteFill>
  ),
  caption: {
    size: 82,
    glyph: 0.58,
    entrance: 'step',
    box: () => ({ background: hexA('#FFFFFF', 0.92), padding: '20px 44px', borderRadius: 999, boxShadow: '0 14px 30px rgba(31,77,43,0.35), inset 0 -5px 0 rgba(61,155,233,0.25)' }),
    word: (emphasis) => ({ color: emphasis ? '#E86A4E' : '#23405A' }),
  },
  hook: {
    top: 0.11,
    entrance: 'step',
    box: () => ({ background: hexA('#FFFFFF', 0.94), padding: '26px 46px', borderRadius: 30, boxShadow: '0 18px 36px rgba(31,77,43,0.35), inset 0 -6px 0 rgba(88,179,104,0.35)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, fontSize: 64, lineHeight: 1.14, color: '#23405A' }),
    Decor: ({ t }) => (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: -22, width: 'calc(100% + 44px)', height: 'calc(100% + 44px)', overflow: 'visible', opacity: t }}>
        <ellipse cx={26} cy={6} rx={30} ry={15} fill="#FFFFFF" stroke={hexA(SKY, 0.5)} strokeWidth={2.6} />
        <ellipse cx={46} cy={0} rx={22} ry={12} fill="#FFFFFF" stroke={hexA(SKY, 0.5)} strokeWidth={2.6} />
      </svg>
    ),
  },
  card: () => ({ background: hexA('#FFFFFF', 0.94), borderRadius: 26, boxShadow: '0 16px 34px rgba(31,77,43,0.32), inset 0 -6px 0 rgba(61,155,233,0.22)' }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, color: '#23405A' }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 700, color: '#3E6B8E' }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, color: '#E86A4E' }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 900, color: '#E86A4E', textShadow: '0 4px 0 rgba(255,255,255,0.9), 0 10px 24px rgba(31,77,43,0.3)' }),
  SlamBack: ({ t }) => (
    <svg style={{ position: 'absolute', inset: '-34% -24%', opacity: t }} viewBox="0 0 400 300">
      <ellipse cx={200} cy={168} rx={150} ry={58} fill="#FFFFFF" />
      <ellipse cx={140} cy={140} rx={88} ry={52} fill="#FFFFFF" />
      <ellipse cx={262} cy={138} rx={94} ry={56} fill="#FFFFFF" />
      <ellipse cx={200} cy={112} rx={76} ry={50} fill="#FFFFFF" />
    </svg>
  ),
  Marker: ({ k, t }) => (
    <span style={{ flex: 'none', width: 32, height: 32, opacity: t }}>
      <svg width={32} height={32} viewBox="0 0 32 32">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={16 + Math.cos((i / 5) * 6.28) * 8} cy={16 + Math.sin((i / 5) * 6.28) * 8} r={7} fill={k % 2 ? '#FFFFFF' : '#F6D365'} stroke={hexA('#2F7D46', 0.6)} strokeWidth={1.6} />
        ))}
        <circle cx={16} cy={16} r={4.6} fill="#E86A4E" />
      </svg>
    </span>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke="#FFFFFF" strokeWidth={11} opacity={0.95} />
      <circle cx={x} cy={y} r={r * t * 0.84} fill="none" stroke={SKY} strokeWidth={5} opacity={0.85} />
    </g>
  ),
  stage: { shape: 'circle', fill: [SKY_PALE, '#7FB8E8'], ring: '#FFFFFF', ringWidth: 7, glow: hexA(SKY, 0.35) },
  transition: {
    before: 7,
    after: 12,
    // A bank of cloud puffs crosses and clears.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-7, 0], [0, 1], clamp) : interpolate(d, [0, 12], [1, 0], clamp);
      if (cover <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: Math.min(1, cover * 1.6) }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <g transform={`translate(${-260 + cover * (W + 520)} 0)`}>
              {Array.from({ length: 9 }, (_, k) => (
                <ellipse key={k} cx={(k % 3) * 190 - 90} cy={300 + Math.floor(k / 3) * 560} rx={230} ry={150} fill="#FFFFFF" />
              ))}
              <ellipse cx={90} cy={860} rx={300} ry={190} fill="#FFFFFF" />
            </g>
          </svg>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={40} style={{ position: 'absolute', top: 18, left: 0 }}>
      <g transform={`translate(${40 + (W - 80) * (c.frame / Math.max(1, total))} 18)`}>
        <ellipse cx={0} cy={0} rx={34} ry={15} fill="#FFFFFF" opacity={0.95} />
        <ellipse cx={-18} cy={5} rx={20} ry={10} fill="#FFFFFF" opacity={0.95} />
        <ellipse cx={19} cy={5} rx={22} ry={11} fill="#FFFFFF" opacity={0.95} />
      </g>
      <line x1={40} y1={22} x2={40 + (W - 80) * (c.frame / Math.max(1, total))} y2={22} stroke={hexA('#FFFFFF', 0.65)} strokeWidth={4} />
    </svg>
  ),
  sample: { type: 'headline', text: 'Summer days', subtext: 'running through the grass' },
};
