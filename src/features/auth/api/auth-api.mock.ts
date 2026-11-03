import { ApiError } from '@/shared/api/errors';
import { setAccessToken } from '@/shared/api/session-token';

import type { AuthApi } from './auth-api.types';
import type { ChallengeMethod, DeviceState, LoginApiResult } from '../model/schemas';
import { UserType } from '../model/user-type';

/**
 * Development-only stand-in for the server, used when the server is not running (`EXPO_PUBLIC_API_MOCK=1`).
 * It follows docs/backend-contract/app-migration-server-login.md, so the real client code paths run unchanged.
 * All values are dummies. Any password is accepted except `wrong`.
 *
 * Scenarios (type the ID):
 *   1234       ID 1234 + password 1234 -> signs in directly (registered device, no code)
 *   merchant   type 1, registered device -> signs in directly
 *   pwchange   signs in directly, but the password is older than 90 days -> the password-change screen first
 *   kakao      type 1, new device -> device notice, choose KAKAO / SMS, then code
 *   changed    type 1, other device -> device-change notice, choose method, then code
 *   totp       type 0 (authenticator app), registered device -> code (type 0 always needs the code)
 *   totpnew    type 0, new device -> device notice, then code
 *   nophone    type 1 -> sending a code fails: PHONE_NOT_REGISTERED
 *   lockotp    type 1 -> 5 wrong codes: 423 ACCOUNT_LOCKED (until an administrator unlocks it; no retry)
 *   locked     -> 423 ACCOUNT_LOCKED at login
 *   blocked    -> 403 UNSUPPORTED_LOGIN_TYPE      maint -> 503 MAINTENANCE (with a period)
 * Codes: 000000 = correct, 999999 = expired, anything else = wrong (the error says how many tries are left;
 * 5 wrong tries lock the account for good, like the server).
 */
const LATENCY_MS = 450;
const MAX_ATTEMPTS = 5;
const MOCK_TOKEN = 'mock-access-token';
const EXPIRES_IN_SECONDS = 180;
const RESEND_AFTER_SECONDS = 15;

type MockAccount = { userType: UserType; loginType: 0 | 1; deviceState: DeviceState };

const ACCOUNTS: Record<string, MockAccount> = {
  kakao: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  changed: { userType: UserType.L2Vid, loginType: 1, deviceState: 'CHANGED' },
  totp: { userType: UserType.Vid, loginType: 0, deviceState: 'MATCH' },
  totpnew: { userType: UserType.Vgid, loginType: 0, deviceState: 'NONE' },
  nophone: { userType: UserType.Mid, loginType: 1, deviceState: 'MATCH' },
  lockotp: { userType: UserType.Mid, loginType: 1, deviceState: 'MATCH' },
};

type MockChallenge = { userId: string; account: MockAccount; attempts: number };
const challenges = new Map<string, MockChallenge>();
const wrongInARow = new Map<string, number>();

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));
const invalidCredentials = () => new ApiError({ status: 401, code: 'INVALID_CREDENTIALS' });

function challengeOf(token: string): MockChallenge {
  const found = challenges.get(token);
  if (!found) throw new ApiError({ status: 401, code: 'CHALLENGE_EXPIRED' });
  return found;
}

export const mockAuthApi: AuthApi = {
  async login({ userId, password }) {
    await wait();
    if (password === 'wrong') throw invalidCredentials();

    const id = userId.trim().toLowerCase();

    // Dev shortcut: 1234 / 1234 goes straight to the main (tab) screens.
    if (id === '1234') {
      if (password !== '1234') throw invalidCredentials();
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    // The password is past its 90 days: signed in, but the password-change screen comes first.
    if (id === 'pwchange') {
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: true, passwordChangeSkippable: false };
    }

    switch (id) {
      case 'locked':
        throw new ApiError({ status: 423, code: 'ACCOUNT_LOCKED' });
      case 'blocked':
        throw new ApiError({ status: 403, code: 'UNSUPPORTED_LOGIN_TYPE' });
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
        return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    const account = ACCOUNTS[id];
    if (!account) throw invalidCredentials();

    // A registered device with a message-code account needs no code (the server decides; the mock mirrors it).
    if (account.loginType === 1 && account.deviceState === 'MATCH' && id !== 'nophone' && id !== 'lockotp') {
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: account.userType, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    const challengeToken = `mock-challenge-${Date.now()}-${challenges.size}`;
    challenges.set(challengeToken, { userId: id, account, attempts: 0 });
    const channels: ChallengeMethod[] = account.loginType === 0 ? ['TOTP'] : ['KAKAO', 'SMS'];
    const result: LoginApiResult = {
      status: 'CHALLENGE_REQUIRED',
      loginType: account.loginType,
      deviceState: account.deviceState,
      methods: channels.map((method) => ({ method })),
      challengeToken,
    };
    return result;
  },

  async sendCode({ challengeToken, channel }) {
    await wait();
    const challenge = challengeOf(challengeToken);
    if (challenge.account.loginType === 0 || channel === 'TOTP') throw new ApiError({ status: 400, code: 'OTP_CHANNEL_INVALID' });
    if (challenge.userId === 'nophone') throw new ApiError({ status: 409, code: 'PHONE_NOT_REGISTERED' });
    return { expiresInSeconds: EXPIRES_IN_SECONDS, resendAfterSeconds: RESEND_AFTER_SECONDS, destination: '***-****-0000' };
  },

  async verifyCode({ challengeToken, code }) {
    await wait();
    const challenge = challengeOf(challengeToken);

    if (code === '999999') throw new ApiError({ status: 401, code: 'OTP_EXPIRED' });
    if (code !== '000000') {
      challenge.attempts += 1;
      const inARow = (wrongInARow.get(challenge.userId) ?? 0) + 1;
      wrongInARow.set(challenge.userId, inARow);
      if (inARow >= MAX_ATTEMPTS) {
        throw new ApiError({ status: 423, code: 'ACCOUNT_LOCKED' });
      }
      throw new ApiError({
        status: 401,
        code: 'OTP_INVALID',
        extras: { remainingAttempts: MAX_ATTEMPTS - inARow },
      });
    }

    wrongInARow.set(challenge.userId, 0);
    challenges.delete(challengeToken);
    setAccessToken(MOCK_TOKEN);
    return { status: 'AUTHENTICATED', userType: challenge.account.userType, passwordChangeRequired: false, passwordChangeSkippable: false };
  },

  async logout() {
    await wait();
  },
};
