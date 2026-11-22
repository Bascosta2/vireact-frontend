import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, FileBarChart, Home, Library, Link2, Lock, MessageSquare, MoreHorizontal, Plus, ScrollText, Settings, Wand2, type LucideIcon } from 'lucide-react';
import { isNavActive, videoViewHref, type VideoViewId } from '@/lib/app-nav';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { useEditorAccess } from '@/lib/editor-access';
import { useAccountsAccess } from '@/lib/accounts-access';
import { useViewBadges } from '@/lib/nav-badges';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** Opens this view on the current (or last) video. */
  view?: VideoViewId;
}

/** Always in the bar. Five slots in total with More. */
const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'new', label: 'New', icon: Plus, href: '/new' },
  { id: 'library', label: 'Library', icon: Library, href: '/videos' },
  { id: 'coach', label: 'Coach', icon: MessageSquare, href: '/coach', view: 'coach' },
];

/** In the More sheet. */
const MORE: Tab[] = [
  { id: 'report', label: 'Feedback Reports', icon: FileBarChart, href: '/reports', view: 'report' },
  { id: 'scripts', label: 'Scripts', icon: ScrollText, href: '/scripts', view: 'scripts' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'skills', label: 'Skills Editor', icon: Wand2, href: '/skills' },
  { id: 'accounts', label: 'Accounts', icon: Link2, href: '/accounts' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

const tabHref = (tab: Tab, pathname: string) => (tab.view ? videoViewHref(pathname, tab.view) : tab.href);

/**
 * Mobile tab bar (under 768 px). 64 px tall plus the device safe area.
 * Keep the 64 px in sync with UserPage's bottom padding and the New page's docked action bar.
 */
function BottomNav() {
  const { pathname } = useLocation();
  const { inProgressCount } = useActiveAnalyses();
  // Private beta: the Editor opens only for accounts the backend grants it to; others see "Soon".
  const editorAccess = useEditorAccess();
  const accountsAccess = useAccountsAccess();
  const badges = useViewBadges();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreActive = MORE.some((tab) => isNavActive(pathname, tab.href));

  // Close the sheet when the page changes, on Escape, and on a tap outside it.
  useEffect(() => setMoreOpen(false), [pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!sheetRef.current?.contains(target) && !moreButtonRef.current?.contains(target)) setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [moreOpen]);

  const tabClass = (active: boolean) =>
    cn(
      'app-focus relative flex h-full w-full flex-col items-center justify-center gap-1 text-[10.5px] font-medium tracking-normal transition-colors duration-200',
      active ? 'text-fg' : 'text-fg-subtle hover:text-fg'
    );
  const iconWrap = (active: boolean, outlined = false) =>
    cn(
      'relative flex h-8 w-10 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-200',
      active && 'bg-accent-tint shadow-[0_0_18px_rgba(232,103,53,0.25)]',
      outlined && !active && 'border border-line bg-white/[0.04]'
    );

  return (
    <>
      {moreOpen && <div aria-hidden="true" className="fixed inset-0 z-[190] bg-black/50 md:hidden" />}
      <div
        ref={sheetRef}
        id="more-sheet"
        role="dialog"
        aria-label="More pages"
        aria-modal="false"
        hidden={!moreOpen}
        className="app-chrome fixed left-0 right-0 z-[195] rounded-t-2xl border-t border-line p-2 md:hidden"
        style={{ bottom: 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        <ul className="mx-auto max-w-lg">
          {MORE.map((tab) => {
            const Icon = tab.icon;
            const badge = tab.view ? badges[tab.view] : null;
            if (((tab.id === 'editor' || tab.id === 'skills') && editorAccess !== 'granted') || (tab.id === 'accounts' && accountsAccess !== 'granted')) {
              return (
                <li key={tab.id} aria-disabled="true" className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-fg-subtle">
                  <Icon className="h-5 w-5 opacity-60" aria-hidden="true" />
                  <span className="flex-1">{tab.label}</span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[11px]">Soon</span>
                </li>
              );
            }
            const active = isNavActive(pathname, tab.href);
            return (
              <li key={tab.id}>
                <Link
                  to={tabHref(tab, pathname)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'app-focus flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium',
                    active ? 'bg-accent-tint text-fg' : 'text-fg-muted hover:bg-white/5 hover:text-fg'
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-accent')} aria-hidden="true" />
                  <span className="flex-1">{tab.label}</span>
                  {badge && (
                    <span className="tabular inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-fg-muted">
                      {badge.locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                      {badge.text}
                      <span className="sr-only">, {badge.title}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <nav
        aria-label="Main"
        className="app-chrome app-edge-top fixed bottom-0 left-0 right-0 z-[200] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex h-16 max-w-lg items-stretch px-1">
          {TABS.map((tab) => {
            const active = tab.href === '/new' ? pathname === '/new' : isNavActive(pathname, tab.href);
            const Icon = tab.icon;
            const showBadge = tab.id === 'library' && inProgressCount > 0;
            return (
              <li key={tab.id} className="flex-1">
                <Link to={tabHref(tab, pathname)} aria-current={active ? 'page' : undefined} className={tabClass(active)}>
                  <span className={iconWrap(active, tab.id === 'new')}>
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
          <li className="flex-1">
            <button
              ref={moreButtonRef}
              type="button"
              aria-expanded={moreOpen}
              aria-controls="more-sheet"
              onClick={() => setMoreOpen((open) => !open)}
              className={tabClass(moreActive || moreOpen)}
            >
              <span className={iconWrap(moreActive || moreOpen)}>
                <MoreHorizontal className={cn('h-5 w-5', (moreActive || moreOpen) && 'text-accent')} aria-hidden="true" />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default BottomNav;
