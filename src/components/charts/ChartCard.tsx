import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Card frame for one chart: title, one-line takeaway, optional legend/actions, then the plot. */
export function ChartCard({
  title,
  subtitle,
  actions,
  legend,
  className,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  legend?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn('min-w-0 rounded-xl border border-line bg-surface p-4 sm:p-5', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-fg-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {legend && <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">{legend}</div>}
      {children}
    </section>
  );
}

/** Legend key that mirrors the mark: a short line for lines, a dot for points, a block for bars. */
export function LegendKey({ color, shape = 'line', label }: { color: string; shape?: 'line' | 'dot' | 'block' | 'up' | 'down'; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width="14" height="10" aria-hidden="true">
        {shape === 'line' && <line x1="1" y1="5" x2="13" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />}
        {shape === 'dot' && <circle cx="7" cy="5" r="4" fill={color} />}
        {shape === 'block' && <rect x="2" y="1" width="10" height="8" rx="2" fill={color} />}
        {shape === 'up' && <path d="M7 1 L12 9 L2 9 Z" fill={color} />}
        {shape === 'down' && <path d="M2 1 L12 1 L7 9 Z" fill={color} />}
      </svg>
      {label}
    </span>
  );
}

/** Tooltip body: value leads, label follows (dataviz interaction rule). */
export function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="max-w-[240px] rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 truncate text-fg-muted">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          {r.color && <span aria-hidden="true" className="inline-block h-0.5 w-3 rounded" style={{ background: r.color }} />}
          <span className="tabular font-semibold text-fg">{r.value}</span>
          <span className="text-fg-muted">{r.label}</span>
        </p>
      ))}
    </div>
  );
}
