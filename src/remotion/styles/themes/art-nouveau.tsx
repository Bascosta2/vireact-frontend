import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop } from '../painted';
import { H, W, hexA, type SceneCtx, type StyleTheme } from '../theme';
import { MARINE_VOCABULARY, drawMarine, resolveMarineId } from '../subjects/marine';

/**
 * Art Nouveau: a poster with flowing whiplash lines, a thick dark outline around every shape, flat
 * muted fills (sage, olive, gold ochre, cream, deep red), a circular halo with a fine pattern, and
 * stylised vines growing into the frame on aged lithograph paper. The guide's hummingbird hovers at
 * the side: blurred fast wingbeats, darting in to drink from a trumpet flower and backing out, while
 * the vines sway and the halo slowly turns. Shapes move as clean outlined pieces.
 */

const INK = '#2E2418';
const SAGE = '#8FA382';
const OLIVE = '#5C6E46';
const GOLD = '#C9982F';
const CREAM = '#F1E7CE';
const RED = '#9E2B25';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** A corner vine: whiplash stems with leaves, swaying gently. `flip` mirrors it. */
function vine(frame: number, flip = 1, top = false) {
  const sway = Math.sin(frame / 52) * 5;
  return (
    <g transform={`translate(${flip > 0 ? 54 : W - 54} ${top ? 66 : H - 66}) scale(${flip} ${top ? 1 : -1})`} opacity={0.92}>
      <path d={`M0 0 C 60 ${-70 + sway} 30 ${-150 + sway} 96 ${-196 + sway}`} stroke={OLIVE} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M8 -52 q44 -6 58 -40 M20 -118 q40 2 62 -26`} stroke={OLIVE} strokeWidth={6.4} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M${14 + k * 17} ${-44 - k * 36} q26 ${-8 + sway} 34 -30 q-24 2 -34 30 Z`} fill={k % 2 ? SAGE : OLIVE} stroke={INK} strokeWidth={3.4} />
      ))}
      <circle cx={100} cy={-204 + sway} r={13} fill={GOLD} stroke={INK} strokeWidth={3.4} />
    </g>
  );
}

/** The hummingbird at its flower, right of frame: hover, dart in, drink, back out. */
function hummingbird(frame: number) {
  const p = loop(frame, 240);
  const dart = p < 0.3 ? interpolate(p, [0, 0.3], [0, 1], { ...clamp, easing: (v) => v * v * (3 - 2 * v) }) : p < 0.55 ? 1 : interpolate(p, [0.55, 0.85], [1, 0], { ...clamp, easing: (v) => v * v * (3 - 2 * v) });
  const x = 760 - dart * 130;
  const y = 560 + Math.sin(frame / 7) * 9 - dart * 30;
  const wing = Math.sin(frame * 2.6) * 34;
  return (
    <g>
      {/* Trumpet flower on a long stem. */}
      <path d="M700 900 Q 690 720 668 640" stroke={OLIVE} strokeWidth={9} fill="none" />
      <g transform="translate(662 624) rotate(-38)">
        <path d="M0 0 L86 -26 Q104 0 86 26 Z" fill={RED} stroke={INK} strokeWidth={4.4} />
        <path d="M10 0 L70 -14 M10 4 L66 12" stroke={hexA(CREAM, 0.65)} strokeWidth={4} />
      </g>
      <g transform={`translate(${x} ${y})`}>
        {/* Blurred wings: fast overlapping strokes. */}
        <path d={`M-6 -12 Q-52 ${-58 - wing} -84 ${-44 - wing}`} stroke={SAGE} strokeWidth={13} fill="none" opacity={0.55} strokeLinecap="round" />
        <path d={`M-2 -14 Q-30 ${-64 + wing} -58 ${-52 + wing}`} stroke={OLIVE} strokeWidth={11} fill="none" opacity={0.5} strokeLinecap="round" />
        <path d="M-58 6 Q-6 -20 44 -8 Q74 0 62 16 Q30 34 -18 26 Q-52 20 -58 6 Z" fill={SAGE} stroke={INK} strokeWidth={4.4} />
        <path d="M44 -8 Q96 -2 128 4" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <circle cx={38} cy={-2} r={5} fill={INK} />
        <path d="M-52 12 L-96 30 L-88 2 Z" fill={OLIVE} stroke={INK} strokeWidth={4} />
        <path d="M-20 22 Q10 34 40 20" stroke={GOLD} strokeWidth={6} fill="none" opacity={0.8} />
      </g>
    </g>
  );
}

