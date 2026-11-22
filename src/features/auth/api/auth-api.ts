import { z } from 'zod';

import { apiEnvelope, apiTokenEnvelope } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

import type { AuthApi } from './auth-api.types';
import { saveDeviceSecret } from '../model/device-secret';
import {
  serverLoginDataSchema,
  serverSendCodeDataSchema,
  serverTempPasswordDataSchema,
  serverVerifyDataSchema,
  type LoginApiResult,
  type TempPasswordApiResult,
  type VerifyApiResult,
} from '../model/schemas';

const invalidResponse = (status: number) => new ApiError({ status, code: 'INVALID_RESPONSE' });

/** 각 단계의 성공은 모두 200이고 다음 단계는 `code`로 구분한다(SUCCESS / MFA_REQUIRED / PASSWORD_CHANGE_REQUIRED). */
const isStep = (status: number, code: string, step: 'SUCCESS' | 'MFA_REQUIRED' | 'PASSWORD_CHANGE_REQUIRED') => status === 200 && code === step;

/** `PASSWORD_CHANGE_REQUIRED`(임시비밀번호)면 변경용 토큰을 꺼내고, 아니면 `null`을 돌려준다. */
function tempPasswordRequired(status: number, code: string, data: unknown): TempPasswordApiResult | null {
  if (!isStep(status, code, 'PASSWORD_CHANGE_REQUIRED')) return null;
  const parsed = serverTempPasswordDataSchema.safeParse(data);
  if (!parsed.success) throw invalidResponse(status);
  return { status: 'TEMP_PASSWORD_REQUIRED', challengeToken: parsed.data.challengeToken, reason: parsed.data.reason, userId: parsed.data.userId };
}

/**
 * 계약: docs/backend-contract/app-migration-server-login.md. 모든 응답은 `{ code, message, data? }`이며
 * **1차 HTTP status, 2차 `code`로 분기한다**(같은 200이 SUCCESS·MFA_REQUIRED·PASSWORD_CHANGE_REQUIRED, 같은 400·401도 여러 의미로 온다).
 * `message`는 분기에 쓰지 않는다.
 * - `POST /api/auth/login` `{ userId, password, device }`: 200 `SUCCESS` + `data.accessToken` = 로그인 완료(등록된
 *   기기, 메시지 코드 계정). 200 `MFA_REQUIRED` = 비밀번호는 통과, 코드 필요(`channels`[{channel, destination}],
 *   `lastUsedChannel`, `challengeToken`, `deviceState`). 절대 로그인으로 취급하지 않는다.
 * - `POST /api/auth/otp/send` `{ challengeToken, channel: KAKAO|SMS|EMAIL }`: 200 `SUCCESS` `{ expiresInSeconds, resendAfterSeconds, maskedDestination, remainingSends? }`.
 * - `POST /api/auth/otp/verify` `{ challengeToken, channel, otp }`: 200 `SUCCESS` + `data.accessToken` = 로그인 완료
 *   (서버가 여기서 기기를 등록하거나 교체한다). 전환기에는 `data.accessToken`이 없으면 `Access-Token` 헤더를 쓰고,
 *   둘 다 없는 200은 mutation의 `assertTokenIssued()`가 거부한다(INVALID_RESPONSE).
 *   토큰은 분기별 검증과 기기 비밀키 저장이 끝난 뒤 `adoptIssuedToken`으로 한 번 적용한다.
 * - 임시비밀번호 계정은 위 두 호출 모두에서 200 `PASSWORD_CHANGE_REQUIRED` `{ userId, challengeToken }`를 받는다.
 *   토큰이 없고 기기도 아직 등록되지 않았으며, `POST /api/auth/password/temp`로 변경을 마쳐야 로그인된다.
 * 실패(400, 401, 403 `UPDATE_REQUIRED`, 503, ...)는 클라이언트가 envelope `code`와 `data` 부가 정보를 담은 `ApiError`로 던진다.
 */
