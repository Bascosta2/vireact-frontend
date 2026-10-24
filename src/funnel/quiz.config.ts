/** Quiz questions (plan §6.1). Values must match backend src/constants/funnel-quiz.js. */
export type QuizKey = 'platform' | 'niche' | 'followers' | 'problem' | 'cadence' | 'persona';

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  key: QuizKey;
  prompt: string;
  options: QuizOption[];
}

export type QuizAnswers = Record<QuizKey, string>;

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: 'platform',
    prompt: 'Where do you post most?',
    options: [
      { value: 'tiktok', label: 'TikTok' },
      { value: 'reels', label: 'Instagram Reels' },
      { value: 'shorts', label: 'YouTube Shorts' },
      { value: 'all', label: 'All of them' },
    ],
  },
  {
    key: 'niche',
    prompt: "What's your niche?",
    options: [
      { value: 'education', label: 'Education' },
      { value: 'business_finance', label: 'Business & finance' },
      { value: 'entertainment_comedy', label: 'Entertainment & comedy' },
      { value: 'lifestyle_vlog', label: 'Lifestyle & vlog' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'fitness_health', label: 'Fitness & health' },
      { value: 'beauty_fashion', label: 'Beauty & fashion' },
      { value: 'food', label: 'Food' },
      { value: 'tech', label: 'Tech' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    key: 'followers',
    prompt: 'How many followers do you have?',
    options: [
      { value: 'lt_1k', label: 'Under 1K' },
      { value: '1k_10k', label: '1K – 10K' },
      { value: '10k_100k', label: '10K – 100K' },
      { value: '100k_1m', label: '100K – 1M' },
      { value: 'gt_1m', label: '1M+' },
    ],
  },
  {
    key: 'problem',
    prompt: "What's holding your videos back most?",
    options: [
      { value: 'swipe_first_3s', label: 'Viewers swipe in the first 3 seconds' },
      { value: 'views_plateau', label: 'My views have plateaued' },
      { value: 'mid_video_dropoff', label: 'Viewers drop off mid-video' },
      { value: 'dont_know_what_to_post', label: "I don't know what to post" },
      { value: 'inconsistent_results', label: 'Some videos work, others flop' },
    ],
  },
  {
    key: 'cadence',
    prompt: 'How many videos do you post a week?',
    options: [
      { value: '0_1', label: '0 – 1' },
      { value: '2_4', label: '2 – 4' },
      { value: '5_10', label: '5 – 10' },
      { value: '10_plus', label: 'More than 10' },
    ],
  },
  {
    key: 'persona',
    prompt: 'Which best describes you?',
    options: [
      { value: 'solo_creator', label: 'Solo creator' },
      { value: 'brand_business', label: 'Brand or business' },
      { value: 'agency_multi_creator', label: 'Agency or multi-creator team' },
    ],
  },
];

export const isValidAnswer = (key: QuizKey, value: unknown): value is string =>
  typeof value === 'string' && Boolean(QUIZ_QUESTIONS.find((q) => q.key === key)?.options.some((o) => o.value === value));

/** Index of the first unanswered question, or the question count when complete. */
export const firstUnanswered = (answers: Partial<QuizAnswers>): number => {
  const idx = QUIZ_QUESTIONS.findIndex((q) => !isValidAnswer(q.key, answers[q.key]));
  return idx === -1 ? QUIZ_QUESTIONS.length : idx;
};

export const isQuizComplete = (answers: Partial<QuizAnswers>): answers is QuizAnswers =>
  firstUnanswered(answers) === QUIZ_QUESTIONS.length;
