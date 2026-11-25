import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trBurn } from '../../kit/presets';
import { grain, layer, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Light Leak: a warm cinematic vlog. Organic light leaks drift across the frame in orange and pink,
 * soft film grain and a gentle vignette, a warm grade, and every cut burns through white like a roll of
 * film (HyperFrames organic-light-leak-overlay and flash-through-white).
 */

function Leaks({ c }: { c: Ctx }) {
  const t = c.frame / 90;
  return (
    <AbsoluteFill>
      {layer({ background: `radial-gradient(ellipse at ${-10 + 30 * (Math.sin(t) + 1)}% ${20 + 10 * Math.cos(t * 0.7)}%, rgba(255,140,60,0.55), transparent 40%)`, mixBlendMode: 'screen' })}
      {layer({ background: `radial-gradient(ellipse at ${110 - 25 * (Math.cos(t * 0.8) + 1)}% ${75 + 10 * Math.sin(t)}%, rgba(255,80,120,0.4), transparent 38%)`, mixBlendMode: 'screen' })}
      {vignette(0.45, '#2A1208')}
      {grain({ color: '#000', alpha: 0.22, frame: c.frame })}
    </AbsoluteFill>
  );
}

export const lightLeak = defineStyle({
  id: 'light-leak',
  accent: '#FFB070',
  colors: ['#FF5A78', '#FFE3C2'],
  entrance: 'fade',
  footage: 'sepia(0.18) saturate(1.15) contrast(1.05) brightness(1.03)',
  Overlay: Leaks,
  caption: caption({ size: 86, glyph: 0.5, color: '#FFF6EC', emph: '#FFB070', weight: 500, shadow: '0 2px 14px rgba(60,20,0,0.65)', entrance: 'fade' }),
  hook: hook({ top: 0.1, entrance: 'fade', color: '#FFF6EC', size: 76, weight: 500, italic: true, shadow: '0 4px 20px rgba(60,20,0,0.7)' }),
  card: card({ bg: 'rgba(40,18,8,0.6)', radius: 26, blur: 10, border: '1px solid rgba(255,227,194,0.35)' }),
  title: text({ color: '#FFF6EC', weight: 500 }),
  body: text({ font: 'body', color: '#FFE3C2' }),
  number: text({ color: '#FFB070', weight: 500, shadow: '0 4px 20px rgba(60,20,0,0.6)' }),
  slam: text({ color: '#FFF6EC', weight: 600, italic: true, shadow: '0 6px 26px rgba(255,120,60,0.8)' }),
  Marker: markerDot(['#FFB070', '#FF5A78'], 20),
  Ring: ringCircle('#FFE3C2', 4),
  stage: { shape: 'circle', fill: ['#FFE3C2', '#E8A070'], ring: '#FFF6EC', ringWidth: 4 },
  transition: trBurn(),
  sample: { type: 'headline', text: 'Sunday in the city', subtext: 'slow mornings' },
});
