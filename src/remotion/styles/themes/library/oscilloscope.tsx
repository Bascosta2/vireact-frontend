import { AbsoluteFill } from 'remotion';
import { phosphorFilter } from '../../kit/filters';
import { defineStyle, pipAt } from '../../kit/define';
import { caption, card, hook, markerDash, ringReticle, text, trShutter } from '../../kit/presets';
import { svgFrame } from '../../kit/scenery';
import { layer, scanlines, vignette } from '../../kit/textures';
import { useVoice } from '../../pulse';
import type { ChartBar, Ctx } from '../../theme';

/**
 * Oscilloscope: mathematics drawn by an electron beam on a phosphor screen. Thin glowing green traces
 * on near-black, a dotted graticule, monospace readouts; the traces move with the creator's voice and
 * leave a fading afterglow. The creator sits in a green phosphor inset.
 */

const GREEN = '#7CFF6B';
const DIM = '#2C6B26';
const BLACK = '#050805';
const GLOW = { filter: `drop-shadow(0 0 6px ${GREEN}) drop-shadow(0 0 16px ${GREEN})` };

/** The graticule: a 10 x 8 grid of dotted divisions. */
const graticule = (x: number, y: number, w: number, h: number) => (
  <g stroke={DIM} strokeWidth={2}>
    <rect x={x} y={y} width={w} height={h} fill="none" />
    {Array.from({ length: 9 }, (_, k) => <line key={`v${k}`} x1={x + ((k + 1) * w) / 10} y1={y} x2={x + ((k + 1) * w) / 10} y2={y + h} strokeDasharray="2 10" />)}
    {Array.from({ length: 7 }, (_, k) => <line key={`h${k}`} x1={x} y1={y + ((k + 1) * h) / 8} x2={x + w} y2={y + ((k + 1) * h) / 8} strokeDasharray="2 10" />)}
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} />
    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} />
  </g>
);

function Scope({ c }: { c: Ctx }) {
  const voice = useVoice();
  const level = voice.level(c.frame);
  const t = c.frame / 30;
  // A Lissajous figure (3:2) that breathes with the voice, and a sine whose amplitude is the voice.
  const lis = Array.from({ length: 220 }, (_, k) => {
    const a = (k / 219) * Math.PI * 2;
    return `${(540 + Math.sin(3 * a + t) * (220 + 60 * level)).toFixed(1)},${(560 + Math.sin(2 * a) * (200 + 40 * level)).toFixed(1)}`;
  }).join(' ');
  const wave = Array.from({ length: 160 }, (_, k) => {
    const x = 100 + (k / 159) * 880;
    const y = 1060 - Math.sin(k / 9 - t * 6) * (20 + 130 * level) * (0.6 + 0.4 * Math.sin(k / 40));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #0C150B, ${BLACK})` }}>
      {svgFrame(
        <g>
          {graticule(100, 260, 880, 640)}
          {graticule(100, 940, 880, 240)}
          <polyline points={lis} fill="none" stroke={GREEN} strokeWidth={3.5} style={GLOW} />
          <polyline points={wave} fill="none" stroke={GREEN} strokeWidth={4} style={GLOW} />
          <g fill={GREEN} fontFamily={c.fonts.display} fontSize={30} style={GLOW}>
            <text x={110} y={240}>CH1 2V/div</text>
            <text x={970} y={240} textAnchor="end">
              f = {(3 + level * 2).toFixed(2)} kHz
            </text>
            <text x={110} y={1225}>CH2 VOICE</text>
            <text x={970} y={1225} textAnchor="end">
              {`${(level * 5).toFixed(1)} V`}
            </text>
          </g>
        </g>,
      )}
      {scanlines({ gap: 4, alpha: 0.35 })}
      {vignette(0.8)}
    </AbsoluteFill>
  );
}

function ScopeChart({ c, bars }: { c: Ctx; bars: ChartBar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1e-9);
  return (
    <svg width="100%" height={440} viewBox="0 0 800 440" style={{ overflow: 'visible' }}>
      {graticule(0, 0, 800, 380)}
      {bars.map((b, k) => {
        const w = 800 / bars.length;
        const h = (b.value / max) * 330 * b.grow;
        return (
          <g key={k} style={GLOW}>
            <polyline points={`${k * w + w * 0.2},380 ${k * w + w * 0.2},${380 - h} ${k * w + w * 0.8},${380 - h} ${k * w + w * 0.8},380`} fill="none" stroke={GREEN} strokeWidth={4} />
            <text x={k * w + w / 2} y={370 - h} fill={GREEN} fontSize={28} textAnchor="middle" fontFamily={c.fonts.display} opacity={b.grow > 0.6 ? 1 : 0}>
              {b.text}
            </text>
            <text x={k * w + w / 2} y={420} fill={GREEN} fontSize={22} textAnchor="middle" fontFamily={c.fonts.body} opacity={0.75}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export const oscilloscope = defineStyle({
  id: 'oscilloscope',
  accent: GREEN,
  colors: [DIM, '#C8FFC0'],
  entrance: 'flicker',
  footage: 'url(#osc-green)',
  Defs: () => phosphorFilter('osc-green', GREEN, '#020502'),
  Scene: Scope,
  pip: pipAt({ border: `4px solid ${GREEN}`, boxShadow: `0 0 24px ${GREEN}` }, 'rect', { radius: 40 }),
  Overlay: ({ scene }) =>
    scene ? null : (
      <AbsoluteFill>
        {scanlines({ gap: 4, alpha: 0.3 })}
        {layer({ border: `3px solid ${DIM}`, inset: 36, borderRadius: 40 })}
        {vignette(0.7)}
      </AbsoluteFill>
    ),
  caption: caption({ size: 86, glyph: 0.6, color: GREEN, emph: '#E6FFE0', glow: GREEN, upper: true, shadow: `0 0 10px ${GREEN}`, entrance: 'flicker' }),
  hook: hook({ top: 0.08, align: 'left', entrance: 'flicker', typewriter: true, color: GREEN, size: 60, upper: true, glow: GREEN, bg: 'rgba(5,8,5,0.85)', border: `3px solid ${GREEN}`, radius: 8, Decor: ({ c }) => <span style={{ position: 'absolute', right: 16, bottom: 16, width: 22, height: 40, background: GREEN, opacity: Math.floor(c.frame / 8) % 2 }} /> }),
  card: card({ bg: 'rgba(5,10,5,0.9)', border: `3px solid ${GREEN}`, radius: 10, shadow: `0 0 26px ${GREEN}55` }),
  title: text({ color: GREEN, upper: true, glow: GREEN }),
  body: text({ font: 'body', color: '#B6F5AC' }),
  number: text({ color: GREEN, glow: GREEN }),
  slam: text({ color: '#E6FFE0', upper: true, glow: GREEN }),
  Marker: markerDash(GREEN, 40, 6),
  Ring: ringReticle(GREEN, 4),
  stage: { shape: 'square', fill: ['#0C150B', BLACK], ring: GREEN, ringWidth: 4, glow: GREEN },
  transition: trShutter({ color: BLACK }),
  Chart: ScopeChart,
  sample: { type: 'counter', text: '1.618', subtext: 'the golden ratio' },
});
