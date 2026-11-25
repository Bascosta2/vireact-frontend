import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trIris } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';
import { HEART } from '../../../visuals/kit';

/**
 * Mascot Explainer: the footage framed like a sticker card, and a small original mascot (a round teal
 * blob, not any existing character) living in the corner. Its mouth moves with the voice, it blinks,
 * bounces on emphasis words, and shows one of eight emotions with a prop on each new caption line:
 * happy, love, idea, cool, sad, scared, furious, sleepy.
 */

const TEAL = '#2EC4B6';
const DARK = '#0F3D3A';
const CREAM = '#FFF8EC';
const MOODS = ['happy', 'idea', 'love', 'cool', 'happy', 'scared', 'sleepy', 'furious', 'sad'] as const;

function Mascot({ c }: { c: Ctx }) {
  const voice = useVoice();
  const level = voice.level(c.frame);
  const { d, k } = voice.sinceBeat(c.frame);
  const mood = k < 0 ? 'happy' : MOODS[k % MOODS.length];
  const hop = d < 12 ? spring({ frame: d, fps: c.fps, config: { damping: 9, stiffness: 200 } }) : 1;
  const bounce = voice.emphasis(c.frame) ? Math.abs(Math.sin(c.frame / 3)) * 14 : 0;
  const blink = c.frame % 96 < 4;
  const squash = 1 + 0.05 * Math.sin(c.frame / 8);
  const mouthOpen = 4 + level * 26;
  const eyeY = mood === 'sleepy' ? 2 : 0;
  return (
    <svg width={330} height={330} viewBox="-165 -200 330 330" style={{ position: 'absolute', left: 40, top: 1400, overflow: 'visible', transform: `translateY(${-bounce}px) scale(${0.6 + 0.4 * hop})`, transformOrigin: '50% 90%' }}>
      <ellipse cx={0} cy={110} rx={100} ry={18} fill="rgba(0,0,0,0.25)" />
      <g transform={`scale(${1 / squash} ${squash})`} style={{ transformOrigin: '0px 100px' }}>
        <path d="M -110 100 C -130 -40 -60 -120 0 -120 C 60 -120 130 -40 110 100 Z" fill={mood === 'furious' ? '#FF6B5B' : TEAL} stroke={DARK} strokeWidth={8} />
        <path d="M -70 60 q -40 10 -55 -20 M 70 60 q 40 10 55 -20" fill="none" stroke={DARK} strokeWidth={8} strokeLinecap="round" />
        {/* Eyes: blink, hearts for love, shades for cool, Xs never: keep it friendly. */}
        {mood === 'love' ? (
          [-40, 40].map((x) => <path key={x} d={HEART} transform={`translate(${x} -30) scale(1.6)`} fill="#FF4F79" />)
        ) : mood === 'cool' ? (
          <path d="M -80 -45 H 80 V -30 Q 70 0 30 -10 L 10 -30 H -10 L -30 -10 Q -70 0 -80 -30 Z" fill={DARK} />
        ) : (
          [-40, 40].map((x) => (blink || mood === 'sleepy' ? <path key={x} d={`M ${x - 16} ${-30 + eyeY} q 16 10 32 0`} stroke={DARK} strokeWidth={7} fill="none" strokeLinecap="round" /> : <ellipse key={x} cx={x} cy={-30} rx={13} ry={mood === 'scared' ? 20 : 17} fill={DARK} />))
        )}
        {/* Mouth: open with the voice; sad turns it down. */}
        {mood === 'sad' ? <path d="M -26 30 q 26 -22 52 0" stroke={DARK} strokeWidth={7} fill="none" strokeLinecap="round" /> : <ellipse cx={0} cy={22} rx={22} ry={mouthOpen / 2} fill={DARK} />}
        <circle cx={-72} cy={4} r={12} fill="#FF9AA8" opacity={0.7} />
        <circle cx={72} cy={4} r={12} fill="#FF9AA8" opacity={0.7} />
      </g>
      {/* The prop for the mood. */}
      {mood === 'idea' && (
        <g transform="translate(90 -150)">
          <circle r={34} fill="#FFE066" stroke={DARK} strokeWidth={6} />
          <rect x={-14} y={30} width={28} height={18} fill="#B9C0C7" stroke={DARK} strokeWidth={5} />
        </g>
      )}
      {mood === 'sad' && (
        <g transform="translate(40 -175)">
          <path d="M -70 0 a 30 30 0 0 1 40 -30 a 40 40 0 0 1 70 10 a 26 26 0 0 1 10 50 h -110 a 25 25 0 0 1 -10 -30 z" fill="#9AA5B1" stroke={DARK} strokeWidth={5} />
          {[0, 1, 2].map((j) => <line key={j} x1={-40 + j * 30} y1={40 + ((c.frame * 4 + j * 12) % 40)} x2={-46 + j * 30} y2={56 + ((c.frame * 4 + j * 12) % 40)} stroke="#4D96FF" strokeWidth={6} strokeLinecap="round" />)}
        </g>
      )}
      {mood === 'sleepy' && <text x={80} y={-120 - (c.frame % 40)} fontSize={48} fontFamily={c.fonts.display} fill={DARK} opacity={1 - (c.frame % 40) / 40}>z</text>}
      {mood === 'scared' && <path d="M 100 -110 q 10 30 0 40 q -10 -10 0 -40" fill="#7CC8FF" />}
      {mood === 'furious' && <path d="M 80 -140 l 20 -20 m -10 30 l 30 -10 m -40 -10 l 10 -30" stroke="#E5383B" strokeWidth={8} strokeLinecap="round" />}
    </svg>
  );
}

