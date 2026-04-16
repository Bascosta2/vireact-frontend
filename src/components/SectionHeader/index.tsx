import React from 'react';
import { IoSparkles } from 'react-icons/io5';

interface SectionHeaderProps {
    badge?: string;
    title: string;
    icon?: React.ReactNode;
    className?: string;
}

function SectionHeader({ badge, title, icon, className = '' }: SectionHeaderProps) {
    return (
        <div className={`text-center mb-8 px-4 md:mb-16 md:px-0 ${className}`}>
            {badge ? (
                <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
                    {icon || <IoSparkles className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">
                        {badge}
                    </span>
                </div>
            ) : null}
            <h2 className="mb-4 text-2xl !leading-tight md:mb-6 md:text-5xl">
                {title}
            </h2>
        </div>
    );
}

export default SectionHeader;