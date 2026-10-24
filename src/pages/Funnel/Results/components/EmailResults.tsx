import { useState, type FormEvent } from 'react';
import { captureFunnelEmail } from '@/api/funnel';
import { track } from '@/lib/analytics';

function EmailResults({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  if (state === 'saved') {
    return <p className="text-sm text-white/70">Thanks. We'll email your results to {email}.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-white/70 underline underline-offset-4 min-h-[44px]">
        Email me these results
      </button>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState('saving');
    try {
      await captureFunnelEmail(sessionId, email.trim());
      setState('saved');
      track('results_email_captured');
    } catch {
      setState('error');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
      <label htmlFor="results-email" className="sr-only">Email</label>
      <input
        id="results-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 min-h-[48px] rounded-xl bg-white/5 border border-white/15 px-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
      />
      <button type="submit" disabled={state === 'saving'} className="btn-secondary min-h-[48px] rounded-xl">
        {state === 'saving' ? 'Saving…' : 'Send'}
      </button>
      {state === 'error' && <p role="alert" className="text-sm text-red-400">That didn't work. Check the address and try again.</p>}
    </form>
  );
}

export default EmailResults;
