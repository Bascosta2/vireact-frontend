import { describe, expect, it } from 'vitest';
import { parseAttribution } from './analytics';

const HOST = 'vireact.io';

describe('parseAttribution', () => {
  it('captures UTM params, external referrer host, and landing path', () => {
    const result = parseAttribution(
      '?utm_source=tiktok&utm_medium=paid&utm_campaign=launch&other=1',
      'https://www.tiktok.com/@vireact/video/123',
      '/pricing',
      HOST
    );
    expect(result).toEqual({
      utm_source: 'tiktok',
      utm_medium: 'paid',
      utm_campaign: 'launch',
      referrer: 'www.tiktok.com',
      landing_path: '/pricing',
    });
  });

  it('returns null for direct traffic and same-site referrers', () => {
    expect(parseAttribution('', '', '/', HOST)).toBeNull();
    expect(parseAttribution('', `https://${HOST}/features`, '/', HOST)).toBeNull();
    expect(parseAttribution('?utm_source=%20%20', 'not a url', '/', HOST)).toBeNull();
  });

  it('clips oversized values', () => {
    const result = parseAttribution(`?utm_source=${'a'.repeat(500)}`, '', '/', HOST);
    expect(result?.utm_source).toHaveLength(200);
  });
});
