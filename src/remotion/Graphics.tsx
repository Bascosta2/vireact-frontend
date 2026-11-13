import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DISPLAY, FONT } from './fonts';
import type { Graphic } from './types';
import { COUNTER_SEC, LIST_FIRST_SEC, LIST_STEP_SEC, STROKE, clamp, exitAt, formatCount, parseCount } from './graphics-utils';

function Slam({ g, frame, fps, accent }: GraphicProps) {
  const enter = spring({ frame, fps, config: { damping: 9, stiffness: 260, mass: 0.8 } });
  const out = exitAt(frame, g.durationFrames);
  const size = g.text.length <= 8 ? 190 : g.text.length <= 14 ? 150 : 118;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '26%' }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 0.95,
          color: '#fff',
          textTransform: 'uppercase',
          textAlign: 'center',
          maxWidth: '90%',
          letterSpacing: 2,
          ...STROKE,
          WebkitTextStroke: '6px #000',
          textShadow: `10px 10px 0 ${accent}, 0 18px 40px rgba(0,0,0,0.5)`,
          transform: `scale(${interpolate(enter, [0, 1], [2.6, 1]) * (1 + 0.15 * out)}) rotate(${interpolate(enter, [0, 1], [-10, -3])}deg)`,
          opacity: interpolate(frame, [0, 2], [0, 1], clamp) * (1 - out),
        }}
      >
        {g.text}
      </div>
    </AbsoluteFill>
  );
}

function Pill({ g, frame, fps, accent }: GraphicProps) {
  const enter = spring({ frame, fps, config: { damping: 11, stiffness: 240 } });
  const out = exitAt(frame, g.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '13%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: accent,
          color: '#0a0a0f',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 50,
          textTransform: 'uppercase',
          padding: '18px 38px',
          borderRadius: 999,
          boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
          transform: `translateY(${-40 * out}px) scale(${enter})`,
          opacity: 1 - out,
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 999, background: '#0a0a0f', opacity: 0.6 + 0.4 * Math.abs(Math.sin(frame / 5)) }} />
        {g.text}
      </div>
    </AbsoluteFill>
  );
}

