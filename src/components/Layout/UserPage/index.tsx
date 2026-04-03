import React from 'react';
import { Sidebar } from '@/components/UI/modern-sidebar';
import BottomNav from '@/components/Header/UserHeader/BottomNav';
import { useSidebar } from '@/contexts/SidebarContext';

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