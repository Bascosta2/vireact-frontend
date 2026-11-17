import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Lock, PanelLeft, Plus, Loader2, Settings } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import ConfirmationModal from '@/components/UI/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { UsageMeter } from '@/components/app/UsageMeter';
import { APP_NAV_SECTIONS, SETTINGS_NAV_ITEM, isNavActive, videoViewHref, type VideoViewId } from '@/lib/app-nav';
import { useViewBadges } from '@/lib/nav-badges';
import { useEditorAccess } from '@/lib/editor-access';
import { cn } from '@/lib/utils';

/** Sidebar items that open a view of a video (they follow the video that is open). */
const VIEW_ITEMS: Record<string, VideoViewId | undefined> = { report: 'report', coach: 'coach', scripts: 'scripts' };

/** Shared timing so the rail, its labels and the page margin (UserPage) move as one. */
export const SIDEBAR_TRANSITION = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

/**
 * Desktop navigation (768 px and up). Below that, `BottomNav` takes over.
 *
 * Collapsing animates the width only. Every icon, and the toggle button, sits at a fixed distance from
 * the left edge in both states, so nothing jumps: labels simply fade while the rail slides over them.
 */
export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useLogout();
  const { inProgressCount } = useActiveAnalyses();
  // Private beta: the Editor opens only for accounts the backend grants it to; others see "Soon".
  const editorAccess = useEditorAccess();
  const viewBadges = useViewBadges();
  const settingsActive = isNavActive(pathname, SETTINGS_NAV_ITEM.href);

  // Text that is clipped by the narrow rail: it fades out and never wraps.
  const label = cn('whitespace-nowrap transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-0' : 'opacity-100');

  return (
    <>
      <aside
        aria-label="Main"
        data-collapsed={isCollapsed}
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-hidden border-r border-line bg-canvas transition-[width] md:flex',
          SIDEBAR_TRANSITION,
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-line pl-[18px] pr-4">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="app-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors duration-150 hover:bg-white/5 hover:text-fg"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <Link
            to="/dashboard"
            className={cn('app-focus rounded', label)}
            aria-label="Vireact home"
            tabIndex={isCollapsed ? -1 : undefined}
            aria-hidden={isCollapsed || undefined}
          >
            <span className="font-heading text-2xl leading-none tracking-wide text-fg">VIREACT</span>
          </Link>
        </div>

        <div className="shrink-0 p-3">
          <Link
            to="/new"
            aria-current={pathname === '/new' ? 'page' : undefined}
            aria-label="New analysis"
            title={isCollapsed ? 'New analysis' : undefined}
            className="app-focus app-primary flex h-11 items-center gap-2 overflow-hidden rounded-lg pl-4 text-sm font-semibold"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className={label}>New analysis</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3" aria-label="Pages">
          {APP_NAV_SECTIONS.map((section) => (
            <div key={section.id} className="space-y-1">
              {section.label && (
                // Fixed height in both states so the items never shift: the heading fades into a divider.
                <div className="relative flex h-8 items-end px-3.5 pb-1.5" role="presentation">
                  <span className={cn('app-label', label)}>{section.label}</span>
                  <span
                    aria-hidden="true"
                    className={cn('absolute bottom-3 left-3 right-3 h-px bg-line transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-100' : 'opacity-0')}
                  />
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                if (item.id === 'editor' && editorAccess !== 'granted') {
                  // Private beta: everyone else sees that it is coming, but cannot open it.
                  return (
                    <div
                      key={item.id}
                      aria-disabled="true"
                      title="Editor: coming soon"
                      className="relative flex h-11 cursor-default items-center gap-3 overflow-hidden rounded-lg px-3.5 text-sm font-medium text-fg-subtle"
                    >
                      <Icon className="h-5 w-5 shrink-0 opacity-60" aria-hidden="true" />
                      <span className={cn('min-w-0 flex-1 truncate', label)}>{item.name}</span>
                      <span className={cn('rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-fg-subtle', label)}>Soon</span>
                    </div>
                  );
                }
                const view = VIEW_ITEMS[item.id];
                const href = view ? videoViewHref(pathname, view) : item.href;
                const active = isNavActive(pathname, item.href);
                const analyzing = item.id === 'library' && inProgressCount > 0;
                const badge = view ? viewBadges[view] : null;
                return (
                  <Link
                    key={item.id}
                    to={href}
                    aria-current={active ? 'page' : undefined}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'app-focus relative flex h-11 items-center gap-3 overflow-hidden rounded-lg px-3.5 text-sm font-medium transition-colors duration-100',
                      active ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
                    )}
                  >
                    {active && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" />}
                    <Icon className={cn('h-5 w-5 shrink-0', active && 'text-accent')} aria-hidden="true" />
                    <span className={cn('min-w-0 flex-1 truncate', label)}>{item.name}</span>
                    {badge && (
                      <span
                        className={cn('tabular inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-fg-muted', label)}
                        title={badge.title}
                      >
                        {badge.locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                        {badge.text}
                        <span className="sr-only">, {badge.title}</span>
                      </span>
                    )}
                    {analyzing && (
                      <span className={cn('tabular inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning', label)}>
                        <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
                        {inProgressCount} analyzing
                      </span>
                    )}
                    {analyzing && (
                      <span
                        aria-hidden="true"
                        className={cn('absolute left-[30px] top-2.5 h-2 w-2 rounded-full bg-warning transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-100' : 'opacity-0')}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-line p-3">
          {/* Kept mounted at its full width so the footer height never changes; hidden (and unfocusable) when collapsed. */}
          <div className={cn('w-[231px] transition-[opacity,visibility]', SIDEBAR_TRANSITION, isCollapsed ? 'invisible opacity-0' : 'visible opacity-100')}>
            <UsageMeter />
          </div>
          <Link
            to={SETTINGS_NAV_ITEM.href}
            aria-current={settingsActive ? 'page' : undefined}
            title={isCollapsed ? SETTINGS_NAV_ITEM.name : undefined}
            className={cn(
              'app-focus relative flex h-11 items-center gap-3 overflow-hidden rounded-lg px-3.5 text-sm font-medium transition-colors duration-100',
              settingsActive ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
            )}
          >
            {settingsActive && <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-accent" />}
            <Settings className={cn('h-5 w-5 shrink-0', settingsActive && 'text-accent')} aria-hidden="true" />
            <span className={label}>{SETTINGS_NAV_ITEM.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            title={isCollapsed ? 'Log out' : undefined}
            className="app-focus flex h-11 w-full items-center gap-3 overflow-hidden rounded-lg px-3.5 text-sm font-medium text-fg-muted hover:bg-white/5 hover:text-fg"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={label}>Log out</span>
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
