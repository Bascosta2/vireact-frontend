import type { ComponentType } from 'react';
import { Zap, MessageSquare, Activity, Volume2, Eye, BarChart2 } from 'lucide-react';
import { FEATURES_IDS } from '@/constants';

export type AnalysisFeatureUi = {
  id: string;
  name: string;
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  description: string;
  /** Gated to Pro+ in UI and (where applicable) pipeline; extend for future Pro-only analyzers. */
  proOnly: boolean;
};

export const ANALYSIS_FEATURES_UI: AnalysisFeatureUi[] = [
  { id: FEATURES_IDS.HOOK, name: 'Hook', Icon: Zap, description: 'Analyze your opening hook strength', proOnly: false },
  { id: FEATURES_IDS.CAPTION, name: 'Caption', Icon: MessageSquare, description: 'Caption readability and impact', proOnly: false },
  { id: FEATURES_IDS.PACING_RHYTHM, name: 'Pacing & Rhythm', Icon: Activity, description: 'Video pacing and rhythm', proOnly: false },
  { id: FEATURES_IDS.AUDIO, name: 'Audio', Icon: Volume2, description: 'Audio quality and engagement', proOnly: false },
  { id: FEATURES_IDS.VIEWS, name: 'Views', Icon: Eye, description: 'View prediction analytics', proOnly: false },
  {
    id: FEATURES_IDS.ADVANCED_ANALYTICS,
    name: 'Advanced Analytics',
    Icon: BarChart2,
    description: 'Deep performance insights',
    proOnly: true,
  },
];
