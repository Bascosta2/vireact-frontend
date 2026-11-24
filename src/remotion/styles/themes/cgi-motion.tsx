import { AbsoluteFill, interpolate } from 'remotion';
import { W, gradientText, hexA, noise, type StyleTheme } from '../theme';

/**
 * CGI Motion: a polished, cinematic look. A teal-and-orange grade, soft reflections, shallow depth (bokeh
 * and a heavy vignette) and a premium night-city atmosphere. Following the guide, the camera drifts
 * slowly the whole time, highlights move across chrome lettering and glass cards, and a jump in the edit
 * is a lighting sweep.
 */

const CYAN = '#5CE1E6';
const WARM = '#FFB86B';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const CHROME = 'linear-gradient(180deg, #FFFFFF 0%, #E6FBFF 38%, #7FC9D8 52%, #EFFFFF 70%, #FFFFFF 100%)';

const glass = () => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 55%, rgba(92,225,230,0.08))',
  border: '1.5px solid rgba(255,255,255,0.5)',
  borderRadius: 28,
  boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -20px 40px rgba(0,0,0,0.18)',
  backdropFilter: 'blur(14px)',
  overflow: 'hidden' as const,
});

/** A soft highlight passing over a surface every `period` frames. */
function sweep({ frame, period = 90, delay = 6 }: { frame: number; period?: number; delay?: number }) {
  const p = ((frame - delay) % period + period) % period;
  const x = interpolate(p, [0, 28], [-60, 160], clamp);
  return <div style={{ position: 'absolute', top: '-50%', bottom: '-50%', left: `${x}%`, width: '28%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)', transform: 'rotate(18deg)', pointerEvents: 'none' }} />;
}

/** Out-of-focus lights drifting up through the frame. */
function bokeh({ frame }: { frame: number }) {
  return (
    <>
      {Array.from({ length: 9 }, (_, k) => {
        const r = 30 + noise(k, 1) * 60;
        // Only in the side bands, so a light never sits on a face.
        const x = k % 2 === 0 ? noise(k, 2) * W * 0.2 : W * (0.8 + noise(k, 2) * 0.2);
        const y = 1920 - ((frame * (0.6 + noise(k, 3)) + noise(k, 4) * 1920) % 2200);
        const color = k % 3 === 0 ? WARM : CYAN;
        return <div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999, background: `radial-gradient(circle, ${hexA(color, 0.26)}, ${hexA(color, 0.06)} 60%, transparent 70%)`, mixBlendMode: 'screen' }} />;
      })}
    </>
  );
}

