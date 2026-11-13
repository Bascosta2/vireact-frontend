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
