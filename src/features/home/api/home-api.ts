import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';

import { homeSummarySchema, type HomeSummary } from '../model/schemas';

/** `GET /api/home/summary` (Bearer): the figures of the home screen for this account, scoped by the server from the token. */
export async function fetchHomeSummary(): Promise<HomeSummary> {
  const { status, code, data } = await apiEnvelope('/api/home/summary', homeSummarySchema);
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
  return data;
}
