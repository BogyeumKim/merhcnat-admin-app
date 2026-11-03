import type { HomeSummary } from './schemas';

type Day = NonNullable<HomeSummary['weeklySales']>[number];

/** Figures for the 7-day card: the total, the busiest day and the average of the days before today (today is still running). */
export function summarizeWeek(days: readonly Day[]) {
  const total = days.reduce((sum, day) => sum + day.amount, 0);
  const past = days.slice(0, -1);
  const average = past.length > 0 ? Math.round(past.reduce((sum, day) => sum + day.amount, 0) / past.length) : 0;
  const peak = past.reduce<Day | null>((best, day) => (best === null || day.amount > best.amount ? day : best), null);
  const max = Math.max(1, ...days.map((day) => day.amount));
  return { total, average, peak, max };
}
