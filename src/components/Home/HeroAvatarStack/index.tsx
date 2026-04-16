import { useState, useEffect, cloneElement } from 'react';
import type { ReactNode } from 'react';
import { profileData } from '@/components/FeaturesPage/CreatorsAndBusinesses/profile-data';

const AVATAR_COUNT = 5;

export type HeroAvatarStackProps = {
  /** Narrow hero strip: smaller avatars + text-xs; desktop instances omit this. */
  variant?: 'default' | 'heroMobileCompact';
};

function HeroAvatarStack({ variant = 'default' }: HeroAvatarStackProps): ReactNode {
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
  const isMobileCompact = variant === 'heroMobileCompact';

  // Hero: larger avatars on narrow viewports (fills gap under widget previews); md+ compact hero size
  const avatarSize = isMobileCompact
    ? 'w-6 h-6'
    : compact
      ? 'w-9 h-9 md:w-8 md:h-8'
      : 'w-10 h-10';
  const overlap = isMobileCompact ? '-space-x-2' : compact ? '-space-x-2 md:-space-x-2.5' : '-space-x-3';
  const gapWhenHover = isMobileCompact ? 'gap-1' : compact ? 'gap-1.5 md:gap-1.5' : 'gap-2';

  const avatarRow = (
    <div
      className={`flex items-center shrink-0 transition-[gap] duration-300 ${hoverStack ? gapWhenHover : overlap}`}
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
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );

  const caption = (
    <span
      className={
        isMobileCompact
          ? 'shrink-0 text-xs text-gray-400 transition-colors duration-300 hover:text-gray-300 whitespace-nowrap'
          : 'text-sm md:text-sm text-gray-400 transition-colors duration-300 hover:text-gray-300'
      }
      onMouseEnter={() => setHoverStack(true)}
      onMouseLeave={() => setHoverStack(false)}
    >
      Used by {displayCount.toLocaleString()}+ creators
    </span>
  );

  if (isMobileCompact) {
    return [
      cloneElement(avatarRow, { key: 'hero-mobile-avatars' }),
      cloneElement(caption, { key: 'hero-mobile-used-by' }),
    ];
  }

  return (
    <div
      className={`flex shrink-0 items-center ${compact ? 'flex-row gap-2.5 md:gap-3' : 'mb-10 flex-col gap-3'}`}
    >
      {avatarRow}
      {caption}
    </div>
  );
}

export default HeroAvatarStack;
