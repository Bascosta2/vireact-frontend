import { useEffect, useRef, useState } from 'react';
import { claims } from '@/content/claims';

const usePrefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export function ResultsBand() {
  const viewsClaim = claims.headlineViews;
  if (!viewsClaim?.value || !viewsClaim.label || !viewsClaim.verified) return null;

  const [displayValue, setDisplayValue] = useState<string>(viewsClaim.value);
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || hasAnimated) return;
    let timeoutId: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);
            observer.disconnect();
            if (!prefersReducedMotion) {
              // Very lightweight count-up: just swap from "0" to the final value after a short delay.
              setDisplayValue('0');
              timeoutId = window.setTimeout(() => {
                setDisplayValue(viewsClaim.value);
              }, 600);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion, hasAnimated, viewsClaim.value]);

  return (
    <section
      ref={ref}
      className="border-y border-white/5 bg-gradient-to-r from-pink-500/10 via-fuchsia-600/10 to-orange-500/10 py-8 md:py-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-center md:flex-row md:text-left">
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-pink-200">
          Real results, not guesses
        </div>
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <div className="text-3xl font-extrabold tabular-nums text-white sm:text-4xl">
            {displayValue}
          </div>
          <div className="max-w-md text-sm text-zinc-300">{viewsClaim.label}</div>
        </div>
      </div>
    </section>
  );
}

