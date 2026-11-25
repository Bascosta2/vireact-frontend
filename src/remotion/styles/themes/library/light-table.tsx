import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringCircle, text, trBlinds } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Light Table: archive objects on a cool backlit light table. The footage is a slide in a card mount
 * with a handwritten label; negatives with sprocket holes and other slides lie around it; a loupe ring
 * rests on the table and drifts slowly.
 */

const TABLE = '#F4F8FF';
const MOUNT = '#E9E2D0';
const SLIDE = { x: 170, y: 520, w: 740, h: 880 };

function Table({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #FFFFFF, ${TABLE} 60%, #D9E6F5)` }}>
      {/* A strip of negatives with sprocket holes. */}
      <div style={{ position: 'absolute', left: -40, top: 150, width: 1200, height: 200, background: '#2E2A26', transform: 'rotate(-6deg)', opacity: 0.9, display: 'flex', gap: 16, padding: '34px 30px', boxSizing: 'border-box' }}>
        {Array.from({ length: 6 }, (_, k) => (
          <div key={k} style={{ flex: 1, background: `linear-gradient(135deg, #C8A27A, #6B4E36)`, opacity: 0.75, filter: 'invert(1) sepia(0.4)' }} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 8, height: 14, backgroundImage: 'repeating-linear-gradient(90deg, #F4F8FF 0 14px, transparent 14px 36px)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 8, height: 14, backgroundImage: 'repeating-linear-gradient(90deg, #F4F8FF 0 14px, transparent 14px 36px)' }} />
      </div>
      {/* Other slides. */}
      {[
        [40, 1500, -8],
        [720, 1540, 7],
      ].map(([x, y, r]) => (
        <div key={x} style={{ position: 'absolute', left: x, top: y, width: 300, height: 300, background: MOUNT, transform: `rotate(${r}deg)`, boxShadow: '0 8px 16px rgba(40,60,90,0.25)', padding: 44, boxSizing: 'border-box' }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #7FA3C8, #3E5E7E)', opacity: 0.85 }} />
        </div>
      ))}
      {/* The mount of the main slide. */}
      <div style={{ position: 'absolute', left: SLIDE.x - 60, top: SLIDE.y - 60, width: SLIDE.w + 120, height: SLIDE.h + 150, background: MOUNT, boxShadow: '0 16px 30px rgba(40,60,90,0.3)' }} />
      <div style={{ position: 'absolute', left: SLIDE.x, top: SLIDE.y + SLIDE.h + 20, fontFamily: c.fonts.display, fontSize: 40, color: '#2B3A55' }}>no. 17 · summer, the lake</div>
      {grain({ color: '#5A6B85', alpha: 0.1, freq: 0.9 })}
    </AbsoluteFill>
  );
}

function Loupe({ c }: { c: Ctx }) {
  const x = 640 + Math.sin(c.frame / 80) * 160;
  const y = 860 + Math.cos(c.frame / 95) * 200;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: x - 170, top: y - 170, width: 340, height: 340, borderRadius: '50%', border: '22px solid rgba(30,34,40,0.92)', boxShadow: 'inset 0 0 0 4px rgba(255,255,255,0.4), 0 20px 40px rgba(0,0,0,0.35)', backdropFilter: 'contrast(1.15) saturate(1.2)' }} />
      {layer({ background: 'linear-gradient(180deg, rgba(220,235,255,0.12), transparent 40%)', mixBlendMode: 'screen' })}
    </AbsoluteFill>
  );
}

export const lightTable = defineStyle({
  id: 'light-table',
  accent: '#3E7CB1',
  colors: ['#2B3A55', MOUNT],
  entrance: 'fade',
  footage: 'sepia(0.25) saturate(0.9) contrast(1.05) brightness(1.06)',
  screen: { ...SLIDE, shape: 'rect' },
  Backdrop: Table,
  Overlay: Loupe,
  caption: caption({ size: 86, glyph: 0.5, color: '#1E2B42', emph: '#3E7CB1', weight: 700, bg: 'rgba(255,255,255,0.92)', pad: '6px 22px', radius: 4, entrance: 'fade' }),
  hook: hook({ top: 0.035, align: 'left', entrance: 'fade', color: '#1E2B42', size: 62, bg: '#FFFDF5', rotate: -2, pad: '12px 24px', boxShadow: '0 10px 20px rgba(40,60,90,0.3)' }),
  card: card({ bg: '#FFFDF5', radius: 2, shadow: '0 12px 24px rgba(40,60,90,0.3)' }),
  title: text({ color: '#1E2B42' }),
  body: text({ font: 'body', color: '#44506A' }),
  number: text({ color: '#3E7CB1', stroke: [6, '#fff'] }),
  slam: text({ color: '#1E2B42', extra: { background: '#FFFDF5', padding: '0 24px' } }),
  Marker: markerSquare(['#3E7CB1', '#C8A27A'], 24),
  Ring: ringCircle('#1E2B42', 16),
  stage: { shape: 'square', fill: ['#FFFFFF', TABLE], ring: MOUNT, ringWidth: 20 },
  transition: trBlinds({ color: '#FFFFFF', n: 6 }),
  sample: { type: 'pill', text: 'Found in the archive' },
});
