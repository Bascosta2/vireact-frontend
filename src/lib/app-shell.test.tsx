import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { matchesVideoQuery, parseVideoQuery, removeQueryToken, videoState, type SearchableVideo } from './video-query';
import { isMachineName, videoName, displayVideoTitle } from './video-file';
import { buildNotices } from './notifications';
import { forgetRecent, rememberRecent, renameRecent, resetRecentForTests, togglePinned } from './recent-items';
import { APP_COMMANDS, commandForShortcut, matchCommands } from './app-commands';
import { updatedLabel } from './updated-label';
import { DEFAULT_HOME_LAYOUT, isDefaultLayout, moveWidget, sanitizeLayout, setWidgetHidden } from '@/pages/User/Dashboard/home-layout';
import { videoHistory } from '@/pages/User/Chat/video-history';
import { MetricCard } from '@/components/app/MetricCard';
import { VideoThumb } from '@/components/app/VideoThumb';
import type { Video } from '@/api/video';

const NOW = Date.parse('2026-11-25T12:00:00Z');
const day = (n: number) => new Date(NOW - n * 86_400_000).toISOString();

const v = (id: string, extra: Partial<SearchableVideo> = {}): SearchableVideo => ({
  _id: id,
  filename: `${id}.mp4`,
  analysisStatus: 'completed',
  viralityScore: 50,
  actualViews: null,
  createdAt: day(1),
  ...extra,
});

describe('video names', () => {
  it('knows which file names say nothing about the video', () => {
    for (const name of ['6a43f54b-85f4-4941-9c1d-0f6a3a1b2c3d.mp4', 'AQN38npVxbRSZEkqLpZt0aaBbCcDdEe.mp4', 'ScreenRecording 10-12-2026 14-03-22.mov', 'IMG_4821.MOV', 'RPReplay_Final1699123.mp4', 'trim.6F2C1A.mov', '']) {
      expect(isMachineName(name), name).toBe(true);
    }
    for (const name of ['My hook tips.mp4', 'gym transformation day 30.mov', 'Why your hooks fail']) {
      expect(isMachineName(name), name).toBe(false);
    }
  });

  it('prefers the creator name, then the platform title, then a readable file, then the first spoken words, then the date', () => {
    const base = { filename: 'ScreenRecording 10-12-2026 14-03.mov', createdAt: '2026-11-12T10:00:00Z' };
    expect(videoName({ ...base, title: 'My best hook', sourceTitle: 'x', autoTitle: 'y' })).toBe('My best hook');
    expect(videoName({ ...base, sourceTitle: 'POV: you finally post daily' })).toBe('POV: you finally post daily');
    expect(videoName({ filename: 'gym_day_30.mp4', autoTitle: 'hello there' })).toBe('Gym day 30');
    expect(videoName({ ...base, autoTitle: 'so here is why your hooks fail' })).toBe('“So here is why your hooks fail”');
    expect(videoName(base)).toMatch(/^Video from /);
    expect(displayVideoTitle('IMG_4821.MOV', '2026-11-12T10:00:00Z')).toMatch(/^Video from /);
  });
});

describe('search filters', () => {
  const videos = [
    v('a', { viralityScore: 32, creatorPlatform: 'tiktok', title: 'Morning routine' }),
    v('b', { viralityScore: 71, actualViews: 12000, createdAt: '2026-10-03T10:00:00Z' }),
    v('c', { analysisStatus: 'processing', viralityScore: null }),
    v('d', { analysisStatus: 'failed', viralityScore: null }),
  ];
  const find = (q: string) => videos.filter((x) => matchesVideoQuery(x, parseVideoQuery(q))).map((x) => x._id);

  it('reads score, status, platform, date and needs filters, and plain words', () => {
    expect(find('score:<40')).toEqual(['a']);
    expect(find('score:>=70')).toEqual(['b']);
    expect(find('status:ready')).toEqual(['a', 'b']);
    expect(find('status:failed')).toEqual(['d']);
    expect(find('is:analyzing')).toEqual(['c']);
    expect(find('needs:views')).toEqual(['a']);
    expect(find('platform:tiktok')).toEqual(['a']);
    expect(find('date:2026/10')).toEqual(['b']);
    expect(find('morning')).toEqual(['a']);
    expect(find('morning status:failed')).toEqual([]);
  });

  it('keeps unknown filters as words and labels known ones for chips', () => {
    const q = parseVideoQuery('score:<40 color:red hooks');
    expect(q.tokens.map((t) => t.label)).toEqual(['Score under 40']);
    expect(q.text).toBe('color:red hooks');
    expect(removeQueryToken('score:<40 status:ready hooks', 'status:ready')).toBe('score:<40 hooks');
  });

  it('names where each video is', () => {
    expect(videos.map(videoState)).toEqual(['needs-views', 'ready', 'analyzing', 'failed']);
  });
});

