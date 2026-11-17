import { BarChart3, Clapperboard, FileBarChart, Home, Library, MessageSquare, ScrollText, Settings, type LucideIcon } from 'lucide-react';

export interface AppNavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

export interface AppNavSection {
  id: string;
  /** Small heading above the group; null for the top group. */
  label: string | null;
  items: AppNavItem[];
}

/** The three views of one analysed video. The sidebar opens them on the current (or latest) video. */
export type VideoViewId = 'report' | 'coach' | 'scripts';

/** Path suffix of each view on a video page: /videos/:id, /videos/:id/coach, /videos/:id/scripts. */
export const VIDEO_VIEW_SUFFIX: Record<VideoViewId, string> = { report: '', coach: '/coach', scripts: '/scripts' };

/** Sidebar entry points that pick a video for the person, then open that view. */
export const VIDEO_HUB_PATH: Record<VideoViewId, string> = { report: '/reports', coach: '/coach', scripts: '/scripts' };

export const APP_NAV_SECTIONS: AppNavSection[] = [
  { id: 'main', label: null, items: [{ id: 'home', name: 'Home', icon: Home, href: '/dashboard' }] },
  {
    id: 'videos',
    label: 'Your videos',
    items: [
      { id: 'library', name: 'Library', icon: Library, href: '/videos' },
      { id: 'report', name: 'Feedback Reports', icon: FileBarChart, href: VIDEO_HUB_PATH.report },
      { id: 'coach', name: 'Personal Video Coach', icon: MessageSquare, href: VIDEO_HUB_PATH.coach },
      { id: 'scripts', name: 'Scripts', icon: ScrollText, href: VIDEO_HUB_PATH.scripts },
    ],
  },
  {
    id: 'grow',
    label: 'Grow',
    items: [
      { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/analytics' },
      { id: 'editor', name: 'Editor', icon: Clapperboard, href: '/editor' },
    ],
  },
];

/** Settings sits in the sidebar footer, next to Log out. */
export const SETTINGS_NAV_ITEM: AppNavItem = { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' };

/** Every destination in sidebar order. */
export const APP_NAV_ITEMS: AppNavItem[] = [...APP_NAV_SECTIONS.flatMap((s) => s.items), SETTINGS_NAV_ITEM];

const VIDEO_PAGE = /^\/videos\/([^/]+)(?:\/(coach|scripts))?\/?$/;

/** The video and view of a video page (/videos/:id[/coach|/scripts]), or null on any other page. */
export function parseVideoPath(pathname: string): { videoId: string; view: VideoViewId } | null {
  const match = VIDEO_PAGE.exec(pathname);
  if (!match) return null;
  const view: VideoViewId = match[2] === 'coach' ? 'coach' : match[2] === 'scripts' ? 'scripts' : 'report';
  return { videoId: match[1], view };
}

/**
 * Where a sidebar view link goes: the same video when one is open (switching Coach to Scripts keeps the
 * video), otherwise the hub page, which opens the last or latest analysed video.
 */
export function videoViewHref(pathname: string, view: VideoViewId): string {
  const current = parseVideoPath(pathname);
  if (current) return `/videos/${current.videoId}${VIDEO_VIEW_SUFFIX[view]}`;
  return VIDEO_HUB_PATH[view];
}

export function isNavActive(pathname: string, href: string): boolean {
  const onVideo = parseVideoPath(pathname);
  for (const view of Object.keys(VIDEO_HUB_PATH) as VideoViewId[]) {
    if (href === VIDEO_HUB_PATH[view]) return pathname === href || onVideo?.view === view;
  }
  if (href === '/editor') return pathname === '/editor' || pathname.startsWith('/editor/');
  if (href === '/analytics') return pathname === '/analytics' || pathname.startsWith('/analytics/');
  if (href === '/videos') return pathname === '/videos' || (pathname.startsWith('/videos/') && !onVideo);
  if (href === '/settings') return pathname === '/settings' || pathname === '/profile' || pathname.startsWith('/subscription');
  return pathname === href;
}
