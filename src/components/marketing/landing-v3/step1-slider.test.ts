import { afterEach, describe, expect, it } from 'vitest';
import { claims } from '@/content/claims';

type Item = { slot: 1 | 2 | 3; name: string; beforeFollowers: string; afterFollowers: string; verified: boolean };
const items = claims.growthComparisons as Item[];
const original = items.map((i) => ({ ...i }));

afterEach(() => {
  items.forEach((item, i) => Object.assign(item, original[i]));
});

describe('Step 01 growth slides', () => {
  it('shows no growth slides in production while claims are unverified', async () => {
    const { visibleGrowthComparisons } = await import('./Step1Slider');
    expect(visibleGrowthComparisons(true)).toEqual([]);
  });

  it('needs a verified claim and both screenshots before a slide appears in production', async () => {
    Object.assign(items[0], { name: 'Test creator', beforeFollowers: '87', afterFollowers: '505K', verified: true });
    const { visibleGrowthComparisons } = await import('./Step1Slider');
    // No growth-1 images on disk: still hidden.
    expect(visibleGrowthComparisons(true)).toEqual([]);
  });

  it('shows every slot in dev so missing assets are visible', async () => {
    const { visibleGrowthComparisons } = await import('./Step1Slider');
    expect(visibleGrowthComparisons(false)).toHaveLength(3);
  });
});
