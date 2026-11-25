import { AbsoluteFill, spring } from 'remotion';
import { thresholdFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trFlash } from '../../kit/presets';
import { useVoice } from '../../pulse';
import type { Ctx } from '../../theme';

/**
 * Sunset Silhouette: pure black silhouettes against a saturated sunset. The footage is cut to two inks
 * (black and white) and the white is replaced by a sky gradient that slowly turns, with a big sun that
 * pulses on every beat of the talk; the black stays a flat silhouette.
 */

const SKY = ['#2B1055', '#D53A9D', '#FF7E5F', '#FEB47B'];

function Sky({ c }: { c: Ctx }) {
  const voice = useVoice();
  const { d } = voice.sinceBeat(c.frame);
  const pulse = d === Infinity ? 0 : 1 - spring({ frame: d, fps: c.fps, config: { damping: 12, stiffness: 160 } });
  const turn = Math.sin(c.frame / 200) * 10;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'multiply' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${180 + turn}deg, ${SKY.join(', ')})` }} />
      <div style={{ position: 'absolute', left: '50%', top: '58%', width: 420, height: 420, marginLeft: -210, marginTop: -210, borderRadius: '50%', background: 'radial-gradient(circle, #FFF2C2, #FFB347 60%, transparent 70%)', transform: `scale(${1 + 0.08 * pulse})` }} />
    </AbsoluteFill>
  );
}

export const sunsetSilhouette = defineStyle({
  id: 'sunset-silhouette',
  accent: '#FEB47B',
  colors: ['#D53A9D', '#2B1055'],
  entrance: 'fade',
  footage: 'url(#ss-cut)',
  Defs: () => thresholdFilter('ss-cut', '#050308', '#FFFFFF', 0.4, 0.05),
  Overlay: Sky,
  caption: caption({ size: 90, glyph: 0.5, color: '#FFF2E0', emph: '#FEB47B', weight: 700, letter: 2, upper: true, shadow: '0 4px 18px rgba(43,16,85,0.8)', entrance: 'fade' }),
  hook: hook({ top: 0.1, entrance: 'fade', color: '#FFF2E0', size: 78, weight: 700, letter: 4, upper: true, shadow: '0 6px 24px rgba(43,16,85,0.8)' }),
  card: card({ bg: 'rgba(43,16,85,0.78)', border: '1px solid rgba(254,180,123,0.6)', radius: 18 }),
  title: text({ color: '#FFF2E0', weight: 700, upper: true, letter: 2 }),
  body: text({ font: 'body', color: '#FFD9C2' }),
  number: text({ color: '#FEB47B', weight: 700, shadow: '0 6px 24px rgba(43,16,85,0.8)' }),
  slam: text({ color: '#FFF2E0', weight: 700, upper: true, letter: 6, shadow: '0 8px 30px rgba(43,16,85,0.9)' }),
  Marker: markerDot(['#FEB47B', '#D53A9D'], 24),
  Ring: ringCircle('#FEB47B', 6),
  stage: { shape: 'circle', fill: ['#FF7E5F', '#2B1055'], ring: '#FEB47B', ringWidth: 4 },
  transition: trFlash({ color: '#FEB47B', peak: 0.7 }),
  sample: { type: 'headline', text: 'Golden hour, every day', subtext: '' },
});
