import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BELOW_CAPTIONS, CHART_FIRST_SEC, CHART_GROW_SEC, CHART_STEP_SEC, COUNTER_SEC, LIST_FIRST_SEC, LIST_STEP_SEC, calloutLabel, chartBars, clamp, formatCount, parseCount } from '../graphics-utils';
import type { Graphic } from '../types';
import { VISUALS } from '../visuals/registry';
import type { StyleFonts } from './fonts';
import { enterProgress, enterStyle, exitProgress, type Entrance } from './motion';
import { pointInFrame } from './stage-utils';
import { stepped, type ChartBar, type Ctx, type StyleTheme } from './theme';

/**
 * The nine graphic types in a style. Places on screen, lengths and timings match the standard graphics
 * (Graphics.tsx) exactly, so the backend's layout rules and the sounds it times to the counter and the
 * list items still land; only the look and the motion change.
 */

interface P {
  g: Graphic;
  c: Ctx;
  theme: StyleTheme;
  /** The element's frame on the style's step grid. */
  f: number;
}

/** Entrance and exit of a whole graphic. */
const motion = (p: P, exitFrames = 6, kind: Entrance = p.theme.entrance, speed = 1) => {
  const t = enterProgress(kind, p.f, p.c.fps, speed);
  const out = exitProgress(p.c.frame, p.g.durationFrames, exitFrames);
  return { t, out, style: enterStyle(kind, t, out, p.c.frame) };
};

/** A word or item that arrives `delay` frames after the graphic. */
const late = (p: P, delay: number, kind: Entrance = p.theme.entrance) => {
  const t = enterProgress(kind === 'write' || kind === 'flicker' ? 'fade' : kind, p.f - delay, p.c.fps);
  return { t, style: enterStyle(kind === 'write' || kind === 'flicker' ? 'fade' : kind, t, 0, p.c.frame - delay) };
};

const ts = (p: P, px: number) => Math.round(px * p.theme.textScale);
const bs = (p: P, px: number) => Math.round(px * (p.theme.bodyScale ?? 1));

function Slam(p: P) {
  const { g, c, theme } = p;
  // A slam lands fast: a written one is written at twice the speed.
  const m = motion(p, 5, theme.entrance === 'fade' || theme.entrance === 'write' ? theme.entrance : 'pop', theme.entrance === 'write' ? 2 : 1);
  const size = ts(p, g.text.length <= 8 ? 190 : g.text.length <= 14 ? 150 : 118);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: g.low ? Math.round(c.height * BELOW_CAPTIONS) : '26%' }}>
      <div style={{ position: 'relative', maxWidth: '90%', textAlign: 'center', ...m.style }}>
        {theme.SlamBack && <theme.SlamBack c={c} t={Math.min(1, m.t)} />}
        <div style={{ position: 'relative', fontSize: size, lineHeight: 1, ...theme.slam(c) }}>{g.text}</div>
      </div>
    </AbsoluteFill>
  );
}

function Pill(p: P) {
  const { g, c, theme } = p;
  const m = motion(p);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '13%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '18px 38px', ...theme.card(c), ...m.style }}>
        <theme.Marker c={c} k={0} t={Math.min(1, m.t)} />
        <span style={{ fontSize: ts(p, 48), lineHeight: 1.15, ...theme.title(c) }}>{g.text}</span>
      </div>
    </AbsoluteFill>
  );
}

