import type { ComponentType } from 'react';
import { Zap, MessageSquare, Activity, Volume2, Eye, BarChart2 } from 'lucide-react';
import { FEATURES_IDS } from '@/constants';

export type AnalysisFeatureUi = {
  id: string;
  name: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  description: string;
};

export const ANALYSIS_FEATURES_UI: AnalysisFeatureUi[] = [
  { id: FEATURES_IDS.HOOK, name: 'Hook', Icon: Zap, description: 'Analyze your opening hook strength' },
  { id: FEATURES_IDS.CAPTION, name: 'Caption', Icon: MessageSquare, description: 'Caption readability and impact' },
  { id: FEATURES_IDS.PACING_RHYTHM, name: 'Pacing & Rhythm', Icon: Activity, description: 'Video pacing and rhythm' },
  { id: FEATURES_IDS.AUDIO, name: 'Audio', Icon: Volume2, description: 'Audio quality and engagement' },
  { id: FEATURES_IDS.VIEWS, name: 'Views', Icon: Eye, description: 'View prediction analytics' },
  { id: FEATURES_IDS.ADVANCED_ANALYTICS, name: 'Advanced Analytics', Icon: BarChart2, description: 'Deep performance insights' },
];
