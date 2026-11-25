import { AbsoluteFill, interpolate } from 'remotion';
import { focus, grainStyle, loop } from '../painted';
import { H, W, hexA, noise, type StyleTheme } from '../theme';

/**
 * Paper Cut: a diorama of 6 to 9 layers of cut paper, pale surface blue to near black, each casting a
 * soft shadow on the one behind, with fibre and slightly uneven knife edges. The guide's jellyfish
 * pulses up through the layers at the side like a folding paper lantern, paper fish part around it,
 * and punched paper dots drift down like snow. Pieces slide and hinge; they never melt.
 */

const SURFACE = '#BFE6EF';
const LAYERS = ['#8FCBDD', '#5FA8C4', '#3D84A8', '#2A5F86', '#1B4066', '#10273F'];
const JELLY = '#FFB7C9';
const GLOW = '#9FE8F5';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const wave = (base: number, amp: number, shift: number, len = 190) => {
  const pts: string[] = [];
  for (let x = -60; x <= W + 60; x += 46) pts.push(`${x},${base + Math.sin(x / len + shift) * amp}`);
  return `M-60 ${base + 400} L${pts.join(' L')} L${W + 60} ${base + 400} Z`;
};

/** Layered paper waves at the bottom (deep) and top (surface), sliding at different speeds. */
function layers(frame: number, fromTop = false) {
  return LAYERS.map((color, k) => {
    const drift = Math.sin(frame / (60 + k * 22) + k * 2) * (8 + k * 5);
    const base = fromTop ? -330 + k * 36 : H - 60 - k * 52;
    return <path key={k} d={wave(base, 16 + k * 5, k * 1.7 + drift / 60)} fill={color} opacity={fromTop ? 0.55 : 0.92} style={{ filter: 'drop-shadow(0 -10px 14px rgba(0,0,0,0.35))' }} transform={`translate(${drift} 0)`} />;
  });
}

/** The jellyfish: a stacked tissue bell pulsing like a paper lantern, strip tentacles trailing. */
function jellyfish(frame: number) {
  const p = loop(frame, 300);
  const y = 1250 - p * 480 + Math.sin(frame / 40) * 16;
  const pulse = 1 + Math.sin(frame / 13) * 0.09;
  return (
    <g transform={`translate(205 ${y}) scale(${pulse} ${2 - pulse > 1.12 ? 1.12 : 2 - pulse})`} opacity={0.96}>
      <path d="M-92 6 Q-88 -84 0 -88 Q88 -84 92 6 Q60 22 30 8 Q0 24 -30 8 Q-60 22 -92 6 Z" fill={JELLY} opacity={0.88} style={{ filter: 'drop-shadow(0 0 26px rgba(159,232,245,0.65))' }} />
      <path d="M-64 0 Q-60 -58 0 -62 Q60 -58 64 0" fill="#FFD3DF" opacity={0.75} />
      <path d="M-34 -4 Q-32 -34 0 -36 Q32 -34 34 -4" fill="#FFF0F4" opacity={0.7} />
      {[-58, -30, 0, 30, 58].map((x, k) => (
        <path key={k} d={`M${x} 14 q${Math.sin(frame / 11 + k * 1.6) * 17} 60 ${Math.sin(frame / 13 + k) * 22} 118 q${Math.sin(frame / 9 + k) * 13} 44 ${Math.sin(frame / 12 + k * 2) * 18} 74`} stroke={JELLY} strokeWidth={7 - Math.abs(k - 2)} fill="none" opacity={0.8} strokeLinecap="round" />
      ))}
    </g>
  );
}

/** A school of cut-paper fish crossing the other way. */
function fish(frame: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const x = W - ((frame * (2.1 + (k % 3) * 0.5) + k * 190) % (W + 320)) + 160;
    const y = 420 + (k % 3) * 120 + Math.sin(frame / 26 + k * 2) * 18;
    const s = 0.7 + (k % 3) * 0.22;
    return (
      <g key={k} transform={`translate(${x} ${y}) scale(${-s} ${s})`} opacity={0.9}>
        <path d="M-44 0 Q-10 -24 34 -12 Q52 0 34 12 Q-10 24 -44 0 Z" fill={LAYERS[1 + (k % 3)]} />
        <path d="M-44 0 L-70 -18 Q-62 0 -70 18 Z" fill={LAYERS[2 + (k % 3)]} />
        <circle cx={22} cy={-3} r={4} fill="#0B2036" />
      </g>
    );
  });
}

