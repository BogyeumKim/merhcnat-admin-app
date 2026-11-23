import { apiJson } from '@/shared/api/client';
import { env } from '@/shared/config/env';

import { homeSummarySchema, type HomeSummary } from '../model/schemas';

/** `GET /api/home/summary` (Bearer): 이 계정의 홈 화면 수치. 서버가 토큰으로 범위를 정한다. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  // 개발 전용 대체 데이터(`EXPO_PUBLIC_API_MOCK=1`). 서버 없이 홈 화면을 보여주기 위한 더미 수치.
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
  return apiJson('/api/home/summary', homeSummarySchema);
}
