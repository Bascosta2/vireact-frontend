import { AbsoluteFill, interpolate } from 'remotion';
import { drawStroke, grainStyle, loop, roughFilter } from '../painted';
import { H, W, hexA, type StyleTheme } from '../theme';

/**
 * Sumi-e Ink: black ink from deep black to pale grey washes on rice paper, wet bleeding edges, dry brush
 * strokes, a lot of empty paper and mist, and a red sun as the only colour. From the guide: a crane flies
 * through with big wingbeats and its mate curves in to join it halfway; mountain ridges slide past in
 * layers (near ones fastest) and mist blooms and fades like a wet wash.
 */

const INK = '#141414';
const PAPER = '#F2ECDF';
const SUN = '#C8102E';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** One ridge line of ink, repeating every 1080 px so it can slide forever. */
const ridge = (base: number, amp: number, seed: number) => {
  const pts = Array.from({ length: 13 }, (_, i) => {
    const x = i * 180;
    const y = base - amp * (0.5 + 0.5 * Math.sin(i * 1.7 + seed)) * (i % 6 === 0 ? 1 : 0.55 + 0.45 * Math.cos(i * 2.3 + seed));
    return [x, y];
  });
  return `M0 ${H} L${pts.map(([x, y]) => `${x} ${y.toFixed(0)}`).join(' L')} L2160 ${H} Z`;
};
const RIDGES = [
  { d: ridge(1760, 220, 1), speed: 0.4, opacity: 0.18 },
  { d: ridge(1830, 170, 4), speed: 0.9, opacity: 0.32 },
  { d: ridge(1900, 120, 7), speed: 1.7, opacity: 0.62 },
];

/** A crane in ink: white body, black wing tips, red crown. `beat` 0 → 1 is one wingbeat. */
function crane(x: number, y: number, beat: number, scale: number, key: string) {
  const a = Math.sin(beat * Math.PI * 2) * 30; // wings sweep 60 degrees in all
  const wing = (side: number) => (
    <g transform={`rotate(${side * a})`}>
      <path d={`M0 0 Q${-20} ${side * -60} ${-10} ${side * -110} Q30 ${side * -70} 40 ${side * -8} Z`} fill={PAPER} stroke={INK} strokeWidth={3} />
      <path d={`M-10 ${side * -110} Q14 ${side * -80} 26 ${side * -52} L8 ${side * -60} Z`} fill={INK} />
    </g>
  );
  return (
    <g key={key} transform={`translate(${x} ${y}) scale(${scale})`} filter="url(#sumi-edge)">
      {wing(1)}
      <ellipse cx={0} cy={0} rx={46} ry={13} fill={PAPER} stroke={INK} strokeWidth={3} />
      <path d="M40 -4 Q70 -16 92 -10" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={92} cy={-11} r={5} fill={SUN} />
      <path d="M92 -10 L112 -8" stroke={INK} strokeWidth={3} />
      <path d="M-44 2 L-96 10 M-44 6 L-94 16" stroke={INK} strokeWidth={2.5} />
      {wing(-1)}
    </g>
  );
}

