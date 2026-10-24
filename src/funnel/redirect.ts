import type { Attribution } from './attribution';
import { isSessionId } from './session';

/** Destinations the backend may hand back after auth; anything else falls back. */
const POST_AUTH_PATHS = ['/dashboard', '/upload', '/start/trial', '/start/results'];

/** Accepts only same-site paths on the allow-list (query string allowed). */
export const safePostAuthPath = (raw: string | null | undefined, fallback = '/dashboard'): string => {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  const path = raw.split(/[?#]/)[0];
  return POST_AUTH_PATHS.includes(path) ? raw : fallback;
};

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

/** Backend OAuth start URL. `fs`/`attr` are only added when Funnel V2 is on. */
export const buildGoogleAuthUrl = (
  apiBase: string,
  redirectUrl: string,
  funnel?: { sessionId?: string | null; attribution?: Attribution | null }
): string => {
  const params = new URLSearchParams({ redirect: redirectUrl });
  if (funnel && isSessionId(funnel.sessionId)) params.set('fs', funnel.sessionId);
  if (funnel?.attribution) params.set('attr', toBase64Url(JSON.stringify(funnel.attribution)));
  return `${apiBase}/auth/google?${params.toString()}`;
};
