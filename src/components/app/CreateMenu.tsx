import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Popover } from '@/components/app/Popover';
import { APP_COMMANDS } from '@/lib/app-commands';
import { useCommands } from '@/contexts/command-context';
import { cn } from '@/lib/utils';

/** The "+" menu: everything you can start, with its two-key shortcut. */
export function CreateMenu({ side = 'bottom-end', className, buttonClassName }: { side?: 'bottom-start' | 'bottom-end' | 'right-start' | 'top-start'; className?: string; buttonClassName?: string }) {
  const { allowed } = useCommands();
  const items = APP_COMMANDS.filter((c) => c.group === 'create' && allowed(c));
  return (
    <Popover
      side={side}
      className={className}
      label="More things to create"
      buttonClassName={cn('inline-flex items-center justify-center', buttonClassName)}
      panelClassName="w-64"
      trigger={(open) => <ChevronDown className={cn('h-4 w-4 transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />}
    >
      {(close) => (
        <ul>
          {items.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.id}>
                <Link to={c.href} onClick={close} className="app-focus flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-fg hover:bg-white/5">
                  <Icon className="h-4 w-4 shrink-0 text-fg-muted" aria-hidden="true" />
                  <span className="flex-1">{c.label}</span>
                  {c.shortcut && (
                    <span className="flex gap-1" aria-label={`Shortcut ${c.shortcut}`}>
                      {c.shortcut.split(' ').map((k, i) => (
                        <kbd key={i} className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
                          {k.toUpperCase()}
                        </kbd>
                      ))}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Popover>
  );
}
