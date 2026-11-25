import type { CSSProperties } from 'react';
import type { EditProps, ScreenFocus } from './types';
import type { TimelinePiece } from './types';

/** Index of the piece playing at `frame` (the last one when past the end). */
export function pieceIndexAt(frame: number, timeline: TimelinePiece[]): number {
  let lo = 0;
  let hi = timeline.length - 1;
  let found = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (timeline[mid].outStartFrame <= frame) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

const SPLIT_COVER: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
const SPLIT_HALF: CSSProperties = { position: 'absolute', left: 0, right: 0, height: '50%', overflow: 'hidden' };

/**
 * Split screen: the speaker fills the top half, a zoomed detail of the same take fills the bottom half.
 * The seam sits at the middle of the frame, inside Instagram's 4:5 crop; a thin line marks it.
 */
export function splitLayout(framing: EditProps['framing']) {
  const s = framing.split ?? { detailX: 0.5, detailY: 0.62, zoom: 1.8 };
  const at = `${s.detailX * 100}% ${s.detailY * 100}%`;
  return {
    top: { ...SPLIT_HALF, top: 0 } as CSSProperties,
    topVideo: { ...SPLIT_COVER, // No vertical focus data exists for the speaker (only focusX), so keep the face-height band: 30% down a cover-cropped 9:16 take.
      objectPosition: `${framing.focusX * 100}% 30%` } as CSSProperties,
    bottom: { ...SPLIT_HALF, bottom: 0 } as CSSProperties,
    bottomVideo: { ...SPLIT_COVER, objectPosition: at, transformOrigin: at, transform: `scale(${s.zoom})` } as CSSProperties,
    seam: { position: 'absolute', left: 0, right: 0, top: 'calc(50% - 3px)', height: 6, background: '#000' } as CSSProperties,
  };
}


export const SCREEN_MIN_ZOOM = 1;
export const SCREEN_MAX_ZOOM = 2.5;

/** Smooth start and end, no jolt: the camera eases in and out between focus points. */
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * A focus point kept inside the picture: at zoom z the visible window is 1/z wide, so the center stays
 * within [0.5/z, 1 - 0.5/z]. Same rule as the backend (clampFocus in edl.js).
 */
export function clampFocus(f: ScreenFocus): ScreenFocus {
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  const zoom = Math.min(SCREEN_MAX_ZOOM, Math.max(SCREEN_MIN_ZOOM, num(f.zoom, 1)));
  const half = 0.5 / zoom;
  const c = (v: unknown) => Math.min(1 - half, Math.max(half, num(v, 0.5)));
  return { x: c(f.x), y: c(f.y), zoom };
}

/** The camera at `frame` (relative to the shot's start): a pan and zoom from one focus point to the next. */
export function screenFocusAt(frame: number, durationFrames: number, from: ScreenFocus, to: ScreenFocus): ScreenFocus {
  const a = clampFocus(from);
  const b = clampFocus(to);
  const t = easeInOutCubic(Math.min(1, Math.max(0, frame / Math.max(1, durationFrames - 1))));
  return clampFocus({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: a.zoom + (b.zoom - a.zoom) * t });
}

/** CSS transform that puts the focus point at the center of the recording's box and scales by its zoom. */
export const focusTransform = (f: ScreenFocus) => `translate(${((0.5 - f.x) * f.zoom * 100).toFixed(3)}%, ${((0.5 - f.y) * f.zoom * 100).toFixed(3)}%) scale(${f.zoom.toFixed(4)})`;

/** Instagram's 4:5 crop of the 9:16 frame: top and height, in pixels of a 1080x1920 frame. */
export const SAFE_AREA = { top: 285, height: 1350 } as const;
const MARGIN = 28;

/** The box the recording sits in (pixels of the frame), and the largest rectangle of the recording's shape that fits it. */
export function screenBox(layout: 'safe' | 'bottom', aspect: number, width = 1080, height = 1920) {
  const area = layout === 'bottom'
    ? { top: height / 2 + MARGIN / 2, height: height / 2 - MARGIN * 1.5 }
    : { top: SAFE_AREA.top * (height / 1920) + MARGIN, height: SAFE_AREA.height * (height / 1920) - MARGIN * 2 };
  const maxW = width - MARGIN * 2;
  const a = Number.isFinite(aspect) && aspect > 0.2 && aspect < 5 ? aspect : 16 / 9;
  const w = Math.min(maxW, area.height * a);
  const h = w / a;
  return { left: (width - w) / 2, top: area.top + (area.height - h) / 2, width: w, height: h };
}
