import { ApiError } from '@/shared/api/errors';
import { notifyUnauthorized, setAccessToken } from '@/shared/api/session-token';

import type { AuthApi } from './auth-api.types';
import { maskUserId } from '../model/mask-user-id';
import type { ChallengeOption, DeviceState, LoginApiResult } from '../model/schemas';
import { UserType } from '../model/user-type';

/**
 * 서버가 없을 때(`EXPO_PUBLIC_API_MOCK=1`) 쓰는 개발 전용 대역.
 * docs/backend-contract/app-migration-server-login.md 를 따르므로 실제 클라이언트 코드 경로가 그대로 동작한다.
 * 모든 값은 더미이며, `wrong` 외의 비밀번호는 모두 허용한다.
 *
 * 시나리오(ID 입력):
 *   1234       ID 1234 + 비밀번호 1234 -> 바로 로그인(등록된 기기, 코드 없음)
 *   merchant   타입 1, 등록된 기기 -> 바로 로그인
 *   pwchange   바로 로그인되지만 비밀번호가 90일 경과 -> 비밀번호 변경 화면이 먼저 열림
 *   kakao      타입 1, 새 기기 -> KAKAO / SMS / EMAIL 선택(KAKAO "최근 사용") 후 코드
 *   phoneonly  타입 1, 새 기기, 이메일 없음 -> KAKAO / SMS만
 *   emailonly  타입 1, 새 기기, 휴대폰 없음 -> 받을 이메일 확인 후 코드
 *   nocontact  타입 1, 새 기기, 연락처 없음 -> 빈 channels: "등록된 연락처가 없어요"
 *   changed    타입 1, 다른 기기 -> 기기 변경 안내, 방법 선택 후 코드
 *   totp       타입 0(인증 앱), 등록된 기기 -> 코드 입력(타입 0은 항상 코드 필요)
 *   totpnew    타입 0, 새 기기 -> 기기 안내 후 코드
 *   lockotp    타입 1 -> 코드 5회 오류: 400 ACCOUNT_LOCKED(관리자가 해제할 때까지, 재시도 불가). 인증 시트가 닫히고
 *              로그인 화면 위에 잠김 안내. 이후 로그인·발송·검증 모두 ACCOUNT_LOCKED(앱을 다시 시작하면 풀림)
 *   locked     -> 로그인 시 400 ACCOUNT_LOCKED
 *   suspended  -> 400 ACCOUNT_SUSPENDED(비밀번호가 맞은 뒤)   suspotp -> 코드 단계에서 400 ACCOUNT_SUSPENDED
 *   temp       -> 200 PASSWORD_CHANGE_REQUIRED(임시비밀번호, 바로)   tempotp -> 코드 통과 후 임시비밀번호 변경
 *   update     -> 403 UPDATE_REQUIRED     insecure -> 400 DEVICE_INSECURE     idle -> 로그인 후 6초 뒤 401
 *   blocked    -> 400 UNSUPPORTED_LOGIN_TYPE      maint -> 503 MAINTENANCE(기간 포함)
 *   offline    -> 연결 실패(NETWORK_ERROR): 로그인 화면의 오류 토스트(`error:NETWORK_ERROR`) 확인용
 * 코드: 000000 = 정상, 999999 = 만료, 그 외 = 오류(남은 횟수를 오류에 담음;
 * 5회 오류 시 서버처럼 계정이 영구 잠금).
 */
const LATENCY_MS = 450;
const MAX_ATTEMPTS = 5;
/**
 * 로그인 완료 시 서버가 `data.accessToken`으로 주는 토큰의 대역. mock은 HTTP 계층 위(`AuthApi`)에서 동작하므로
 * 실제 경로(`apiTokenEnvelope`의 `adoptIssuedToken`) 대신 바로 메모리에 넣는다.
 */
const MOCK_TOKEN = 'mock-access-token';
const EXPIRES_IN_SECONDS = 180;
const RESEND_AFTER_SECONDS = 15;

type MockAccount = { userType: UserType; loginType: 0 | 1; deviceState: DeviceState };

