import { ApiError } from '@/shared/api/errors';
import { setAccessToken } from '@/shared/api/session-token';

import type { AuthApi } from './auth-api.types';
import type { Authenticated, ChallengeMethod, ChallengeRequired, DeviceState } from '../model/schemas';
import { UserType } from '../model/user-type';

/**
 * Development-only stand-in for the backend, used until the server exists (`EXPO_PUBLIC_API_MOCK=1`).
 * It follows docs/backend-contract so the real client code paths run unchanged. All values are dummies.
 *
 * Scenarios (type the ID; any password except "wrong" is accepted, except for 1234):
 *   1234       ID 1234 + password 1234 -> signs in directly and opens the tab screens (quick dev shortcut)
 *   merchant   OTP type 1, registered device  -> signs in directly, no code
 *   newdevice  OTP type 1, no device yet      -> choose SMS / EMAIL / KAKAO, then code
 *   changed    OTP type 1, other device       -> device-change notice, choose method, then code
 *   totp       TOTP, registered device        -> code every time
 *   totpnew    TOTP, no device yet            -> device notice, then code
 *   blocked    -> 403 ACCOUNT_TYPE_NOT_ALLOWED      maint -> 503 MAINTENANCE (with a period)
 * Codes: 000000 = correct, 999999 = expired, anything else = wrong (5 wrong tries lock the challenge).
 */
const LATENCY_MS = 450;
const MAX_ATTEMPTS = 5;
const MOCK_TOKEN = 'mock-access-token';

type MockChallenge = { userType: UserType; deviceState: DeviceState; attempts: number; sentMethod: ChallengeMethod | null };
const challenges = new Map<string, MockChallenge>();

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));

const messageMethods = [
  { method: 'SMS', destination: '***-****-0000' },
  { method: 'EMAIL', destination: 'a***@example.invalid' },
  { method: 'KAKAO', destination: '***-****-0000' },
] as const;

function challenge(userType: UserType, deviceState: DeviceState, totp: boolean): ChallengeRequired {
  const challengeId = `mock-${Date.now()}-${challenges.size}`;
  challenges.set(challengeId, { userType, deviceState, attempts: 0, sentMethod: null });
  return {
    status: 'CHALLENGE_REQUIRED',
    challengeId,
    deviceState,
    methods: totp ? [{ method: 'TOTP' }] : [...messageMethods],
  };
}

export const mockAuthApi: AuthApi = {
  async login({ userId, password }) {
    await wait();
    if (password === 'wrong') throw new ApiError({ status: 401, code: 'INVALID_CREDENTIALS' });

    // Dev shortcut: 1234 / 1234 goes straight to the main (tab) screens. Any other password for this ID is rejected.
    if (userId.trim() === '1234') {
      if (password !== '1234') throw new ApiError({ status: 401, code: 'INVALID_CREDENTIALS' });
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: UserType.Mid };
    }

    switch (userId.trim().toLowerCase()) {
      case 'blocked':
        throw new ApiError({ status: 403, code: 'ACCOUNT_TYPE_NOT_ALLOWED' });
      case 'maint': {
        const start = new Date(Date.now() - 30 * 60 * 1000);
        const end = new Date(Date.now() + 90 * 60 * 1000);
        throw new ApiError({
          status: 503,
          code: 'MAINTENANCE',
          extras: { startAt: start.toISOString(), endAt: end.toISOString(), retryAfterSeconds: 5400 },
        });
      }
      case 'merchant':
        setAccessToken(MOCK_TOKEN);
        return { status: 'AUTHENTICATED', userType: UserType.Mid };
      case 'newdevice':
        return challenge(UserType.Mid, 'NONE', false);
      case 'changed':
        return challenge(UserType.L2Vid, 'CHANGED', false);
      case 'totp':
        return challenge(UserType.Vid, 'MATCH', true);
      case 'totpnew':
        return challenge(UserType.Vgid, 'NONE', true);
      default:
        throw new ApiError({ status: 401, code: 'INVALID_CREDENTIALS' });
    }
  },

  async sendCode({ challengeId, method }) {
    await wait();
    const found = challenges.get(challengeId);
    if (!found) throw new ApiError({ status: 400, code: 'OTP_EXPIRED' });
    found.sentMethod = method;
  },

  async verifyCode({ challengeId, code }): Promise<Authenticated> {
    await wait();
    const found = challenges.get(challengeId);
    if (!found) throw new ApiError({ status: 400, code: 'OTP_EXPIRED' });

    if (found.attempts >= MAX_ATTEMPTS) {
      throw new ApiError({ status: 429, code: 'OTP_LOCKED', extras: { retryAfterSeconds: 60 } });
    }
    if (code === '999999') throw new ApiError({ status: 400, code: 'OTP_EXPIRED' });
    if (code !== '000000') {
      found.attempts += 1;
      throw new ApiError({ status: 400, code: 'OTP_INVALID' });
    }

    challenges.delete(challengeId);
    setAccessToken(MOCK_TOKEN);
    return { status: 'AUTHENTICATED', userType: found.userType };
  },

  async logout() {
    await wait();
  },
};
