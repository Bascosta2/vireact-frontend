import { AbsoluteFill } from 'remotion';
import { phosphorFilter } from '../../kit/filters';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerArrow, ringSquare, text, trGlitch } from '../../kit/presets';
import { scanlines } from '../../kit/textures';
import { noise, type Ctx } from '../../theme';

/**
 * Digital Rain: the footage turned to glowing green code. A green phosphor grade, columns of falling
 * binary and glyphs over it (brightest at the head of each column), glowing green type, and glitch cuts.
 */

const GREEN = '#39FF7A';
const DARK = '#001A08';
const GLYPHS = '0110<>{}[]#$%&*+=:;01/|01';

function Rain({ c }: { c: Ctx }) {
  const cols = 22;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: cols }, (_, k) => {
          const speed = 18 + noise(k, 1) * 26;
          const len = 10 + Math.floor(noise(k, 2) * 14);
          const head = ((c.frame * speed + noise(k, 3) * 4000) % 2600) - 300;
          return (
            <g key={k} fontFamily={c.fonts.display} fontSize={42} textAnchor="middle">
              {Array.from({ length: len }, (_, j) => {
                const y = head - j * 46;
                if (y < -50 || y > 1960) return null;
                const ch = GLYPHS[Math.floor(noise(k * 31 + j, Math.floor(c.frame / 5)) * GLYPHS.length)];
                return (
                  <text key={j} x={25 + k * 49} y={y} fill={j === 0 ? '#E8FFEF' : GREEN} opacity={j === 0 ? 1 : 0.85 - j / len}>
                    {ch}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
      {scanlines({ gap: 4, alpha: 0.25 })}
    </AbsoluteFill>
  );
}

export const digitalRain = defineStyle({
  id: 'digital-rain',
  accent: GREEN,
  colors: ['#0B6B2C', '#E8FFEF'],
  entrance: 'flicker',
  footage: 'url(#dr-green)',
  Defs: () => phosphorFilter('dr-green', GREEN, DARK),
  Overlay: Rain,
  caption: caption({ size: 84, glyph: 0.6, color: GREEN, emph: '#E8FFEF', glow: GREEN, shadow: `0 0 14px ${GREEN}`, entrance: 'flicker' }),
  hook: hook({ top: 0.1, entrance: 'flicker', typewriter: true, color: GREEN, size: 64, glow: GREEN, bg: 'rgba(0,10,4,0.85)', border: `2px solid ${GREEN}`, pad: '14px 26px' }),
  card: card({ bg: 'rgba(0,12,4,0.9)', border: `2px solid ${GREEN}`, shadow: `0 0 30px ${GREEN}44` }),
  title: text({ color: GREEN, glow: GREEN }),
  body: text({ font: 'body', color: '#9CFFC0' }),
  number: text({ color: '#E8FFEF', glow: GREEN }),
  slam: text({ color: '#E8FFEF', upper: true, glow: GREEN }),
  Marker: markerArrow(GREEN, 34),
  Ring: ringSquare(GREEN, 4),
  stage: { shape: 'square', fill: ['#002A0E', DARK], ring: GREEN, ringWidth: 3, glow: GREEN },
  transition: trGlitch({ colors: [GREEN, '#E8FFEF', '#0B6B2C'] }),
  sample: { type: 'pill', text: 'Wake up' },
});
