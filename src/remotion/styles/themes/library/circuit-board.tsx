import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringBrackets, text, trScan } from '../../kit/presets';
import { label, svgFrame } from '../../kit/scenery';
import { grain, layer } from '../../kit/textures';
import { type Ctx } from '../../theme';

/**
 * Circuit Board: the idea as a printed circuit board from straight above. Copper traces under green
 * solder mask, silkscreen labels, LEDs; pulses of light race along the traces into a central chip that
 * brightens as they arrive. The creator sits inside the chip package.
 */

const MASK = '#0E4A2C';
const DEEP = '#08311C';
const COPPER = '#C98A3E';
const SILK = '#F2F4EE';
const GOLD = '#FFC94D';

/** The chip (and the creator's bubble) in the middle of the board. */
const CHIP = { x: 380, y: 640, w: 320, h: 320 };

/** Traces as polylines from the board edge to a chip pin. */
const TRACES: [number, number][][] = [
  [[60, 300], [260, 300], [320, 360], [320, 700], [380, 700]],
  [[60, 520], [200, 520], [260, 580], [260, 820], [380, 820]],
  [[60, 1100], [240, 1100], [300, 1040], [300, 900], [380, 900]],
  [[1020, 260], [820, 260], [760, 320], [760, 700], [700, 700]],
  [[1020, 600], [880, 600], [820, 660], [820, 800], [700, 800]],
  [[1020, 1180], [860, 1180], [790, 1110], [790, 900], [700, 900]],
  [[540, 160], [540, 640]],
  [[460, 1320], [460, 1060], [460, 960]],
  [[620, 1320], [620, 960]],
];

const pathLen = (pts: [number, number][]) => pts.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - pts[k][0], p[1] - pts[k][1]), 0);
const pointAt = (pts: [number, number][], d: number): [number, number] => {
  let left = d;
  for (let k = 1; k < pts.length; k += 1) {
    const seg = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    if (left <= seg) return [pts[k - 1][0] + ((pts[k][0] - pts[k - 1][0]) * left) / seg, pts[k - 1][1] + ((pts[k][1] - pts[k - 1][1]) * left) / seg];
    left -= seg;
  }
  return pts[pts.length - 1];
};

