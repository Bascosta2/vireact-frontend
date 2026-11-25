import { AbsoluteFill } from 'remotion';
import { xrayFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringBrackets, text, trScan } from '../../kit/presets';
import { layer } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * X-Ray Scanner: the footage seen through a baggage-screening console. Objects are never shown, only
 * their dual-energy X-ray image (blue for dense, orange for soft, white for empty), behind a console
 * frame with a belt position, threat boxes and operator buttons.
 */

const ORANGE = '#F28C28';
const BLUE = '#2257B8';
const PANEL = '#1B1F24';

function Console({ c }: { c: Ctx }) {
  const belt = (c.frame * 6) % 120;
  return (
    <AbsoluteFill>
      {layer({ background: `repeating-linear-gradient(90deg, transparent 0 ${belt}px, rgba(0,0,0,0.04) ${belt}px ${belt + 2}px)` })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110, background: PANEL, display: 'flex', alignItems: 'center', gap: 22, padding: '0 34px', fontFamily: c.fonts.body, fontSize: 26, color: '#C8D0DA' }}>
        <span style={{ color: '#59E37A' }}>● SCAN</span>
        <span>LANE 3</span>
        <span>BELT {String(Math.floor(c.frame / 3) % 1000).padStart(3, '0')}</span>
        <span style={{ marginLeft: 'auto' }}>HI/LO</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, background: PANEL, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        {['#59E37A', ORANGE, '#E84A4A', BLUE].map((col) => (
          <div key={col} style={{ width: 120, height: 60, borderRadius: 10, background: col, boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.3)' }} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

export const xrayScanner = defineStyle({
  id: 'xray-scanner',
  accent: ORANGE,
  colors: [BLUE, '#59E37A'],
  entrance: 'step',
  footage: 'url(#xr-dual)',
  Defs: () => xrayFilter('xr-dual'),
  Overlay: Console,
  caption: caption({ size: 80, glyph: 0.58, color: '#0B1640', emph: '#C24A00', upper: true, bg: 'rgba(255,255,255,0.92)', pad: '6px 20px', boxExtra: { border: `3px solid ${BLUE}` }, entrance: 'step' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'step', color: '#fff', size: 54, upper: true, bg: '#E84A4A', pad: '10px 22px', Decor: ({ c }) => <span style={{ position: 'absolute', right: -60, top: 10, fontFamily: c.fonts.body, fontSize: 40, opacity: Math.floor(c.frame / 8) % 2 }}>⚠</span> }),
  card: card({ bg: 'rgba(255,255,255,0.94)', border: `3px solid ${BLUE}` }),
  title: text({ color: '#0B1640', upper: true }),
  body: text({ font: 'body', color: '#2A3550' }),
  number: text({ color: '#0B1640', extra: { background: 'rgba(242,140,40,0.85)', padding: '0 22px' } }),
  slam: text({ color: '#fff', upper: true, extra: { background: '#E84A4A', padding: '0 26px' } }),
  Marker: markerSquare([ORANGE, BLUE, '#59E37A'], 24),
  Ring: ringBrackets('#E84A4A', 6),
  stage: { shape: 'square', fill: ['#FFFFFF', '#F2EFE8'], ring: BLUE, ringWidth: 4 },
  transition: trScan({ color: '#59E37A', dim: 0.2, height: 8 }),
  sample: { type: 'callout', text: 'Item flagged' },
});
