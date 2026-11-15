import { AbsoluteFill, spring } from 'remotion';
import { FONT } from '../fonts';
import { GLASS, SMOOTH, exitAt } from '../graphics-utils';
import type { Graphic } from '../types';
import { VISUALS } from './registry';

const SIZE = 470;

/**
 * An animated illustration of what the speaker is talking about (a brain, a rocket, money), on a
 * dark glass disc in the top third of the frame so it reads over any footage, with an optional label.
 */
export function VisualStage({ g, frame, fps, accent }: { g: Graphic; frame: number; fps: number; accent: string }) {
  const art = g.visual ? VISUALS[g.visual] : undefined;
  if (!art) return null;
  // Gradient and clip ids are shared by the whole page, so each illustration gets its own prefix.
  const uid = `v${g.startFrame}-${g.visual}`;
  const enter = spring({ frame, fps, config: SMOOTH });
  const label = spring({ frame: frame - 6, fps, config: SMOOTH });
  const out = exitAt(frame, g.durationFrames, 7);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: '8%' }}>
      <div
        data-visual={g.visual}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `translateY(${(1 - enter) * -50 - 36 * out}px) scale(${(0.72 + 0.28 * enter) * (1 - 0.12 * out)})`,
          opacity: Math.min(1, enter * 1.8) * (1 - out),
        }}
      >
        <svg viewBox="0 0 400 400" width={SIZE} height={SIZE} style={{ overflow: 'visible', filter: `drop-shadow(0 0 30px ${accent}55) drop-shadow(0 20px 36px rgba(0,0,0,0.55))` }}>
          <defs>
            <radialGradient id={`${uid}-disc`} cx="0.5" cy="0.4" r="0.65">
              <stop offset="0" stopColor="#1D2340" stopOpacity="0.95" />
              <stop offset="1" stopColor="#090B14" stopOpacity="0.93" />
            </radialGradient>
            <clipPath id={`${uid}-stage`}>
              <circle cx={200} cy={200} r={186} />
            </clipPath>
          </defs>
          <circle cx={200} cy={200} r={186} fill={`url(#${uid}-disc)`} />
          <circle cx={200} cy={200} r={190} fill="none" stroke={accent} strokeWidth={3} opacity={0.3} />
          {/* Two arcs of the ring circle slowly, so the disc feels alive even when the art is still. */}
          <circle cx={200} cy={200} r={190} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" strokeDasharray="230 367" transform={`rotate(${frame * 1.4} 200 200)`} />
          <g clipPath={`url(#${uid}-stage)`}>{art({ frame, fps, accent, uid })}</g>
        </svg>
        {g.text && (
          <div
            style={{
              marginTop: -14,
              padding: '12px 32px',
              borderRadius: 999,
              background: GLASS,
              border: `3px solid ${accent}`,
              color: '#fff',
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 44,
              lineHeight: 1.15,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              boxShadow: '0 14px 34px rgba(0,0,0,0.5)',
              transform: `translateY(${(1 - label) * 24}px) scale(${0.85 + 0.15 * label})`,
              opacity: label,
            }}
          >
            {g.text}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
