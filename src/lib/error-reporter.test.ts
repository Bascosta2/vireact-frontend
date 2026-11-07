import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reportClientError, resetErrorReporterForTests, shouldReport } from './error-reporter';

describe('error reporter (safety net)', () => {
  const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));

  beforeEach(() => {
    resetErrorReporterForTests();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('window', { location: { href: 'https://www.vireact.io/videos', pathname: '/videos' } });
    vi.stubGlobal('localStorage', { getItem: (k: string) => (k === 'accessToken' ? 'tok' : null) });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('ignores browser noise and errors handled elsewhere', () => {
    expect(shouldReport('ResizeObserver loop completed with undelivered notifications.')).toBe(false);
    expect(shouldReport('Script error.')).toBe(false);
    expect(shouldReport('Failed to fetch dynamically imported module: /assets/x.js')).toBe(false);
    expect(shouldReport('x', 'at chrome-extension://abc/content.js:1')).toBe(false);
    expect(shouldReport("Cannot read properties of undefined (reading 'score')")).toBe(true);
  });

  it('sends one report per distinct error, with the user token and page', async () => {
    reportClientError(new TypeError('boom'), 'crash');
    reportClientError(new TypeError('boom'), 'crash');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/v1\/client-errors$/);
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ message: 'boom', kind: 'crash', route: '/videos' });
  });

  it('caps reports per page load so a broken page cannot flood the server', () => {
    for (let i = 0; i < 40; i++) reportClientError(new Error(`error ${i}`));
    expect(fetchMock).toHaveBeenCalledTimes(15);
  });

  it('never throws, even if sending fails', () => {
    vi.stubGlobal('fetch', () => {
      throw new Error('blocked');
    });
    expect(() => reportClientError(new Error('x'))).not.toThrow();
  });
});
