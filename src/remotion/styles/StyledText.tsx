import { Fragment } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { CAPTION_CENTER } from '../graphics-utils';
import type { CaptionPage } from '../types';
import type { StyleFonts } from './fonts';
import { enterProgress, enterStyle, exitProgress } from './motion';
import { stepped, type Ctx, type StyleTheme } from './theme';

/** The line never gets wider than this share of the frame; long phrases shrink to fit. */
const MAX_WIDTH = 0.86;

/**
 * Captions in a style: the same pages and timing as the standard captions (one line, centered just
 * below the middle, the newest page wins when two overlap), drawn in the style's look and entrance.
 */
export function StyledCaptions({ pages, theme, accent, fonts }: { pages: CaptionPage[]; theme: StyleTheme; accent: string; fonts: StyleFonts }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  let page: CaptionPage | null = null;
  for (const p of pages) if (frame >= p.startFrame && frame < p.endFrame) page = p;
  if (!page) return null;

  const local = frame - page.startFrame;
  const c: Ctx = { frame: local, fps, accent, fonts, width, height };
  const look = theme.caption;
  const chars = page.words.reduce((n, w) => n + w.text.length, 0) + page.words.length - 1;
  const size = Math.min(look.size, Math.floor((width * MAX_WIDTH) / (Math.max(1, chars) * look.glyph)));
  const t = enterProgress(look.entrance, stepped(local, theme.step), fps, 2);
  return (
    <AbsoluteFill data-captions={theme.id}>
      <div style={{ position: 'absolute', left: '50%', top: Math.round(height * CAPTION_CENTER), transform: 'translate(-50%, -50%)' }}>
        <div style={{ whiteSpace: 'nowrap', textAlign: 'center', lineHeight: 1.15, ...look.box(c), fontSize: size, ...enterStyle(look.entrance, t, 0, local) }}>
          {page.words.map((w, k) => {
            // Kinetic styles bring each word in on its own, at the moment it is said.
            const at = look.stagger ? (w.endFrame > w.startFrame ? Math.max(0, w.startFrame - page.startFrame) : k * 4) : 0;
            const ws = look.stagger ? enterStyle(look.entrance, enterProgress(look.entrance, stepped(local - at, theme.step), fps, 2), 0, local - at) : null;
            return (
              <Fragment key={`${w.i}-${k}`}>
                <span style={{ ...look.word(w.emphasis, c), ...(ws ? { display: 'inline-block', ...ws, opacity: local >= at ? ws.opacity : 0 } : {}) }}>{w.text}</span>
                {k === page.words.length - 1 ? null : ' '}
              </Fragment>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Letters per frame of the typewriter hook. */
const TYPE_RATE = 1.4;

/** The text hook in a style, on screen from the first frame. Place it inside the hook's Sequence. */
export function StyledHook({ lines, durationFrames, theme, accent, fonts }: { lines: string[]; durationFrames: number; theme: StyleTheme; accent: string; fonts: StyleFonts }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const c: Ctx = { frame, fps, accent, fonts, width, height };
  const h = theme.hook;
  const f = stepped(frame, theme.step);
  const t = enterProgress(h.entrance, f, fps);
  const out = exitProgress(frame, durationFrames, 6);
  // The typewriter keeps every letter in place (unshown ones are transparent) so the card never resizes.
  let budget = h.typewriter ? Math.floor(f * TYPE_RATE) : Infinity;
  const left = h.align === 'left';
  // The card's own transform (a comic tilt) stays under the entrance motion.
  const box = h.box(c);
  const enter = enterStyle(h.entrance, t, out, frame);
  return (
    <AbsoluteFill
      data-hook={theme.id}
      style={{ justifyContent: 'flex-start', alignItems: left ? 'flex-start' : 'center', paddingTop: Math.round(height * h.top), paddingLeft: left ? '7%' : 0 }}
    >
      <div style={{ position: 'relative', maxWidth: '86%', textAlign: left ? 'left' : 'center', ...box, ...enter, transform: [enter.transform, box.transform].filter(Boolean).join(' ') || undefined }}>
        {lines.map((line, k) => {
          const shown = Math.max(0, Math.min(line.length, budget));
          budget -= line.length;
          return (
            <div key={`${k}-${line}`} style={h.text(c)}>
              {line.slice(0, shown)}
              {shown < line.length && <span style={{ color: 'transparent', textShadow: 'none', WebkitTextStroke: '0' }}>{line.slice(shown)}</span>}
            </div>
          );
        })}
        {h.Decor && <h.Decor c={c} t={Math.min(1, t)} durationFrames={durationFrames} />}
      </div>
    </AbsoluteFill>
  );
}
