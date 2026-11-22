import type { EditorUsage } from '@/api/editor';

export const isFreePlan = (usage: EditorUsage) => usage.plan === 'free';

/** Free resets on the 1st of the month in UTC, so show that day in UTC (not the day before in the Americas). */
export const resetDate = (usage: EditorUsage) =>
  new Date(usage.resetsOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(isFreePlan(usage) ? { timeZone: 'UTC' } : {}) });
