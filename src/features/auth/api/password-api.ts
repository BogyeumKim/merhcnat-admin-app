import { z } from 'zod';

import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

export type ChangePasswordInput = { currentPassword: string; newPassword: string };

/**
 * `PUT /api/users/me/password` (Bearer) `{ currentPassword, newPassword }`: 200 `SUCCESS`, no `data`. Failures arrive
 * as `ApiError` with the envelope `code`: 400 `CURRENT_PASSWORD_INVALID` (`remainingAttempts`; counts toward the 5-try
 * lock), 400 `PASSWORD_POLICY_VIOLATION` (`violations`: LENGTH | CHARSET | CONTAINS_USER_ID), 409 `PASSWORD_REUSED`,
 * 423 `ACCOUNT_LOCKED`, 401 (session over). The server's verdict is final; the screen's checks are hints.
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  // Development-only stand-in (`EXPO_PUBLIC_API_MOCK=1`): `wrong` as the current password and a new password equal to the current one fail like the server.
  if (__DEV__ && env.apiMock) {
    await new Promise<void>((resolve) => setTimeout(resolve, 450));
    if (input.currentPassword === 'wrong') {
      throw new ApiError({ status: 400, code: 'CURRENT_PASSWORD_INVALID', extras: { remainingAttempts: 4 } });
    }
    if (input.newPassword === input.currentPassword) throw new ApiError({ status: 409, code: 'PASSWORD_REUSED' });
    return;
  }
  const { status, code } = await apiEnvelope('/api/users/me/password', z.unknown(), { method: 'PUT', body: input });
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
}
