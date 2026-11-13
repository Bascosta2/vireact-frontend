import { Fragment, type CSSProperties } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { DISPLAY, FONT } from './fonts';
import type { CaptionPage, CaptionPreset, CaptionWord } from './types';

const STROKE: CSSProperties = { WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.6)' };

function Word({ w, preset, frame, fps, accent, last }: { w: CaptionWord; preset: CaptionPreset; frame: number; fps: number; accent: string; last: boolean }) {
  const active = frame >= w.startFrame && frame < w.endFrame;
  const spoken = frame >= w.endFrame;
  const pop = active ? spring({ frame: frame - w.startFrame, fps, config: { damping: 12, stiffness: 220 }, durationInFrames: 8 }) : 0;
  let style: CSSProperties;
  if (preset === 'clean') {
    style = { color: w.emphasis ? accent : '#fff', opacity: spoken || active ? 1 : 0.85 };
  } else if (preset === 'karaoke') {
    style = { color: spoken || active ? (w.emphasis ? accent : '#7CF29A') : '#fff' };
  } else if (preset === 'highlight') {
    // The spoken word sits in an accent box that pops in.
    style = {
      display: 'inline-block',
      margin: '0 0.04em',
      padding: '0 0.18em',
      borderRadius: 14,
      color: active ? '#0a0a0f' : w.emphasis ? accent : '#fff',
      background: active ? accent : 'transparent',
      transform: active ? `scale(${1 + 0.08 * pop}) rotate(${-2 + 2 * pop}deg)` : 'none',
      ...(active ? {} : STROKE),
    };
  } else {
    // bold_pop and impact: the spoken word pops, emphasis words take the accent color.
    style = {
      display: 'inline-block',
      margin: '0 0.07em',
      color: w.emphasis ? accent : '#fff',
      transform: active ? `scale(${1 + (preset === 'impact' ? 0.2 : 0.12) * pop})` : 'scale(1)',
    };
  }
  return (
    <Fragment>
      <span style={style}>{w.text}</span>
      {last ? null : ' '}
    </Fragment>
  );
}

/** Word-timed captions in five looks. */
export function Captions({ pages, preset, accent }: { pages: CaptionPage[]; preset: CaptionPreset; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const page = pages.find((p) => frame >= p.startFrame && frame < p.endFrame);
  if (!page) return null;

  const enter = spring({ frame: frame - page.startFrame, fps, config: { damping: 14, stiffness: 200 }, durationInFrames: 8 });
  let box: CSSProperties;
  let bottom = '24%';
  if (preset === 'clean') {
    box = { background: 'rgba(0,0,0,0.55)', borderRadius: 18, padding: '14px 26px', fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.25 };
  } else if (preset === 'impact') {
    // One big word at a time, a little above center.
    box = { fontFamily: DISPLAY, fontSize: 150, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1, ...STROKE, WebkitTextStroke: '6px #000', transform: `scale(${0.7 + 0.3 * enter})` };
    bottom = '34%';
  } else if (preset === 'highlight') {
    box = { fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1.3, textTransform: 'uppercase', ...STROKE };
  } else {
    box = { fontFamily: FONT, fontWeight: 900, fontSize: 76, lineHeight: 1.15, textTransform: 'uppercase', ...STROKE };
  }
  const opacity = preset === 'impact' ? 1 : interpolate(enter, [0, 1], [0.4, 1]);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom }}>
      <div style={{ maxWidth: '88%', textAlign: 'center', opacity, ...box }}>
        {page.words.map((w, k) => (
          <Word key={`${w.i}-${k}`} w={w} preset={preset} frame={frame} fps={fps} accent={accent} last={k === page.words.length - 1} />
        ))}
      </div>
    </AbsoluteFill>
  );
}
