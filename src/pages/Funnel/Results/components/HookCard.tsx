import { useState } from 'react';

interface HookCardProps {
  text: string;
  label?: string | null;
  onCopied?: () => void;
}

function HookCard({ text, label, onCopied }: HookCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      {label && <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>}
      <p className="text-base text-white leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={copy}
        className="self-start min-h-[44px] px-4 rounded-lg border border-white/20 text-sm hover:border-white/50"
        aria-label={`Copy hook: ${text}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default HookCard;
