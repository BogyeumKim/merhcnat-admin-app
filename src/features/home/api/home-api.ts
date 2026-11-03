import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

import { homeSummarySchema, type HomeSummary } from '../model/schemas';

/** `GET /api/home/summary` (Bearer): the figures of the home screen for this account, scoped by the server from the token. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  // Development-only stand-in (`EXPO_PUBLIC_API_MOCK=1`), so the home screen can be shown without the server. Dummy figures.
  if (__DEV__ && env.apiMock) {
    return {
      storeName: '테스트 가맹점',
      todaySales: 1250000,
      approvalCount: 38,
      cancellationCount: 2,
      nextDepositAmount: null,
      nextDepositDate: null,
      monthSales: 28430000,
      prepayAvailable: true,
      latestNotice: { id: '1', title: '11월 정산 일정 안내', date: '2026-11-01' },
      failedCount: 2,
      weeklySales: [
        { date: '2026-10-29', amount: 11200000 },
        { date: '2026-10-30', amount: 12400000 },
        { date: '2026-10-31', amount: 15100000 },
        { date: '2026-11-01', amount: 21800000 },
        { date: '2026-11-02', amount: 16700000 },
        { date: '2026-11-03', amount: 13400000 },
        { date: '2026-11-04', amount: 1250000 },
      ],
      recentTransactions: [
        { id: '1', cardName: '신한카드', time: '14:32', installment: '일시불', canceled: false, amount: 45000 },
        { id: '2', cardName: 'KB국민카드', time: '14:10', installment: '3개월', canceled: false, amount: 128000 },
        { id: '3', cardName: '현대카드', time: '13:58', installment: '일시불', canceled: true, amount: 32000 },
      ],
      store: { normal: true, bizNo: '123-45-*****', settlementCycle: 'D+N 영업일', settlementAccount: '국민은행 ••1234', services: '키인결제 · SMS결제' },
    };
  }
  const { status, code, data } = await apiEnvelope('/api/home/summary', homeSummarySchema);
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
  return data;
}
