import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop, roughFilter } from '../painted';
import { H, W, hexA, noise, type SceneCtx, type StyleTheme } from '../theme';
import { MARINE_VOCABULARY, drawMarine, resolveMarineId } from '../subjects/marine';

/**
 * Watercolour: soft washes with blooms and hard dried edges on cold-press paper, a few colours (warm koi
 * against a cool blue-green pond). The guide's koi pond lives along the bottom of the frame: three koi
 * glide on curving paths with their bodies flexing head to tail, lily pads drift and turn, broken ripple
 * rings spread and fade. The paint moves; the paper grain stays fixed to the frame.
 */

const KOI_RED = '#E0533A';
const POND = '#2E8B86';
const POND_PALE = '#A9D8D2';
const LOTUS = '#E58FB1';
const INDIGO = '#1F3B57';
const PAPER = '#F8F2E4';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const KOI = [
  { body: KOI_RED, spots: null, y: 1770, speed: 2.1, phase: 0, size: 1 },
  { body: '#F0A04B', spots: null, y: 1690, speed: 1.6, phase: 520, size: 0.85 },
  { body: '#F6F1E7', spots: KOI_RED, y: 1850, speed: 1.3, phase: 980, size: 0.95 },
];
const PADS = [
  { x: 120, y: 1650, r: 58, lotus: false },
  { x: 930, y: 1720, r: 70, lotus: true },
  { x: 560, y: 1880, r: 50, lotus: false },
  { x: 1000, y: 230, r: 46, lotus: false },
  { x: 70, y: 300, r: 40, lotus: false },
];

/** One koi: a body that flexes in an S wave, a tail that trails, side fins. */
function koi(k: number, frame: number) {
  const f = KOI[k];
  const travel = W + 400;
  const x = ((frame * f.speed + f.phase) % travel) - 200;
  const y = f.y + Math.sin((frame + f.phase) / 38) * 26;
  const heading = Math.cos((frame + f.phase) / 38) * 14;
  const wave = (i: number) => Math.sin(frame / 5 - i * 0.9) * 9 * (i / 4);
  // The spine from head (i = 0) to tail (i = 4), each point swinging a little more.
  const spine = [0, 1, 2, 3, 4].map((i) => [-i * 26, wave(i)]);
  const top = spine.map(([sx, sy], i) => `${sx},${sy - (22 - i * 4.5)}`).join(' L');
  const bottom = [...spine].reverse().map(([sx, sy], i) => `${sx},${sy + (22 - (4 - i) * 4.5)}`).join(' L');
  const [tx, ty] = spine[4];
  const tail = Math.sin(frame / 5 - 4) * 22;
  return (
    <g key={k} transform={`translate(${x} ${y}) rotate(${heading}) scale(${f.size})`} filter="url(#wc-edge)">
      <path d={`M${tx} ${ty} l-46 ${-24 + tail} q10 ${24} 0 ${48} z`} fill={f.body} opacity={0.7} />
      <ellipse cx={-30} cy={-24 + wave(1)} rx={16} ry={7} fill={f.body} opacity={0.55} transform={`rotate(${-30 + wave(1) * 2} -30 ${-24})`} />
      <ellipse cx={-30} cy={24 + wave(1)} rx={16} ry={7} fill={f.body} opacity={0.55} transform={`rotate(${30 - wave(1) * 2} -30 24)`} />
      <path d={`M24,0 Q20,-24 ${top} L${bottom} Q20,24 24,0 z`} fill={f.body} opacity={0.82} />
      {f.spots && <ellipse cx={-14} cy={wave(1) - 4} rx={14} ry={9} fill={f.spots} opacity={0.75} />}
      {f.spots && <ellipse cx={-62} cy={wave(2) + 6} rx={10} ry={6} fill={f.spots} opacity={0.7} />}
      <circle cx={12} cy={-8} r={2.5} fill={INDIGO} opacity={0.7} />
    </g>
  );
}