export const sumiE: StyleTheme = {
  id: 'sumi-e',
  accent: SUN,
  colors: [INK, '#8A8A8A'],
  footage: 'grayscale(1) contrast(1.18) brightness(1.1)',
  entrance: 'write',
  step: 1,
  textScale: 1.05,
  Overlay: ({ c }) => {
    // The pair crosses every 8 seconds; the mate joins halfway.
    const p = loop(c.frame, 240);
    const x = interpolate(p, [0, 1], [W + 160, -220]);
    const y = 330 + Math.sin(p * Math.PI * 2) * 60;
    const join = interpolate(p, [0.35, 0.6], [0, 1], { ...clamp, easing: (v) => v * v * (3 - 2 * v) });
    const mateX = x + interpolate(join, [0, 1], [-260, 110]);
    const mateY = y + interpolate(join, [0, 1], [-260, 50]);
    const mist = (k: number) => 0.45 + 0.25 * Math.sin(c.frame / 45 + k * 2);
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {/* Rice paper: warm white, fibre fixed to the frame. */}
        <AbsoluteFill style={{ background: PAPER, mixBlendMode: 'multiply', opacity: 0.5 }} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <defs>
            {roughFilter('sumi-edge', { scale: 5, freq: 0.06, blur: 0.6 })}
            {roughFilter('sumi-wash', { scale: 22, freq: 0.012, blur: 6 })}
          </defs>
          <circle cx={880} cy={250} r={68} fill={SUN} opacity={0.88} filter="url(#sumi-edge)" />
          {RIDGES.map((r, k) => (
            <path key={k} d={r.d} fill={INK} opacity={r.opacity} filter="url(#sumi-wash)" transform={`translate(${-((c.frame * r.speed) % 1080)} 0)`} />
          ))}
          {crane(x, y, (c.frame % 26) / 26, 1, 'lead')}
          {join > 0 && crane(mateX, mateY, ((c.frame + 9) % 26) / 26, 0.8, 'mate')}
        </svg>
        {/* Mist that blooms and fades like a wet wash. */}
        <div style={{ position: 'absolute', left: -200, right: -200, top: 120, height: 260, background: `radial-gradient(ellipse at ${50 + Math.sin(c.frame / 80) * 12}% 50%, ${hexA(PAPER, 0.85)}, transparent 70%)`, opacity: mist(0), filter: 'blur(18px)' }} />
        <div style={{ position: 'absolute', left: -200, right: -200, top: 1580, height: 300, background: `radial-gradient(ellipse at ${50 - Math.sin(c.frame / 70) * 15}% 50%, ${hexA(PAPER, 0.9)}, transparent 70%)`, opacity: mist(1), filter: 'blur(20px)' }} />
        <div style={grainStyle({ color: '#5A4E3A', alpha: 0.4, freq: 0.75, size: 260, seed: 9, opacity: 0.6, stretch: [1, 2.5] })} />
      </AbsoluteFill>
    );
  },
  caption: {
    size: 90,
    glyph: 0.6,
    entrance: 'write',
    box: (c) => ({ fontFamily: c.fonts.display, textShadow: `0 0 3px ${PAPER}, 0 0 14px ${PAPER}, 0 0 28px ${hexA(PAPER, 0.9)}` }),
    word: (emphasis) => ({ color: emphasis ? SUN : INK }),
  },
  hook: {
    top: 0.12,
    entrance: 'write',
    box: () => ({ background: PAPER, padding: '26px 52px 30px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 70, lineHeight: 1.18, color: INK }),
    // The red seal in the corner, stamped once the line is written.
    Decor: ({ c }) => {
      const t = interpolate(c.frame, [14, 18], [0, 1], clamp);
      return (
        <div style={{ position: 'absolute', right: -16, bottom: -16, width: 52, height: 52, background: SUN, borderRadius: 4, opacity: t * 0.9, transform: `scale(${1.4 - 0.4 * t}) rotate(-4deg)` }}>
          <div style={{ position: 'absolute', inset: 9, border: `3px solid ${PAPER}`, borderRadius: 2 }} />
          <div style={{ position: 'absolute', left: 16, right: 16, top: 24, height: 3, background: PAPER }} />
        </div>
      );
    },
  },
  card: () => ({ background: PAPER, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }),
  title: (c) => ({ fontFamily: c.fonts.display, color: INK }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 600, color: SUN }),
  number: (c) => ({ fontFamily: c.fonts.display, color: INK, textShadow: `0 0 4px ${PAPER}, 0 0 20px ${PAPER}, 0 0 40px ${hexA(PAPER, 0.9)}` }),
  slam: (c) => ({ fontFamily: c.fonts.display, color: INK, textShadow: `0 0 4px ${PAPER}, 0 0 22px ${PAPER}, 0 0 44px ${hexA(PAPER, 0.9)}` }),
  // An enso: one open brush circle, drawn as the word lands.
  SlamBack: ({ c }) => {
    const t = interpolate(c.frame, [0, 12], [0, 1], clamp);
    return (
      <svg viewBox="0 0 400 400" style={{ position: 'absolute', left: '50%', top: '50%', width: 520, height: 520, marginLeft: -260, marginTop: -260, overflow: 'visible' }}>
        <defs>{roughFilter('sumi-enso', { scale: 9, freq: 0.05 })}</defs>
        <path d="M200 30 A170 170 0 1 1 90 70" fill="none" stroke={INK} strokeWidth={26} strokeLinecap="round" opacity={0.85} filter="url(#sumi-enso)" style={drawStroke(t, 1000)} />
      </svg>
    );
  },
  Marker: ({ t }) => <span style={{ flex: 'none', width: 26, height: 26, borderRadius: '50% 46% 52% 48%', background: INK, opacity: t, boxShadow: `0 0 6px ${hexA(INK, 0.5)}` }} />,
  Ring: ({ x, y, r, t }) => (
    <g>
      <defs>{roughFilter('sumi-ring', { scale: 8, freq: 0.05 })}</defs>
      <path d={`M${x} ${y - r} A${r} ${r} 0 1 1 ${x - r * 0.7} ${y - r * 0.7}`} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" filter="url(#sumi-ring)" style={drawStroke(t, 2 * Math.PI * r)} />
    </g>
  ),
  stage: { shape: 'circle', fill: [PAPER, '#E4DCCB'], ring: INK, ringWidth: 5 },
  transition: {
    before: 6,
    after: 10,
    // Ink drops in the middle and bleeds out over the paper, then washes away.
    Draw: ({ d }) => {
      const r = interpolate(d, [-6, 0], [0, 1500], { ...clamp, easing: (v) => v * v });
      const fade = interpolate(d, [0, 10], [1, 0], clamp);
      if (r <= 0 || fade <= 0) return null;
      return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, ${INK} 0px, ${hexA(INK, 0.92)} ${r * 0.6}px, ${hexA('#555555', 0.3)} ${r * 0.85}px, transparent ${r}px)`, opacity: fade }} />;
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={40} style={{ position: 'absolute', top: 20, left: 0 }}>
      <defs>{roughFilter('sumi-progress', { scale: 4, freq: 0.1 })}</defs>
      <line x1={40} y1={16} x2={40 + (W - 80) * (c.frame / Math.max(1, total))} y2={16} stroke={INK} strokeWidth={7} strokeLinecap="round" filter="url(#sumi-progress)" />
    </svg>
  ),
  sample: { type: 'headline', text: 'One stroke at a time', subtext: 'ink, paper and mist' },
};
