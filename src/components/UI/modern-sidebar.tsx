import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Video,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Upload,
  Sparkles,
} from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import ConfirmationModal from '@/components/UI/ConfirmationModal';
import { useSidebar } from '@/contexts/SidebarContext';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'home', name: 'Home', icon: Home, href: '/dashboard' },
  { id: 'upload', name: 'Upload', icon: Upload, href: '/upload' },
  { id: 'features', name: 'Features', icon: Sparkles, href: '/features' },
  { id: 'videos', name: 'Your Videos', icon: Video, href: '/videos' },
  { id: 'profile', name: 'Profile', icon: User, href: '/profile' },
  { id: 'settings', name: 'Settings', icon: Settings, href: '/settings' },
];

function pathMatchesItem(pathname: string, href: string): boolean {
  if (href === '/videos') return pathname === '/videos' || pathname.startsWith('/videos/');
  return pathname === href;
}

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>('home');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useLogout();

  useEffect(() => {
    const pathname = location.pathname;
    const match = navigationItems.find((item) => pathMatchesItem(pathname, item.href));
    if (match) setActiveItem(match.id);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (itemId: string) => {
    if (itemId === 'logout') {
      setIsConfirmModalOpen(true);
      return;
    }
    setActiveItem(itemId);
    const navItem = navigationItems.find((item) => item.id === itemId);
    if (navItem) navigate(navItem.href);
    if (typeof window !== 'undefined' && window.innerWidth < 768) setIsOpen(false);
  };

  const handleConfirmLogout = () => {
    setIsConfirmModalOpen(false);
    logout();
  };

  const handleCloseModal = () => {
    setIsConfirmModalOpen(false);
  };

  const expandedW = 'w-56';
  const collapsedW = 'w-20';

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-gray-900 shadow-lg border border-gray-800 md:hidden hover:bg-gray-800 transition-all duration-200"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-300" /> : <Menu className="h-5 w-5 text-gray-300" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen
          transition-all duration-300 ease-in-out z-40
          flex flex-col backdrop-blur-md
          ${isCollapsed ? collapsedW : expandedW}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'rgba(10, 10, 15, 0.88)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: 'inset -1px 0 0 0 transparent',
        }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 w-px z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 27, 107, 0.35) 0%, rgba(255, 107, 53, 0.12) 45%, transparent 100%)',
          }}
          aria-hidden
        />

        <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] relative z-20">
          {!isCollapsed && (
            <div className="flex items-center min-w-0">
              <span
                className="uppercase truncate"
                style={{
                  fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
                  fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
                  fontWeight: '900',
                  letterSpacing: 'normal',
                  background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: '1',
                  display: 'inline-block',
                }}
              >
                VIREACT
              </span>
            </div>
          )}

          {isCollapsed && (
            <span
              className="uppercase mx-auto"
              style={{
                fontFamily: 'Impact, Anton, "Arial Black", sans-serif',
                fontSize: '1.5rem',
                fontWeight: '900',
                background: 'linear-gradient(90deg, #FF1B6B 0%, #FF4D4D 25%, #FF6B35 50%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}
            >
              V
            </span>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-full hover:bg-white/5 transition-all duration-200 flex-shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1 relative z-20">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => handleItemClick(item.id)}
                className={cnNavLink(isActive, isCollapsed)}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ea580c 100%)',
                        boxShadow: '-4px 0 14px -2px rgba(249, 115, 22, 0.35)',
                      }
                    : undefined
                }
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-400/90'}`}
                />
                {!isCollapsed && (
                  <span className={`ml-2.5 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[0.06] p-2 relative z-20">
          <button
            type="button"
            onClick={() => handleItemClick('logout')}
            className={`
              w-full flex items-center rounded-full text-left transition-all duration-200 group
              text-orange-500/90 hover:bg-orange-600/10 hover:text-orange-400
              ${isCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'}
            `}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2.5 text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </>
  );
}

function cnNavLink(isActive: boolean, isCollapsed: boolean) {
  const base =
    'group flex items-center text-left transition-all duration-200 rounded-full border border-transparent';
  const pad = isCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5';
  const activeCls = isActive ? 'text-white' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200';
  return `${base} ${pad} ${activeCls}`;
}
