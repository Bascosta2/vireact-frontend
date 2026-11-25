import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { card, hook, markerSquare, ringCircle, text, trZoom } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Kinetic Type: lyric-video typography. Every caption word lands on its own the moment it is said,
 * stacked big and tight in a heavy condensed face, the colour field behind the type swaps on every beat
 * (navy, cream, yellow, coral), and the footage plays in a darker band so the words carry the frame.
 */

const FIELDS = ['#13294B', '#F4EBDD', '#FFD23F', '#FF6F61'];
const INKS = ['#F4EBDD', '#13294B', '#13294B', '#13294B'];

function Field({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { k } = voice.sinceBeat(c.frame);
  const i = Math.max(0, k) % FIELDS.length;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 360, background: FIELDS[i] }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: FIELDS[(i + 1) % FIELDS.length] }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, bottom: 320, background: 'rgba(0,0,0,0.28)' }} />
      <div style={{ position: 'absolute', left: 60, top: 130, fontFamily: c.fonts.display, fontSize: 90, color: INKS[i], letterSpacing: -2, lineHeight: 0.9 }}>{String(Math.max(0, k) + 1).padStart(2, '0')}</div>
    </AbsoluteFill>
  );
}

export const kineticType = defineStyle({
  id: 'kinetic-type',
  accent: '#FFD23F',
  colors: ['#FF6F61', '#F4EBDD'],
  entrance: 'pop',
  footage: 'contrast(1.1) saturate(0.9)',
  Overlay: Field,
  caption: {
    size: 170,
    glyph: 0.42,
    entrance: 'pop',
    stagger: true,
    box: (c) => ({ fontFamily: c.fonts.display, textTransform: 'uppercase', letterSpacing: -3, lineHeight: 0.92, whiteSpace: 'normal', width: 960, textAlign: 'center' }),
    word: (emphasis) => ({ color: emphasis ? '#FFD23F' : '#FFFFFF', textShadow: '0 8px 30px rgba(0,0,0,0.5)', display: 'block' }),
  },
  hook: hook({ top: 0.21, size: 110, upper: true, letter: -3, lineHeight: 0.92, color: '#FFFFFF', shadow: '0 8px 30px rgba(0,0,0,0.5)' }),
  card: card({ bg: '#F4EBDD' }),
  title: text({ color: '#13294B', upper: true, letter: -1 }),
  body: text({ font: 'body', color: '#3A3A4A' }),
  number: text({ color: '#FFD23F', letter: -6, shadow: '0 10px 30px rgba(0,0,0,0.5)' }),
  slam: text({ color: '#FFFFFF', upper: true, letter: -4, shadow: '0 10px 30px rgba(0,0,0,0.5)' }),
  Marker: markerSquare(['#FFD23F', '#FF6F61'], 24),
  Ring: ringCircle('#FFD23F', 10),
  stage: { shape: 'square', fill: ['#F4EBDD', '#E6DCCB'], ring: '#13294B', ringWidth: 8 },
  transition: trZoom({ from: 1.5, blur: 20 }),
  sample: { type: 'counter', text: '1,000,000', subtext: 'plays and counting' },
});