function Board({ c }: { c: Ctx }) {
  // Each trace sends a pulse every 2 seconds, staggered; the chip glows when one lands.
  const arrivals = TRACES.map((_, k) => ((c.frame + k * 17) % 60) / 60);
  const glow = Math.max(...arrivals.map((a) => (a > 0.9 ? (a - 0.9) * 10 : 0)));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${MASK}, ${DEEP})` }}>
      {layer({ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.08) 0 2px, transparent 2px 6px)' })}
      {svgFrame(
        <g>
          {TRACES.map((pts, k) => (
            <g key={k}>
              <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={COPPER} strokeWidth={10} strokeLinejoin="round" opacity={0.75} />
              <circle cx={pts[0][0]} cy={pts[0][1]} r={14} fill={COPPER} stroke={DEEP} strokeWidth={5} />
              {(() => {
                const [x, y] = pointAt(pts, arrivals[k] * pathLen(pts));
                return (
                  <g>
                    <circle cx={x} cy={y} r={20} fill={GOLD} opacity={0.35} style={{ filter: 'blur(6px)' }} />
                    <circle cx={x} cy={y} r={7} fill="#FFF7D6" />
                  </g>
                );
              })()}
            </g>
          ))}
          {/* Components with silkscreen labels. */}
          {[
            [150, 420, 'R12'],
            [880, 420, 'C7'],
            [150, 940, 'R3'],
            [900, 1000, 'U2'],
          ].map(([x, y, name]) => (
            <g key={name as string}>
              <rect x={(x as number) - 40} y={(y as number) - 18} width={80} height={36} rx={6} fill="#1A1A1A" stroke={SILK} strokeWidth={2} />
              <rect x={(x as number) - 52} y={(y as number) - 10} width={12} height={20} fill={COPPER} />
              <rect x={(x as number) + 40} y={(y as number) - 10} width={12} height={20} fill={COPPER} />
              {label(x as number, (y as number) - 30, name as string, { size: 24, fill: SILK, font: c.fonts.body })}
            </g>
          ))}
          {/* LEDs that blink. */}
          {[0, 1, 2].map((k) => (
            <circle key={k} cx={180 + k * 50} cy={1260} r={12} fill={Math.floor(c.frame / 10 + k) % 3 === 0 ? '#FF5A5A' : '#5A1A1A'} style={{ filter: Math.floor(c.frame / 10 + k) % 3 === 0 ? 'drop-shadow(0 0 10px #FF5A5A)' : undefined }} />
          ))}
          {/* The chip package with pins; the creator sits in the die window. */}
          <rect x={CHIP.x - 30} y={CHIP.y - 30} width={CHIP.w + 60} height={CHIP.h + 60} rx={14} fill="#121212" stroke={glow > 0 ? GOLD : '#333'} strokeWidth={4} style={{ filter: `drop-shadow(0 0 ${10 + 30 * glow}px ${GOLD})` }} />
          {Array.from({ length: 8 }, (_, k) => (
            <g key={k} fill="#B9B9B9">
              <rect x={CHIP.x - 50} y={CHIP.y + 20 + k * 38} width={20} height={14} />
              <rect x={CHIP.x + CHIP.w + 30} y={CHIP.y + 20 + k * 38} width={20} height={14} />
              <rect x={CHIP.x + 20 + k * 38} y={CHIP.y - 50} width={14} height={20} />
              <rect x={CHIP.x + 20 + k * 38} y={CHIP.y + CHIP.h + 30} width={14} height={20} />
            </g>
          ))}
          {label(540, CHIP.y + CHIP.h + 18, 'AI-1 · NEURAL CORE', { size: 22, fill: SILK, font: c.fonts.body })}
          {label(980, 1380, 'REV B · 2026', { size: 22, fill: SILK, font: c.fonts.body, anchor: 'end', opacity: 0.8 })}
        </g>,
      )}
      {grain({ color: '#000', alpha: 0.2, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const circuitBoard = defineStyle({
  id: 'circuit-board',
  accent: GOLD,
  colors: [COPPER, SILK],
  entrance: 'flicker',
  footage: 'saturate(0.9) contrast(1.1)',
  Scene: Board,
  pip: { ...CHIP, y: CHIP.y - 10, h: CHIP.h - 20, shape: 'rect', radius: 8, style: { border: `3px solid ${GOLD}` } },
  Overlay: ({ scene }) => (scene ? null : layer({ border: `16px solid ${MASK}`, boxShadow: `inset 0 0 0 4px ${COPPER}` })),
  caption: caption({ size: 90, glyph: 0.56, color: SILK, emph: GOLD, upper: true, weight: 700, shadow: `0 0 14px ${DEEP}, 0 5px 0 ${DEEP}`, stroke: [8, DEEP], entrance: 'flicker' }),
  hook: hook({ top: 0.07, color: SILK, size: 62, upper: true, weight: 700, letter: 3, bg: '#121212', border: `3px solid ${SILK}`, radius: 8, entrance: 'flicker' }),
  card: card({ bg: 'rgba(18,18,18,0.92)', border: `3px solid ${COPPER}`, radius: 10, shadow: `0 0 0 6px rgba(8,49,28,0.9)` }),
  title: text({ color: SILK, upper: true, weight: 700, letter: 1 }),
  body: text({ font: 'body', color: '#D9C9A5' }),
  number: text({ color: GOLD, weight: 700, glow: GOLD }),
  slam: text({ color: GOLD, upper: true, weight: 700, glow: GOLD, stroke: [6, DEEP] }),
  Marker: markerSquare([GOLD, COPPER, '#FF5A5A'], 30, 0, `3px solid ${SILK}`),
  Ring: ringBrackets(GOLD, 6),
  stage: { shape: 'square', fill: [MASK, DEEP], ring: COPPER, ringWidth: 6, glow: GOLD },
  transition: trScan({ color: GOLD, dim: 0.3, height: 8 }),
  sample: { type: 'pill', text: 'Signal received' },
});
