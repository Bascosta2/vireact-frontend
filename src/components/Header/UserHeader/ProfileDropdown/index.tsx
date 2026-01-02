import { useEffect, useRef, type RefObject } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoutClick: () => void;
  excludeRef?: RefObject<HTMLElement | null>;
}

function ProfileDropdown({
  isOpen,
  onClose,
  onLogoutClick,
  excludeRef
}: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      // Don't close if clicking inside the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on the excluded element (avatar button)
      if (excludeRef?.current && excludeRef.current.contains(target)) {
        return;
      }
      
      // Close if clicking outside both dropdown and excluded element
      onClose();
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleLogoutClick() {
    onLogoutClick();
    onClose();
  }

  return (
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
  );
}

export default ProfileDropdown;

