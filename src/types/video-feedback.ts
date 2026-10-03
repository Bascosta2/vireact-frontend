/**
 * Frame-level feedback types.
 *
 * CHANGED: 2026-09 — feedback is no longer prose. Each item points at an exact
 * range and carries a literal drop-in `fix`. Timestamps are numeric seconds;
 * `*Label` fields are server-formatted timecodes for display.
 */

export type FeedbackCategory = 'hook' | 'pacing' | 'audio' | 'caption' | 'visual' | 'script';

/** Stored 1-5. `FeedbackSeverityLabel` is the mapped legacy contract. */
export type FeedbackSeverityLevel = 1 | 2 | 3 | 4 | 5;
export type FeedbackSeverityLabel = 'critical' | 'important' | 'minor';

export type FeedbackFixType =
  | 'replace_line'
  | 'cut'
  | 'trim'
  | 'add_text_overlay'
  | 'reshoot_note'
  | 'add_sound';

/** Which analyzer authored the item; `advanced_analytics` items are plan-gated server-side. */
export type FeedbackSourceFeature =
  | 'hook'
  | 'caption'
  | 'pacing'
  | 'audio'
  | 'advanced_analytics'
  | 'views_predictor'
  | 'chat';

export interface FeedbackFix {
  type: FeedbackFixType | null;
  /** Verbatim existing content; null when the fix adds content where none existed. */
  before: string | null;
  /** Literal drop-in replacement, usable as-is. */
  after: string;
}

export interface FrameFeedback {
  id: string;
  /** Range start, in seconds. */
  tStart: number;
  /** Range end, in seconds. */
  tEnd: number;
  tStartLabel?: string;
  tEndLabel?: string;
  category: FeedbackCategory | string;
  severity: FeedbackSeverityLevel | number;
  severityLabel: FeedbackSeverityLabel | string;
  sourceFeature: FeedbackSourceFeature | string | null;
  /** What literally happens in the range. */
  observed: string;
  /** Why it costs retention. */
  issue: string;
  fix: FeedbackFix;
  expectedImpact: string | null;
  sourceConfidence: number | null;
  /**
   * True for pre-2026-09 prose entries adapted for display. These have no
   * verified literal fix, so the UI labels them as directional.
   */
  isLegacy?: boolean;
}

export interface ScriptRewrite {
  lineId: string;
  timestamp: number;
  timestampLabel?: string;
  /** Quoted verbatim from the transcript. */
  originalTranscript: string;
  /** The exact line to say instead. */
  rewrittenLine: string;
  rationale: string | null;
  deliveryNote: string | null;
  sourceFeature: FeedbackSourceFeature | string | null;
}

export interface VideoFeedbackResponse {
  videoId: string;
  feedback: FrameFeedback[];
  scriptRewrites: ScriptRewrite[];
  summary?: string;
  totalIssues: number;
  criticalIssues: number;
  importantIssues: number;
  minorIssues: number;
  /** True when the response was adapted from pre-2026-09 prose feedback. */
  isLegacyFeedback?: boolean;
}

/** @deprecated Use `FrameFeedback`. Retained so older imports keep compiling. */
export type VideoFeedback = FrameFeedback;
