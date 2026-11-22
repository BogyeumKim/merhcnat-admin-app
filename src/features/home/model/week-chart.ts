import type { HomeSummary } from './schemas';

type Day = NonNullable<HomeSummary['weeklySales']>[number];

/** 7일 카드용 수치: 합계, 가장 많은 날, 오늘 이전 날들의 평균(오늘은 아직 진행 중). */
export function summarizeWeek(days: readonly Day[]) {
  const total = days.reduce((sum, day) => sum + day.amount, 0);
  const past = days.slice(0, -1);
  const average = past.length > 0 ? Math.round(past.reduce((sum, day) => sum + day.amount, 0) / past.length) : 0;
  const peak = past.reduce<Day | null>((best, day) => (best === null || day.amount > best.amount ? day : best), null);
  const max = Math.max(1, ...days.map((day) => day.amount));
  return { total, average, peak, max };
}
