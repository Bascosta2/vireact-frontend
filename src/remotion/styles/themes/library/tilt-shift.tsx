import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trZoom } from '../../kit/presets';
import { layer, vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Tilt-Shift: a real place made to look like a tabletop model. The top and bottom of the footage fall
 * into a strong lens blur with a sharp band across the middle, colours are pushed bright and toy-like,
 * and graphics are clean little labels like a model railway's signs.
 */

function Lens({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      {layer({ backdropFilter: 'blur(9px)', WebkitBackdropFilter: 'blur(9px)', maskImage: 'linear-gradient(#000 0%, rgba(0,0,0,0.6) 22%, transparent 36%, transparent 64%, rgba(0,0,0,0.6) 78%, #000 100%)', WebkitMaskImage: 'linear-gradient(#000 0%, rgba(0,0,0,0.6) 22%, transparent 36%, transparent 64%, rgba(0,0,0,0.6) 78%, #000 100%)' })}
      {vignette(0.35)}
      <div style={{ position: 'absolute', right: 50, top: 130, fontFamily: c.fonts.body, fontSize: 26, color: '#fff', background: 'rgba(0,0,0,0.35)', padding: '4px 12px', borderRadius: 20 }}>1 : 87 scale</div>
    </AbsoluteFill>
  );
}

export const tiltShift = defineStyle({
  id: 'tilt-shift',
  accent: '#FF5D73',
  colors: ['#3EC1D3', '#FFD166'],
  entrance: 'bounce',
  footage: 'saturate(1.55) contrast(1.15) brightness(1.06)',
  Overlay: Lens,
  caption: caption({ size: 86, glyph: 0.55, color: '#1F2A36', emph: '#FF5D73', weight: 700, bg: '#FFFFFF', pad: '6px 24px', radius: 12, boxExtra: { boxShadow: '0 6px 0 #C9D2DC' }, entrance: 'bounce' }),
  hook: hook({ top: 0.1, entrance: 'bounce', color: '#1F2A36', size: 64, weight: 700, bg: '#FFFFFF', radius: 12, boxShadow: '0 8px 0 #C9D2DC, 0 16px 24px rgba(0,0,0,0.2)' }),
  card: card({ bg: '#FFFFFF', radius: 12, shadow: '0 8px 0 #C9D2DC, 0 18px 28px rgba(0,0,0,0.25)' }),
  title: text({ color: '#1F2A36', weight: 700 }),
  body: text({ font: 'body', color: '#4A5A6A' }),
  number: text({ color: '#FF5D73', weight: 700, stroke: [8, '#fff'] }),
  slam: text({ color: '#FFFFFF', weight: 700, stroke: [10, '#1F2A36'] }),
  Marker: markerDot(['#FF5D73', '#3EC1D3', '#FFD166'], 30, '4px solid #fff'),
  Ring: ringCircle('#FF5D73', 8, { under: [14, '#fff'] }),
  stage: { shape: 'circle', fill: ['#FFFFFF', '#EEF2F6'], ring: '#1F2A36', ringWidth: 5 },
  transition: trZoom({ from: 1.25, blur: 12 }),
  sample: { type: 'pill', text: 'Tiny city, big day' },
});
