import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Thumbnail } from '@remotion/player';
import { EditComposition } from '../EditComposition';
import { splitGraphicLayers, splitLayout } from '../timeline-utils';
import { CAPTION_BAND, CAPTION_BAND_SPLIT, CAPTION_CENTER_SPLIT, calloutLabel } from '../graphics-utils';
import type { EditProps, Graphic } from '../types';
import { BRAND_FONT_NAMES, brandVars, textOn } from '../brand';
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

  it.each(STYLE_IDS)('%s has a library showcase', (id) => {
    for (const at of [3, 53, 104]) {
      const html = frame(StyleShowcase as never, { style: id, still: '/demo/cedlom-still.jpg' }, at, 125);
      expect(html.length).toBeGreaterThan(500);
    }
  });
});

describe('brand sheet', () => {
  it('draws a styled and a standard edit with brand colors and fonts', () => {
    const brand = { accent: '#00AAFF', secondary: '#FF00AA', displayFont: 'Anton', bodyFont: 'Inter' };
    const styled = { ...props('comic-art'), brand };
    const html = frame(EditComposition as never, styled, 20, styled.durationInFrames);
    expect(html).toContain('data-hook="comic-art"');
    const standard: EditProps = { ...props('comic-art'), skill: undefined };
    const plain = frame(EditComposition as never, { ...standard, brand }, 20, standard.durationInFrames);
    expect(plain).toContain('--brand-secondary:#FF00AA');
    expect(plain).toContain('#00AAFF');
  });

  it('applies the brand sheet to a painted style too', () => {
    const brand = { accent: '#00AAFF', secondary: '#FF00AA', displayFont: 'Anton', bodyFont: 'Inter' };
    const painted = { ...props('watercolour'), brand };
    expect(frame(EditComposition as never, painted, 20, painted.durationInFrames)).toContain('data-hook="watercolour"');
  });

  it('ignores an unknown font or a bad color', () => {
    const p = { ...props('pixel-art'), brand: { accent: 'red', displayFont: 'Comic Sans' } };
    expect(frame(EditComposition as never, p, 20, p.durationInFrames)).toContain('data-hook="pixel-art"');
  });

  it('brandVars is empty without a brand and only knows listed fonts', () => {
    expect(brandVars(undefined)).toEqual({});
    expect(brandVars({ displayFont: 'Nope' })).toEqual({});
    expect(BRAND_FONT_NAMES).toContain('Anton');
  });
});

describe('text on an accent', () => {
  it('picks near-black on light accents and white on dark ones', () => {
    expect(textOn('#FFD43B')).toBe('#0a0a0f');
    expect(textOn('#00AAFF')).toBe('#0a0a0f');
    expect(textOn('#0B1F4B')).toBe('#ffffff');
    expect(textOn('#6B21A8')).toBe('#ffffff');
    expect(textOn('nonsense')).toBe('#0a0a0f');
  });
});

describe('split screen', () => {
  it('stacks the speaker over a zoomed detail pane inside the frame', () => {
    const l = splitLayout({ mode: 'split', focusX: 0.4, split: { detailX: 0.7, detailY: 0.3, zoom: 1.8 } });
    expect(l.top).toMatchObject({ top: 0, height: '50%' });
    expect(l.bottom).toMatchObject({ bottom: 0, height: '50%' });
    expect(l.bottomVideo).toMatchObject({ transform: 'scale(1.8)', transformOrigin: '70% 30%' });
    expect(l.topVideo.objectPosition).toBe('40% 30%');
  });

  it('draws an edit in split mode, styled or standard', () => {
    const framing = { mode: 'split' as const, focusX: 0.5, split: { detailX: 0.5, detailY: 0.6, zoom: 1.8 } };
    for (const p of [{ ...props('comic-art'), framing }, { ...props('comic-art'), skill: undefined, framing }]) {
      expect(frame(EditComposition as never, p, 20, p.durationInFrames).length).toBeGreaterThan(500);
    }
  });

  it('keeps captions and callout labels off the seam, inside the 4:5 safe area', () => {
    expect(CAPTION_CENTER_SPLIT).toBeGreaterThan(0.148);
    expect(CAPTION_BAND_SPLIT[1]).toBeLessThan(0.5);
    const label = calloutLabel(960, 1920, 90, CAPTION_BAND_SPLIT);
    expect(label.top + 90 <= 1920 * CAPTION_BAND_SPLIT[0] || label.top >= 1920 * CAPTION_BAND_SPLIT[1]).toBe(true);
    expect(calloutLabel(960, 1920, 90, CAPTION_BAND)).toBeDefined();
    const split = { ...props('comic-art'), framing: { mode: 'split' as const, focusX: 0.5 } };
    expect(frame(EditComposition as never, split, 20, split.durationInFrames)).toContain('top:845px');
  });
});

describe('background matte layers', () => {
  const g = (type: Graphic['type'], layer?: 'behind'): Graphic => ({ type, startFrame: 0, durationFrames: 30, text: 'Big', subtext: '', items: [], focusX: 0.5, focusY: 0.5, ...(layer ? { layer } : {}) });
  const matte = { url: 'https://example.com/matte.webm', mode: 'alpha-webm' as const };

  it('moves only behind-marked graphics, and only when there is a matte', () => {
    const list = [g('headline', 'behind'), g('pill')];
    expect(splitGraphicLayers(list, matte).behind.map((x) => x.type)).toEqual(['headline']);
    expect(splitGraphicLayers(list, matte).front.map((x) => x.type)).toEqual(['pill']);
    expect(splitGraphicLayers(list, undefined)).toEqual({ behind: [], front: list });
  });

  it('draws the matte video only with a matte url and behind graphics', () => {
    const base = {
      width: 1080, height: 1920, fps: 30, durationInFrames: 60, timeline: [{ id: 'a', segId: 's', srcStart: 0, srcEnd: 2, outStartFrame: 0, durationFrames: 60 }],
      captions: null, hook: null, zooms: [], graphics: [g('headline', 'behind')], sfx: [], music: null, framing: { mode: 'fill' as const, focusX: 0.5 },
      videoUrl: 'https://example.com/v.mp4', musicUrl: null, sfxUrls: {},
    } as EditProps;
    const html = (p: EditProps) => renderToStaticMarkup(<Thumbnail component={EditComposition} compositionWidth={1080} compositionHeight={1920} durationInFrames={60} fps={30} frameToDisplay={5} inputProps={p as unknown as Record<string, unknown>} />);
    expect(html({ ...base, matte })).toContain('matte.webm');
    expect(html(base)).not.toContain('matte.webm');
    expect(html({ ...base, graphics: [g('headline')], matte })).not.toContain('matte.webm');
  });
});
