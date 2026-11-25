import { HelpCircle } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';

/** Plain-English meanings of the words the app uses, shown next to them so nobody has to leave the page. */
export const GLOSSARY = {
  viralityScore: 'A 0 to 100 read of how likely this video is to keep people watching and share it. 70 and up is strong, 40 to 69 is fair, under 40 needs work.',
  checks: 'The parts of a video Vireact looks at: hook, pacing, audio, captions, and predicted views. Each one gets its own score and fixes.',
  hook: 'The first 1 to 3 seconds. It decides whether people stop scrolling.',
  realViews: 'The view count your video actually got after you posted it. Logging it teaches Vireact what works for your audience.',
  predictedViews: 'The range of views Vireact expects for this video, based on its score and on how videos like it have done.',
  postingPlan: 'A 2-week plan of what to post and when, built from your best videos.',
  scoreChange: 'How your average score moved compared with the period before.',
} as const;

export type GlossaryTerm = keyof typeof GLOSSARY;

/** A small "?" that explains a term on hover, focus or tap. */
export function InfoTip({ term, text, label, className }: { term?: GlossaryTerm; text?: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const content = text ?? (term ? GLOSSARY[term] : '');
  return (
    <span className={cn('relative inline-flex align-middle', className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={`What is ${label}?`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="app-focus inline-flex h-5 w-5 items-center justify-center rounded-full text-fg-subtle hover:text-fg"
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 top-full z-40 mt-2 w-64 -translate-x-1/2 rounded-lg border border-line bg-surface-raised px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-fg shadow-lg shadow-black/40 transition-opacity duration-100',
          open ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  );
}
