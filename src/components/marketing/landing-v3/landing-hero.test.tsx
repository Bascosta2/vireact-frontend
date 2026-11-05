import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { claims } from '@/content/claims';
import { winsData } from '@/components/Home/WinsSection/wins-data';
import { FounderHero } from './FounderHero';
import { HeroProofRow, RatingStars } from './HeroProofRow';
import {
  creatorGrowth,
  growthMultiple,
  parseCount,
  ratingScore,
  resultSlides,
  showHeroImage,
  verifiedRatingLabel,
} from './hero-data';
import { CreatorGrowthCard } from './CreatorGrowthCard';
import BelowFold from './BelowFold';

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

describe('creator growth', () => {
  it('parses subscriber counts', () => {
    expect(parseCount('85.1K SUBS')).toBe(85100);
    expect(parseCount('352')).toBe(352);
    expect(parseCount('1,100')).toBe(1100);
    expect(parseCount('10M')).toBe(10_000_000);
    expect(parseCount('n/a')).toBeNaN();
  });

  it('rounds the multiple down and hides it below 2x', () => {
    expect(growthMultiple('2.2K', '85.1K')).toBe('38×');
    expect(growthMultiple('352', '4.74K')).toBe('13×');
    expect(growthMultiple('13.2K', '86K')).toBe('6.5×');
    expect(growthMultiple('3.4K', '13.6K')).toBe('4×');
    expect(growthMultiple('15K', '53.6K')).toBe('3.5×');
    expect(growthMultiple('120K', '176K')).toBeNull();
  });

  it('has an owner-confirmed starting point for every creator', () => {
    for (const win of winsData) expect(creatorGrowth(win)?.before).toBeTruthy();
  });

  it('renders before, now, the multiple, the highlight and the quote', () => {
    const win = winsData.find((w) => w.platform === '@FeatherFurFin')!;
    const html = renderToStaticMarkup(React.createElement(CreatorGrowthCard, { win }));
    expect(html).toMatch(/Before<\/span><span[^>]*>2\.2K</);
    expect(html).toMatch(/Now<\/span>.*>85\.1K</);
    expect(html).toContain('38×');
    expect(html).toContain('10M views in one month');
    expect(html).toContain(win.quote);
  });

  it('falls back to the plain stat when the start is not confirmed', () => {
    const win = winsData[0];
    const growthClaim = claims.creatorGrowth as unknown as { verified: boolean };
    growthClaim.verified = false;
    try {
      const html = renderToStaticMarkup(React.createElement(CreatorGrowthCard, { win }));
      expect(html).toContain(win.stat);
      expect(html).not.toContain('Before');
    } finally {
      growthClaim.verified = true;
    }
  });
});

describe('below the hero', () => {
  it('uses the easiest-way cards as how it works and drops the old 3-step section', () => {
    const html = inRouter(React.createElement(BelowFold));
    const anchor = html.indexOf('id="how-it-works-v3"');
    expect(anchor).toBeGreaterThan(-1);
    expect(html.indexOf('id="easiest-way-title"')).toBeGreaterThan(anchor);
    expect(html.indexOf('id="easiest-way-title"')).toBeLessThan(html.indexOf('data-section="founder_credibility"'));
    expect(html.match(/id="easiest-way-title"/g)).toHaveLength(1);
    expect(html).not.toContain('3 steps to your next viral video');
    expect(html).not.toContain('Know what to post next');
  });
});
