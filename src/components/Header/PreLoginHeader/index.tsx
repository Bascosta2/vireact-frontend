import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
import type { PreLoginHeaderProps } from '@/types/header';
import NavigationDropdown from '@/components/UI/NavigationDropdown';
import { navItems } from './pre-login-nav-items';
import { track } from '@/lib/analytics';
import { claims } from '@/content/claims';
import { prefetchPublicRoutes } from '@/routes/prefetch-public-routes';

const MOBILE_LINKS: { to: string; label: string; trackLocation?: string }[] = [
    { to: '/features/viral-predictor', label: 'Features' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/frequently-asked-questions', label: 'FAQs' },
    { to: '/contact', label: 'Get in touch' },
    { to: '/viral-hooks', label: `${claims.hookCount} Free Hooks`, trackLocation: 'nav_free_hooks_mobile' },
    { to: '/login', label: 'Log in' },
];

const PreLoginHeader: React.FC<PreLoginHeaderProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [signupRipple, setSignupRipple] = useState<{ x: number; y: number } | null>(null);
    const signupBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleSignupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        track('cta_clicked', { location: e.currentTarget.dataset.ctaLocation || 'header' });
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

    const openMobileMenu = () => {
        // The user is about to pick a page: start fetching those route chunks now so the tap
        // swaps pages immediately instead of flashing the full-screen loader.
        prefetchPublicRoutes();
        setIsMobileMenuOpen(true);
    };

    // Close the menu whenever the route changes (back button, programmatic navigation, etc.).
    const { pathname } = useLocation();
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // While open: lock page scroll behind the overlay and let Escape close it.
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileMenuOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [isMobileMenuOpen]);

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
                                        onClick={item.href === '/viral-hooks' ? () => track('cta_clicked', { location: 'nav_free_hooks' }) : undefined}
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
                            onClick={openMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-light-gray hover:text-white hover:bg-white/20 transition-colors duration-200 min-h-[44px] min-w-[44px]"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Open menu"
                        >
                            <FaBars className="block h-6 w-6" />
                        </button>
                        <button
                            type="button"
                            data-cta-location="header_mobile"
                            onClick={handleSignupClick}
                            className="btn-primary text-sm px-3 py-2 rounded-lg font-semibold whitespace-nowrap min-h-[40px]"
                        >
                            Sign up - It's FREE
                        </button>
                    </div>
                </div>

            </div>

            {/*
              Rendered through a portal on purpose. The header uses backdrop-filter, which makes it the
              containing block for position:fixed children, so an in-header "fixed inset-0" overlay was
              clamped to the 72px header box: the header turned black and the links were clipped away.
            */}
            {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="md:hidden fixed inset-0 z-[100] flex flex-col"
                    style={{ background: '#0a0a0f', height: '100dvh' }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                >
                    <div className="flex h-18 shrink-0 items-center justify-between border-b border-white/10 px-4">
                        <NavLink
                            to="/"
                            onClick={closeMobileMenu}
                            className="text-2xl font-bold font-heading leading-tight text-gradient-primary"
                        >
                            VIREACT
                        </NavLink>
                        <button
                            type="button"
                            onClick={closeMobileMenu}
                            className="p-3 rounded-lg text-light-gray hover:text-white hover:bg-white/10 min-h-[48px] min-w-[48px] flex items-center justify-center"
                            aria-label="Close menu"
                        >
                            <FaTimes className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-2">
                        {MOBILE_LINKS.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className="flex items-center min-h-[52px] text-base text-light-gray hover:text-white border-b border-white/10"
                                onClick={() => {
                                    if (link.trackLocation) track('cta_clicked', { location: link.trackLocation });
                                    closeMobileMenu();
                                }}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="shrink-0 px-4 pt-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                        <button
                            type="button"
                            data-cta-location="mobile_menu"
                            onClick={(e) => {
                                closeMobileMenu();
                                handleSignupClick(e);
                            }}
                            className="btn-primary w-full min-h-[48px] rounded-xl text-base font-semibold"
                        >
                            Sign up - It's FREE
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
};

export default PreLoginHeader;
