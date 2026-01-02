import React from 'react';
import Marquee from 'react-fast-marquee';

interface MarqueeProps {
    children: React.ReactNode;
    speed?: number;
    direction?: 'left' | 'right';
    pauseOnHover?: boolean;
    gradient?: boolean;
    gradientColor?: string;
    gradientWidth?: number;
    className?: string;
    width?: string | number;
    height?: string | number;
    loop?: number;
    delay?: number;
    play?: boolean;
    style?: React.CSSProperties;
}

function CustomMarquee({
    children,
    speed = 40,
    direction = 'left',
    pauseOnHover = false,
    gradient = false,
    gradientColor = '#ffffff',
    gradientWidth = 50,
    className = '',
    width = '100%',
    height = 'auto',
    loop = 0,
    delay = 0,
    play = true,
    style = {},
}: MarqueeProps) {
    return (
        <>
            <style>{`
                .marquee-container * {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .marquee-container *::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div 
                className={`marquee-container ${className}`}
                style={{ 
                    width, 
                    height,
                    overflow: 'hidden',
                    ...style 
                }}
            >
                <Marquee
                    speed={speed}
                    direction={direction}
                    pauseOnHover={pauseOnHover}
                    gradient={gradient}
                    gradientColor={gradientColor}
                    gradientWidth={gradientWidth}
                    loop={loop}
                    delay={delay}
                    play={play}
                    style={{
                        overflow: 'hidden',
                    }}
                >
                    {children}
                </Marquee>
            </div>
        </>
    );
}

export default CustomMarquee;