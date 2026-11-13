import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { EditorUsage } from '@/api/editor';
import type { AnalyticsOverview } from '@/api/analytics';
import { nextWorkflowStep, workflowProgress, workflowSpotlight, workflowSteps, type WorkflowData } from './workflow-steps';
import { WorkflowMap } from './WorkflowMap';

const editor = (over: Partial<EditorUsage> = {}): EditorUsage => ({
  plan: 'free',
  limit: 1,
  used: 0,
  remaining: 1,
  resetsOn: '2026-12-01T00:00:00.000Z',
  canStart: true,
  locked: false,
  available: true,
  renderAvailable: true,
  maxUploadBytes: 1,
  maxDurationSec: 1,
  ...over,
});
const usedEdit = editor({ used: 1, remaining: 0, canStart: false, locked: true });

const overview = (waiting: number) =>
  ({ totals: { videos: 3, withResults: 0 }, needsResults: Array.from({ length: waiting }, (_, i) => ({ videoId: `v${i}`, title: `Video ${i}` })) }) as unknown as AnalyticsOverview;

const returning: WorkflowData = { analyzed: 3, latestId: 'abc' };
const fresh: WorkflowData = { analyzed: 0, latestId: null, editor: editor() };

const render = (data: WorkflowData) =>
  renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(WorkflowMap, { headingId: 'h', data })));

describe('next workflow step', () => {
  it('starts new creators on Analyze with nothing lit', () => {
    expect(nextWorkflowStep(fresh)).toBe('analyze');
    expect([...workflowProgress(fresh).done]).toEqual([]);
  });

  it('points to the unused AI edit and lights the steps before it', () => {
    const data = { ...returning, editor: editor(), overview: overview(2) };
    expect(nextWorkflowStep(data)).toBe('edit');
    expect([...workflowProgress(data).done]).toEqual(['analyze', 'fix']);
  });

  it('points to logging views once the edit is used', () => {
    expect(nextWorkflowStep({ ...returning, editor: usedEdit, overview: overview(2) })).toBe('grow');
  });

  it('loops back to Analyze with the whole trail lit when everything is caught up', () => {
    const data = { ...returning, editor: usedEdit, overview: overview(0) };
    expect(nextWorkflowStep(data)).toBe('analyze');
    expect(workflowProgress(data).done.size).toBe(4);
  });
});

describe('spotlight', () => {
  it('sends new creators to their first analysis', () => {
    expect(workflowSpotlight(fresh)).toMatchObject({ eyebrow: 'Start here', title: 'Analyze your first video', cta: { to: '/new' } });
  });

  it('offers the free edit, then paid allowances', () => {
    expect(workflowSpotlight({ ...returning, editor: editor() }).title).toBe('Your free AI edit is ready');
    expect(workflowSpotlight({ ...returning, editor: editor({ plan: 'pro', limit: 20, remaining: 20 }) }).title).toBe('20 AI edits ready to use');
  });

  it('links straight to logging the first waiting video', () => {
    const s = workflowSpotlight({ ...returning, editor: usedEdit, overview: overview(2) });
    expect(s.title).toBe('2 videos waiting for views');
    expect(s.cta.to).toBe('/analytics?tab=videos&log=v0');
  });

  it('links Fix to the latest report when there is one', () => {
    expect(workflowSteps(returning)[1].to).toBe('/videos/abc');
    expect(workflowSteps(fresh)[1].to).toBe('/videos');
  });
});

describe('WorkflowMap', () => {
  it('renders the same four-step pipeline for new and returning creators', () => {
    for (const data of [fresh, { ...returning, editor: editor(), overview: overview(1) }]) {
      const html = render(data);
      expect(html.match(/<li/g)).toHaveLength(4);
      expect(html.match(/aria-current="step"/g)).toHaveLength(1);
      for (const name of ['Analyze', 'Fix', 'Edit', 'Grow']) expect(html).toContain(name);
    }
  });

  it('marks the next step and shows its single call to action', () => {
    const html = render({ ...returning, editor: editor(), overview: overview(1) });
    expect(html.match(/<a[^>]*aria-current="step"[^>]*>/)?.[0]).toContain('href="/editor"');
    expect(html).toContain('Open the editor');
  });
});
