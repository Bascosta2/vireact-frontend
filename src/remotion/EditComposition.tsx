import type { CSSProperties } from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions } from './Captions';
import { Footage } from './Footage';
import { pieceIndexAt } from './timeline-utils';
import { GraphicLayer } from './Graphics';
import { FONT } from './fonts';
import type { EditProps, Grade, Graphic, Look, SfxType } from './types';

/**
 * One AI edit: the creator's own footage cut into the planned order and framed for 9:16, with
 * jump-cut zooms, punch-ins, a slow push-in, transitions at every segment jump, shake and flash
 * effects, a color grade, animated graphics, word captions, a hook overlay, a progress bar, music
 * (ducked under speech) and sound effects. The same component plays in the browser preview and the
 * Lambda render, so what the creator sees is what they get.
 */

const EASE_FRAMES = 6;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const GRADE_FILTER: Record<Grade, string> = {
  vivid: 'saturate(1.28) contrast(1.08) brightness(1.02)',
  warm: 'saturate(1.18) contrast(1.06) sepia(0.14) hue-rotate(-8deg)',
  cool: 'saturate(1.12) contrast(1.1) hue-rotate(10deg) brightness(1.02)',
  punchy_bw: 'grayscale(1) contrast(1.4) brightness(1.05)',
  none: 'none',
};
const DEFAULT_LOOK: Look = { grade: 'none', accent: '#FFD43B', progressBar: false, motion: false };

/** How long each built-in sound lasts (seconds), so an effect only holds an audio tag while it plays. */
const SFX_SECONDS: Record<SfxType, number> = {
  whoosh: 0.7, swoosh: 0.35, pop: 0.14, click: 0.05, ding: 1.4, sparkle: 1.0, boom: 1.6,
  hit: 0.45, riser: 1.5, bass_drop: 1.4, glitch: 0.45, shutter: 0.3, typing: 1.1, notify: 0.75,
};
/** Uploaded effects can run a little longer than the built-in ones. */
const SFX_TAIL_SEC = 0.4;

/** Scale and transform origin for the punch-in zoom active at this frame (eased in and out). */
function zoomAt(frame: number, zooms: EditProps['zooms']) {
  for (const z of zooms) {
    const end = z.startFrame + z.durationFrames;
    if (frame < z.startFrame || frame >= end) continue;
    const ramp = Math.min(EASE_FRAMES, Math.floor(z.durationFrames / 2));
    const t = interpolate(frame, [z.startFrame, z.startFrame + ramp, end - ramp, end], [0, 1, 1, 0], clamp);
    return { scale: 1 + (z.scale - 1) * t, origin: `${z.focusX * 100}% ${z.focusY * 100}%` };
  }
  return { scale: 1, origin: '50% 50%' };
}

/** Deterministic jitter in [-1, 1] for a frame (no Math.random: renders must be repeatable). */
const jitter = (frame: number, seed: number) => {
  const x = Math.sin(frame * 12.9898 + seed * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

/** What the transitions and effects do to the picture at this frame. */
function cameraAt(frame: number, transitions: NonNullable<EditProps['transitions']>, effects: NonNullable<EditProps['effects']>) {
  let scale = 1;
  let x = 0;
  let y = 0;
  let rotate = 0;
  let blur = 0;
  let flash = 0;
  let glitch = 0;
  for (const t of transitions) {
    const d = frame - t.frame;
    if (d < -2 || d >= 10) continue;
    if (t.type === 'punch' && d >= 0) {
      scale *= interpolate(d, [0, 8], [1.18, 1], clamp);
      blur = Math.max(blur, interpolate(d, [0, 4], [6, 0], clamp));
    } else if (t.type === 'whip') {
      x += d < 0 ? interpolate(d, [-2, 0], [0, -18], clamp) : interpolate(d, [0, 7], [32, 0], { ...clamp, easing: (v) => 1 - Math.pow(1 - v, 3) });
      // Zoomed in while sliding, so the edge of the frame never shows black.
      scale *= d < 0 ? 1.25 : interpolate(d, [0, 7], [1.45, 1], clamp);
      blur = Math.max(blur, d < 0 ? 10 : interpolate(d, [0, 6], [18, 0], clamp));
    } else if (t.type === 'flash') {
      flash = Math.max(flash, d < 0 ? 0.5 : interpolate(d, [0, 7], [0.95, 0], clamp));
    } else if (t.type === 'glitch' && d >= -1 && d < 7) {
      glitch = Math.max(glitch, 1 - Math.max(0, d) / 7);
    }
  }
  for (const e of effects) {
    const d = frame - e.frame;
    if (d < 0 || d >= 12) continue;
    if (e.type === 'shake') {
      const amp = interpolate(d, [0, 12], [34, 0], clamp);
      x += (jitter(frame, 1) * amp) / 10.8; // percent of width
      y += (jitter(frame, 2) * amp) / 19.2;
      rotate += jitter(frame, 3) * amp * 0.05;
      scale *= 1.04;
    } else if (e.type === 'flash') {
      flash = Math.max(flash, interpolate(d, [0, 6], [0.85, 0], clamp));
    }
  }
  if (glitch > 0) {
    x += jitter(frame, 4) * 3 * glitch;
  }
  return { scale, x, y, rotate, blur, flash, glitch };
}

/** Slices of shifted color for the glitch transition. */
function GlitchBars({ frame, strength, accent }: { frame: number; strength: number; accent: string }) {
  if (strength <= 0) return null;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const top = ((jitter(frame, 10 + k) + 1) / 2) * 92;
        const h = 2 + ((jitter(frame, 20 + k) + 1) / 2) * 7;
        const color = k % 3 === 0 ? 'rgba(255,0,80,0.55)' : k % 3 === 1 ? 'rgba(0,220,255,0.5)' : `${accent}88`;
        return <div key={k} style={{ position: 'absolute', left: `${jitter(frame, 30 + k) * 8 * strength}%`, right: 0, top: `${top}%`, height: `${h}%`, background: color, opacity: strength }} />;
      })}
    </AbsoluteFill>
  );
}

