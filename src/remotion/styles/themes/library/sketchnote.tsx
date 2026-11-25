import { AbsoluteFill } from 'remotion';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerScribble, ringScribble, text, trWipe } from '../../kit/presets';
import { drawCycle, label, svgFrame } from '../../kit/scenery';
import { dotGrid, grain } from '../../kit/textures';
import { drawStroke, smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Sketchnote: one page of visual notes on dot-grid paper, drawn while you talk. A black fineliner
 * draws and letters, a grey marker adds shadow, one yellow highlighter marks what matters.
 */

const PAPER = '#FBF8F1';
const INK = '#17181C';
const GREY = '#B9BCC4';
const YELLOW = '#FFD23F';

function Page({ c }: { c: Ctx }) {
  const u = drawCycle(c.frame, 120);
  const s = (a: number, b: number) => smooth(u, a, b);
  const f = c.fonts.display;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {dotGrid({ color: '#5A5F6B', size: 40, alpha: 0.28 })}
      {svgFrame(
        <g fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
          {/* The light bulb with a grey shadow and yellow glow. */}
          <circle cx={290} cy={520} r={150} fill={YELLOW} stroke="none" opacity={0.75 * s(0.3, 0.45)} />
          <path d="M 300 380 C 220 380 180 440 190 500 C 198 548 240 570 250 620 L 330 620 C 340 570 384 548 392 500 C 402 440 362 380 300 380 Z" fill={GREY} stroke="none" opacity={0.6 * s(0.25, 0.4)} transform="translate(12 12)" />
          <path d="M 290 370 C 210 370 170 430 180 490 C 188 538 230 560 240 610 L 340 610 C 350 560 394 538 402 490 C 412 430 372 370 290 370 Z" fill={PAPER} style={drawStroke(s(0, 0.2), 900)} />
          <path d="M 250 640 H 330 M 258 668 H 322" style={drawStroke(s(0.15, 0.25), 200)} />
          {[[-140, -40], [-120, -150], [0, -200], [120, -150], [140, -40]].map(([dx, dy], k) => (
            <path key={k} d={`M ${290 + dx * 0.8} ${470 + dy * 0.8} L ${290 + dx} ${470 + dy}`} style={drawStroke(s(0.2 + k * 0.03, 0.3 + k * 0.03), 80)} />
          ))}
          {/* A ribbon banner, then three boxes of notes joined by arrows. */}
          <path d="M 520 400 H 980 L 950 450 L 980 500 H 520 L 550 450 Z" fill={PAPER} style={drawStroke(s(0.3, 0.45), 1200)} />
          <g stroke="none" fill={INK} opacity={s(0.42, 0.5)}>{label(750, 465, 'KEY IDEAS', { size: 46, font: f, fill: INK })}</g>
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect x={130 + k * 300} y={820} width={240} height={170} rx={16} fill={k === 1 ? YELLOW : PAPER} fillOpacity={k === 1 ? 0.6 : 1} style={drawStroke(s(0.45 + k * 0.1, 0.6 + k * 0.1), 900)} />
              <rect x={142 + k * 300} y={832} width={240} height={170} rx={16} fill={GREY} stroke="none" opacity={0.35 * s(0.55 + k * 0.1, 0.62 + k * 0.1)} style={{ mixBlendMode: 'multiply' }} />
              <g stroke="none" fill={INK} opacity={s(0.58 + k * 0.1, 0.66 + k * 0.1)}>{label(250 + k * 300, 920, ['cue', 'routine', 'reward'][k], { size: 44, font: f, fill: INK })}</g>
              {k < 2 && <path d={`M ${380 + k * 300} ${905} h 40 m -14 -14 l 14 14 l -14 14`} style={drawStroke(s(0.6 + k * 0.1, 0.66 + k * 0.1), 100)} />}
            </g>
          ))}
          {/* A circle-and-star doodle and a squiggle underline. */}
          <path d="M 160 1150 q 100 -30 200 0 t 200 0 t 200 0 t 200 0" style={drawStroke(s(0.85, 1), 900)} />
        </g>,
      )}
      {grain({ color: '#7A6A50', alpha: 0.25, freq: 0.8 })}
    </AbsoluteFill>
  );
}

export const sketchnote = defineStyle({
  id: 'sketchnote',
  accent: YELLOW,
  colors: [INK, GREY],
  entrance: 'write',
  Scene: Page,
  pip: pipAt({ border: `6px solid ${INK}`, boxShadow: `14px 14px 0 ${GREY}` }, 'rect', { radius: 24 }),
  Overlay: ({ scene }) => (scene ? null : <AbsoluteFill>{dotGrid({ color: '#fff', size: 40, alpha: 0.12 })}</AbsoluteFill>),
  caption: caption({ size: 98, glyph: 0.44, color: INK, emphBg: YELLOW, emphColor: INK, bg: PAPER, pad: '6px 26px', radius: 14, boxExtra: { boxShadow: `8px 8px 0 ${GREY}`, border: `4px solid ${INK}` }, entrance: 'write' }),
  hook: hook({
    top: 0.08,
    entrance: 'write',
    color: INK,
    size: 78,
    bg: PAPER,
    border: `5px solid ${INK}`,
    radius: 8,
    boxShadow: `12px 12px 0 ${GREY}`,
    Decor: ({ t }) => <div style={{ position: 'absolute', left: -14, right: -14, bottom: 18, height: 26, background: YELLOW, opacity: 0.7, zIndex: -1, transform: `scaleX(${t})`, transformOrigin: 'left' }} />,
  }),
  card: card({ bg: PAPER, border: `5px solid ${INK}`, radius: 18, shadow: `12px 12px 0 ${GREY}` }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#30333B' }),
  number: text({ color: INK, extra: { background: YELLOW, padding: '0 20px', borderRadius: 12 } }),
  slam: text({ color: INK, extra: { background: YELLOW, padding: '0 24px' } }),
  Marker: markerScribble(INK),
  Ring: ringScribble(INK, 7),
  stage: { shape: 'square', fill: [PAPER, '#F1ECDF'], ring: INK, ringWidth: 6 },
  transition: trWipe({ color: PAPER, dir: 'left', angle: -4, edge: `6px solid ${INK}` }),
  sample: { type: 'list', text: 'Habit loop', items: ['Cue', 'Routine', 'Reward'] },
});
