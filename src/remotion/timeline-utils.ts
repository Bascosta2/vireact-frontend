import type { CSSProperties } from 'react';
import type { EditProps } from './types';
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
  const s = framing.split ?? { detailX: 0.5, detailY: 0.5, zoom: 1.8 };
  const at = `${s.detailX * 100}% ${s.detailY * 100}%`;
  return {
    top: { ...SPLIT_HALF, top: 0 } as CSSProperties,
    topVideo: { ...SPLIT_COVER, objectPosition: `${framing.focusX * 100}% 30%` } as CSSProperties,
    bottom: { ...SPLIT_HALF, bottom: 0 } as CSSProperties,
    bottomVideo: { ...SPLIT_COVER, objectPosition: at, transformOrigin: at, transform: `scale(${s.zoom})` } as CSSProperties,
    seam: { position: 'absolute', left: 0, right: 0, top: 'calc(50% - 3px)', height: 6, background: '#000' } as CSSProperties,
  };
}

