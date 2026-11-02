import { describe, expect, it } from 'vitest';
import { buildStackItems } from './UnlockedStack';

describe('UnlockedStack (results page "What you get free")', () => {
  it('marks plan and rewrite ready and the account items locked for visitors', () => {
    const items = buildStackItems({ hooksHidden: false, rewriteUsed: false, isAuthenticated: false, trialOn: false });
    expect(items.map((i) => [i.key, i.state])).toEqual([
      ['quiz', 'ready'],
      ['rewriter', 'ready'],
      ['library', 'locked'],
      ['analysis', 'locked'],
    ]);
    expect(items[3].status).toBe('Free account');
  });

  it('labels analysis as the free trial when trial billing is on', () => {
    const items = buildStackItems({ hooksHidden: false, rewriteUsed: false, isAuthenticated: false, trialOn: true });
    expect(items[3].status).toBe('7-day free trial');
  });

  it('reflects a used rewrite, hidden hooks and a signed-in user', () => {
    const items = buildStackItems({ hooksHidden: true, rewriteUsed: true, isAuthenticated: true, trialOn: false });
    expect(items[0].href).toBeUndefined();
    expect(items[1].state).toBe('used');
    expect(items[3]).toMatchObject({ state: 'unlocked', href: '/upload' });
  });
});