function pad(k: number, frame: number) {
  const p = PADS[k];
  const turn = Math.sin(frame / 70 + k) * 10;
  const dx = Math.sin(frame / 90 + k * 2) * 8;
  return (
    <g key={k} transform={`translate(${p.x + dx} ${p.y}) rotate(${turn + k * 50})`}>
      <path d={`M0 0 L${p.r} -8 A${p.r} ${p.r} 0 1 1 ${p.r} 8 Z`} fill="#5E9C5A" opacity={0.78} filter="url(#wc-edge)" />
      <path d={`M0 0 L${-p.r * 0.7} ${p.r * 0.3} M0 0 L${-p.r * 0.2} ${-p.r * 0.75}`} stroke="#3E7343" strokeWidth={2} opacity={0.5} />
      {p.lotus &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <ellipse key={i} cx={0} cy={-22} rx={11} ry={24} fill={LOTUS} opacity={0.75} transform={`rotate(${i * 60 + Math.sin(frame / 50) * 4})`} />
        ))}
      {p.lotus && <circle r={9} fill="#F4C85C" opacity={0.9} />}
    </g>
  );
}

/** A broken painted ring that grows and fades. */
function ripple(x: number, y: number, frame: number, offset: number) {
  const p = loop(frame, 75, offset);
  return <ellipse key={`${x}-${offset}`} cx={x} cy={y} rx={30 + 120 * p} ry={(30 + 120 * p) * 0.45} fill="none" stroke={POND} strokeWidth={4 - 2 * p} strokeDasharray="38 14 22 18" opacity={0.55 * (1 - p)} />;
}

const wash = (color: string, a = 0.9) => `radial-gradient(ellipse at 50% 55%, ${hexA(color, a)} 0%, ${hexA(color, a * 0.8)} 52%, ${hexA(color, 0)} 72%)`;

