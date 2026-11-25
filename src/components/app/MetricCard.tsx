import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { InfoTip, type GlossaryTerm } from '@/components/app/InfoTip';
import { cn } from '@/lib/utils';

/** A tiny line of the last few values. Decorative: the number above it carries the meaning. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const pts = values.filter((v) => Number.isFinite(v));
  if (pts.length < 2) return <div className={cn('h-10', className)} aria-hidden="true" />;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${((i / (pts.length - 1)) * 100).toFixed(2)},${(36 - ((v - min) / span) * 32).toFixed(2)}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className={cn('h-10 w-full', className)} aria-hidden="true">
      <path d={`${d} L100,40 L0,40 Z`} className="fill-accent/10" />
      <path d={d} fill="none" className="stroke-accent" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Stripe-style metric: label with help, one big number, the change against the previous period, a small
 * trend, when it was updated, and where to see more.
 */
export function MetricCard({
  label,
  term,
  value,
  unit,
  delta,
  deltaSuffix = '',
  goodWhenUp = true,
  caption,
  series,
  updated,
  href,
  hrefLabel = 'More details',
}: {
  label: string;
  term?: GlossaryTerm;
  value: ReactNode;
  unit?: string;
  delta?: number | null;
  deltaSuffix?: string;
  goodWhenUp?: boolean;
  caption?: ReactNode;
  series?: number[];
  updated?: string | null;
  href?: string;
  hrefLabel?: string;
}) {
  const up = (delta ?? 0) > 0;
  const good = delta == null || delta === 0 ? null : up === goodWhenUp;
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-4">
      <p className="flex items-center gap-1 text-sm text-fg-muted">
        {label}
        {term && <InfoTip term={term} label={label.toLowerCase()} />}
      </p>
      <p className="tabular mt-2 flex flex-wrap items-baseline gap-x-2 text-3xl font-semibold leading-none text-fg">
        {value}
        {unit && <span className="text-base font-normal text-fg-muted">{unit}</span>}
        {delta != null && delta !== 0 && (
          <span className={cn('inline-flex items-center text-sm font-medium', good ? 'text-success' : 'text-warning')}>
            {up ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowDownRight className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">{up ? 'up' : 'down'} </span>
            {up ? '+' : ''}
            {delta}
            {deltaSuffix}
          </span>
        )}
      </p>
      {caption && <p className="mt-1.5 text-xs text-fg-muted">{caption}</p>}
      {series && <Sparkline values={series} className="mt-3" />}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs">
        <span className="text-fg-subtle">{updated ?? ''}</span>
        {href && (
          <Link to={href} className="app-focus inline-flex items-center gap-1 rounded font-medium text-fg-muted hover:text-fg">
            {hrefLabel}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
