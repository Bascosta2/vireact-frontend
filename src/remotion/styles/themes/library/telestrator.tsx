import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerArrow, text } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { scanlines } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Telestrator: the TV analysis segment. Yellow rings sit under the action, arrows are drawn on the
 * broadcast picture, a dashed run line traces the movement; each cut rewinds (VHS lines, a quick reverse
 * jitter) and the next shot freezes for a beat with a FREEZE tag.
 */

const YELLOW = '#FFE600';
const CYAN = '#22D3EE';

function Pen({ c }: { c: Ctx }) {
  const u = Math.min(1, (c.frame % 210) / 70);
  return (
    <AbsoluteFill>
      {svgFrame(
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.6))' }}>
          <ellipse cx={360} cy={1180} rx={110} ry={34} stroke={YELLOW} strokeWidth={8} style={drawStroke(smooth(u, 0, 0.25), 480)} />
          <ellipse cx={760} cy={980} rx={90} ry={28} stroke={CYAN} strokeWidth={8} style={drawStroke(smooth(u, 0.2, 0.4), 400)} />
          <path d="M 380 1140 C 470 1020 600 980 700 975" stroke={YELLOW} strokeWidth={8} strokeDasharray="22 16" style={drawStroke(smooth(u, 0.35, 0.7), 500)} />
          <path d="M 690 955 l 30 20 l -34 14" stroke={YELLOW} strokeWidth={8} opacity={smooth(u, 0.65, 0.7)} />
          <path d="M 220 760 Q 330 700 420 760" stroke="#fff" strokeWidth={6} opacity={smooth(u, 0.7, 0.9)} />
        </g>,
      )}
      <div style={{ position: 'absolute', left: 40, top: 120, padding: '6px 14px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontFamily: c.fonts.body, fontSize: 26, letterSpacing: 2 }}>ANALYSIS · REPLAY</div>
    </AbsoluteFill>
  );
}

/** Rewind: VHS lines and reverse jitter, then a FREEZE tag on the new shot. */
const rewind: StyleTheme['transition'] = {
  before: 6,
  after: 14,
  Draw: ({ c, d }) =>
    d < 0 ? (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        {scanlines({ gap: 6, alpha: 0.45 })}
        {Array.from({ length: 4 }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: 0, right: 0, top: `${noise(c.frame, k) * 100}%`, height: 26, background: 'rgba(255,255,255,0.35)', filter: 'blur(3px)' }} />
        ))}
        <div style={{ position: 'absolute', right: 50, top: 260, color: '#fff', fontFamily: c.fonts.display, fontSize: 64 }}>◀◀</div>
      </AbsoluteFill>
    ) : (
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', right: 50, top: 260, padding: '6px 18px', background: YELLOW, color: '#000', fontFamily: c.fonts.display, fontSize: 46, opacity: interpolate(d, [10, 14], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>FREEZE</div>
      </AbsoluteFill>
    ),
  camera: (d) => (d < 0 ? { x: (noise(d, 3) - 0.5) * 3 } : {}),
};

export const telestrator = defineStyle({
  id: 'telestrator',
  accent: YELLOW,
  colors: [CYAN, '#FFFFFF'],
  entrance: 'pop',
  footage: 'contrast(1.06) saturate(1.1)',
  Overlay: Pen,
  caption: caption({ size: 90, glyph: 0.5, color: '#FFFFFF', emph: YELLOW, upper: true, weight: 800, letter: 1, stroke: [8, '#000'], shadow: '0 6px 0 #000' }),
  hook: hook({ top: 0.16, align: 'left', color: '#000', size: 64, upper: true, weight: 800, bg: YELLOW, pad: '10px 24px', rotate: -2 }),
  card: card({ bg: 'rgba(10,10,14,0.88)', border: `3px solid ${YELLOW}`, radius: 8 }),
  title: text({ color: '#FFFFFF', upper: true, weight: 800 }),
  body: text({ font: 'body', color: CYAN, weight: 600 }),
  number: text({ color: YELLOW, weight: 800, stroke: [8, '#000'] }),
  slam: text({ color: YELLOW, upper: true, weight: 800, stroke: [10, '#000'] }),
  Marker: markerArrow(YELLOW),
  Ring: ({ x, y, r, t }: { x: number; y: number; r: number; t: number }) => <ellipse cx={x} cy={y + r * 0.6} rx={r * 1.2 * t} ry={r * 0.38 * t} fill="none" stroke={YELLOW} strokeWidth={8} />,
  stage: { shape: 'circle', fill: ['#1D3A1F', '#0D1A0E'], ring: YELLOW, ringWidth: 6 },
  transition: rewind,
  sample: { type: 'callout', text: 'Watch him' },
});
