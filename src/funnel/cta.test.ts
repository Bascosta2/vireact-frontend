import { afterEach, describe, expect, it, vi } from 'vitest';
import { primaryCtaHref, primaryCtaPath } from './cta';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('primaryCtaPath / primaryCtaHref', () => {
  it('sends logged-out visitors to /signup when VITE_FUNNEL_V2 is off', () => {
    vi.stubEnv('VITE_FUNNEL_V2', 'false');
    expect(primaryCtaPath()).toBe('/signup');
    expect(primaryCtaHref('https://www.vireact.io/')).toBe('/signup');
  });

  it('sends visitors to the quiz at /start when VITE_FUNNEL_V2 is on', () => {
    vi.stubEnv('VITE_FUNNEL_V2', 'true');
    expect(primaryCtaPath()).toBe('/start');
    expect(primaryCtaHref('https://www.vireact.io/?ref=abc')).toBe('/start?ref=abc');
  });

  it('preserves ref and utm_* params on the CTA href', () => {
    vi.stubEnv('VITE_FUNNEL_V2', 'false');
    const href = primaryCtaHref('https://www.vireact.io/?ref=creator123&utm_source=tiktok&utm_campaign=test&other=ignored');
    expect(href.split('?')[1]).toBe('ref=creator123&utm_source=tiktok&utm_campaign=test');
  });

  it('omits non-marketing params from the CTA href', () => {
    vi.stubEnv('VITE_FUNNEL_V2', 'false');
    expect(primaryCtaHref('https://www.vireact.io/?foo=bar&baz=qux')).toBe('/signup');
  });
});
