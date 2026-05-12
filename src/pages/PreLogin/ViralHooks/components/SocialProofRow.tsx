import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import HeroAvatarStack from '@/components/Home/HeroAvatarStack';

/**
 * Reuses the homepage hero's social-proof pattern (4 solid + 1 partial star,
 * avatar stack, "Used by 1,000+ creators"). Two layouts: a tight mobile
 * column and the wider row on md+.
 */
function SocialProofRow() {
    return (
        <>
            {/* Mobile: stacked rows (avatars + creators above stars + rating) */}
            <motion.div
                className="md:hidden mt-6 mb-2 flex flex-col items-center justify-center gap-2 px-2 min-w-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="flex flex-row flex-nowrap items-center justify-center gap-3 min-w-0">
                    <HeroAvatarStack variant="heroMobileCompact" />
                </div>
                <div className="rating-section flex min-w-0 shrink flex-row flex-nowrap items-center justify-center gap-3">
                    <div className="flex shrink-0 items-center justify-center gap-0.5" title="Rated 4.6/5 by 1000+ creators">
                        {[1, 2, 3, 4].map((star) => (
                            <Star
                                key={star}
                                className="h-3.5 w-3.5 flex-shrink-0"
                                style={{ color: '#eab308', fill: '#eab308' }}
                                aria-hidden
                            />
                        ))}
                        <span className="relative inline-flex h-3.5 w-3.5 flex-shrink-0" aria-hidden>
                            <Star className="absolute inset-0 h-3.5 w-3.5" style={{ color: '#a16207', fill: 'none' }} />
                            <span className="pointer-events-none absolute left-0 top-0 h-full w-[60%] overflow-hidden">
                                <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#eab308', fill: '#eab308' }} />
                            </span>
                        </span>
                    </div>
                    <span className="text-xs leading-tight whitespace-nowrap">
                        <span className="font-medium text-white">4.6/5</span>{' '}
                        <span className="font-normal text-gray-400">based on 1000+ reviews</span>
                    </span>
                </div>
            </motion.div>

            {/* Desktop: row layout */}
            <motion.div
                className="hidden md:flex flex-row flex-wrap items-center justify-center gap-6 lg:gap-8 mb-0 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="rating-section flex flex-row flex-wrap items-center gap-1">
                    <div className="flex items-center justify-center gap-1" title="Rated 4.6/5 by 1000+ creators">
                        {[1, 2, 3, 4].map((star) => (
                            <Star
                                key={star}
                                className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                                style={{ color: '#eab308', fill: '#eab308' }}
                                aria-hidden
                            />
                        ))}
                        <span className="relative inline-flex w-4 h-4 md:w-5 md:h-5 flex-shrink-0" aria-hidden>
                            <Star className="absolute inset-0 w-4 h-4 md:w-5 md:h-5" style={{ color: '#a16207', fill: 'none' }} />
                            <span className="absolute left-0 top-0 h-full overflow-hidden w-[60%] pointer-events-none">
                                <Star
                                    className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                                    style={{ color: '#eab308', fill: '#eab308' }}
                                />
                            </span>
                        </span>
                    </div>
                    <span className="text-white font-medium text-xs md:text-sm">
                        <span className="text-white">4.6/5</span>{' '}
                        <span className="text-gray-400 font-normal">based on 1000+ reviews</span>
                    </span>
                </div>
                <div className="creators-section flex items-center justify-center gap-3">
                    <HeroAvatarStack />
                </div>
            </motion.div>
        </>
    );
}

export default SocialProofRow;
