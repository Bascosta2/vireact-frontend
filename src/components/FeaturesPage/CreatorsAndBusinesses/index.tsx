import { useEffect, useRef } from 'react';
import CustomMarquee from '@/components/UI/Marquee';
import ProfileCard from './ProfileCard';
import LogoCard from './LogoCard';
import { profileData } from './profile-data';
import { logoData } from './logo-data';

interface Profile {
    name: string;
    image: string;
    followers: string;
}

const MOBILE_PROFILES_DUP = [...profileData, ...profileData] as Profile[];
const MOBILE_LOGOS_DUP = [...logoData, ...logoData];

function CreatorsAndBusinesses() {
    const creatorScrollRef = useRef<HTMLDivElement>(null);
    const logoScrollRef = useRef<HTMLDivElement>(null);
    const isPausedCreator = useRef(false);
    const isPausedLogo = useRef(false);

    const creatorTouchHandlers = {
        onTouchStart: () => {
            isPausedCreator.current = true;
        },
        onTouchEnd: () => {
            isPausedCreator.current = false;
        },
        onTouchCancel: () => {
            isPausedCreator.current = false;
        },
    } as const;

    const logoTouchHandlers = {
        onTouchStart: () => {
            isPausedLogo.current = true;
        },
        onTouchEnd: () => {
            isPausedLogo.current = false;
        },
        onTouchCancel: () => {
            isPausedLogo.current = false;
        },
    } as const;

    // Creator avatar row — scrolls left (scrollLeft increases).
    useEffect(() => {
        const el = creatorScrollRef.current;
        if (!el) return;
        const id = window.setInterval(() => {
            if (isPausedCreator.current) return;
            if (el.scrollWidth <= el.clientWidth) return;
            el.scrollLeft += 1;
            if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
                el.scrollLeft = 0;
            }
        }, 20);
        return () => window.clearInterval(id);
    }, []);

    // Tool/brand logo row — scrolls right (scrollLeft decreases), start at midpoint of duplicated strip.
    useEffect(() => {
        const el = logoScrollRef.current;
        if (!el) return;
        const setMid = () => {
            if (el.scrollWidth > el.clientWidth) {
                el.scrollLeft = el.scrollWidth / 2;
            }
        };
        setMid();
        requestAnimationFrame(setMid);
        const id = window.setInterval(() => {
            if (isPausedLogo.current) return;
            if (el.scrollWidth <= el.clientWidth) return;
            el.scrollLeft -= 1;
            if (el.scrollLeft <= 0) {
                el.scrollLeft = el.scrollWidth / 2;
            }
        }, 20);
        return () => window.clearInterval(id);
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto py-4 md:py-16 px-4 md:px-6 overflow-x-hidden">
            <div className="mb-4 md:mb-8">
                <div
                    ref={creatorScrollRef}
                    {...creatorTouchHandlers}
                    className="md:hidden overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {MOBILE_PROFILES_DUP.map((profile: Profile, i) => (
                        <div
                            key={`${profile.name}-${i}`}
                            className="flex shrink-0 flex-col items-center gap-1 w-[100px]"
                        >
                            <div className="w-14 h-14 rounded-full overflow-hidden relative shrink-0">
                                <img
                                    src={profile.image}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <p className="text-[10px] text-center font-bold uppercase text-white leading-tight line-clamp-2 w-full">
                                {profile.name}
                            </p>
                            <p className="text-[10px] text-center text-gray-400 leading-tight line-clamp-2 w-full">
                                {profile.followers}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="hidden md:block">
                    <CustomMarquee
                        speed={30}
                        direction="right"
                        pauseOnHover={false}
                        gradient={false}
                        className="py-4"
                    >
                        {profileData.map((profile: Profile) => (
                            <ProfileCard
                                key={profile.name}
                                name={profile.name}
                                image={profile.image}
                                followers={profile.followers}
                            />
                        ))}
                    </CustomMarquee>
                </div>
            </div>

            <div>
                <div
                    ref={logoScrollRef}
                    {...logoTouchHandlers}
                    className="md:hidden overflow-x-auto scrollbar-hide flex flex-row gap-4 px-4 pb-2"
                    style={{ WebkitOverflowScrolling: 'touch' }}
                >
                    {MOBILE_LOGOS_DUP.map((logo, index) => (
                        <div
                            key={`logo-${index}`}
                            className="flex shrink-0 items-center justify-center w-10 h-10"
                        >
                            <img
                                src={logo.image}
                                alt=""
                                className="w-10 h-10 object-cover rounded-full opacity-70 grayscale"
                            />
                        </div>
                    ))}
                </div>
                <div className="hidden md:block">
                    <CustomMarquee
                        speed={40}
                        direction="left"
                        pauseOnHover={false}
                        gradient={false}
                        className="py-4"
                    >
                        {logoData.map((logo, index) => (
                            <LogoCard key={index} image={logo.image} />
                        ))}
                    </CustomMarquee>
                </div>
            </div>
        </div>
    );
}

export default CreatorsAndBusinesses;