export const artNouveau: StyleTheme = {
  id: 'art-nouveau',
  accent: GOLD,
  colors: [SAGE, RED],
  footage: 'saturate(0.88) contrast(1.0) brightness(1.03) sepia(0.16)',
  entrance: 'glide',
  step: 1,
  textScale: 1,
  mascotSubjects: ['hummingbird', 'vine', 'flower', 'bird', 'halo', 'poster'],
  subjectVocabulary: [...MARINE_VOCABULARY],
  SubjectDraw: ({ c, subject, subjectVisualId }) => {
    const id = resolveMarineId(subject, subjectVisualId);
    return id ? drawMarine(id, c.frame, { body: '#C45B7A', accent: '#E8C547', ink: '#2B1D1A', shadow: 'rgba(0,0,0,0.35)' }) : null;
  },
  Overlay: ({ c, scene }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* The poster frame: double rule with corner ornaments. */}
        <rect x={26} y={26} width={W - 52} height={H - 52} fill="none" stroke={INK} strokeWidth={5} opacity={0.75} />
        <rect x={44} y={44} width={W - 88} height={H - 88} fill="none" stroke={GOLD} strokeWidth={2.6} opacity={0.8} />
        {/* Halo with a slowly turning pattern, top left. */}
        <g transform={`translate(215 300)`}>
          <circle r={128} fill={hexA(CREAM, 0.32)} stroke={GOLD} strokeWidth={4} />
          <g transform={`rotate(${c.frame / 6})`} opacity={0.75}>
            {Array.from({ length: 12 }, (_, k) => (
              <path key={k} d="M0 -118 q14 30 0 62 q-14 -30 0 -62" fill={k % 2 ? SAGE : GOLD} stroke={INK} strokeWidth={2.4} transform={`rotate(${k * 30})`} />
            ))}
          </g>
          <circle r={44} fill="none" stroke={INK} strokeWidth={3.4} opacity={0.7} />
        </g>
        {vine(c.frame, 1, true)}
        {vine(c.frame, -1, true)}
        {vine(c.frame, 1)}
        {vine(c.frame, -1)}
        {!scene && hummingbird(c.frame)}
      </svg>
      <div style={grainStyle({ color: '#6B5322', alpha: 0.4, freq: 0.8, size: 240, seed: 8, opacity: 0.38 })} />
    </AbsoluteFill>
  ),
  Scene: ({ c }) => (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, #F6EEDA 0%, ${CREAM} 55%, #DCCDA6 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* The halo behind the bird: a fine pattern that slowly turns. */}
        <g transform={`rotate(${c.frame * 0.25} 520 860)`}>
          <circle cx={520} cy={860} r={360} fill={hexA(GOLD, 0.25)} stroke={INK} strokeWidth={6} />
          <circle cx={520} cy={860} r={320} fill="none" stroke={GOLD} strokeWidth={10} strokeDasharray="4 22" />
          <circle cx={520} cy={860} r={270} fill="none" stroke={INK} strokeWidth={2.5} strokeDasharray="30 10" opacity={0.6} />
          {Array.from({ length: 24 }, (_, k) => (
            <ellipse key={k} cx={520} cy={860 - 340} rx={10} ry={22} fill={SAGE} stroke={INK} strokeWidth={2} transform={`rotate(${k * 15} 520 860)`} />
          ))}
        </g>
        {/* Sweeping leaves in the lower half. */}
        {[0, 1, 2, 3].map((k) => (
          <path key={k} d={`M${k * 280 - 40} ${H} Q${k * 280 + 60} ${1350 - k * 30} ${k * 280 + 230 + Math.sin(c.frame / 40 + k) * 18} ${1280 + (k % 2) * 60} Q${k * 280 + 120} ${1500} ${k * 280 + 120} ${H} Z`} fill={k % 2 ? SAGE : OLIVE} stroke={INK} strokeWidth={5} />
        ))}
        <g transform={focus(700, 650, 540, 860, 1.9)}>{hummingbird(c.frame)}</g>
      </svg>
    </AbsoluteFill>
  ),
  caption: {
    size: 80,
    glyph: 0.58,
    entrance: 'glide',
    box: () => ({ background: CREAM, padding: '20px 44px', border: `4px solid ${INK}`, borderRadius: '46% 54% 52% 48% / 22px 26px 24px 28px', boxShadow: `0 0 0 3px ${GOLD}, 0 14px 28px rgba(46,36,24,0.35)` }),
    word: (emphasis) => ({ color: emphasis ? RED : INK }),
  },
  hook: {
    top: 0.115,
    entrance: 'glide',
    box: () => ({ background: CREAM, padding: '28px 46px', border: `4.5px solid ${INK}`, borderRadius: 26, boxShadow: `0 0 0 3px ${GOLD}, 0 18px 34px rgba(46,36,24,0.4)` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 66, lineHeight: 1.14, color: INK, letterSpacing: 1 }),
    Decor: ({ t }) => (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: -18, width: 'calc(100% + 36px)', height: 'calc(100% + 36px)', overflow: 'visible', opacity: t }}>
        <path d="M4 30 q-6 -24 16 -28 M4 58 q-18 -10 -14 -30" stroke={OLIVE} strokeWidth={4} fill="none" />
        <path d="M14 2 q16 0 20 14 q-16 2 -20 -14" fill={SAGE} stroke={INK} strokeWidth={2.6} />
      </svg>
    ),
  },
  card: () => ({ background: CREAM, border: `4px solid ${INK}`, borderRadius: 22, boxShadow: `0 0 0 3px ${GOLD}, 0 16px 32px rgba(46,36,24,0.38)` }),
  title: (c) => ({ fontFamily: c.fonts.display, color: INK, letterSpacing: 0.6 }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: OLIVE }),
  number: (c) => ({ fontFamily: c.fonts.display, color: RED }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: RED, textShadow: `0 3px 0 ${CREAM}, 0 6px 0 ${hexA(INK, 0.75)}` }),
  SlamBack: ({ t }) => (
    <svg style={{ position: 'absolute', inset: '-38% -28%', opacity: t }} viewBox="0 0 400 300">
      <circle cx={200} cy={150} r={118} fill={hexA(CREAM, 0.95)} stroke={GOLD} strokeWidth={6} />
      {Array.from({ length: 10 }, (_, k) => (
        <path key={k} d="M200 32 q16 34 0 74 q-16 -34 0 -74" fill={k % 2 ? SAGE : GOLD} stroke={INK} strokeWidth={3} transform={`rotate(${k * 36} 200 150)`} />
      ))}
    </svg>
  ),
  Marker: ({ k, t }) => (
    <span style={{ flex: 'none', width: 34, height: 34, opacity: t }}>
      <svg width={34} height={34} viewBox="0 0 34 34">
        <path d="M17 3 q10 12 0 28 q-10 -16 0 -28" fill={[RED, GOLD, SAGE][k % 3]} stroke={INK} strokeWidth={2.6} />
      </svg>
    </span>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={INK} strokeWidth={7} />
      <circle cx={x} cy={y} r={r * t * 0.88} fill="none" stroke={GOLD} strokeWidth={3.4} />
    </g>
  ),
  stage: { shape: 'circle', fill: [CREAM, '#E4D3A8'], ring: INK, ringWidth: 6 },
  transition: {
    before: 7,
    after: 12,
    // Two ornamental arches close over the cut like poster panels, then open.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-7, 0], [0, 1], clamp) : interpolate(d, [0, 12], [1, 0], clamp);
      if (cover <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: hexA(CREAM, 0.97), transform: `translateX(${(1 - cover) * -100}%)`, borderRight: `6px solid ${INK}`, boxShadow: '40px 0 60px rgba(46,36,24,0.35)' }}>
            <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
              <circle cx={W / 2} cy={H / 2} r={210} fill="none" stroke={GOLD} strokeWidth={5} />
              <circle cx={W / 2} cy={H / 2} r={168} fill="none" stroke={INK} strokeWidth={3.4} />
              {Array.from({ length: 8 }, (_, k) => (
                <path key={k} d={`M${W / 2} ${H / 2 - 205} q15 32 0 68 q-15 -32 0 -68`} fill={k % 2 ? SAGE : GOLD} stroke={INK} strokeWidth={2.6} transform={`rotate(${k * 45} ${W / 2} ${H / 2})`} />
              ))}
            </svg>
          </div>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={30} style={{ position: 'absolute', top: 56, left: 0 }}>
      <path d={`M60 15 Q ${W / 2} ${2 + Math.sin(c.frame / 40) * 3} ${W - 60} 15`} stroke={hexA(INK, 0.4)} strokeWidth={3.4} fill="none" />
      <path d={`M60 15 Q ${W / 2} 4 ${60 + (W - 120) * (c.frame / Math.max(1, total))} 15`} stroke={GOLD} strokeWidth={4.4} fill="none" />
    </svg>
  ),
  sample: { type: 'headline', text: 'In flowing lines', subtext: 'a poster come to life' },
};
