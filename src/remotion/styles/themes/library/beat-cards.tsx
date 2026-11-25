import { AbsoluteFill, spring } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trShutter } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Beat Cards: the beat-cut title-card grammar (from the librosa beat counter and kinetic-text pieces).
 * On every beat of the talk the band at the top cuts to a new bold card (a counting number, a bullseye,
 * a striped banner, a ring of dots) in alternating black, yellow, cream and red-orange, and a waveform
 * strip with beat markers runs along the bottom.
 */

const SETS = [
  { bg: '#0E0E0E', fg: '#FFD60A' },
  { bg: '#FFD60A', fg: '#0E0E0E' },
  { bg: '#F4EBDD', fg: '#E8461E' },
  { bg: '#E8461E', fg: '#F4EBDD' },
];

function Card({ c, k, d }: { c: Ctx; k: number; d: number }) {
  const s = SETS[k % SETS.length];
  const pop = spring({ frame: d, fps: c.fps, config: { damping: 12, stiffness: 300 } });
  const kind = k % 4;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: s.bg, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {kind === 0 && <div style={{ fontFamily: c.fonts.display, fontSize: 380, color: s.fg, lineHeight: 1, transform: `scale(${0.7 + 0.3 * pop})` }}>{k + 1}</div>}
      {kind === 1 && (
        <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ transform: `scale(${pop})` }}>
          {[200, 150, 100, 50].map((r, j) => <circle key={r} r={r} fill={j % 2 ? s.bg : s.fg} />)}
        </svg>
      )}
      {kind === 2 && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(-30deg, ${s.fg} 0 50px, transparent 50px 100px)`, transform: `translateX(${(1 - pop) * -200}px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ background: s.bg, color: s.fg, fontFamily: c.fonts.display, fontSize: 110, padding: '0 30px' }}>ON THE BEAT</span>
        </div>
      )}
      {kind === 3 && (
        <svg width={460} height={460} viewBox="-230 -230 460 460" style={{ transform: `rotate(${pop * 90}deg)` }}>
          {Array.from({ length: 16 }, (_, j) => <circle key={j} cx={Math.cos((j / 16) * Math.PI * 2) * 180} cy={Math.sin((j / 16) * Math.PI * 2) * 180} r={22 * pop} fill={s.fg} />)}
        </svg>
      )}
    </div>
  );
}

function Beats({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d, k } = voice.sinceBeat(c.frame);
  const bars = voice.bars(c.frame, 40);
  return (
    <AbsoluteFill>
      {k >= 0 ? <Card c={c} k={k} d={d} /> : <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 560, background: SETS[0].bg }} />}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 200, background: '#0E0E0E', display: 'flex', alignItems: 'center', gap: 6, padding: '0 30px' }}>
        {bars.map((b, j) => <div key={j} style={{ flex: 1, height: `${10 + b * 80}%`, background: j % 8 === 0 ? '#E8461E' : '#FFD60A' }} />)}
      </div>
      <div style={{ position: 'absolute', left: 30, bottom: 206, fontFamily: c.fonts.body, fontSize: 26, color: '#FFD60A', background: '#0E0E0E', padding: '2px 10px' }}>BEAT {Math.max(0, k + 1)}</div>
    </AbsoluteFill>
  );
}

export const beatCards = defineStyle({
  id: 'beat-cards',
  accent: '#FFD60A',
  colors: ['#E8461E', '#F4EBDD'],
  entrance: 'pop',
  footage: 'contrast(1.1) saturate(1.05)',
  Overlay: Beats,
  caption: caption({ size: 100, glyph: 0.5, color: '#0E0E0E', emph: '#E8461E', upper: true, bg: '#FFD60A', pad: '4px 26px', entrance: 'pop' }),
  hook: hook({ top: 0.31, color: '#F4EBDD', size: 70, upper: true, bg: '#0E0E0E', pad: '10px 26px' }),
  card: card({ bg: '#F4EBDD', border: '6px solid #0E0E0E' }),
  title: text({ color: '#0E0E0E', upper: true }),
  body: text({ font: 'body', color: '#3A3A3A' }),
  number: text({ color: '#E8461E', stroke: [8, '#0E0E0E'] }),
  slam: text({ color: '#FFD60A', upper: true, stroke: [10, '#0E0E0E'] }),
  Marker: markerDot(['#FFD60A', '#E8461E', '#0E0E0E'], 30),
  Ring: ringCircle('#FFD60A', 12, { under: [20, '#0E0E0E'] }),
  stage: { shape: 'circle', fill: ['#F4EBDD', '#E6DCCB'], ring: '#0E0E0E', ringWidth: 10 },
  transition: trShutter({ color: '#0E0E0E', before: 2, after: 4 }),
  sample: { type: 'pill', text: 'Drop 2' },
});
