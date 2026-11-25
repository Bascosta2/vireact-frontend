import { AbsoluteFill } from 'remotion';
import { defineStyle } from '../../kit/define';
import { caption, card, hook, markerNum, ringBrackets, text, trWipe } from '../../kit/presets';
import { gridPaper, layer } from '../../kit/textures';
import { smooth } from '../../painted';
import type { Ctx } from '../../theme';

/**
 * Teardown: a product taken apart in front of the camera like a studio packshot. A clean grey studio
 * grade, a fine engineering grid, numbered part leaders that pull out from the product to labelled tags
 * on both sides, and a bill-of-materials strip along the bottom.
 */

const STUDIO = '#E9EBEE';
const INK = '#15171C';
const LIME = '#C6FF3D';

const TAGS = [
  { x: 120, y: 470, tx: 380, ty: 620, name: 'Housing' },
  { x: 960, y: 560, tx: 700, ty: 700, name: 'Battery' },
  { x: 120, y: 1240, tx: 400, ty: 1080, name: 'Logic board' },
  { x: 960, y: 1330, tx: 690, ty: 1160, name: 'Driver' },
];

function Leaders({ c }: { c: Ctx }) {
  // Leaders pull out one after another every 8 seconds.
  const u = (c.frame % 240) / 60;
  return (
    <AbsoluteFill>
      {gridPaper({ color: '#ffffff', size: 60, major: 4, alpha: 0.07, majorAlpha: 0.12 })}
      {layer({ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(233,235,238,0.55) 100%)' })}
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
        {TAGS.map((t, k) => {
          const p = smooth(u, k * 0.35, k * 0.35 + 0.4);
          const left = t.x < 540;
          return (
            <g key={t.name} opacity={p}>
              <circle cx={t.tx} cy={t.ty} r={10} fill={LIME} stroke={INK} strokeWidth={4} />
              <polyline points={`${t.tx},${t.ty} ${t.tx + (t.x - t.tx) * 0.5 * p},${t.y} ${t.x + (left ? 150 : -150) * (1 - p)},${t.y}`} fill="none" stroke={INK} strokeWidth={3} />
              <g transform={`translate(${left ? t.x - 20 : t.x - 250} ${t.y - 40})`}>
                <rect width={270} height={70} rx={10} fill="#fff" stroke={INK} strokeWidth={3} />
                <circle cx={36} cy={35} r={20} fill={INK} />
                <text x={36} y={45} textAnchor="middle" fill={LIME} fontSize={26} fontWeight={700} fontFamily={c.fonts.display}>
                  {k + 1}
                </text>
                <text x={70} y={46} fill={INK} fontSize={28} fontFamily={c.fonts.body}>
                  {t.name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 120, display: 'flex', gap: 10, fontFamily: c.fonts.body, fontSize: 22, color: INK }}>
        {['BOM', '01 HOUSING ×1', '02 CELL ×2', '03 PCB ×1', '04 DRIVER ×2'].map((b, k) => (
          <span key={b} style={{ background: k ? 'rgba(255,255,255,0.85)' : INK, color: k ? INK : LIME, padding: '6px 10px', borderRadius: 6 }}>
            {b}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

export const teardown = defineStyle({
  id: 'teardown',
  accent: LIME,
  colors: [INK, '#7A808C'],
  entrance: 'glide',
  footage: 'saturate(0.75) contrast(1.08) brightness(1.06)',
  Overlay: Leaders,
  caption: caption({ size: 86, glyph: 0.56, color: INK, emphBg: LIME, emphColor: INK, weight: 700, bg: 'rgba(255,255,255,0.95)', pad: '6px 22px', radius: 10 }),
  hook: hook({ top: 0.07, align: 'left', color: LIME, size: 62, weight: 700, bg: INK, radius: 12, pad: '16px 28px' }),
  card: card({ bg: 'rgba(255,255,255,0.96)', border: `3px solid ${INK}`, radius: 14 }),
  title: text({ color: INK, weight: 700 }),
  body: text({ font: 'body', color: '#3C4048' }),
  number: text({ color: INK, weight: 700, extra: { background: LIME, padding: '0 22px', borderRadius: 14 } }),
  slam: text({ color: LIME, weight: 700, upper: true, extra: { background: INK, padding: '0 26px', borderRadius: 12 } }),
  Marker: markerNum({ bg: INK, fg: LIME, size: 54 }),
  Ring: ringBrackets(INK, 6),
  stage: { shape: 'square', fill: ['#FFFFFF', STUDIO], ring: INK, ringWidth: 4 },
  transition: trWipe({ color: STUDIO, dir: 'right', edge: `10px solid ${LIME}` }),
  sample: { type: 'list', text: 'Inside', items: ['Housing', 'Battery', 'Logic board'] },
});