export const watercolour: StyleTheme = {
  id: 'watercolour',
  accent: KOI_RED,
  colors: [POND, LOTUS],
  footage: 'saturate(0.88) contrast(0.95) brightness(1.06) sepia(0.08)',
  entrance: 'fade',
  step: 1,
  textScale: 1,
  mascotSubjects: ['koi', 'fish', 'pond', 'water', 'ripple'],
  subjectVocabulary: [...MARINE_VOCABULARY],
  SubjectDraw: ({ c, subject, subjectVisualId }) => {
    const id = resolveMarineId(subject, subjectVisualId);
    return id ? drawMarine(id, c.frame, { body: '#E07A5F', accent: '#81B29A', ink: '#3D405B', shadow: 'rgba(0,0,0,0.35)' }) : null;
  },
  Overlay: ({ c, scene }) => {
    // One sun glint crosses the water every few seconds.
    const glint = loop(c.frame, 180);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {/* The pond washes in from the bottom and top edges, the picture stays clear in the middle. */}
        <AbsoluteFill style={{ background: `linear-gradient(180deg, ${hexA(POND_PALE, 0.75)} 0%, transparent 17%, transparent 80%, ${hexA(POND_PALE, 0.85)} 92%, ${hexA(POND, 0.75)} 100%)`, mixBlendMode: 'multiply' }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>{roughFilter('wc-edge', { scale: 7, freq: 0.05, blur: 0.8 })}</defs>
          {PADS.map((p, k) => ripple(p.x, p.y, c.frame, k * 25))}
          {ripple(((c.frame * KOI[0].speed + KOI[0].phase) % (W + 400)) - 220, KOI[0].y, c.frame, 10)}
          {PADS.map((_, k) => pad(k, c.frame))}
          {!scene && KOI.map((_, k) => koi(k, c.frame))}
          <ellipse cx={-100 + glint * 1300} cy={1760} rx={90} ry={10} fill="#ffffff" opacity={0.35 * Math.sin(glint * Math.PI)} />
        </svg>
        {/* Cold-press paper: grain fixed to the frame, and the unpainted paper at the very edge. */}
        <div style={grainStyle({ color: '#6B5A3A', alpha: 0.45, freq: 0.9, size: 240, seed: 7, opacity: 0.55 })} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 14px ${PAPER}, inset 0 0 40px 22px ${hexA(PAPER, 0.85)}` }} />
      </AbsoluteFill>
    );
  },
  Scene: ({ c }) => (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 95% 75% at 50% 42%, ${POND_PALE} 0%, #86C5BC 40%, ${POND} 82%, #1F6A66 100%)` }}>
      {/* Blooms and granulation in the pond wash. */}
      <div style={grainStyle({ color: '#1E5A5A', alpha: 0.55, freq: 0.012, size: 700, seed: 12, opacity: 0.5 })} />
      <div style={grainStyle({ color: '#173F4A', alpha: 0.4, freq: 1.4, size: 220, seed: 3, opacity: 0.35 })} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>{roughFilter('wc-edge', { scale: 7, freq: 0.05, blur: 0.8 })}</defs>
        {PADS.slice(3).map((_, k) => pad(k + 3, c.frame))}
        <g transform={focus(640, 1770, 540, 940, 1.7)}>
          {PADS.slice(0, 3).map((p, k) => ripple(p.x, p.y, c.frame, k * 25))}
          {PADS.slice(0, 3).map((_, k) => pad(k, c.frame))}
          {KOI.map((_, k) => koi(k, c.frame))}
        </g>
      </svg>
    </AbsoluteFill>
  ),
  caption: {
    size: 84,
    glyph: 0.52,
    entrance: 'fade',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, background: wash(POND_PALE, 0.92), padding: '22px 70px 26px' }),
    word: (emphasis) => ({ color: emphasis ? KOI_RED : INDIGO }),
  },
  hook: {
    top: 0.12,
    entrance: 'fade',
    box: () => ({ background: `${wash(POND_PALE, 0.55)}, ${PAPER}`, borderRadius: '26px 34px 22px 38px', padding: '26px 44px', boxShadow: '0 12px 30px rgba(31,59,87,0.25)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, fontSize: 64, lineHeight: 1.12, color: INDIGO }),
    // A few splatters around the card.
    Decor: ({ t }) => (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible', opacity: t }}>
        {Array.from({ length: 7 }, (_, k) => (
          <circle key={k} cx={`${(noise(k, 3) * 110 - 5).toFixed(1)}%`} cy={`${(noise(k, 4) > 0.5 ? 104 + noise(k, 5) * 8 : -4 - noise(k, 6) * 8).toFixed(1)}%`} r={3 + noise(k, 7) * 7} fill={k % 3 ? POND : KOI_RED} opacity={0.6} />
        ))}
      </svg>
    ),
  },
  card: () => ({ background: `${wash(POND_PALE, 0.5)}, ${PAPER}`, borderRadius: '22px 30px 20px 34px', boxShadow: '0 12px 30px rgba(31,59,87,0.25)' }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: INDIGO }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 400, color: KOI_RED }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: KOI_RED, textShadow: `0 0 2px ${PAPER}, 0 0 24px ${hexA(PAPER, 0.9)}, 0 0 50px ${hexA(PAPER, 0.7)}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: KOI_RED, textShadow: `0 0 2px ${PAPER}, 0 0 26px ${hexA(PAPER, 0.95)}` }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', inset: '-30% -20%', background: wash('#F6C9A8', 0.9), transform: `scale(${0.6 + 0.4 * t})` }} />,
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '48% 52% 45% 55%', background: [KOI_RED, POND, LOTUS][k % 3], opacity: 0.8 * t, boxShadow: `inset -4px -5px 0 ${hexA('#000000', 0.12)}` }} />,
  Ring: ({ x, y, r, t }) => (
    <g>
      <defs>{roughFilter('wc-ring', { scale: 8, freq: 0.04 })}</defs>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={POND} strokeWidth={9} opacity={0.75} filter="url(#wc-ring)" />
    </g>
  ),
  stage: { shape: 'circle', fill: [PAPER, POND_PALE], ring: POND, ringWidth: 5 },
  transition: {
    before: 6,
    after: 10,
    // A wash blooms out from the middle and dries back.
    Draw: ({ d }) => {
      const r = interpolate(d, [-6, 0], [0, 1500], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 2) });
      const fade = interpolate(d, [0, 10], [1, 0], clamp);
      if (r <= 0 || fade <= 0) return null;
      return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${hexA(POND_PALE, 1)} 0px, ${hexA(POND_PALE, 0.95)} ${r * 0.7}px, ${hexA(POND, 0.0)} ${r}px)`, opacity: fade }} />;
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={40} style={{ position: 'absolute', top: 22, left: 0 }}>
      <defs>{roughFilter('wc-progress', { scale: 5, freq: 0.08 })}</defs>
      <line x1={40} y1={18} x2={40 + (W - 80) * (c.frame / Math.max(1, total))} y2={18} stroke={POND} strokeWidth={8} strokeLinecap="round" opacity={0.7} filter="url(#wc-progress)" />
    </svg>
  ),
  sample: { type: 'headline', text: 'Slow is smooth', subtext: 'soft washes on real paper' },
};
