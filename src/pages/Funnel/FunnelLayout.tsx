import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/redux/hooks/use-auth';

/** Minimal chrome for the quiz and results: logo, one account link, no nav or footer. */
function FunnelLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-white/10">
        <Link to="/" className="text-2xl font-bold font-heading leading-none text-gradient-primary">
          VIREACT
        </Link>
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="text-sm text-white/70 hover:text-white min-h-[44px] inline-flex items-center px-2"
        >
          {isAuthenticated ? 'Dashboard' : 'Log in'}
        </Link>
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  );
}

export default FunnelLayout;
