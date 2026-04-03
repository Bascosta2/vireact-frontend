export type FeedbackCategory = 'pacing' | 'visual' | 'audio' | 'engagement' | 'hook' | 'cta';
export type FeedbackSeverity = 'critical' | 'important' | 'minor';

export interface VideoFeedback {
  timestamp: number; // in seconds
  endTimestamp?: number; // for range-based feedback
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  issue: string;
  suggestion: string;
  example?: string;
}

export interface VideoFeedbackResponse {
  videoId: string;
  feedback: VideoFeedback[];
  summary?: string;
  totalIssues: number;
  criticalIssues: number;
  importantIssues: number;
  minorIssues: number;
}
