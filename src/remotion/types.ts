import type { Brand } from './brand';
import type { StyleId } from './styles/ids';

/**
 * Props for the edit composition. Built by the backend (service/editor/compose.js) and played
 * unchanged by the in-browser Player (preview) and Remotion Lambda (final render).
 * Keep the unions in step with vireact-backend/src/service/editor/edl.js.
 */
export type CaptionPreset = 'bold_pop' | 'highlight' | 'impact' | 'clean';
/** Built-in sounds, one file each at public/sfx/<type>.mp3 (SFX_TYPES in the backend). */
export const SFX_TYPES = [
  'whoosh', 'swoosh', 'swish', 'whip', 'sweep_up', 'sweep_down', 'reverse', 'riser', 'launch',
  'boom', 'hit', 'thud', 'impact', 'bass_drop', 'kick', 'snap', 'clap',
  'pop', 'click', 'tick', 'tap', 'blip', 'bubble', 'drip', 'typing', 'page', 'shutter',
  'ding', 'chime', 'bell', 'sparkle', 'shimmer', 'notify', 'success', 'coin', 'cash', 'power_up',
  'suspense', 'glitch', 'static', 'zap', 'error', 'alert', 'power_down', 'pulse', 'heartbeat',
] as const;
export type SfxType = (typeof SFX_TYPES)[number];
export type GraphicType = 'slam' | 'pill' | 'headline' | 'lower_third' | 'counter' | 'list' | 'callout' | 'cta' | 'visual' | 'chart';
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
  /** For type "visual": which illustration to draw (a key of VISUALS in ./visuals). */
  visual?: string;
  /** For type "slam": draw it under the captions because the top of the frame is taken. */
  low?: boolean;
  /** "behind": drawn under the speaker (needs props.matte); otherwise in front as always. */
  layer?: 'behind';
}

export interface Look {
  grade: Grade;
  /** Hex color for graphics and emphasis words. */
  accent: string;
  progressBar: boolean;
  /** Slow push-in on every shot. */
  motion: boolean;
}

/**
 * An editing skill the edit follows (backend service/editor/skills.js); its components replace the
 * standard look. Besides Remotion Reel, every animation style (styles/ids.ts) is a skill.
 */
export interface SkillProps {
  id: 'remotion-reel' | StyleId;
  version: number;
  /** Text hook style of Remotion Reel (unused by the animation styles). */
  hookVariant: 'white' | 'black' | 'plain';
  /** The hook text broken into its lines. */
  hookLines: string[];
  /**
   * 'scene': an animated storytelling style paints its world over the whole frame instead of showing the
   * camera; the footage still plays underneath for its sound (the creator narrates). Absent = footage.
   */
  layout?: 'scene' | 'footage';
}

/** A focus point on the screen recording: x and y are 0 to 1 across the picture, zoom 1 (whole screen) to 2.5. */
export interface ScreenFocus {
  x: number;
  y: number;
  zoom: number;
}

/**
 * A screen recording shot (EDITOR_FEATURES_V2). The camera moves from `from` to `to` over the shot.
 * layout 'safe': fills the 4:5 safe area over the speaker; 'bottom': the lower half while split screen keeps the speaker on top.
 */
export interface ScreenShot {
  startFrame: number;
  durationFrames: number;
  /** Where in the recording the shot starts, in seconds. */
  recStartSec: number;
  /** Width over height of the recording. */
  aspect: number;
  from: ScreenFocus;
  to: ScreenFocus;
  layout: 'safe' | 'bottom';
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
  framing: { mode: 'fill' | 'fit_blur' | 'split'; focusX: number; /** Split screen (EDITOR_FEATURES_V2): the zoomed detail pane's center, 0 to 1. */ split?: { detailX: number; detailY: number; zoom: number } };
  /** Background matte (EDITOR_BG_REMOVAL_ENABLED): a WebM with alpha of the speaker, same timing as the source. */
  matte?: { url: string; mode: 'alpha-webm' };
  /** Preview uses the 720p proxy; the final render uses the original upload. */
  videoUrl: string;
  musicUrl: string | null;
  musicTitle?: string | null;
  musicAttribution?: string | null;
  sfxUrls: Partial<Record<SfxType, string>>;
  /** Optional: absent for standard edits and for props built before skills existed. */
  skill?: SkillProps;
  /** Screen recording shots and the recording's URL; absent unless the creator attached one (EDITOR_FEATURES_V2). */
  screens?: ScreenShot[];
  screenUrl?: string;
  /** The creator's brand sheet (EDITOR_FEATURES_V2); absent for everyone else. */
  brand?: Brand;
};
