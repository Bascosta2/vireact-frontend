import { afterEach, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HeroProofRow } from './HeroProofRow';
import { claims } from '@/content/claims';

type Summary = { value: string; verified: boolean };
type Rating = { value: string; count: string; verified: boolean };

const creator = claims.creatorCountSummary as unknown as Summary;
const rating = claims.ratingSummary as unknown as Rating;
const original = { creator: { ...creator }, rating: { ...rating } };

afterEach(() => {
  Object.assign(creator, original.creator);
  Object.assign(rating, original.rating);
});

describe('HeroProofRow claims rule', () => {
  it('hides the count text but keeps avatars when creatorCountSummary is unverified', () => {
    creator.verified = false;
    creator.value = '5,000+';
    const html = renderToStaticMarkup(React.createElement(HeroProofRow));
    expect(html).toContain('<img');
    expect(html).not.toContain('Used by');
    expect(html).not.toContain('5,000');
    // Never falls back to the older unverified numeric claims.creatorCount.
    expect(html).not.toContain(String(claims.creatorCount));
    expect(html).not.toContain('hero-proof-text');
  });

  it('shows the count only when the summary is verified', () => {
    creator.verified = true;
    creator.value = '5,000+';
    const html = renderToStaticMarkup(React.createElement(HeroProofRow));
    expect(html).toContain('Used by 5,000+ creators');
  });

  it('hides the rating unless the rating summary is verified', () => {
    rating.verified = false;
    rating.value = '4.9/5';
    expect(renderToStaticMarkup(React.createElement(HeroProofRow))).not.toContain('4.9/5');
    rating.verified = true;
    expect(renderToStaticMarkup(React.createElement(HeroProofRow))).toContain('4.9/5');
  });
});
