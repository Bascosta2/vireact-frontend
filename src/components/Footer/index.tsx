import React from 'react';
import type { FooterProps } from '@/types/footer';
import { footerSections, socialLinks } from '@/components/Footer/footer-items';
import { FooterSection } from '@/components/Footer/FooterSection';
import { SocialIcon } from '@/components/Footer/SocialIcon';


const Footer: React.FC<FooterProps> = ({ className = '' }) => {
    return (
        <footer className={`bg-black ${className}`}>
            {/* Main Footer Content */}
            <div className="py-16">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
                        {/* Logo Section */}
                        <div className="lg:col-span-1 flex justify-center lg:justify-start">
                            <span className="text-6xl font-normal leading-tight text-gradient-primary font-heading">
                                VIREACT
                            </span>
                        </div>

                        {/* Navigation Sections */}
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
                            {footerSections.map((section) => (
                                <FooterSection key={section.title} section={section} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Bar */}
            <div className="border-t border-gray-600 py-6">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Copyright */}
                        <p className="text-base font-semibold font-heading leading-relaxed text-gray-400 text-center sm:text-left">
                            © {new Date().getFullYear()} Vireact. All rights reserved.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <SocialIcon
                                    key={social.label}
                                    icon={social.icon}
                                    href={social.href}
                                    label={social.label}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;