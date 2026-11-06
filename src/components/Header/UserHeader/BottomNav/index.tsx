import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Plus, Settings, type LucideIcon } from 'lucide-react';
import { isNavActive } from '@/lib/app-nav';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { cn } from '@/lib/utils';

const TABS: { id: string; label: string; icon: LucideIcon; href: string }[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'new', label: 'New', icon: Plus, href: '/new' },
  { id: 'library', label: 'Library', icon: Library, href: '/videos' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

/**
 * Mobile tab bar (under 768 px). 64 px tall plus the device safe area.
 * Keep the 64 px in sync with UserPage's bottom padding and the New page's docked action bar.
 */
function BottomNav() {
  const { pathname } = useLocation();
  const { inProgressCount } = useActiveAnalyses();

  return (
    <nav
      aria-label="Main"
      className="app-chrome app-edge-top fixed bottom-0 left-0 right-0 z-[200] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-16 max-w-lg items-stretch px-2">
        {TABS.map((tab) => {
          const active = tab.href === '/new' ? pathname === '/new' : isNavActive(pathname, tab.href);
          const Icon = tab.icon;
          const showBadge = tab.id === 'library' && inProgressCount > 0;
          return (
            <li key={tab.id} className="flex-1">
              <Link
                to={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'app-focus relative flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide transition-colors duration-200',
                  active ? 'text-fg' : 'text-fg-subtle hover:text-fg'
                )}
              >
                <span
                  className={cn(
                    'relative flex h-8 w-12 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-200',
                    active && 'bg-accent-tint shadow-[0_0_18px_rgba(232,103,53,0.25)]',
                    tab.id === 'new' && !active && 'border border-line bg-white/[0.04]'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-accent')} aria-hidden="true" />
                  {showBadge && (
                    <span aria-hidden="true" className="absolute right-2 top-1 h-2 w-2 rounded-full bg-warning ring-2 ring-canvas" />
                  )}
                </span>
                {tab.label}
                {showBadge && <span className="sr-only">, {inProgressCount} analyzing</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
