/**
 * Shared chart styling for Recharts. Colors are CSS variables from styles/app-tokens.css (SVG presentation
 * attributes accept var()), so charts follow the tokens. See the --app-chart-* comment there for validation.
 */
export const CHART = {
  series1: 'var(--app-chart-1)',
  series2: 'var(--app-chart-2)',
  good: 'var(--app-chart-good)',
  serious: 'var(--app-chart-serious)',
  band: 'var(--app-chart-band)',
  grid: 'var(--app-chart-grid)',
  axis: 'var(--app-text-tertiary)',
  surface: 'var(--app-surface)',
  text: 'var(--app-text-primary)',
  muted: 'var(--app-text-secondary)',
} as const;

export const AXIS_TICK = { fill: CHART.axis, fontSize: 11 };

/** Recessive axes: no axis line, no tick marks. */
export const AXIS_PROPS = { tickLine: false, axisLine: false, tick: AXIS_TICK } as const;

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US');

export const formatCompact = (n: number | null | undefined): string => (n == null || !Number.isFinite(n) ? '–' : compact.format(n));
export const formatNumber = (n: number | null | undefined): string => (n == null || !Number.isFinite(n) ? '–' : full.format(n));

export const formatShortDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
