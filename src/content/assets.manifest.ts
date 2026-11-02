import type { ReactNode } from 'react';

export type AssetType = 'image' | 'video';

export interface BrandAssetSlot {
  id: AssetId;
  /** Public path under /public/brand. Defaults to the expected filename from the spec. */
  src: string | null;
  type: AssetType;
  /** Human-readable recommendation, e.g. "1200×1500 WebP". */
  recommended: string;
  /** Optional pixel dimensions used for width/height attributes. */
  width?: number;
  height?: number;
  /** Short description of what the asset should depict. */
  description: string;
}

export type AssetId =
  | 'hero-founder'
  | 'hero-video'
  | 'founder-headshot'
  | 'account-1-pfp'
  | 'account-2-pfp'
  | 'account-3-pfp'
  | 'account-4-pfp'
  | 'proof-analytics'
  | 'before-after-before'
  | 'before-after-after'
  | 'stack-quiz'
  | 'stack-rewriter'
  | 'stack-library'
  | 'stack-analysis'
  | 'phase-1'
  | 'growth-1-before'
  | 'growth-1-after'
  | 'growth-2-before'
  | 'growth-2-after'
  | 'growth-3-before'
  | 'growth-3-after'
  | 'og-image';

const basePath = '/brand';

const slot = (
  id: AssetId,
  filename: string | null,
  type: AssetType,
  recommended: string,
  description: string,
  size?: { width: number; height: number }
): BrandAssetSlot => ({
  id,
  src: filename ? `${basePath}/${filename}` : null,
  type,
  recommended,
  width: size?.width,
  height: size?.height,
  description,
});

export const brandAssetManifest: BrandAssetSlot[] = [
  slot(
    'hero-founder',
    'hero-founder.webp',
    'image',
    '1200×1500 WebP (4:5), ≤300 KB',
    'Founder from the waist up, expressive, holding a phone or mic, good lighting. Ideally a transparent background or a plain dark one.',
    { width: 1200, height: 1500 }
  ),
  slot('hero-video', 'hero-video.mp4', 'video', '1080×1920 MP4 (9:16), ≤8 MB, 10–20s', 'Optional hero motion: founder talking or a screen recording of Vireact analyzing a video. Desktop only.', {
    width: 1080,
    height: 1920,
  }),
  slot(
    'founder-headshot',
    'founder-headshot.webp',
    'image',
    '400×400 WebP (1:1)',
    'Clean face shot of the founder, cropped square.',
    { width: 400, height: 400 }
  ),
  slot(
    'account-1-pfp',
    'account-1-pfp.webp',
    'image',
    '200×200 WebP (1:1)',
    'Profile picture of a creator account the founder helped grow.',
    { width: 200, height: 200 }
  ),
  slot(
    'account-2-pfp',
    'account-2-pfp.webp',
    'image',
    '200×200 WebP (1:1)',
    'Second creator account profile picture.',
    { width: 200, height: 200 }
  ),
  slot(
    'account-3-pfp',
    'account-3-pfp.webp',
    'image',
    '200×200 WebP (1:1)',
    'Third creator account profile picture.',
    { width: 200, height: 200 }
  ),
  slot(
    'account-4-pfp',
    'account-4-pfp.webp',
    'image',
    '200×200 WebP (1:1)',
    'Fourth creator account profile picture.',
    { width: 200, height: 200 }
  ),
  slot(
    'proof-analytics',
    'proof-analytics.webp',
    'image',
    '1600×1000 WebP (16:10)',
    'A real analytics screenshot (views or followers growth). Blur any emails, earnings, or sensitive info.',
    { width: 1600, height: 1000 }
  ),
  slot(
    'before-after-before',
    'before-after-before.webp',
    'image',
    '720×1280 WebP (9:16)',
    'Thumbnail or first frame of a weaker video (before working with Vireact).',
    { width: 720, height: 1280 }
  ),
  slot(
    'before-after-after',
    'before-after-after.webp',
    'image',
    '720×1280 WebP (9:16)',
    'Thumbnail or first frame of an improved video that performed better.',
    { width: 720, height: 1280 }
  ),
  slot(
    'stack-quiz',
    'stack-quiz.webp',
    'image',
    '1080×1350 WebP (4:5)',
    'Screenshot of the quiz results page.',
    { width: 1080, height: 1350 }
  ),
  slot(
    'stack-rewriter',
    'stack-rewriter.webp',
    'image',
    '1080×1350 WebP (4:5)',
    'Screenshot of the hook rewriter output.',
    { width: 1080, height: 1350 }
  ),
  slot(
    'stack-library',
    'stack-library.webp',
    'image',
    '1080×1350 WebP (4:5)',
    'Screenshot of the hook and story library.',
    { width: 1080, height: 1350 }
  ),
  slot(
    'stack-analysis',
    'stack-analysis.webp',
    'image',
    '1080×1350 WebP (4:5)',
    'Screenshot of a frame-by-frame video analysis report.',
    { width: 1080, height: 1350 }
  ),
  slot(
    'phase-1',
    'phase-1.webp',
    'image',
    '1080×1350 WebP (4:5)',
    'Screenshot of the analysis report scores (not the quiz: quiz questions only appear after the CTA).',
    { width: 1080, height: 1350 }
  ),
  ...([1, 2, 3] as const).flatMap((n) =>
    (['before', 'after'] as const).map((when) =>
      slot(
        `growth-${n}-${when}` as AssetId,
        `growth-${n}-${when}.webp`,
        'image',
        '800×800 WebP (1:1), ≤120 KB',
        when === 'before'
          ? `Creator ${n} profile screenshot BEFORE (follower count visible). Pairs with claims.growthComparisons.`
          : `Creator ${n} profile screenshot AFTER growth (follower count visible). Pairs with claims.growthComparisons.`,
        { width: 800, height: 800 }
      )
    )
  ),
  slot(
    'og-image',
    'og-image.png',
    'image',
    '1200×630 PNG',
    'Open Graph image: founder + headline + logo, used for social link previews.',
    { width: 1200, height: 630 }
  ),
];

// Vite replaces this at build time with a static map of all files under /public/brand.
const rawAssetFiles = import.meta.glob('/public/brand/**/*', { eager: true }) as Record<string, unknown>;

const discoveredAssetFiles: Record<string, true> = Object.keys(rawAssetFiles).reduce<Record<string, true>>(
  (acc, key) => {
    acc[key.toLowerCase()] = true;
    return acc;
  },
  {}
);

const assetFiles: Record<string, true> =
  // Tests can override this to simulate existing assets without touching the real filesystem.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((globalThis as any).__TEST_BRAND_ASSET_FILES__ as Record<string, true> | undefined) ?? discoveredAssetFiles;

export const getAssetSlot = (id: AssetId): BrandAssetSlot | undefined =>
  brandAssetManifest.find((entry) => entry.id === id);

export const assetExists = (slotId: AssetId): boolean => {
  const entry = getAssetSlot(slotId);
  if (!entry || !entry.src) return false;
  const normalized = entry.src.toLowerCase().startsWith('/public/')
    ? entry.src.toLowerCase()
    : `/public${entry.src.toLowerCase()}`;
  if (assetFiles[normalized]) return true;
  // Also accept matches that end with the same filename, in case publicPath prefixes differ.
  const filename = normalized.split('/').pop();
  if (!filename) return false;
  return Object.keys(assetFiles).some((key) => key.endsWith(`/${filename}`));
};

