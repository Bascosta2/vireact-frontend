import { useEffect, useState } from 'react';
import { Player, Thumbnail } from '@remotion/player';
import { RemotionReelShowcase, SHOWCASE_FPS, SHOWCASE_FRAMES, SHOWCASE_STILL } from '@/remotion/skills/remotion-reel/Showcase';
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
 * A still of a showcase for the library cards. Styles use their pre-rendered cover image
 * (public/skill-covers/<id>.jpg, rendered from the same showcase), lazy-loaded, so a library of 130 cards
 * costs no rendering; the editing skills draw one frame over a still of the demo clip.
 */
export function ShowcaseThumbnail({ showcase, className }: { showcase: Showcase; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-line bg-black', className)} aria-hidden="true">
      {showcase.kind === 'style' ? (
        <img src={`/skill-covers/${showcase.id}.jpg`} alt="" loading="lazy" decoding="async" width={360} height={640} className="block h-auto w-full" style={{ aspectRatio: '9 / 16' }} />
      ) : (
        <Thumbnail
          component={ShowcaseClip}
          inputProps={{ showcase, still: SHOWCASE_STILL }}
          {...SIZE}
          frameToDisplay={20}
          style={{ width: '100%', aspectRatio: '9 / 16' }}
        />
      )}
    </div>
  );
}
