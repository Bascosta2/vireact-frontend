import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, X } from 'lucide-react';
import { Sidebar } from '@/components/UI/modern-sidebar';
import BottomNav from '@/components/Header/UserHeader/BottomNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { useActiveAnalyses } from '@/contexts/ActiveAnalysesContext';
import { useSubscription } from '@/redux/hooks/use-subscription';
import { cn } from '@/lib/utils';

const PAYMENT_FAILED_BANNER_DISMISS_KEY = 'vireact_payment_failed_banner_dismissed';

interface UserPageProps {
  children: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

/** Mobile-only top bar (under 768 px): glass, brand light line, live status and a quick "new" action. */
function MobileTopBar() {
  const { inProgressCount } = useActiveAnalyses();
  const { plan } = useSubscription();
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : null;

  return (
    <header
      className="app-chrome app-edge-bottom sticky top-0 z-30 shrink-0 md:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Link to="/dashboard" className="app-focus flex items-center gap-2 rounded" aria-label="Vireact home">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient font-heading text-base leading-none text-on-brand shadow-[0_0_16px_rgba(232,103,53,0.35)]"
          >
            V
          </span>
          <span className="font-heading text-[22px] leading-none tracking-[0.12em] text-fg">VIREACT</span>
        </Link>

        <div className="flex items-center gap-2">
          {inProgressCount > 0 ? (
            <Link
              to="/videos"
              className="app-focus tabular inline-flex h-8 items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 text-xs font-medium text-warning"
            >
              <Loader2 className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
              {inProgressCount} analyzing
            </Link>
          ) : planLabel ? (
            <Link
              to="/settings?tab=plan"
              className="app-focus inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 text-xs font-medium text-fg-muted"
              aria-label={`${planLabel} plan, open plan settings`}
            >
              <span aria-hidden="true" className="app-glow-dot h-1.5 w-1.5 rounded-full bg-success" />
              {planLabel}
            </Link>
          ) : null}
          <Link
            to="/new"
            aria-label="New analysis"
            className="app-focus app-primary inline-flex h-9 w-9 items-center justify-center rounded-xl"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function UserPage({
  children,
  className = '',
  mainClassName = '',
  showHeader = true,
  showBottomNav = true
}: UserPageProps) {
  const { isCollapsed } = useSidebar();
  const { paymentFailed } = useSubscription();
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PAYMENT_FAILED_BANNER_DISMISS_KEY) === '1'
  );

  const dismissPaymentBanner = useCallback(() => {
    sessionStorage.setItem(PAYMENT_FAILED_BANNER_DISMISS_KEY, '1');
    setBannerDismissed(true);
  }, []);

  return (
    // h-dvh (not 100vh) so mobile browser toolbars can't push content under the fixed tab bar.
    <div className={cn('app-root flex h-dvh w-full overflow-hidden bg-canvas', className)}>
      <a
        href="#main-content"
        className="app-focus sr-only z-[400] rounded-lg bg-surface-raised px-4 py-2 text-sm text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {showHeader && <Sidebar />}

      {/* min-w-0: a flex child otherwise grows to its widest descendant and the page scrolls sideways. */}
      <div className={cn('relative flex min-w-0 flex-1 flex-col overflow-hidden', showHeader && (isCollapsed ? 'md:ml-[72px]' : 'md:ml-60'))}>
        {showHeader && <MobileTopBar />}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'relative z-10 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain outline-none',
            showBottomNav && 'pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0',
            mainClassName
          )}
          style={{ scrollPaddingBottom: 'calc(140px + env(safe-area-inset-bottom))' }}
        >
          {paymentFailed && !bannerDismissed && (
            <div
              className="sticky top-0 z-20 flex flex-col gap-2 border-b border-warning/30 bg-surface-raised px-4 py-3 text-sm text-fg sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="pr-8 sm:pr-0">
                Your last payment failed. Update your payment method to keep your plan active.{' '}
                <Link to="/settings?tab=plan" className="app-focus rounded font-medium text-accent underline underline-offset-2">
                  Open plan settings
                </Link>{' '}
                or{' '}
                <Link to="/subscription-plans" className="app-focus rounded font-medium text-accent underline underline-offset-2">
                  manage your plan
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={dismissPaymentBanner}
                className="app-focus absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-muted hover:bg-white/10 sm:static"
                aria-label="Dismiss payment warning"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default UserPage;
