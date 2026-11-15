import type { CSSProperties } from 'react';
import { interpolate } from 'remotion';

/** Must match COUNTER_SEC / LIST_FIRST_SEC / LIST_STEP_SEC in the backend (service/editor/compose.js). */
export const COUNTER_SEC = 1.1;
export const LIST_FIRST_SEC = 0.35;
export const LIST_STEP_SEC = 0.45;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const STROKE: CSSProperties = { WebkitTextStroke: '4px #000', paintOrder: 'stroke fill' };

/** Springs shared by every graphic so they move alike: SMOOTH settles with no bounce, SNAP has one small overshoot. */
export const SMOOTH = { damping: 20, stiffness: 180, mass: 0.8 } as const;
export const SNAP = { damping: 15, stiffness: 240, mass: 0.7 } as const;
/** Dark glass behind text, and the shadow under cards. */
export const GLASS = 'rgba(11,13,23,0.86)';
export const SHADOW = '0 18px 48px rgba(0,0,0,0.5)';

/** Where the middle of the caption line sits, as a share of the frame height. */
export const CAPTION_CENTER = 0.56;
/** The strip the caption line can fill, as shares of the frame height. Other graphics stay out of it. */
export const CAPTION_BAND = [0.5, 0.62] as const;
/** Top of the lower third and the call to action: under the captions, above the apps' own buttons. */
export const BELOW_CAPTIONS = 0.655;

/**
 * Where a callout's label goes: the top edge of its box, and whether it sits above the ring.
 * It prefers the side with more room, and moves (or pulls in closer) rather than cover the captions.
 */
export function calloutLabel(y: number, height: number, boxHeight = 90): { top: number; above: boolean } {
  const preferAbove = y > height * 0.45;
  const clearOfCaptions = (top: number) => top + boxHeight <= height * CAPTION_BAND[0] || top >= height * CAPTION_BAND[1];
  // First try to stay inside the area the apps leave free, then anywhere on screen.
  for (const [min, max] of [[0.06, 0.8], [0.03, 0.97]]) {
    for (const gap of [260, 150]) {
      for (const above of [preferAbove, !preferAbove]) {
        const top = above ? y - gap - boxHeight : y + gap;
        if (top >= height * min && top + boxHeight <= height * max && clearOfCaptions(top)) return { top, above };
      }
    }
  }
  return { top: preferAbove ? y - 260 - boxHeight : y + 260, above: preferAbove };
}

/** 0→1 over the last frames of a graphic, for its exit. */
export const exitAt = (frame: number, duration: number, frames = 6) => interpolate(frame, [duration - frames, duration], [0, 1], clamp);

/** Split "$10,000+" into "$", 10000, "+" (and how many decimals to show). Null when there is no number. */
export function parseCount(text: string): { prefix: string; value: number; suffix: string; decimals: number; commas: boolean } | null {
  const m = /^(.*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(text.trim());
  if (!m) return null;
  const raw = m[2];
  const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
  return { prefix: m[1], value: Number(raw.replace(/,/g, '')), suffix: m[3], decimals, commas: raw.includes(',') };
}

export const formatCount = (n: number, decimals: number, commas: boolean) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: commas });
