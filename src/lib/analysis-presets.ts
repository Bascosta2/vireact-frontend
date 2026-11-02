import { FEATURES_IDS } from '@/constants';
import { ANALYSIS_FEATURES_UI } from '@/data/analysis-features';

export type PresetId = 'full' | 'hook' | 'custom';

/** Feature keys each preset sends. Full analysis includes Pro checks only for Pro and Enterprise plans. */
export const presetFeatureIds = (preset: Exclude<PresetId, 'custom'>, canUsePro: boolean): string[] =>
  preset === 'hook'
    ? [FEATURES_IDS.HOOK]
    : ANALYSIS_FEATURES_UI.filter((f) => f.tier === 'free' || canUsePro).map((f) => f.id);
