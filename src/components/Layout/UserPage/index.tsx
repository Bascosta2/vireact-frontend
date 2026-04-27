import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/UI/modern-sidebar';
import BottomNav from '@/components/Header/UserHeader/BottomNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { useSubscription } from '@/redux/hooks/use-subscription';

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
    <div className={`flex h-screen w-screen overflow-hidden ${className}`}>
      {showHeader && <Sidebar />}

      {/* Main Content Area — same gradient as landing for unified dark background */}
      <div
        className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-56'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 90% 45% at 50% 20%, rgba(255, 27, 107, 0.045) 0%, transparent 55%), radial-gradient(ellipse 100% 35% at 50% 0%, rgba(88, 28, 135, 0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 0% 50%, rgba(180, 20, 40, 0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 100% 50%, rgba(180, 80, 0, 0.06) 0%, transparent 55%), radial-gradient(ellipse 80% 30% at 50% 100%, rgba(88, 28, 135, 0.06) 0%, transparent 50%), #0a0a0f',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <main className={`flex-1 overflow-y-auto relative z-10 transition-all duration-300 ${mainClassName}`}>
          {paymentFailed && !bannerDismissed && (
            <div
              className="sticky top-0 z-20 flex flex-col gap-2 border-b border-amber-500/30 bg-amber-950/90 px-4 py-3 text-sm text-amber-100 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="pr-8 sm:pr-0">
                Your last payment failed. Please update your payment method to keep your subscription active.{' '}
                <Link
                  to="/profile"
                  className="font-medium text-[#FF8C00] underline decoration-[#FF8C00]/60 underline-offset-2 hover:text-[#FF3CAC]"
                >
                  Open account settings
                </Link>
                {' '}
                or{' '}
                <Link
                  to="/subscription-plans"
                  className="font-medium text-[#FF8C00] underline decoration-[#FF8C00]/60 underline-offset-2 hover:text-[#FF3CAC]"
                >
                  manage your plan
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={dismissPaymentBanner}
                className="absolute right-2 top-2 rounded-md p-1 text-amber-200/90 hover:bg-white/10 sm:static sm:right-auto sm:top-auto"
                aria-label="Dismiss payment warning"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="min-h-[calc(100vh-80px)] sm:min-h-screen">
            {children}
          </div>
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default UserPage;
