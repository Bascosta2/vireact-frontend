import { describe, expect, it } from 'vitest';
import { APP_NAV_SECTIONS, isNavActive, parseVideoPath, videoViewHref } from './app-nav';
import { completedVideos, pickHubVideo } from './video-hub';
import { viewBadges } from './nav-badges';
import { scriptAccessForPlan } from './plan-limits';

describe('sidebar', () => {
  it('groups the pages under headings, with the three video views under Your videos', () => {
    expect(APP_NAV_SECTIONS.map((s) => [s.label, s.items.map((i) => i.name)])).toEqual([
      [null, ['Home']],
      ['Your videos', ['Library', 'Feedback Reports', 'Personal Video Coach', 'Scripts']],
      ['Grow', ['Analytics', 'Editor']],
    ]);
  });

  it('reads the video and view from a video page address', () => {
    expect(parseVideoPath('/videos/abc')).toEqual({ videoId: 'abc', view: 'report' });
    expect(parseVideoPath('/videos/abc/coach')).toEqual({ videoId: 'abc', view: 'coach' });
    expect(parseVideoPath('/videos/abc/scripts/')).toEqual({ videoId: 'abc', view: 'scripts' });
    expect(parseVideoPath('/videos')).toBeNull();
    expect(parseVideoPath('/videos/abc/other')).toBeNull();
  });

  it('keeps the open video when switching views, and uses the hub pages elsewhere', () => {
    expect(videoViewHref('/videos/abc/coach', 'scripts')).toBe('/videos/abc/scripts');
    expect(videoViewHref('/videos/abc/scripts', 'report')).toBe('/videos/abc');
    expect(videoViewHref('/dashboard', 'coach')).toBe('/coach');
    expect(videoViewHref('/videos', 'report')).toBe('/reports');
  });

  it('highlights the view that is open, not Library', () => {
    expect(isNavActive('/videos/abc', '/reports')).toBe(true);
    expect(isNavActive('/videos/abc', '/videos')).toBe(false);
    expect(isNavActive('/videos/abc/coach', '/coach')).toBe(true);
    expect(isNavActive('/videos/abc/coach', '/reports')).toBe(false);
    expect(isNavActive('/scripts', '/scripts')).toBe(true);
    expect(isNavActive('/videos', '/videos')).toBe(true);
    expect(isNavActive('/videos', '/reports')).toBe(false);
  });
});

describe('hub pages', () => {
  const videos = [
    { _id: 'old', analysisStatus: 'completed', createdAt: '2026-11-01T00:00:00Z' },
    { _id: 'new', analysisStatus: 'completed', createdAt: '2026-11-10T00:00:00Z' },
    { _id: 'busy', analysisStatus: 'processing', createdAt: '2026-11-12T00:00:00Z' },
    { _id: 'bad', analysisStatus: 'failed', createdAt: '2026-11-13T00:00:00Z' },
  ];

  it('opens the last video this session if it is analysed, otherwise the newest', () => {
    expect(completedVideos(videos).map((v) => v._id)).toEqual(['new', 'old']);
    expect(pickHubVideo(videos, null).open?._id).toBe('new');
    expect(pickHubVideo(videos, 'old').open?._id).toBe('old');
    expect(pickHubVideo(videos, 'busy').open?._id).toBe('new');
    expect(pickHubVideo(videos, 'gone').open?._id).toBe('new');
  });

  it('shows the sample (and any running analysis) when nothing is analysed yet', () => {
    const none = pickHubVideo([videos[2], videos[3]], null);
    expect(none.open).toBeNull();
    expect(none.running?._id).toBe('busy');
    expect(pickHubVideo([], null)).toEqual({ open: null, running: null });
  });
});

describe('sidebar plan badges', () => {
  const base = { loaded: true };

  it('shows the scripts open on Free, and no badge on the coach (its full name needs the room)', () => {
    const b = viewBadges({ ...base, plan: 'free' });
    expect(b.scripts).toMatchObject({ text: '2/10', locked: true });
    expect(b.coach).toBeNull();
    expect(b.report).toBeNull();
  });

  it('shows 6/10 on Premium and nothing on Pro', () => {
    expect(viewBadges({ ...base, plan: 'premium' }).scripts?.text).toBe('6/10');
    expect(viewBadges({ ...base, plan: 'premium' }).coach).toBeNull();
    expect(viewBadges({ ...base, plan: 'pro' })).toEqual({ report: null, coach: null, scripts: null });
  });

  it('shows nothing until the plan has loaded', () => {
    expect(viewBadges({ ...base, plan: 'free', loaded: false })).toEqual({ report: null, coach: null, scripts: null });
  });

  it('matches the backend script access', () => {
    expect([scriptAccessForPlan('free'), scriptAccessForPlan('premium'), scriptAccessForPlan('pro'), scriptAccessForPlan('enterprise'), scriptAccessForPlan(null)]).toEqual([2, 6, 10, 10, 2]);
  });
});
