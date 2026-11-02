/**
 * Stand-in numbers for the home layout until the data comes from the server (or the WebView). Obvious dummy values:
 * replace this module with a query, keep the shape.
 */
export const SAMPLE_STORE_NAME = '테스트 가맹점';

export const SAMPLE_SUMMARY = {
  salesAmount: 1_250_000,
  changePercent: 12,
  approvalCount: 38,
  cancellationCount: 2,
} as const;

export type SampleTransaction = { id: string; kind: 'approval' | 'cancellation'; amount: number; time: string };

export const SAMPLE_TRANSACTIONS: readonly SampleTransaction[] = [
  { id: 'tx-0001', kind: 'approval', amount: 38_000, time: '14:32' },
  { id: 'tx-0002', kind: 'approval', amount: 12_500, time: '13:08' },
  { id: 'tx-0003', kind: 'cancellation', amount: 21_000, time: '11:47' },
  { id: 'tx-0004', kind: 'approval', amount: 64_000, time: '10:15' },
];
