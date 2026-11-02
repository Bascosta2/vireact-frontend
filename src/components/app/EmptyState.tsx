import type { ReactNode } from 'react';

export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line bg-surface px-6 py-12 text-center">
      {icon && <div className="mb-4 text-fg-subtle">{icon}</div>}
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <p className="mt-1 max-w-[65ch] text-sm text-fg-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
