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
      latestNotice: { id: '1', title: '신규 기능 업데이트', date: '2026-11-01' },
    };
  }
  const { status, code, data } = await apiEnvelope('/api/home/summary', homeSummarySchema);
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
  return data;
}
