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

/** Mobile tab bar (under 768 px). 56 px tall plus the device safe area. */
function BottomNav() {
  const { pathname } = useLocation();
  const { inProgressCount } = useActiveAnalyses();

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex h-14 max-w-lg items-stretch">
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
                  'app-focus relative flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium',
                  active ? 'text-accent' : 'text-fg-muted hover:text-fg'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {tab.label}
                {showBadge && (
                  <>
                    <span aria-hidden="true" className="absolute right-[calc(50%-16px)] top-2 h-2 w-2 rounded-full bg-warning" />
                    <span className="sr-only">, {inProgressCount} analyzing</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
