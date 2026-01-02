    import React, { useEffect, useRef } from 'react';
    import { NavLink } from 'react-router-dom';

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
                    absolute top-[140%] -left-12 mt-2 
                    w-[380px] sm:w-[580px] lg:w-[700px]
                    glassmorphism border border-white/10 
                    rounded-2xl shadow-2xl 
                    z-50
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
                                className="block p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Icon */}
                                    {item.icon && (
                                        <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-all duration-200">
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