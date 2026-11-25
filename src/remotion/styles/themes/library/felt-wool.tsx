import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import { roughFilter } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Felt & Wool: cosy craft. A knitted wool frame (stitch rows) round the footage, felt-cut shapes with
 * blanket stitches for graphics, fuzzy yarn letters with a soft halo of fibres, and a ring of soft hairs
 * that sways (the "fur" style of the prompt list).
 */

const RED = '#C8453A';
const CREAM = '#F6EAD4';
const MUSTARD = '#E2A93B';
const TEAL = '#3F8F8A';

function Knit({ c }: { c: Ctx }) {
  const sway = Math.sin(c.frame / 20) * 4;
  return (
    <AbsoluteFill>
      {/* The knitted frame: rows of V stitches. */}
      {layer({ border: '54px solid transparent', borderImage: `repeating-linear-gradient(90deg, ${RED} 0 14px, #A9342B 14px 18px, ${RED} 18px 32px) 54`, filter: 'url(#fw-fuzz)' })}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>{roughFilter('fw-fuzz', { scale: 4, freq: 0.5, seed: 3 })}</defs>
      </svg>
      {/* A tuft of soft cream hairs swaying in the bottom corner. */}
      <svg width={300} height={220} style={{ position: 'absolute', right: 70, bottom: 200 }}>
        {Array.from({ length: 40 }, (_, k) => {
          const x = 30 + k * 6;
          return <path key={k} d={`M ${x} 210 Q ${x + sway * (1 + (k % 3))} 120 ${x + sway * 2 + (k % 5) * 3} ${40 + (k % 7) * 10}`} stroke={k % 4 ? CREAM : '#E8D4B0'} strokeWidth={4} fill="none" strokeLinecap="round" />;
        })}
      </svg>
      {grain({ color: '#5A3A20', alpha: 0.15, freq: 0.6 })}
    </AbsoluteFill>
  );
}

/** Fuzzy yarn text: a soft halo of fibres. */
const yarn = (col: string) => ({ color: col, textShadow: `0 0 2px ${col}, 0 0 6px ${col}88, 2px 2px 0 rgba(0,0,0,0.25)` });

export const feltWool = defineStyle({
  id: 'felt-wool',
  accent: MUSTARD,
  colors: [RED, TEAL],
  entrance: 'bounce',
  footage: 'saturate(1.05) contrast(1.02) sepia(0.08)',
  Overlay: Knit,
  caption: caption({ size: 94, glyph: 0.5, color: CREAM, emph: MUSTARD, stroke: [10, '#6A2A20'], shadow: '0 0 6px #6A2A20, 0 6px 0 #6A2A20', entrance: 'bounce' }),
  hook: hook({ top: 0.09, entrance: 'bounce', color: '#4A2A20', size: 72, bg: CREAM, radius: 30, pad: '16px 36px', boxExtra: { outline: `4px dashed ${RED}`, outlineOffset: -14, boxShadow: '0 10px 18px rgba(60,30,10,0.3)' } }),
  card: card({ bg: CREAM, radius: 30, shadow: '0 10px 18px rgba(60,30,10,0.3)', extra: { outline: `4px dashed ${TEAL}`, outlineOffset: -14 } }),
  title: (c: Ctx) => ({ fontFamily: c.fonts.display, ...yarn('#4A2A20') }),
  body: text({ font: 'body', color: '#6A4A3A' }),
  number: (c: Ctx) => ({ fontFamily: c.fonts.display, ...yarn(RED) }),
  slam: (c: Ctx) => ({ fontFamily: c.fonts.display, ...yarn(MUSTARD), WebkitTextStroke: '8px #6A2A20', paintOrder: 'stroke fill' }),
  Marker: markerDot([RED, MUSTARD, TEAL], 36, `4px dashed ${CREAM}`),
  Ring: ringCircle(MUSTARD, 10, { dash: '14 8' }),
  stage: { shape: 'circle', fill: [CREAM, '#EAD9B8'], ring: RED, ringWidth: 10 },
  transition: trIris({ color: RED }),
  sample: { type: 'pill', text: 'Made by hand' },
});