function Headline({ g, frame, fps, accent }: GraphicProps) {
  const out = exitAt(frame, g.durationFrames, 8);
  const words = g.text.split(/\s+/).filter(Boolean);
  const card = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const subIn = interpolate(frame, [words.length * 3 + 6, words.length * 3 + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '18%' }}>
      <div
        style={{
          maxWidth: '86%',
          background: 'rgba(10,10,15,0.82)',
          borderLeft: `14px solid ${accent}`,
          borderRadius: 22,
          padding: '28px 38px',
          transform: `translateY(${interpolate(card, [0, 1], [-80, 0]) - 60 * out}px)`,
          opacity: card * (1 - out),
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.12, color: '#fff' }}>
          {words.map((w, k) => {
            const t = interpolate(frame, [k * 3, k * 3 + 8], [0, 1], clamp);
            return (
              <span key={k} style={{ display: 'inline-block', marginRight: '0.28em', opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>
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

function LowerThird({ g, frame, fps, accent }: GraphicProps) {
  const bar = spring({ frame, fps, config: { damping: 18, stiffness: 160 } });
  const text = interpolate(frame, [5, 14], [0, 1], clamp);
  const out = exitAt(frame, g.durationFrames, 8);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: '58%', paddingLeft: '6%' }}>
      <div style={{ transform: `translateX(${-110 * out}%)`, opacity: 1 - out * 0.5 }}>
        <div style={{ height: 12, width: `${interpolate(bar, [0, 1], [0, 100])}%`, minWidth: 0, background: accent, borderRadius: 6, marginBottom: 12 }} />
        <div style={{ background: 'rgba(10,10,15,0.85)', padding: '18px 30px', borderRadius: 14, clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)` }}>
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
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const landed = spring({ frame: frame - countFrames, fps, config: { damping: 8, stiffness: 300 }, durationInFrames: 10 });
  const out = exitAt(frame, g.durationFrames);
  const shown = parsed ? `${parsed.prefix}${formatCount(parsed.value * t, parsed.decimals, parsed.commas)}${parsed.suffix}` : g.text;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '20%' }}>
      <div style={{ position: 'relative', textAlign: 'center', transform: `scale(${enter * (1 + 0.12 * (frame >= countFrames ? Math.sin(Math.min(1, landed) * Math.PI) : 0))})`, opacity: 1 - out }}>
        <div style={{ position: 'absolute', inset: '-30% -20%', background: `radial-gradient(circle, ${accent}55 0%, transparent 65%)` }} />
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
  const card = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
  const out = exitAt(frame, g.durationFrames, 8);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '15%' }}>
      <div style={{ width: '82%', background: 'rgba(10,10,15,0.86)', borderRadius: 28, padding: '30px 36px', transform: `scale(${0.9 + 0.1 * card}) translateY(${-40 * out}px)`, opacity: card * (1 - out), boxShadow: '0 24px 60px rgba(0,0,0,0.5)', border: `3px solid ${accent}` }}>
        {g.text && <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: accent, textTransform: 'uppercase', marginBottom: 16 }}>{g.text}</div>}
        {g.items.map((item, k) => {
          const at = Math.round((LIST_FIRST_SEC + k * LIST_STEP_SEC) * fps);
          const s = spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 220 } });
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '14px 0', opacity: frame >= at ? 1 : 0, transform: `translateX(${(1 - s) * -60}px)` }}>
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
  const ring = spring({ frame, fps, config: { damping: 10, stiffness: 220 } });
  const pulse = (frame % 24) / 24;
  const out = exitAt(frame, g.durationFrames);
  const labelAbove = g.focusY > 0.45;
  const labelY = labelAbove ? y - 260 : y + 260;
  const line = interpolate(frame, [4, 12], [0, 1], clamp);
  const label = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={x} cy={y} r={95 * ring} fill="none" stroke={accent} strokeWidth={10} />
        <circle cx={x} cy={y} r={95 + 70 * pulse} fill="none" stroke={accent} strokeWidth={6} opacity={(1 - pulse) * ring} />
        <line x1={x} y1={labelAbove ? y - 95 : y + 95} x2={x} y2={(labelAbove ? y - 95 : y + 95) + (labelY - y + (labelAbove ? 95 : -95)) * line} stroke={accent} strokeWidth={8} strokeLinecap="round" />
      </svg>
      {g.text && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(Math.max(x, 260), width - 260),
            top: labelY,
            transform: `translate(-50%, ${labelAbove ? '-100%' : '0'}) scale(${label})`,
            background: accent,
            color: '#0a0a0f',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 46,
            padding: '14px 28px',
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

function Cta({ g, frame, fps, accent }: GraphicProps) {
  const enter = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const bounce = Math.sin(frame / 4) * 6;
  const out = exitAt(frame, g.durationFrames);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '40%' }}>
      <div style={{ textAlign: 'center', transform: `translateY(${bounce}px) scale(${enter})`, opacity: 1 - out }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, background: accent, color: '#0a0a0f', fontFamily: FONT, fontWeight: 900, fontSize: 60, textTransform: 'uppercase', padding: '26px 52px', borderRadius: 999, boxShadow: `0 0 0 ${8 + 6 * Math.abs(Math.sin(frame / 6))}px ${accent}44, 0 20px 50px rgba(0,0,0,0.5)` }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
          {g.text}
        </div>
        {g.subtext && <div style={{ marginTop: 16, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#fff', ...STROKE, WebkitTextStroke: '3px #000' }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
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
};

/** One animated graphic; place it inside a Sequence that starts at its startFrame. */
export function GraphicLayer({ g, accent }: { g: Graphic; accent: string }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const Render = RENDERERS[g.type] ?? Pill;
  return <>{Render({ g, frame, fps, accent, width, height })}</>;
}
