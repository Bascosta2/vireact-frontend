import { AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatusKind } from '@/lib/video-status';

const META: Record<StatusKind, { text: string; cls: string; Icon: typeof Clock; spin?: boolean }> = {
  complete: { text: 'Ready', cls: 'text-success bg-success/10', Icon: CheckCircle2 },
  analyzing: { text: 'Analyzing', cls: 'text-warning bg-warning/10', Icon: Loader2, spin: true },
  queued: { text: 'In queue', cls: 'text-warning bg-warning/10', Icon: Clock },
  uploading: { text: 'Uploading', cls: 'text-warning bg-warning/10', Icon: Loader2, spin: true },
  pending: { text: 'Preparing', cls: 'text-warning bg-warning/10', Icon: Clock },
  failed: { text: 'Failed', cls: 'text-danger bg-danger/10', Icon: AlertCircle },
};

export function StatusPill({ kind, className }: { kind: StatusKind; className?: string }) {
  const { text, cls, Icon, spin } = META[kind];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', cls, className)}>
      <Icon className={cn('h-3.5 w-3.5', spin && 'motion-safe:animate-spin')} aria-hidden="true" />
      {text}
    </span>
  );
}
