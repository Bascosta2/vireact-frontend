import { describe, expect, it } from 'vitest';
import { QUIZ_QUESTIONS, firstUnanswered, isQuizComplete, isValidAnswer } from './quiz.config';
import { parseFunnelState } from './session';
import { buildGoogleAuthUrl, safePostAuthPath } from './redirect';
import { isSharedPath } from '@/routes/shared-paths';

const SESSION = '3f1c2b7e-8a4d-4c1f-9b2e-0d5a6c7e8f90';
const FULL = Object.fromEntries(QUIZ_QUESTIONS.map((q) => [q.key, q.options[0].value]));

describe('quiz config', () => {
  it('has six questions with unique keys and enough tap targets', () => {
    expect(QUIZ_QUESTIONS.map((q) => q.key)).toEqual(['platform', 'niche', 'followers', 'problem', 'cadence', 'persona']);
    for (const q of QUIZ_QUESTIONS) expect(q.options.length).toBeGreaterThanOrEqual(3);
  });

  it('tracks progress and completion', () => {
    expect(firstUnanswered({})).toBe(0);
    expect(firstUnanswered({ platform: 'tiktok', niche: 'bogus' })).toBe(1);
    expect(isQuizComplete(FULL)).toBe(true);
    expect(firstUnanswered(FULL)).toBe(QUIZ_QUESTIONS.length);
    expect(isValidAnswer('problem', 'mid_video_dropoff')).toBe(true);
    expect(isValidAnswer('problem', 'everything')).toBe(false);
  });
});

describe('funnel local state', () => {
  it('drops unknown answers and malformed session ids', () => {
    const raw = JSON.stringify({ sessionId: 'abc', answers: { platform: 'tiktok', niche: '<script>', extra: 1 }, completed: 'yes' });
    expect(parseFunnelState(raw)).toEqual({ sessionId: null, answers: { platform: 'tiktok' }, completed: false });
  });

  it('keeps a valid saved session', () => {
    const raw = JSON.stringify({ sessionId: SESSION, answers: FULL, completed: true });
    expect(parseFunnelState(raw)).toEqual({ sessionId: SESSION, answers: FULL, completed: true });
    expect(parseFunnelState('not json').sessionId).toBeNull();
    expect(parseFunnelState(null).answers).toEqual({});
  });
});

describe('post-auth redirect', () => {
  it('only accepts allow-listed same-site paths', () => {
    expect(safePostAuthPath('/upload?onboarding=1')).toBe('/upload?onboarding=1');
    expect(safePostAuthPath('/dashboard')).toBe('/dashboard');
    expect(safePostAuthPath('//evil.example/upload')).toBe('/dashboard');
    expect(safePostAuthPath('https://evil.example')).toBe('/dashboard');
    expect(safePostAuthPath('/admin', '/videos')).toBe('/videos');
    expect(safePostAuthPath(null)).toBe('/dashboard');
  });

  it('adds fs and base64url attribution to the Google URL only when given', () => {
    const plain = buildGoogleAuthUrl('/api/v1', 'https://vireact.io/auth/google/callback');
    expect(plain).toBe('/api/v1/auth/google?redirect=https%3A%2F%2Fvireact.io%2Fauth%2Fgoogle%2Fcallback');

    const url = new URL(
      buildGoogleAuthUrl('https://api.vireact.io/api/v1', 'https://vireact.io/x', { sessionId: SESSION, attribution: { utm_source: 'tiktok' } })
    );
    expect(url.searchParams.get('fs')).toBe(SESSION);
    const attr = url.searchParams.get('attr') as string;
    expect(attr).not.toMatch(/[+/=]/);
    const decoded = atob(attr.replace(/-/g, '+').replace(/_/g, '/'));
    expect(JSON.parse(decoded)).toEqual({ utm_source: 'tiktok' });

    const bad = new URL(buildGoogleAuthUrl('https://api.vireact.io/api/v1', 'https://vireact.io/x', { sessionId: 'nope' }));
    expect(bad.searchParams.has('fs')).toBe(false);
  });
});

describe('shared paths', () => {
  it('matches /start and its children only', () => {
    expect(isSharedPath('/start')).toBe(true);
    expect(isSharedPath('/start/results')).toBe(true);
    expect(isSharedPath('/starter')).toBe(false);
    expect(isSharedPath('/')).toBe(false);
  });
});
