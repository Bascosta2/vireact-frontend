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

interface Logo {
    image: string;
}

function CreatorsAndBusinesses() {
    return (
        <div className="w-full max-w-7xl mx-auto py-16">
            {/* Title Badge */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex items-center px-6 py-3 bg-white/15 border-gradient-secondary rounded-full">
                    <span className="text-sm text-white font-medium">
                        Used by 1,000+ creators and businesses
                    </span>
                </div>
            </div>

            {/* Profile Cards Row - Moving Right */}
            <div className="mb-8">
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

            {/* Logo Row - Moving Left */}
            <div>
                <CustomMarquee
                    speed={40}
                    direction="left"
                    pauseOnHover={false}
                    gradient={false}
                    className="py-4"
                >
                    {logoData.map((logo, index) => (
                        <LogoCard
                            key={index}
                            image={logo.image}
                        />
                    ))}
                </CustomMarquee>
            </div>
        </div>
    );
}

export default CreatorsAndBusinesses;
