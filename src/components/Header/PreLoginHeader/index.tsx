import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { ArrowUpRight, X } from 'lucide-react';
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
            className={`app-edge-bottom md:after:hidden fixed top-0 left-0 right-0 z-50 h-18 ${className}`}
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

                    {/* &lt; md only: compact glowing signup + glass menu button */}
                    <div className="flex md:hidden items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            data-cta-location="header_mobile"
                            onClick={handleSignupClick}
                            className="btn-primary h-10 rounded-full px-4 text-[13px] font-semibold whitespace-nowrap shadow-[0_0_20px_rgba(255,0,79,0.35)]"
                        >
                            Sign up free
                        </button>
                        <button
                            type="button"
                            onClick={openMobileMenu}
                            className="group inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-xl border border-white/10 bg-white/[0.04] transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Open menu"
                        >
                            <span aria-hidden="true" className="block h-[2px] w-5 rounded-full bg-white" />
                            <span aria-hidden="true" className="block h-[2px] w-3.5 translate-x-[3px] rounded-full bg-gradient-to-r from-[#FF004F] to-[#FF883E] transition-transform duration-200 group-hover:translate-x-0" />
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
                    className="md:hidden fixed inset-0 z-[100] flex flex-col overflow-hidden"
                    style={{ background: '#07070b', height: '100dvh' }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                >
                    {/* Ambient glow + faint grid behind the menu */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(60% 40% at 100% 0%, rgba(255,0,79,0.18), transparent 70%), radial-gradient(50% 35% at 0% 100%, rgba(255,136,62,0.14), transparent 70%)',
                        }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                            maskImage: 'linear-gradient(180deg, black, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(180deg, black, transparent 80%)',
                        }}
                    />

                    <div className="app-edge-bottom relative flex h-18 shrink-0 items-center justify-between px-4">
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
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-pink-400"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <nav className="relative flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-2">
                        <ul className="space-y-2">
                            {MOBILE_LINKS.map((link, i) => (
                                <li
                                    key={link.to}
                                    className="mobile-menu-item"
                                    style={{ animationDelay: `${40 + i * 45}ms` }}
                                >
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `group flex min-h-[56px] items-center gap-4 rounded-2xl border px-4 transition-colors duration-200 ${
                                                isActive
                                                    ? 'border-pink-500/40 bg-pink-500/10 text-white'
                                                    : 'border-white/[0.07] bg-white/[0.03] text-zinc-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                                            }`
                                        }
                                        onClick={() => {
                                            if (link.trackLocation) track('cta_clicked', { location: link.trackLocation });
                                            closeMobileMenu();
                                        }}
                                    >
                                        <span aria-hidden="true" className="w-6 font-mono text-[11px] tabular-nums text-zinc-500">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex-1 text-base font-medium">{link.label}</span>
                                        <ArrowUpRight
                                            aria-hidden="true"
                                            className="h-4 w-4 text-zinc-500 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                                        />
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="app-edge-top relative shrink-0 px-4 pt-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
                        <button
                            type="button"
                            data-cta-location="mobile_menu"
                            onClick={(e) => {
                                closeMobileMenu();
                                handleSignupClick(e);
                            }}
                            className="btn-primary w-full min-h-[52px] rounded-2xl text-base font-semibold shadow-[0_0_28px_rgba(255,0,79,0.35)]"
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
