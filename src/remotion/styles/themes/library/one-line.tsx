import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trWipe } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { drawStroke } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * One Line: a single ink line that never leaves the paper. Everything on screen is that one line being
 * drawn: a face in profile that becomes a bird, then a house, then a heart; scenes do not cut, they
 * morph, and the pen tip glows where it draws.
 */

const PAPER = '#FAF7F0';
const INK = '#151515';
const RED = '#E0402A';

/** Three single-line drawings with the same number of points, so one can morph into the next. */
const SHAPES: [number, number][][] = [
  // A face in profile.
  [[200, 1100], [300, 1080], [380, 1000], [420, 880], [470, 820], [440, 760], [480, 700], [470, 600], [520, 520], [600, 480], [700, 500], [760, 580], [770, 700], [740, 820], [780, 900], [720, 1000], [800, 1100], [900, 1120]],
  // A bird in flight.
  [[200, 1100], [300, 900], [380, 760], [450, 700], [520, 760], [540, 820], [560, 760], [640, 680], [740, 640], [840, 680], [760, 720], [680, 760], [640, 840], [600, 900], [560, 960], [620, 1040], [760, 1080], [900, 1120]],
  // A house with a heart in the door.
  [[200, 1100], [260, 1100], [260, 800], [540, 560], [820, 800], [820, 1100], [640, 1100], [640, 940], [600, 900], [560, 940], [540, 920], [520, 940], [480, 900], [440, 940], [440, 1100], [600, 1100], [760, 1110], [900, 1120]],
];

function Line({ c }: { c: Ctx }) {
  const period = 150;
  const i = Math.floor(c.frame / period) % SHAPES.length;
  const t = Math.min(1, ((c.frame % period) - 90) / 40);
  const ease = t <= 0 ? 0 : t * t * (3 - 2 * t);
  const a = SHAPES[i];
  const b = SHAPES[(i + 1) % SHAPES.length];
  const pts = a.map(([x, y], k) => [x + (b[k][0] - x) * ease, y + (b[k][1] - y) * ease]);
  const draw = Math.min(1, (c.frame % (period * SHAPES.length)) / 60);
  const d = `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x, y], k) => {
    const [px, py] = pts[k];
    return `Q ${px} ${py} ${(px + x) / 2} ${(py + y) / 2}`;
  }).join(' ');
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {svgFrame(
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={d} stroke={INK} strokeWidth={7} style={drawStroke(draw, 3000)} />
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={10} fill={RED} />
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.15, freq: 0.85 })}
    </AbsoluteFill>
  );
}

export const oneLine = defineStyle({
  id: 'one-line',
  accent: RED,
  colors: [INK, '#8A8478'],
  entrance: 'write',
  Scene: Line,
  pip: pipAt({ border: `4px solid ${INK}` }, 'circle'),
  caption: caption({ size: 92, glyph: 0.48, color: INK, emph: RED, weight: 300, bg: 'rgba(250,247,240,0.92)', pad: '2px 22px', entrance: 'write' }),
  hook: hook({ top: 0.08, entrance: 'write', color: INK, size: 78, weight: 300, letter: 1 }),
  card: card({ bg: PAPER, border: `2px solid ${INK}`, radius: 40 }),
  title: text({ color: INK, weight: 400 }),
  body: text({ font: 'body', color: '#5A5A5A', weight: 300 }),
  number: text({ color: RED, weight: 300 }),
  slam: text({ color: INK, weight: 300, letter: 4 }),
  Marker: markerDash(RED, 30, 3),
  Ring: ringCircle(INK, 3),
  stage: { shape: 'circle', fill: [PAPER, '#EFEBE2'], ring: INK, ringWidth: 3 },
  transition: trWipe({ color: PAPER, dir: 'right', edge: `4px solid ${INK}` }),
  sample: { type: 'headline', text: 'One line, one idea', subtext: '' },
});
