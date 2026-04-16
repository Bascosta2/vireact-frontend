import { useEffect, useState, useRef } from "react";
import { Upload, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/redux/hooks/use-auth";
import { motion } from "framer-motion";
import HeroAvatarStack from "@/components/Home/HeroAvatarStack";
import { MobileWidgetPreviewRow } from "@/components/Home/HeroSection/MobileWidgetPreviewRow";

const TYPING_PHRASES = [
  "Drop an Instagram Reel Link",
  "Drop a YouTube Shorts Link",
  "Drop a TikTok Link",
];

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [typedText, setTypedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing");
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleReviewClick = () => {
    document.getElementById("creator-stories")?.scrollIntoView({ behavior: "smooth" });
  };

  // Typing animation: type 2s, pause 2s, delete 1.5s
  useEffect(() => {
    if (isFocused) return;
    const target = TYPING_PHRASES[phraseIndex];
    if (phase === "typing") {
      if (typedText.length < target.length) {
        const t = setTimeout(() => setTypedText(target.slice(0, typedText.length + 1)), 50);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("pause"), 0);
      return () => clearTimeout(t);
    }
    if (phase === "pause") {
      const t = setTimeout(() => setPhase("deleting"), 2000);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (typedText.length > 0) {
        const t = setTimeout(() => setTypedText(typedText.slice(0, -1)), 40);
        return () => clearTimeout(t);
      }
      setPhase("typing");
      setPhraseIndex((phraseIndex + 1) % TYPING_PHRASES.length);
    }
  }, [typedText, phraseIndex, phase, isFocused]);

  useEffect(() => {
    if (!isFocused && phase === "typing") {
      setTypedText("");
    }
  }, [phraseIndex, isFocused]);

  return (
    <div
      className="relative overflow-hidden min-h-screen pb-0 max-w-[100vw]"
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
            #1 CREATOR TRUSTED SHORT FORM CONTENT TOOL
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
          className="text-center text-gray-300 max-md:text-sm md:text-[17px] max-w-xs md:max-w-2xl mx-auto mb-5 md:mb-8 px-2 md:px-4 select-text cursor-text"
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
          className="md:hidden px-4 mb-0"
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
            Sign Up Free — Predict Your Views
          </button>
        </motion.div>

        <MobileWidgetPreviewRow />

        {/* Desktop: input + or + upload — unchanged */}
        <motion.div
          className="hidden md:flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            className="relative flex-1 w-full max-w-[500px]"
            onClick={handlePrimaryAction}
            onFocus={(e) => {
              e.currentTarget.querySelector("input")?.focus();
            }}
            initial={false}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? "" : typedText || " "}
              className="w-full h-[60px] pl-5 pr-5 rounded-xl bg-gray-900/80 border-2 border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] text-sm sm:text-base cursor-pointer transition-all duration-300"
              style={{ caretColor: isFocused ? "#22d3ee" : "transparent" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePrimaryAction();
              }}
              aria-label="Paste your video link or click to sign up"
            />
          </motion.div>

          <span className="text-gray-500 text-sm font-medium animate-pulse" style={{ opacity: 0.6 }}>
            or
          </span>

          <motion.button
            type="button"
            onClick={handlePrimaryAction}
            className="flex items-center justify-center gap-2 h-[60px] w-[160px] rounded-xl bg-white text-black font-bold text-sm sm:text-base px-4 cursor-pointer border-0 shadow-lg hover:shadow-xl hover:bg-gray-50 active:bg-gray-100 transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Upload video, redirects to signup"
          >
            <Upload className="w-5 h-5 flex-shrink-0" aria-hidden />
            Upload Here
          </motion.button>
        </motion.div>

        {/* Social proof — mobile: single compact row under widget previews */}
        <motion.div
          className="social-proof-compact md:hidden mt-6 mb-6 flex flex-row flex-nowrap items-center justify-center gap-3 px-2 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <HeroAvatarStack variant="heroMobileCompact" />
          <button
            type="button"
            onClick={handleReviewClick}
            className="rating-section flex min-w-0 shrink flex-row flex-nowrap items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="flex shrink-0 items-center justify-center gap-0.5" title="Rated 4.6/5 by 1000+ creators">
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
              <span className="font-medium text-white">4.6/5</span>{" "}
              <span className="font-normal text-gray-400">based on 1000+ reviews</span>
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
            <div className="flex items-center justify-center gap-1" title="Rated 4.6/5 by 1000+ creators">
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
              <span className="text-white">4.6/5</span>{" "}
              <span className="text-gray-400 font-normal">based on 1000+ reviews</span>
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
