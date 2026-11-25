import { AbsoluteFill, interpolate } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDot, ringCircle, text } from '../../kit/presets';
import { filmDamage, grain, vignette } from '../../kit/textures';
import type { Ctx, StyleTheme } from '../../theme';

/**
 * Silent Film: a silent picture projected in a picture house. A 4:3 print that flickers and weaves
 * slightly in the frame between red velvet curtains, ornate intertitle cards with a border, and an iris
 * that closes at each cut.
 */

const VELVET = '#6E0D1A';
const PAPER = '#F1EAD8';
const INK = '#141210';
const SCREEN = { x: 60, y: 560, w: 960, h: 720 };

function House({ c }: { c: Ctx }) {
  const sway = Math.sin(c.frame / 50) * 6;
  const curtain = (left: boolean) => (
    <div style={{ position: 'absolute', top: 0, bottom: 0, [left ? 'left' : 'right']: -20, width: 210, background: `repeating-linear-gradient(90deg, ${VELVET} 0 26px, #4A0812 26px 52px)`, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)', transform: `skewX(${left ? sway * 0.3 : -sway * 0.3}deg)` }} />
  );
  return (
    <AbsoluteFill style={{ background: '#0A0606' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 240, background: `linear-gradient(${VELVET}, #3A050C)`, borderBottom: '18px solid #C9A227' }} />
      {curtain(true)}
      {curtain(false)}
      <div style={{ position: 'absolute', left: SCREEN.x - 10, top: SCREEN.y - 10, width: SCREEN.w + 20, height: SCREEN.h + 20, background: '#1A1614', boxShadow: '0 0 80px rgba(255,240,200,0.25)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(transparent, #000)' }}>
        {Array.from({ length: 9 }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: 40 + k * 115, bottom: 60 + (k % 2) * 20, width: 90, height: 110, borderRadius: '45px 45px 10px 10px', background: '#050303' }} />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function Flicker({ c }: { c: Ctx }) {
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, overflow: 'hidden' }}>
        {filmDamage(c.frame, { step: 2, scratches: 2, dust: 10, flicker: 0.14 })}
        {grain({ color: '#000', alpha: 0.4, frame: c.frame, freq: 1.2 })}
        {vignette(0.75, '#000', 50)}
      </div>
    </AbsoluteFill>
  );
}

const iris: StyleTheme['transition'] = {
  before: 6,
  after: 8,
  Draw: ({ d }) => {
    const r = d < 0 ? interpolate(d, [-6, 0], [80, 0]) : interpolate(d, [0, 8], [0, 80], { extrapolateRight: 'clamp' });
    return <div style={{ position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, background: `radial-gradient(circle at 50% 50%, transparent ${r}%, #000 ${r + 0.5}%)` }} />;
  },
};

const ornament = { border: `6px double ${INK}`, outline: `3px solid ${INK}`, outlineOffset: -18 };

export const silentFilm = defineStyle({
  id: 'silent-film',
  accent: '#C9A227',
  colors: [VELVET, PAPER],
  entrance: 'fade',
  step: 2,
  footage: 'grayscale(1) contrast(1.35) brightness(1.08)',
  screen: { ...SCREEN, shape: 'rect' },
  Backdrop: House,
  Overlay: Flicker,
  drift: (f) => ({ x: Math.sin(f / 7) * 0.15, y: Math.sin(f / 11) * 0.1 }),
  caption: caption({ size: 78, glyph: 0.5, color: INK, emph: VELVET, bg: PAPER, pad: '10px 30px', boxExtra: { ...ornament }, entrance: 'fade' }),
  hook: hook({ top: 0.14, entrance: 'fade', color: INK, size: 64, bg: PAPER, pad: '28px 44px', boxExtra: ornament }),
  card: card({ bg: PAPER, extra: ornament }),
  title: text({ color: INK }),
  body: text({ font: 'body', color: '#3A3530', italic: true }),
  number: text({ color: INK, extra: { background: PAPER, padding: '0 30px', ...ornament } }),
  slam: text({ color: INK, extra: { background: PAPER, padding: '10px 34px', ...ornament } }),
  Marker: markerDot([VELVET], 16),
  Ring: ringCircle('#fff', 5),
  stage: { shape: 'circle', fill: [PAPER, '#D9CFB8'], ring: INK, ringWidth: 6 },
  transition: iris,
  sample: { type: 'headline', text: 'Meanwhile, at the station...', subtext: '' },
});
