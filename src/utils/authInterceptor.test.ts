import { describe, expect, it, beforeAll, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

// Minimal browser globals: the auth store reads localStorage when it loads.
const memory = new Map<string, string>();
const stubStorage = {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => void memory.set(k, String(v)),
  removeItem: (k: string) => void memory.delete(k),
  clear: () => memory.clear(),
};

type Harness = {
  Axios: typeof import('@/api').default;
  calls: { refresh: number; api: string[] };
  setRefreshResult: (ok: boolean) => void;
  location: { pathname: string; href: string };
};

let h: Harness;

beforeAll(async () => {
  vi.stubGlobal('localStorage', stubStorage);
  const location = { pathname: '/dashboard', href: '/dashboard' };
  vi.stubGlobal('window', { location });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});

  const { default: Axios } = await import('@/api');
  const { store } = await import('@/redux/store');
  const { setIsAuthenticated } = await import('@/redux/slices/auth-slice');
  const { setupAuthInterceptors } = await import('./authInterceptor');

  const calls = { refresh: 0, api: [] as string[] };
  let refreshOk = true;
  // Fake server: any request with the old token gets 401; the refresh issues "fresh-token".
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';
    const respond = (status: number, data: unknown) => {
      const response = { data, status, statusText: String(status), headers: {}, config };
      if (status >= 400) {
        const error = Object.assign(new Error(`HTTP ${status}`), { config, response, isAxiosError: true });
        throw error;
      }
      return response;
    };
    if (url.endsWith('/auth/refresh-token')) {
      calls.refresh++;
      await new Promise((r) => setTimeout(r, 20));
      return refreshOk ? respond(200, { success: true, data: { accessToken: 'fresh-token' } }) : respond(401, { success: false });
    }
    calls.api.push(url);
    const auth = String(config.headers?.Authorization ?? '');
    return auth === 'Bearer fresh-token' ? respond(200, { ok: url }) : respond(401, { message: 'Token expired' });
  };
  Axios.defaults.adapter = adapter;
  store.dispatch(setIsAuthenticated(true));
  setupAuthInterceptors();
  h = { Axios, calls, setRefreshResult: (ok) => { refreshOk = ok; }, location };
});

describe('auth interceptor', () => {
  it('three parallel requests with an expired token share ONE refresh and all succeed', async () => {
    const results = await Promise.all(['/videos', '/subscription', '/videos/v1'].map((u) => h.Axios.get(u)));
    expect(h.calls.refresh).toBe(1);
    expect(results.map((r) => r.data.ok)).toEqual(['/videos', '/subscription', '/videos/v1']);
  });

  it('when the refresh itself fails, the user is signed out and sent to /login', async () => {
    const { store } = await import('@/redux/store');
    const { setAuthData } = await import('@/redux/slices/auth-slice');
    store.dispatch(setAuthData({ token: 'expired', role: 'user', user: null }));
    h.setRefreshResult(false);
    h.calls.refresh = 0;
    await expect(h.Axios.get('/videos')).rejects.toBeTruthy();
    expect(h.calls.refresh).toBe(1);
    expect(store.getState().auth.isAuthenticated).toBe(false);
    expect(h.location.href).toBe('/login');
  });

  it('a signed-out visitor is never redirected or refreshed', async () => {
    h.location.href = '/pricing';
    h.calls.refresh = 0;
    await expect(h.Axios.get('/videos')).rejects.toBeTruthy();
    expect(h.calls.refresh).toBe(0);
    expect(h.location.href).toBe('/pricing');
  });
});
