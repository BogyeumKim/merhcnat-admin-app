import { apiTokenJson } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { setAccessToken } from '@/shared/api/session-token';
import { env } from '@/shared/config/env';

import { saveDeviceSecret } from '../model/device-secret';
import { serverLoginSuccessSchema, serverPasswordChangedSchema, type Authenticated } from '../model/schemas';
import { UserType } from '../model/user-type';

export type ChangePasswordInput = { currentPassword: string; newPassword: string };

/**
 * `PUT /api/users/me/password` (Bearer) `{ currentPassword, newPassword }`: 200 `{ accessToken }`(세션 교체).
 * 응답을 수락한 뒤 메모리 토큰을 교체한다. 실패는 오류 envelope의 `code`를 가진 `ApiError`로 도착한다:
 * 400 `CURRENT_PASSWORD_INVALID`(`remainingAttempts`, 5회 잠금에 포함), 400 `PASSWORD_POLICY_VIOLATION`(`violations`: LENGTH | CHARSET | CONTAINS_USER_ID), 400 `PASSWORD_REUSED`,
 * 400 `ACCOUNT_LOCKED`, 401(세션 종료). 서버 판정이 최종이며 화면의 검사는 힌트일 뿐이다.
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  // 개발 전용 대역(`EXPO_PUBLIC_API_MOCK=1`): 현재 비밀번호가 `wrong`이거나 새 비밀번호가 현재와 같으면 서버처럼 실패한다.
  if (__DEV__ && env.apiMock) {
    await new Promise<void>((resolve) => setTimeout(resolve, 450));
    if (input.currentPassword === 'wrong') {
      throw new ApiError({ status: 400, code: 'CURRENT_PASSWORD_INVALID', extras: { remainingAttempts: 4 } });
    }
    if (input.newPassword === input.currentPassword) throw new ApiError({ status: 400, code: 'PASSWORD_REUSED' });
    // 서버의 `accessToken`(새 토큰)으로 세션을 교체하는 것에 해당한다.
    setAccessToken('mock-access-token-rotated');
    return;
  }
  const { data, adoptIssuedToken } = await apiTokenJson('/api/users/me/password', serverPasswordChangedSchema, {
    method: 'PUT',
    body: input,
  });
  adoptIssuedToken(data.accessToken);
}

export type ChangeTempPasswordInput = ChangePasswordInput & { challengeToken: string };

/**
 * `POST /api/auth/password/temp`(Bearer 없음) `{ challengeToken, currentPassword, newPassword }`: 200 `step: SUCCESS` + `accessToken` =
 * 변경과 로그인 완료(로그인 완료와 같은 본문). 실패: 400 `CURRENT_PASSWORD_INVALID`(`remainingAttempts`, 로그인·코드 오류와 합산 5회 잠금),
 * 400 `PASSWORD_POLICY_VIOLATION`, 400 `PASSWORD_REUSED`, 401 `CHALLENGE_EXPIRED`(로그인부터 다시), 400 `ACCOUNT_LOCKED`.
 */
export async function changeTempPassword(input: ChangeTempPasswordInput): Promise<Authenticated> {
  // 개발 전용 대역: 임시 비밀번호가 `wrong`이면 실패, 새 비밀번호가 같으면 재사용 오류, 아니면 로그인 완료.
  if (__DEV__ && env.apiMock) {
    await new Promise<void>((resolve) => setTimeout(resolve, 450));
    if (input.currentPassword === 'wrong') {
      throw new ApiError({ status: 400, code: 'CURRENT_PASSWORD_INVALID', extras: { remainingAttempts: 4 } });
    }
    if (input.newPassword === input.currentPassword) throw new ApiError({ status: 400, code: 'PASSWORD_REUSED' });
    // 서버의 `accessToken` 적용에 해당한다.
    setAccessToken('mock-access-token');
    return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
  }
  const { data, adoptIssuedToken } = await apiTokenJson('/api/auth/password/temp', serverLoginSuccessSchema, {
    method: 'POST',
    body: input,
  });
  if (data.deviceSecret) await saveDeviceSecret(data.deviceSecret);
  adoptIssuedToken(data.accessToken);
  return { status: 'AUTHENTICATED', userType: data.userType, userId: data.userId, passwordChangeRequired: false, passwordChangeSkippable: false };
}
