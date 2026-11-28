import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop } from '../painted';
import { H, W, hexA, noise, type SceneCtx, type StyleTheme } from '../theme';
import { MARINE_VOCABULARY, drawMarine, resolveMarineId } from '../subjects/marine';

/**
 * Nocturne Gouache: a night painting in opaque layers of blue and green, matte bristle texture, the
 * moonlight as a pale edge. The guide's meadow lives around the frame: the moon glows behind thin
 * clouds at the top, a deer steps along the bottom and lifts its head, fireflies rise and blink, and
 * the grass sways. The light is painted on: each firefly is a warm dab that brightens and fades.
 */

const NIGHT = '#14243E';
const PINE = '#1E4038';
const MOON = '#E9EDD8';
const FIREFLY = '#FFC978';
const MIST = '#8FB4C7';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const FLIES = Array.from({ length: 22 }, (_, k) => ({ x: noise(k, 11) * W, base: 1500 + noise(k, 12) * 380, speed: 90 + noise(k, 13) * 90, phase: noise(k, 14) * 6.28, blink: 55 + k * 7 }));

/** A simple deer silhouette walking slowly along the bottom, head lifting now and then. */
function deer(frame: number) {
  const step = Math.sin(frame / 9);
  const head = interpolate(Math.sin(frame / 110), [-1, -0.2, 0.6, 1], [0, 0, -14, -14], clamp);
  const x = 150 + Math.sin(frame / 240) * 60;
  return (
    <g transform={`translate(${x} 1695)`} opacity={0.95}>
      <path d="M0 60 Q10 18 70 12 L150 10 Q205 12 214 52 L218 96 L204 96 L196 58 Q120 70 66 60 L52 98 L38 98 L44 58 Q12 66 0 60 Z" fill={NIGHT} />
      <g transform={`rotate(${head} 205 22)`}>
        <path d="M196 30 Q226 -8 252 -14 L258 2 Q236 10 224 34 Q210 44 196 30 Z" fill={NIGHT} />
        <path d="M238 -12 L232 -38 M246 -10 L248 -34" stroke={NIGHT} strokeWidth={6} strokeLinecap="round" />
        <circle cx={246} cy={2} r={3.4} fill={FIREFLY} />
      </g>
      <path d="M52 96 l-8 44 M66 96 l6 44 M196 96 l-6 44 M208 96 l10 42" stroke={NIGHT} strokeWidth={11} strokeLinecap="round" transform={`rotate(${step * 3} 120 96)`} />
      <path d="M214 48 Q236 60 232 84" stroke={MOON} strokeWidth={4} fill="none" opacity={0.55} strokeLinecap="round" />
    </g>
  );
}

