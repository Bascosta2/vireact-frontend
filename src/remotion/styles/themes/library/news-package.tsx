import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerSquare, ringSquare, text } from '../../kit/presets';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * News Package: a newsroom's on-air package built in code. A channel bug with a LIVE dot, a ticker
 * along the bottom, captions as lower-third straps, the hook as a BREAKING banner, and a sting (diagonal
 * bars) on each cut.
 */

const RED = '#D7141A';
const NAVY = '#0B1E3F';
const WHITE = '#FFFFFF';

function OnAir({ c }: { c: Ctx }) {
  const tick = 'MARKETS: TECH STOCKS RALLY  ·  WEATHER: STORMS CLEAR BY FRIDAY  ·  SPORT: CITY WIN THE DERBY  ·  ';
  const x = -((c.frame * 4) % 1600);
  return (
    <AbsoluteFill>
      {/* Channel bug. */}
      <div style={{ position: 'absolute', right: 50, top: 120, display: 'flex', alignItems: 'center', gap: 10, fontFamily: c.fonts.display, fontSize: 30, fontWeight: 800, color: WHITE, letterSpacing: 2 }}>
        <span style={{ background: RED, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: WHITE, opacity: Math.floor(c.frame / 15) % 2 ? 1 : 0.3 }} />
          LIVE
        </span>
        <span style={{ background: 'rgba(11,30,63,0.85)', padding: '4px 12px' }}>VNN</span>
      </div>
      {/* Ticker. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 170, height: 64, background: NAVY, display: 'flex', alignItems: 'center', overflow: 'hidden', borderTop: `4px solid ${RED}` }}>
        <div style={{ flex: 'none', height: '100%', background: RED, color: WHITE, fontFamily: c.fonts.display, fontWeight: 800, fontSize: 30, display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 1 }}>NEWS</div>
        <div style={{ whiteSpace: 'nowrap', color: WHITE, fontFamily: c.fonts.body, fontSize: 30, transform: `translateX(${x}px)` }}>{tick.repeat(4)}</div>
      </div>
    </AbsoluteFill>
  );
}

/** The sting: red and navy bars cross on a diagonal. */
const sting: StyleTheme['transition'] = {
  before: 5,
  after: 8,
  Draw: ({ d }) => (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {[RED, NAVY, WHITE, RED].map((col, k) => {
        const p = interpolate(d - k, [-5, 0, 8], [-1, 0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return <div key={k} style={{ position: 'absolute', left: '-40%', width: '180%', top: `${8 + k * 24}%`, height: '30%', background: col, transform: `rotate(-24deg) translateX(${p * -120}%)` }} />;
      })}
    </AbsoluteFill>
  ),
};

export const newsPackage = defineStyle({
  id: 'news-package',
  accent: RED,
  colors: [NAVY, WHITE],
  entrance: 'glide',
  footage: 'contrast(1.06) saturate(1.04)',
  Overlay: OnAir,
  caption: caption({ size: 80, glyph: 0.55, color: NAVY, emph: RED, weight: 800, upper: true, bg: WHITE, pad: '8px 24px', boxExtra: { borderLeft: `16px solid ${RED}`, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }, entrance: 'glide' }),
  hook: hook({ top: 0.12, align: 'left', color: WHITE, size: 62, weight: 800, upper: true, bg: RED, pad: '14px 28px', entrance: 'glide', boxExtra: { boxShadow: `10px 10px 0 ${NAVY}` }, Decor: ({ c }) => <div style={{ position: 'absolute', top: -46, left: 0, background: NAVY, color: WHITE, fontFamily: c.fonts.display, fontWeight: 800, fontSize: 30, padding: '4px 14px', letterSpacing: 3 }}>BREAKING</div> }),
  card: card({ bg: WHITE, shadow: `0 10px 30px rgba(0,0,0,0.35)`, extra: { borderTop: `10px solid ${RED}` } }),
  title: text({ color: NAVY, weight: 800, upper: true }),
  body: text({ font: 'body', color: '#33405A', weight: 500 }),
  number: text({ color: WHITE, weight: 800, extra: { background: NAVY, padding: '0 26px', borderBottom: `10px solid ${RED}` } }),
  slam: text({ color: WHITE, weight: 800, upper: true, extra: { background: RED, padding: '0 26px' } }),
  Marker: markerSquare([RED, NAVY], 26),
  Ring: ringSquare(RED, 7),
  stage: { shape: 'square', fill: [WHITE, '#E9EDF4'], ring: RED, ringWidth: 6 },
  transition: sting,
  sample: { type: 'lower_third', text: 'Dana Ruiz', subtext: 'Economics editor' },
});
