import { describe, expect, it } from 'vitest';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { hookPath } from '@/remotion/skills/remotion-reel/hook-path';
import { SKILLS, skillById } from './catalog';

describe('Skills Editor', () => {
  it('stands in for the Editor tab in the sidebar and stays active on its edits and the classic editor', () => {
    const ids = APP_NAV_ITEMS.map((i) => i.id);
    expect(ids).toContain('skills');
    expect(ids).not.toContain('editor');
    expect(isNavActive('/skills', '/skills')).toBe(true);
    expect(isNavActive('/skills/abc123', '/skills')).toBe(true);
    expect(isNavActive('/editor/abc123', '/skills')).toBe(true);
    expect(isNavActive('/skillset', '/skills')).toBe(false);
  });

  it('every skill has a showcase, steps, and features that say whether they are in the edit', () => {
    for (const s of SKILLS) {
      expect(s.hero).toBeTruthy();
      expect(s.how.length).toBeGreaterThan(2);
      for (const f of s.features) {
        expect(f.title).toBeTruthy();
        expect(f.what.length).toBeGreaterThan(20);
        expect(['live', 'coming']).toContain(f.status);
      }
    }
    expect(skillById('remotion-reel')?.name).toBe('Remotion Reel');
    expect(skillById('nope')).toBeNull();
  });

  it('the text hook outline is one closed path around all lines', () => {
    const d = hookPath([792, 496], 540, 300);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    expect(d.match(/M/g)).toHaveLength(1);
    // The widest line reaches 540 ± 396.
    expect(d).toContain('936');
    expect(d).toContain('144');
  });
});
