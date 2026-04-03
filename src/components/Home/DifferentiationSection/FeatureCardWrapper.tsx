interface FeatureCardWrapperProps {
  children: React.ReactNode;
  isFocused: boolean;
  accent: 'green' | 'pink' | 'blue';
  onFocus?: () => void;
  onBlur?: () => void;
  'aria-label': string;
}

export default function FeatureCardWrapper({
  children,
  isFocused,
  accent,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
}: FeatureCardWrapperProps) {
  return (
    <div
      role="article"
      aria-label={ariaLabel}
      tabIndex={0}
      onFocus={onFocus}
      onBlur={onBlur}
      className="outline-none flex flex-col min-h-0 h-full w-full rounded-xl p-5 transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 hover:border-[rgba(255,60,172,0.3)]"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {children}
    </div>
  );
}
