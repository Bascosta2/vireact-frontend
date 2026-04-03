import { useState, useEffect } from 'react';
import { profileData } from '@/components/FeaturesPage/CreatorsAndBusinesses/profile-data';

const AVATAR_COUNT = 5;

function HeroAvatarStack() {
  const [counter, setCounter] = useState(1000);
  const [hoverStack, setHoverStack] = useState(false);

  useEffect(() => {
    if (!hoverStack) {
      setCounter(1000);
      return;
    }
    const id = setInterval(() => {
      setCounter((c) => (c >= 1247 ? 1000 : c + 25));
    }, 40);
    return () => clearInterval(id);
  }, [hoverStack]);

  const displayCount = hoverStack ? counter : 1000;
  const compact = true; // compact layout for hero

  const avatarSize = compact ? 'w-8 h-8' : 'w-10 h-10';
  const overlap = compact ? '-space-x-2.5' : '-space-x-3';
  const gapWhenHover = compact ? 'gap-1.5' : 'gap-2';

  return (
    <div
      className={`flex items-center ${compact ? 'gap-3 flex-row' : 'flex-col gap-3 mb-10'}`}
    >
      <div
        className={`flex items-center transition-[gap] duration-300 ${hoverStack ? gapWhenHover : overlap}`}
        onMouseEnter={() => setHoverStack(true)}
        onMouseLeave={() => setHoverStack(false)}
        title="Join 1,000+ creators"
      >
        {profileData.slice(0, AVATAR_COUNT).map((profile) => (
          <div
            key={profile.name}
            className={`relative ${avatarSize} rounded-full border-2 border-black bg-gray-700 overflow-hidden transition-transform duration-300 hover:scale-110 hover:z-10 flex-shrink-0`}
          >
            <img
              src={profile.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <span
        className="text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300"
        onMouseEnter={() => setHoverStack(true)}
        onMouseLeave={() => setHoverStack(false)}
      >
        Used by {displayCount.toLocaleString()}+ creators
      </span>
    </div>
  );
}

export default HeroAvatarStack;
