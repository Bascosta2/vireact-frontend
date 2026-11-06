import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationToggleProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  /** Optional icon shown in a tile to the left of the text. */
  icon?: ReactNode;
  /** Kept for older callers; the toggle always uses the dark app tokens now. */
  variant?: "light" | "dark";
}

/** One switch row in Settings > Notifications. The whole row is labelled by its title and description. */
export const NotificationToggle = ({ title, description, enabled, onToggle, icon }: NotificationToggleProps) => {
  const titleId = useId();
  const descId = useId();

  return (
    <div className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
      {icon && (
        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200",
            enabled ? "border-accent/40 bg-accent-tint text-accent" : "border-line bg-white/[0.03] text-fg-subtle"
          )}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p id={titleId} className="text-sm font-semibold text-fg">
          {title}
        </p>
        <p id={descId} className="mt-0.5 text-sm text-fg-muted">
          {description}
        </p>
      </div>

      <button
        onClick={onToggle}
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          "app-focus relative h-7 w-12 shrink-0 rounded-full border transition-[background-color,border-color,box-shadow] duration-200",
          enabled
            ? "border-accent/60 bg-accent/80 shadow-[0_0_16px_rgba(232,103,53,0.35)]"
            : "border-control/40 bg-white/[0.06]"
        )}
      >
        <motion.span
          className="absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-md"
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};
