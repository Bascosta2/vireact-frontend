import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronsUpDown, Clock, CreditCard, LogOut, Lock, PanelLeft, Pin, PinOff, Plus, Loader2, Search, Settings } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import ConfirmationModal from '@/components/UI/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { useCommands, commandKeyLabel } from '@/contexts/command-context';
import { UsageMeter } from '@/components/app/UsageMeter';
import { CreateMenu } from '@/components/app/CreateMenu';
import { NotificationsBell } from '@/components/app/NotificationsBell';
import { Popover } from '@/components/app/Popover';
import { APP_NAV_SECTIONS, BETA_NAV_IDS, SETTINGS_NAV_ITEM, isNavActive, videoViewHref, type AppNavItem, type VideoViewId } from '@/lib/app-nav';
import { useViewBadges } from '@/lib/nav-badges';
import { useEditorAccess } from '@/lib/editor-access';
import { useAccountsAccess } from '@/lib/accounts-access';
import { togglePinned, useRecentItems } from '@/lib/recent-items';
import { useUser } from '@/redux/hooks/use-user';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { cn } from '@/lib/utils';

/** Sidebar items that open a view of a video (they follow the video that is open). */
const VIEW_ITEMS: Record<string, VideoViewId | undefined> = { report: 'report', coach: 'coach', scripts: 'scripts' };

/** Shared timing so the rail, its labels and the page margin (UserPage) move as one. */
export const SIDEBAR_TRANSITION = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

const ROW = 'app-focus relative flex h-9 w-full items-center gap-3 overflow-hidden rounded-lg px-3.5 text-sm font-medium transition-colors duration-100';
const ROW_IDLE = 'text-fg-muted hover:bg-white/5 hover:text-fg';
const ROW_ACTIVE = 'bg-accent-tint text-fg';

/**
 * Desktop navigation (768 px and up). Below that, `BottomNav` takes over.
 *
 * One column that never needs its own scrollbar on a laptop: compact rows, beta pages folded into one
 * "Coming soon" line, Settings and Log out in the account menu. Shortcuts (recently opened) appear only
 * when the window is tall enough. Collapsing animates the width only; icons stay put and labels fade.
 */
