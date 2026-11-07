import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { ScoreRing } from './ScoreRing';
import { AdvancedAnalyticsCallout } from './AdvancedAnalyticsCallout';
import { Select } from './Select';
import { presetFeatureIds } from '@/lib/analysis-presets';
import { statusKind, isPendingVideo } from '@/lib/video-status';
import { featureLabel, ANALYSIS_FEATURES_UI } from '@/data/analysis-features';

describe('ScoreRing', () => {
  it('announces the score in words', () => {
    expect(renderToStaticMarkup(<ScoreRing score={57.4} />)).toContain('aria-label="Virality score 57 out of 100"');
  });
});

describe('presets', () => {
  it('full analysis skips Pro checks for free plans', () => {
    expect(presetFeatureIds('full', false)).not.toContain('advanced_analytics');
    expect(presetFeatureIds('full', true)).toContain('advanced_analytics');
  });

  it('hook check sends only the hook feature', () => {
    expect(presetFeatureIds('hook', true)).toEqual(['hook']);
  });
});

describe('features', () => {
  it('uses the six product labels', () => {
    expect(ANALYSIS_FEATURES_UI.map((f) => f.label)).toEqual([
      'Hook',
      'Captions',
      'Pacing',
      'Audio',
      'Views prediction',
      'Advanced analytics',
    ]);
    expect(featureLabel('views_predictor')).toBe('Views prediction');
  });
});

describe('AdvancedAnalyticsCallout', () => {
  it('shows the description and a lock for users who have not paid', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AdvancedAnalyticsCallout unlocked={false} />
      </MemoryRouter>
    );
    expect(html).toContain('Advanced analytics');
    expect(html).toContain('Emotional triggers, retention drivers and your weakest moment');
    expect(html).toContain('Unlock on a paid plan');
    expect(html).toContain('Pro');
  });

  it('marks the check as included for paying users', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AdvancedAnalyticsCallout unlocked={true} />
      </MemoryRouter>
    );
    expect(html).toContain('Included');
    expect(html).not.toContain('Unlock on a paid plan');
  });
});

describe('Select', () => {
  it('renders the selected label and stays closed until opened', () => {
    const html = renderToStaticMarkup(
      <Select
        id="library-sort"
        label="Sort"
        value="date"
        options={[
          { value: 'date', label: 'Newest' },
          { value: 'score', label: 'Top score' },
        ]}
        onChange={() => undefined}
      />
    );
    expect(html).toContain('Newest');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('Top score');
  });
});

describe('statusKind', () => {
  it('maps backend statuses', () => {
    expect(statusKind('completed')).toBe('complete');
    expect(statusKind('processing')).toBe('analyzing');
    expect(statusKind('queued')).toBe('queued');
    expect(statusKind('failed')).toBe('failed');
    expect(statusKind('pending', 'uploading')).toBe('uploading');
  });
});

describe('isPendingVideo (analyzing badge)', () => {
  const now = Date.parse('2026-11-06T12:00:00Z');
  const ago = (min: number) => new Date(now - min * 60_000).toISOString();
  it('counts queued and processing videos', () => {
    expect(isPendingVideo({ analysisStatus: 'queued', uploadStatus: 'completed' }, now)).toBe(true);
    expect(isPendingVideo({ analysisStatus: 'processing', uploadStatus: 'completed' }, now)).toBe(true);
  });
  it('never counts failed uploads, even when analysis status is still pending', () => {
    expect(isPendingVideo({ analysisStatus: 'pending', uploadStatus: 'failed', updatedAt: ago(1) }, now)).toBe(false);
  });
  it('counts a fresh pending upload but not one abandoned hours ago', () => {
    expect(isPendingVideo({ analysisStatus: 'pending', uploadStatus: 'uploading', updatedAt: ago(5) }, now)).toBe(true);
    expect(isPendingVideo({ analysisStatus: 'pending', uploadStatus: 'pending', updatedAt: ago(300) }, now)).toBe(false);
  });
  it('does not count finished videos', () => {
    expect(isPendingVideo({ analysisStatus: 'completed', uploadStatus: 'completed' }, now)).toBe(false);
    expect(isPendingVideo({ analysisStatus: 'failed', uploadStatus: 'completed' }, now)).toBe(false);
  });
});
