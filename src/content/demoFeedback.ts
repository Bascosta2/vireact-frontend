// Static demo data for the Landing V3 "Fix" step.
// This is UI-only and never hits the API.

import type { FeedbackFixType } from '@/types/video-feedback';

export interface DemoFeedbackFix {
  type: FeedbackFixType | null;
  before: string | null;
  after: string;
  timestampStart: number;
  timestampEnd: number;
}

export const demoFeedback: DemoFeedbackFix[] = [
  {
    type: 'replace_line',
    before: '“So I made this mistake with my channel…”',
    after: '“Here’s the exact hook that turned my dead channel into a full-time income.”',
    timestampStart: 1,
    timestampEnd: 4,
  },
  {
    type: 'add_text_overlay',
    before: null,
    after: 'On-screen text: “Why viewers swipe in 3 seconds”',
    timestampStart: 4,
    timestampEnd: 7,
  },
  {
    type: 'trim',
    before: 'Three-second pause looking at the camera.',
    after: 'Cut this pause from 3s → 1s so the payoff lands sooner.',
    timestampStart: 7,
    timestampEnd: 10,
  },
];

