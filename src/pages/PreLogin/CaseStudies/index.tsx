import React from "react";
import PreLoginPage from "@/components/Layout/PreLoginPage";
import { Link } from "react-router-dom";

function CaseStudiesPage() {
  return (
    <PreLoginPage>
      <div className="max-w-5xl mx-auto px-6 md:px-20 py-20">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          style={{
            background: "linear-gradient(90deg, #FF4757, #FF6B35)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Success Stories
        </h1>
        <p className="text-xl opacity-75 mb-12 max-w-2xl">
          See how creators are using Vireact to achieve viral success. Real
          results from real creators.
        </p>

        {/* Placeholder for case study cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-8 border border-white/10 bg-white/5 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300"
            >
              <div className="text-3xl font-bold text-white mb-2">
                Case Study {i}
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Creator success story coming soon.
              </p>
              <span className="text-red-500 text-sm font-medium">
                Coming soon →
              </span>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </PreLoginPage>
  );
}

export default CaseStudiesPage;
