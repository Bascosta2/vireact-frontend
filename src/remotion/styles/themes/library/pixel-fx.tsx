import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text, trPixels } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { noise, type Ctx, type StyleTheme } from '../../theme';

/**
 * Pixel FX: pixel-art effects from a game's VFX sheet land on your footage (the pixelfx catalogue:
 * explosions, lightning, coins, level-ups, hit sparks), drawn on a strict pixel grid with a limited
 * palette and stepped motion. A hit spark fires on every beat of the talk, a coin burst on emphasis
 * words, a pixel explosion behind slams, and cuts dissolve in pixels.
 */

const P = 12;
const FIRE = ['#FFF4B0', '#FFD23F', '#FF8A1F', '#E63A1F', '#7A1F1F'];
const GOLD = '#FFD23F';
const CYAN = '#7CF3FF';

/** A pixel burst: squares flying out from (x, y), `t` frames after it fired. */
function burst(x: number, y: number, t: number, colors: string[], n: number, seed: number, reach = 22) {
  return Array.from({ length: n }, (_, k) => {
    const a = noise(k, seed) * Math.PI * 2;
    const sp = 0.5 + noise(k, seed + 1) * 0.8;
    const d = Math.min(reach, t * 3 * sp) * P * 0.4;
    const col = colors[Math.min(colors.length - 1, Math.floor((t / 10) * colors.length + noise(k, seed + 2) * 2))];
    if (t > 14) return null;
    return <rect key={k} x={Math.round((x + Math.cos(a) * d) / P) * P} y={Math.round((y + Math.sin(a) * d) / P) * P} width={P} height={P} fill={col} />;
  });
}

/** A pixel lightning bolt down to (x, y). */
function bolt(x: number, y: number, seed: number) {
  const pts: [number, number][] = [];
  let cx = x + (noise(seed, 1) - 0.5) * 200;
  for (let yy = 120; yy < y; yy += P * 2) {
    cx += (noise(seed + yy, 2) - 0.5) * P * 6;
    pts.push([Math.round(cx / P) * P, yy]);
  }
  return pts.map(([px, py], k) => <rect key={k} x={px} y={py} width={P * 2} height={P * 2} fill={k % 3 ? '#FFFFFF' : CYAN} />);
}

function Fx({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const f = Math.floor(c.frame / 2) * 2;
  const step = Math.floor(d / 2) * 2;
  const spot = { x: 200 + noise(k, 3) * 680, y: 400 + noise(k, 4) * 500 };
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }} shapeRendering="crispEdges">
        {k >= 0 && step < 14 && burst(spot.x, spot.y, step, FIRE, 26, k)}
        {k >= 0 && k % 3 === 2 && step < 6 && bolt(spot.x, spot.y, k)}
        {voice.emphasis(c.frame) && burst(900, 1500, (f % 14), [GOLD, '#FFF4B0', '#C98A1A'], 14, 77)}
      </svg>
      {/* The HUD: hearts and an XP bar that fills over the video. */}
      <div style={{ position: 'absolute', left: 48, top: 120, display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((h) => (
          <svg key={h} width={60} height={54} viewBox="0 0 10 9" shapeRendering="crispEdges">
            <path d="M1 0h3v1h2V0h3v1h1v3H9v1H8v1H7v1H6v1H4V7H3V6H2V5H1V4H0V1h1z" fill="#E63A5A" stroke="#14112B" strokeWidth={0.4} />
          </svg>
        ))}
      </div>
    </AbsoluteFill>
  );
}

const explosion: StyleTheme['SlamBack'] = ({ t }) => (
  <svg viewBox="-300 -300 600 600" width={700} height={700} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }} shapeRendering="crispEdges">
    {burst(0, 0, Math.floor(t * 9), FIRE, 60, 5, 30)}
  </svg>
);

export const pixelFx = defineStyle({
  id: 'pixel-fx',
  accent: GOLD,
  colors: ['#E63A1F', CYAN],
  entrance: 'step',
  step: 3,
  textScale: 0.9,
  footage: 'saturate(1.2) contrast(1.08)',
  Overlay: Fx,
  caption: caption({ size: 70, glyph: 0.9, color: '#FFFFFF', emph: GOLD, upper: true, shadow: '6px 6px 0 #14112B', entrance: 'step' }),
  hook: hook({ top: 0.11, align: 'left', entrance: 'step', typewriter: true, color: '#FFFFFF', size: 44, upper: true, lineHeight: 1.4, bg: '#14112B', border: '6px solid #FFFFFF', pad: '18px 24px', boxShadow: '8px 8px 0 #000' }),
  card: card({ bg: '#14112B', border: '6px solid #FFFFFF', shadow: '8px 8px 0 #000' }),
  title: text({ color: '#FFFFFF', upper: true }),
  body: text({ font: 'body', color: CYAN }),
  number: text({ color: GOLD, shadow: '8px 8px 0 #7A1F1F' }),
  slam: text({ color: '#FFFFFF', upper: true, shadow: '8px 8px 0 #E63A1F' }),
  SlamBack: explosion,
  Marker: markerSquare([GOLD, '#E63A1F', CYAN], 24),
  Ring: ringSquare(GOLD, 8),
  stage: { shape: 'square', fill: ['#2A2450', '#14112B'], ring: '#FFFFFF', ringWidth: 6 },
  transition: trPixels({ color: '#14112B', cell: 72 }),
  sample: { type: 'slam', text: 'K.O.!' },
});
