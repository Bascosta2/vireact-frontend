import { 
  FaHome, 
  FaChartLine, 
  FaVideo, 
  FaUser, 
  FaCog
} from 'react-icons/fa';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  isActive?: boolean;
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: FaHome,
    path: '/dashboard',
    isActive: true
  },
  {
    id: 'videos',
    label: 'Videos',
    icon: FaVideo,
    path: '/videos'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: FaUser,
    path: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: FaCog,
    path: '/settings'
  }
];
