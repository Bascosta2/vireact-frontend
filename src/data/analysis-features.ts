import type { ComponentType } from 'react';
import { Zap, MessageSquare, Activity, Volume2, Eye, BarChart2 } from 'lucide-react';
import { FEATURES_IDS } from '@/constants';

export type FeatureTier = 'free' | 'pro';

export type AnalysisFeatureUi = {
  /** Backend feature key sent in `selectedFeatures`. */
  id: string;
  label: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string; 'aria-hidden'?: boolean }>;
  description: string;
  tier: FeatureTier;
};

/** Single source for feature names, icons and tiers on every logged-in page. */
export const ANALYSIS_FEATURES_UI: AnalysisFeatureUi[] = [
  { id: FEATURES_IDS.HOOK, label: 'Hook', Icon: Zap, description: 'How strong your first seconds are', tier: 'free' },
  { id: FEATURES_IDS.CAPTION, label: 'Captions', Icon: MessageSquare, description: 'Whether captions are easy to read', tier: 'free' },
  { id: FEATURES_IDS.PACING_RHYTHM, label: 'Pacing', Icon: Activity, description: 'Cuts, pauses and dead time', tier: 'free' },
  { id: FEATURES_IDS.AUDIO, label: 'Audio', Icon: Volume2, description: 'Voice, music and sound levels', tier: 'free' },
  { id: FEATURES_IDS.VIEWS, label: 'Views prediction', Icon: Eye, description: 'An estimated view range', tier: 'free' },
  {
    id: FEATURES_IDS.ADVANCED_ANALYTICS,
    label: 'Advanced analytics',
    Icon: BarChart2,
    description: 'Emotional triggers, retention drivers and your weakest moment',
    tier: 'pro',
  },
];

const LEGACY_KEYS: Record<string, string> = { viewsPredictor: FEATURES_IDS.VIEWS, advanced: FEATURES_IDS.ADVANCED_ANALYTICS };

export const findFeature = (key: string): AnalysisFeatureUi | undefined =>
  ANALYSIS_FEATURES_UI.find((f) => f.id === (LEGACY_KEYS[key] ?? key));

export const featureLabel = (key: string): string => findFeature(key)?.label ?? key.replace(/_/g, ' ');

export const featuresForPlan = (canUsePro: boolean): AnalysisFeatureUi[] =>
  ANALYSIS_FEATURES_UI.filter((f) => f.tier === 'free' || canUsePro);
