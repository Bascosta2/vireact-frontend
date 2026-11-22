import { describe, expect, it } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { Thumbnail } from '@remotion/player';
import { APP_NAV_ITEMS, isNavActive } from '@/lib/app-nav';
import { EditComposition } from '@/remotion/EditComposition';
import { BELOW_CAPTIONS, CAPTION_BAND, CAPTION_CENTER, calloutLabel } from '@/remotion/graphics-utils';
import { SFX_SECONDS } from '@/remotion/sfx';
import { SFX_TYPES, type CaptionPreset, type EditProps, type Graphic } from '@/remotion/types';
import { VisualStage } from '@/remotion/visuals/VisualStage';
import { VISUAL_NAMES } from '@/remotion/visuals/registry';
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
  it('sits after Analytics in the Grow group of the sidebar', () => {
    const ids = APP_NAV_ITEMS.map((i) => i.id);
    expect(ids).toEqual(['home', 'library', 'report', 'coach', 'scripts', 'analytics', 'skills', 'accounts', 'settings']);
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

const full: EditProps = {
  ...props,
  hook: null,
  graphics: [],
  transitions: [],
  effects: [],
  look: { grade: 'vivid', accent: '#FFD43B', progressBar: true, motion: true },
};

const frameHtml = (inputProps: EditProps, frame: number) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <Thumbnail component={EditComposition} inputProps={inputProps} compositionWidth={1080} compositionHeight={1920} frameToDisplay={frame} durationInFrames={120} fps={30} />
    </MemoryRouter>
  );

/** The caption line's own markup (it holds only word spans, so the first closing div ends it). */
const captionHtml = (html: string) => {
  const start = html.indexOf('<div data-captions');
  return start < 0 ? '' : html.slice(start, html.indexOf('</div>', start));
};
/** The words in a caption line, given what captionHtml returned. */
const captionText = (line: string) => line.replace(/<[^>]+>/g, '').trim();

describe('Editor captions', () => {
  const LOOKS: CaptionPreset[] = ['bold_pop', 'highlight', 'impact', 'clean'];
  const page = (preset: CaptionPreset): EditProps => ({ ...full, captions: { preset, pages: props.captions!.pages } });

  it('show the whole phrase on one centered line', () => {
    const line = captionHtml(frameHtml(page('bold_pop'), 2));
    expect(captionText(line)).toBe('The fix');
    expect(line).toContain('white-space:nowrap');
    expect(line).toContain('left:50%');
    // The middle of the line sits at CAPTION_CENTER of the frame height.
    expect(line).toContain(`top:${Math.round(1920 * CAPTION_CENTER)}px`);
  });

  it('do not change as the words are spoken (nothing follows the speaker)', () => {
    for (const preset of LOOKS) {
      // Frame 8 is inside the first word, frame 20 inside the second; both are after the phrase has settled.
      const early = captionHtml(frameHtml(page(preset), 8));
      expect(captionText(early), preset).toBe('The fix');
      expect(captionHtml(frameHtml(page(preset), 20)), preset).toBe(early);
    }
  });

  it('fall back to the Bold look for a look that no longer exists', () => {
    const old = captionHtml(frameHtml({ ...full, captions: { preset: 'karaoke' as CaptionPreset, pages: props.captions!.pages } }, 8));
    expect(old).not.toBe('');
    expect(old).toBe(captionHtml(frameHtml(page('bold_pop'), 8)));
  });
});

describe('Editor illustrations', () => {
  // Must match the names in the backend (vireact-backend/src/service/editor/edl.js, VISUALS): Claude picks from that list.
  const BACKEND_NAMES = [
    'brain', 'heart', 'dna', 'strength', 'sleep', 'eye', 'water', 'plant',
    'money', 'growth', 'decline', 'target', 'trophy', 'rocket', 'house',
    'idea', 'book', 'search', 'question', 'warning', 'check', 'cross', 'lock', 'time',
    'phone', 'ai', 'code', 'chat', 'audience', 'video', 'globe',
    'fire', 'lightning', 'battery', 'star', 'shield', 'atom', 'gears', 'calendar', 'mountain', 'music',
  ];
  const visual = (name: string, text = ''): Graphic => ({ type: 'visual', visual: name, startFrame: 0, durationFrames: 90, text, subtext: '', items: [], focusX: 0.5, focusY: 0.5 });

  it('has a drawing for every name the planner can pick', () => {
    expect([...VISUAL_NAMES].sort()).toEqual([...BACKEND_NAMES].sort());
  });

  it('every illustration draws something at the start, middle and end', () => {
    for (const name of VISUAL_NAMES) {
      for (const frame of [0, 3, 45, 89]) {
        const html = renderToStaticMarkup(<VisualStage g={visual(name)} frame={frame} fps={30} accent="#FFD43B" />);
        expect(html, `${name} at frame ${frame}`).toContain('<svg');
        expect(html, `${name} at frame ${frame}`).not.toMatch(/NaN|undefined|Infinity/);
      }
    }
  });

  it('shows the label when there is one, and nothing for an unknown name', () => {
    expect(renderToStaticMarkup(<VisualStage g={visual('brain', 'Your brain')} frame={40} fps={30} accent="#FFD43B" />)).toContain('Your brain');
    expect(renderToStaticMarkup(<VisualStage g={visual('unicorn', 'Your brain')} frame={40} fps={30} accent="#FFD43B" />)).toBe('');
  });

  it('plays inside the edit', () => {
    const html = frameHtml({ ...full, graphics: [visual('brain', 'Your brain')] }, 40);
    expect(html).toContain('Your brain');
    expect(html).toContain('data-visual="brain"');
  });
});

describe('Editor graphics placement', () => {
  const band = (top: number, box = 90) => top + box <= 1920 * CAPTION_BAND[0] || top >= 1920 * CAPTION_BAND[1];

  it('a callout label never covers the captions', () => {
    for (let focusY = 0.1; focusY <= 0.9; focusY += 0.02) {
      const { top } = calloutLabel(focusY * 1920, 1920);
      expect(band(top), `focusY ${focusY.toFixed(2)}`).toBe(true);
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top + 90).toBeLessThanOrEqual(1920);
    }
  });

  it('a slam moves under the captions when the top of the frame is taken', () => {
    const slam: Graphic = { type: 'slam', startFrame: 0, durationFrames: 90, text: 'LYING', subtext: '', items: [], focusX: 0.5, focusY: 0.5 };
    const low = `padding-top:${Math.round(1920 * BELOW_CAPTIONS)}px`;
    expect(frameHtml({ ...full, graphics: [slam] }, 40)).not.toContain(low);
    expect(frameHtml({ ...full, graphics: [{ ...slam, low: true }] }, 40)).toContain(low);
  });

  it('the lower third and the call to action sit under the captions', () => {
    expect(BELOW_CAPTIONS).toBeGreaterThan(CAPTION_BAND[1]);
    const lower: Graphic = { type: 'lower_third', startFrame: 0, durationFrames: 90, text: 'Alex Rivera', subtext: '', items: [], focusX: 0.5, focusY: 0.5 };
    for (const g of [lower, { ...lower, type: 'cta' as const, text: 'Follow for part 2' }]) {
      const html = frameHtml({ ...full, graphics: [g] }, 40);
      expect(html, g.type).toContain(`padding-top:${Math.round(1920 * BELOW_CAPTIONS)}px`);
    }
  });
});

describe('Editor sounds', () => {
  const sfxDir = path.resolve(__dirname, '../../../../public/sfx');

  it('ships a file and a length for every sound', () => {
    expect(SFX_TYPES.length).toBe(46);
    expect(new Set(SFX_TYPES).size).toBe(SFX_TYPES.length);
    for (const type of SFX_TYPES) {
      const file = path.join(sfxDir, `${type}.mp3`);
      expect(fs.existsSync(file), `${type}.mp3`).toBe(true);
      expect(fs.statSync(file).size, `${type}.mp3`).toBeGreaterThan(1000);
      expect(SFX_SECONDS[type], type).toBeGreaterThan(0);
    }
  });

  it('ships no sound file the editor does not know', () => {
    const files = fs.readdirSync(sfxDir).filter((f) => f.endsWith('.mp3')).map((f) => f.replace('.mp3', '')).sort();
    expect(files).toEqual([...SFX_TYPES].sort());
  });
});

// Keep React in scope for JSX under the classic runtime used by some test setups.
void React;
