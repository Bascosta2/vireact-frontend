/**
 * Props for the edit composition. Built by the backend (service/editor/compose.js) and played
 * unchanged by the in-browser Player (preview) and Remotion Lambda (final render).
 */
export type CaptionPreset = 'bold_pop' | 'clean' | 'karaoke';
export type SfxType = 'whoosh' | 'pop' | 'riser' | 'ding' | 'boom';

export interface TimelinePiece {
  id: string;
  segId: string;
  srcStart: number;
  srcEnd: number;
  outStartFrame: number;
  durationFrames: number;
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
  overlays: { startFrame: number; durationFrames: number; text: string; position: 'top' | 'center' | 'bottom' }[];
  sfx: { type: SfxType; frame: number }[];
  music: { trackId: string; volume: number; duck: { startFrame: number; endFrame: number }[] } | null;
  framing: { mode: 'fill' | 'fit_blur'; focusX: number };
  /** Preview uses the 720p proxy; the final render uses the original upload. */
  videoUrl: string;
  musicUrl: string | null;
  musicTitle?: string | null;
  musicAttribution?: string | null;
  sfxUrls: Partial<Record<SfxType, string>>;
};
