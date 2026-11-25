import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text } from '../../kit/presets';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Swiss Grid: the International Typographic Style in motion. A visible modular grid, one typeface,
 * flush-left type, one signal red; captions sit on the grid, the hook is set big and tight, and cuts
 * are exact red blocks sliding along grid lines.
 */

const RED = '#E30613';
const INK = '#111111';

function Grid({ c }: { c: Ctx }) {
  const cols = 6;
  return (
    <AbsoluteFill>
      {Array.from({ length: cols + 1 }, (_, k) => (
        <div key={k} style={{ position: 'absolute', top: 0, bottom: 0, left: 60 + (k * 960) / cols, width: 1, background: 'rgba(255,255,255,0.28)' }} />
      ))}
      {[240, 1680].map((y) => (
        <div key={y} style={{ position: 'absolute', left: 0, right: 0, top: y, height: 1, background: 'rgba(255,255,255,0.28)' }} />
      ))}
      <div style={{ position: 'absolute', left: 60, top: 150, fontFamily: c.fonts.display, fontSize: 30, color: '#fff', fontWeight: 700, letterSpacing: -0.5 }}>
        No. {String(1 + (Math.floor(c.frame / 90) % 12)).padStart(2, '0')}
      </div>
      <div style={{ position: 'absolute', right: 60, top: 150, width: 46, height: 46, background: RED }} />
    </AbsoluteFill>
  );
}

const blocks: StyleTheme['transition'] = {
  before: 4,
  after: 8,
  Draw: ({ d }) => (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {[0, 1, 2].map((k) => {
        const p = interpolate(d - k, [-4, 0, 8], [-1, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return <div key={k} style={{ position: 'absolute', left: 60 + k * 320, width: 320, top: 0, bottom: 0, background: k === 1 ? RED : INK, transform: `translateY(${p * 105}%)` }} />;
      })}
    </AbsoluteFill>
  ),
};

export const swissGrid = defineStyle({
  id: 'swiss-grid',
  accent: RED,
  colors: [INK, '#FFFFFF'],
  entrance: 'glide',
  footage: 'contrast(1.1) saturate(0.85)',
  Overlay: Grid,
  caption: caption({ size: 96, glyph: 0.52, color: '#FFFFFF', emph: RED, weight: 700, letter: -2, shadow: '0 2px 16px rgba(0,0,0,0.55)', entrance: 'glide' }),
  hook: hook({ top: 0.12, align: 'left', entrance: 'glide', color: INK, size: 92, weight: 700, letter: -3, lineHeight: 0.95, bg: '#FFFFFF', pad: '18px 26px', boxExtra: { borderLeft: `18px solid ${RED}` } }),
  card: card({ bg: '#FFFFFF' }),
  title: text({ color: INK, weight: 700, letter: -1 }),
  body: text({ font: 'body', color: '#555', weight: 400 }),
  number: text({ color: '#FFFFFF', weight: 700, letter: -6, extra: { background: RED, padding: '0 24px' } }),
  slam: text({ color: '#FFFFFF', weight: 700, letter: -4, extra: { background: RED, padding: '0 24px' } }),
  Marker: markerSquare([RED, INK], 20),
  Ring: ringSquare(RED, 6),
  stage: { shape: 'square', fill: ['#FFFFFF', '#F2F2F2'], ring: RED, ringWidth: 8 },
  transition: blocks,
  sample: { type: 'headline', text: 'Less, set exactly', subtext: 'One grid. One red.' },
});
