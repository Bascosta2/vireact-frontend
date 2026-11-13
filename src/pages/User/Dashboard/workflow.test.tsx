import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { EditorUsage } from '@/api/editor';
import type { AnalyticsOverview } from '@/api/analytics';
import { nextWorkflowStep, workflowSteps, type WorkflowData } from './workflow-steps';
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

const overview = (waiting: number, withResults = 0) =>
  ({ totals: { videos: 3, withResults }, needsResults: Array.from({ length: waiting }, (_, i) => ({ videoId: `v${i}`, title: `Video ${i}` })) }) as unknown as AnalyticsOverview;

const base: WorkflowData = { analyzed: 3, latest: { id: 'abc', title: 'ScreenRecording 08-17.mp4', score: 41 } };

describe('next workflow step', () => {
  it('starts new creators on Analyze', () => {
    expect(nextWorkflowStep({ analyzed: 0, latest: null, editor: editor() })).toBe('analyze');
  });

  it('points to the free AI edit when it is unused', () => {
    expect(nextWorkflowStep({ ...base, editor: editor(), overview: overview(2) })).toBe('edit');
  });

  it('points to logging views once the edit is used', () => {
    expect(nextWorkflowStep({ ...base, editor: editor({ used: 1, remaining: 0, canStart: false, locked: true }), overview: overview(2) })).toBe('grow');
  });

  it('falls back to a new analysis when everything is caught up', () => {
    expect(nextWorkflowStep({ ...base, editor: null, overview: overview(0, 3) })).toBe('analyze');
  });
});

describe('workflow status lines', () => {
  it('reflects the creator account', () => {
    const steps = workflowSteps({ ...base, editor: editor(), overview: overview(2) });
    expect(steps.map((s) => s.id)).toEqual(['analyze', 'fix', 'edit', 'grow']);
    expect(steps[0].status).toBe('3 videos scored so far');
    expect(steps[1].status).toBe('Latest: ScreenRecording 08-17 · 41');
    expect(steps[1].cta.to).toBe('/videos/abc');
    expect(steps[2].status).toBe('Free AI edit ready to use');
    expect(steps[3].status).toBe('2 videos waiting for views');
  });

  it('shows the next free edit date in UTC and paid allowances', () => {
    expect(workflowSteps({ ...base, editor: editor({ canStart: false, used: 1, remaining: 0 }) })[2].status).toBe(
      `Next free edit on ${new Date('2026-12-01T00:00:00.000Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })}`
    );
    expect(workflowSteps({ ...base, editor: editor({ plan: 'pro', limit: 20, used: 3, remaining: 17 }) })[2].status).toBe('17 of 20 AI edits left');
  });

  it('never shows numbers it does not have', () => {
    const steps = workflowSteps({ analyzed: 0, latest: null });
    expect(steps[0].status).toBe('Start with any short you have');
    expect(steps[1].cta.to).toBe('/videos');
    expect(steps[2].status).toBe('Checking your edits…');
    expect(steps[3].status).toBe('Log views after you post');
  });
});

describe('WorkflowMap', () => {
  it('renders four linked steps and marks exactly one as next', () => {
    const html = renderToStaticMarkup(
      React.createElement(MemoryRouter, null, React.createElement(WorkflowMap, { headingId: 'h', data: { ...base, editor: editor(), overview: overview(1) } }))
    );
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html.match(/Next step/g)).toHaveLength(1);
    for (const to of ['/new', '/videos/abc', '/editor', '/analytics']) expect(html).toContain(`href="${to}"`);
  });
});
