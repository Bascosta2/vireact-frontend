import { createContext, useContext, useMemo } from 'react';
import type { CaptionPage } from '../types';
import { noise } from './theme';

/**
 * The rhythm of the edit, for styles that move with the creator's voice (audiogram, oscilloscope, beat
 * cards, equalizers). It comes from the caption words, which are timed to the speech, so it needs no
 * audio analysis and the preview and the render agree exactly.
 */
export interface Pulse {
  /** Every spoken word, in order: [startFrame, endFrame, emphasis]. */
  words: [number, number, boolean][];
  /** Frames where a caption line starts: the beats of the talk. */
  beats: number[];
}

const EMPTY: Pulse = { words: [], beats: [] };
const PulseContext = createContext<Pulse>(EMPTY);
export const PulseProvider = PulseContext.Provider;

export function pulseFrom(pages: CaptionPage[] | null | undefined): Pulse {
  if (!pages?.length) return EMPTY;
  const words: Pulse['words'] = [];
  for (const p of pages) {
    const n = p.words.length;
    p.words.forEach((w, k) => {
      // Showcase pages carry no word times: spread the words over the line.
      const timed = w.endFrame > w.startFrame;
      const span = (p.endFrame - p.startFrame) / Math.max(1, n);
      words.push(timed ? [w.startFrame, w.endFrame, w.emphasis] : [Math.round(p.startFrame + k * span), Math.round(p.startFrame + (k + 1) * span) - 1, w.emphasis]);
    });
  }
  return { words, beats: pages.map((p) => p.startFrame) };
}

/** Index of the last item whose start is at or before `frame` (items sorted by start), or -1. */
const lastAtOrBefore = (starts: number[], frame: number) => {
  let lo = 0;
  let hi = starts.length - 1;
  let hit = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] <= frame) {
      hit = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return hit;
};

export interface Voice {
  /** How loud the voice is at a frame, 0 to 1 (syllables wobble it). */
  level: (frame: number) => number;
  /** The waveform at a frame: `n` bars, 0 to 1 each. */
  bars: (frame: number, n: number) => number[];
  /** Frames since the last beat (a caption line starting), and its index; Infinity before the first. */
  sinceBeat: (frame: number) => { d: number; k: number };
  /** True while an emphasis word is being said. */
  emphasis: (frame: number) => boolean;
}

export function voiceOf(p: Pulse): Voice {
  const starts = p.words.map((w) => w[0]);
  const level = (frame: number) => {
    const k = lastAtOrBefore(starts, frame);
    if (k < 0) return 0;
    const [s, e, emph] = p.words[k];
    if (frame <= e + 2) {
      // Syllables: a quick rise at the word start, then two or three bumps.
      const rise = Math.min(1, (frame - s + 1) / 3);
      const syl = 0.62 + 0.38 * Math.abs(Math.sin((frame - s) * 0.85 + k));
      return Math.min(1, rise * syl * (emph ? 1 : 0.82));
    }
    // Between words it falls away over a few frames.
    return Math.max(0, 0.5 - (frame - e) * 0.12);
  };
  return {
    level,
    bars: (frame, n) => {
      const l = level(frame);
      return Array.from({ length: n }, (_, i) => {
        const shape = 0.35 + 0.65 * Math.sin((Math.PI * (i + 0.5)) / n);
        return Math.max(0.04, l * shape * (0.55 + 0.45 * noise(i * 7 + Math.floor(frame / 2), 4)));
      });
    },
    sinceBeat: (frame) => {
      const k = lastAtOrBefore(p.beats, frame);
      return k < 0 ? { d: Infinity, k: -1 } : { d: frame - p.beats[k], k };
    },
    emphasis: (frame) => {
      const k = lastAtOrBefore(starts, frame);
      return k >= 0 && frame <= p.words[k][1] && p.words[k][2];
    },
  };
}

/** The edit's voice, inside a style's layer. */
export function useVoice(): Voice {
  const p = useContext(PulseContext);
  return useMemo(() => voiceOf(p), [p]);
}
