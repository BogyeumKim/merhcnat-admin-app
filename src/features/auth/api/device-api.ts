import { z } from 'zod';

import { apiEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

import { loadDeviceSecret } from '../model/device-secret';

export type DeviceUpdate = {
  /** `ExponentPushToken[...]`. 이 값이 있으면 서버는 이 기기에서 알림이 허용된 것으로 본다. */
  expoPushToken?: string;
};

/**
 * `PUT /api/devices/me` (Bearer): 서버가 보낸 필드만 이 기기의 행(어느 기기인지는 토큰의 claim으로 판단)에
 * 반영한다: 200 `SUCCESS`, `data` 없음. 실패(400 `PUSH_TOKEN_INVALID`·`DEVICE_NOT_FOUND`·`DEVICE_NOT_VERIFIED`, 401)는
 * 클라이언트가 `ApiError`로 던진다.
 */
export async function updateDevice(update: DeviceUpdate): Promise<void> {
  // 개발 전용 대역(`EXPO_PUBLIC_API_MOCK=1`): mock 세션에는 실제 토큰이 없어 서버라면 401로 답한다.
  if (__DEV__ && env.apiMock) return;
  // 서버가 이 기기를 확인하려면 비밀키가 필요하다(없으면 400, 틀리면 400 DEVICE_NOT_VERIFIED). 없으면 보내지 않는다.
  const deviceSecret = await loadDeviceSecret();
  if (!deviceSecret) return;
  const { status, code } = await apiEnvelope('/api/devices/me', z.unknown(), { method: 'PUT', body: { deviceSecret, ...update } });
  if (status !== 200 || code !== 'SUCCESS') throw new ApiError({ status, code: 'INVALID_RESPONSE' });
}
