import React from 'react';
import { IoSparkles } from 'react-icons/io5';

interface SectionHeaderProps {
    badge: string;
    title: string;
    icon?: React.ReactNode;
    className?: string;
}

function SectionHeader({ badge, title, icon, className = '' }: SectionHeaderProps) {
    return (
        <div className={`text-center mb-16 ${className}`}>
            <div className="flex items-center justify-center gap-2 mb-4">
                {icon || <IoSparkles className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-400 uppercase tracking-wider">
                    {badge}
                </span>
            </div>
            <h2 className="mb-6">
                {title}
            </h2>
        </div>
    );
}

export default SectionHeader;