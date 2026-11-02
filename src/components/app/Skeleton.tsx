import { cn } from '@/lib/utils';

/** Static placeholder block. Show it via `useDelayedFlag` so it only appears after 1 s of loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-lg bg-white/[0.06]', className)} />;
}
