import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trFlash } from '../../kit/presets';
import { vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Countdown: an edit style built round a known zero. A big T-minus clock counts down to the end of the
 * video in the corner, a red segment bar empties along the top, the picture tightens as zero gets near,
 * and the last seconds pulse.
 */

const RED = '#FF2D2D';
const AMBER = '#FFB020';

function Clock({ c, total }: { c: Ctx; total: number }) {
  const left = Math.max(0, total - c.frame);
  const s = Math.floor(left / c.fps);
  const cs = Math.floor(((left % c.fps) / c.fps) * 100);
  const final = s < 3;
  const pulse = final ? 0.5 + 0.5 * Math.abs(Math.sin(c.frame / 4)) : 0;
  const segs = 20;
  const lit = Math.ceil((left / Math.max(1, total)) * segs);
  return (
    <AbsoluteFill>
      {vignette(0.4 + 0.35 * (1 - left / Math.max(1, total)), final ? '#3A0000' : '#000000')}
      <div style={{ position: 'absolute', left: 40, right: 40, top: 110, display: 'flex', gap: 6 }}>
        {Array.from({ length: segs }, (_, k) => (
          <div key={k} style={{ flex: 1, height: 14, background: k < lit ? (final ? RED : AMBER) : 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', right: 44, top: 150, fontFamily: c.fonts.display, fontSize: 96, color: final ? RED : '#FFFFFF', textShadow: `0 0 ${20 + 30 * pulse}px ${final ? RED : 'rgba(0,0,0,0.8)'}`, fontVariantNumeric: 'tabular-nums', letterSpacing: 2 }}>
        T-{String(s).padStart(2, '0')}:{String(cs).padStart(2, '0')}
      </div>
    </AbsoluteFill>
  );
}

export const countdown = defineStyle({
  id: 'countdown',
  accent: AMBER,
  colors: [RED, '#FFFFFF'],
  entrance: 'pop',
  footage: 'contrast(1.12) saturate(0.95)',
  Overlay: Clock,
  drift: (f) => ({ scale: 1 + Math.min(0.06, f * 0.00012) }),
  caption: caption({ size: 92, glyph: 0.5, color: '#FFFFFF', emph: AMBER, upper: true, letter: 1, stroke: [8, '#000'], shadow: '0 6px 20px rgba(0,0,0,0.7)' }),
  hook: hook({ top: 0.17, align: 'left', color: '#000', size: 70, upper: true, bg: AMBER, pad: '12px 26px', boxShadow: `10px 10px 0 ${RED}` }),
  card: card({ bg: 'rgba(0,0,0,0.85)', border: `3px solid ${AMBER}` }),
  title: text({ color: '#FFFFFF', upper: true, letter: 1 }),
  body: text({ font: 'body', color: '#E0E0E0', weight: 600 }),
  number: text({ color: AMBER, shadow: '0 0 30px rgba(255,176,32,0.6)' }),
  slam: text({ color: RED, upper: true, letter: 2, stroke: [8, '#000'], shadow: `0 0 40px ${RED}` }),
  Marker: markerSquare([AMBER, RED], 24),
  Ring: ringCircle(RED, 7, { dash: '20 10', glow: true }),
  stage: { shape: 'square', fill: ['#2A1A00', '#000'], ring: AMBER, ringWidth: 5 },
  transition: trFlash({ color: RED, peak: 0.55, push: 1.12 }),
  sample: { type: 'counter', text: '3', subtext: 'seconds to launch' },
});
