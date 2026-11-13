import type { CSSProperties } from 'react';
import { interpolate } from 'remotion';

/** Must match COUNTER_SEC / LIST_FIRST_SEC / LIST_STEP_SEC in the backend (service/editor/compose.js). */
export const COUNTER_SEC = 1.1;
export const LIST_FIRST_SEC = 0.35;
export const LIST_STEP_SEC = 0.45;

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const STROKE: CSSProperties = { WebkitTextStroke: '4px #000', paintOrder: 'stroke fill' };

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
