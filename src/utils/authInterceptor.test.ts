import { describe, expect, it, beforeAll, vi } from 'vitest';
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

// OAuth hydration test doubles. Without a DOM, run the hook's effect inline and stand in for the
// Redux/router hooks it calls.
const oauth = vi.hoisted(() => ({
  login: vi.fn(),
  updateAuthData: vi.fn(),
  setUserData: vi.fn(),
  navigate: vi.fn(),
}));
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useEffect: (effect: () => void) => { effect(); },
  useRef: <T,>(initial: T) => ({ current: initial }),
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => oauth.navigate,
}));
vi.mock('@/redux/hooks/use-auth', () => ({ useAuth: () => ({ login: oauth.login, updateAuthData: oauth.updateAuthData }) }));
vi.mock('@/redux/hooks/use-user', () => ({ useUser: () => ({ setUserData: oauth.setUserData }) }));
vi.mock('@/utils/toast', () => ({ SuccessNotification: vi.fn(), ErrorNotification: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

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
  location: { pathname: string; href: string; search: string };
};

let h: Harness;

beforeAll(async () => {
  vi.stubGlobal('localStorage', stubStorage);
  const location = { pathname: '/dashboard', href: '/dashboard', search: '' };
  vi.stubGlobal('window', { location, history: { replaceState: vi.fn() } });
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

describe('Google OAuth callback hydration', () => {
  const attackerData = encodeURIComponent(JSON.stringify({
    accessToken: 'attacker-token',
    user: { _id: 'attacker', role: 'user', email: 'attacker@evil.test' },
  }));

  // Serves /auth/me as the cookie session would: `me` is the signed-in user, or null for no cookie.
  const runCallback = async (me: { _id: string; role: string; email: string } | null) => {
    const seen: { url: string; auth: string }[] = [];
    const previous = h.Axios.defaults.adapter;
    h.Axios.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
      seen.push({ url: config.url ?? '', auth: String(config.headers?.Authorization ?? '') });
      if (me) return { data: { data: { user: me } }, status: 200, statusText: '200', headers: {}, config };
      throw Object.assign(new Error('HTTP 401'), { config, response: { status: 401, data: {}, config }, isAxiosError: true });
    };
    Object.values(oauth).forEach((fn) => fn.mockClear());
    memory.clear();
    h.location.pathname = '/auth/google/callback';
    h.location.search = `?auth=success&data=${attackerData}`;
    const replaceState = window.history.replaceState as ReturnType<typeof vi.fn>;
    replaceState.mockClear();
    // Stubbed only here: axios treats a global `document` as a browser when it loads.
    vi.stubGlobal('document', { title: 'Vireact' });
    try {
      // Renamed so the hook can run outside a component here (its effect is inlined above).
      const { useOAuthHydration: hydrateCallbackPage } = await import('@/redux/hooks/use-oauth-hydration');
      hydrateCallbackPage({ redirectOnSuccess: '/dashboard', redirectOnFailure: '/login' });
      await vi.waitFor(() => expect(oauth.navigate).toHaveBeenCalled());
    } finally {
      h.Axios.defaults.adapter = previous;
      vi.stubGlobal('document', undefined);
    }
    return { seen, replaceState };
  };

  it('ignores a token in the data param and signs in only through /auth/me', async () => {
    const { seen, replaceState } = await runCallback({ _id: 'victim', role: 'user', email: 'victim@b.co' });
    expect(seen.map((r) => r.url)).toEqual(['/auth/me']);
    expect(seen[0].auth).not.toContain('attacker-token');
    expect(oauth.updateAuthData).toHaveBeenCalledTimes(1);
    expect(oauth.updateAuthData.mock.calls[0][0]).toMatchObject({ token: '', user: { id: 'victim' } });
    expect(memory.get('accessToken')).toBeUndefined();
    expect(JSON.stringify([...memory.values()])).not.toContain('attacker');
    expect(replaceState).toHaveBeenCalledWith({}, 'Vireact', '/auth/google/callback');
    expect(oauth.navigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('without a session cookie the data param does not sign anyone in', async () => {
    const { replaceState } = await runCallback(null);
    expect(oauth.login).not.toHaveBeenCalled();
    expect(oauth.updateAuthData).not.toHaveBeenCalled();
    expect(memory.size).toBe(0);
    expect(replaceState).toHaveBeenCalledWith({}, 'Vireact', '/auth/google/callback');
    expect(oauth.navigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});

describe('verification email messages', () => {
  it('maps each backend outcome to its own message', async () => {
    const { outcomeNotice, readVerificationOutcome } = await import('@/lib/verification-email');
    expect(outcomeNotice('sent', 'a@b.co').message).toBe('We sent a link to a@b.co. Check spam and promotions too.');
    expect(outcomeNotice('recent', 'a@b.co').message).toContain('We just sent one');
    expect(outcomeNotice('bad_address', 'a@b.co')).toMatchObject({ canEditAddress: true, canResend: false });
    expect(outcomeNotice('unavailable', 'a@b.co')).toMatchObject({ tone: 'warning', canResend: true });
    expect(readVerificationOutcome({ verificationEmail: 'bad_address' })).toBe('bad_address');
    expect(readVerificationOutcome({ verificationEmailSent: false })).toBe('unavailable');
    expect(readVerificationOutcome({ verificationEmailSent: true })).toBe('sent');
    expect(readVerificationOutcome(undefined)).toBe('sent');
  });

  it('treats any 200 as verified and 400 as a bad link', async () => {
    const { readVerifyResponse, readVerifyError, resendErrorMessage } = await import('@/lib/verification-email');
    expect(readVerifyResponse({ success: true })).toBe('verified');
    expect(readVerifyResponse({ data: { status: 'already_verified' } })).toBe('already_verified');
    expect(readVerifyError({ response: { status: 400 } })).toBe('invalid_link');
    expect(readVerifyError({ response: { status: 429 } })).toBe('rate_limited');
    expect(readVerifyError(new Error('network'))).toBe('failed');
    expect(resendErrorMessage({ response: { status: 429 } }, 'x')).toContain('Too many attempts');
  });
});

describe('verify outcome: set a new password', () => {
  it('maps verified_set_password to the reset page and flags re-signups', async () => {
    const { readVerifyResponse, setPasswordPath, isResignup, outcomeNotice } = await import('@/lib/verification-email');
    const body = { data: { status: 'verified_set_password', resetToken: 'abc' } };
    expect(readVerifyResponse(body)).toBe('verified_set_password');
    expect(setPasswordPath(body)).toBe('/reset-password?token=abc');
    expect(setPasswordPath({ data: { status: 'verified_set_password' } })).toBeNull();
    const now = Date.parse('2026-01-01T00:10:00Z');
    expect(isResignup({ createdAt: '2026-01-01T00:00:00Z' }, now)).toBe(true);
    expect(isResignup({ createdAt: '2026-01-01T00:09:30Z' }, now)).toBe(false);
    expect(outcomeNotice('unavailable', 'a@b.co', true).message).toBe("We couldn't send the email right now. Try again in a few minutes.");
    expect(outcomeNotice('sent', 'a@b.co', true).message).toContain('newest email');
  });
});

describe('login: account needs a password', () => {
  it('recognises the SET_PASSWORD 409 and builds the forgot-password link', async () => {
    const { isSetPasswordLoginError, forgotPasswordPath } = await import('@/lib/verification-email');
    expect(isSetPasswordLoginError({ response: { status: 409, data: { data: { code: 'SET_PASSWORD' } } } })).toBe(true);
    expect(isSetPasswordLoginError({ response: { status: 409, data: { data: { code: 'USE_GOOGLE' } } } })).toBe(false);
    expect(isSetPasswordLoginError({ response: { status: 401 } })).toBe(false);
    expect(forgotPasswordPath('a+b@c.co')).toBe('/forgot-password?email=a%2Bb%40c.co');
  });
});

describe('changing the account email', () => {
  it('reads the pending change and writes the notices', async () => {
    const { readEmailChange, emailChangeSentMessage, needsPasswordForEmailChange } = await import('@/lib/verification-email');
    expect(readEmailChange({ emailChange: { pendingEmail: 'new@b.co', expiresAt: 'x' } })).toEqual({ pendingEmail: 'new@b.co', expiresAt: 'x' });
    expect(readEmailChange({ emailChange: null })).toBeNull();
    expect(readEmailChange(undefined)).toBeNull();
    expect(emailChangeSentMessage('new@b.co', 'old@b.co')).toBe(
      "Check new@b.co for a link to confirm your new email. Until then you'll keep signing in with old@b.co."
    );
    expect(needsPasswordForEmailChange('New@b.co', 'old@b.co', 'local')).toBe(true);
    expect(needsPasswordForEmailChange('OLD@b.co ', 'old@b.co', 'local')).toBe(false);
    expect(needsPasswordForEmailChange('new@b.co', 'old@b.co', 'google')).toBe(false);
  });

  it('gives a plain message for each profile error', async () => {
    const { profileUpdateErrorMessage, isSetPasswordFirstError } = await import('@/lib/verification-email');
    const err = (status: number) => ({ response: { status } });
    expect(profileUpdateErrorMessage(err(401))).toContain('not correct');
    expect(profileUpdateErrorMessage(err(403))).toContain('Google');
    const needsPassword = { response: { status: 403, data: { data: { code: 'SET_PASSWORD_FIRST' } } } };
    expect(profileUpdateErrorMessage(needsPassword)).toBe('Set a password first');
    expect(isSetPasswordFirstError(needsPassword)).toBe(true);
    expect(isSetPasswordFirstError(err(403))).toBe(false);
    expect(profileUpdateErrorMessage(err(409))).toBe('That email is already used by another account.');
    expect(profileUpdateErrorMessage(err(429))).toContain('Too many attempts');
    expect(profileUpdateErrorMessage(err(503))).toContain('Nothing was changed');
    expect(profileUpdateErrorMessage({ response: { status: 400, data: { message: 'Bad email' } } })).toBe('Bad email');
    expect(profileUpdateErrorMessage(new Error('network'))).toBe('Failed to update profile');
  });

  it('handles the confirm link response and errors', async () => {
    const { readConfirmedEmail, readConfirmEmailChangeError, CONFIRM_EMAIL_CHANGE_ERRORS, loginPathWithEmail } = await import('@/lib/verification-email');
    expect(readConfirmedEmail({ data: { email: 'new@b.co' } })).toBe('new@b.co');
    expect(readConfirmedEmail({ success: true })).toBeNull();
    expect(readConfirmEmailChangeError({ response: { status: 400 } })).toBe('invalid_link');
    expect(readConfirmEmailChangeError({ response: { status: 409 } })).toBe('email_taken');
    expect(readConfirmEmailChangeError({ response: { status: 500 } })).toBe('failed');
    expect(CONFIRM_EMAIL_CHANGE_ERRORS.invalid_link).toBe('This link is invalid or already used');
    expect(CONFIRM_EMAIL_CHANGE_ERRORS.email_taken).toBe('That email is already used by another account');
    expect(loginPathWithEmail('a+b@c.co')).toBe('/login?email=a%2Bb%40c.co');
  });
});
