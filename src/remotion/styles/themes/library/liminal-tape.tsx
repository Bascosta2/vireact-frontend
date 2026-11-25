import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringBrackets, text, trGlitch } from '../../kit/presets';
import { grain, layer, scanlines, vignette } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Liminal Tape: camcorder tape recovered from empty, fluorescent-lit places. A sickly yellow grade, the
 * camcorder's REC light, a date stamp and battery icon, tracking noise rolling up the picture and a
 * colour ghost; captions in the camcorder's own block type.
 */

const YELLOW = '#E8D88A';

function Camcorder({ c }: { c: Ctx }) {
  const roll = ((c.frame * 5) % 2200) - 200;
  const glitch = noise(Math.floor(c.frame / 3), 4) > 0.93;
  return (
    <AbsoluteFill>
      {layer({ background: '#9C9A4A', mixBlendMode: 'soft-light', opacity: 0.55 })}
      {layer({ top: roll, bottom: 'auto', height: 70, background: 'linear-gradient(transparent, rgba(255,255,255,0.18), transparent)', filter: 'blur(2px)' })}
      {glitch && layer({ top: `${noise(c.frame, 8) * 90}%`, bottom: 'auto', height: 40, background: 'rgba(255,255,255,0.35)', transform: `translateX(${(noise(c.frame, 9) - 0.5) * 80}px)` })}
      {scanlines({ gap: 3, alpha: 0.2 })}
      {grain({ color: '#000', alpha: 0.3, frame: c.frame, freq: 1.3 })}
      {vignette(0.6)}
      <div style={{ position: 'absolute', left: 70, top: 130, display: 'flex', alignItems: 'center', gap: 14, fontFamily: c.fonts.display, fontSize: 44, color: '#fff', textShadow: '2px 2px 0 #000' }}>
        <span style={{ width: 26, height: 26, borderRadius: 13, background: '#FF2A2A', opacity: Math.floor(c.frame / 15) % 2 ? 1 : 0 }} />
        REC
      </div>
      <div style={{ position: 'absolute', right: 70, top: 130, width: 80, height: 36, border: '4px solid #fff', boxShadow: '2px 2px 0 #000' }}>
        <div style={{ position: 'absolute', left: 4, top: 4, bottom: 4, width: '40%', background: '#fff' }} />
      </div>
      <div style={{ position: 'absolute', left: 70, bottom: 230, fontFamily: c.fonts.display, fontSize: 42, color: '#fff', textShadow: '2px 2px 0 #000', lineHeight: 1.2 }}>
        <div>PLAY ▶</div>
        <div>MAR 03 1997</div>
        <div>{`AM 2:${String(14 + Math.floor(c.frame / 1800)).padStart(2, '0')}:${String(Math.floor(c.frame / 30) % 60).padStart(2, '0')}`}</div>
      </div>
    </AbsoluteFill>
  );
}

export const liminalTape = defineStyle({
  id: 'liminal-tape',
  accent: YELLOW,
  colors: ['#FF2A2A', '#FFFFFF'],
  entrance: 'step',
  footage: 'sepia(0.35) saturate(1.2) hue-rotate(-12deg) contrast(1.1) brightness(1.04) blur(0.8px)',
  Overlay: Camcorder,
  caption: caption({ size: 84, glyph: 0.55, color: '#FFFFFF', emph: YELLOW, upper: true, shadow: '3px 3px 0 #000, -2px 0 0 rgba(255,0,80,0.6), 2px 0 0 rgba(0,220,255,0.6)', entrance: 'step' }),
  hook: hook({ top: 0.2, align: 'left', entrance: 'step', typewriter: true, color: '#FFFFFF', size: 60, upper: true, shadow: '3px 3px 0 #000', bg: 'rgba(0,0,255,0.6)', pad: '10px 20px' }),
  card: card({ bg: 'rgba(0,0,180,0.72)', border: '3px solid #fff' }),
  title: text({ color: '#FFFFFF', upper: true, shadow: '3px 3px 0 #000' }),
  body: text({ font: 'body', color: '#E8E8E8', shadow: '2px 2px 0 #000' }),
  number: text({ color: '#FFFFFF', shadow: '4px 4px 0 #000' }),
  slam: text({ color: '#FFFFFF', upper: true, shadow: '4px 0 0 rgba(255,0,80,0.8), -4px 0 0 rgba(0,220,255,0.8)' }),
  Marker: markerSquare(['#FFFFFF'], 22),
  Ring: ringBrackets('#FFFFFF', 5),
  stage: { shape: 'square', fill: ['#2A2A1A', '#000'], ring: '#fff', ringWidth: 4 },
  transition: trGlitch({ colors: ['#FFFFFF', '#FF2A2A', '#2A6BFF'] }),
  sample: { type: 'list', text: 'RULES', items: ['Do not run', 'Count the doors', 'Never look back'] },
});
