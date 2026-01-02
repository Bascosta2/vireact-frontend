import { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '@/redux/hooks/use-user';
import { useLogout } from '@/hooks/useLogout';
import { navItems } from '@/components/Header/UserHeader/BottomNav/nav-items';
import ConfirmationModal from '@/components/UI/ConfirmationModal';

function UserHeader() {
  const { name, avatar } = useUser();
  const location = useLocation();
  const { logout } = useLogout();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAvatarClick = useCallback(() => {
    setIsMobileDropdownOpen((prev) => !prev);
  }, []);

  const handleLogoutClick = useCallback(() => {
    setIsMobileDropdownOpen(false);
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmLogout = useCallback(() => {
    setIsConfirmModalOpen(false);
    logout();
  }, [logout]);

  const handleCloseModal = useCallback(() => {
    setIsConfirmModalOpen(false);
  }, []);

  // Close dropdown when clicking outside (mobile only)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (
        isMobileDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        avatarButtonRef.current &&
        !avatarButtonRef.current.contains(target)
      ) {
        setIsMobileDropdownOpen(false);
      }
    }

    if (isMobileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileDropdownOpen]);

  return (
    <header className="sticky top-0 sm:fixed sm:left-0 sm:top-0 sm:h-screen max-w-md sm:max-w-none sm:w-64 px-4 mx-auto sm:mx-0 pt-4 sm:pt-6 sm:pb-6 z-[100] bg-black sm:flex sm:flex-col sm:justify-between">
        <div className="flex items-center justify-between sm:flex-col sm:items-stretch sm:justify-start sm:gap-8">
          {/* Logo/Brand */}
          <div className="flex items-center sm:justify-start pl-4">
            <h1 className="text-2xl font-bebas-neue text-white">VIREACT</h1>
          </div>

          {/* Navigation - Hidden on mobile, visible on larger screens */}
          <nav className="hidden sm:flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800"
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Profile Icon with Dropdown - Only visible on mobile */}
          <div className="relative sm:hidden">
            <button
              ref={avatarButtonRef}
              type="button"
              onClick={handleAvatarClick}
              className="focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black rounded-full"
              aria-label="User menu"
              aria-expanded={isMobileDropdownOpen}
              aria-haspopup="true"
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer">
                  <span className="text-white text-sm font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
            </button>

            {/* Mobile Dropdown */}
            {isMobileDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute top-[calc(100%+0.5rem)] right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-900"
                    role="menuitem"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Logout Button - Only visible on larger screens */}
          <div className="hidden sm:flex flex-col gap-4 sm:mt-auto">
            {/* <div className="flex items-center gap-3 px-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-white">
                {name || 'User'}
              </span>
            </div> */}

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Logout"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to logout? You will need to sign in again to access your account."
          confirmText="Logout"
          cancelText="Cancel"
        />
    </header>
  )
}

export default UserHeader