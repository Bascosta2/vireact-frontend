import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/UI/modern-sidebar';
import BottomNav from '@/components/Header/UserHeader/BottomNav';
import { useSidebar } from '@/contexts/SidebarContext';
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
    <div className={cn('app-root flex h-screen w-screen overflow-hidden bg-canvas', className)}>
      <a
        href="#main-content"
        className="app-focus sr-only z-[400] rounded-lg bg-surface-raised px-4 py-2 text-sm text-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {showHeader && <Sidebar />}

      <div className={cn('relative flex flex-1 flex-col overflow-hidden', showHeader && (isCollapsed ? 'md:ml-[72px]' : 'md:ml-60'))}>
        {showHeader && (
          <header className="flex h-14 shrink-0 items-center border-b border-line px-4 md:hidden">
            <Link to="/dashboard" className="app-focus rounded" aria-label="Vireact home">
              <span className="font-heading text-2xl leading-none tracking-wide text-fg">VIREACT</span>
            </Link>
          </header>
        )}
        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            'relative z-10 flex-1 overflow-y-auto outline-none',
            showBottomNav && 'pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0',
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