export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useLogout();
  const { inProgressCount } = useActiveAnalyses();
  const { openPalette } = useCommands();
  const editorAccess = useEditorAccess();
  const accountsAccess = useAccountsAccess();
  const viewBadges = useViewBadges();
  const recent = useRecentItems();
  const { name, email } = useUser();
  const { plan } = useSubscription();
  const settingsActive = isNavActive(pathname, SETTINGS_NAV_ITEM.href);

  // Text that is clipped by the narrow rail: it fades out and never wraps.
  const label = cn('whitespace-nowrap transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-0' : 'opacity-100');
  const hiddenWhenCollapsed = isCollapsed ? -1 : undefined;

  const granted = (item: AppNavItem) =>
    item.id === 'skills' ? editorAccess === 'granted' : item.id === 'accounts' ? accountsAccess === 'granted' : true;
  const comingSoon = APP_NAV_SECTIONS.flatMap((s) => s.items).filter((i) => (BETA_NAV_IDS as readonly string[]).includes(i.id) && !granted(i));
  const shortcuts = recent.slice(0, 4);
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : null;
  const displayName = (name || '').trim() || (email ?? '').split('@')[0] || 'Your account';

  return (
    <>
      <aside
        aria-label="Main"
        data-collapsed={isCollapsed}
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-dvh flex-col border-r border-line bg-canvas transition-[width] md:flex',
          SIDEBAR_TRANSITION,
          isCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-line pl-[18px] pr-4">
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
          <Link to="/dashboard" className={cn('app-focus rounded', label)} aria-label="Vireact home" tabIndex={hiddenWhenCollapsed} aria-hidden={isCollapsed || undefined}>
            <span className="font-heading text-2xl leading-none tracking-wide text-fg">VIREACT</span>
          </Link>
        </div>

        {/* One primary action, with everything else you can start one click away. */}
        <div className="shrink-0 px-3 pt-3">
          <div className="app-quiet flex h-10 items-stretch overflow-hidden rounded-lg">
            <Link
              to="/new"
              aria-current={pathname === '/new' ? 'page' : undefined}
              aria-label="New analysis"
              title={isCollapsed ? 'New analysis' : undefined}
              className="app-focus flex min-w-0 flex-1 items-center gap-2 pl-4 text-sm font-semibold"
            >
              <Plus className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className={label}>New analysis</span>
            </Link>
            {!isCollapsed && <CreateMenu side="bottom-end" buttonClassName="h-10 w-9 border-l border-white/10 text-fg-muted hover:bg-white/5 hover:text-fg" />}
          </div>
        </div>

        <div className="shrink-0 space-y-0.5 px-3 pb-1 pt-2">
          <button type="button" onClick={() => openPalette()} title={isCollapsed ? `Search (${commandKeyLabel()})` : undefined} className={cn(ROW, ROW_IDLE)}>
            <Search className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className={cn('flex-1 text-left', label)}>Search</span>
            <kbd className={cn('rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] text-fg-subtle', label)}>{commandKeyLabel()}</kbd>
          </button>
          <NotificationsBell
            side="right-start"
            buttonClassName={cn(ROW, ROW_IDLE)}
            renderTrigger={(unread) => (
              <>
                <Bell className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span className={cn('flex-1 text-left', label)}>Notifications</span>
                {unread > 0 && (
                  <span className={cn('tabular rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-5 text-on-brand', label)}>{unread > 9 ? '9+' : unread}</span>
                )}
                {unread > 0 && (
                  <span aria-hidden="true" className={cn('absolute left-[27px] top-1.5 h-2 w-2 rounded-full bg-accent transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-100' : 'opacity-0')} />
                )}
              </>
            )}
          />
        </div>

        <nav className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3" aria-label="Pages">
          {APP_NAV_SECTIONS.map((section) => {
            const items = section.items.filter(granted);
            if (items.length === 0) return null;
            return (
              <div key={section.id} className="space-y-0.5">
                {section.label && (
                  // Fixed height in both states so the items never shift: the heading fades into a divider.
                  <div className="relative flex h-7 items-end px-3.5 pb-1" role="presentation">
                    <span className={cn('app-label', label)}>{section.label}</span>
                    <span aria-hidden="true" className={cn('absolute bottom-3 left-3 right-3 h-px bg-line transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-100' : 'opacity-0')} />
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const view = VIEW_ITEMS[item.id];
                  const href = view ? videoViewHref(pathname, view) : item.href;
                  const active = isNavActive(pathname, item.href);
                  const analyzing = item.id === 'library' && inProgressCount > 0;
                  const badge = view ? viewBadges[view] : null;
                  return (
                    <Link key={item.id} to={href} aria-current={active ? 'page' : undefined} title={isCollapsed ? item.name : undefined} className={cn(ROW, active ? ROW_ACTIVE : ROW_IDLE)}>
                      {active && <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-accent" />}
                      <Icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-accent')} aria-hidden="true" />
                      <span className={cn('min-w-0 flex-1 truncate', label)}>{item.name}</span>
                      {badge && (
                        <span className={cn('tabular inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium text-fg-muted', label)} title={badge.title}>
                          {badge.locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                          {badge.text}
                          <span className="sr-only">, {badge.title}</span>
                        </span>
                      )}
                      {analyzing && (
                        <span className={cn('tabular inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning', label)}>
                          <Loader2 className="h-3 w-3 motion-safe:animate-spin" aria-hidden="true" />
                          {inProgressCount}
                          <span className="sr-only"> analyzing</span>
                        </span>
                      )}
                      {analyzing && <span aria-hidden="true" className={cn('absolute left-[27px] top-1.5 h-2 w-2 rounded-full bg-warning transition-opacity', SIDEBAR_TRANSITION, isCollapsed ? 'opacity-100' : 'opacity-0')} />}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {comingSoon.length > 0 && !isCollapsed && (
            <p className="mt-2 truncate px-3.5 text-xs text-fg-subtle" title={`Coming soon: ${comingSoon.map((i) => i.name).join(', ')}`}>
              Coming soon: {comingSoon.map((i) => i.name).join(', ')}
            </p>
          )}

          {/* Shortcuts: recently opened videos, pinned ones first. Only when there is room for them. */}
          {shortcuts.length > 0 && !isCollapsed && (
            <div className="mt-1 hidden space-y-0.5 [@media(min-height:820px)]:block">
              <div className="flex h-7 items-end px-3.5 pb-1" role="presentation">
                <span className="app-label">Shortcuts</span>
              </div>
              {shortcuts.map((s) => {
                const active = pathname === s.href;
                return (
                  <div key={s.id} className="group relative">
                    <Link to={s.href} aria-current={active ? 'page' : undefined} className={cn(ROW, 'h-8 pr-9 text-[13px] font-normal', active ? ROW_ACTIVE : ROW_IDLE)} title={s.title}>
                      {s.pinned ? <Pin className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /> : <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />}
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePinned(s.id)}
                      aria-label={s.pinned ? `Unpin ${s.title}` : `Pin ${s.title}`}
                      className="app-focus absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-fg-subtle opacity-0 hover:bg-white/5 hover:text-fg focus:opacity-100 group-hover:opacity-100"
                    >
                      {s.pinned ? <PinOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Pin className="h-3.5 w-3.5" aria-hidden="true" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-line p-3">
          {/* Kept mounted at its full width so the footer height never changes; hidden (and unfocusable) when collapsed or short. */}
          <div className={cn('hidden w-[231px] transition-[opacity,visibility] [@media(min-height:700px)]:block', SIDEBAR_TRANSITION, isCollapsed ? 'invisible opacity-0' : 'visible opacity-100')}>
            <UsageMeter />
          </div>
          <Popover
            side={isCollapsed ? 'right-start' : 'top-start'}
            label={`Account menu for ${displayName}`}
            buttonClassName={cn(ROW, 'h-11 px-2', settingsActive ? ROW_ACTIVE : ROW_IDLE)}
            panelClassName="w-60"
            trigger={() => (
              <>
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient font-semibold text-on-brand">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className={cn('min-w-0 flex-1 text-left', label)}>
                  <span className="block truncate text-sm text-fg">{displayName}</span>
                  {planLabel && <span className="block truncate text-xs font-normal text-fg-muted">{planLabel} plan</span>}
                </span>
                <ChevronsUpDown className={cn('h-4 w-4 shrink-0 text-fg-subtle', label)} aria-hidden="true" />
              </>
            )}
          >
            {(close) => (
              <div>
                {email && <p className="truncate px-3 pb-1 pt-2 text-xs text-fg-muted">{email}</p>}
                <Link to={SETTINGS_NAV_ITEM.href} onClick={close} className="app-focus flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-fg hover:bg-white/5">
                  <Settings className="h-4 w-4 text-fg-muted" aria-hidden="true" />
                  Settings
                </Link>
                <Link to="/settings?tab=plan" onClick={close} className="app-focus flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-fg hover:bg-white/5">
                  <CreditCard className="h-4 w-4 text-fg-muted" aria-hidden="true" />
                  Plan and billing
                </Link>
                <div className="my-1 h-px bg-line" />
                <button
                  type="button"
                  onClick={() => {
                    close();
                    setConfirmOpen(true);
                  }}
                  className="app-focus flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-fg hover:bg-white/5"
                >
                  <LogOut className="h-4 w-4 text-fg-muted" aria-hidden="true" />
                  Log out
                </button>
              </div>
            )}
          </Popover>
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
