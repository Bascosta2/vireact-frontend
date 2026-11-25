import { createContext, useContext } from 'react';
import type { AppCommand } from '@/lib/app-commands';

export interface CommandContextValue {
  open: boolean;
  openPalette: (query?: string) => void;
  closePalette: () => void;
  /** Whether this account can use a command (beta features). */
  allowed: (c: AppCommand) => boolean;
}

export const CommandContext = createContext<CommandContextValue | undefined>(undefined);

export function useCommands(): CommandContextValue {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('useCommands must be used within a CommandProvider');
  return ctx;
}

/** "⌘K" on Apple devices, "Ctrl K" elsewhere. */
export const commandKeyLabel = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