export const mascotExplainer = defineStyle({
  id: 'mascot-explainer',
  accent: TEAL,
  colors: ['#FFB703', '#FF6B8B'],
  entrance: 'bounce',
  footage: 'saturate(1.12) brightness(1.03)',
  Overlay: ({ c }) => (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, border: `26px solid ${CREAM}`, borderRadius: 70, boxShadow: `inset 0 0 0 7px ${DARK}` }} />
      <div style={{ position: 'absolute', inset: -40, border: '50px solid #000', borderRadius: 110 }} />
      <Mascot c={c} />
    </AbsoluteFill>
  ),
  caption: caption({ size: 96, glyph: 0.52, color: '#FFFFFF', emph: '#FFE066', weight: 700, stroke: [12, DARK], shadow: `0 6px 0 ${DARK}`, entrance: 'bounce' }),
  hook: hook({
    top: 0.075,
    color: DARK,
    size: 66,
    weight: 700,
    bg: CREAM,
    radius: 50,
    border: `6px solid ${DARK}`,
    pad: '18px 40px',
    entrance: 'bounce',
    Decor: () => <div style={{ position: 'absolute', left: 80, bottom: -34, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: `34px solid ${DARK}` }} />,
  }),
  card: card({ bg: CREAM, border: `6px solid ${DARK}`, radius: 36, shadow: `0 10px 0 ${DARK}` }),
  title: text({ color: DARK, weight: 700 }),
  body: text({ font: 'body', color: '#335C58', weight: 500 }),
  number: text({ color: TEAL, weight: 700, stroke: [10, DARK] }),
  slam: text({ color: '#FFE066', weight: 700, stroke: [12, DARK] }),
  Marker: markerDot([TEAL, '#FFB703', '#FF6B8B'], 40, `5px solid ${DARK}`),
  Ring: ringCircle(TEAL, 10, { under: [18, DARK] }),
  stage: { shape: 'circle', fill: [CREAM, '#E6F7F5'], ring: DARK, ringWidth: 7 },
  transition: trIris({ color: TEAL }),
  sample: { type: 'pill', text: 'Fun fact!' },
});
