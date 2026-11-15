import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DISPLAY, FONT } from './fonts';
import type { Graphic } from './types';
import { BELOW_CAPTIONS, COUNTER_SEC, GLASS, LIST_FIRST_SEC, LIST_STEP_SEC, SHADOW, SMOOTH, SNAP, STROKE, calloutLabel, clamp, exitAt, formatCount, parseCount } from './graphics-utils';
import { VisualStage } from './visuals/VisualStage';

/** Height of a callout's label box, so its position can be worked out before it is drawn. */
const LABEL_HEIGHT = 90;

/**
 * The animated graphics. They share one motion language so an edit feels designed rather than
 * assembled: everything is upright (no tilts), arrives on the same two springs with a short blur
 * instead of a bounce, sits on the same dark glass, and leaves with a quick fade.
 */

function Slam({ g, frame, fps, accent, height }: GraphicProps) {
  const enter = spring({ frame, fps, config: SNAP });
  const out = exitAt(frame, g.durationFrames, 5);
  const size = g.text.length <= 8 ? 190 : g.text.length <= 14 ? 150 : 118;
  const bar = interpolate(frame, [4, 13], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    // Normally near the top; under the captions when the top is taken by another graphic (g.low).
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: g.low ? Math.round(height * BELOW_CAPTIONS) : '26%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '90%', opacity: interpolate(frame, [0, 3], [0, 1], clamp) * (1 - out), transform: `scale(${interpolate(enter, [0, 1], [1.7, 1]) * (1 + 0.08 * out)})` }}>
        <div
          style={{
            fontFamily: DISPLAY,
            fontSize: size,
            lineHeight: 0.95,
            color: '#fff',
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: 2,
            ...STROKE,
            WebkitTextStroke: '6px #000',
            textShadow: `0 0 36px ${accent}99, 0 16px 38px rgba(0,0,0,0.55)`,
            // Arrives out of a short blur, like a fast camera move settling.
            filter: `blur(${(Math.max(0, 1 - enter) * 14).toFixed(1)}px)`,
          }}
        >
          {g.text}
        </div>
        <div style={{ height: 14, width: `${bar * 72}%`, marginTop: 16, borderRadius: 7, background: accent, boxShadow: `0 0 24px ${accent}aa` }} />
      </div>
    </AbsoluteFill>
  );
}

function Pill({ g, frame, fps, accent }: GraphicProps) {
  const enter = spring({ frame, fps, config: SMOOTH });
  const out = exitAt(frame, g.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '13%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: GLASS,
          border: `3px solid ${accent}`,
          color: '#fff',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 50,
          textTransform: 'uppercase',
          padding: '18px 38px',
          borderRadius: 999,
          boxShadow: `0 0 26px ${accent}44, ${SHADOW}`,
          transform: `translateY(${(1 - enter) * -36 - 30 * out}px) scale(${0.9 + 0.1 * enter})`,
          opacity: Math.min(1, enter * 1.6) * (1 - out),
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 999, background: accent, boxShadow: `0 0 14px ${accent}` }} />
        {g.text}
      </div>
    </AbsoluteFill>
  );
}

