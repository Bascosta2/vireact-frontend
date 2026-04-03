import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import type { PreLoginHeaderProps } from '@/types/header';
import NavigationDropdown from '@/components/UI/NavigationDropdown';
import { navItems } from './pre-login-nav-items';

const PreLoginHeader: React.FC<PreLoginHeaderProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [signupRipple, setSignupRipple] = useState<{ x: number; y: number } | null>(null);
    const signupBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleSignupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSignupRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setTimeout(() => {
            setSignupRipple(null);
            navigate('/signup');
        }, 200);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleDropdownToggle = (event: React.MouseEvent, label: string) => {
        event.preventDefault();
        event.stopPropagation();
        if (openDropdown === label) {
            setOpenDropdown(null);
        } else {
            setOpenDropdown(label);
        }
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
        }, 100);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 h-18 ${className}`}
            style={{
                background: 'rgba(10, 10, 15, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-full">
                <div className="flex items-center justify-between h-full gap-2">
                    <div className="flex justify-center items-center min-w-0 flex-shrink-0">
                        <NavLink to="/" className="text-2xl lg:text-3xl font-bold font-heading leading-tight text-gradient-primary">
                            VIREACT
                        </NavLink>
                    </div>

                    {/* md+ : same desktop nav & buttons as before (previously shown at lg+) */}
                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => (
                            <div key={item.label} className="relative">
                                {item.hasDropdown ? (
                                    <div
                                        onMouseEnter={() => handleMouseEnter(item.label)}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <button
                                            ref={buttonRef}
                                            type="button"
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

                    <div className="hidden md:flex items-center gap-3 xl:gap-4 flex-shrink-0">
                        <NavLink
                            to="/login"
                            className="btn-outline"
                        >
                            Log in
                        </NavLink>
                        <button
                            ref={signupBtnRef}
                            type="button"
                            onClick={handleSignupClick}
                            className="btn-primary btn-primary-hero-nav relative overflow-hidden"
                        >
                            {signupRipple && (
                                <span
                                    className="absolute bg-white/40 rounded-full animate-ripple pointer-events-none"
                                    style={{
                                        left: signupRipple.x,
                                        top: signupRipple.y,
                                        width: 20,
                                        height: 20,
                                        marginLeft: -10,
                                        marginTop: -10,
                                    }}
                                />
                            )}
                            Sign up - It's FREE
                        </button>
                    </div>

                    {/* &lt; md only: hamburger + compact signup */}
                    <div className="flex md:hidden items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-light-gray hover:text-white hover:bg-white/20 transition-colors duration-200 min-h-[44px] min-w-[44px]"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Open menu"
                        >
                            <FaBars className="block h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            onClick={handleSignupClick}
                            className="btn-primary text-sm px-3 py-2 rounded-lg font-semibold whitespace-nowrap min-h-[40px]"
                        >
                            Sign up - It's FREE
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div
                        className="md:hidden fixed inset-0 z-[100] flex flex-col pt-[4.5rem]"
                        style={{ background: 'rgba(10, 10, 15, 0.98)' }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                    >
                        <div className="flex justify-end px-4 pb-2 border-b border-white/10">
                            <button
                                type="button"
                                onClick={closeMobileMenu}
                                className="p-3 rounded-lg text-light-gray hover:text-white hover:bg-white/10 min-h-[48px] min-w-[48px] flex items-center justify-center"
                                aria-label="Close menu"
                            >
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-4 py-2">
                            <NavLink
                                to="/features/viral-predictor"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                Features
                            </NavLink>
                            <NavLink
                                to="/pricing"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                Pricing
                            </NavLink>
                            <NavLink
                                to="/frequently-asked-questions"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                FAQs
                            </NavLink>
                            <NavLink
                                to="/get-in-touch"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                Get in touch
                            </NavLink>
                            <NavLink
                                to="/early-access"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                Early Access
                            </NavLink>
                            <NavLink
                                to="/login"
                                className="flex items-center min-h-[48px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={closeMobileMenu}
                            >
                                Log in
                            </NavLink>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PreLoginHeader;
