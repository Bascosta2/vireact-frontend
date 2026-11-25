import { Fragment, type CSSProperties } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { textOn } from './brand';
import { DISPLAY, FONT } from './fonts';
import { useCaptionCenter } from './graphics-utils';
import type { CaptionPage, CaptionPreset } from './types';

/**
 * Captions: 2-3 words at a time on one line, centered just below the middle of the frame (clear of
 * the speaker's face and of the apps' buttons at the bottom). The whole phrase appears at once and
 * holds still; nothing follows the spoken word. Emphasis words take the accent color.
 */

/** The line never gets wider than this share of the frame; long phrases shrink to fit. */
const MAX_WIDTH = 0.86;

interface Look {
  box: CSSProperties;
  /** Font size before any shrink-to-fit. */
  size: number;
  /** Average glyph width as a share of the font size, for shrink-to-fit. */
  glyph: number;
  word: (emphasis: boolean, accent: string) => CSSProperties;
}

const outline = (px: number): CSSProperties => ({ WebkitTextStroke: `${px}px #000`, paintOrder: 'stroke fill', textShadow: '0 6px 20px rgba(0,0,0,0.6)' });

const LOOKS: Record<CaptionPreset, Look> = {
  bold_pop: {
    box: { fontFamily: FONT, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -0.5, ...outline(8) },
    size: 78,
    glyph: 0.74,
    word: (emphasis, accent) => ({ color: emphasis ? accent : '#fff' }),
  },
  highlight: {
    box: { fontFamily: FONT, fontWeight: 900, textTransform: 'uppercase' },
    size: 72,
    glyph: 0.8,
    // Emphasis words sit in a colored box; the box stays put for as long as the phrase shows.
    word: (emphasis, accent) =>
      emphasis
        ? { display: 'inline-block', padding: '0.02em 0.2em', borderRadius: 14, background: accent, color: textOn(accent) }
        : { color: '#fff', ...outline(8) },
  },
  impact: {
    box: { fontFamily: DISPLAY, textTransform: 'uppercase', letterSpacing: 2, ...outline(8) },
    size: 136,
    glyph: 0.5,
    word: (emphasis, accent) => ({ color: emphasis ? accent : '#fff' }),
  },
  clean: {
    box: { fontFamily: FONT, fontWeight: 800, background: 'rgba(8,10,18,0.74)', borderRadius: 22, padding: '14px 34px' },
    size: 60,
    glyph: 0.64,
    word: (emphasis, accent) => ({ color: emphasis ? accent : '#fff' }),
  },
};

export function Captions({ pages, preset, accent }: { pages: CaptionPage[]; preset: CaptionPreset; accent: string }) {
  const frame = useCurrentFrame();
  const captionCenter = useCaptionCenter();
  const { fps, width, height } = useVideoConfig();
  const page = pages.find((p) => frame >= p.startFrame && frame < p.endFrame);
  if (!page) return null;

  // Edits saved with a look that no longer exists (karaoke) play as the default.
  const look = LOOKS[preset] ?? LOOKS.bold_pop;
  const chars = page.words.reduce((n, w) => n + w.text.length, 0) + page.words.length - 1;
  const size = Math.min(look.size, Math.floor((width * MAX_WIDTH) / (Math.max(1, chars) * look.glyph)));
  // The phrase settles in over a few frames: a small scale-up with no bounce and no fade.
  const enter = spring({ frame: frame - page.startFrame, fps, config: { damping: 22, stiffness: 300, mass: 0.5 }, durationInFrames: 6 });
  return (
    <AbsoluteFill>
      <div
        data-captions={look === LOOKS[preset] ? preset : 'bold_pop'}
        style={{
          position: 'absolute',
          left: '50%',
          top: Math.round(height * captionCenter),
          transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * enter})`,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          lineHeight: 1.15,
          fontSize: size,
          ...look.box,
        }}
      >
        {page.words.map((w, k) => (
          <Fragment key={`${w.i}-${k}`}>
            <span style={look.word(w.emphasis, accent)}>{w.text}</span>
            {k === page.words.length - 1 ? null : ' '}
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
}
