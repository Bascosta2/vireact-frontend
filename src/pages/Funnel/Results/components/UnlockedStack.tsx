import { Check, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { claims } from '@/content/claims';

type AnchorKey = keyof typeof claims.valueAnchors;

interface StackItem {
  key: AnchorKey;
  title: string;
  outcome: string;
  /** "ready" items are already on this page; "locked" ones need an account. */
  state: 'ready' | 'used' | 'locked' | 'unlocked';
  status: string;
  href?: string;
}

interface UnlockedStackProps {
  hooksHidden: boolean;
  rewriteUsed: boolean;
  isAuthenticated: boolean;
  trialOn?: boolean;
}

export const buildStackItems = ({
  hooksHidden,
  rewriteUsed,
  isAuthenticated,
  trialOn = String(import.meta.env.VITE_TRIAL_BILLING ?? '').toLowerCase() === 'true',
}: UnlockedStackProps): StackItem[] => [
  {
    key: 'quiz',
    title: 'Your hook plan',
    outcome: hooksHidden ? 'Where your viewers drop off and what to fix first.' : 'Where viewers drop off, plus hooks matched to your niche.',
    state: 'ready',
    status: 'Ready',
    href: hooksHidden ? undefined : '#hooks-heading',
  },
  {
    key: 'rewriter',
    title: 'A free AI hook rewrite',
    outcome: 'Paste your opening line, get versions you can say on camera today.',
    state: rewriteUsed ? 'used' : 'ready',
    status: rewriteUsed ? 'Used' : 'Ready',
    href: '#hook-rewriter',
  },
  {
    key: 'library',
    title: 'The hook & story library',
    outcome: 'Proven openers and story structures, so you never start from a blank page.',
    state: isAuthenticated ? 'unlocked' : 'locked',
    status: isAuthenticated ? 'Unlocked' : 'Free account',
  },
  {
    key: 'analysis',
    title: 'Frame-by-frame video analysis',
    outcome: 'The exact second viewers swipe on your video, and the line to replace it with.',
    state: isAuthenticated ? 'unlocked' : 'locked',
    status: isAuthenticated ? 'Unlocked' : trialOn ? '7-day free trial' : 'Free account',
    href: isAuthenticated ? '/upload' : undefined,
  },
];

/** Concise "what you get" checklist shown only on the results page, after the six questions. */
function UnlockedStack(props: UnlockedStackProps) {
  const items = buildStackItems(props);

  return (
    <section aria-labelledby="unlocked-heading" className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <h3 id="unlocked-heading" className="text-lg font-semibold">What you get free</h3>
      <ul className="mt-3 divide-y divide-white/10">
        {items.map((item) => {
          const anchor = claims.valueAnchors[item.key];
          const done = item.state === 'ready' || item.state === 'unlocked';
          const body = (
            <>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  done ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/10 text-white/60'
                }`}
                aria-hidden="true"
              >
                {done ? <Check className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="font-semibold text-white">{item.title}</span>
                  <span className={`text-xs font-medium ${done ? 'text-emerald-300' : 'text-white/60'}`}>{item.status}</span>
                </span>
                <span className="mt-0.5 block text-sm text-white/70">{item.outcome}</span>
                {anchor.verified && anchor.amount && (
                  <span className="mt-0.5 block text-xs text-white/60">{anchor.amount} value, free</span>
                )}
              </span>
            </>
          );
          return (
            <li key={item.key}>
              {item.href?.startsWith('/') ? (
                <Link to={item.href} className="flex gap-3 py-3 hover:bg-white/[0.02]">
                  {body}
                </Link>
              ) : item.href ? (
                <a href={item.href} className="flex gap-3 py-3 hover:bg-white/[0.02]">
                  {body}
                </a>
              ) : (
                <div className="flex gap-3 py-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default UnlockedStack;
