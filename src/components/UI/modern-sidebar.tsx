import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import ConfirmationModal from '@/components/UI/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { UsageMeter } from '@/components/app/UsageMeter';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { cn } from '@/lib/utils';

/** Desktop navigation (768 px and up). Below that, `BottomNav` takes over. */
export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useLogout();
  const { inProgressCount } = useActiveAnalyses();

  return (
    <>
      <aside
        aria-label="Main"
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-line bg-canvas md:flex',
          isCollapsed ? 'w-[72px]' : 'w-60'
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-line px-4', isCollapsed ? 'justify-center' : 'justify-between')}>
          <Link to="/dashboard" className="app-focus rounded" aria-label="Vireact home">
            <span className="text-brand-gradient font-heading text-2xl leading-none tracking-wide">{isCollapsed ? 'V' : 'VIREACT'}</span>
          </Link>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="app-focus inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-white/5 hover:text-fg"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="p-3">
          <Link
            to="/new"
            aria-current={pathname === '/new' ? 'page' : undefined}
            aria-label={isCollapsed ? 'New analysis' : undefined}
            className={cn(
              'app-focus flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-on-brand hover:opacity-90',
              !isCollapsed && 'px-4'
            )}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {!isCollapsed && 'New analysis'}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Pages">
          {APP_NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.href}
                aria-current={active ? 'page' : undefined}
                aria-label={isCollapsed ? item.name : undefined}
                className={cn(
                  'app-focus relative flex h-11 items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-100',
                  isCollapsed ? 'justify-center' : 'px-3',
                  active ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
                )}
              >
                {active && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" />}
                <Icon className={cn('h-5 w-5 shrink-0', active && 'text-accent')} aria-hidden="true" />
                {!isCollapsed && <span className="flex-1">{item.name}</span>}
                {item.id === 'library' && inProgressCount > 0 && !isCollapsed && (
                  <span className="tabular inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
                    {inProgressCount} analyzing
                  </span>
                )}
                {item.id === 'library' && inProgressCount > 0 && isCollapsed && (
                  <span aria-hidden="true" className="absolute right-3 top-2.5 h-2 w-2 rounded-full bg-warning" />
                )}
                {item.id === 'library' && inProgressCount > 0 && isCollapsed && (
                  <span className="sr-only">, {inProgressCount} analyzing</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-line p-3">
          {!isCollapsed && <UsageMeter />}
          {isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="app-focus flex h-11 w-full items-center justify-center rounded-lg text-fg-muted hover:bg-white/5 hover:text-fg"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label={isCollapsed ? 'Log out' : undefined}
            className={cn(
              'app-focus flex h-11 w-full items-center gap-3 rounded-lg text-sm font-medium text-fg-muted hover:bg-white/5 hover:text-fg',
              isCollapsed ? 'justify-center' : 'px-3'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!isCollapsed && 'Log out'}
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
        }}
        title="Log out?"
        message="You'll need to sign in again to see your videos."
        confirmText="Log out"
        cancelText="Cancel"
      />
    </>
  );
}