function Headline({ g, frame, fps, accent }: GraphicProps) {
  const out = exitAt(frame, g.durationFrames, 8);
  const words = g.text.split(/\s+/).filter(Boolean);
  const card = spring({ frame, fps, config: SMOOTH });
  const subIn = interpolate(frame, [words.length * 3 + 6, words.length * 3 + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '18%' }}>
      <div
        style={{
          maxWidth: '86%',
          background: GLASS,
          borderLeft: `12px solid ${accent}`,
          borderRadius: 24,
          padding: '28px 38px',
          transform: `translateY(${(1 - card) * -60 - 40 * out}px)`,
          opacity: Math.min(1, card * 1.6) * (1 - out),
          boxShadow: SHADOW,
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.12, color: '#fff' }}>
          {words.map((w, k) => {
            const t = interpolate(frame, [k * 3, k * 3 + 8], [0, 1], clamp);
            return (
              <span key={k} style={{ display: 'inline-block', marginRight: '0.28em', opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
                {w}
              </span>
            );
          })}
        </div>
        {g.subtext && <div style={{ marginTop: 12, fontFamily: FONT, fontWeight: 700, fontSize: 38, color: accent, opacity: subIn }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

function LowerThird({ g, frame, fps, accent, height }: GraphicProps) {
  const bar = spring({ frame, fps, config: SMOOTH });
  const text = interpolate(frame, [5, 14], [0, 1], clamp);
  const out = exitAt(frame, g.durationFrames, 8);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: Math.round(height * BELOW_CAPTIONS), paddingLeft: '6%' }}>
      <div style={{ transform: `translateX(${-110 * out}%)`, opacity: 1 - out * 0.5 }}>
        <div style={{ height: 12, width: `${interpolate(bar, [0, 1], [0, 100])}%`, minWidth: 0, background: accent, borderRadius: 6, marginBottom: 12 }} />
        <div style={{ background: GLASS, padding: '18px 30px', borderRadius: 16, clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: '#fff', opacity: text, transform: `translateX(${(1 - text) * -30}px)` }}>{g.text}</div>
          {g.subtext && <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: accent, opacity: text }}>{g.subtext}</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function Counter({ g, frame, fps, accent }: GraphicProps) {
  const parsed = parseCount(g.text);
  const countFrames = Math.min(Math.round(COUNTER_SEC * fps), Math.round(g.durationFrames * 0.7));
  const t = interpolate(frame, [0, countFrames], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const enter = spring({ frame, fps, config: SMOOTH });
  // One soft swell when the number lands.
  const landed = interpolate(frame, [countFrames, countFrames + 5, countFrames + 12], [0, 1, 0], clamp);
  const out = exitAt(frame, g.durationFrames);
  const shown = parsed ? `${parsed.prefix}${formatCount(parsed.value * t, parsed.decimals, parsed.commas)}${parsed.suffix}` : g.text;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '20%' }}>
      <div style={{ position: 'relative', textAlign: 'center', transform: `scale(${(0.8 + 0.2 * enter) * (1 + 0.08 * landed)})`, opacity: Math.min(1, enter * 1.6) * (1 - out) }}>
        <div style={{ position: 'absolute', inset: '-30% -20%', background: `radial-gradient(circle, ${accent}44 0%, transparent 65%)` }} />
        <div style={{ position: 'relative', fontFamily: DISPLAY, fontSize: 200, lineHeight: 1, color: accent, fontVariantNumeric: 'tabular-nums', ...STROKE, WebkitTextStroke: '6px #000', textShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
          {shown}
        </div>
        {g.subtext && (
          <div style={{ position: 'relative', marginTop: 10, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#fff', textTransform: 'uppercase', ...STROKE, WebkitTextStroke: '3px #000' }}>
            {g.subtext}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

function List({ g, frame, fps, accent }: GraphicProps) {
  const card = spring({ frame, fps, config: SMOOTH });
  const out = exitAt(frame, g.durationFrames, 8);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '15%' }}>
      <div style={{ width: '82%', background: GLASS, borderRadius: 28, padding: '30px 36px', transform: `scale(${0.92 + 0.08 * card}) translateY(${-30 * out}px)`, opacity: Math.min(1, card * 1.6) * (1 - out), boxShadow: SHADOW, border: `3px solid ${accent}` }}>
        {g.text && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: accent, textTransform: 'uppercase', marginBottom: 16 }}>{g.text}</div>}
        {g.items.map((item, k) => {
          const at = Math.round((LIST_FIRST_SEC + k * LIST_STEP_SEC) * fps);
          const s = spring({ frame: frame - at, fps, config: SMOOTH });
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '14px 0', opacity: frame >= at ? Math.min(1, s * 1.6) : 0, transform: `translateX(${(1 - s) * -40}px)` }}>
              <span style={{ flex: 'none', width: 56, height: 56, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s})` }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 48, color: '#fff' }}>{item}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function Callout({ g, frame, fps, accent, width, height }: GraphicProps) {
  const x = g.focusX * width;
  const y = g.focusY * height;
  const ring = spring({ frame, fps, config: SNAP });
  const pulse = (frame % 30) / 30;
  const out = exitAt(frame, g.durationFrames);
  const { top: labelTop, above: labelAbove } = calloutLabel(y, height, LABEL_HEIGHT);
  // The stem runs from the ring to the near edge of the label.
  const stemFrom = labelAbove ? y - 95 : y + 95;
  const stemTo = labelAbove ? labelTop + LABEL_HEIGHT : labelTop;
  const line = interpolate(frame, [4, 12], [0, 1], clamp);
  const label = spring({ frame: frame - 10, fps, config: SMOOTH });
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={x} cy={y} r={95 * ring} fill="none" stroke={accent} strokeWidth={10} />
        <circle cx={x} cy={y} r={95 + 60 * pulse} fill="none" stroke={accent} strokeWidth={5} opacity={(1 - pulse) * ring * 0.8} />
        <line x1={x} y1={stemFrom} x2={x} y2={stemFrom + (stemTo - stemFrom) * line} stroke={accent} strokeWidth={8} strokeLinecap="round" />
      </svg>
      {g.text && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(Math.max(x, 260), width - 260),
            top: labelTop,
            height: LABEL_HEIGHT,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            transform: `translateX(-50%) scale(${0.85 + 0.15 * label})`,
            opacity: Math.max(0, Math.min(1, label * 1.6)),
            background: accent,
            color: '#0a0a0f',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 46,
            padding: '0 28px',
            borderRadius: 16,
            whiteSpace: 'nowrap',
            boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
          }}
        >
          {g.text}
        </div>
      )}
    </AbsoluteFill>
  );
}

function Cta({ g, frame, fps, accent, height }: GraphicProps) {
  const enter = spring({ frame, fps, config: SNAP });
  const out = exitAt(frame, g.durationFrames);
  // A slow ring breathes around the button instead of the whole thing bouncing.
  const halo = (frame % 36) / 36;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: Math.round(height * BELOW_CAPTIONS) }}>
      <div style={{ textAlign: 'center', transform: `scale(${0.8 + 0.2 * enter})`, opacity: Math.min(1, enter * 1.6) * (1 - out) }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: accent, color: '#0a0a0f', fontFamily: FONT, fontWeight: 900, fontSize: 60, textTransform: 'uppercase', padding: '26px 52px', borderRadius: 999, boxShadow: `0 0 0 ${Math.round(26 * halo)}px ${accent}${Math.round(70 * (1 - halo)).toString(16).padStart(2, '0')}, 0 20px 50px rgba(0,0,0,0.5)` }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          {g.text}
        </div>
        {g.subtext && <div style={{ marginTop: 16, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', ...STROKE, WebkitTextStroke: '3px #000' }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

function Visual(p: GraphicProps) {
  return <VisualStage g={p.g} frame={p.frame} fps={p.fps} accent={p.accent} />;
}

interface GraphicProps {
  g: Graphic;
  frame: number;
  fps: number;
  accent: string;
  width: number;
  height: number;
}

const RENDERERS: Record<Graphic['type'], (p: GraphicProps) => ReactNode> = {
  slam: Slam,
  pill: Pill,
  headline: Headline,
  lower_third: LowerThird,
  counter: Counter,
  list: List,
  callout: Callout,
  cta: Cta,
  visual: Visual,
};

/** One animated graphic; place it inside a Sequence that starts at its startFrame. */
export function GraphicLayer({ g, accent }: { g: Graphic; accent: string }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const Render = RENDERERS[g.type] ?? Pill;
  return <>{Render({ g, frame, fps, accent, width, height })}</>;
}
