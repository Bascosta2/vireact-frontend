import { AbsoluteFill } from 'remotion';
import { rampFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trWipe } from '../../kit/presets';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Spy Titles: a cut-paper, four-ink opening title sequence for a film that never existed. The footage
 * is printed in two flat inks, jagged paper shapes and bars slide across like credits being built, and a
 * keyhole and a silhouette walk through it; jazzy, angular, confident.
 */

const ORANGE = '#F25C05';
const INK = '#111111';
const CREAM = '#F2E3C6';
const TEAL = '#1C6E7D';

function CutPaper({ c }: { c: Ctx }) {
  const t = c.frame / 30;
  const bar = (y: number, w: number, col: string, speed: number, key: string) => <rect key={key} x={((t * speed * 300) % 1600) - 500} y={y} width={w} height={44} fill={col} />;
  const walker = ((c.frame * 3) % 1400) - 200;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {bar(250, 420, ORANGE, 1, 'a')}
        {bar(310, 260, INK, 1.4, 'b')}
        {bar(1560, 500, TEAL, 0.8, 'c')}
        {bar(1620, 300, ORANGE, 1.2, 'd')}
        <polygon points="0,1720 260,1660 380,1920 0,1920" fill={INK} />
        <polygon points="1080,120 820,190 1080,330" fill={INK} />
        {/* A silhouette walking along the bottom bar. */}
        <g transform={`translate(${walker} 1490)`} fill={INK}>
          <circle cx={0} cy={0} r={22} />
          <path d="M -26 -20 h 52 l -6 -20 h -40 z" />
          <path d={`M -20 22 h 40 l 8 90 h -56 z M -14 112 l ${Math.sin(c.frame / 4) * 16} 60 h 10 l 6 -60 M 6 112 l ${-Math.sin(c.frame / 4) * 16} 60 h 10 l -2 -60`} />
        </g>
        {/* Keyhole. */}
        <g transform="translate(940 420)" fill={ORANGE}>
          <circle r={46} />
          <polygon points="-26,20 26,20 40,120 -40,120" />
        </g>
      </svg>
      {grain({ color: '#3A2A10', alpha: 0.3, freq: 0.7 })}
    </AbsoluteFill>
  );
}

export const spyTitles = defineStyle({
  id: 'spy-titles',
  accent: ORANGE,
  colors: [TEAL, CREAM],
  entrance: 'glide',
  footage: 'url(#spy-ink)',
  Defs: () => rampFilter('spy-ink', [INK, INK, TEAL, CREAM, CREAM], { contrast: 1.5, discrete: true }),
  Overlay: CutPaper,
  caption: caption({ size: 96, glyph: 0.46, color: CREAM, emph: ORANGE, upper: true, letter: 2, bg: INK, pad: '4px 24px', boxExtra: { transform: 'rotate(-3deg)' }, entrance: 'glide' }),
  hook: hook({ top: 0.21, align: 'left', color: INK, size: 84, upper: true, letter: 2, bg: ORANGE, pad: '8px 26px', rotate: -4, entrance: 'glide' }),
  card: card({ bg: CREAM, border: `8px solid ${INK}`, extra: { clipPath: 'polygon(0 4%, 100% 0, 98% 100%, 2% 96%)' } }),
  title: text({ color: INK, upper: true, letter: 2 }),
  body: text({ font: 'body', color: TEAL, upper: true, letter: 2 }),
  number: text({ color: ORANGE, shadow: `8px 8px 0 ${INK}` }),
  slam: text({ color: CREAM, upper: true, letter: 4, extra: { background: INK, padding: '0 30px', transform: 'rotate(-5deg)' } }),
  Marker: markerSquare([ORANGE, TEAL, INK], 28, 12),
  Ring: ringCircle(ORANGE, 12),
  stage: { shape: 'circle', fill: [CREAM, '#E3CFA8'], ring: INK, ringWidth: 10 },
  transition: trWipe({ color: ORANGE, dir: 'right', angle: -18, before: 4, after: 8, content: () => <div style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: '18%', background: INK }} /> }),
  sample: { type: 'headline', text: 'Agent of nothing', subtext: 'Starring you' },
});

