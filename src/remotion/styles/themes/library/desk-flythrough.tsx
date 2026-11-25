import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text, trWipe } from '../../kit/presets';
import { grain, layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Desk Flythrough: app screens lie on a sunlit wooden desk as printed paper cards, the footage is the
 * biggest card in the middle, and small voxel helpers carry work between the cards. Window light falls
 * across the desk in soft stripes.
 */

const WOOD = '#B98552';
const WOOD_D = '#8E6034';
const PAPER = '#FBFAF6';
const SKY = '#4A90E2';
const SCREEN = { x: 150, y: 520, w: 780, h: 960 };

/** A small paper card with a fake app UI. */
const paperCard = (x: number, y: number, w: number, h: number, rot: number, tint: string, key: string) => (
  <div key={key} style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: PAPER, transform: `rotate(${rot}deg)`, boxShadow: '0 14px 22px rgba(60,30,0,0.35)', padding: 14, boxSizing: 'border-box' }}>
    <div style={{ height: 18, width: '60%', background: tint, borderRadius: 4 }} />
    {[0, 1, 2, 3].map((k) => (
      <div key={k} style={{ height: 10, width: `${90 - k * 15}%`, background: '#D9DDE3', borderRadius: 5, marginTop: 12 }} />
    ))}
    <div style={{ marginTop: 14, height: h * 0.35, background: `${tint}33`, borderRadius: 8 }} />
  </div>
);

/** A tiny voxel helper carrying a block, walking along a path. */
function Helper({ c, from, to, phase }: { c: Ctx; from: [number, number]; to: [number, number]; phase: number }) {
  const t = ((c.frame + phase) % 150) / 150;
  const p = t < 0.5 ? t * 2 : 2 - t * 2;
  const x = from[0] + (to[0] - from[0]) * p;
  const y = from[1] + (to[1] - from[1]) * p - Math.abs(Math.sin(c.frame / 3)) * 6;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 44, height: 56 }}>
      <div style={{ position: 'absolute', left: 6, top: 0, width: 32, height: 26, background: '#FFD166', boxShadow: 'inset -6px -6px 0 #E0A93B' }} />
      <div style={{ position: 'absolute', left: 10, top: 26, width: 24, height: 22, background: SKY, boxShadow: 'inset -5px -5px 0 #2F6DB5' }} />
      <div style={{ position: 'absolute', left: 13, top: 8, width: 5, height: 5, background: '#222' }} />
      <div style={{ position: 'absolute', left: 26, top: 8, width: 5, height: 5, background: '#222' }} />
      {t < 0.5 && <div style={{ position: 'absolute', left: 30, top: 18, width: 22, height: 22, background: '#FF6B6B', boxShadow: 'inset -4px -4px 0 #C94A4A' }} />}
    </div>
  );
}

function Desk({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${WOOD} 0%, ${WOOD_D} 100%)` }}>
      {layer({ backgroundImage: 'repeating-linear-gradient(92deg, rgba(0,0,0,0.06) 0 3px, transparent 3px 26px)' })}
      {paperCard(40, 170, 300, 300, -6, '#2EC4B6', 'a')}
      {paperCard(720, 140, 320, 330, 5, '#FF6B6B', 'b')}
      {paperCard(30, 1520, 330, 280, 4, '#FFD166', 'c')}
      {paperCard(700, 1540, 340, 260, -5, SKY, 'd')}
      <div style={{ position: 'absolute', left: SCREEN.x - 22, top: SCREEN.y - 22, width: SCREEN.w + 44, height: SCREEN.h + 44, background: PAPER, transform: 'rotate(-1.2deg)', boxShadow: '0 26px 40px rgba(60,30,0,0.4)' }} />
      <Helper c={c} from={[260, 470]} to={[820, 470]} phase={0} />
      <Helper c={c} from={[240, 1500]} to={[860, 1500]} phase={75} />
      {/* Window light in soft stripes. */}
      {layer({ background: 'repeating-linear-gradient(120deg, rgba(255,240,200,0.0) 0 120px, rgba(255,240,200,0.16) 120px 260px)', mixBlendMode: 'screen' })}
      {grain({ color: '#3A2410', alpha: 0.2, freq: 0.7 })}
    </AbsoluteFill>
  );
}

export const deskFlythrough = defineStyle({
  id: 'desk-flythrough',
  accent: '#FF6B6B',
  colors: [SKY, '#FFD166'],
  entrance: 'bounce',
  screen: { ...SCREEN, rotate: -1.2, shape: 'rect' },
  Backdrop: Desk,
  caption: caption({ size: 88, glyph: 0.55, color: '#1F2430', emph: '#FF6B6B', weight: 700, bg: PAPER, pad: '8px 24px', radius: 12, boxExtra: { boxShadow: '0 10px 20px rgba(60,30,0,0.3)' }, entrance: 'bounce' }),
  hook: hook({ top: 0.035, color: '#1F2430', size: 58, weight: 700, bg: PAPER, rotate: -2, pad: '14px 28px', boxShadow: '0 14px 24px rgba(60,30,0,0.35)', entrance: 'bounce', boxExtra: { borderTop: '14px solid #FFD166' } }),
  card: card({ bg: PAPER, radius: 6, shadow: '0 16px 26px rgba(60,30,0,0.35)', extra: { transform: 'rotate(-1deg)' } }),
  title: text({ color: '#1F2430', weight: 700 }),
  body: text({ font: 'body', color: '#4A5060' }),
  number: text({ color: '#FF6B6B', weight: 700, stroke: [8, PAPER] }),
  slam: text({ color: '#fff', weight: 700, stroke: [12, '#1F2430'] }),
  Marker: markerSquare(['#FF6B6B', SKY, '#FFD166'], 28, 0, '3px solid #1F2430'),
  Ring: ringSquare('#FF6B6B', 7, 12),
  stage: { shape: 'square', fill: [PAPER, '#ECE8DE'], ring: '#1F2430', ringWidth: 4 },
  transition: trWipe({ color: PAPER, dir: 'left', angle: -3 }),
  sample: { type: 'pill', text: 'Step 2: invite your team' },
});
