import { describe, expect, it, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResultsBand } from './ResultsBand';
import { claims } from '@/content/claims';

describe('Landing V3 claims gating', () => {
  beforeEach(() => {
    const headline = claims.headlineViews as unknown as { value: string; label: string; verified: boolean };
    headline.value = '';
    headline.label = '';
    headline.verified = false;
  });

  it('hides headline views band when the claim is not verified', () => {
    const html = renderToStaticMarkup(React.createElement(ResultsBand));
    expect(html).toBe('');
  });

  it('renders headline views band when the claim is verified', () => {
    const headline = claims.headlineViews as unknown as { value: string; label: string; verified: boolean };
    headline.value = '200M+';
    headline.label = 'views analysed across the creator accounts Vireact is trained on.';
    headline.verified = true;
    const html = renderToStaticMarkup(React.createElement(ResultsBand));
    expect(html).toContain('200M+');
    expect(html).toContain('views analysed');
  });
});

