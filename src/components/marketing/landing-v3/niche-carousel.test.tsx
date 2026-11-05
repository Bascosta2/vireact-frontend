import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { nicheData } from '@/components/FeaturesPage/Niches/niche-data';
import { NicheVideoCarousel } from './NicheVideoCarousel';

const marquee = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));

// react-fast-marquee renders nothing until mounted, so capture the props instead.
vi.mock('@/components/UI/Marquee', () => ({
  default: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    marquee.props = props;
    return React.createElement('div', { 'data-marquee': '' }, props.children);
  },
}));

describe('niche video carousel', () => {
  it('keeps moving on hover and click and has no pause button', () => {
    const html = renderToStaticMarkup(React.createElement(NicheVideoCarousel));
    expect(marquee.props).not.toBeNull();
    expect(marquee.props?.pauseOnHover).toBeFalsy();
    expect(marquee.props?.play).not.toBe(false);
    expect(html).not.toMatch(/pause/i);
    expect(html.match(/<img /g)).toHaveLength(nicheData.length);
  });
});
