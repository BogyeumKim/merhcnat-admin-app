import { apiEnvelope, apiFetch } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import { env } from '@/shared/config/env';

import type { AuthApi } from './auth-api.types';
import {
  serverLoginDataSchema,
  serverSendCodeDataSchema,
  serverVerifyDataSchema,
  type LoginApiResult,
} from '../model/schemas';

const invalidResponse = (status: number) => new ApiError({ status, code: 'INVALID_RESPONSE' });

/**
 * Contract: docs/backend-contract/app-migration-server-login.md. Every response is `{ code, message, data? }`; the HTTP
 * status decides first, the `code` second.
 * - `POST /api/auth/login` `{ userId, password, device }`: 200 `SUCCESS` + `Access-Token` header = signed in (registered
 *   device, message-code account). 202 `MFA_REQUIRED` = password accepted, a code is needed (`channels`,
 *   `challengeToken`, `deviceState`). A 202 is never treated as a sign-in.
 * - `POST /api/auth/otp/send` `{ challengeToken, channel }`: 200 `SUCCESS` `{ expiresInSeconds, resendAfterSeconds, maskedPhone }`.
 * - `POST /api/auth/otp/verify` `{ challengeToken, channel, otp }`: 200 `SUCCESS` + `Access-Token` header = signed in (the
 *   server registers or replaces the device here). A 200 without the token header is rejected by `assertTokenIssued()`
 *   in the mutation (INVALID_RESPONSE).
 * Failures (401, 423, ...) are thrown by the client as `ApiError` with the envelope `code` and `data` extras.
 */
const realAuthApi: AuthApi = {
  login: async ({ userId, password, device }): Promise<LoginApiResult> => {
    const { status, code, data } = await apiEnvelope('/api/auth/login', serverLoginDataSchema, {
      method: 'POST',
      body: { userId, password, device },
    });

    if (status === 200 && code === 'SUCCESS') return { status: 'AUTHENTICATED', userType: data.userType };

    if (status === 202 && code === 'MFA_REQUIRED') {
      const channels = data.channels ?? [];
      if (channels.length === 0 || !data.challengeToken) throw invalidResponse(status);
      return {
        status: 'CHALLENGE_REQUIRED',
        loginType: data.loginType,
        deviceState: data.deviceState,
        methods: channels.map((method) => ({ method })),
        challengeToken: data.challengeToken,
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
      destination: data.maskedPhone,
    };
  },

  verifyCode: async ({ challengeToken, channel, code: otp }) => {
    const { status, code, data } = await apiEnvelope('/api/auth/otp/verify', serverVerifyDataSchema, {
      method: 'POST',
      body: { challengeToken, channel, otp },
    });
    if (status !== 200 || code !== 'SUCCESS') throw invalidResponse(status);
    return { status: 'AUTHENTICATED' as const, userType: data.userType };
  },

  logout: async () => {
    await apiFetch('/v1/auth/logout', { method: 'POST' });
  },
};

function resolveAuthApi(): AuthApi {
  // `__DEV__` is a build-time constant: in release bundles this branch (and the mock module) is removed.
  if (__DEV__ && env.apiMock) {
    return (require('./auth-api.mock') as { mockAuthApi: AuthApi }).mockAuthApi;
  }
  return realAuthApi;
}

export const authApi: AuthApi = resolveAuthApi();
