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
import { clampFocus, focusTransform, screenBox, screenFocusAt } from '@/remotion/timeline-utils';
import { SFX_TYPES, type CaptionPreset, type EditProps, type Graphic } from '@/remotion/types';
import { VisualStage } from '@/remotion/visuals/VisualStage';
import { VISUAL_NAMES } from '@/remotion/visuals/registry';
import { FootageDisclaimer } from './Disclaimer';
import { Toggle } from './ReviewPanel';
import { StoryboardPanel } from './Storyboard';
import type { Storyboard } from '@/api/editor';

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

describe('Storyboard review', () => {
  const storyboard: Storyboard = {
    approved: false,
    beats: [
      { id: 's1', role: 'hook', start: 0, end: 4, reason: 'Opens on the payoff', dropped: false, swapped: false, swapNote: null, graphics: [{ type: 'slam', text: 'STOP', start: 1 }], sounds: [{ type: 'hit', at: 1 }], effects: [], zooms: 1, framing: 'split' },
      { id: 's2', role: 'payoff', start: 9, end: 14, reason: 'The answer', dropped: false, swapped: true, swapNote: null, graphics: [], sounds: [], effects: [], zooms: 0, framing: 'fill' },
    ],
  };
  const noop = () => {};
  it('shows each beat with its graphics, sounds and framing, and locks approval until chosen', () => {
    const html = renderToStaticMarkup(<StoryboardPanel storyboard={storyboard} dropped={[]} approved={false} busyBeat={null} onDrop={noop} onSwap={noop} onApprove={noop} />);
    expect(html).toContain('Hook');
    expect(html).toContain('slam: STOP');
    expect(html).toContain('Split screen');
    expect(html).toContain('Swapped');
    expect(html).toContain('Approve storyboard');
    expect(html).toContain('Approve to unlock export.');
  });
  it('marks a dropped beat, can bring it back, and shows the approved state', () => {
    const html = renderToStaticMarkup(<StoryboardPanel storyboard={storyboard} dropped={['s2']} approved busyBeat={null} onDrop={noop} onSwap={noop} onApprove={noop} />);
    expect(html).toContain('Dropped');
    expect(html).toContain('Bring back beat 2, Payoff, 0:09 to 0:14');
    expect(html).toContain('Storyboard approved');
    expect(html).toContain('disabled');
  });
});

describe('Screen recording layer', () => {
  const shot = { startFrame: 10, durationFrames: 60, recStartSec: 2, aspect: 16 / 9, from: { x: 0.5, y: 0.5, zoom: 1 }, to: { x: 0.8, y: 0.3, zoom: 2 }, layout: 'safe' as const };
  const withShot = (layout: 'safe' | 'bottom') => ({ ...full, screens: [{ ...shot, layout }], screenUrl: 'https://example.invalid/screen.mp4' });

  it('keeps the focus point inside the picture at every zoom', () => {
    expect(clampFocus({ x: 0, y: 1, zoom: 2 })).toEqual({ x: 0.25, y: 0.75, zoom: 2 });
    expect(clampFocus({ x: 0.5, y: 0.5, zoom: 9 }).zoom).toBe(2.5);
    expect(clampFocus({ x: Number.NaN, y: 0.5, zoom: 0 })).toEqual({ x: 0.5, y: 0.5, zoom: 1 });
  });

  it('eases the camera: still at both ends, moving in between, never outside the picture', () => {
    const at = (f: number) => screenFocusAt(f, 60, shot.from, shot.to);
    expect(at(0)).toEqual({ x: 0.5, y: 0.5, zoom: 1 });
    expect(at(59)).toEqual(clampFocus(shot.to));
    const early = at(5).zoom - at(0).zoom;
    const middle = at(31).zoom - at(26).zoom;
    expect(middle).toBeGreaterThan(early);
    for (let f = 0; f < 60; f += 1) {
      const c = at(f);
      expect(c.x).toBeGreaterThanOrEqual(0.5 / c.zoom - 1e-9);
      expect(c.x).toBeLessThanOrEqual(1 - 0.5 / c.zoom + 1e-9);
    }
    expect(focusTransform({ x: 0.5, y: 0.5, zoom: 1 })).toBe('translate(0.000%, 0.000%) scale(1.0000)');
  });

  it('fits the recording in the 4:5 safe area, or the lower half with split screen', () => {
    const safe = screenBox('safe', 16 / 9);
    expect(safe.top).toBeGreaterThanOrEqual(285);
    expect(safe.top + safe.height).toBeLessThanOrEqual(285 + 1350);
    expect(safe.left + safe.width).toBeLessThanOrEqual(1080);
    const bottom = screenBox('bottom', 16 / 9);
    expect(bottom.top).toBeGreaterThanOrEqual(960);
    expect(bottom.top + bottom.height).toBeLessThanOrEqual(1920);
    // A phone recording is height-limited.
    const phone = screenBox('safe', 9 / 19.5);
    expect(phone.height).toBeLessThanOrEqual(1350);
    expect(phone.width / phone.height).toBeCloseTo(9 / 19.5, 3);
  });

  it('renders during its shot only, and not at all without shots or a URL', () => {
    expect(frameHtml(withShot('safe'), 30)).toContain('data-screen-recording="safe"');
    expect(frameHtml(withShot('bottom'), 30)).toContain('data-screen-recording="bottom"');
    expect(frameHtml(withShot('safe'), 100)).not.toContain('data-screen-recording');
    expect(frameHtml({ ...withShot('safe'), screenUrl: undefined }, 30)).not.toContain('data-screen-recording');
    expect(frameHtml(full, 30)).not.toContain('data-screen-recording');
  });

  it('shows the recording on the storyboard beat', () => {
    const sb: Storyboard = { approved: false, beats: [{ id: 's1', role: 'body', start: 0, end: 6, reason: '', dropped: false, swapped: false, swapNote: null, graphics: [], sounds: [], effects: [], zooms: 0, framing: 'fill', screens: [{ start: 1, end: 4, zoom: 2 }] }] };
    const html = renderToStaticMarkup(<StoryboardPanel storyboard={sb} dropped={[]} approved={false} busyBeat={null} onDrop={() => {}} onSwap={() => {}} onApprove={() => {}} />);
    expect(html).toContain('Screen recording');
    expect(html).toContain('0:01 to 0:04, zooms in 2.0x');
  });
});
