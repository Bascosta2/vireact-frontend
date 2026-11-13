import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProductDemo } from './ProductDemo';
import { CLIPS, DEMO_STEPS } from './product-demo-steps';

describe('ProductDemo', () => {
  const html = renderToStaticMarkup(React.createElement(ProductDemo));

  it('renders one tab per step with the first selected', () => {
    expect(html.match(/role="tab"/g)).toHaveLength(DEMO_STEPS.length);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain(`id="pd-tab-${DEMO_STEPS[0].id}" type="button" role="tab" aria-selected="true"`);
  });

  it('describes the current step for screen readers and hides the animation', () => {
    expect(html).toContain(`<p class="sr-only">${DEMO_STEPS[0].sr}</p>`);
    expect(html).toMatch(/class="pd-stage[^"]*" aria-hidden="true"/);
  });

  it('labels the demo as an example and offers a pause control', () => {
    expect(html).toContain('Example');
    expect(html).toContain('aria-label="Pause demo"');
  });

  it('plays the client vlog in the first step, muted with a poster frame', () => {
    expect(html).toContain(`src="${CLIPS.vlog.src}"`);
    expect(html).toContain(`poster="${CLIPS.vlog.poster}"`);
    expect(html).toMatch(/<video[^>]*muted/);
  });

  it('starts paused until scrolled into view', () => {
    expect(html).toContain('data-paused="true"');
  });

  it('every step has a title, screen-reader text and a duration', () => {
    for (const s of DEMO_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.sr.length).toBeGreaterThan(20);
      expect(s.ms).toBeGreaterThanOrEqual(3000);
    }
    const loop = DEMO_STEPS.reduce((sum, s) => sum + s.ms, 0);
    expect(loop).toBeLessThanOrEqual(24000);
  });
});
