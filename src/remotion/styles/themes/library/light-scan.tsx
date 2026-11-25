import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Light Scan: the world is black until a scan passes. A plane of light sweeps across the footage; what
 * it touches lights up, then settles into a dim afterglow until the next sweep. Each cut starts a new
 * sweep from black.
 */

const SCAN = '#9FE8FF';
const PERIOD = 150;

/** How far the sweep has gone (0 top, 1 bottom) at a frame. */
const sweepAt = (frame: number) => (frame % PERIOD) / 55;

function Dark({ c }: { c: Ctx }) {
  const p = sweepAt(c.frame);
  const y = p * 100;
  // Behind the line: lit, fading to a dim afterglow; ahead of it: near black.
  const mask = p >= 1 ? 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35))' : `linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.05) ${Math.max(0, y - 6)}%, rgba(0,0,0,0) ${y}%, rgba(0,0,0,0.94) ${y + 2}%, rgba(0,0,0,0.94) 100%)`;
  return (
    <AbsoluteFill>
      {layer({ background: mask })}
      {p < 1 && (
        <>
          {layer({ top: `${y - 0.4}%`, bottom: 'auto', height: 6, background: SCAN, boxShadow: `0 0 40px 14px ${SCAN}88` })}
          {layer({ top: `${y - 8}%`, bottom: 'auto', height: '8%', background: `linear-gradient(transparent, ${SCAN}33)` })}
        </>
      )}
      {grain({ color: '#ffffff', alpha: 0.06, blend: 'screen', frame: c.frame })}
    </AbsoluteFill>
  );
}

/** A cut falls to black and the next sweep begins. */
const blackout: StyleTheme['transition'] = {
  before: 4,
  after: 6,
  Draw: ({ d }) => <AbsoluteFill style={{ background: '#000', opacity: d < 0 ? interpolate(d, [-4, 0], [0, 1]) : interpolate(d, [0, 6], [1, 0], { extrapolateRight: 'clamp' }) }} />,
};

export const lightScan = defineStyle({
  id: 'light-scan',
  accent: SCAN,
  colors: ['#FFFFFF', '#4C6A7A'],
  entrance: 'fade',
  footage: 'contrast(1.15) saturate(0.75) brightness(1.05)',
  Overlay: Dark,
  caption: caption({ size: 84, glyph: 0.55, color: '#FFFFFF', emph: SCAN, weight: 500, letter: 2, upper: true, glow: SCAN, shadow: '0 0 20px #000', entrance: 'fade' }),
  hook: hook({ top: 0.1, entrance: 'fade', color: '#FFFFFF', size: 66, weight: 500, upper: true, letter: 6, shadow: `0 0 30px ${SCAN}` }),
  card: card({ bg: 'rgba(0,0,0,0.78)', border: `1px solid ${SCAN}55`, radius: 2 }),
  title: text({ color: '#FFFFFF', weight: 500, upper: true, letter: 3 }),
  body: text({ font: 'body', color: '#A9C3CF' }),
  number: text({ color: SCAN, weight: 500, glow: SCAN }),
  slam: text({ color: '#FFFFFF', weight: 600, upper: true, letter: 8, glow: SCAN }),
  Marker: markerDash(SCAN, 34, 3),
  Ring: ringCircle(SCAN, 3, { glow: true }),
  stage: { shape: 'circle', fill: ['#12202A', '#000000'], ring: SCAN, ringWidth: 2, glow: SCAN },
  transition: blackout,
  sample: { type: 'headline', text: 'What the scan found', subtext: 'Chamber 3, 40 m down' },
});
