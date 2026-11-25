import { describe, expect, it } from 'vitest';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { hookPath } from '@/remotion/skills/remotion-reel/hook-path';
import { ANIMATED_STYLE_IDS, LIBRARY_STYLE_IDS, PAINTED_STYLE_IDS, STYLE_IDS } from '@/remotion/styles/ids';
import { LIBRARY } from '@/remotion/styles/library';
import { STYLE_COVERS } from '@/remotion/styles/covers';
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

  it('lists every style, each its own skill with a theme the composition can draw', () => {
    // Same ids as the backend registry (vireact-backend/src/service/editor/skills.js): the 10 animation
    // styles, the 10 painted styles, then the library (library.json, copied to the backend as is).
    expect([...ANIMATED_STYLE_IDS, ...PAINTED_STYLE_IDS].length).toBe(20);
    expect(LIBRARY_STYLE_IDS.length).toBe(111);
    expect(new Set(STYLE_IDS).size).toBe(STYLE_IDS.length);
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
      // Scene layouts need a scene; explainers keep the creator in a bubble; window layouts have a window.
      if (s.layout === 'story' || s.layout === 'explainer') expect(theme?.Scene).toBeTruthy();
      if (s.layout === 'explainer') expect(theme?.pip).toBeTruthy();
      if (s.layout === 'window') expect(theme?.screen).toBeTruthy();
    }
    expect(names.size).toBe(STYLE_IDS.length);
    // Other companies' marks and creators' names from the sources are renamed or left out.
    expect(SKILLS.map((s) => `${s.name} ${s.tagline} ${s.bestFor}`).join(' ')).not.toMatch(/lego|ps2|playstation|ghibli|hd-2d|backrooms|matrix|dan koe|zackd|clawd|reuters/i);
    expect(themeFor('remotion-reel')).toBeNull();
  });

  it('every library style is described once: copy, planner rules, sound palette and cover', () => {
    for (const id of LIBRARY_STYLE_IDS) {
      const e = LIBRARY[id];
      expect(e, id).toBeTruthy();
      expect(e!.accent).toBe(STYLE_THEMES[id].accent);
      for (const k of ['tagline', 'bestFor', 'look', 'motion', 'hookRule', 'graphicsRule', 'ambient', 'captions', 'hook', 'graphics', 'transition', 'sound', 'source'] as const) expect(e![k].length, `${id}.${k}`).toBeGreaterThan(8);
      expect(STYLE_COVERS[id].category).toBe(e!.category);
      if (e!.layout === 'story' || e!.layout === 'explainer') expect(STYLE_COVERS[id].base).toBe('scene');
    }
    // Every section of the library has skills in it.
    const used = new Set(ANIMATION_STYLES.flatMap((s) => [s.category, ...s.tags]));
    for (const c of ['talking-head', 'any-footage', 'storytelling', 'explainer', 'data', 'product', 'news', 'retro', 'motion', 'cartoon', 'gaming', 'art', 'music']) expect(used.has(c as never), c).toBe(true);
  });

  it('accents match the backend, which sends them as the edit’s accent', () => {
    const backend: Record<string, string> = {
      'glow-sketch': '#FFC24B', 'comic-art': '#FFD400', 'brick-build': '#FFCD00', 'pixel-art': '#FFD43B', chalkboard: '#FFE66B',
      'retro-3d': '#7CFFB2', 'flat-vector': '#FF6B4A', 'minimal-line': '#FF3B30', 'cgi-motion': '#5CE1E6', 'explainer-3d': '#FFC93C',
      watercolour: '#E0533A', 'roman-mosaic': '#D9A441', 'sumi-e': '#C8102E', 'impasto-oil': '#E9A13B', 'nocturne-gouache': '#FFC978',
      'botanical-plate': '#4A7FD4', 'paper-cut': '#9FE8F5', 'art-nouveau': '#C9982F', 'golden-hour': '#FF8C42', 'painted-anime': '#3D9BE9',
    };
    for (const id of [...ANIMATED_STYLE_IDS, ...PAINTED_STYLE_IDS]) expect(STYLE_THEMES[id].accent).toBe(backend[id]);
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

describe('Skills library curation', () => {
  it('groups every skill by what it is for, and covers each on the kind of video it is for', async () => {
    const { STYLE_COVERS } = await import('@/remotion/styles/covers');
    // The hand-made sets (the library's sections are checked with library.json above).
    const hand = new Set<string>(['remotion-reel', ...ANIMATED_STYLE_IDS, ...PAINTED_STYLE_IDS]);
    const byCat = (c: string) => SKILLS.filter((s) => hand.has(s.id) && s.category === c).map((s) => s.id);
    expect(byCat('talking-head')).toEqual(['remotion-reel', 'chalkboard', 'flat-vector', 'minimal-line']);
    expect(byCat('any-footage')).toEqual(['glow-sketch', 'comic-art', 'brick-build', 'pixel-art', 'retro-3d', 'cgi-motion', 'explainer-3d']);
    expect(byCat('storytelling')).toEqual(['watercolour', 'roman-mosaic', 'sumi-e', 'impasto-oil', 'nocturne-gouache', 'botanical-plate', 'paper-cut', 'art-nouveau', 'golden-hour', 'painted-anime']);
    // Not one talking head for everything: animation styles each show a different kind of footage.
    const screens = byCat('any-footage').map((id) => STYLE_COVERS[id as keyof typeof STYLE_COVERS].base);
    expect(new Set(screens).size).toBe(screens.length);
    expect(screens).not.toContain('talking');
    for (const s of SKILLS) expect(s.shown.length).toBeGreaterThan(3);
  });

  it('every scene style (storytelling, explainers) paints a scene; no other style does', () => {
    for (const s of ANIMATION_STYLES) {
      const scene = s.layout === 'story' || s.layout === 'explainer';
      expect(Boolean(STYLE_THEMES[s.id as keyof typeof STYLE_THEMES].Scene), s.id).toBe(scene);
      expect(STYLE_COVERS[s.id as keyof typeof STYLE_COVERS].base === 'scene', s.id).toBe(scene);
    }
  });
});
