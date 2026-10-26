import { useEffect, useState } from 'react';
import { PRIMARY_CTA_LABEL, PrimaryCta } from './PrimaryCta';
import { claims } from '@/content/claims';

interface StickyCtaBarProps {
  /** True while the hero is mostly visible; the bar appears only after it scrolls away. */
  heroInView: boolean;
}

export function StickyCtaBar({ heroInView }: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!heroInView) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [heroInView]);

  if (!visible) return null;

  const launchDeadline = claims.launchOfferEndsAt;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 md:top-0 md:bottom-auto"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-t-2xl border border-pink-500/20 bg-zinc-950/95 px-4 py-3 shadow-lg shadow-pink-500/30 md:mt-3 md:rounded-2xl md:border md:bg-zinc-950/90">
        <div className="flex-1 text-left text-xs md:text-sm text-zinc-200">
          <div className="font-medium text-zinc-50">Free: your personalized hook analysis</div>
          {launchDeadline ? (
            <div className="text-zinc-400">
              Limited-time founder offer — available until{' '}
              <span className="font-medium">{new Date(launchDeadline).toLocaleDateString()}</span>.
            </div>
          ) : (
            <div className="text-zinc-400">
              Answer 6 quick questions, get a hook plan and one free AI rewrite in under 2 minutes.
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <PrimaryCta location="sticky_bar" />
        </div>
      </div>
    </div>
  );
}

