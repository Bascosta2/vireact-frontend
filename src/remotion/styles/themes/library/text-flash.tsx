import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { layer } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Text Flash: avant-garde TV anime in the "text frame" manner. On every emphasis word a full-screen
 * title card in heavy serif cuts in for a few frames (black on white or white on red), the footage gets
 * a hard red grade at those moments, and cuts are white-out flashes.
 */

const RED = '#E10600';
const CARDS = ['NOW', 'LOOK', 'STAY', 'WHY', 'RUN', 'BEGIN'];

function Flashes({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  // A card flashes for 4 frames at the start of every other caption line.
  const on = k >= 0 && k % 2 === 0 && d < 4;
  if (!on) return layer({ background: 'linear-gradient(transparent 70%, rgba(0,0,0,0.4))' });
  const red = k % 4 === 0;
  return (
    <AbsoluteFill style={{ background: red ? RED : '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: c.fonts.display, fontSize: 300, color: red ? '#FFFFFF' : '#000', letterSpacing: -8 }}>{CARDS[Math.floor(k / 2) % CARDS.length]}</div>
    </AbsoluteFill>
  );
}

const whiteout: StyleTheme['transition'] = {
  before: 1,
  after: 5,
  Draw: ({ d }) => <AbsoluteFill style={{ background: '#fff', opacity: d < 0 ? 0.5 : 1 - d / 5 }} />,
};

export const textFlash = defineStyle({
  id: 'text-flash',
  accent: RED,
  colors: ['#FFFFFF', '#000000'],
  entrance: 'step',
  footage: 'contrast(1.25) saturate(0.6) brightness(0.95)',
  Overlay: ({ c }: { c: Ctx }) => <Flashes c={c} />,
  caption: caption({ size: 100, glyph: 0.55, color: '#FFFFFF', emph: RED, letter: -2, shadow: '0 0 2px #000, 0 6px 18px rgba(0,0,0,0.8)', entrance: 'step' }),
  hook: hook({ top: 0.12, entrance: 'step', color: '#000', size: 110, letter: -4, bg: '#FFFFFF', pad: '10px 30px', lineHeight: 1 }),
  card: card({ bg: '#FFFFFF' }),
  title: text({ color: '#000', letter: -2 }),
  body: text({ font: 'body', color: RED }),
  number: text({ color: '#FFFFFF', letter: -6, extra: { background: RED, padding: '0 26px' } }),
  slam: text({ color: '#000', letter: -4, extra: { background: '#FFFFFF', padding: '0 30px' } }),
  Marker: markerSquare([RED, '#000'], 22),
  Ring: ringCircle(RED, 10),
  stage: { shape: 'square', fill: ['#FFFFFF', '#EEEEEE'], ring: RED, ringWidth: 8 },
  transition: whiteout,
  sample: { type: 'slam', text: 'NOW' },
});
