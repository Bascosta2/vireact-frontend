    import React, { useEffect, useRef } from 'react';
    import { NavLink, useLocation } from 'react-router-dom';

    export interface DropdownItem {
        id: number;
        title: string;
        description: string;
        href: string;
        icon?: React.ComponentType<{ className?: string }>;
    }

    interface NavigationDropdownProps {
        isOpen: boolean;
        onClose: () => void;
        items: DropdownItem[];
        className?: string;
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    }

    function NavigationDropdown({ 
        isOpen, 
        onClose, 
        items, 
        className = '',
        onMouseEnter,
        onMouseLeave
    }: NavigationDropdownProps) {
        const dropdownRef = useRef<HTMLDivElement>(null);

        // Close dropdown when clicking outside
        useEffect(() => {
            function handleClickOutside(event: MouseEvent) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    onClose();
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside);
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [isOpen, onClose]);

        // Close on route change and on scroll so the menu never sits over page content.
        const { pathname } = useLocation();
        const openedAtPath = useRef(pathname);
        useEffect(() => {
            if (isOpen) openedAtPath.current = pathname;
        }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
        useEffect(() => {
            if (isOpen && pathname !== openedAtPath.current) onClose();
        }, [pathname, isOpen, onClose]);
        useEffect(() => {
            if (!isOpen) return;
            const handleScroll = () => onClose();
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }, [isOpen, onClose]);

        // Close dropdown on escape key
        useEffect(() => {
            function handleEscapeKey(event: KeyboardEvent) {
                if (event.key === 'Escape') {
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

        return (
            <div 
                ref={dropdownRef}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className={`
                    absolute top-full -left-12 mt-3
                    w-[380px] sm:w-[580px] lg:w-[700px] max-w-[calc(100vw-2rem)]
                    rounded-2xl border border-white/10 bg-[#0c0c13]/95 backdrop-blur-2xl
                    shadow-[0_0_0_1px_rgba(255,0,79,0.08),0_0_40px_rgba(255,0,79,0.12),0_24px_60px_rgba(0,0,0,0.6)]
                    z-[60]
                    ${className}
                `}
            >   

                {/* Dropdown Items */}
                <div className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {items.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.href}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `group block rounded-xl border p-3 transition-colors duration-200 ${
                                        isActive ? 'border-pink-500/30 bg-pink-500/10' : 'border-transparent hover:border-white/10 hover:bg-white/[0.05]'
                                    }`
                                }
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    {item.icon && (
                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#FF004F]/25 to-[#FF883E]/15 transition-shadow duration-200 group-hover:shadow-[0_0_18px_rgba(255,0,79,0.3)]">
                                            <item.icon className="w-6 h-6 text-white group-hover:text-white transition-colors duration-200" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold medium !font-sans text-white group-hover:text-white transition-colors duration-200">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed group-hover:text-white transition-colors duration-200">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    export default NavigationDropdown;