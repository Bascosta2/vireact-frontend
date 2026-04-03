import {
  FaHome,
  FaVideo,
  FaUser,
  FaCog,
  FaUpload,
} from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isActive?: boolean;
}

export const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: FaHome, path: '/dashboard', isActive: true },
  { id: 'upload', label: 'Upload', icon: FaUpload, path: '/upload' },
  { id: 'features', label: 'Features', icon: FaWandMagicSparkles, path: '/features' },
  { id: 'videos', label: 'Videos', icon: FaVideo, path: '/videos' },
  { id: 'profile', label: 'Profile', icon: FaUser, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: FaCog, path: '/settings' },
];
