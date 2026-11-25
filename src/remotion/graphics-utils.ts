import { createContext, useContext, type CSSProperties } from 'react';
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
/**
 * Split screen puts the seam at 50% of the frame, so the caption line moves to just above it (inside the
 * 4:5 safe area, which spans 15% to 85%) and callout labels keep out of that band. The composition provides it.
 */
export const SplitContext = createContext(false);
export const CAPTION_CENTER_SPLIT = 0.44;
export const CAPTION_BAND_SPLIT = [0.38, 0.49] as const;
export const useCaptionCenter = () => (useContext(SplitContext) ? CAPTION_CENTER_SPLIT : CAPTION_CENTER);
export const useCaptionBand = () => (useContext(SplitContext) ? CAPTION_BAND_SPLIT : CAPTION_BAND);

/** Top of the lower third and the call to action: under the captions, above the apps' own buttons. */
export const BELOW_CAPTIONS = 0.655;

/**
 * Where a callout's label goes: the top edge of its box, and whether it sits above the ring.
 * It prefers the side with more room, and moves (or pulls in closer) rather than cover the captions.
 */
export function calloutLabel(y: number, height: number, boxHeight = 90, band: readonly [number, number] = CAPTION_BAND): { top: number; above: boolean } {
  const preferAbove = y > height * 0.45;
  const clearOfCaptions = (top: number) => top + boxHeight <= height * band[0] || top >= height * band[1];
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

/** Must match CHART_FIRST_SEC / CHART_STEP_SEC in the backend: when each bar of a chart starts to grow. */
export const CHART_FIRST_SEC = 0.35;
export const CHART_STEP_SEC = 0.4;
/** How long one bar takes to grow. */
export const CHART_GROW_SEC = 0.7;

const UNIT: Record<string, number> = { k: 1e3, K: 1e3, m: 1e6, M: 1e6, b: 1e9, B: 1e9, bn: 1e9, t: 1e12, T: 1e12 };

/**
 * The bars of a chart graphic from its items ("2021: $1.2M", "Japan - 125M", "Teens 9h"): a label and a
 * value, scaled by k/M/B so "$900K" and "$1.2M" compare correctly. Items without a number are dropped.
 */
export function chartBars(items: string[]): { label: string; value: number; text: string }[] {
  const out: { label: string; value: number; text: string }[] = [];
  for (const raw of items) {
    const item = raw.trim();
    const split = /^(.*?)(?:\s*[:=–—-]\s*|\s+)([^\s:=]*\d[\d.,]*\s*(?:[a-zA-Z%]{0,3})?)$/.exec(item);
    if (!split) continue;
    const label = split[1].trim();
    const text = split[2].trim();
    const m = /(\d[\d,]*(?:\.\d+)?)\s*([a-zA-Z]{0,2})/.exec(text);
    if (!m) continue;
    const value = Number(m[1].replace(/,/g, '')) * (UNIT[m[2]] ?? 1);
    if (!Number.isFinite(value)) continue;
    out.push({ label: label || text, value, text });
  }
  return out.slice(0, 6);
}
