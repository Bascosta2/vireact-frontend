import { AbsoluteFill, interpolate } from 'remotion';
import { drawStroke, focus, grainStyle, loop } from '../painted';
import { H, W, hexA, type StyleTheme } from '../theme';

/**
 * Botanical Plate: a scientific illustration on cream paper — fine ink outlines, soft watercolour
 * fills, plants laid out airy and readable. The guide's meadow runs along the bottom of the plate:
 * daisies, buttercups, clover and grasses bend from their bases, and a blue butterfly flutters across
 * and settles, slowly opening and closing its wings. Every line stays the same drawing.
 */

const PAPER = '#F4EDD8';
const INK = '#33402E';
const BLUE = '#4A7FD4';
const DAISY = '#FFFFFF';
const BUTTER = '#F2C94C';
const CLOVER = '#7FB069';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const PLANTS = [
  { x: 70, h: 210, kind: 'daisy' }, { x: 170, h: 150, kind: 'grass' }, { x: 265, h: 185, kind: 'buttercup' },
  { x: 380, h: 130, kind: 'clover' }, { x: 480, h: 205, kind: 'daisy' }, { x: 590, h: 145, kind: 'grass' },
  { x: 700, h: 190, kind: 'buttercup' }, { x: 815, h: 135, kind: 'clover' }, { x: 915, h: 200, kind: 'daisy' }, { x: 1010, h: 155, kind: 'grass' },
] as const;

