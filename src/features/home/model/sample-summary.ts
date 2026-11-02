/**
 * Stand-in numbers for the home layout until the summary comes from the server (or the WebView). Obvious dummy values:
 * replace this module with a query, keep the shape.
 */
export const SAMPLE_SUMMARY = {
  salesAmount: 1_250_000,
  changePercent: 12,
  approvalCount: 38,
  cancellationCount: 2,
  settlementAmount: 3_480_000,
  settlementDate: '2026-11-05',
} as const;
