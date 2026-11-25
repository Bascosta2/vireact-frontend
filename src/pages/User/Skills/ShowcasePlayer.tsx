import { useEffect, useState } from 'react';
import { Player, Thumbnail } from '@remotion/player';
import { RemotionReelShowcase, SHOWCASE_FPS, SHOWCASE_FRAMES, SHOWCASE_STILL } from '@/remotion/skills/remotion-reel/Showcase';
import { coverFrame } from '@/remotion/styles/covers';
import { StyleShowcase } from '@/remotion/styles/Showcase';
import { cn } from '@/lib/utils';
import type { Showcase } from './catalog';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** One showcase clip, whichever kind it is. `still` draws it over a still frame of the demo clip. */
function ShowcaseClip({ showcase, still = null }: { showcase: Showcase; still?: string | null }) {
  return showcase.kind === 'style' ? <StyleShowcase style={showcase.id} still={still} /> : <RemotionReelShowcase feature={showcase.id} still={still} />;
}

const SIZE = { compositionWidth: 1080, compositionHeight: 1920, fps: SHOWCASE_FPS, durationInFrames: SHOWCASE_FRAMES } as const;

/** A looping, silent showcase clip. With reduced motion it waits for a click instead of playing on its own. */
export function ShowcasePlayer({ showcase, label, className }: { showcase: Showcase; label: string; className?: string }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-black', className)} role="img" aria-label={label}>
      <Player
        component={ShowcaseClip}
        inputProps={{ showcase }}
        {...SIZE}
        autoPlay={!reduced}
        loop
        controls={reduced}
        clickToPlay
        acknowledgeRemotionLicense
        style={{ width: '100%', aspectRatio: '9 / 16' }}
      />
    </div>
  );
}

/**
 * A still of a showcase for the library cards: one frame over a still of the demo clip, so a grid of
 * cards costs no video decoding and no animation.
 */
export function ShowcaseThumbnail({ showcase, className }: { showcase: Showcase; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-black', className)} aria-hidden="true">
      <Thumbnail
        component={ShowcaseClip}
        inputProps={{ showcase, still: SHOWCASE_STILL }}
        {...SIZE}
        frameToDisplay={showcase.kind === 'style' ? coverFrame(showcase.id) : 20}
        style={{ width: '100%', aspectRatio: '9 / 16' }}
      />
    </div>
  );
}
