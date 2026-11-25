import { BarChart3, ClipboardPen, CreditCard, FileBarChart, Home, Library, Link2, MessageSquare, Plus, ScrollText, Settings, Sparkles, Wand2, type LucideIcon } from 'lucide-react';

/** Something the command bar can open: a page or a create action. */
export interface AppCommand {
  id: string;
  label: string;
  /** Extra words that should find it ("upload" finds New analysis). */
  keywords?: string;
  href: string;
  icon: LucideIcon;
  group: 'create' | 'page';
  /** Two-key shortcut shown next to it, pressed one after the other ("c a"). */
  shortcut?: string;
  /** Only for accounts that have the feature. */
  requires?: 'editor' | 'accounts';
}

export const APP_COMMANDS: AppCommand[] = [
  { id: 'new-analysis', label: 'New analysis', keywords: 'upload analyze video', href: '/new', icon: Plus, group: 'create', shortcut: 'c a' },
  { id: 'new-script', label: 'New script', keywords: 'write script idea', href: '/scripts', icon: ScrollText, group: 'create', shortcut: 'c s' },
  { id: 'log-views', label: 'Log real views', keywords: 'results views posted', href: '/analytics?tab=videos', icon: ClipboardPen, group: 'create', shortcut: 'c v' },
  { id: 'story', label: 'Animate an idea', keywords: 'story storyboard animation skills', href: '/skills?mode=story', icon: Sparkles, group: 'create', shortcut: 'c t', requires: 'editor' },
  { id: 'home', label: 'Home', keywords: 'dashboard', href: '/dashboard', icon: Home, group: 'page', shortcut: 'g h' },
  { id: 'library', label: 'Library', keywords: 'videos all', href: '/videos', icon: Library, group: 'page', shortcut: 'g l' },
  { id: 'reports', label: 'Feedback Reports', keywords: 'report score', href: '/reports', icon: FileBarChart, group: 'page' },
  { id: 'coach', label: 'Personal Video Coach', keywords: 'chat ask', href: '/coach', icon: MessageSquare, group: 'page' },
  { id: 'scripts', label: 'Scripts', keywords: 'rewrite', href: '/scripts', icon: ScrollText, group: 'page' },
  { id: 'analytics', label: 'Analytics', keywords: 'progress overview stats', href: '/analytics', icon: BarChart3, group: 'page', shortcut: 'g a' },
  { id: 'analytics-videos', label: 'Analytics: Videos and results', keywords: 'views results', href: '/analytics?tab=videos', icon: BarChart3, group: 'page' },
  { id: 'analytics-strategy', label: 'Analytics: Posting plan', keywords: 'strategy schedule plan', href: '/analytics?tab=strategy', icon: BarChart3, group: 'page' },
  { id: 'skills', label: 'Skills Editor', keywords: 'edit animation styles', href: '/skills', icon: Wand2, group: 'page', requires: 'editor' },
  { id: 'accounts', label: 'Accounts', keywords: 'tiktok youtube instagram connect', href: '/accounts', icon: Link2, group: 'page', requires: 'accounts' },
  { id: 'settings', label: 'Settings', keywords: 'profile account', href: '/settings', icon: Settings, group: 'page', shortcut: 'g s' },
  { id: 'plan', label: 'Plan and billing', keywords: 'subscription upgrade pro', href: '/settings?tab=plan', icon: CreditCard, group: 'page' },
];

/** The command a two-key shortcut opens, if any. */
export const commandForShortcut = (first: string, second: string, allowed: (c: AppCommand) => boolean): AppCommand | undefined =>
  APP_COMMANDS.find((c) => c.shortcut === `${first} ${second}` && allowed(c));

/** Commands whose name or keywords contain every typed word. */
export function matchCommands(query: string, allowed: (c: AppCommand) => boolean): AppCommand[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return APP_COMMANDS.filter((c) => allowed(c)).filter((c) => {
    const hay = `${c.label} ${c.keywords ?? ''}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
