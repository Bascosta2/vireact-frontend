import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { grain } from '../../kit/textures';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Bauhaus: told only with circles, squares, triangles, arcs and straight lines in opaque primaries on
 * matte paper. The footage sits in a big circle; the shapes around it turn and slide to new positions on
 * every beat of the talk.
 */

const PAPER = '#EFE8DA';
const RED = '#D7262E';
const BLUE = '#1E4BA0';
const YELLOW = '#F2B705';
const INK = '#1A1A1A';
const CIRCLE = { x: 140, y: 500, w: 800, h: 800 };

function Shapes({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const step = Math.max(0, k);
  const s = d === Infinity ? 1 : spring({ frame: d, fps: c.fps, config: { damping: 14, stiffness: 160 } });
  const rot = (step + s) * 90;
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <rect x={60} y={1340} width={300} height={300} fill={RED} transform={`rotate(${rot * 0.25} 210 1490)`} />
        <path d="M 720 1640 A 220 220 0 0 1 1160 1640 Z" fill={BLUE} transform={`rotate(${-rot * 0.5} 940 1640)`} />
        <polygon points="700,150 980,150 840,400" fill={YELLOW} transform={`rotate(${rot} 840 240)`} />
        <line x1={60} y1={440} x2={560} y2={440} stroke={INK} strokeWidth={14} />
        <circle cx={140} cy={260} r={70} fill={INK} />
        <path d="M 900 1360 A 120 120 0 0 0 1020 1240" stroke={INK} strokeWidth={18} fill="none" />
      </svg>
      <div style={{ position: 'absolute', left: CIRCLE.x - 24, top: CIRCLE.y - 24, width: CIRCLE.w + 48, height: CIRCLE.h + 48, borderRadius: '50%', background: INK }} />
      {grain({ color: '#7A6A50', alpha: 0.25, freq: 0.75 })}
    </AbsoluteFill>
  );
}

export const bauhaus = defineStyle({
  id: 'bauhaus',
  accent: RED,
  colors: [BLUE, YELLOW],
  entrance: 'pop',
  footage: 'saturate(0.8) contrast(1.1)',
  screen: { ...CIRCLE, shape: 'circle' },
  Backdrop: Shapes,
  caption: caption({ size: 92, glyph: 0.55, color: INK, emph: RED, weight: 700, bg: PAPER, pad: '4px 22px', entrance: 'pop' }),
  hook: hook({ top: 0.12, align: 'left', color: PAPER, size: 70, weight: 700, bg: BLUE, pad: '14px 28px' }),
  card: card({ bg: PAPER, border: `8px solid ${INK}` }),
  title: text({ color: INK, weight: 700 }),
  body: text({ font: 'body', color: '#33302A', weight: 500 }),
  number: text({ color: PAPER, weight: 700, extra: { background: RED, padding: '0 26px', borderRadius: 200 } }),
  slam: text({ color: INK, weight: 700, extra: { background: YELLOW, padding: '0 26px' } }),
  Marker: markerDot([RED, BLUE, YELLOW], 34),
  Ring: ringCircle(YELLOW, 14),
  stage: { shape: 'circle', fill: [PAPER, '#E2D8C4'], ring: INK, ringWidth: 12 },
  transition: trWipe({ color: YELLOW, dir: 'down', before: 4, after: 8, content: () => <div style={{ position: 'absolute', left: '20%', top: '30%', width: '60%', aspectRatio: '1', borderRadius: '50%', background: RED }} /> }),
  sample: { type: 'list', text: 'Form follows', items: ['Circle', 'Square', 'Triangle'] },
});
