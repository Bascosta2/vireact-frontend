import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Thumbnail } from '@remotion/player';
import { EditComposition } from '../EditComposition';
import type { EditProps, Graphic } from '../types';
import { STYLE_IDS } from './ids';
import { StyleShowcase } from './Showcase';

/**
 * Every animation style draws a whole edit without throwing, at the frames where its parts are on
 * screen (hook, transition, each graphic type, captions). The visual check is done with real renders;
 * this guards against a style crashing an edit.
 */

const graphic = (type: Graphic['type'], startFrame: number, extra: Partial<Graphic> = {}): Graphic => ({
  type, startFrame, durationFrames: 40, text: type === 'counter' ? '$1,200' : 'Sample text', subtext: 'sub', items: ['One', 'Two', 'Three'], focusX: 0.5, focusY: 0.4, ...extra,
});

const props = (id: (typeof STYLE_IDS)[number]): EditProps => ({
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 420,
  timeline: [
    { id: 'p1', segId: 's1', srcStart: 2, srcEnd: 4, outStartFrame: 0, durationFrames: 60, baseScale: 1 },
    { id: 'p2', segId: 's2', srcStart: 0, srcEnd: 2, outStartFrame: 60, durationFrames: 60, baseScale: 1 },
    { id: 'p3', segId: 's3', srcStart: 4, srcEnd: 14, outStartFrame: 120, durationFrames: 300, baseScale: 1.08 },
  ],
  captions: { preset: 'bold_pop', pages: [{ startFrame: 0, endFrame: 400, words: [{ text: 'every', startFrame: 0, endFrame: 10, emphasis: false, i: 0 }, { text: 'reel', startFrame: 10, endFrame: 20, emphasis: true, i: 1 }] }] },
  hook: { text: 'Edit reels / in ten minutes', startFrame: 0, durationFrames: 40 },
  zooms: [{ index: 0, startFrame: 130, durationFrames: 20, scale: 1.15, focusX: 0.5, focusY: 0.4 }],
  graphics: [
    graphic('counter', 40), graphic('headline', 80), graphic('slam', 125, { text: 'BOOM' }), graphic('pill', 170), graphic('list', 215),
    graphic('callout', 260), graphic('visual', 300, { visual: 'brain' }), graphic('lower_third', 340), graphic('cta', 380),
    graphic('chart', 400, { text: 'Revenue', items: ['2023: $1.2M', '2024: $2.6M', '2025: $4.4M'], durationFrames: 20 }),
  ],
  transitions: [{ type: 'punch', frame: 60 }],
  effects: [{ type: 'shake', frame: 125 }],
  look: { grade: 'none', accent: '#FFD43B', progressBar: true, motion: true },
  sfx: [],
  music: null,
  framing: { mode: 'fill', focusX: 0.5 },
  videoUrl: 'https://example.com/v.mp4',
  musicUrl: null,
  sfxUrls: {},
  skill: { id, version: 1, hookVariant: 'white', hookLines: ['Edit reels', 'in ten minutes'] },
});

const frame = (component: React.ComponentType<never>, inputProps: Record<string, unknown>, at: number, durationInFrames: number) =>
  renderToStaticMarkup(
    <Thumbnail component={component} inputProps={inputProps as never} compositionWidth={1080} compositionHeight={1920} fps={30} durationInFrames={durationInFrames} frameToDisplay={at} />,
  );

describe('animation styles', () => {
  it.each(STYLE_IDS)('%s draws an edit at every kind of moment', (id) => {
    const p = props(id);
    // Hook, the transition (before, at, after the cut), and each graphic type in turn.
    for (const at of [2, 20, 55, 60, 65, 50, 95, 130, 180, 225, 270, 310, 350, 390]) {
      const html = frame(EditComposition as never, p, at, p.durationInFrames);
      expect(html).toContain(`data-captions="${id}"`);
      if (at < 40) expect(html).toContain(`data-hook="${id}"`);
    }
    expect(frame(EditComposition as never, p, 310, p.durationInFrames)).toContain('data-visual="brain"');
    // The chart graphic, and the scene layout (with the creator's bubble for explainers).
    expect(frame(EditComposition as never, p, 412, p.durationInFrames)).toContain('$4.4M');
    const scene = { ...p, skill: { ...p.skill!, layout: 'scene' as const } };
    expect(frame(EditComposition as never, scene, 130, p.durationInFrames)).toContain(`data-captions="${id}"`);
  });

  it.each(['glow-sketch', 'microscope', 'watercolour', 'blueprint'] as const)('%s animates a storyboard with no footage', (id) => {
    const base = props(id);
    const story: EditProps = {
      ...base,
      videoUrl: '',
      transitions: [{ type: 'flash', frame: 140 }, { type: 'flash', frame: 280 }],
      storyboard: { scenes: [{ startFrame: 0, durationFrames: 140, backdrop: 'nature' }, { startFrame: 140, durationFrames: 140, backdrop: 'space' }, { startFrame: 280, durationFrames: 140, backdrop: 'scene' }] },
      skill: { ...base.skill!, layout: id === 'watercolour' || id === 'blueprint' ? 'scene' : 'footage' },
    };
    for (const at of [2, 60, 138, 142, 300, 390]) {
      const html = frame(EditComposition as never, story, at, story.durationInFrames);
      expect(html).toContain(`data-captions="${id}"`);
      // No video element: the scenes are drawn.
      expect(html).not.toContain('<video');
    }
    // The last frames, after the captions end, still draw the scene.
    expect(frame(EditComposition as never, story, 415, story.durationInFrames)).not.toContain('<video');
  });

  it.each(STYLE_IDS)('%s has a library showcase', (id) => {
    for (const at of [3, 53, 104]) {
      const html = frame(StyleShowcase as never, { style: id, still: '/demo/cedlom-still.jpg' }, at, 125);
      expect(html.length).toBeGreaterThan(500);
    }
  });
});
