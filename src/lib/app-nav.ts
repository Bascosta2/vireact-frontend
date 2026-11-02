import { Home, Library, Settings, type LucideIcon } from 'lucide-react';

export interface AppNavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  href: string;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { id: 'home', name: 'Home', icon: Home, href: '/dashboard' },
  { id: 'library', name: 'Library', icon: Library, href: '/videos' },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/videos') return pathname === '/videos' || pathname.startsWith('/videos/');
  if (href === '/settings') return pathname === '/settings' || pathname === '/profile' || pathname.startsWith('/subscription');
  return pathname === href;
}
