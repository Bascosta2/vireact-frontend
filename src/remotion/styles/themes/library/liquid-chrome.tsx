import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text, trZoom } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { vignette } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Liquid Chrome: molten mirror metal. Blobs of liquid chrome merge and split in the corners (a gooey
 * metaball filter), type is polished chrome with a moving highlight, the footage gets a cool, contrasty
 * grade, and cuts are a fast zoom.
 */

const CHROME = 'linear-gradient(180deg, #FFFFFF 0%, #D7DDE6 30%, #6B7480 48%, #1E232B 52%, #9AA6B5 70%, #FFFFFF 100%)';
const ICE = '#9FD8FF';

function Blobs({ c }: { c: Ctx }) {
  const t = c.frame / 30;
  const blob = (x: number, y: number, r: number, k: number) => <circle key={k} cx={x + Math.sin(t * 0.9 + k) * 60} cy={y + Math.cos(t * 0.7 + k * 2) * 50} r={r} />;
  return (
    <AbsoluteFill>
      {vignette(0.5, '#0A0D12')}
      {svgFrame(
        <g>
          <defs>
            <filter id="lc-goo">
              <feGaussianBlur stdDeviation="22" />
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -12" />
            </filter>
            <linearGradient id="lc-metal" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="0.35" stopColor="#C9D1DC" />
              <stop offset="0.5" stopColor="#3A414C" />
              <stop offset="0.62" stopColor="#B8C4D2" />
              <stop offset="1" stopColor="#F4F7FB" />
            </linearGradient>
          </defs>
          <g filter="url(#lc-goo)" fill="url(#lc-metal)">
            {blob(60, 260, 120, 1)}
            {blob(200, 160, 80, 2)}
            {blob(120, 420, 70, 3)}
            {blob(1000, 1700, 140, 4)}
            {blob(860, 1800, 90, 5)}
            {blob(1040, 1520, 70, 6)}
          </g>
        </g>,
      )}
    </AbsoluteFill>
  );
}

const chromeText = (c: Ctx) => ({ fontFamily: c.fonts.display, backgroundImage: CHROME, backgroundSize: '100% 140%', backgroundPosition: `0 ${(c.frame * 2) % 140}%`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55))' });

export const liquidChrome = defineStyle({
  id: 'liquid-chrome',
  accent: ICE,
  colors: ['#FFFFFF', '#6B7480'],
  entrance: 'bounce',
  textScale: 0.82,
  footage: 'contrast(1.2) saturate(0.7) brightness(0.98) hue-rotate(-6deg)',
  Overlay: Blobs,
  caption: caption({ size: 96, glyph: 0.55, color: '#F4F7FB', emph: ICE, weight: 800, upper: true, stroke: [3, '#2A3038'], shadow: '0 2px 0 #6B7480, 0 6px 18px rgba(0,0,0,0.6)', entrance: 'bounce' }),
  hook: hook({ top: 0.09, entrance: 'bounce', size: 88, weight: 800, upper: true, extra: { backgroundImage: CHROME, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.6))' } }),
  card: card({ bg: 'linear-gradient(180deg, rgba(240,244,250,0.95), rgba(170,182,196,0.95))', radius: 40, shadow: 'inset 0 2px 0 #fff, inset 0 -4px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,0,0,0.45)' }),
  title: text({ color: '#1E232B', weight: 800, upper: true }),
  body: text({ font: 'body', color: '#3A414C', weight: 600 }),
  number: (c) => ({ ...chromeText(c), fontWeight: 800 }),
  slam: (c) => ({ ...chromeText(c), fontWeight: 800, textTransform: 'uppercase' }),
  Marker: markerDot(['#C9D1DC', ICE], 30, '3px solid #fff'),
  Ring: ringCircle('#E6ECF3', 10, { under: [16, '#3A414C'] }),
  stage: { shape: 'circle', fill: ['#F4F7FB', '#8E99A8'], ring: '#FFFFFF', ringWidth: 6 },
  transition: trZoom({ from: 1.3, blur: 14 }),
  sample: { type: 'slam', text: 'LIQUID' },
});
