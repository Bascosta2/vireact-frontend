import { PrimaryCta } from './PrimaryCta';
import { claims } from '@/content/claims';

interface StickyCtaBarProps {
  /** True while the hero is in view; the bar appears only after it scrolls away. */
  heroInView: boolean;
}

/** Bottom dock (safe-area aware); a floating pill on desktop so it never covers the site header. */
export function StickyCtaBar({ heroInView }: StickyCtaBarProps) {
  if (heroInView) return null;

  // claims.launchOfferEndsAt is null until the owner sets a real date; null hides all urgency UI.
  const deadline = claims.launchOfferEndsAt ? new Date(claims.launchOfferEndsAt) : null;
  const offerLive = deadline !== null && !Number.isNaN(deadline.getTime()) && deadline.getTime() > Date.now();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] md:bottom-4 md:px-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 border border-pink-500/20 bg-zinc-950/95 px-3 py-2 shadow-lg shadow-black/50 md:rounded-2xl md:px-4 md:backdrop-blur-xl md:shadow-[0_0_30px_rgba(255,0,79,0.18),0_12px_40px_rgba(0,0,0,0.55)]">
        <div className="hidden text-sm md:block">
          <p className="font-medium text-zinc-50">Free: your personalized video analysis</p>
          {offerLive && deadline && (
            <p className="text-zinc-300">Founder offer ends {deadline.toLocaleDateString()}</p>
          )}
        </div>
        <PrimaryCta location="sticky_bar" className="w-full !min-h-[48px] !px-4 !text-sm md:w-auto" />
      </div>
    </div>
  );
}
