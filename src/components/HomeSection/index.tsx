import React from 'react';
import SectionHeader from '@/components/SectionHeader';

interface HomeSectionProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    background?: 'black' | 'transparent' | 'custom';
    customBackground?: string;
    padding?: 'default' | 'small' | 'large';
    maxWidth?: 'default' | 'small' | 'large';
    overflow?: 'visible' | 'hidden';
    // Optional section header props
    sectionHeader?: {
        badge: string;
        title: string;
        icon?: React.ReactNode;
        className?: string;
    };
    gradient?: boolean;
}

function HomeSection({
    children,
    className = '',
    containerClassName = '',
    background = 'black',
    customBackground,
    padding = 'default',
    maxWidth = 'default',
    overflow = 'visible',
    sectionHeader,
    gradient = true
}: HomeSectionProps) {
    // Compose section className directly, readable and clear
    const sectionClassName = [
        'relative',
        // Padding
        padding === 'small'
            ? 'py-12'
            : padding === 'large'
                ? 'py-32'
                : 'py-24',
        // Background
        background === 'black'
            ? 'bg-black'
            : background === 'transparent'
                ? 'bg-transparent'
                : background === 'custom'
                    ? customBackground || ''
                    : 'bg-black',
        // Overflow
        overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible',
        className
    ]
        .filter(Boolean)
        .join(' ');

    // Compose container className directly, readable and clear
    const containerClassNameFinal = [
        'relative',
        'z-10',
        'w-full',
        maxWidth === 'small'
            ? 'max-w-4xl'
            : maxWidth === 'large'
                ? 'max-w-7xl'
                : 'max-w-7xl',
        'mx-auto',
        containerClassName
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <section className={sectionClassName}>

            {/* Background Gradients */}
            
            {gradient && (

                <></>
                // <div className="absolute inset-0 overflow-hidden">
                //     {/* Primary gradient - soft and distant */}
                //     <div className="absolute -top-1/3 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-primary/35 via-primary/20 to-transparent rounded-full blur-[80px] animate-pulse"></div>
                    
                //     {/* Secondary gradient - complementary and gentle */}
                //     <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-secondary/30 via-secondary/18 to-transparent rounded-full blur-[90px] animate-pulse" style={{animationDelay: '2s'}}></div>
                    
                //     {/* Accent gradient - subtle overlay */}
                //     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary/15 to-secondary/15 rounded-full blur-[60px] animate-pulse" style={{animationDelay: '4s'}}></div>
                    
                //     {/* Ambient glow - enhanced visibility */}
                //     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-transparent"></div>
                // </div>


            )}

            <div 
            className={containerClassNameFinal}>
                {sectionHeader && (
                    <SectionHeader
                        badge={sectionHeader.badge}
                        title={sectionHeader.title}
                        icon={sectionHeader.icon}
                        className={sectionHeader.className}
                    />
                )}
                {children}
            </div>
        </section>
    );
}

export default HomeSection;