import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerNum, ringCircle, text, trWipe } from '../../kit/presets';
import { drawCycle, isoBox, label, svgFrame } from '../../kit/scenery';
import { grain } from '../../kit/textures';
import { smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Assembly Manual: a printed assembly sheet. Black line art in true isometric, flat white parts,
 * step numbers in circles, arrows showing where each part goes; parts slide into place in order.
 */

const SHEET = '#F6F4EE';
const INK = '#111111';

/** An outlined white isometric part. */
const part = (x: number, y: number, w: number, d: number, h: number, key: string) => {
  const b = isoBox(x, y, w, d, h);
  return (
    <g key={key} stroke={INK} strokeWidth={4} strokeLinejoin="round">
      <polygon points={b.left} fill="#E9E9E9" />
      <polygon points={b.right} fill="#F8F8F8" />
      <polygon points={b.top} fill="#FFFFFF" />
    </g>
  );
};

const stepBadge = (x: number, y: number, n: number, t: number, c: Ctx) => (
  <g opacity={t}>
    <circle cx={x} cy={y} r={38} fill={INK} />
    {label(x, y + 15, String(n), { size: 44, fill: '#fff', font: c.fonts.display })}
  </g>
);

function Sheet({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120);
  const s = (a: number, b: number) => smooth(u, a, b);
  // Each part slides down its arrow into place.
  const slide = (a: number) => (1 - s(a, a + 0.18)) * -160;
  return (
    <AbsoluteFill style={{ background: SHEET }}>
      {svgFrame(
        <g>
          <rect x={50} y={150} width={980} height={1240} fill="none" stroke={INK} strokeWidth={4} />
          <line x1={540} y1={150} x2={540} y2={1390} stroke={INK} strokeWidth={2} />
          <line x1={50} y1={770} x2={1030} y2={770} stroke={INK} strokeWidth={2} />
          {/* Step 1: the base. */}
          {stepBadge(110, 210, 1, s(0, 0.1), c)}
          {part(300, 520, 140, 90, 40, 'base')}
          {/* Step 2: a panel drops onto the base. */}
          {stepBadge(600, 210, 2, s(0.2, 0.3), c)}
          {part(790, 520, 140, 90, 40, 'base2')}
          <g transform={`translate(0 ${slide(0.25)})`} opacity={s(0.22, 0.3)}>{part(790, 460, 140, 20, 160, 'panel')}</g>
          <path d="M 860 260 V 330 m -18 -20 l 18 22 l 18 -22" stroke={INK} strokeWidth={4} fill="none" opacity={s(0.22, 0.3)} />
          {/* Step 3: two screws turn in. */}
          {stepBadge(110, 830, 3, s(0.45, 0.55), c)}
          {part(300, 1140, 140, 90, 40, 'base3')}
          {part(300, 1080, 140, 20, 160, 'panel3')}
          {[0, 1].map((k) => (
            <g key={k} transform={`translate(${250 + k * 90} ${1000 + k * 46 + slide(0.5 + k * 0.08) * 0.4}) rotate(${c.frame * 8})`} opacity={s(0.5 + k * 0.08, 0.58 + k * 0.08)}>
              <circle r={14} fill="#fff" stroke={INK} strokeWidth={4} />
              <line x1={-8} y1={0} x2={8} y2={0} stroke={INK} strokeWidth={4} />
            </g>
          ))}
          {/* Step 4: a faceless figure gives a thumbs up beside the finished shelf. */}
          {stepBadge(600, 830, 4, s(0.72, 0.82), c)}
          <g opacity={s(0.75, 0.9)}>
            {part(760, 1140, 140, 90, 40, 'base4')}
            {part(760, 1080, 140, 20, 160, 'panel4')}
            <g stroke={INK} strokeWidth={5} fill="#fff" strokeLinecap="round">
              <circle cx={960} cy={930} r={30} />
              <path d="M 960 960 V 1080 M 960 990 L 920 1040 M 960 990 L 1000 950 M 960 1080 L 935 1150 M 960 1080 L 985 1150" fill="none" />
            </g>
          </g>
        </g>,
      )}
      {grain({ color: '#6E6A60', alpha: 0.12, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const assemblyManual = defineStyle({
  id: 'assembly-manual',
  accent: '#111111',
  colors: ['#FFFFFF', '#E9E9E9'],
  entrance: 'glide',
  Scene: Sheet,
  pip: pipAt({ border: `6px solid ${INK}` }, 'rect', { radius: 0 }),
  caption: caption({ size: 96, glyph: 0.42, color: INK, emphBg: INK, emphColor: '#fff', upper: true, weight: 700, bg: '#FFFFFF', pad: '6px 22px', boxExtra: { border: `5px solid ${INK}` }, entrance: 'glide' }),
  hook: hook({ top: 0.085, color: '#fff', size: 72, upper: true, weight: 700, letter: 2, bg: INK, pad: '16px 30px' }),
  card: card({ bg: '#FFFFFF', border: `6px solid ${INK}` }),
  title: text({ color: INK, upper: true, weight: 700, letter: 1 }),
  body: text({ font: 'body', color: '#222', weight: 500 }),
  number: text({ color: INK, weight: 700, stroke: [10, '#fff'] }),
  slam: text({ color: '#fff', upper: true, weight: 700, extra: { background: INK, padding: '0 28px' } }),
  Marker: markerNum({ bg: INK, fg: '#fff', size: 60 }),
  Ring: ringCircle(INK, 8, { under: [16, '#fff'] }),
  stage: { shape: 'square', fill: ['#FFFFFF', SHEET], ring: INK, ringWidth: 6 },
  transition: trWipe({ color: SHEET, dir: 'left', edge: `6px solid ${INK}` }),
  sample: { type: 'list', text: 'Set it up', items: ['Unbox the base', 'Clip the panel', 'Tighten 2 screws'] },
});