describe('notifications', () => {
  it('shows finished and failed analyses this week and one reminder to log views', () => {
    const list = [
      { ...v('new', { viralityScore: 44, createdAt: day(0.1) }), updatedAt: day(0.05) },
      { ...v('bad', { analysisStatus: 'failed', createdAt: day(1) }), updatedAt: day(1) },
      { ...v('old1', { createdAt: day(5) }), updatedAt: day(5) },
      { ...v('old2', { createdAt: day(20) }), updatedAt: day(20) },
      { ...v('logged', { createdAt: day(9), actualViews: 900 }), updatedAt: day(9) },
    ];
    const notices = buildNotices(list, NOW);
    expect(notices.map((n) => n.kind)).toEqual(['finished', 'failed', 'log-views', 'finished']);
    expect(notices[0].body).toContain('Score 44');
    const views = notices.find((n) => n.kind === 'log-views')!;
    expect(views.body).toBe('2 videos are waiting for their real views.');
    expect(views.href).toBe('/analytics?tab=videos&log=old1');
    expect(buildNotices([], NOW)).toEqual([]);
  });
});

describe('recently opened', () => {
  const store = new Map<string, string>();
  beforeEach(() => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, val: string) => void store.set(k, val),
      removeItem: (k: string) => void store.delete(k),
    };
    resetRecentForTests();
  });
  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  const ids = () => (JSON.parse(store.get('vireact_recent_items_v1') ?? '[]') as { id: string; title: string; pinned?: boolean }[]).map((x) => `${x.pinned ? '*' : ''}${x.id}`);

  it('keeps the newest six, moves a reopened one to the top, and keeps pinned ones first', () => {
    for (let i = 1; i <= 8; i += 1) rememberRecent({ id: `v${i}`, title: `Video ${i}`, href: `/videos/${i}` });
    expect(ids()).toEqual(['v8', 'v7', 'v6', 'v5', 'v4', 'v3']);
    rememberRecent({ id: 'v5', title: 'Video 5', href: '/videos/5' });
    expect(ids()[0]).toBe('v5');
    togglePinned('v3');
    rememberRecent({ id: 'v9', title: 'Video 9', href: '/videos/9' });
    expect(ids().slice(0, 2)).toEqual(['*v3', 'v9']);
    rememberRecent({ id: 'v3', title: 'Renamed', href: '/videos/3' });
    expect(ids()[0]).toBe('*v3');
    renameRecent('v9', 'Nine');
    expect((JSON.parse(store.get('vireact_recent_items_v1')!) as { id: string; title: string }[]).find((x) => x.id === 'v9')!.title).toBe('Nine');
    forgetRecent('v9');
    expect(ids()).not.toContain('v9');
  });
});

