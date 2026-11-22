import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import type { CaptionPage } from '../../types';
import { HOOK_LINE_H, hookPath } from './hook-path';

/**
 * The "Remotion Reel" editing skill's pieces, ported from the skill's own components (Caption.tsx,
 * TextHook.tsx, TwoThirdsPanel.tsx) and its rules (captions.md, text-hook.md, layouts.md):
 *   - ReelCaptions: the outlined TikTok caption. Inter 800, 78 px, letter spacing -2, white fill with a
 *     10 px black SVG stroke painted behind it. A line appears and disappears with its words: no pop,
 *     no motion. SVG stroke, never -webkit-text-stroke (that fills the counters of a and o).
 *   - TextHook: Instagram's native text sticker. Inter 600, ONE outline traced round all the lines so
 *     inside corners flare outward instead of pinching. Still, on screen from the first frame.
 *   - TwoThirdsPanel: the take in a full-width panel with big rounded top corners (layout 4b).
 * Sizes are for a 1080 x 1920 frame.
 */

const inter = loadInter('normal', { weights: ['600', '800'], subsets: ['latin'] });
export const INTER = inter.fontFamily;

const W = 1080;
const H = 1920;

/** The skill keeps everything that matters inside x 90-990 and the Instagram 4:5 band y 285-1635. */
export const SAFE = { left: 90, right: 990, top: 285, bottom: 1635 } as const;

// ---- captions

/**
 * Caption baseline when the take is not measured. The skill measures the chin and the mic per take and
 * never puts the line on the chin; until edits carry that measurement, the line sits low (70% of the
 * height), below the chin of a typical talking head and still inside the IG band.
 */
export const CAPTION_BASELINE = 1340;

export function ReelCaptionLine({ words, y = CAPTION_BASELINE, accent, light = false, size = 78 }: {
  words: { text: string; emphasis?: boolean }[];
  y?: number;
  accent?: string;
  /** Light ground behind the line: black text with a white outline. */
  light?: boolean;
  size?: number;
}) {
  const fill = light ? '#000' : '#fff';
  const stroke = light ? '#fff' : '#000';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <text x={W / 2} y={y} textAnchor="middle" style={{ paintOrder: 'stroke' }}>
        {words.map((w, i) => (
          <tspan
            key={i}
            fontFamily={INTER}
            fontWeight={800}
            fontSize={size}
            letterSpacing={-2}
            fill={w.emphasis && accent ? accent : fill}
            stroke={stroke}
            strokeWidth={size * (10 / 78)}
            strokeLinejoin="round"
          >
            {(i > 0 ? ' ' : '') + w.text}
          </tspan>
        ))}
      </text>
    </svg>
  );
}

/** Rough ink width of a caption line (Inter 800 at 78 px averages ~0.56 em per glyph, minus the -2 tracking). */
const approxWidth = (text: string, size: number) => text.length * (size * 0.56 - 2);

/** The edit's caption pages in the skill's look. When pages overlap, the newest one wins. */
export function ReelCaptions({ pages, accent, y }: { pages: CaptionPage[]; accent: string; y?: number }) {
  const frame = useCurrentFrame();
  let page: CaptionPage | null = null;
  for (const p of pages) if (frame >= p.startFrame && frame < p.endFrame) page = p;
  if (!page) return null;
  const text = page.words.map((w) => w.text).join(' ');
  // Keep the line inside the safe width: shrink it rather than let it run off the sides.
  const size = Math.min(78, Math.floor((78 * (SAFE.right - SAFE.left)) / Math.max(1, approxWidth(text, 78))));
  return (
    <AbsoluteFill data-captions="remotion-reel">
      <ReelCaptionLine words={page.words} accent={accent} y={y} size={size} />
    </AbsoluteFill>
  );
}

// ---- the text hook

export type HookVariant = 'white' | 'black' | 'plain';
export const HOOK_FONT_SIZE = 78;
export const HOOK_PAD_X = 22;
/** Each hook line stays under ~880 px wide. */
const HOOK_MAX_LINE = 880;

/** Ink width of a line in the hook font, measured on a canvas once the font has loaded. */
const measure = (text: string, size: number) => {
  if (typeof document === 'undefined') return text.length * size * 0.52;
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * size * 0.52;
  ctx.font = `600 ${size}px ${INTER}`;
  return ctx.measureText(text).width - text.length; // letter spacing -1 px per glyph
};

