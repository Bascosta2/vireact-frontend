import { Fragment, type CSSProperties } from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CaptionPage, CaptionPreset, EditProps } from './types';

/**
 * One AI edit: the creator's own footage cut into the planned order, framed for 9:16, with zooms,
 * word captions, a hook overlay, text overlays, music (ducked under speech) and sound effects.
 * Same component for the browser preview and the Lambda render, so what they see is what they get.
 */

const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';
const HEAVY = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
const EMPHASIS = '#FFD43B';
const EASE_FRAMES = 6;

/** Scale and transform origin for the zoom active at this frame (eased in and out). */
function zoomAt(frame: number, zooms: EditProps['zooms']) {
  for (const z of zooms) {
    const end = z.startFrame + z.durationFrames;
    if (frame < z.startFrame || frame >= end) continue;
    const ramp = Math.min(EASE_FRAMES, Math.floor(z.durationFrames / 2));
    const t = interpolate(frame, [z.startFrame, z.startFrame + ramp, end - ramp, end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return { scale: 1 + (z.scale - 1) * t, origin: `${z.focusX * 100}% ${z.focusY * 100}%` };
  }
  return { scale: 1, origin: '50% 50%' };
}

function Footage({ videoUrl, timeline, framing, fps }: Pick<EditProps, 'videoUrl' | 'timeline' | 'framing' | 'fps'>) {
  const fill: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${framing.focusX * 100}% 50%` };
  return (
    <>
      {timeline.map((p) => (
        <Sequence key={p.id} from={p.outStartFrame} durationInFrames={p.durationFrames} layout="none">
          {framing.mode === 'fit_blur' ? (
            <AbsoluteFill>
              <AbsoluteFill style={{ filter: 'blur(40px) brightness(0.6)', transform: 'scale(1.15)' }}>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </AbsoluteFill>
              <AbsoluteFill>
                <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </AbsoluteFill>
            </AbsoluteFill>
          ) : (
            <AbsoluteFill>
              <OffthreadVideo src={videoUrl} trimBefore={Math.round(p.srcStart * fps)} style={fill} />
            </AbsoluteFill>
          )}
        </Sequence>
      ))}
    </>
  );
}

function wordStyle(preset: CaptionPreset, active: boolean, spoken: boolean, emphasis: boolean, pop: number): CSSProperties {
  if (preset === 'clean') {
    return { color: emphasis ? EMPHASIS : '#fff', opacity: spoken || active ? 1 : 0.85 };
  }
  if (preset === 'karaoke') {
    return { color: spoken || active ? (emphasis ? EMPHASIS : '#7CF29A') : '#fff', transition: 'none' };
  }
  // bold_pop: the spoken word pops, emphasis words are yellow.
  return {
    color: emphasis ? EMPHASIS : '#fff',
    display: 'inline-block',
    // Room for the 12% pop so the active word never covers the space next to it.
    margin: '0 0.07em',
    transform: active ? `scale(${1 + 0.12 * pop})` : 'scale(1)',
  };
}

function Captions({ pages, preset }: { pages: CaptionPage[]; preset: CaptionPreset }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const page = pages.find((p) => frame >= p.startFrame && frame < p.endFrame);
  if (!page) return null;
  const isClean = preset === 'clean';
  const box: CSSProperties = isClean
    ? { background: 'rgba(0,0,0,0.55)', borderRadius: 18, padding: '14px 26px', fontFamily: FONT, fontWeight: 700, fontSize: 58, lineHeight: 1.25 }
    : { fontFamily: HEAVY, fontWeight: 900, fontSize: 76, lineHeight: 1.15, textTransform: 'uppercase', WebkitTextStroke: '3px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.55)' };
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '24%' }}>
      <div style={{ maxWidth: '86%', textAlign: 'center', ...box }}>
        {page.words.map((w, k) => {
          const active = frame >= w.startFrame && frame < w.endFrame;
          const spoken = frame >= w.endFrame;
          const pop = active ? spring({ frame: frame - w.startFrame, fps, config: { damping: 12, stiffness: 220 }, durationInFrames: 8 }) : 0;
          return (
            // The space sits between word boxes: inside an inline-block it would be dropped.
            <Fragment key={`${w.i}-${k}`}>
              <span style={wordStyle(preset, active, spoken, w.emphasis, pop)}>{w.text}</span>
              {k < page.words.length - 1 ? ' ' : null}
            </Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

function HookOverlay({ text, durationFrames }: { text: string; durationFrames: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 180 } });
  const exit = interpolate(frame, [durationFrames - 6, durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '14%' }}>
      <div
        style={{
          maxWidth: '84%',
          background: '#fff',
          color: '#0a0a0f',
          fontFamily: HEAVY,
          fontWeight: 900,
          fontSize: 62,
          lineHeight: 1.15,
          textAlign: 'center',
          padding: '18px 30px',
          borderRadius: 16,
          transform: `scale(${0.85 + 0.15 * enter})`,
          opacity: Math.min(enter, exit),
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}

function TextOverlay({ text, position, durationFrames }: { text: string; position: 'top' | 'center' | 'bottom'; durationFrames: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 5, durationFrames - 5, durationFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const justify = position === 'top' ? 'flex-start' : position === 'center' ? 'center' : 'flex-end';
  return (
    <AbsoluteFill style={{ justifyContent: justify, alignItems: 'center', padding: position === 'top' ? '30% 0 0' : position === 'bottom' ? '0 0 44%' : 0 }}>
      <div style={{ opacity, background: 'rgba(10,10,15,0.78)', color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 52, padding: '10px 24px', borderRadius: 12, maxWidth: '82%', textAlign: 'center' }}>{text}</div>
    </AbsoluteFill>
  );
}

export function EditComposition(props: EditProps) {
  const frame = useCurrentFrame();
  const { scale, origin } = zoomAt(frame, props.zooms);
  const music = props.music;
  const ducked = (f: number) => music?.duck.some((r) => f >= r.startFrame - 3 && f < r.endFrame + 3) ?? false;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        <Footage videoUrl={props.videoUrl} timeline={props.timeline} framing={props.framing} fps={props.fps} />
      </AbsoluteFill>

      {props.overlays.map((o, k) => (
        <Sequence key={`o${k}`} from={o.startFrame} durationInFrames={o.durationFrames} layout="none">
          <TextOverlay text={o.text} position={o.position} durationFrames={o.durationFrames} />
        </Sequence>
      ))}

      {props.captions && props.captions.pages.length > 0 && <Captions pages={props.captions.pages} preset={props.captions.preset} />}

      {props.hook && (
        <Sequence from={props.hook.startFrame} durationInFrames={props.hook.durationFrames} layout="none">
          <HookOverlay text={props.hook.text} durationFrames={props.hook.durationFrames} />
        </Sequence>
      )}

      {music && props.musicUrl && (
        <Audio
          src={props.musicUrl}
          loop
          volume={(f) => {
            const fadeOut = interpolate(f, [props.durationInFrames - 20, props.durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return music.volume * (ducked(f) ? 0.45 : 1) * fadeOut;
          }}
        />
      )}

      {props.sfx.map((s, k) =>
        props.sfxUrls[s.type] ? (
          <Sequence key={`s${k}`} from={s.frame} durationInFrames={Math.round(props.fps * 2)} layout="none">
            <Audio src={props.sfxUrls[s.type] as string} volume={0.55} />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
}