function plant(p: (typeof PLANTS)[number], frame: number, k: number) {
  const bend = Math.sin(frame / 44 + k * 1.4) * 12;
  const topX = p.x + bend;
  const topY = H - 60 - p.h;
  const head =
    p.kind === 'daisy' ? (
      <g transform={`translate(${topX} ${topY})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={0} cy={-17} rx={8} ry={19} fill={DAISY} stroke={INK} strokeWidth={1.6} transform={`rotate(${i * 45})`} />
        ))}
        <circle r={10} fill={BUTTER} stroke={INK} strokeWidth={1.6} />
      </g>
    ) : p.kind === 'buttercup' ? (
      <g transform={`translate(${topX} ${topY})`}>
        {Array.from({ length: 5 }, (_, i) => (
          <circle key={i} cx={Math.cos((i / 5) * 6.28) * 10} cy={Math.sin((i / 5) * 6.28) * 10} r={9} fill={BUTTER} stroke={INK} strokeWidth={1.6} />
        ))}
        <circle r={5} fill="#D9A441" />
      </g>
    ) : p.kind === 'clover' ? (
      <g transform={`translate(${topX} ${topY})`}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={(i - 1) * 13} cy={i === 1 ? -9 : 0} r={11} fill={CLOVER} stroke={INK} strokeWidth={1.6} opacity={0.85} />
        ))}
      </g>
    ) : null;
  return (
    <g key={k}>
      <path d={`M${p.x} ${H - 40} Q ${p.x + bend * 0.4} ${H - 40 - p.h * 0.6} ${topX} ${topY + 14}`} stroke={INK} strokeWidth={3} fill="none" />
      <path d={`M${p.x} ${H - 90} q-26 -8 -34 -34 M${p.x} ${H - 130} q24 -12 28 -38`} stroke={CLOVER} strokeWidth={3.4} fill="none" opacity={0.8} />
      {head}
    </g>
  );
}

/** The butterfly: fast wingbeats in flight, slow opening and closing once settled. */
function butterfly(frame: number) {
  const p = loop(frame, 420);
  const flying = p < 0.62;
  const path = interpolate(p, [0, 0.62], [0, 1], clamp);
  const x = flying ? -80 + path * (560 + 80) : 480;
  const y = flying ? 420 + Math.sin(path * 9) * 90 - path * 160 : H - 60 - 205 - 34 + Math.sin(frame / 30) * 3;
  const flap = flying ? Math.abs(Math.sin(frame / 2.2)) : 0.35 + 0.4 * Math.abs(Math.sin(frame / 26));
  const w = 12 + flap * 30;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g opacity={0.95}>
        <ellipse cx={-w} cy={-6} rx={w} ry={17} fill={BLUE} stroke={INK} strokeWidth={2} transform={`rotate(${-18 - flap * 16} 0 0)`} />
        <ellipse cx={w} cy={-6} rx={w} ry={17} fill={BLUE} stroke={INK} strokeWidth={2} transform={`rotate(${18 + flap * 16} 0 0)`} />
        <ellipse cx={-w * 0.7} cy={12} rx={w * 0.66} ry={12} fill="#7FA8E0" stroke={INK} strokeWidth={2} />
        <ellipse cx={w * 0.7} cy={12} rx={w * 0.66} ry={12} fill="#7FA8E0" stroke={INK} strokeWidth={2} />
        <path d={`M${-w} -8 q${w * 0.5} -7 ${w} -1 M${-w * 0.6} 12 q${w * 0.4} 4 ${w * 0.6} -2`} stroke={INK} strokeWidth={1.3} fill="none" opacity={0.6} />
      </g>
      <ellipse cx={0} cy={2} rx={5.5} ry={17} fill={INK} />
      <path d="M-2 -14 q-12 -14 -20 -16 M2 -14 q12 -14 20 -16" stroke={INK} strokeWidth={2.2} fill="none" />
    </g>
  );
}

export const botanicalPlate: StyleTheme = {
  id: 'botanical-plate',
  accent: BLUE,
  colors: [CLOVER, BUTTER],
  footage: 'saturate(0.9) contrast(0.96) brightness(1.05) sepia(0.12)',
  entrance: 'fade',
  step: 1,
  textScale: 1,
  Overlay: ({ c, scene }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* The plate: cream corners and a fine double rule like an old print. */}
      <div style={{ position: 'absolute', inset: 18, border: `2px solid ${hexA(INK, 0.5)}`, outline: `1px solid ${hexA(INK, 0.3)}`, outlineOffset: 7 }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, transparent 55%, ${hexA('#D8CBA4', 0.35)} 100%)` }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {PLANTS.map((p, k) => plant(p, c.frame, k))}
        {!scene && butterfly(c.frame)}
        {/* A second, smaller butterfly crosses behind, higher up. */}
        <g transform={`translate(${W - ((c.frame * 2.6) % (W + 240)) + 120} ${300 + Math.sin(c.frame / 23) * 40}) scale(0.55)`} opacity={0.65}>
          <ellipse cx={-26} cy={0} rx={26} ry={14} fill={BLUE} stroke={INK} strokeWidth={2.4} />
          <ellipse cx={26} cy={0} rx={26} ry={14} fill={BLUE} stroke={INK} strokeWidth={2.4} />
          <ellipse cx={0} cy={2} rx={5} ry={15} fill={INK} />
        </g>
      </svg>
      <div style={grainStyle({ color: '#7A6A42', alpha: 0.4, freq: 0.9, size: 240, seed: 4, opacity: 0.4 })} />
    </AbsoluteFill>
  ),
  Scene: ({ c }) => {
    // Where butterfly() draws itself this frame, so the scene can move it to its own path.
    const p = loop(c.frame, 420);
    const flying = p < 0.62;
    const path = interpolate(p, [0, 0.62], [0, 1], clamp);
    const bx = flying ? -80 + path * (560 + 80) : 480;
    const by = flying ? 420 + Math.sin(path * 9) * 90 - path * 160 : H - 60 - 205 - 34 + Math.sin(c.frame / 30) * 3;
    // In the scene it loops across the middle of the plate and settles on the big daisy (plants shown at PS).
    const PS = 2.8;
    const landX = 540 + (480 - 540) * PS;
    const landY = H + 90 + (H - 60 - 205 - 34 - (H - 40)) * PS;
    const tx = flying ? interpolate(path, [0, 1], [180, landX]) + Math.sin(path * 7) * 260 * (1 - path) : landX;
    const ty = flying ? interpolate(path, [0, 1], [760, landY]) + Math.sin(path * 11) * 160 * (1 - path) : landY + Math.sin(c.frame / 30) * 8;
    return (
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #FBF6E8 0%, ${PAPER} 60%, #E8DCBC 100%)` }}>
        <div style={grainStyle({ color: '#B9C98F', alpha: 0.5, freq: 0.01, size: 800, seed: 6, opacity: 0.35 })} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <g transform={focus(540, H - 40, 540, H + 90, PS)}>{PLANTS.map((pl, k) => plant(pl, c.frame, k))}</g>
          <g transform={`translate(${tx} ${ty}) scale(3.2) translate(${-bx} ${-by})`}>{butterfly(c.frame)}</g>
        </svg>
      </AbsoluteFill>
    );
  },
  caption: {
    size: 78,
    glyph: 0.56,
    entrance: 'fade',
    box: () => ({ background: hexA(PAPER, 0.94), padding: '18px 40px', border: `2px solid ${hexA(INK, 0.75)}`, boxShadow: '0 10px 24px rgba(51,64,46,0.25)' }),
    word: (emphasis) => ({ color: emphasis ? BLUE : INK }),
  },
  hook: {
    top: 0.11,
    entrance: 'fade',
    box: () => ({ background: PAPER, padding: '26px 46px', border: `2.5px solid ${INK}`, boxShadow: `0 0 0 5px ${PAPER}, 0 0 0 7px ${hexA(INK, 0.6)}, 0 16px 32px rgba(51,64,46,0.3)` }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, fontSize: 62, lineHeight: 1.15, color: INK }),
    Decor: ({ t }) => (
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: -26, width: 'calc(100% + 52px)', height: 'calc(100% + 52px)', overflow: 'visible', opacity: t }}>
        <path d="M6 40 q-4 -30 22 -34 M6 74 q-16 -16 -8 -36" stroke={CLOVER} strokeWidth={3.4} fill="none" style={drawStroke(t)} />
        <circle cx={30} cy={4} r={7} fill={BUTTER} stroke={INK} strokeWidth={1.6} />
      </svg>
    ),
  },
  card: () => ({ background: PAPER, border: `2px solid ${hexA(INK, 0.8)}`, borderRadius: 6, boxShadow: '0 12px 28px rgba(51,64,46,0.28)' }),
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: INK }),
  body: (c) => ({ fontFamily: c.fonts.body, fontStyle: 'italic', fontWeight: 600, color: hexA(INK, 0.85) }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: BLUE }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, color: BLUE, textShadow: `0 2px 0 ${PAPER}` }),
  Marker: ({ k, t }) => (
    <span style={{ flex: 'none', width: 32, height: 32, opacity: t }}>
      <svg width={32} height={32} viewBox="0 0 32 32">
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={16 + Math.cos((i / 5) * 6.28) * 7} cy={16 + Math.sin((i / 5) * 6.28) * 7} r={6.4} fill={[BUTTER, BLUE, CLOVER][k % 3]} stroke={INK} strokeWidth={1.6} />
        ))}
        <circle cx={16} cy={16} r={4} fill={PAPER} stroke={INK} strokeWidth={1.4} />
      </svg>
    </span>
  ),
  Ring: ({ x, y, r, t }) => (
    <g>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke={INK} strokeWidth={4} opacity={0.8} />
      <circle cx={x} cy={y} r={r * t * 0.86} fill="none" stroke={BLUE} strokeWidth={2.4} opacity={0.7} />
    </g>
  ),
  stage: { shape: 'circle', fill: [PAPER, '#E9DFC2'], ring: INK, ringWidth: 4 },
  transition: {
    before: 6,
    after: 10,
    // The next plate slides in like a page laid over the last.
    Draw: ({ d }) => {
      const cover = d < 0 ? interpolate(d, [-6, 0], [0, 1], clamp) : interpolate(d, [0, 10], [1, 0], clamp);
      if (cover <= 0) return null;
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', opacity: Math.min(1, cover * 1.4) }}>
          <div style={{ position: 'absolute', inset: 0, background: PAPER, transform: `translateX(${(1 - cover) * -100}%)`, boxShadow: '30px 0 60px rgba(51,64,46,0.35)' }}>
            <div style={{ position: 'absolute', inset: 26, border: `2px solid ${hexA(INK, 0.5)}` }} />
          </div>
        </AbsoluteFill>
      );
    },
  },
  Progress: ({ c, total }) => (
    <svg width={W} height={26} style={{ position: 'absolute', top: 34, left: 0 }}>
      <line x1={60} y1={12} x2={W - 60} y2={12} stroke={hexA(INK, 0.35)} strokeWidth={2.4} />
      <line x1={60} y1={12} x2={60 + (W - 120) * (c.frame / Math.max(1, total))} y2={12} stroke={BLUE} strokeWidth={3.4} />
      <circle cx={60 + (W - 120) * (c.frame / Math.max(1, total))} cy={12} r={7} fill={BUTTER} stroke={INK} strokeWidth={1.8} />
    </svg>
  ),
  sample: { type: 'headline', text: 'Field notes', subtext: 'drawn like a plate' },
};
