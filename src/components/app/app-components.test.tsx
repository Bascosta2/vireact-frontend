import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScoreRing } from './ScoreRing';
import { presetFeatureIds } from '@/lib/analysis-presets';
import { statusKind } from '@/lib/video-status';
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

describe('statusKind', () => {
  it('maps backend statuses', () => {
    expect(statusKind('completed')).toBe('complete');
    expect(statusKind('processing')).toBe('analyzing');
    expect(statusKind('queued')).toBe('queued');
    expect(statusKind('failed')).toBe('failed');
    expect(statusKind('pending', 'uploading')).toBe('uploading');
  });
});
