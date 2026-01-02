import type { DropdownItem } from '@/components/UI/NavigationDropdown';

export interface PreLoginNavItem {
    label: string;
    href: string;
    hasDropdown?: boolean;
    dropdownItems?: DropdownItem[];
    dropdownTitle?: string;
}

export interface PreLoginHeaderProps {
    className?: string;
}