export const paperCut: StyleTheme = {
  id: 'paper-cut',
  accent: GLOW,
  colors: [JELLY, SURFACE],
  footage: 'saturate(0.94) contrast(1.0) brightness(1.0)',
  entrance: 'glide',
  step: 1,
  textScale: 1,
  Overlay: ({ c, scene }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {layers(c.frame, true)}
        {fish(c.frame)}
        {!scene && jellyfish(c.frame)}
        {layers(c.frame)}
        {/* Punched paper dots drifting down like snow. */}
        {Array.from({ length: 20 }, (_, k) => {
          const y = ((c.frame * (1 + (k % 4) * 0.4) + k * 211) % (H + 80)) - 40;
          return <circle key={k} cx={(k * 173) % W + Math.sin(c.frame / 36 + k) * 18} cy={y} r={4 + (k % 3) * 2.4} fill={SURFACE} opacity={0.5} />;
        })}
      </svg>
      <div style={grainStyle({ color: '#FFFFFF', alpha: 0.35, freq: 0.95, size: 200, seed: 6, opacity: 0.3 })} />
    </AbsoluteFill>
  ),
  Scene: ({ c }) => (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SURFACE} 0%, ${LAYERS[1]} 30%, ${LAYERS[3]} 62%, ${LAYERS[5]} 100%)` }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {/* Deeper paper layers sliding past at their own speeds, like a multiplane camera. */}
        <g transform="translate(0 -760)" opacity={0.55}>{layers(c.frame * 0.5)}</g>
        <g transform="translate(0 -430)" opacity={0.8}>{layers(c.frame * 0.8)}</g>
        <g transform={focus(205, 1010, 540, 880, 2.2)}>{jellyfish(c.frame)}</g>
        {Array.from({ length: 14 }, (_, k) => {
          const x = 60 + noise(k, 31) * 960;
          const y = ((c.frame * (1.2 + noise(k, 32)) + noise(k, 33) * 1900) % 1900) - 20;
          return <circle key={k} cx={x + Math.sin(c.frame / 30 + k) * 14} cy={y} r={7 + noise(k, 34) * 6} fill="#F4FBFD" opacity={0.75} style={{ filter: 'drop-shadow(0 3px 3px rgba(0,0,0,0.25))' }} />;
        })}
      </svg>
    </AbsoluteFill>
  ),
  caption: {
    size: 80,
    glyph: 0.6,
    entrance: 'glide',
    box: () => ({ background: SURFACE, padding: '20px 42px', borderRadius: 18, boxShadow: '0 10px 0 rgba(16,39,63,0.45), 0 22px 34px rgba(0,0,0,0.35)' }),
    word: (emphasis) => ({ color: emphasis ? '#C2437E' : '#14324E' }),
  },
  hook: {
    top: 0.13,
    entrance: 'glide',
    box: () => ({ background: JELLY, padding: '26px 44px', borderRadius: 20, boxShadow: '0 10px 0 rgba(16,39,63,0.4), 0 24px 38px rgba(0,0,0,0.35)' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, fontSize: 64, lineHeight: 1.12, color: '#14324E' }),
  },
  card: () => ({ background: SURFACE, borderRadius: 18, boxShadow: '0 9px 0 rgba(16,39,63,0.45), 0 22px 34px rgba(0,0,0,0.35)' }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#14324E' }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 400, color: '#2A5F86' }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#C2437E' }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 800, color: '#14324E', textShadow: '0 5px 0 rgba(159,232,245,0.8)' }),
  SlamBack: ({ t }) => <div style={{ position: 'absolute', inset: '-32% -22%', background: JELLY, borderRadius: '46% 54% 58% 42%', transform: `scale(${0.6 + 0.4 * t})`, boxShadow: '0 12px 0 rgba(16,39,63,0.4)' }} />,
  Marker: ({ k, t }) => <span style={{ flex: 'none', width: 34, height: 34, borderRadius: k % 2 ? '50% 50% 50% 6px' : '6px 50% 50% 50%', background: [JELLY, GLOW, '#F6D365'][k % 3], opacity: t, boxShadow: '0 4px 0 rgba(16,39,63,0.4)' }} />,
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={GLOW} strokeWidth={10} opacity={0.9} />
      <circle cx={x} cy={y} r={r * t * 0.82} fill="none" stroke={JELLY} strokeWidth={5} opacity={0.75} />
    </g>
  ),
  stage: { shape: 'circle', fill: [LAYERS[1], LAYERS[4]], ring: SURFACE, ringWidth: 7 },
  transition: {
    before: 7,
    after: 12,
    // Sheets of paper slide across in layers, near ones fastest, then slide away.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-7, 0], [0, 1], clamp) : interpolate(d, [0, 12], [1, 0], clamp);
      if (cover <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          {LAYERS.map((color, k) => {
            const local = Math.max(0, Math.min(1, cover * 1.5 - k * 0.08));
            return <div key={k} style={{ position: 'absolute', inset: 0, background: color, transform: `translateX(${(1 - local) * (k % 2 ? 100 : -100)}%)`, boxShadow: '0 0 60px rgba(0,0,0,0.4)' }} />;
          })}
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={34} style={{ position: 'absolute', top: 22, left: 0 }}>
      {Array.from({ length: 14 }, (_, k) => (
        <circle key={k} cx={50 + k * ((W - 100) / 13)} cy={16} r={8} fill={k / 13 <= c.frame / Math.max(1, total) ? GLOW : hexA(SURFACE, 0.4)} />
      ))}
    </svg>
  ),
  sample: { type: 'headline', text: 'Layer by layer', subtext: 'cut, stacked, alive' },
};
