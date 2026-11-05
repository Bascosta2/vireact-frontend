import { winsData } from '@/components/Home/WinsSection/wins-data';
import { claims } from '@/content/claims';
import { assetExists, type AssetId } from '@/content/assets.manifest';

export type Win = (typeof winsData)[number];
export type GrowthComparison = (typeof claims.growthComparisons)[number];

export type ResultSlide =
  | { kind: 'growth'; key: string; item: GrowthComparison }
  | { kind: 'creator'; key: string; win: Win };

/** 96px logo crop of the wide channel banner in /wins-avatars, so avatar rows don't download the full banner. */
export const avatarThumb = (src: string): string => src.replace('/wins-avatars/', '/wins-avatars/thumb/').replace(/\.png$/, '.webp');

/** Count text for the proof row. Only the verified summary may render a number; never fall back to claims.creatorCount. */
export const verifiedCreatorCount = (): string | null =>
  claims.creatorCountSummary.verified && claims.creatorCountSummary.value ? claims.creatorCountSummary.value : null;

/** Rating text, hidden unless the rating claim is verified. */
export const verifiedRatingLabel = (): string | null => {
  const { verified, value, count } = claims.ratingSummary;
  if (!verified || !value) return null;
  return count ? `${value} from ${count}` : value;
};

/** "4.6/5" -> 4.6, clamped to 0..5. Null when the value has no leading number. */
export const ratingScore = (value: string): number | null => {
  const match = /^(\d+(?:\.\d+)?)/.exec(value.trim());
  if (!match) return null;
  return Math.max(0, Math.min(5, Number(match[1])));
};

/**
 * Production shows a growth card only when the claim is verified and both screenshots exist.
 * Dev shows every slot so missing assets and claims are obvious.
 */
export const visibleGrowthComparisons = (isProd: boolean = import.meta.env.PROD): GrowthComparison[] =>
  claims.growthComparisons.filter((item) => {
    if (!isProd) return true;
    const ready = item.verified && item.beforeFollowers && item.afterFollowers;
    return Boolean(ready) && assetExists(`growth-${item.slot}-before` as AssetId) && assetExists(`growth-${item.slot}-after` as AssetId);
  });

/** Before/after growth cards first, then the creator results. */
export const resultSlides = (growth: GrowthComparison[] = visibleGrowthComparisons()): ResultSlide[] => [
  ...growth.map((item) => ({ kind: 'growth' as const, key: `growth-${item.slot}`, item })),
  ...winsData.map((win) => ({ kind: 'creator' as const, key: win.name, win })),
];

const COUNT_UNITS: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 };

/** "85.1K SUBS" -> 85100, "1,100" -> 1100. NaN when the text has no leading number. */
export const parseCount = (text: string): number => {
  const match = /^([\d,]*\.?\d+)\s*([KMB])?/i.exec(text.trim());
  if (!match) return NaN;
  return Number(match[1].replace(/,/g, '')) * (COUNT_UNITS[(match[2] ?? '').toUpperCase()] ?? 1);
};

/** Growth multiple rounded down so it never overstates (38.7 -> "38×", 3.57 -> "3.5×"). Null below 2×. */
export const growthMultiple = (before: string, now: string): string | null => {
  const ratio = parseCount(now) / parseCount(before);
  if (!Number.isFinite(ratio) || ratio < 2) return null;
  const shown = ratio >= 10 ? Math.floor(ratio + 1e-9) : Math.floor(ratio * 10 + 1e-9) / 10;
  return `${shown}×`;
};

export interface CreatorGrowth {
  before: string;
  now: string;
  unit: string;
  multiple: string | null;
  highlight: string;
}

/** Owner-confirmed before -> now growth for a creator card; null when the creator has no confirmed start. */
export const creatorGrowth = (win: Win): CreatorGrowth | null => {
  const entry = claims.creatorGrowth.verified ? claims.creatorGrowth.byHandle[win.platform] : undefined;
  if (!entry?.before) return null;
  const [now, ...unit] = win.stat.split(' ');
  return {
    before: entry.before,
    now,
    unit: unit.join(' ').toLowerCase(),
    multiple: growthMultiple(entry.before, now),
    highlight: entry.highlight,
  };
};

/** Production drops the empty image column (and centers the hero) until hero-founder exists; dev keeps the placeholder visible. */
export const showHeroImage = (isProd: boolean = import.meta.env.PROD): boolean => !isProd || assetExists('hero-founder');