export const nocturneGouache: StyleTheme = {
  id: 'nocturne-gouache',
  accent: FIREFLY,
  colors: [PINE, MOON],
  footage: 'saturate(0.82) contrast(1.02) brightness(0.88) hue-rotate(-8deg)',
  entrance: 'fade',
  step: 1,
  textScale: 1,
  mascotSubjects: ['deer', 'firefly', 'night', 'moonlight', 'meadow', 'grass'],
  subjectVocabulary: [...MARINE_VOCABULARY],
  SubjectDraw: ({ c, subject, subjectVisualId }) => {
    const id = resolveMarineId(subject, subjectVisualId);
    return id ? drawMarine(id, c.frame, { body: '#A7C4A0', accent: '#F4E28D', ink: '#1B2430', shadow: 'rgba(0,0,0,0.35)' }) : null;
  },
  Overlay: ({ c, scene }) => {
    const cloud = loop(c.frame, 900) * 260 - 130;
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${hexA(NIGHT, 0.5)} 0%, transparent 22%, transparent 78%, ${hexA(PINE, 0.55)} 100%)`, mixBlendMode: 'multiply' }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          {/* Moon with thin clouds crossing, top right. */}
          <circle cx={880} cy={215} r={86} fill={MOON} opacity={0.92} />
          <circle cx={880} cy={215} r={120} fill="none" stroke={MOON} strokeWidth={26} opacity={0.14} />
          <ellipse cx={880 + cloud} cy={200} rx={190} ry={30} fill={NIGHT} opacity={0.5} />
          <ellipse cx={830 + cloud * 1.4} cy={248} rx={150} ry={22} fill={NIGHT} opacity={0.4} />
          {/* Tree line along the top left. */}
          {Array.from({ length: 7 }, (_, k) => (
            <path key={k} d={`M${k * 74 - 10} 0 l26 108 l26 -108 Z`} fill={PINE} opacity={0.85} />
          ))}
          {!scene && deer(c.frame)}
          {/* Grass along the bottom, swaying. */}
          {Array.from({ length: 26 }, (_, k) => {
            const x = 30 + k * 41;
            const sway = Math.sin(c.frame / 34 + k * 1.3) * 9;
            return <path key={k} d={`M${x} ${H} q${sway} -70 ${sway * 1.7} -${110 + (k % 4) * 22}`} stroke={k % 3 ? PINE : MIST} strokeWidth={6} fill="none" opacity={0.75} strokeLinecap="round" />;
          })}
          {/* Fireflies: warm dabs that brighten and fade as they rise and drift. */}
          {FLIES.map((f, k) => {
            const rise = loop(c.frame, f.speed * 3, f.phase * 40) * 190;
            const on = Math.max(0, Math.sin(c.frame / f.blink * 6.28 + f.phase));
            const x = f.x + Math.sin(c.frame / 47 + f.phase) * 36;
            return (
              <g key={k}>
                <circle cx={x} cy={f.base - rise} r={13} fill={FIREFLY} opacity={0.16 * on} />
                <circle cx={x} cy={f.base - rise} r={4.6} fill={FIREFLY} opacity={0.25 + 0.75 * on} />
              </g>
            );
          })}
        </svg>
        <div style={grainStyle({ color: '#0A1420', alpha: 0.5, freq: 0.7, size: 220, seed: 9, stretch: [1.8, 0.8], opacity: 0.4 })} />
      </AbsoluteFill>
    );
  },
  Scene: ({ c }) => {
    const pines = (base: number, seed: number) =>
      `M0 ${H} L0 ${base} ` + Array.from({ length: 17 }, (_, k) => `L${k * 68 + 34} ${base - 90 - noise(k, seed) * 150} L${k * 68 + 68} ${base}`).join(' ') + ` L${W} ${H} Z`;
    return (
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #08111F 0%, ${NIGHT} 42%, #1C3346 64%, ${PINE} 100%)` }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={780} cy={420} r={190} fill={MOON} opacity={0.1} />
          <circle cx={780} cy={420} r={105} fill={MOON} opacity={0.95} />
          {[0, 1].map((k) => <ellipse key={k} cx={((c.frame * 0.6 + k * 600) % 1600) - 260} cy={400 + k * 80} rx={260} ry={24} fill={MIST} opacity={0.3} />)}
          <path d={pines(1040, 3)} fill="#0C1F1C" />
          <path d={pines(1150, 8)} fill={PINE} />
          <rect x={0} y={1180} width={W} height={H - 1180} fill="#173A32" />
          {/* Moonlight pooled on the meadow, so the dark deer reads as a silhouette. */}
          <ellipse cx={540} cy={1170} rx={480} ry={300} fill={MOON} opacity={0.14} style={{ filter: 'blur(30px)' }} />
          <ellipse cx={540} cy={1120} rx={330} ry={190} fill={MIST} opacity={0.22} style={{ filter: 'blur(24px)' }} />
          <g transform={focus(280, 1755, 540, 1170, 2.6)}>{deer(c.frame)}</g>
          {/* Fireflies rising around the deer, each a warm dab that brightens and fades. */}
          {Array.from({ length: 18 }, (_, k) => {
            const x = 120 + noise(k, 21) * 840 + Math.sin(c.frame / 40 + k) * 30;
            const y = 1500 - ((c.frame * (0.8 + noise(k, 22)) + noise(k, 23) * 900) % 900);
            const on = 0.25 + 0.75 * Math.max(0, Math.sin(c.frame / (12 + (k % 5) * 3) + k));
            return (
              <g key={k} opacity={on}>
                <circle cx={x} cy={y} r={18} fill={FIREFLY} opacity={0.18} />
                <circle cx={x} cy={y} r={6} fill={FIREFLY} />
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
    );
  },
  caption: {
    size: 80,
    glyph: 0.6,
    entrance: 'fade',
    box: () => ({ background: hexA(NIGHT, 0.86), padding: '20px 42px', borderRadius: 14, boxShadow: `0 14px 30px rgba(0,0,0,0.5), inset 0 2px 0 ${hexA(MIST, 0.3)}` }),
    word: (emphasis) => ({ color: emphasis ? FIREFLY : MOON }),
  },
  hook: {
    top: 0.12,
    entrance: 'fade',
    box: () => ({ background: hexA(NIGHT, 0.9), padding: '26px 44px', borderRadius: 16, boxShadow: `0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 2px ${hexA(MIST, 0.35)}` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, fontSize: 64, lineHeight: 1.12, color: MOON }),
    Decor: ({ c, t }) => (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: t }}>
        {Array.from({ length: 6 }, (_, k) => (
          <circle key={k} cx={`${8 + noise(k, 21) * 84}%`} cy={`${noise(k, 22) > 0.5 ? 108 : -8}%`} r={4} fill={FIREFLY} opacity={0.4 + 0.6 * Math.max(0, Math.sin(c.frame / 40 + k * 1.7))} />
        ))}
      </svg>
    ),
  },
  card: () => ({ background: hexA(NIGHT, 0.92), borderRadius: 16, boxShadow: `0 16px 36px rgba(0,0,0,0.5), inset 0 0 0 2px ${hexA(PINE, 0.8)}` }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: MOON }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 500, color: MIST }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: FIREFLY, textShadow: `0 0 26px ${hexA(FIREFLY, 0.45)}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: FIREFLY, textShadow: `0 0 34px ${hexA(FIREFLY, 0.55)}, 0 6px 18px rgba(0,0,0,0.6)` }),
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 30, height: 30, borderRadius: 999, background: k % 3 ? PINE : FIREFLY, opacity: t, boxShadow: `0 0 14px ${hexA(FIREFLY, 0.5)}` }} />,
  Ring: ({ x, y, r, t }) => <circle cx={x} cy={y} r={r * t} fill="none" stroke={MOON} strokeWidth={8} opacity={0.85} />,
  stage: { shape: 'circle', fill: [PINE, NIGHT], ring: MOON, ringWidth: 5, glow: hexA(MOON, 0.25) },
  transition: {
    before: 7,
    after: 12,
    // Night deepens over the cut and lifts again, a few fireflies crossing.
    Draw: ({ c, d }) => {
      const dark = d < 0 ? interpolate(d, [-7, 0], [0, 1], clamp) : interpolate(d, [0, 12], [1, 0], clamp);
      if (dark <= 0) return null;
      return (
        <AbsoluteFill style={{ background: hexA('#081120', dark * 0.92), pointerEvents: 'none' }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 10 }, (_, k) => (
              <circle key={k} cx={noise(k, 31) * W} cy={300 + noise(k, 32) * 1200 + Math.sin(c.frame / 30 + k) * 20} r={5} fill={FIREFLY} opacity={dark * (0.4 + 0.6 * Math.max(0, Math.sin(c.frame / 26 + k * 2)))} />
            ))}
          </svg>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={30} style={{ position: 'absolute', top: 24, left: 0 }}>
      <circle cx={40 + (W - 80) * (c.frame / Math.max(1, total))} cy={14} r={9} fill={MOON} opacity={0.9} />
      <line x1={40} y1={14} x2={40 + (W - 80) * (c.frame / Math.max(1, total))} y2={14} stroke={MOON} strokeWidth={3} opacity={0.35} />
    </svg>
  ),
  sample: { type: 'headline', text: 'Quiet nights', subtext: 'fireflies over the meadow' },
};
