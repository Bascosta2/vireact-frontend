import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { W, gradientText, hexA, type StyleTheme } from '../theme';

/**
 * Retro 3D (the guide's "PS2 style", renamed: that name is a trademark): an early-3D console look. Chunky
 * beveled HUD panels, metal lettering, a low-poly crystal turning in the corner, menus that swing in on a
 * hinge, a lock-on reticle for callouts, and a game-camera swing at each jump in the edit.
 */

const BLUE = '#4DA3FF';
const NAVY = '#0C1A3A';
const SILVER = '#C0C8D8';
const MINT = '#7CFFB2';

const bevel = (): CSSProperties => ({
  background: 'linear-gradient(180deg, #2B4A8F 0%, #1A3370 48%, #13285A 52%, #0F2050 100%)',
  border: '4px solid #9FB8FF',
  borderRadius: 10,
  boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.35), inset 0 -6px 0 rgba(0,0,0,0.35), 0 0 0 3px #0B1633, 0 16px 32px rgba(0,0,0,0.5)',
});

const METAL = 'linear-gradient(180deg, #FFFFFF 0%, #DDE6FF 40%, #7E93C8 55%, #C9D6FF 75%, #FFFFFF 100%)';

/** A flat-shaded octahedron turning on its axis, projected by hand (no 3D library). */
function crystal({ frame, size = 90 }: { frame: number; size?: number }) {
  const a = frame * 0.045;
  const verts: [number, number, number][] = [[0, 1.35, 0], [0, -1.35, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1]];
  const rot = verts.map(([x, y, z]) => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)] as const);
  const faces = [[0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2], [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]];
  const light = [0.4, 0.7, 0.6];
  const drawn = faces
    .map((f) => {
      const [p, q, r] = f.map((i) => rot[i]);
      const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
      const v = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const len = Math.hypot(...n) || 1;
      return { f, nz: n[2] / len, shade: Math.max(0, (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]) / len), depth: (p[2] + q[2] + r[2]) / 3 };
    })
    .filter((x) => x.nz > 0)
    .sort((x, y) => x.depth - y.depth);
  const bob = Math.sin(frame / 18) * 8;
  return (
    <svg width={size * 2} height={size * 3} viewBox="-1.6 -2.1 3.2 4.2" style={{ overflow: 'visible', transform: `translateY(${bob}px)`, filter: `drop-shadow(0 0 14px ${hexA(MINT, 0.6)})` }}>
      {drawn.map(({ f, shade }, k) => (
        <polygon key={k} points={f.map((i) => `${rot[i][0].toFixed(3)},${(-rot[i][1]).toFixed(3)}`).join(' ')} fill={`hsl(146, 90%, ${Math.round(28 + shade * 50)}%)`} stroke="#0B3D24" strokeWidth={0.03} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export const retro3d: StyleTheme = {
  id: 'retro-3d',
  accent: MINT,
  colors: [BLUE, SILVER],
  footage: 'saturate(1.15) contrast(1.15) brightness(0.97)',
  entrance: 'swing',
  step: 1,
  textScale: 0.92,
  Overlay: ({ c }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Distance fog and a soft dither, like an early console's frame buffer. */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${hexA('#3A66C8', 0.42)} 0%, transparent 22%, transparent 78%, ${hexA('#1A2E66', 0.55)} 100%)` }} />
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 4px)', opacity: 0.6 }} />
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <div style={{ position: 'absolute', right: 60, top: 70 }}>
        {crystal({ frame: c.frame })}
      </div>
    </AbsoluteFill>
  ),
  caption: {
    size: 80,
    glyph: 0.64,
    entrance: 'swing',
    box: (c) => ({ fontFamily: c.fonts.display, letterSpacing: 1 }),
    word: (emphasis) => ({ color: emphasis ? MINT : '#fff', WebkitTextStroke: '4px #0B1633', paintOrder: 'stroke fill', textShadow: `0 5px 0 #0B1633, 0 0 18px ${hexA(BLUE, 0.7)}` }),
  },
  hook: {
    top: 0.13,
    entrance: 'swing',
    box: () => ({ ...bevel(), padding: '30px 40px 26px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontSize: 60, lineHeight: 1.18, color: '#fff', textShadow: '0 4px 0 #0B1633' }),
    // A small tab on the panel, like a mission briefing.
    Decor: ({ c }) => (
      <div style={{ position: 'absolute', left: 26, top: -32, padding: '4px 18px', ...bevel(), borderRadius: 6, fontFamily: c.fonts.body, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: MINT }}>
        MISSION
      </div>
    ),
  },
  card: bevel,
  title: (c) => ({ fontFamily: c.fonts.display, ...gradientText(METAL), filter: 'drop-shadow(0 3px 0 #0B1633)' }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 700, color: '#9FD0FF' }),
  number: (c) => ({ fontFamily: c.fonts.display, ...gradientText(METAL), filter: `drop-shadow(0 6px 0 #0B1633) drop-shadow(0 0 22px ${hexA(BLUE, 0.8)})` }),
  slam: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', ...gradientText(METAL), filter: `drop-shadow(0 8px 0 #0B1633) drop-shadow(0 0 26px ${hexA(MINT, 0.7)})` }),
  SlamBack: ({ t }) => (
    <div style={{ position: 'absolute', left: '-10%', right: '-10%', top: '18%', bottom: '18%', ...bevel(), transform: `perspective(900px) rotateX(${(1 - t) * 80}deg)` }} />
  ),
  Marker: ({ t }) => (
    <span style={{ flex: 'none', width: 34, height: 34, transform: `rotate(45deg) scale(${t})`, background: `linear-gradient(135deg, #fff, ${MINT} 45%, #1E8F55)`, border: '3px solid #0B3D24' }} />
  ),
  // A lock-on reticle: four corner arcs that turn and close in.
  Ring: ({ c, x, y, r, t }) => {
    const rr = r * (1.5 - 0.5 * t);
    const spin = (c.frame * 3) % 360;
    return (
      <g transform={`rotate(${spin} ${x} ${y})`} style={{ filter: `drop-shadow(0 0 8px ${MINT})` }}>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} transform={`rotate(${a} ${x} ${y})`} d={`M${x + rr * Math.cos(-0.5)} ${y + rr * Math.sin(-0.5)} A${rr} ${rr} 0 0 1 ${x + rr * Math.cos(0.5)} ${y + rr * Math.sin(0.5)}`} fill="none" stroke={MINT} strokeWidth={8} strokeLinecap="square" />
        ))}
        <circle cx={x} cy={y} r={8} fill={MINT} />
      </g>
    );
  },
  stage: { shape: 'circle', fill: ['#1D3570', NAVY], ring: '#9FB8FF', ringWidth: 6, glow: BLUE },
  transition: {
    before: 5,
    after: 10,
    // A scan band rolls down while the picture dips to the menu's navy at the cut.
    Draw: ({ d }) => {
      const dip = interpolate(d, [-5, 0, 10], [0, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const y = interpolate(d, [-5, 10], [-10, 110]);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <AbsoluteFill style={{ background: NAVY, opacity: dip }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 120, background: `linear-gradient(180deg, transparent, ${hexA(BLUE, 0.45)}, transparent)` }} />
        </AbsoluteFill>
      );
    },
    // The game camera swings round to the new shot.
    camera: (d) => {
      if (d < 0) return { rotateY: interpolate(d, [-5, 0], [0, 22]), scale: interpolate(d, [-5, 0], [1, 1.18]) };
      return { rotateY: interpolate(d, [0, 10], [-22, 0], { extrapolateRight: 'clamp', easing: (v) => 1 - Math.pow(1 - v, 3) }), scale: interpolate(d, [0, 10], [1.18, 1], { extrapolateRight: 'clamp' }) };
    },
  },
  // A segmented HUD bar along the bottom.
  Progress: ({ c, total }) => {
    const n = 24;
    const lit = Math.round((c.frame / Math.max(1, total)) * n);
    return (
      <div style={{ position: 'absolute', left: (W - 720) / 2, bottom: 58, width: 720, height: 30, display: 'flex', gap: 5, padding: 5, ...bevel(), borderRadius: 6 }}>
        {Array.from({ length: n }, (_, k) => <div key={k} style={{ flex: 1, background: k < lit ? MINT : 'rgba(255,255,255,0.12)', boxShadow: k < lit ? `0 0 8px ${MINT}` : 'none' }} />)}
      </div>
    );
  },
  sample: { type: 'headline', text: 'New area unlocked', subtext: 'Level 2: the edit' },
};
