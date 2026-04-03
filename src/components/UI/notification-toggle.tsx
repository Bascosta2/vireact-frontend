import React from "react";
import { motion } from "framer-motion";

interface NotificationToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  variant?: "light" | "dark";
}

export const NotificationToggle = ({
  title,
  description,
  enabled,
  onToggle,
  variant = "light",
}: NotificationToggleProps) => {
  const isDark = variant === "dark";

  return (
    <div
      className={`flex items-center justify-between py-6 flex-shrink-0 ${
        isDark ? "border-b border-gray-700 last:border-b-0" : "border-b border-gray-200 last:border-b-0"
      }`}
    >
      <div className="flex-1 pr-4">
        <h3
          className={`text-lg font-bold mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>

      <button
        onClick={onToggle}
        type="button"
        className={`
          relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500
          flex-shrink-0
          ${isDark ? "focus:ring-offset-gray-900" : "focus:ring-offset-2"}
          ${enabled ? "bg-blue-500" : isDark ? "bg-gray-700" : "bg-gray-300"}
        `}
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${title}`}
      >
        <motion.span
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
          animate={{
            x: enabled ? 24 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    </div>
  );
};
