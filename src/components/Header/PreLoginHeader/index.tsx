import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import type { PreLoginHeaderProps } from '@/types/header';
import NavigationDropdown from '@/components/UI/NavigationDropdown';
import { navItems } from './pre-login-nav-items';

const PreLoginHeader: React.FC<PreLoginHeaderProps> = ({ className = '' }) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleDropdownToggle = (event: React.MouseEvent, label: string) => {
        event.preventDefault();
        event.stopPropagation();
        if (openDropdown === label) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(label);
        }
    };

    const handleMobileDropdownToggle = (label: string) => {
        setMobileOpenDropdown(mobileOpenDropdown === label ? null : label);
    };

    const handleMouseEnter = (label: string) => {
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
        }
        setOpenDropdown(label);
    };

    const handleMouseLeave = () => {
        dropdownTimeoutRef.current = setTimeout(() => {
            setOpenDropdown(null);
        }, 100); // Small delay to prevent flickering
    };

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-50 h-18
                bg-black
                ${className}
            `}
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-full">
                <div className="flex items-center justify-between h-full">
                    {/* Logo */}
                    <div className="flex justify-center items-center">
                        <NavLink to="/" className="text-2xl lg:text-3xl font-bold font-heading leading-tight text-gradient-primary">
                            VIREACT
                        </NavLink>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative">
                                {item.hasDropdown ? (
                                    <div
                                        onMouseEnter={() => handleMouseEnter(item.label)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <button
                                            ref={buttonRef}
                                            onClick={(e) => handleDropdownToggle(e, item.label)}
                                            className="text-sm flex items-center gap-2 text-light-gray hover:text-white transition-all duration-200 cursor-pointer px-4 py-2 rounded-lg hover:bg-white/20"
                                        >
                                            <span className="font-normal leading-relaxed">
                                                {item.label}
                                            </span>
                                            <div className="w-3 h-3 flex items-center justify-center">
                                                <FaChevronDown
                                                    className={`w-3 h-3 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </button>
                                        {item.dropdownItems && (
                                            <NavigationDropdown
                                                isOpen={openDropdown === item.label}
                                                onClose={() => setOpenDropdown(null)}
                                                items={item.dropdownItems}
                                                onMouseEnter={() => handleMouseEnter(item.label)}
                                                onMouseLeave={handleMouseLeave}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <NavLink
                                        to={item.href}
                                        className="text-sm flex items-center gap-2 text-light-gray hover:text-white transition-all duration-200 cursor-pointer px-4 py-2 rounded-lg hover:bg-white/20"
                                    >
                                        {item.label}
                                    </NavLink>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden lg:flex items-center gap-3 xl:gap-4">
                        <NavLink
                            to="/login"
                            className="btn-outline"
                        >
                            Log in
                        </NavLink>
                        <NavLink
                            to="/signup"
                            className="btn-primary"
                        >
                            Sign up - It's FREE
                        </NavLink>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-light-gray hover:text-white hover:bg-white/20 transition-colors duration-200"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <FaTimes className="block h-6 w-6" />
                            ) : (
                                <FaBars className="block h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed top-24 left-0 right-0 bottom-0 bg-black bg-opacity-95 backdrop-blur-sm border-t border-gray-600 overflow-y-auto">
                        <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-6rem)]">
                            {navItems.map((item) => (
                                <div
                                    key={item.label}>
                                    {item.hasDropdown ? (
                                        <div>
                                            <button
                                                onClick={() => handleMobileDropdownToggle(item.label)}
                                                className="flex items-center justify-between w-full text-light-gray hover:text-white transition-all duration-200 py-2 px-4 rounded-lg hover:bg-white/20 cursor-pointer text-sm"
                                            >
                                                <span className="font-normal">
                                                    {item.label}
                                                </span>
                                                <FaChevronDown
                                                    className={`w-3 h-3 transition-transform duration-200 ${mobileOpenDropdown === item.label ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {/* Mobile Dropdown Items */}
                                            {mobileOpenDropdown === item.label && item.dropdownItems && (
                                                <div className="pl-4 mt-2 space-y-2">
                                                    {item.dropdownItems.map((dropdownItem) => (
                                                        <NavLink
                                                            key={dropdownItem.id}
                                                            to={dropdownItem.href}
                                                            className="block p-3 rounded-lg glassmorphism hover:bg-white/30 transition-all duration-200"
                                                            onClick={() => {
                                                                setIsMobileMenuOpen(false);
                                                                setMobileOpenDropdown(null);
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                {dropdownItem.icon && (
                                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                        <dropdownItem.icon className="w-4 h-4 text-white" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-white font-medium text-sm">
                                                                            {dropdownItem.title}
                                                                        </h4>
                                                                    </div>
                                                                    <p className="text-xs text-gray-300 leading-relaxed">
                                                                        {dropdownItem.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <NavLink
                                            to={item.href}
                                            className="block text-sm font-normal text-light-gray hover:text-white transition-all duration-200 py-2 px-4 rounded-lg hover:bg-white/20"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </NavLink>
                                    )}
                                </div>
                            ))}

                            {/* Mobile Buttons */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-gray-600">
                                <NavLink
                                    to="/login"
                                    className="btn-outline"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Log in
                                </NavLink>
                                <NavLink
                                    to="/signup"
                                    className="btn-primary"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Signup - It's FREE
                                </NavLink>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PreLoginHeader;