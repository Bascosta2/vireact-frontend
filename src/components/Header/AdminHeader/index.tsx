import React from 'react';
import { useAuth } from '@/redux/hooks/use-auth';
import { useAdmin } from '@/redux/hooks/use-admin';
import { useLogout } from '@/hooks/useLogout';

function AdminHeader() {
  const { id, name, email, avatar } = useAdmin();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Vireact Admin</h1>
          </div>

          {/* Admin Info and Logout */}
          <div className="flex items-center space-x-4">
            {/* Admin Info */}
            <div className="flex items-center space-x-3">
              {avatar && (
                <img
                  src={avatar}
                  alt={name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;