function HookOverlay({ text, durationFrames, accent }: { text: string; durationFrames: number; accent: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 200 } });
  const exit = interpolate(frame, [durationFrames - 6, durationFrames], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: '12%' }}>
      <div
        style={{
          maxWidth: '86%',
          background: '#fff',
          color: '#0a0a0f',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.12,
          textAlign: 'center',
          padding: '20px 34px',
          borderRadius: 18,
          borderBottom: `10px solid ${accent}`,
          transform: `translateY(${interpolate(enter, [0, 1], [-60, 0])}px) scale(${0.85 + 0.15 * enter}) rotate(${interpolate(enter, [0, 1], [-4, -1.5])}deg)`,
          opacity: Math.min(enter, exit),
          boxShadow: '0 16px 44px rgba(0,0,0,0.45)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}

function ProgressBar({ frame, total, accent }: { frame: number; total: number; accent: string }) {
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12, background: 'rgba(255,255,255,0.18)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, height: 12, width: `${(frame / Math.max(1, total)) * 100}%`, background: accent, boxShadow: `0 0 16px ${accent}` }} />
    </AbsoluteFill>
  );
}

/** Props built before graphics existed carry `overlays`; show them as pills. */
const legacyGraphics = (props: EditProps): Graphic[] =>
  (props.overlays ?? []).map((o) => ({ type: 'pill', startFrame: o.startFrame, durationFrames: o.durationFrames, text: o.text, subtext: '', items: [], focusX: 0.5, focusY: 0.5 }));

export function EditComposition(props: EditProps) {
  const frame = useCurrentFrame();
  const look = props.look ?? DEFAULT_LOOK;
  const graphics = props.graphics ?? legacyGraphics(props);
  const transitions = props.transitions ?? [];
  const effects = props.effects ?? [];

  const zoom = zoomAt(frame, props.zooms);
  const piece = props.timeline.length ? props.timeline[pieceIndexAt(frame, props.timeline)] : null;
  // Slow push-in over each shot, plus the jump-cut zoom for this piece.
  const push = look.motion && piece ? 1 + 0.035 * Math.min(1, Math.max(0, (frame - piece.outStartFrame) / Math.max(1, piece.durationFrames))) : 1;
  const base = piece?.baseScale ?? 1;
  const cam = cameraAt(frame, transitions, effects);

  const footageStyle: CSSProperties = {
    transform: `scale(${zoom.scale * push * base * cam.scale})`,
    transformOrigin: zoom.origin,
    filter: [GRADE_FILTER[look.grade] ?? 'none', cam.blur > 0.2 ? `blur(${cam.blur.toFixed(1)}px)` : '', cam.glitch > 0 ? `hue-rotate(${Math.round(jitter(frame, 9) * 40 * cam.glitch)}deg)` : '']
      .filter(Boolean)
      .join(' ') || 'none',
  };
  const shakeStyle: CSSProperties = { transform: `translate(${cam.x}%, ${cam.y}%) rotate(${cam.rotate}deg)` };

  const music = props.music;
  const ducked = (f: number) => music?.duck.some((r) => f >= r.startFrame - 3 && f < r.endFrame + 3) ?? false;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <AbsoluteFill style={shakeStyle}>
        <AbsoluteFill style={footageStyle}>
          <Footage videoUrl={props.videoUrl} timeline={props.timeline} framing={props.framing} fps={props.fps} />
        </AbsoluteFill>
        <GlitchBars frame={frame} strength={cam.glitch} accent={look.accent} />

        {graphics.map((g, k) => (
          <Sequence key={`g${k}`} from={g.startFrame} durationInFrames={g.durationFrames} layout="none">
            <GraphicLayer g={g} accent={look.accent} />
          </Sequence>
        ))}

        {props.captions && props.captions.pages.length > 0 && <Captions pages={props.captions.pages} preset={props.captions.preset} accent={look.accent} />}

        {props.hook && (
          <Sequence from={props.hook.startFrame} durationInFrames={props.hook.durationFrames} layout="none">
            <HookOverlay text={props.hook.text} durationFrames={props.hook.durationFrames} accent={look.accent} />
          </Sequence>
        )}
      </AbsoluteFill>

      {cam.flash > 0 && <AbsoluteFill style={{ background: '#fff', opacity: cam.flash }} />}
      {look.progressBar && <ProgressBar frame={frame} total={props.durationInFrames} accent={look.accent} />}

      {music && props.musicUrl && (
        <Audio
          src={props.musicUrl}
          loop
          volume={(f) => {
            const fadeOut = interpolate(f, [props.durationInFrames - 20, props.durationInFrames], [1, 0], clamp);
            return music.volume * (ducked(f) ? 0.45 : 1) * fadeOut;
          }}
        />
      )}

      {props.sfx.map((s, k) =>
        props.sfxUrls[s.type] ? (
          <Sequence key={`s${k}`} from={s.frame} durationInFrames={Math.round(props.fps * ((SFX_SECONDS[s.type] ?? 1.5) + SFX_TAIL_SEC))} layout="none">
            <Audio src={props.sfxUrls[s.type] as string} volume={s.volume ?? 0.55} />
          </Sequence>
        ) : null
      )}
    </AbsoluteFill>
  );
}
