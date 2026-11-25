import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerDash, ringBrackets, text, trShutter } from '../../kit/presets';
import { useVoice } from '../../pulse';
import { grain } from '../../kit/textures';
import type { Ctx } from '../../theme';

/**
 * Investigation Desk: a cold desk where the footage plays on one monitor with a running timecode and an
 * audio waveform under it, and documents, a map card and photos lie round it, joined by red string.
 * Everything runs on one clock.
 */

const DESK = '#14171C';
const RED = '#E23D3D';
const PAPER = '#E8E4DA';
const MON = { x: 70, y: 300, w: 940, h: 760 };

function Desk({ c }: { c: Ctx }) {
  const voice = useVoice();
  const bars = voice.bars(c.frame, 48);
  const s = Math.floor(c.frame / 30);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #262B33, ${DESK})` }}>
      <div style={{ position: 'absolute', left: MON.x - 16, top: MON.y - 16, width: MON.w + 32, height: MON.h + 32, background: '#0A0B0E', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }} />
      {/* Waveform strip and timecode, on the same clock as the footage. */}
      <div style={{ position: 'absolute', left: MON.x, top: MON.y + MON.h + 30, width: MON.w, height: 110, background: '#0E1014', border: '1px solid #2A2F38', display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', boxSizing: 'border-box' }}>
        {bars.map((b, k) => (
          <div key={k} style={{ flex: 1, height: `${10 + b * 80}%`, background: k < 24 ? RED : '#5A616E' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: MON.x, top: MON.y + MON.h + 150, fontFamily: c.fonts.body, fontSize: 30, color: '#C9CFD8' }}>
        CAM 2 · 14:{String(32 + Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')} · SYNCED
      </div>
      {/* Documents and a map card on the desk, joined by string. */}
      <div style={{ position: 'absolute', left: 60, top: 1300, width: 420, height: 300, background: PAPER, transform: 'rotate(-4deg)', padding: 20, boxSizing: 'border-box', fontFamily: c.fonts.body, fontSize: 22, color: '#333', boxShadow: '0 14px 24px rgba(0,0,0,0.5)' }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>EXHIBIT 4</div>
        {[90, 70, 85, 60, 75].map((w, k) => (
          <div key={k} style={{ height: 10, width: `${w}%`, background: '#9A968C', marginBottom: 12 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 600, top: 1330, width: 400, height: 280, background: '#BFD6C2', transform: 'rotate(3deg)', boxShadow: '0 14px 24px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <svg width={400} height={280}>
          <path d="M 0 180 C 100 120 160 220 260 150 S 360 90 400 120" stroke="#6E9C78" strokeWidth={10} fill="none" />
          <circle cx={230} cy={150} r={14} fill={RED} />
        </svg>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        <path d="M 270 1320 Q 520 1250 830 1480" stroke={RED} strokeWidth={4} fill="none" />
        <circle cx={270} cy={1320} r={9} fill={RED} />
        <circle cx={830} cy={1480} r={9} fill={RED} />
      </svg>
      {grain({ color: '#000', alpha: 0.2, freq: 0.9 })}
    </AbsoluteFill>
  );
}

export const investigationDesk = defineStyle({
  id: 'investigation-desk',
  accent: RED,
  colors: [PAPER, '#5A616E'],
  entrance: 'fade',
  footage: 'contrast(1.1) saturate(0.8) brightness(0.95)',
  screen: { ...MON, shape: 'rect', radius: 6 },
  Backdrop: Desk,
  caption: caption({ size: 78, glyph: 0.6, color: '#FFFFFF', emph: RED, weight: 600, bg: 'rgba(10,11,14,0.88)', pad: '6px 22px', boxExtra: { borderLeft: `8px solid ${RED}` }, entrance: 'fade' }),
  hook: hook({ top: 0.055, align: 'left', entrance: 'fade', color: '#111', size: 56, weight: 700, bg: PAPER, rotate: -1, pad: '12px 24px', boxShadow: '0 12px 22px rgba(0,0,0,0.6)', boxExtra: { borderTop: `10px solid ${RED}` } }),
  card: card({ bg: PAPER, shadow: '0 14px 26px rgba(0,0,0,0.55)' }),
  title: text({ color: '#111', weight: 700 }),
  body: text({ font: 'body', color: '#3A3A3A' }),
  number: text({ color: RED, weight: 700, stroke: [6, '#0A0B0E'] }),
  slam: text({ color: '#fff', weight: 700, upper: true, letter: 4, extra: { background: RED, padding: '0 24px' } }),
  Marker: markerDash(RED, 30, 6),
  Ring: ringBrackets(RED, 5),
  stage: { shape: 'square', fill: ['#262B33', DESK], ring: RED, ringWidth: 4 },
  transition: trShutter({ color: '#0A0B0E' }),
  sample: { type: 'list', text: 'Timeline', items: ['14:32 arrival', '14:35 the call', '14:41 exit'] },
});
