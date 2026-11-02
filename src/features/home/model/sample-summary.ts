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

export const SAMPLE_NOTICES = [
  { id: 'notice-0001', title: '서비스 점검 안내', date: '11.03' },
  { id: 'notice-0002', title: '부가세 신고 자료 제공 일정', date: '10.31' },
  { id: 'notice-0003', title: '앱 업데이트 안내', date: '10.28' },
] as const;
