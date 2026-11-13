import { afterEach, describe, expect, it } from 'vitest';
import { claims } from '@/content/claims';

type Item = { slot: 1 | 2 | 3; name: string; beforeFollowers: string; afterFollowers: string; verified: boolean };
const items = claims.growthComparisons as Item[];
const original = items.map((i) => ({ ...i }));

afterEach(() => {
  items.forEach((item, i) => Object.assign(item, original[i]));
});

describe('Growth strip above the 3 steps', () => {
  it('shows no growth slides while claims are unverified', async () => {
    const { visibleGrowthComparisons } = await import('./hero-data');
    expect(visibleGrowthComparisons()).toEqual([]);
  });

  it('needs a verified claim and both screenshots before a slide appears', async () => {
    Object.assign(items[0], { name: 'Test creator', beforeFollowers: '87', afterFollowers: '505K', verified: true });
    const { visibleGrowthComparisons } = await import('./hero-data');
    // No growth-1 images on disk: still hidden.
    expect(visibleGrowthComparisons()).toEqual([]);
  });
});