function Headline(p: P) {
  const { g, c, theme } = p;
  const m = motion(p, 8);
  const words = g.text.split(/\s+/).filter(Boolean);
  const whole = theme.entrance === 'write' || theme.entrance === 'flicker';
  const sub = late(p, words.length * 3 + 6);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '18%' }}>
      <div style={{ maxWidth: '86%', padding: '28px 40px', ...theme.card(c), ...m.style }}>
        {/* Only the words carry the title style: a word that moves on its own is its own layer, and gradient (metal,
            chrome) text on the line would paint its background through the moving words. */}
        <div style={{ fontSize: ts(p, 64), lineHeight: 1.12, fontFamily: theme.title(c).fontFamily }}>
          {words.map((w, k) => (
            <span key={k} style={{ display: 'inline-block', marginRight: '0.28em', ...theme.title(c), ...(whole ? {} : late(p, k * 3).style) }}>{w}</span>
          ))}
        </div>
        {g.subtext && <div style={{ marginTop: 12, fontSize: bs(p, 38), ...theme.body(c), ...sub.style }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

function LowerThird(p: P) {
  const { g, c, theme } = p;
  const m = motion(p, 8);
  const slide = interpolate(Math.min(1, m.t), [0, 1], [-60, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: Math.round(c.height * BELOW_CAPTIONS), paddingLeft: '6%' }}>
      <div style={{ padding: '18px 32px', maxWidth: '84%', ...theme.card(c), ...m.style, translate: `${slide}px 0` }}>
        <div style={{ fontSize: ts(p, 54), lineHeight: 1.15, ...theme.title(c) }}>{g.text}</div>
        {g.subtext && <div style={{ fontSize: bs(p, 36), marginTop: 4, ...theme.body(c) }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

function Counter(p: P) {
  const { g, c, theme, f } = p;
  const parsed = parseCount(g.text);
  const countFrames = Math.min(Math.round(COUNTER_SEC * c.fps), Math.round(g.durationFrames * 0.7));
  const k = interpolate(f, [0, countFrames], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const m = motion(p);
  // One soft swell when the number lands (none in pixel art: it just lands).
  const landed = theme.step > 1 ? 0 : interpolate(c.frame, [countFrames, countFrames + 5, countFrames + 12], [0, 1, 0], clamp);
  const shown = parsed ? `${parsed.prefix}${formatCount(parsed.value * k, parsed.decimals, parsed.commas)}${parsed.suffix}` : g.text;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '20%' }}>
      <div style={{ textAlign: 'center', ...m.style }}>
        <div style={{ fontSize: ts(p, 200), lineHeight: 1, fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.08 * landed})`, ...theme.number(c) }}>{shown}</div>
        {g.subtext && <div style={{ marginTop: 14, fontSize: bs(p, 46), ...theme.body(c), textShadow: '0 4px 16px rgba(0,0,0,0.7)' }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

function List(p: P) {
  const { g, c, theme } = p;
  const m = motion(p, 8);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '15%' }}>
      <div style={{ width: '82%', padding: '30px 38px', ...theme.card(c), ...m.style }}>
        {g.text && <div style={{ fontSize: ts(p, 52), marginBottom: 16, ...theme.title(c) }}>{g.text}</div>}
        {g.items.map((item, k) => {
          const at = Math.round((LIST_FIRST_SEC + k * LIST_STEP_SEC) * c.fps);
          const it = late(p, at);
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 22, margin: '14px 0', ...it.style, opacity: c.frame >= at ? it.style.opacity : 0 }}>
              <theme.Marker c={c} k={k} t={Math.min(1, it.t)} />
              <span style={{ fontSize: bs(p, 46), lineHeight: 1.15, ...theme.body(c) }}>{item}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

const LABEL_HEIGHT = 90;

function Callout(p: P) {
  const { g, c, theme } = p;
  // A style that shows the footage in a window points inside the window.
  const { x, y } = pointInFrame(theme, g.focusX, g.focusY, c.width, c.height);
  const ring = Math.min(1, enterProgress(theme.entrance === 'step' ? 'step' : 'pop', p.f, c.fps));
  const out = exitProgress(c.frame, g.durationFrames);
  const { top: labelTop, above } = calloutLabel(y, c.height, LABEL_HEIGHT);
  const stemFrom = above ? y - 100 : y + 100;
  const stemTo = above ? labelTop + LABEL_HEIGHT : labelTop;
  const line = interpolate(p.f, [4, 12], [0, 1], clamp);
  const label = late(p, 10);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <svg width={c.width} height={c.height} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <theme.Ring c={c} x={x} y={y} r={95} t={ring} />
        <line x1={x} y1={stemFrom} x2={x} y2={stemFrom + (stemTo - stemFrom) * line} stroke={c.accent} strokeWidth={7} strokeLinecap={theme.step > 1 ? 'butt' : 'round'} />
      </svg>
      {g.text && (
        <div style={{ position: 'absolute', left: Math.min(Math.max(x, 260), c.width - 260), top: labelTop, height: LABEL_HEIGHT, transform: 'translateX(-50%)' }}>
          <div style={{ height: LABEL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', padding: '0 28px', whiteSpace: 'nowrap', ...theme.card(c), ...label.style }}>
            <span style={{ fontSize: ts(p, 44), ...theme.title(c) }}>{g.text}</span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}

function Cta(p: P) {
  const { g, c, theme } = p;
  const m = motion(p);
  // A slow ring breathes around the card instead of the whole thing bouncing.
  const halo = (stepped(c.frame, theme.step) % 36) / 36;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: Math.round(c.height * BELOW_CAPTIONS) }}>
      <div style={{ textAlign: 'center', ...m.style }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 20, padding: '24px 48px', ...theme.card(c) }}>
          <div style={{ position: 'absolute', inset: -12 - 18 * halo, border: `4px solid ${c.accent}`, borderRadius: 'inherit', opacity: (1 - halo) * 0.7 }} />
          <theme.Marker c={c} k={0} t={1} />
          <span style={{ fontSize: ts(p, 56), ...theme.title(c) }}>{g.text}</span>
        </div>
        {g.subtext && <div style={{ marginTop: 18, fontSize: bs(p, 40), ...theme.body(c), textShadow: '0 4px 14px rgba(0,0,0,0.6)' }}>{g.subtext}</div>}
      </div>
    </AbsoluteFill>
  );
}

const STAGE = 470;

/** An illustration on the style's own disc (or tile), with its label on the style's card. */
function Visual(p: P) {
  const { g, c, theme } = p;
  const art = g.visual ? VISUALS[g.visual] : undefined;
  if (!art) return null;
  const uid = `s${g.startFrame}-${g.visual}`;
  const m = motion(p, 7);
  const label = late(p, 6);
  const st = theme.stage;
  const square = st.shape === 'square';
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-start', paddingTop: '8%' }}>
      <div data-visual={g.visual} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...m.style }}>
        <svg viewBox="0 0 400 400" width={STAGE} height={STAGE} style={{ overflow: 'visible', filter: `${st.glow ? `drop-shadow(0 0 26px ${st.glow}) ` : ''}drop-shadow(0 18px 30px rgba(0,0,0,0.45))` }}>
          <defs>
            <radialGradient id={`${uid}-disc`} cx="0.5" cy="0.38" r="0.7">
              <stop offset="0" stopColor={st.fill[0]} />
              <stop offset="1" stopColor={st.fill[1]} />
            </radialGradient>
            <clipPath id={`${uid}-stage`}>{square ? <rect x={14} y={14} width={372} height={372} rx={theme.step > 1 ? 0 : 36} /> : <circle cx={200} cy={200} r={186} />}</clipPath>
          </defs>
          {square ? (
            <rect x={14} y={14} width={372} height={372} rx={theme.step > 1 ? 0 : 36} fill={`url(#${uid}-disc)`} stroke={st.ring} strokeWidth={st.ringWidth} />
          ) : (
            <circle cx={200} cy={200} r={186} fill={`url(#${uid}-disc)`} stroke={st.ring} strokeWidth={st.ringWidth} />
          )}
          <g clipPath={`url(#${uid}-stage)`}>{art({ frame: p.f, fps: c.fps, accent: c.accent, uid })}</g>
        </svg>
        {g.text && (
          <div style={{ marginTop: -10, padding: '12px 32px', whiteSpace: 'nowrap', ...theme.card(c), ...label.style }}>
            <span style={{ fontSize: ts(p, 42), ...theme.title(c) }}>{g.text}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/** A plain chart on the style's card, for styles without a Chart of their own. */
function DefaultChart({ c, theme, bars }: { c: Ctx; theme: StyleTheme; bars: ChartBar[] }) {
  const max = Math.max(1e-9, ...bars.map((b) => b.value));
  const [a, b2] = theme.colors;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: 440 }}>
      {bars.map((b, k) => (
        <div key={k} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 34, whiteSpace: 'nowrap', opacity: b.grow > 0.6 ? 1 : 0, ...theme.title(c), color: c.accent }}>{b.text}</div>
          <div style={{ width: '100%', height: `${(b.value / max) * 74 * b.grow}%`, marginTop: 8, borderRadius: theme.step > 1 ? 0 : 10, background: k === bars.length - 1 ? c.accent : k % 2 ? b2 : a }} />
          <div style={{ marginTop: 10, fontSize: 28, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...theme.body(c) }}>{b.label}</div>
        </div>
      ))}
    </div>
  );
}

/** A bar chart: the title, then one bar per item growing in turn (sounds land on each bar). */
function Chart(p: P) {
  const { g, c, theme } = p;
  const m = motion(p, 8);
  const bars: ChartBar[] = chartBars(g.items).map((b, k) => {
    const at = Math.round((CHART_FIRST_SEC + k * CHART_STEP_SEC) * c.fps);
    return { ...b, grow: interpolate(p.f - at, [0, CHART_GROW_SEC * c.fps], [0, 1], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) }) };
  });
  if (!bars.length) return null;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '11%' }}>
      <div style={{ width: '86%', padding: '28px 34px', boxSizing: 'border-box', ...theme.card(c), ...m.style }}>
        {g.text && <div style={{ fontSize: ts(p, 50), marginBottom: 16, lineHeight: 1.1, ...theme.title(c) }}>{g.text}</div>}
        {theme.Chart ? <theme.Chart c={c} bars={bars} t={Math.min(1, m.t)} /> : <DefaultChart c={c} theme={theme} bars={bars} />}
      </div>
    </AbsoluteFill>
  );
}

const RENDERERS: Record<Graphic['type'], (p: P) => ReactNode> = {
  slam: Slam,
  pill: Pill,
  headline: Headline,
  lower_third: LowerThird,
  counter: Counter,
  list: List,
  callout: Callout,
  cta: Cta,
  visual: Visual,
  chart: Chart,
};

/** One graphic in a style; place it inside a Sequence that starts at its startFrame. */
export function StyledGraphic({ g, theme, accent, fonts }: { g: Graphic; theme: StyleTheme; accent: string; fonts: StyleFonts }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const Render = RENDERERS[g.type] ?? Pill;
  const c: Ctx = { frame, fps, accent, fonts, width, height };
  return <>{Render({ g, c, theme, f: stepped(frame, theme.step) })}</>;
}