const ACCOUNTS: Record<string, MockAccount> = {
  kakao: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  changed: { userType: UserType.L2Vid, loginType: 1, deviceState: 'CHANGED' },
  totp: { userType: UserType.Vid, loginType: 0, deviceState: 'MATCH' },
  totpnew: { userType: UserType.Vgid, loginType: 0, deviceState: 'NONE' },
  phoneonly: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  emailonly: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  nocontact: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  lockotp: { userType: UserType.Mid, loginType: 1, deviceState: 'MATCH' },
  suspotp: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
  tempotp: { userType: UserType.Mid, loginType: 1, deviceState: 'NONE' },
};

type MockChallenge = { userId: string; account: MockAccount; attempts: number };
const challenges = new Map<string, MockChallenge>();
const wrongInARow = new Map<string, number>();
/** 잠긴 시각(ISO). 있으면 그 계정은 잠김. */
const lockedAtOf = new Map<string, string>();

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));
const invalidCredentials = (remainingAttempts?: number) =>
  new ApiError({ status: 401, code: 'INVALID_CREDENTIALS', extras: remainingAttempts === undefined ? {} : { remainingAttempts } });

/** 코드 오류가 5회 쌓여 잠긴 계정: 서버처럼 로그인·발송·검증 모두 400 `ACCOUNT_LOCKED`(mock은 앱을 다시 시작하면 풀림). */
function assertNotLocked(userId: string) {
  const lockedAt = lockedAtOf.get(userId);
  if (lockedAt) throw new ApiError({ status: 400, code: 'ACCOUNT_LOCKED', extras: { userIdMasked: maskUserId(userId), lockedAt } });
}

function challengeOf(token: string): MockChallenge {
  const found = challenges.get(token);
  if (!found) throw new ApiError({ status: 401, code: 'CHALLENGE_EXPIRED' });
  return found;
}

