import React from 'react';
import UserHeader from '@/components/Header/UserHeader';
import BottomNav from '@/components/Header/UserHeader/BottomNav';

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

  // On large screens (lg:), use full width; on smaller, keep max-w-md/3xl
  return (
    <div className={`min-h-screen bg-black ${className}`}>

      {
        showHeader && <UserHeader />
      }
      {/* Main Content */}
      <main className={`relative sm:ml-64 ${mainClassName}`}>
        {children}
      </main>
      {
        showBottomNav && <BottomNav />
      }
    </div>
  );
}

export default UserPage;