describe('commands and shortcuts', () => {
  const all = () => true;
  it('finds pages and actions by name or keyword, and hides beta ones from accounts without them', () => {
    expect(matchCommands('upload', all).map((c) => c.id)).toContain('new-analysis');
    expect(matchCommands('posting plan', all).map((c) => c.id)).toEqual(['analytics-strategy']);
    const noBeta = (c: (typeof APP_COMMANDS)[number]) => !c.requires;
    expect(matchCommands('skills', noBeta)).toEqual([]);
    expect(commandForShortcut('c', 'a', all)?.href).toBe('/new');
    expect(commandForShortcut('g', 'l', all)?.href).toBe('/videos');
    expect(commandForShortcut('c', 't', noBeta)).toBeUndefined();
  });
  it('gives every shortcut to one command only', () => {
    const shortcuts = APP_COMMANDS.map((c) => c.shortcut).filter(Boolean);
    expect(new Set(shortcuts).size).toBe(shortcuts.length);
  });
});

describe('home layout', () => {
  it('moves and hides cards, and repairs old saved layouts', () => {
    let l = sanitizeLayout(null);
    expect(isDefaultLayout(l)).toBe(true);
    l = moveWidget(l, 'recent', -1);
    expect(l.order.slice(0, 3)).toEqual(['next', 'recent', 'metrics']);
    l = setWidgetHidden(l, 'metrics', true);
    // Moving skips hidden cards.
    expect(moveWidget(l, 'plan', -1).order.indexOf('plan')).toBeLessThan(moveWidget(l, 'plan', -1).order.indexOf('recent'));
    expect(moveWidget(l, 'next', -1)).toBe(l);
    expect(sanitizeLayout({ order: ['guide', 'nope', 'guide'], hidden: ['plan', 'x'] })).toEqual({ order: ['guide', 'next', 'metrics', 'recent', 'plan'], hidden: ['plan'] });
    expect(DEFAULT_HOME_LAYOUT.order[0]).toBe('next');
  });
});

describe('video history', () => {
  it('tells the story of a video and what is still to do', () => {
    const video = { _id: 'x', filename: 'a.mp4', fileSize: 5_000_000, duration: 34, analysisStatus: 'completed', viralityScore: 41, selectedFeatures: ['hook', 'pacing'], createdAt: day(3), scriptSuggestions: [], postedAt: null, actualViews: null } as unknown as Video;
    const steps = videoHistory(video);
    expect(steps.map((s) => [s.id, s.done])).toEqual([
      ['uploaded', true],
      ['analyzed', true],
      ['scripts', false],
      ['posted', false],
      ['views', false],
    ]);
    expect(steps[1].label).toBe('Analyzed, score 41');
    expect(steps[0].detail).toBe('0:34 · 4.8 MB');
    expect(steps[4].action?.to).toBe('/analytics?tab=videos&log=x');
    const later = videoHistory({ ...video, postedAt: day(1), creatorPlatform: 'tiktok', actualViews: 12400 } as Video);
    expect(later[3].label).toBe('Posted on TikTok');
    expect(later[4].label).toBe('12.4K real views logged');
  });
});

describe('small pieces', () => {
  it('says how fresh the numbers are', () => {
    expect(updatedLabel(NOW - 10_000, NOW)).toBe('Updated just now');
    expect(updatedLabel(NOW - 4 * 60_000, NOW)).toBe('Updated 4 min ago');
    expect(updatedLabel(null, NOW)).toBeNull();
  });
  it('draws a metric card with its change, help and link', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <MetricCard label="Average score" term="viralityScore" value={42.7} delta={3} caption="39.7 in the previous 30 days" series={[30, 35, 40]} updated="Updated just now" href="/analytics" />
      </MemoryRouter>
    );
    expect(html).toContain('42.7');
    expect(html).toContain('+3');
    expect(html).toContain('What is average score?');
    expect(html).toContain('Updated just now');
    expect(html).toContain('href="/analytics"');
  });
  it('shows a tile, not a broken image, when a video has no picture', () => {
    expect(renderToStaticMarkup(<VideoThumb video={{ _id: 'a', thumbnailUrl: null }} />)).not.toContain('<img');
    const img = renderToStaticMarkup(<VideoThumb video={{ _id: 'a', thumbnailUrl: 'https://x/t.jpg' }} />);
    expect(img).toContain('src="https://x/t.jpg"');
    expect(img).toContain('no-referrer');
  });
});
