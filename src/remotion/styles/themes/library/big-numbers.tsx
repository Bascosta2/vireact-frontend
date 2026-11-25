import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringCircle, text, trFlash } from '../../kit/presets';
import { glowSpot, grain, layer, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Big Numbers: the stat-reveal look. The picture is pushed into deep black with a glowing sun of colour
 * on one side, a fine dotted measuring grid behind, and every number counts up huge in a warm gradient
 * with a measuring line under it.
 */

const SUN = '#FFB23F';
const HOT = '#FF6A2C';

function Ambient({ c }: { c: Ctx }) {
  const breathe = 0.85 + 0.15 * Math.sin(c.frame / 30);
  return (
    <AbsoluteFill>
      {layer({ background: 'rgba(0,0,0,0.38)' })}
      {layer({ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.16) 1.4px, transparent 2px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(transparent 0%, #000 30%, #000 70%, transparent 100%)' })}
      {glowSpot('105%', '28%', HOT, '48%', 0.55 * breathe)}
      {glowSpot('105%', '28%', SUN, '26%', 0.6 * breathe)}
      {vignette(0.8)}
      {grain({ color: '#ffffff', alpha: 0.06, blend: 'screen', frame: c.frame })}
    </AbsoluteFill>
  );
}

export const bigNumbers = defineStyle({
  id: 'big-numbers',
  accent: SUN,
  colors: [HOT, '#FFFFFF'],
  entrance: 'fade',
  textScale: 1.08,
  footage: 'contrast(1.12) brightness(0.86) saturate(0.85)',
  Overlay: Ambient,
  caption: caption({ size: 86, glyph: 0.56, color: '#FFFFFF', emph: SUN, weight: 700, letter: 1, shadow: '0 4px 20px rgba(0,0,0,0.9)', entrance: 'fade' }),
  hook: hook({ top: 0.09, entrance: 'fade', color: '#FFFFFF', size: 70, weight: 700, letter: 1, upper: true, shadow: '0 6px 30px rgba(0,0,0,0.9)', Decor: ({ t }) => <div style={{ height: 4, margin: '16px auto 0', width: `${70 * t}%`, background: `linear-gradient(90deg, transparent, ${SUN}, transparent)` }} /> }),
  card: card({ bg: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.18)', radius: 18, blur: 10 }),
  title: text({ color: '#FFFFFF', weight: 700, upper: true, letter: 2 }),
  body: text({ font: 'body', color: 'rgba(255,255,255,0.72)', upper: true, letter: 3 }),
  number: text({ weight: 900, extra: { backgroundImage: `linear-gradient(180deg, #FFF3D6 0%, ${SUN} 45%, ${HOT} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 30px ${HOT}88)`, borderBottom: '3px solid rgba(255,255,255,0.35)', paddingBottom: 8 } }),
  slam: text({ color: '#FFFFFF', weight: 900, upper: true, glow: HOT }),
  Marker: markerDash(SUN, 34, 5),
  Ring: ringCircle(SUN, 4, { glow: true, dash: '3 10' }),
  stage: { shape: 'circle', fill: ['#2A1A0A', '#000000'], ring: SUN, ringWidth: 3, glow: HOT },
  transition: trFlash({ color: SUN, peak: 0.6, push: 1.1 }),
  sample: { type: 'counter', text: '109', subtext: 'Earths wide' },
});
