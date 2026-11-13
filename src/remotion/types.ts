/**
 * Props for the edit composition. Built by the backend (service/editor/compose.js) and played
 * unchanged by the in-browser Player (preview) and Remotion Lambda (final render).
 * Keep the unions in step with vireact-backend/src/service/editor/edl.js.
 */
export type CaptionPreset = 'bold_pop' | 'highlight' | 'impact' | 'clean' | 'karaoke';
export type SfxType =
  | 'whoosh' | 'swoosh' | 'pop' | 'click' | 'ding' | 'sparkle' | 'boom'
  | 'hit' | 'riser' | 'bass_drop' | 'glitch' | 'shutter' | 'typing' | 'notify';
export type GraphicType = 'slam' | 'pill' | 'headline' | 'lower_third' | 'counter' | 'list' | 'callout' | 'cta';
export type TransitionType = 'punch' | 'whip' | 'flash' | 'glitch';
export type EffectType = 'shake' | 'flash';
export type Grade = 'vivid' | 'warm' | 'cool' | 'punchy_bw' | 'none';

export interface TimelinePiece {
  id: string;
  segId: string;
  srcStart: number;
  srcEnd: number;
  outStartFrame: number;
  durationFrames: number;
  /** Jump-cut zoom for this piece (1 = none). */
  baseScale?: number;
}

export interface CaptionWord {
  text: string;
  startFrame: number;
  endFrame: number;
  emphasis: boolean;
  i: number;
}

export interface CaptionPage {
  startFrame: number;
  endFrame: number;
  words: CaptionWord[];
}

export interface Graphic {
  type: GraphicType;
  startFrame: number;
  durationFrames: number;
  text: string;
  subtext: string;
  items: string[];
  focusX: number;
  focusY: number;
}

export interface Look {
  grade: Grade;
  /** Hex color for graphics and emphasis words. */
  accent: string;
  progressBar: boolean;
  /** Slow push-in on every shot. */
  motion: boolean;
}

// A type alias (not an interface) so it is assignable to Remotion's Record<string, unknown> props.
export type EditProps = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  timeline: TimelinePiece[];
  captions: { preset: CaptionPreset; pages: CaptionPage[] } | null;
  hook: { text: string; startFrame: number; durationFrames: number } | null;
  zooms: { index: number; startFrame: number; durationFrames: number; scale: number; focusX: number; focusY: number }[];
  /** Optional so props saved before these layers existed still play. */
  graphics?: Graphic[];
  transitions?: { type: TransitionType; frame: number }[];
  effects?: { type: EffectType; frame: number }[];
  look?: Look;
  /** Legacy text overlays (props built before graphics existed). */
  overlays?: { startFrame: number; durationFrames: number; text: string; position: 'top' | 'center' | 'bottom' }[];
  sfx: { type: SfxType; frame: number; volume?: number }[];
  music: { trackId: string; volume: number; duck: { startFrame: number; endFrame: number }[] } | null;
  framing: { mode: 'fill' | 'fit_blur'; focusX: number };
  /** Preview uses the 720p proxy; the final render uses the original upload. */
  videoUrl: string;
  musicUrl: string | null;
  musicTitle?: string | null;
  musicAttribution?: string | null;
  sfxUrls: Partial<Record<SfxType, string>>;
};
