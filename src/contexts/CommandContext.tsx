import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandForShortcut, type AppCommand } from '@/lib/app-commands';
import { useEditorAccess } from '@/lib/editor-access';
import { useAccountsAccess } from '@/lib/accounts-access';
import { track } from '@/lib/analytics';
import { CommandContext } from './command-context';

const CommandPalette = lazy(() => import('@/components/app/CommandPalette'));


/** Typing in a field must never trigger app shortcuts. */
const isTyping = (target: EventTarget | null) => {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
};

const SEQUENCE_MS = 1200;

/**
 * App-wide search and shortcuts: Ctrl+K / Cmd+K (or "/") opens the command bar; "c a", "c s", "c v", "c t"
 * create things and "g h", "g l", "g a", "g s" go to pages, pressed one key after the other.
 */
export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const navigate = useNavigate();
  const editor = useEditorAccess();
  const accounts = useAccountsAccess();
  const pending = useRef<{ key: string; at: number } | null>(null);

  const allowed = useCallback(
    (c: AppCommand) => (c.requires === 'editor' ? editor === 'granted' : c.requires === 'accounts' ? accounts === 'granted' : true),
    [editor, accounts]
  );

  const openPalette = useCallback((query = '') => {
    setInitialQuery(query);
    setOpen(true);
    track('command_bar_opened', { query_prefilled: Boolean(query) });
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => {
          if (!v) setInitialQuery('');
          return !v;
        });
        return;
      }
      if (open || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target) || e.repeat) return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === '/') {
        e.preventDefault();
        openPalette();
        return;
      }
      const key = e.key.toLowerCase();
      const prev = pending.current;
      if (prev && Date.now() - prev.at < SEQUENCE_MS) {
        const cmd = commandForShortcut(prev.key, key, allowed);
        pending.current = null;
        if (cmd) {
          e.preventDefault();
          track('shortcut_used', { command: cmd.id });
          navigate(cmd.href);
          return;
        }
      }
      pending.current = key === 'c' || key === 'g' ? { key, at: Date.now() } : null;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, allowed, navigate, openPalette]);

  const value = useMemo(() => ({ open, openPalette, closePalette, allowed }), [open, openPalette, closePalette, allowed]);

  return (
    <CommandContext.Provider value={value}>
      {children}
      {open && (
        <Suspense fallback={null}>
          <CommandPalette initialQuery={initialQuery} onClose={closePalette} allowed={allowed} />
        </Suspense>
      )}
    </CommandContext.Provider>
  );
}
