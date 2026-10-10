import { Upload, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/redux/hooks/use-auth";
import { motion } from "framer-motion";
import HeroAvatarStack from "@/components/Home/HeroAvatarStack";
import { track } from "@/lib/analytics";
import { claims } from "@/content/claims";
import { primaryCtaPath } from "@/funnel/cta";

const RATING_TITLE = `Rated ${claims.rating} by ${claims.reviewCount} creators`;

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handlePrimaryAction = () => {
    track('cta_clicked', { location: 'hero', authenticated: isAuthenticated });
    navigate(isAuthenticated ? "/dashboard" : primaryCtaPath());
  };

  const handleReviewClick = () => {
    document.getElementById("creator-stories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative overflow-hidden md:min-h-screen pb-0 md:pb-[300px] max-w-[100vw]"
      style={{ background: 'transparent' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 max-md:px-4 pt-4 sm:pt-6 md:pt-8 lg:pt-10">
        {/* Eyebrow badge - compressed */}
        <motion.div
          className="flex justify-center mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="hero-badge inline-block px-3 py-1 text-xs md:px-5 md:py-2 md:text-[13px] font-semibold uppercase tracking-wide cursor-default"
            style={{
              border: "1.5px solid rgba(16, 185, 129, 0.4)",
              color: "#4ade80",
              borderRadius: "9999px",
              backgroundColor: "transparent",
              boxShadow: "0 0 15px rgba(74, 222, 128, 0.3)",
            }}
            whileHover={{
              scale: 1.03,
              rotate: [0, -1, 1, 0],
              transition: { duration: 0.3 },
            }}
          >
            {claims.heroBadge}
          </motion.span>
        </motion.div>

        {/* Headline — mobile: capped size; md+: unchanged clamp sizing */}
        <motion.h1
          className="hero-headline text-center mb-3 md:mb-5 px-1 md:px-2 select-text cursor-text"
          style={{ lineHeight: 1.1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span
            className="inline-block font-normal text-3xl max-md:leading-tight md:[font-size:clamp(1.25rem,3.5vw,56px)]"
            style={{
              fontFamily: "Impact, sans-serif",
              fontWeight: 400,
              letterSpacing: "0.5px",
              background:
                "linear-gradient(90deg, #FF4757 0%, #FF6B35 50%, #FFA502 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            YOUR AI VIDEO COACH THAT PREDICTS VIRALITY BEFORE YOU POST
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p
          className="text-center text-gray-300 max-md:text-sm md:text-[17px] max-w-xs md:max-w-2xl mx-auto mt-6 md:mt-0 mb-5 md:mb-8 px-2 md:px-4 select-text cursor-text"
          style={{ lineHeight: 1.5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="md:hidden">Personalized, actionable feedback on every frame.</span>
          <span className="hidden md:inline">
            Get personalized, actionable feedback on every frame; Not just predictive analytics, but understanding exactly what to change to make your video go viral.
          </span>
        </motion.p>

        {/* Mobile-only primary CTA */}
        <motion.div
          className="md:hidden px-4 mt-8 md:mt-0 mb-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full h-14 rounded-xl text-base font-semibold text-white shadow-lg transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(90deg, #FF4757 0%, #FF6B35 50%, #FFA502 100%)",
            }}
          >
            Free content analysis
          </button>
        </motion.div>

        {/* Desktop primary CTA */}
        <motion.div
          className="hidden md:flex items-center justify-center max-w-2xl mx-auto mb-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.button
            type="button"
            onClick={handlePrimaryAction}
            className="flex items-center justify-center gap-2 h-[60px] px-8 rounded-xl text-white font-bold text-base cursor-pointer border-0 shadow-lg hover:shadow-xl transition-shadow"
            style={{
              background: "linear-gradient(90deg, #FF4757 0%, #FF6B35 50%, #FFA502 100%)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-5 h-5 flex-shrink-0" aria-hidden />
            Free content analysis
          </motion.button>
        </motion.div>

        {/* Social proof — mobile: stacked rows (avatars+creators above stars+rating) */}
        <motion.div
          className="social-proof-compact md:hidden mt-6 mb-6 flex flex-col items-center justify-center gap-2 px-2 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-row flex-nowrap items-center justify-center gap-3 min-w-0">
            <HeroAvatarStack variant="heroMobileCompact" />
          </div>
          <button
            type="button"
            onClick={handleReviewClick}
            className="rating-section flex min-w-0 shrink flex-row flex-nowrap items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex shrink-0 items-center justify-center gap-0.5" title={RATING_TITLE}>
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#eab308', fill: '#eab308' }} aria-hidden />
              ))}
              <span className="relative inline-flex h-3.5 w-3.5 flex-shrink-0" aria-hidden>
                <Star className="absolute inset-0 h-3.5 w-3.5" style={{ color: '#a16207', fill: 'none' }} />
                <span className="pointer-events-none absolute left-0 top-0 h-full w-[60%] overflow-hidden">
                  <Star className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#eab308', fill: '#eab308' }} />
                </span>
              </span>
            </div>
            <span className="text-xs leading-tight whitespace-nowrap">
              <span className="font-medium text-white">{claims.rating}</span>{" "}
              <span className="font-normal text-gray-400">based on {claims.reviewCount} reviews</span>
            </span>
          </button>
        </motion.div>

        {/* Social proof — desktop: unchanged row layout */}
        <motion.div
          className="social-proof-compact hidden md:flex flex-row flex-wrap items-center justify-center gap-6 lg:gap-8 mb-0 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            type="button"
            onClick={handleReviewClick}
            className="rating-section order-2 md:order-1 flex flex-col md:flex-row md:flex-wrap md:items-center gap-1 md:gap-1 cursor-pointer hover:opacity-90 transition-opacity text-center md:text-left"
          >
            <div className="flex items-center justify-center gap-1" title={RATING_TITLE}>
              {[1, 2, 3, 4].map((star) => (
                <Star key={star} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#eab308', fill: '#eab308' }} aria-hidden />
              ))}
              <span className="relative inline-flex w-4 h-4 md:w-5 md:h-5 flex-shrink-0" aria-hidden>
                <Star className="absolute inset-0 w-4 h-4 md:w-5 md:h-5" style={{ color: '#a16207', fill: 'none' }} />
                <span className="absolute left-0 top-0 h-full overflow-hidden w-[60%] pointer-events-none">
                  <Star className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: '#eab308', fill: '#eab308' }} />
                </span>
              </span>
            </div>
            <span className="text-white font-medium text-xs md:text-sm">
              <span className="text-white">{claims.rating}</span>{" "}
              <span className="text-gray-400 font-normal">based on {claims.reviewCount} reviews</span>
            </span>
          </button>
          <div className="creators-section order-1 md:order-2 flex items-center justify-center gap-3">
            <HeroAvatarStack />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { Hero };