export const mockAuthApi: AuthApi = {
  async login({ userId, password }) {
    await wait();
    if (password === 'wrong') throw invalidCredentials(3);

    const id = userId.trim().toLowerCase();

    // 개발용 단축: 1234 / 1234 는 바로 메인(탭) 화면으로 이동한다.
    if (id === '1234') {
      if (password !== '1234') throw invalidCredentials();
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    // 비밀번호가 90일을 넘음: 로그인은 되지만 비밀번호 변경 화면이 먼저 나온다.
    if (id === 'pwchange') {
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: true, passwordChangeSkippable: false };
    }

    switch (id) {
      case 'locked':
        throw new ApiError({ status: 400, code: 'ACCOUNT_LOCKED', extras: { userIdMasked: 'loc**ed', lockedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() } });
      case 'suspended':
        throw new ApiError({ status: 400, code: 'ACCOUNT_SUSPENDED' });
      case 'temp':
        return { status: 'TEMP_PASSWORD_REQUIRED', challengeToken: `mock-temp-${Date.now()}` };
      case 'update':
        throw new ApiError({ status: 403, code: 'UPDATE_REQUIRED', extras: { minAppVersion: '1.1.0' } });
      case 'insecure':
        throw new ApiError({ status: 400, code: 'DEVICE_INSECURE' });
      case 'idle':
        // 로그인 후 몇 초 뒤 서버가 세션을 끊어(유휴 타임아웃) 로그아웃 안내를 확인할 수 있게 한다.
        setAccessToken(MOCK_TOKEN);
        setTimeout(notifyUnauthorized, 6000);
        return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
      case 'blocked':
        throw new ApiError({ status: 400, code: 'UNSUPPORTED_LOGIN_TYPE' });
      case 'offline':
        throw new ApiError({ status: 0, code: 'NETWORK_ERROR' });
      case 'maint': {
        const start = new Date(Date.now() - 30 * 60 * 1000);
        const end = new Date(Date.now() + 90 * 60 * 1000);
        throw new ApiError({
          status: 503,
          code: 'MAINTENANCE',
          extras: { startedAt: start.toISOString(), endsAt: end.toISOString(), retryAfterSeconds: 5400 },
        });
      }
      case 'merchant':
        setAccessToken(MOCK_TOKEN);
        return { status: 'AUTHENTICATED', userType: UserType.Mid, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    const account = ACCOUNTS[id];
    if (!account) throw invalidCredentials();
    assertNotLocked(id);

    // 등록된 기기의 메시지 코드 계정은 코드가 필요 없다(서버가 결정하며 mock은 이를 따른다).
    if (account.loginType === 1 && account.deviceState === 'MATCH' && id !== 'lockotp') {
      setAccessToken(MOCK_TOKEN);
      return { status: 'AUTHENTICATED', userType: account.userType, passwordChangeRequired: false, passwordChangeSkippable: false };
    }

    const challengeToken = `mock-challenge-${Date.now()}-${challenges.size}`;
    challenges.set(challengeToken, { userId: id, account, attempts: 0 });
    // 서버처럼 비어 있지 않은 연락처 컬럼만 채널로 내려준다(더미 마스킹 값).
    const phone: ChallengeOption[] = [
      { method: 'KAKAO', destination: '010-****-0000' },
      { method: 'SMS', destination: '010-****-0000' },
    ];
    const email: ChallengeOption[] = [{ method: 'EMAIL', destination: 'te****@example.com' }];
    const methods: ChallengeOption[] =
      account.loginType === 0
        ? [{ method: 'TOTP' }]
        : id === 'phoneonly'
          ? phone
          : id === 'emailonly'
            ? email
            : id === 'nocontact'
              ? []
              : [...phone, ...email];
    const result: LoginApiResult = {
      status: 'CHALLENGE_REQUIRED',
      loginType: account.loginType,
      deviceState: account.deviceState,
      ...(account.deviceState === 'CHANGED' ? { registeredUserIdMasked: 'mer*****01' } : {}),
      methods,
      ...(id === 'kakao' ? { recentMethod: 'KAKAO' as const } : {}),
      challengeToken,
    };
    return result;
  },

  async sendCode({ challengeToken, channel }) {
    await wait();
    const challenge = challengeOf(challengeToken);
    assertNotLocked(challenge.userId);
    if (challenge.account.loginType === 0 || channel === 'TOTP') throw new ApiError({ status: 400, code: 'OTP_CHANNEL_INVALID' });
    if (challenge.userId === 'nocontact') throw new ApiError({ status: 400, code: 'OTP_CHANNEL_INVALID' });
    const destination = channel === 'EMAIL' ? 'te****@example.com' : '010-****-0000';
    return { expiresInSeconds: EXPIRES_IN_SECONDS, resendAfterSeconds: RESEND_AFTER_SECONDS, destination };
  },

  async verifyCode({ challengeToken, code }) {
    await wait();
    const challenge = challengeOf(challengeToken);
    assertNotLocked(challenge.userId);

    if (code === '999999') throw new ApiError({ status: 401, code: 'OTP_EXPIRED' });
    if (code !== '000000') {
      challenge.attempts += 1;
      const inARow = (wrongInARow.get(challenge.userId) ?? 0) + 1;
      wrongInARow.set(challenge.userId, inARow);
      if (inARow >= MAX_ATTEMPTS) {
        lockedAtOf.set(challenge.userId, new Date().toISOString());
        assertNotLocked(challenge.userId);
      }
      throw new ApiError({
        status: 401,
        code: 'OTP_INVALID',
        extras: { remainingAttempts: MAX_ATTEMPTS - inARow },
      });
    }

    wrongInARow.set(challenge.userId, 0);
    if (challenge.userId === 'suspotp') throw new ApiError({ status: 400, code: 'ACCOUNT_SUSPENDED' });
    if (challenge.userId === 'tempotp') {
      challenges.delete(challengeToken);
      return { status: 'TEMP_PASSWORD_REQUIRED', challengeToken: `mock-temp-${Date.now()}` };
    }
    challenges.delete(challengeToken);
    setAccessToken(MOCK_TOKEN);
    return { status: 'AUTHENTICATED', userType: challenge.account.userType, passwordChangeRequired: false, passwordChangeSkippable: false };
  },
};
