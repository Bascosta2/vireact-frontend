import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { claims } from '@/content/claims';
import { winsData } from '@/components/Home/WinsSection/wins-data';
import { FounderHero } from './FounderHero';
import { HeroProofRow, RatingStars } from './HeroProofRow';
import { ratingScore, resultSlides, showHeroImage, verifiedRatingLabel } from './hero-data';
import { HowItWorksPhases } from './HowItWorksPhases';

const inRouter = (node: React.ReactElement) => renderToStaticMarkup(React.createElement(MemoryRouter, null, node));

describe('Landing V3 hero', () => {
  it('renders the owner headline with a single primary CTA', () => {
    const html = inRouter(React.createElement(FounderHero));
    expect(html).toContain('Predict your views.');
    expect(html).toContain('Know exactly what to fix. Then post.');
    expect(html).not.toContain('Fix the swipe');
    expect(html.match(/Get my free hook analysis/g)).toHaveLength(1);
    expect(html).toContain('Creator results');
  });

  it('hides the empty founder image column in production until the asset exists', () => {
    expect(showHeroImage(true)).toBe(false);
    expect(showHeroImage(false)).toBe(true);
  });
});

describe('rating stars', () => {
  it('parses the score from the claim and clamps it', () => {
    expect(ratingScore('4.6/5')).toBe(4.6);
    expect(ratingScore('7/5')).toBe(5);
    expect(ratingScore('n/a')).toBeNull();
  });

  it('fills four stars and clips the fifth to the decimal', () => {
    const html = renderToStaticMarkup(React.createElement(RatingStars, { score: 4.6 }));
    // 5 outline stars + 5 filled overlays (the fifth clipped to 60%)
    expect(html.match(/<svg/g)?.length).toBe(10);
    expect(html.match(/width:100%/g)?.length).toBe(4);
    expect(html).toContain('width:60%');
  });

  it('shows the verified rating next to the avatars', () => {
    expect(claims.ratingSummary.verified).toBe(true);
    expect(verifiedRatingLabel()).toBe('4.6/5 from 1000+ reviews');
    const html = renderToStaticMarkup(React.createElement(HeroProofRow));
    expect(html).toContain('4.6/5');
    expect(html).toContain('from 1000+ reviews');
  });
});

describe('hero results carousel slides', () => {
  it('rotates the creator results when no growth comparison is ready', () => {
    const slides = resultSlides([]);
    expect(slides).toHaveLength(winsData.length);
    expect(slides.every((s) => s.kind === 'creator')).toBe(true);
  });

  it('puts verified before/after growth cards first', () => {
    const growth = [{ slot: 1 as const, name: 'Test creator', beforeFollowers: '1K', afterFollowers: '10K', verified: true }];
    const slides = resultSlides(growth);
    expect(slides[0]).toMatchObject({ kind: 'growth', key: 'growth-1' });
    expect(slides).toHaveLength(winsData.length + 1);
  });
});

describe('3 steps', () => {
  it('keeps three short bullets per step', () => {
    const html = inRouter(React.createElement(HowItWorksPhases));
    const bullets = [...html.matchAll(/<li class="flex items-center gap-2\.5[^"]*">.*?<span>([^<]+)<\/span><\/li>/g)].map((m) => m[1]);
    expect(bullets).toHaveLength(9);
    for (const text of bullets) expect(text.split(/\s+/).length).toBeLessThanOrEqual(7);
  });
});
