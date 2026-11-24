import { describe, expect, it } from 'vitest';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { hookPath } from '@/remotion/skills/remotion-reel/hook-path';
import { STYLE_IDS } from '@/remotion/styles/ids';
import { STYLE_THEMES, themeFor } from '@/remotion/styles/registry';
import { enterProgress, enterStyle } from '@/remotion/styles/motion';
import { ANIMATION_STYLES, SKILLS, skillById } from './catalog';

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

  it('lists the ten animation styles, each its own skill with a theme the composition can draw', () => {
    // Same ids as the backend registry (vireact-backend/src/service/editor/skills.js ANIMATION_STYLES).
    expect([...STYLE_IDS]).toEqual(['glow-sketch', 'comic-art', 'brick-build', 'pixel-art', 'chalkboard', 'retro-3d', 'flat-vector', 'minimal-line', 'cgi-motion', 'explainer-3d']);
    expect(ANIMATION_STYLES.map((s) => s.id)).toEqual([...STYLE_IDS]);
    expect(SKILLS.map((s) => s.id)).toEqual(['remotion-reel', ...STYLE_IDS]);
    const names = new Set<string>();
    for (const s of ANIMATION_STYLES) {
      expect(s.kind).toBe('animation');
      expect(s.hero).toEqual({ kind: 'style', id: s.id });
      expect(s.bestFor).toBeTruthy();
      expect(s.features.map((f) => f.id)).toEqual(['look', 'ambient', 'captions', 'hook', 'graphics', 'transition']);
      names.add(s.name);
      const theme = themeFor(s.id);
      expect(theme?.id).toBe(s.id);
      expect(theme?.accent).toMatch(/^#[0-9A-F]{6}$/i);
      expect(theme!.transition.before + theme!.transition.after).toBeGreaterThan(4);
    }
    expect(names.size).toBe(10);
    // Trademarked names from the guide are renamed.
    expect(SKILLS.map((s) => `${s.name} ${s.tagline}`).join(' ')).not.toMatch(/lego|ps2|playstation/i);
    expect(themeFor('remotion-reel')).toBeNull();
  });

  it('accents match the backend, which sends them as the edit’s accent', () => {
    const backend: Record<string, string> = {
      'glow-sketch': '#FFC24B', 'comic-art': '#FFD400', 'brick-build': '#FFCD00', 'pixel-art': '#FFD43B', chalkboard: '#FFE66B',
      'retro-3d': '#7CFFB2', 'flat-vector': '#FF6B4A', 'minimal-line': '#FF3B30', 'cgi-motion': '#5CE1E6', 'explainer-3d': '#FFC93C',
    };
    for (const id of STYLE_IDS) expect(STYLE_THEMES[id].accent).toBe(backend[id]);
  });

  it('entrances start hidden, settle visible and leave hidden', () => {
    for (const kind of ['glide', 'pop', 'bounce', 'step', 'write', 'flicker', 'swing', 'fade'] as const) {
      expect(enterProgress(kind, -1, 30)).toBe(0);
      const settled = enterProgress(kind, 60, 30);
      expect(settled).toBeGreaterThan(0.98);
      const shown = enterStyle(kind, settled, 0, 60);
      expect(shown.opacity ?? 1).toBeGreaterThan(0.98);
      if (kind === 'write') expect(shown.clipPath).toMatch(/inset\(-20% 0(\.\d+)?% /);
      expect(enterStyle(kind, 1, 1, 90).opacity ?? 0).toBeLessThan(0.02);
    }
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
