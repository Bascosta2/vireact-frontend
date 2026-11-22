import { useEffect, useState } from 'react';
import { Player } from '@remotion/player';
import { RemotionReelShowcase, SHOWCASE_FPS, SHOWCASE_FRAMES, type ShowcaseId } from '@/remotion/skills/remotion-reel/Showcase';
import { cn } from '@/lib/utils';

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A looping, silent showcase clip. With reduced motion it waits for a click instead of playing on its own. */
export function ShowcasePlayer({ feature, label, className }: { feature: ShowcaseId; label: string; className?: string }) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);
  return (
    <div className={cn('overflow-hidden rounded-xl border border-line bg-black', className)} role="img" aria-label={label}>
      <Player
        component={RemotionReelShowcase}
        inputProps={{ feature }}
        durationInFrames={SHOWCASE_FRAMES}
        compositionWidth={1080}
        compositionHeight={1920}
        fps={SHOWCASE_FPS}
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
