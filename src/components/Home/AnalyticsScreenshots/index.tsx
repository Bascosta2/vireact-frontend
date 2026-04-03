import React from "react";
import { motion } from "framer-motion";
import { WinsColumn } from "@/components/UI/wins-column";
import { winScreenshots } from "./wins-items";

const firstColumn = winScreenshots.slice(0, 3);
const secondColumn = winScreenshots.slice(3, 6);
const thirdColumn = winScreenshots.slice(6, 9);

function AnalyticsScreenshots() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background gradient for integration */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent pointer-events-none"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        {/* Centered heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex justify-center mb-12"
        >
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-red-600 bg-clip-text text-transparent tracking-tight"
            style={{
              background: "linear-gradient(90deg, #FF4757, #FF6B35)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            WINS
          </h2>
        </motion.div>

        {/* Three columns with mask gradient */}
        <div
          className="flex justify-center gap-4 md:gap-6 max-h-[700px] overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        >
          <WinsColumn
            wins={firstColumn}
            duration={35}
            className="flex-shrink-0 flex justify-center"
          />
          <WinsColumn
            wins={secondColumn}
            duration={30}
            className="hidden md:flex flex-shrink-0 justify-center"
          />
          <WinsColumn
            wins={thirdColumn}
            duration={28}
            className="hidden lg:flex flex-shrink-0 justify-center"
          />
        </div>

        {/* Subtle hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8 text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          Click any result to see the full case study
        </motion.p>
      </div>
    </section>
  );
}

export default AnalyticsScreenshots;
