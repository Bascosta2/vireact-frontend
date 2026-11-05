import { useEffect, useRef, useState } from 'react';
import { claims } from '@/content/claims';
import { prefersReducedMotion } from '@/lib/motion';

/** Splits "200M+" into prefix, number and suffix so the number can count up. */
export const splitCount = (value: string): { prefix: string; target: number; suffix: string; decimals: number } | null => {
  const match = /^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value.trim());
  if (!match) return null;
  const numeric = match[2].replace(/,/g, '');
  const decimals = numeric.includes('.') ? numeric.split('.')[1].length : 0;
  return { prefix: match[1], target: Number(numeric), suffix: match[3], decimals };
};

/** Count-up that starts when scrolled into view; renders the final value under reduced motion. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const parts = splitCount(value);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !parts || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    let frame = 0;
    setCurrent(0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / 1400, 1);
          setCurrent(parts.target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
    // parts is derived from value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!parts) return <span className={className}>{value}</span>;
  const shown = current === null ? parts.target : current;
  return (
    <span ref={ref} className={className} aria-label={value}>
      <span aria-hidden="true">
        {parts.prefix}
        {shown.toLocaleString('en-US', { minimumFractionDigits: parts.decimals, maximumFractionDigits: parts.decimals })}
        {parts.suffix}
      </span>
    </span>
  );
}

export function ResultsBand() {
  const { value, label, verified } = claims.headlineViews;
  if (!verified || !value || !label) return null;

  return (
    <section
      aria-label="Results"
      data-section="results_band"
      className="border-y border-white/10 bg-gradient-to-r from-pink-500/10 via-fuchsia-600/10 to-orange-500/10 py-10"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-center">
        <CountUp value={value} className="text-5xl font-extrabold tabular-nums text-white md:text-6xl" />
        <p className="max-w-md text-base text-zinc-200">{label}</p>
      </div>
    </section>
  );
}
