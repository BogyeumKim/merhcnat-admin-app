/**
 * Stand-in numbers for the home layout until the data comes from the server (or the WebView). Obvious dummy values:
 * replace this module with a query, keep the shape.
 */
export const SAMPLE_STORE_NAME = '테스트 가맹점';

export const SAMPLE_SUMMARY = {
  todaySales: 1_250_000,
  approvalCount: 38,
  cancellationCount: 2,
  nextDepositAmount: 3_480_000,
  nextDepositDate: '11.04',
  monthSales: 28_430_000,
  monthRange: '11.01 - 11.03',
} as const;

/** Last seven days, oldest first; the last entry is today. */
export const SAMPLE_WEEK = [
  { date: '2026-10-28', amount: 2_100_000 },
  { date: '2026-10-29', amount: 1_800_000 },
  { date: '2026-10-30', amount: 2_600_000 },
  { date: '2026-10-31', amount: 3_200_000 },
  { date: '2026-11-01', amount: 2_900_000 },
  { date: '2026-11-02', amount: 1_500_000 },
  { date: '2026-11-03', amount: 1_250_000 },
] as const;

/** Share of last month's sales by payment type (percent, sums to 100). */
export const SAMPLE_PAYMENT_MIX = [
  { id: 'credit', percent: 62 },
  { id: 'check', percent: 24 },
  { id: 'simple', percent: 14 },
] as const;

/** Store ranking (accounts above store level only). */
export const SAMPLE_RANKING = [
  { id: 'store-a', name: '테스트 가맹점 A', amount: 8_400_000 },
  { id: 'store-b', name: '테스트 가맹점 B', amount: 6_100_000 },
  { id: 'store-c', name: '테스트 가맹점 C', amount: 4_900_000 },
] as const;

export const SAMPLE_NOTICES = [
  { id: 'notice-0001', title: '서비스 점검 안내', date: '11.03' },
  { id: 'notice-0002', title: '부가세 신고 자료 제공 일정', date: '10.31' },
  { id: 'notice-0003', title: '앱 업데이트 안내', date: '10.28' },
] as const;
