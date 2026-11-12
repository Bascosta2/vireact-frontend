import { BarChart3, Clapperboard, Home, Library, Settings, type LucideIcon } from 'lucide-react';

export interface AppNavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', name: 'Home', icon: Home, href: '/dashboard' },
  { id: 'library', name: 'Library', icon: Library, href: '/videos' },
  { id: 'editor', name: 'Editor', icon: Clapperboard, href: '/editor' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/editor') return pathname === '/editor' || pathname.startsWith('/editor/');
  if (href === '/analytics') return pathname === '/analytics' || pathname.startsWith('/analytics/');
  if (href === '/videos') return pathname === '/videos' || pathname.startsWith('/videos/');
  if (href === '/settings') return pathname === '/settings' || pathname === '/profile' || pathname.startsWith('/subscription');
  return pathname === href;
}
