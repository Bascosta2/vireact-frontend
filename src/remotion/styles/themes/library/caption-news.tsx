import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trWipe } from '../../kit/presets';
import { layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Caption News: social-video news that reads with the sound off. Huge captions are the lead actor,
 * slammed on in black and yellow boxes, a source tag in the corner and a slim progress strip; the
 * footage is the ground under them.
 */

const YELLOW = '#FFE100';
const BLACK = '#0A0A0A';

function Chrome({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {layer({ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), transparent 22%, transparent 70%, rgba(0,0,0,0.45))' })}
      <div style={{ position: 'absolute', left: 50, top: 130, display: 'flex', gap: 10, fontFamily: c.fonts.body, fontSize: 28, fontWeight: 700 }}>
        <span style={{ background: YELLOW, color: BLACK, padding: '4px 12px' }}>NEWS</span>
        <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', padding: '4px 12px' }}>Source: local reports</span>
      </div>
    </AbsoluteFill>
  );
}

export const captionNews = defineStyle({
  id: 'caption-news',
  accent: YELLOW,
  colors: [BLACK, '#FFFFFF'],
  entrance: 'pop',
  textScale: 1.05,
  footage: 'contrast(1.08) saturate(0.9)',
  Overlay: Chrome,
  caption: caption({ size: 118, glyph: 0.5, color: '#FFFFFF', emphBg: YELLOW, emphColor: BLACK, weight: 900, upper: true, letter: -1, bg: BLACK, pad: '6px 24px', entrance: 'pop' }),
  hook: hook({ top: 0.2, color: BLACK, size: 86, weight: 900, upper: true, letter: -1, bg: YELLOW, pad: '10px 26px', boxShadow: `14px 14px 0 ${BLACK}` }),
  card: card({ bg: BLACK }),
  title: text({ color: '#FFFFFF', weight: 900, upper: true }),
  body: text({ font: 'body', color: YELLOW, weight: 700 }),
  number: text({ color: BLACK, weight: 900, extra: { background: YELLOW, padding: '0 28px' } }),
  slam: text({ color: BLACK, weight: 900, upper: true, extra: { background: YELLOW, padding: '0 28px' } }),
  Marker: markerSquare([YELLOW], 26),
  Ring: ringCircle(YELLOW, 10, { under: [18, BLACK] }),
  stage: { shape: 'square', fill: ['#1A1A1A', BLACK], ring: YELLOW, ringWidth: 8 },
  transition: trWipe({ color: YELLOW, dir: 'right', before: 3, after: 6 }),
  sample: { type: 'counter', text: '72%', subtext: 'of voters say yes' },
});
