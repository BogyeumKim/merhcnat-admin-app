import { apiFetch, apiJson } from '@/shared/api/client';
import { env } from '@/shared/config/env';

import type { AuthApi } from './auth-api.types';
import { authenticatedSchema, loginResultSchema } from '../model/schemas';

const realAuthApi: AuthApi = {
  login: (input) => apiJson('/v1/auth/login', loginResultSchema, { method: 'POST', body: input }),

  sendCode: async ({ challengeId, method }) => {
    await apiFetch(`/v1/auth/challenges/${encodeURIComponent(challengeId)}/send`, {
      method: 'POST',
      body: { method },
    });
  },

  verifyCode: ({ challengeId, code, confirmDevice }) =>
    apiJson(`/v1/auth/challenges/${encodeURIComponent(challengeId)}/verify`, authenticatedSchema, {
      method: 'POST',
      body: { code, confirmDevice },
    }),

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
