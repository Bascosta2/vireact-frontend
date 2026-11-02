// Static demo data for the Landing V3 "Fix" step.
// This is UI-only and never hits the API.

import type { FeedbackFixType } from '@/types/video-feedback';

export interface DemoFeedbackFix {
  type: FeedbackFixType | null;
  label: string;
  before: string | null;
  after: string;
  timestampStart: number;
  timestampEnd: number;
}

export const demoFeedback: DemoFeedbackFix[] = [
  {
    type: 'replace_line',
    label: 'New hook',
    before: '“So I made this mistake with my channel…”',
    after: '“This one hook turned my dead channel into a full-time income.”',
    timestampStart: 1,
    timestampEnd: 4,
  },
  {
    type: 'trim',
    label: 'Trim',
    before: '3-second pause at the camera',
    after: 'Cut it to 1 second so the payoff lands sooner.',
    timestampStart: 7,
    timestampEnd: 10,
  },
];
