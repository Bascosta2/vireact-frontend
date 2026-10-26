import { describe, expect, it, beforeEach } from 'vitest';
import { primaryCtaHref, primaryCtaPath } from './cta';

describe('primaryCtaPath / primaryCtaHref', () => {
  beforeEach(() => {
    (import.meta as any).env.VITE_FUNNEL_V2 = 'false';
  });

  it('preserves ref and utm_* params on the CTA href', () => {
    const href = primaryCtaHref('https://www.vireact.io/?ref=creator123&utm_source=tiktok&utm_campaign=test&other=ignored');
    const [, query] = href.split('?');
    expect(query).toBe('ref=creator123&utm_source=tiktok&utm_campaign=test');
  });

  it('omits non-marketing params from the CTA href', () => {
    const href = primaryCtaHref('https://www.vireact.io/?foo=bar&baz=qux');
    expect(href).toBe('/signup');
  });
});

