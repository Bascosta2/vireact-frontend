import React from 'react';
import { 
    SiIheartradio, 
    SiNvidia, 
    SiGithub, 
    SiHubspot,
    SiAmazon,
    SiGoogle,
    SiMeta
} from 'react-icons/si';
import { FaHeart, FaBroadcastTower, FaPepperHot, FaSearch, FaWindows } from 'react-icons/fa';
import jazza from '../FeaturesPage/CreatorsAndBusinesses/youtubers-images/jazza.jpg';
import grian from '../FeaturesPage/CreatorsAndBusinesses/youtubers-images/grian.jpg';
import cubfan135 from '../FeaturesPage/CreatorsAndBusinesses/youtubers-images/cubfan_135.jpg';
import mumboJumbo from '../FeaturesPage/CreatorsAndBusinesses/youtubers-images/mumbo_jumbo.jpg';

interface CreatorProfile {
    id: string;
    name: string;
    followers: string;
    avatar: string;
    platform: 'youtube' | 'instagram';
    avatarColor: string;
}

interface CompanyLogo {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    logoColor: string;
    logoShape: 'circle' | 'square';
}

interface SocialProofProps {
    className?: string;
}

const SocialProof: React.FC<SocialProofProps> = ({ className = '' }) => {
    const creatorProfiles: CreatorProfile[] = [
        {
            id: 'jazza',
            name: 'Jazza',
            followers: '6.7M',
            avatar: jazza,
            platform: 'youtube',
            avatarColor: 'bg-red-600'
        },
        {
            id: 'grian',
            name: 'Grian',
            followers: '8.24M',
            avatar: grian,
            platform: 'youtube',
            avatarColor: 'bg-red-600'
        },
        {
            id: 'cubfan135',
            name: 'Cubfan135',
            followers: '823K',
            avatar: cubfan135,
            platform: 'youtube',
            avatarColor: 'bg-red-600'
        },
        {
            id: 'mumbo-jumbo',
            name: 'Mumbo Jumbo',
            followers: '9.08M',
            avatar: mumboJumbo,
            platform: 'youtube',
            avatarColor: 'bg-red-600'
        }
    ];

    const companyLogos: CompanyLogo[] = [
        {
            id: 'iheart-media',
            name: 'iHeart MEDIA',
            icon: SiIheartradio,
            logoColor: 'bg-red-600',
            logoShape: 'circle'
        },
        {
            id: 'nvidia',
            name: 'NVIDIA',
            icon: SiNvidia,
            logoColor: 'bg-green-600',
            logoShape: 'square'
        },
        {
            id: 'univision',
            name: 'Univision',
            icon: FaBroadcastTower,
            logoColor: 'bg-blue-600',
            logoShape: 'circle'
        },
        {
            id: 'github',
            name: 'GitHub',
            icon: SiGithub,
            logoColor: 'bg-gray-600',
            logoShape: 'circle'
        },
        {
            id: 'microsoft',
            name: 'Microsoft',
            icon: FaWindows,
            logoColor: 'bg-blue-500',
            logoShape: 'square'
        },
        {
            id: 'amazon',
            name: 'Amazon',
            icon: SiAmazon,
            logoColor: 'bg-orange-500',
            logoShape: 'square'
        },
        {
            id: 'chili-piper',
            name: 'CHILI PIPER',
            icon: FaPepperHot,
            logoColor: 'bg-orange-600',
            logoShape: 'circle'
        },
        {
            id: 'hubspot',
            name: 'HubSpot',
            icon: SiHubspot,
            logoColor: 'bg-orange-500',
            logoShape: 'square'
        },
        {
            id: 'memphis-grizzlies',
            name: 'MEMPHIS GRIZZLIES',
            icon: FaHeart,
            logoColor: 'bg-blue-500',
            logoShape: 'circle'
        },
        {
            id: 'zoominfo',
            name: 'zoominfo',
            icon: FaSearch,
            logoColor: 'bg-red-500',
            logoShape: 'square'
        },
        {
            id: 'google',
            name: 'Google',
            icon: SiGoogle,
            logoColor: 'bg-red-500',
            logoShape: 'circle'
        },
        {
            id: 'meta',
            name: 'Meta',
            icon: SiMeta,
            logoColor: 'bg-blue-600',
            logoShape: 'circle'
        }
    ];

    const getPlatformIcon = (platform: 'youtube' | 'instagram') => {
        if (platform === 'youtube') {
            return (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
            );
        }

        return (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
        );
    };

    const getPlatformBadgeColor = (platform: 'youtube' | 'instagram') => {
        if (platform === 'youtube') {
            return 'bg-red-600';
        }
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
    };

    const getLogoShapeClass = (shape: 'circle' | 'square') => {
        return shape === 'circle' ? 'rounded-full' : 'rounded';
    };

    return (
        <div className={`bg-black flex flex-col justify-center px-16 py-16 ${className}`}>
            {/* Main Heading */}
            <div className="mb-12 text-center">
            <div className="inline-flex items-center px-6 py-2 bg-gray bg-dark-primary border border-green-500 rounded-full mb-4">
                    <span className="text-sm text-green-500 uppercase">
                        #1 AI short form content tool
                    </span>
                </div>
                <h2 className="text-5xl font-bold text-white leading-tight">
                    Trusted by 10K+ creators and businesses worldwide
                </h2>
            </div>

            {/* Creator Profiles */}
            <div className="mb-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {creatorProfiles.map((creator) => (
                        <div key={creator.id} className="text-center">
                            <div className={`w-16 h-16 ${creator.avatarColor} rounded-full flex items-center justify-center mb-3 mx-auto relative overflow-hidden`}>
                                <img 
                                    src={creator.avatar} 
                                    alt={creator.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getPlatformBadgeColor(creator.platform)} rounded-full flex items-center justify-center`}>
                                    {getPlatformIcon(creator.platform)}
                                </div> */}
                            </div>
                            <div className="text-white font-semibold">{creator.name}</div>
                            <div className="text-gray-400 text-sm">{creator.followers}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Company Logos */}
            <div className="space-y-8">
                {/* First Row */}
                <div className="flex justify-between">
                    {companyLogos.slice(0, 6).map((company) => {
                        const IconComponent = company.icon;
                        return (
                            <div key={company.id}>
                                <div className={`w-8 h-8 ${company.logoColor} ${getLogoShapeClass(company.logoShape)} flex items-center justify-center`}>
                                    <IconComponent className="text-white text-lg" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Second Row */}
                <div className="flex justify-between">
                    {companyLogos.slice(6, 12).map((company) => {
                        const IconComponent = company.icon;
                        return (
                            <div key={company.id} className="flex items-center justify-center">
                                <div className={`w-8 h-8 ${company.logoColor} ${getLogoShapeClass(company.logoShape)} flex items-center justify-center`}>
                                    <IconComponent className="text-white text-lg" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SocialProof;
