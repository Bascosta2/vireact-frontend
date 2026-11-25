import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trWipe } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Microgame: a rapid-fire party-game film. Every beat of the talk is a new "microgame": a one-word
 * command slams in, a fuse-style timer bar burns down, and the frame's colour scheme changes completely
 * from one game to the next.
 */

const SCHEMES = [
  { bg: '#FFD23F', fg: '#14112B', hi: '#FF3E8A' },
  { bg: '#3A86FF', fg: '#FFFFFF', hi: '#FFD23F' },
  { bg: '#06D6A0', fg: '#14112B', hi: '#FFFFFF' },
  { bg: '#FF3E8A', fg: '#FFFFFF', hi: '#14112B' },
];
const WORDS = ['WATCH!', 'LISTEN!', 'REMEMBER!', 'GO!', 'CATCH!', 'THINK!'];

function Games({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const s = SCHEMES[Math.max(0, k) % SCHEMES.length];
  const slam = d === Infinity ? 1 : spring({ frame: d, fps: c.fps, config: { damping: 10, stiffness: 260 } });
  const fuse = d === Infinity ? 1 : Math.max(0, 1 - d / 45);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 200, background: s.bg, borderBottom: `10px solid ${s.fg}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: s.bg, borderTop: `10px solid ${s.fg}` }} />
      <div style={{ position: 'absolute', left: 40, top: 60, fontFamily: c.fonts.display, fontSize: 90, color: s.fg, transform: `scale(${0.6 + 0.4 * slam}) rotate(${(1 - slam) * -8}deg)`, transformOrigin: 'left center' }}>{WORDS[Math.max(0, k) % WORDS.length]}</div>
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 60, height: 40, background: 'rgba(0,0,0,0.15)', borderRadius: 20 }}>
        <div style={{ width: `${fuse * 100}%`, height: '100%', background: s.hi, borderRadius: 20, border: `5px solid ${s.fg}`, boxSizing: 'border-box' }} />
      </div>
      <div style={{ position: 'absolute', right: 40, top: 70, fontFamily: c.fonts.display, fontSize: 50, color: s.fg }}>GAME {Math.max(0, k) + 1}</div>
    </AbsoluteFill>
  );
}

export const microgame = defineStyle({
  id: 'microgame',
  accent: '#FFD23F',
  colors: ['#3A86FF', '#FF3E8A'],
  entrance: 'pop',
  footage: 'saturate(1.2) contrast(1.06)',
  Overlay: Games,
  caption: caption({ size: 96, glyph: 0.5, color: '#FFFFFF', emph: '#FFD23F', upper: true, stroke: [12, '#14112B'], entrance: 'pop' }),
  hook: hook({ top: 0.12, color: '#14112B', size: 72, upper: true, bg: '#FFFFFF', border: '7px solid #14112B', radius: 20, boxShadow: '10px 10px 0 #14112B' }),
  card: card({ bg: '#FFFFFF', border: '7px solid #14112B', radius: 20, shadow: '10px 10px 0 #14112B' }),
  title: text({ color: '#14112B', upper: true }),
  body: text({ font: 'body', color: '#3A3560' }),
  number: text({ color: '#FFD23F', stroke: [12, '#14112B'] }),
  slam: text({ color: '#FFFFFF', upper: true, stroke: [14, '#14112B'], shadow: '0 12px 0 #FF3E8A' }),
  Marker: markerDot(['#FFD23F', '#3A86FF', '#FF3E8A'], 36, '5px solid #14112B'),
  Ring: ringCircle('#FF3E8A', 12, { under: [20, '#14112B'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#FFF1C2'], ring: '#14112B', ringWidth: 8 },
  transition: trWipe({ color: '#14112B', dir: 'down', before: 3, after: 6 }),
  sample: { type: 'pill', text: 'Round 2' },
});