export const cgiMotion: StyleTheme = {
  id: 'cgi-motion',
  accent: CYAN,
  colors: [WARM, '#FFFFFF'],
  footage: 'contrast(1.18) saturate(1.12) brightness(0.93)',
  entrance: 'glide',
  step: 1,
  textScale: 0.95,
  drift: (frame) => ({ x: Math.sin(frame / 90) * 0.7, y: Math.cos(frame / 120) * 0.45, scale: 1.04, rotate: Math.sin(frame / 160) * 0.35 }),
  Overlay: ({ c }) => {
    const flareX = Math.sin(c.frame / 70) * 18;
    return (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {/* Teal shadows, warm highlights. */}
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,110,130,0.55), rgba(255,140,60,0.25))', mixBlendMode: 'soft-light' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 62% at 50% 42%, transparent 45%, rgba(0,8,14,0.8) 100%)' }} />
        {bokeh({ frame: c.frame })}
        {/* An anamorphic flare streak across the upper frame. */}
        <div style={{ position: 'absolute', left: '-20%', right: '-20%', top: '21%', height: 5, transform: `translateX(${flareX}%)`, background: `linear-gradient(90deg, transparent, ${hexA(CYAN, 0.5)} 35%, #fff 50%, ${hexA(CYAN, 0.5)} 65%, transparent)`, filter: 'blur(1.5px)', opacity: 0.35 + 0.15 * Math.sin(c.frame / 25) }} />
      </AbsoluteFill>
    );
  },
  caption: {
    size: 76,
    glyph: 0.6,
    entrance: 'fade',
    box: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, letterSpacing: -1 }),
    word: (emphasis) => ({ color: emphasis ? WARM : '#fff', textShadow: `0 0 20px ${hexA(emphasis ? WARM : CYAN, 0.6)}, 0 6px 18px rgba(0,0,0,0.75)` }),
  },
  hook: {
    top: 0.13,
    entrance: 'glide',
    box: () => ({ ...glass(), padding: '28px 44px' }),
    text: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, fontSize: 62, lineHeight: 1.14, letterSpacing: -1.5, ...gradientText(CHROME), filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.45))' }),
    Decor: ({ c }) => sweep({ frame: c.frame, period: 75 }),
  },
  card: glass,
  title: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, letterSpacing: -1, ...gradientText(CHROME) }),
  body: (c) => ({ fontFamily: c.fonts.body, fontWeight: 500, color: CYAN }),
  number: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, letterSpacing: -6, ...gradientText(CHROME), filter: `drop-shadow(0 0 24px ${hexA(CYAN, 0.7)}) drop-shadow(0 12px 20px rgba(0,0,0,0.6))` }),
  slam: (c) => ({ fontFamily: c.fonts.display, fontWeight: 700, letterSpacing: -2, textTransform: 'uppercase', ...gradientText(CHROME), filter: `drop-shadow(0 0 26px ${hexA(CYAN, 0.8)})` }),
  // A lens flare streak behind the word, sweeping once as it lands.
  SlamBack: ({ c, t }) => {
    const x = interpolate(c.frame, [0, 16], [-30, 30], clamp);
    return (
      <>
        <div style={{ position: 'absolute', left: '-40%', right: '-40%', top: '48%', height: 6, transform: `translateX(${x}%) scaleX(${t})`, background: `linear-gradient(90deg, transparent, ${CYAN} 40%, #fff 50%, ${CYAN} 60%, transparent)`, filter: 'blur(1px)', boxShadow: `0 0 30px ${CYAN}` }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 220, height: 220, marginLeft: -110 + x * 4, marginTop: -110, borderRadius: 999, background: `radial-gradient(circle, ${hexA('#ffffff', 0.5)}, ${hexA(CYAN, 0.15)} 40%, transparent 70%)`, opacity: t }} />
      </>
    );
  },
  Marker: ({ t }) => <span style={{ flex: 'none', width: 30, height: 30, borderRadius: 999, background: `radial-gradient(circle at 35% 30%, #fff, ${CYAN} 45%, #0A4450)`, boxShadow: `0 0 16px ${CYAN}`, transform: `scale(${t})` }} />,
  Ring: ({ c, x, y, r, t }) => (
    <g style={{ filter: `drop-shadow(0 0 12px ${CYAN})` }}>
      <circle cx={x} cy={y} r={r * t} fill="none" stroke="#fff" strokeWidth={4} />
      <circle cx={x} cy={y} r={r * t + 14 + 6 * Math.sin(c.frame / 8)} fill="none" stroke={CYAN} strokeWidth={2} opacity={0.6} />
    </g>
  ),
  stage: { shape: 'circle', fill: ['#16323C', '#04080B'], ring: 'rgba(255,255,255,0.7)', ringWidth: 3, glow: CYAN },
  transition: {
    before: 4,
    after: 9,
    // A bright band of light crosses the frame as the shot changes.
    Draw: ({ d }) => {
      const x = interpolate(d, [-4, 9], [-80, 140], clamp);
      const flash = interpolate(d, [-2, 0, 6], [0, 0.45, 0], clamp);
      return (
        <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', bottom: '-30%', left: `${x}%`, width: '45%', transform: 'rotate(14deg)', background: `linear-gradient(90deg, transparent, ${hexA(CYAN, 0.3)} 30%, rgba(255,255,255,0.75) 50%, ${hexA(WARM, 0.3)} 70%, transparent)`, mixBlendMode: 'screen' }} />
          <AbsoluteFill style={{ background: '#fff', opacity: flash, mixBlendMode: 'screen' }} />
        </AbsoluteFill>
      );
    },
    camera: (d) => (d < 0 ? { scale: interpolate(d, [-4, 0], [1, 1.06]), blur: interpolate(d, [-4, 0], [0, 6]) } : { scale: interpolate(d, [0, 9], [1.08, 1], clamp), blur: interpolate(d, [0, 6], [8, 0], clamp) }),
  },
  Progress: ({ c, total }) => (
    <div style={{ position: 'absolute', top: 0, left: 0, height: 5, width: `${(c.frame / Math.max(1, total)) * 100}%`, background: `linear-gradient(90deg, ${hexA(CYAN, 0.2)}, ${CYAN}, #fff)`, boxShadow: `0 0 16px ${CYAN}` }} />
  ),
  sample: { type: 'counter', text: '4.2M', subtext: 'views this month' },
};
