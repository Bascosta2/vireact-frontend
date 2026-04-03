import React from "react";
import { TrendingUp, Users, DollarSign } from "lucide-react";

interface WinCardPlaceholderProps {
  type: "views" | "subscribers" | "revenue";
  mainValue: string;
  subtitle: string;
  height?: "small" | "medium" | "large";
}

export const WinCardPlaceholder = ({
  type,
  mainValue,
  subtitle,
  height = "medium",
}: WinCardPlaceholderProps) => {
  const icons = {
    views: TrendingUp,
    subscribers: Users,
    revenue: DollarSign,
  };

  const Icon = icons[type];

  const getHeightClass = () => {
    switch (height) {
      case "small":
        return "h-[180px]";
      case "large":
        return "h-[280px]";
      case "medium":
      default:
        return "h-[220px]";
    }
  };

  return (
    <div
      className={`
        ${getHeightClass()} w-full max-w-[320px]
        rounded-2xl p-6
        flex flex-col items-center justify-center
        text-center
        relative overflow-hidden
        bg-gradient-to-br from-white/10 to-white/5
        backdrop-blur-md
        border border-white/20
        shadow-xl shadow-black/20
      `}
    >
      <Icon className="w-12 h-12 text-red-500 mb-4 relative z-10" />

      <div className="text-4xl font-bold text-white mb-2 relative z-10">
        {mainValue}
      </div>

      <div className="text-sm text-gray-400 flex items-center gap-2 relative z-10">
        <TrendingUp className="w-4 h-4 text-green-500" />
        {subtitle}
      </div>

      {height === "large" && (
        <div className="mt-4 w-full h-20 flex items-end justify-between gap-1 relative z-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-blue-500/30 rounded-t min-h-[4px]"
              style={{
                height: `${30 + Math.sin(i * 0.5) * 40}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
