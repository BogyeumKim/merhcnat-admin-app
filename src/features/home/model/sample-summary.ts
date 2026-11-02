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
} as const;

export const SAMPLE_LATEST_NOTICE = { title: '서비스 점검 안내', date: '11.03' } as const;
