import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trZoom } from '../../kit/presets';
import { layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Liquid Glass: the look of a modern phone UI. Captions, hooks and graphics are liquid glass: clear,
 * blurred panes with a bright rim and a soft lens edge; the hook lands like a notification banner; a
 * faint aurora gradient drifts over the corners.
 */

const GLASS = 'rgba(255,255,255,0.16)';
const RIM = 'inset 0 1.5px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.25), 0 20px 50px rgba(0,0,0,0.28)';
const BLUE = '#0A84FF';

function Aurora({ c }: { c: Ctx }) {
  const t = c.frame / 60;
  return (
    <AbsoluteFill>
      {layer({ background: `radial-gradient(circle at ${20 + 8 * Math.sin(t)}% ${10 + 5 * Math.cos(t)}%, rgba(120,90,255,0.35), transparent 40%), radial-gradient(circle at ${85 + 6 * Math.cos(t)}% ${92 + 4 * Math.sin(t)}%, rgba(0,200,255,0.3), transparent 40%)`, mixBlendMode: 'screen' })}
    </AbsoluteFill>
  );
}

const glass = { background: GLASS, backdropFilter: 'blur(22px) saturate(1.8)', WebkitBackdropFilter: 'blur(22px) saturate(1.8)', border: '1px solid rgba(255,255,255,0.35)', boxShadow: RIM };

export const liquidGlass = defineStyle({
  id: 'liquid-glass',
  accent: BLUE,
  colors: ['#BF5AF2', '#30D158'],
  entrance: 'bounce',
  footage: 'saturate(1.08) contrast(1.04)',
  Overlay: Aurora,
  caption: caption({ size: 84, glyph: 0.55, color: '#FFFFFF', emph: '#FFFFFF', emphBg: BLUE, emphColor: '#fff', weight: 700, radius: 40, pad: '10px 30px', bg: 'rgba(30,30,40,0.28)', boxExtra: { ...glass, background: 'rgba(30,30,40,0.28)' }, shadow: '0 2px 8px rgba(0,0,0,0.25)', entrance: 'bounce' }),
  hook: hook({
    top: 0.06,
    align: 'left',
    entrance: 'bounce',
    color: '#FFFFFF',
    size: 50,
    weight: 700,
    radius: 44,
    pad: '24px 34px 24px 120px',
    boxExtra: { ...glass, minWidth: 700 },
    Decor: ({ c }) => (
      <>
        <div style={{ position: 'absolute', left: 26, top: 26, width: 72, height: 72, borderRadius: 18, background: `linear-gradient(135deg, ${BLUE}, #5E5CE6)` }} />
        <div style={{ position: 'absolute', right: 30, top: 18, fontFamily: c.fonts.body, fontSize: 26, color: 'rgba(255,255,255,0.7)' }}>now</div>
      </>
    ),
  }),
  card: card({ bg: GLASS, radius: 40, shadow: RIM, blur: 22, border: '1px solid rgba(255,255,255,0.35)' }),
  title: text({ color: '#FFFFFF', weight: 700, shadow: '0 2px 10px rgba(0,0,0,0.3)' }),
  body: text({ font: 'body', color: 'rgba(255,255,255,0.86)', shadow: '0 2px 8px rgba(0,0,0,0.3)' }),
  number: text({ color: '#FFFFFF', weight: 800, shadow: '0 6px 30px rgba(0,0,0,0.35)' }),
  slam: text({ color: '#FFFFFF', weight: 800, extra: { ...glass, padding: '0 34px', borderRadius: 60 } }),
  Marker: markerDot([BLUE, '#BF5AF2', '#30D158'], 26, '3px solid rgba(255,255,255,0.8)'),
  Ring: ringCircle('rgba(255,255,255,0.95)', 6, { glow: true }),
  stage: { shape: 'circle', fill: ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.1)'], ring: 'rgba(255,255,255,0.7)', ringWidth: 3 },
  transition: trZoom({ from: 1.18, blur: 16 }),
  sample: { type: 'list', text: 'Today', items: ['Wake at 6', 'Walk 20 min', 'Deep work'] },
});