/**
 * The skill measures each line's box width off a render (scripts/measure-hook.py). In the product the
 * same measurement is taken in the page with the real font; the render waits for it.
 */
function useHookLayout(lines: string[]) {
  const key = lines.join('\n');
  const [layout, setLayout] = useState<{ widths: number[]; size: number } | null>(null);
  const handle = useRef<number | null>(null);
  if (handle.current === null) handle.current = delayRender('Measuring the text hook');
  useEffect(() => {
    let live = true;
    const done = () => {
      if (handle.current !== null && handle.current !== -1) {
        continueRender(handle.current);
        handle.current = -1;
      }
    };
    inter
      .waitUntilDone()
      .catch(() => undefined)
      .then(() => {
        const raw = key.split('\n').map((l) => measure(l, HOOK_FONT_SIZE));
        const widest = Math.max(1, ...raw);
        const size = widest > HOOK_MAX_LINE ? Math.floor((HOOK_FONT_SIZE * HOOK_MAX_LINE) / widest) : HOOK_FONT_SIZE;
        const scale = size / HOOK_FONT_SIZE;
        if (live) setLayout({ widths: raw.map((w) => Math.ceil(w * scale) + 2 * HOOK_PAD_X), size });
        done();
      });
    return () => {
      live = false;
      done();
    };
  }, [key]);
  return layout;
}

export function TextHook({ lines, variant = 'white', top = 300, cx = W / 2 }: { lines: string[]; variant?: HookVariant; top?: number; cx?: number }) {
  const layout = useHookLayout(lines);
  if (!layout || !lines.length) return null;
  const { widths, size } = layout;
  const lineH = Math.round(HOOK_LINE_H * (size / HOOK_FONT_SIZE));
  const fill = variant === 'white' ? '#fff' : variant === 'black' ? '#000' : null;
  const ink = variant === 'white' ? '#000' : '#fff';
  if (variant === 'plain') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} data-hook="plain">
        {lines.map((t, i) => (
          <text
            key={`${i}-${t}`}
            x={cx}
            y={top + i * lineH + size}
            textAnchor="middle"
            fontFamily={INTER}
            fontWeight={600}
            fontSize={size}
            letterSpacing={-1}
            fill="#fff"
            stroke="#000"
            strokeWidth={10}
            strokeLinejoin="round"
            style={{ paintOrder: 'stroke' }}
          >
            {t}
          </text>
        ))}
      </svg>
    );
  }
  return (
    <AbsoluteFill data-hook={variant}>
      {fill && (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={hookPath(widths, cx, top, lineH)} fill={fill} />
        </svg>
      )}
      {lines.map((t, i) => (
        <div
          key={`${i}-${t}`}
          style={{
            position: 'absolute',
            top: top + i * lineH,
            left: cx - W / 2,
            width: W,
            height: lineH,
            paddingTop: Math.round(6 * (size / HOOK_FONT_SIZE)),
            boxSizing: 'border-box',
            textAlign: 'center',
            color: ink,
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: size,
            lineHeight: 1.15,
            letterSpacing: -1,
            whiteSpace: 'nowrap',
          }}
        >
          {t}
        </div>
      ))}
    </AbsoluteFill>
  );
}

// ---- the two-thirds panel (layout 4b)

export const PANEL_TOP = 1165;
export const PANEL_R = 110;
export const PANEL_CAPTION_Y = PANEL_TOP - 35;
const panelPath = `M0 ${H} L0 ${PANEL_TOP + PANEL_R} Q0 ${PANEL_TOP} ${PANEL_R} ${PANEL_TOP} L${W - PANEL_R} ${PANEL_TOP} Q${W} ${PANEL_TOP} ${W} ${PANEL_TOP + PANEL_R} L${W} ${H} Z`;

/** The take sits 1:1 in the panel, shifted so its head lands just under the panel edge. */
export function TwoThirdsPanel({ children, shiftY = 0 }: { children: ReactNode; shiftY?: number }) {
  return (
    <AbsoluteFill style={{ filter: 'drop-shadow(0 -8px 24px rgba(0,0,0,0.28))' }}>
      <AbsoluteFill style={{ clipPath: `path('${panelPath}')` }}>
        <AbsoluteFill style={{ transform: `translateY(${shiftY}px)` }}>{children}</AbsoluteFill>
        <div style={{ position: 'absolute', left: 0, right: 0, top: PANEL_TOP, height: 40, background: 'linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0))' }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
