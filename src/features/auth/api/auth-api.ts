import { apiJson, apiTokenJson } from '@/shared/api/client';
import { env } from '@/shared/config/env';

import type { AuthApi } from './auth-api.types';
import { saveDeviceSecret } from '../model/device-secret';
import {
  serverLoginStepSchema,
  serverSendCodeSchema,
  serverVerifyStepSchema,
  type Authenticated,
  type LoginApiResult,
  type ServerLoginSuccess,
  type ServerPasswordChangeRequired,
  type TempPasswordApiResult,
  type VerifyApiResult,
} from '../model/schemas';

/** 로그인 완료: 기기 비밀키를 먼저 저장하고(다음 로그인부터 OTP 생략에 필요) 그다음 토큰을 적용한다. */
async function completeLogin(data: ServerLoginSuccess, adoptIssuedToken: (token: string) => void): Promise<Authenticated> {
  if (data.deviceSecret) await saveDeviceSecret(data.deviceSecret);
  adoptIssuedToken(data.accessToken);
  return {
    status: 'AUTHENTICATED',
    userType: data.userType,
    userId: data.userId,
    passwordChangeRequired: data.passwordChangeRequired ?? false,
    passwordChangeSkippable: data.passwordChangeSkippable ?? false,
  };
}

const toTempPasswordRequired = ({ challengeToken, reason, userId }: ServerPasswordChangeRequired): TempPasswordApiResult => ({
  status: 'TEMP_PASSWORD_REQUIRED',
  challengeToken,
  reason,
  userId,
});

/**
 * 계약: docs/backend-contract/app-migration-server-login.md. 성공은 200 + DTO 본문이고 **1차 HTTP status, 2차 본문 `step`으로
 * 분기한다**(SUCCESS · MFA_REQUIRED · PASSWORD_CHANGE_REQUIRED). 200이 아니거나 `step`별 스키마와 맞지 않으면 `INVALID_RESPONSE`.
 * - `POST /api/auth/login` `{ userId, password, device }`: `SUCCESS` + `accessToken` = 로그인 완료(등록된 기기, 메시지 코드 계정).
 *   `MFA_REQUIRED` = 비밀번호는 통과, 코드 필요(`channels`[{channel, destination}], `lastUsedChannel`, `challengeToken`,
 *   `deviceState`). 절대 로그인으로 취급하지 않는다.
 * - `POST /api/auth/otp/send` `{ challengeToken, channel: KAKAO|SMS|EMAIL }`: `{ expiresInSeconds, resendAfterSeconds, maskedDestination, remainingSends }`.
 * - `POST /api/auth/otp/verify` `{ challengeToken, channel, otp }`: `SUCCESS` + `accessToken` = 로그인 완료
 *   (서버가 여기서 기기를 등록하거나 교체한다). 토큰은 검증과 기기 비밀키 저장이 끝난 뒤 `adoptIssuedToken`으로 한 번 적용한다.
 * - 임시비밀번호 계정은 위 두 호출 모두에서 `PASSWORD_CHANGE_REQUIRED` `{ userId, challengeToken, reason }`를 받는다.
 *   토큰이 없고 기기도 아직 등록되지 않았으며, `POST /api/auth/password/temp`로 변경을 마쳐야 로그인된다.
 * 실패(400, 401, 403 `UPDATE_REQUIRED`, 503, ...)는 클라이언트가 오류 envelope의 `code`와 `data` 부가 정보를 담은 `ApiError`로 던진다.
 */
const realAuthApi: AuthApi = {
  login: async ({ userId, password, device }): Promise<LoginApiResult> => {
    const { data, adoptIssuedToken } = await apiTokenJson('/api/auth/login', serverLoginStepSchema, {
      method: 'POST',
      body: { userId, password, device },
    });
    switch (data.step) {
      case 'SUCCESS':
        return completeLogin(data, adoptIssuedToken);
      case 'PASSWORD_CHANGE_REQUIRED':
        return toTempPasswordRequired(data);
      case 'MFA_REQUIRED':
        // 빈 `channels`는 정상: 연락처가 없는 계정(인증 시트가 안내). TOTP 계정은 항상 TOTP 하나가 온다.
        return {
          status: 'CHALLENGE_REQUIRED',
          loginType: data.loginType,
          deviceState: data.deviceState,
          methods: data.channels ?? [],
          recentMethod: data.lastUsedChannel,
          deviceRegisteredToOtherAccount: data.deviceRegisteredToOtherAccount,
          challengeToken: data.challengeToken,
          registeredUserIdMasked: data.registeredUserIdMasked,
        };
    }
  },

  sendCode: async ({ challengeToken, channel }) => {
    const data = await apiJson('/api/auth/otp/send', serverSendCodeSchema, {
      method: 'POST',
      body: { challengeToken, channel },
    });
    return {
      expiresInSeconds: data.expiresInSeconds,
      resendAfterSeconds: data.resendAfterSeconds,
      destination: data.maskedDestination ?? data.maskedPhone,
      remainingSends: data.remainingSends,
    };
  },

  verifyCode: async ({ challengeToken, channel, code: otp }): Promise<VerifyApiResult> => {
    const { data, adoptIssuedToken } = await apiTokenJson('/api/auth/otp/verify', serverVerifyStepSchema, {
      method: 'POST',
      body: { challengeToken, channel, otp },
    });
    return data.step === 'SUCCESS' ? completeLogin(data, adoptIssuedToken) : toTempPasswordRequired(data);
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