const realAuthApi: AuthApi = {
  login: async ({ userId, password, device }): Promise<LoginApiResult> => {
    // `data`는 code마다 모양이 달라 여기서는 원문 그대로 받고, 아래에서 분기별로 한 번만 검증한다
    // (변환이 있는 스키마를 두 번 거치면 변환된 결과가 다시 검증에 실패한다).
    const envelope = await apiTokenEnvelope('/api/auth/login', z.unknown(), {
      method: 'POST',
      body: { userId, password, device },
    });
    const { status, code } = envelope;

    const temp = tempPasswordRequired(status, code, envelope.data);
    if (temp) return temp;

    const parsed = serverLoginDataSchema.safeParse(envelope.data);
    if (!parsed.success) throw invalidResponse(status);
    const data = parsed.data;

    if (isStep(status, code, 'SUCCESS')) {
      if (data.deviceSecret) await saveDeviceSecret(data.deviceSecret);
      envelope.adoptIssuedToken(data.accessToken);
      return {
        status: 'AUTHENTICATED',
        userType: data.userType,
        userId: data.userId,
        passwordChangeRequired: data.passwordChangeRequired ?? false,
        passwordChangeSkippable: data.passwordChangeSkippable ?? false,
      };
    }

    if (isStep(status, code, 'MFA_REQUIRED')) {
      // 빈 `channels`는 정상: 연락처가 없는 계정(인증 시트가 안내). TOTP 계정은 항상 TOTP 하나가 온다.
      const methods = data.channels ?? [];
      if (!data.challengeToken) throw invalidResponse(status);
      return {
        status: 'CHALLENGE_REQUIRED',
        loginType: data.loginType,
        deviceState: data.deviceState,
        methods,
        recentMethod: data.lastUsedChannel,
        deviceRegisteredToOtherAccount: data.deviceRegisteredToOtherAccount,
        challengeToken: data.challengeToken,
        registeredUserIdMasked: data.registeredUserIdMasked,
      };
    }

    throw invalidResponse(status);
  },

  sendCode: async ({ challengeToken, channel }) => {
    const { status, code, data } = await apiEnvelope('/api/auth/otp/send', serverSendCodeDataSchema, {
      method: 'POST',
      body: { challengeToken, channel },
    });
    if (status !== 200 || code !== 'SUCCESS') throw invalidResponse(status);
    return {
      expiresInSeconds: data.expiresInSeconds,
      resendAfterSeconds: data.resendAfterSeconds,
      destination: data.maskedDestination ?? data.maskedPhone,
      remainingSends: data.remainingSends,
    };
  },

  verifyCode: async ({ challengeToken, channel, code: otp }): Promise<VerifyApiResult> => {
    const envelope = await apiTokenEnvelope('/api/auth/otp/verify', z.unknown(), {
      method: 'POST',
      body: { challengeToken, channel, otp },
    });
    const { status, code } = envelope;

    const temp = tempPasswordRequired(status, code, envelope.data);
    if (temp) return temp;

    const parsed = serverVerifyDataSchema.safeParse(envelope.data);
    if (!isStep(status, code, 'SUCCESS') || !parsed.success) throw invalidResponse(status);
    const data = parsed.data;
    // 기기 등록이 끝난 순간에만 오는 비밀키: 다음 로그인부터 OTP를 생략하는 데 필요하다.
    if (data.deviceSecret) await saveDeviceSecret(data.deviceSecret);
    envelope.adoptIssuedToken(data.accessToken);
    return {
      status: 'AUTHENTICATED' as const,
      userType: data.userType,
      userId: data.userId,
      passwordChangeRequired: data.passwordChangeRequired ?? false,
      passwordChangeSkippable: data.passwordChangeSkippable ?? false,
    };
  },
};

function resolveAuthApi(): AuthApi {
  // `__DEV__`는 빌드 타임 상수다: 릴리스 번들에서는 이 분기(와 mock 모듈)가 제거된다.
  if (__DEV__ && env.apiMock) {
    return (require('./auth-api.mock') as { mockAuthApi: AuthApi }).mockAuthApi;
  }
  return realAuthApi;
}

export const authApi: AuthApi = resolveAuthApi();
