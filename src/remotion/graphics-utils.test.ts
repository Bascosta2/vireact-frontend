import { describe, expect, it } from 'vitest';
import { chartBars } from './graphics-utils';

describe('chart bars', () => {
  it('reads a label and a value from each item, scaled by k, M and B', () => {
    expect(chartBars(['2021: $1.2M', '2022 - $900K', 'Teens 9h', 'no number here'])).toEqual([
      { label: '2021', value: 1.2e6, text: '$1.2M' },
      { label: '2022', value: 9e5, text: '$900K' },
      { label: 'Teens', value: 9, text: '9h' },
    ]);
    expect(chartBars(['Japan: 125M', 'India: 1.44B']).map((b) => b.value)).toEqual([125e6, 1.44e9]);
    expect(chartBars(Array.from({ length: 9 }, (_, k) => `Item ${k}: ${k + 1}`))).toHaveLength(6);
  });
});
