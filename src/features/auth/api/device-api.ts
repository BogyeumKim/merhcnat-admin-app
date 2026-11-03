import { z } from 'zod';

import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

export type DeviceUpdate = {
  /** `ExponentPushToken[...]`. Its presence tells the server notifications are allowed on this device. */
  expoPushToken?: string;
};

/**
 * `PUT /api/devices/me` (Bearer): the server updates this device's row (the token's claims say which device) with
 * whatever fields are sent: 200 `SUCCESS`, no `data`. Failures (`PUSH_TOKEN_INVALID`, `DEVICE_NOT_FOUND`, 401) are
 * thrown by the client as `ApiError`.
 */
export async function updateDevice(update: DeviceUpdate): Promise<void> {
  // Development-only stand-in (`EXPO_PUBLIC_API_MOCK=1`): the mock session has no real token, so the server would answer 401.
  if (__DEV__ && env.apiMock) return;
  const { status, code } = await apiEnvelope('/api/devices/me', z.unknown(), { method: 'PUT', body: update });
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
}
