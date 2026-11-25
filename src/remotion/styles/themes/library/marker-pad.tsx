import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerCheck, ringScribble, text, trWipe } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Marker Pad: a pad of matte white paper on a binding and one black bullet-tip marker; blue only for
 * what we know, red only for what we do not. The page flips up over the binding at each jump.
 */

const PAPER = '#FFFFFF';
const BLACK = '#121212';
const BLUE = '#1F6FEB';
const RED = '#E03131';

function Pad({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120);
  const s = (a: number, b: number) => smooth(u, a, b);
  const f = c.fonts.display;
  return (
    <AbsoluteFill style={{ background: '#C9C3B8' }}>
      {/* The pad: paper with a soft shadow and the binding along the top. */}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 150, bottom: 120, background: PAPER, boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 4px 0 #E8E4DC, 0 8px 0 #DDD8CE' }} />
      <div style={{ position: 'absolute', left: 30, right: 30, top: 120, height: 60, background: '#2B2B2B', borderRadius: 10 }} />
      {svgFrame(
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* A number line with known points in blue and an unknown in red. */}
          <path d="M 120 760 H 960 m -30 -20 l 30 20 l -30 20" stroke={BLACK} strokeWidth={8} style={drawStroke(s(0, 0.2), 1000)} />
          {[220, 400, 580].map((x, k) => (
            <g key={x} opacity={s(0.2 + k * 0.06, 0.28 + k * 0.06)}>
              <circle cx={x} cy={760} r={30} stroke={BLUE} strokeWidth={8} />
              {label(x, 850, ['$1', '$2', '$4'][k], { size: 60, fill: BLUE, font: f })}
            </g>
          ))}
          <g opacity={s(0.42, 0.5)}>
            <circle cx={820} cy={760} r={34} stroke={RED} strokeWidth={8} strokeDasharray="14 12" />
            {label(820, 860, '?', { size: 90, fill: RED, font: f })}
          </g>
          {[220, 400, 580].map((x, k) => (
            <path key={k} d={`M ${x + 20} 700 Q ${x + 90} ${620} ${x + 160} 700`} stroke={BLACK} strokeWidth={5} style={drawStroke(s(0.5 + k * 0.08, 0.6 + k * 0.08), 260)} />
          ))}
          <g opacity={s(0.72, 0.8)}>{label(470, 610, 'x2 each time', { size: 54, fill: BLACK, font: f })}</g>
          {/* The question boxed at the bottom. */}
          <rect x={160} y={1000} width={760} height={190} rx={8} stroke={RED} strokeWidth={7} style={drawStroke(s(0.8, 0.95), 2000)} />
          <g opacity={s(0.9, 1)}>{label(540, 1115, 'what comes next?', { size: 64, fill: RED, font: f })}</g>
        </g>,
      )}
      {grain({ color: '#7A7468', alpha: 0.18, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const markerPad = defineStyle({
  id: 'marker-pad',
  accent: BLUE,
  colors: [RED, BLACK],
  entrance: 'write',
  Scene: Pad,
  pip: pipAt({ border: `7px solid ${BLACK}`, boxShadow: '0 10px 22px rgba(0,0,0,0.25)' }, 'circle'),
  Overlay: () => null,
  caption: caption({ size: 92, glyph: 0.55, color: BLACK, emph: BLUE, upper: true, bg: 'rgba(255,255,255,0.95)', pad: '6px 24px', radius: 6, entrance: 'write' }),
  hook: hook({ top: 0.08, entrance: 'write', color: BLACK, size: 76, upper: true, bg: PAPER, pad: '14px 30px', boxShadow: '0 10px 22px rgba(0,0,0,0.2)', Decor: ({ t }) => <div style={{ height: 9, marginTop: 6, background: RED, borderRadius: 5, transform: `scaleX(${t})`, transformOrigin: 'left' }} /> }),
  card: card({ bg: PAPER, border: `6px solid ${BLACK}`, radius: 6, shadow: '0 12px 26px rgba(0,0,0,0.22)' }),
  title: text({ color: BLACK, upper: true }),
  body: text({ font: 'body', color: '#222' }),
  number: text({ color: BLUE, shadow: '0 0 20px #fff' }),
  slam: text({ color: RED, upper: true, shadow: '0 0 24px #fff' }),
  Marker: markerCheck(BLUE),
  Ring: ringScribble(RED, 9, 5),
  stage: { shape: 'square', fill: [PAPER, '#F3F3F3'], ring: BLACK, ringWidth: 6 },
  transition: trWipe({ color: PAPER, dir: 'up', before: 5, after: 9, edge: '18px solid #2B2B2B' }),
  sample: { type: 'counter', text: '$8', subtext: 'what comes next' },
});
