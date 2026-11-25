import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Mascot Screencast: a product walkthrough that looks like a real screen recording inside a desktop
 * window, with a low-resolution pixel mascot (an original character) living on the window's edge, and an
 * oversized cursor that glides and clicks (the HyperFrames oversized-cursor technique).
 */

const DESK = '#EEF0F5';
const ACCENT = '#7C5CFF';
const WIN = { x: 50, y: 330, w: 980, h: 1180 };

/** An 8 x 8 pixel mascot (a little robot) drawn from a map, walking, blinking, waving when you speak. */
const ROBOT = ['..XXXX..', '.XXXXXX.', 'XX.XX.XX', 'XXXXXXXX', '.XX..XX.', '.XXXXXX.', '..X..X..', '.XX..XX.'];

function Mascot({ c }: { c: Ctx }) {
  const voice = useVoice();
  const talk = voice.level(c.frame) > 0.4;
  const x = WIN.x + 80 + ((Math.sin(c.frame / 70) + 1) / 2) * (WIN.w - 240);
  const blink = c.frame % 80 < 4;
  const px = 12;
  return (
    <svg width={px * 8} height={px * 8} style={{ position: 'absolute', left: x, top: WIN.y - px * 8 + 4 - (Math.floor(c.frame / 6) % 2) * 4 }} shapeRendering="crispEdges">
      {ROBOT.flatMap((row, y) => row.split('').map((ch, k) => (ch === 'X' ? <rect key={`${y}-${k}`} x={k * px} y={y * px} width={px} height={px} fill={y === 2 && (k === 2 || k === 5) ? (blink ? ACCENT : '#fff') : y === 4 && talk ? '#FF5C8A' : ACCENT} /> : null)))}
    </svg>
  );
}

/** The oversized cursor: glides between points, presses on each caption line. */
function Cursor({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const pts: [number, number][] = [[620, 760], [380, 1020], [760, 1240], [300, 640]];
  const a = pts[Math.max(0, k) % pts.length];
  const b = pts[(Math.max(0, k) + 1) % pts.length];
  const t = Math.min(1, Math.max(0, (d - 4) / 14));
  const e = t * t * (3 - 2 * t);
  const x = a[0] + (b[0] - a[0]) * e;
  const y = a[1] + (b[1] - a[1]) * e;
  const press = d < 4 ? 0.85 : 1;
  return (
    <svg width={110} height={130} viewBox="0 0 22 26" style={{ position: 'absolute', left: x, top: y, transform: `scale(${press})`, transformOrigin: '0 0', filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.35))' }}>
      <path d="M 1 1 L 1 20 L 6 15 L 9.5 23 L 13 21.5 L 9.5 14 L 16 14 Z" fill="#111" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

function Desktop() {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, #F7F8FB, ${DESK})` }}>
      <div style={{ position: 'absolute', left: WIN.x, top: WIN.y - 56, width: WIN.w, height: WIN.h + 56, borderRadius: 22, background: '#fff', boxShadow: '0 40px 80px rgba(40,40,80,0.25)', overflow: 'hidden' }}>
        <div style={{ height: 56, background: '#F3F4F7', display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px' }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((col) => (
            <span key={col} style={{ width: 18, height: 18, borderRadius: 9, background: col }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

export const mascotScreencast = defineStyle({
  id: 'mascot-screencast',
  accent: ACCENT,
  colors: ['#FF5C8A', '#28C840'],
  entrance: 'bounce',
  screen: { ...WIN, shape: 'rect', radius: 0, style: { borderBottomLeftRadius: 22, borderBottomRightRadius: 22 } },
  Backdrop: Desktop,
  Overlay: ({ c }) => (
    <AbsoluteFill>
      <Mascot c={c} />
      <Cursor c={c} />
    </AbsoluteFill>
  ),
  caption: caption({ size: 84, glyph: 0.55, color: '#FFFFFF', emph: '#FFE36E', weight: 700, bg: '#17151F', pad: '10px 26px', radius: 18, entrance: 'bounce' }),
  hook: hook({ top: 0.06, color: '#17151F', size: 58, weight: 700, bg: '#FFFFFF', radius: 20, pad: '18px 30px', boxShadow: '0 16px 40px rgba(40,40,80,0.2)', boxExtra: { borderLeft: `12px solid ${ACCENT}` }, entrance: 'bounce' }),
  card: card({ bg: '#FFFFFF', radius: 22, shadow: '0 20px 50px rgba(40,40,80,0.25)' }),
  title: text({ color: '#17151F', weight: 700 }),
  body: text({ font: 'body', color: '#555266' }),
  number: text({ color: ACCENT, weight: 700, stroke: [8, '#fff'] }),
  slam: text({ color: '#fff', weight: 700, extra: { background: ACCENT, padding: '0 28px', borderRadius: 20 } }),
  Marker: markerDot([ACCENT, '#FF5C8A', '#28C840'], 26),
  Ring: ringCircle(ACCENT, 8, { under: [16, '#fff'] }),
  stage: { shape: 'square', fill: ['#FFFFFF', DESK], ring: ACCENT, ringWidth: 5 },
  transition: trWipe({ color: ACCENT, dir: 'up', before: 4, after: 8 }),
  sample: { type: 'callout', text: 'Click here' },
});
