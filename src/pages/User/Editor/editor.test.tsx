import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Thumbnail } from '@remotion/player';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { EditComposition } from '@/remotion/EditComposition';
import type { EditProps } from '@/remotion/types';
import { FootageDisclaimer } from './Disclaimer';
import { Toggle } from './ReviewPanel';

const props: EditProps = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 120,
  timeline: [{ id: 's1', segId: 's1', srcStart: 4, srcEnd: 6, outStartFrame: 0, durationFrames: 60 }, { id: 's2', segId: 's2', srcStart: 0, srcEnd: 2, outStartFrame: 60, durationFrames: 60 }],
  captions: { preset: 'bold_pop', pages: [{ startFrame: 0, endFrame: 30, words: [{ text: 'The', startFrame: 0, endFrame: 10, emphasis: false, i: 7 }, { text: 'fix', startFrame: 10, endFrame: 30, emphasis: true, i: 8 }] }] },
  hook: { text: 'The 5 second fix', startFrame: 0, durationFrames: 45 },
  zooms: [{ index: 0, startFrame: 5, durationFrames: 20, scale: 1.2, focusX: 0.5, focusY: 0.4 }],
  overlays: [],
  sfx: [],
  music: null,
  framing: { mode: 'fill', focusX: 0.5 },
  videoUrl: 'https://example.invalid/proxy.mp4',
  musicUrl: null,
  sfxUrls: {},
};

describe('Editor tab navigation', () => {
  it('sits between Library and Analytics in the sidebar', () => {
    const ids = APP_NAV_ITEMS.map((i) => i.id);
    expect(ids).toEqual(['home', 'library', 'editor', 'analytics', 'settings']);
  });
  it('stays active on project pages', () => {
    expect(isNavActive('/editor', '/editor')).toBe(true);
    expect(isNavActive('/editor/abc123', '/editor')).toBe(true);
    expect(isNavActive('/editorial', '/editor')).toBe(false);
    expect(isNavActive('/analytics', '/editor')).toBe(false);
  });
});

describe('Editor UI pieces', () => {
  it('states that only the uploaded footage is used', () => {
    const html = renderToStaticMarkup(<FootageDisclaimer />);
    expect(html).toContain('works only with the footage you upload');
    expect(html).toContain('create');
  });

  it('Toggle is an accessible switch', () => {
    const html = renderToStaticMarkup(<Toggle checked label="Zooms" onChange={() => {}} />);
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-checked="true"');
  });

  it('the edit composition renders captions and the hook overlay at frame 0', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Thumbnail component={EditComposition} inputProps={props} compositionWidth={1080} compositionHeight={1920} frameToDisplay={0} durationInFrames={120} fps={30} />
      </MemoryRouter>
    );
    expect(html).toContain('The 5 second fix');
    expect(html).toContain('fix');
    // Words are separated by real spaces (an inline-block would swallow a trailing one).
    expect(html).toContain('The</span> <span');
  });
});

// Keep React in scope for JSX under the classic runtime used by some test setups.
void React;
