import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { APP_NAV_SECTIONS, isNavActive, parseVideoPath, videoViewHref } from './app-nav';
import { isPublishingFlagOn, publishingAvailable, usePublishingAccess } from './publishing-access';
import { getPostCapabilities } from '@/api/posts';
import { buildAgenda, dateKeyInZone, matchSlotsToPosts, platformChoices, weekDays, weekRange, zonedToUtcIso } from '@/pages/User/Analytics/schedule';
import type { StrategySlot } from '@/api/analytics';
import type { PostCapabilities, ScheduledPost } from '@/api/posts';
import { completedVideos, pickHubVideo } from './video-hub';
import { viewBadges } from './nav-badges';
import { scriptAccessForPlan } from './plan-limits';

vi.mock('@/redux/hooks/use-user', () => ({ useUser: () => ({ id: 'user-1' }) }));
vi.mock('@/api/posts', () => ({ getPostCapabilities: vi.fn(() => Promise.resolve({ enabled: true, platforms: [] })) }));

describe('sidebar', () => {
  it('groups the pages under headings, with the three video views under Your videos', () => {
    expect(APP_NAV_SECTIONS.map((s) => [s.label, s.items.map((i) => i.name)])).toEqual([
      [null, ['Home']],
      ['Your videos', ['Library', 'Feedback Reports', 'Personal Video Coach', 'Scripts']],
      ['Grow', ['Analytics', 'Skills Editor', 'Accounts']],
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

vi.mock('@/redux/hooks/use-user', () => ({ useUser: () => ({ id: '' }) }));


const mkSlot = (id: string, date: string, timeLocal: string, platform = 'tiktok'): StrategySlot =>
  ({ id, date, timeLocal, platform, title: id, status: 'planned' }) as StrategySlot;
const mkPost = (id: string, scheduledAt: string, platform = 'tiktok', status: ScheduledPost['status'] = 'scheduled'): ScheduledPost => ({
  id,
  mediaUrl: 'u',
  caption: '',
  scheduledAt,
  status,
  mode: 'publish',
  targets: [{ platform: platform as 'tiktok', status: 'scheduled' }],
  createdAt: scheduledAt,
  updatedAt: scheduledAt,
});

describe('post scheduling logic', () => {
  it('makes no request and stays denied when VITE_PUBLISHING is not true', () => {
    vi.stubEnv('VITE_PUBLISHING', '');
    function Probe() {
      return createElement('span', null, usePublishingAccess().access);
    }
    expect(renderToString(createElement(Probe))).toContain('denied');
    expect(getPostCapabilities).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  const tz = 'America/New_York';

  it('converts wall-clock time in a zone to UTC and back to the same day', () => {
    expect(zonedToUtcIso('2026-11-24', '09:00', tz)).toBe('2026-11-24T14:00:00.000Z');
    expect(dateKeyInZone('2026-11-25T03:30:00Z', tz)).toBe('2026-11-24');
    expect(zonedToUtcIso('bad', '09:00', tz)).toBeNull();
  });

  it('builds week ranges and day keys', () => {
    expect(weekDays('2026-11-22')[6]).toBe('2026-11-28');
    expect(weekRange('2026-11-22', 'UTC')).toEqual({ from: '2026-11-22T00:00:00.000Z', to: '2026-11-29T00:00:00.000Z' });
  });

  it('matches a post to the nearest same-day slot on its platform, one post per slot', () => {
    const slots = [mkSlot('a', '2026-11-24', '09:00'), mkSlot('b', '2026-11-24', '09:30'), mkSlot('c', '2026-11-24', '09:00', 'instagram')];
    const posts = [mkPost('p1', '2026-11-24T14:25:00Z')];
    expect([...matchSlotsToPosts(slots, posts, tz)]).toEqual([['b', 'p1']]);
  });

  it('merges slots and posts per day, skipping cancelled posts and not duplicating matched ones', () => {
    const slots = [mkSlot('a', '2026-11-24', '09:00')];
    const posts = [mkPost('p1', '2026-11-24T14:00:00Z'), mkPost('p2', '2026-11-25T20:00:00Z'), mkPost('p3', '2026-11-25T21:00:00Z', 'tiktok', 'cancelled')];
    const days = buildAgenda(['2026-11-24', '2026-11-25'], slots, posts, tz);
    expect(days[0].items.map((i) => i.kind)).toEqual(['slot']);
    expect(days[0].items[0].kind === 'slot' && days[0].items[0].post?.id).toBe('p1');
    expect(days[1].items.map((i) => i.key)).toEqual(['post-p2']);
  });

  it('gates on the build flag and the server switch, and explains disabled platforms', () => {
    const caps: PostCapabilities = {
      enabled: true,
      platforms: [
        { platform: 'tiktok', connected: true, canPublish: true },
        { platform: 'instagram', connected: false, canPublish: false, reason: 'not_connected' },
      ],
    };
    expect(isPublishingFlagOn(undefined)).toBe(false);
    expect(isPublishingFlagOn('true')).toBe(true);
    expect(publishingAvailable(false, caps)).toBe(false);
    expect(publishingAvailable(true, { ...caps, enabled: false })).toBe(false);
    expect(publishingAvailable(true, caps)).toBe(true);
    const choices = platformChoices(caps);
    expect(choices.find((c) => c.platform === 'tiktok')?.disabled).toBe(false);
    expect(choices.find((c) => c.platform === 'instagram')?.reason).toMatch(/Accounts page/);
    expect(choices.find((c) => c.platform === 'youtube')?.disabled).toBe(true);
  });
});
