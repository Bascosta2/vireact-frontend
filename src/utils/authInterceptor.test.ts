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
    const { profileUpdateErrorMessage } = await import('@/lib/verification-email');
    const err = (status: number) => ({ response: { status } });
    expect(profileUpdateErrorMessage(err(401))).toContain('not correct');
    expect(profileUpdateErrorMessage(err(403))).toContain('Google');
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
